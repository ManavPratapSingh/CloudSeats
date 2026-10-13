from datetime import datetime
from typing import Literal
from pydantic import BaseModel, ConfigDict, Field

StatusLiteral = Literal["OUT_OF_STOCK", "LOW", "IN_STOCK"]

class ItemBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    sku: str = Field(..., min_length=1, max_length=100)
    category: str = Field(default="General", max_length=100)
    quantity: int = Field(default=0, ge=0)
    reorder_level: int = Field(default=10, ge=0)
    location: str = Field(default="Global", max_length=100)

class ItemCreate(ItemBase):
    pass

class ItemUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=200)
    sku: str | None = Field(default=None, min_length=1, max_length=100)
    category: str | None = Field(default=None, max_length=100)
    quantity: int | None = Field(default=None, ge=0)
    reorder_level: int | None = Field(default=None, ge=0)
    location: str | None = Field(default=None, max_length=100)

class ItemIssue(BaseModel):
    quantity: int = Field(..., gt=0, description="Quantity of units/seats to issue")

class ItemOut(ItemBase):
    id: int
    status: StatusLiteral
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class StatsOut(BaseModel):
    total: int
    in_stock: int
    low: int
    out_of_stock: int
