from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.product import ProductCreate, ProductRead
from app.services.catalog_service import create_product, list_products

router = APIRouter(prefix="/products", tags=["products"])


@router.get("", response_model=list[ProductRead])
def get_products(store_id: int | None = Query(default=None), db: Session = Depends(get_db)) -> list[ProductRead]:
    products = list_products(db, store_id=store_id)
    return [ProductRead.model_validate(product) for product in products]


@router.post("", response_model=ProductRead, status_code=201)
def add_product(payload: ProductCreate, db: Session = Depends(get_db)) -> ProductRead:
    product = create_product(
        db,
        sku=payload.sku,
        name=payload.name,
        category_id=payload.category_id,
        price=payload.price,
        shelf_space_meters=payload.shelf_space_meters,
        store_id=payload.store_id,
    )
    return ProductRead.model_validate(product)
