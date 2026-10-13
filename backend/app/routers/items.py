from fastapi import APIRouter, Depends, HTTPException, Query, status
from prometheus_client import Counter
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import Item
from ..schemas import ItemCreate, ItemIssue, ItemOut, ItemUpdate, StatsOut

router = APIRouter(prefix="/api/items", tags=["items"])

# Custom business metric
UNITS_ISSUED_COUNTER = Counter(
    "units_issued_total", "Total units or seats issued to users across items"
)

@router.get("/stats", response_model=StatsOut)
def get_stats(db: Session = Depends(get_db)):
    # ponytail: declared BEFORE /{id} to prevent path conflict
    items = list(db.scalars(select(Item)))
    total = len(items)
    out_of_stock = sum(1 for i in items if i.quantity == 0)
    low = sum(1 for i in items if 0 < i.quantity <= i.reorder_level)
    in_stock = sum(1 for i in items if i.quantity > i.reorder_level)
    return StatsOut(
        total=total,
        in_stock=in_stock,
        low=low,
        out_of_stock=out_of_stock,
    )

@router.get("", response_model=list[ItemOut])
def list_items(
    status: str | None = Query(default=None),
    category: str | None = Query(default=None),
    db: Session = Depends(get_db),
):
    stmt = select(Item).order_by(Item.id.desc())
    if category:
        stmt = stmt.where(Item.category == category)
    items = list(db.scalars(stmt))
    if status:
        target_status = status.upper()
        items = [i for i in items if i.status == target_status]
    return items

@router.get("/{item_id}", response_model=ItemOut)
def get_item(item_id: int, db: Session = Depends(get_db)):
    item = db.get(Item, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item

@router.post("", response_model=ItemOut, status_code=status.HTTP_201_CREATED)
def create_item(payload: ItemCreate, db: Session = Depends(get_db)):
    # Dual enforcement: Application check
    existing = db.scalar(select(Item).where(Item.sku == payload.sku))
    if existing:
        raise HTTPException(
            status_code=409,
            detail=f"Item with SKU '{payload.sku}' already exists",
        )
    item = Item(**payload.model_dump())
    try:
        db.add(item)
        db.commit()
        db.refresh(item)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail=f"Item with SKU '{payload.sku}' already exists",
        )
    return item

@router.put("/{item_id}", response_model=ItemOut)
def update_item(item_id: int, payload: ItemUpdate, db: Session = Depends(get_db)):
    item = db.get(Item, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    update_data = payload.model_dump(exclude_unset=True)
    if "sku" in update_data and update_data["sku"] != item.sku:
        existing = db.scalar(select(Item).where(Item.sku == update_data["sku"]))
        if existing and existing.id != item_id:
            raise HTTPException(
                status_code=409,
                detail=f"Item with SKU '{update_data['sku']}' already exists",
            )

    for field, value in update_data.items():
        setattr(item, field, value)

    try:
        db.commit()
        db.refresh(item)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Database integrity error on update")
    return item

@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_item(item_id: int, db: Session = Depends(get_db)):
    item = db.get(Item, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(item)
    db.commit()

@router.post("/{item_id}/issue", response_model=ItemOut)
def issue_stock(item_id: int, payload: ItemIssue, db: Session = Depends(get_db)):
    item = db.get(Item, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    # Business rule: stock can never go below zero.
    # Issuing more units than are on hand returns 409 with a clear message.
    if payload.quantity > item.quantity:
        raise HTTPException(
            status_code=409,
            detail=f"Cannot issue {payload.quantity} units: only {item.quantity} available",
        )

    item.quantity -= payload.quantity
    try:
        db.commit()
        db.refresh(item)
        UNITS_ISSUED_COUNTER.inc(payload.quantity)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Stock cannot go below zero (database constraint triggered)",
        )
    return item

