from datetime import datetime

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.sale import SaleCreate, SaleRead
from app.services.sales_service import create_sale, list_sales

router = APIRouter(prefix="/sales", tags=["sales"])


@router.get("", response_model=list[SaleRead])
def get_sales(
    store_id: int | None = Query(default=None),
    date_start: datetime | None = Query(default=None),
    date_end: datetime | None = Query(default=None),
    db: Session = Depends(get_db),
) -> list[SaleRead]:
    sales = list_sales(db, store_id=store_id, date_start=date_start, date_end=date_end)
    return [SaleRead.model_validate(sale) for sale in sales]


@router.post("", response_model=SaleRead, status_code=201)
def add_sale(payload: SaleCreate, db: Session = Depends(get_db)) -> SaleRead:
    sale = create_sale(
        db,
        product_id=payload.product_id,
        store_id=payload.store_id,
        date=payload.date,
        units_sold=payload.units_sold,
        revenue=payload.revenue,
    )
    return SaleRead.model_validate(sale)
