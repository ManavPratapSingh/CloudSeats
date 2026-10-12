"""create items table

Revision ID: 0001_create_items
Revises: None
Create Date: 2026-10-16 20:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = "0001_create_items"
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    op.create_table(
        "items",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.Column("sku", sa.String(length=100), nullable=False),
        sa.Column("category", sa.String(length=100), nullable=False, server_default="General"),
        sa.Column("quantity", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("reorder_level", sa.Integer(), nullable=False, server_default="10"),
        sa.Column("location", sa.String(length=100), nullable=False, server_default="Global"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.CheckConstraint("quantity >= 0", name="ck_items_quantity_non_negative"),
    )
    op.create_index("ix_items_sku", "items", ["sku"], unique=True)

def downgrade():
    op.drop_index("ix_items_sku", table_name="items")
    op.drop_table("items")

