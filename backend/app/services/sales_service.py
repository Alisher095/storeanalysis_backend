from datetime import datetime

from sqlalchemy.orm import Session

from app.models.sale import Sale


def list_sales(
    db: Session,
    store_id: int | None = None,
    date_start: datetime | None = None,
    date_end: datetime | None = None,
) -> list[Sale]:
    query = db.query(Sale)
    if store_id is not None:
        query = query.filter(Sale.store_id == store_id)
    if date_start is not None:
        query = query.filter(Sale.date >= date_start)
    if date_end is not None:
        query = query.filter(Sale.date <= date_end)
    return query.order_by(Sale.date.desc()).all()


def create_sale(
    db: Session,
    product_id: int,
    store_id: int,
    date: datetime,
    units_sold: int,
    revenue: float,
) -> Sale:
    sale = Sale(
        product_id=product_id,
        store_id=store_id,
        date=date,
        units_sold=units_sold,
        revenue=revenue,
    )
    db.add(sale)
    db.commit()
    db.refresh(sale)
    return sale
