"""add_meridian_to_model_type_enum

Revision ID: 0d848faf2220
Revises: c7cb3979e2e6
Create Date: 2025-09-04 17:08:23.329860

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0d848faf2220'
down_revision = 'c7cb3979e2e6'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("ALTER TYPE modeltype ADD VALUE 'meridian'")


def downgrade() -> None:
    pass
