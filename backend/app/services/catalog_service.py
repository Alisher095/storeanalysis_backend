from sqlalchemy.orm import Session

from app.models.category import Category
from app.models.product import Product


def list_categories(db: Session) -> list[Category]:
    return db.query(Category).order_by(Category.name.asc()).all()


def create_category(db: Session, name: str, description: str | None = None) -> Category:
    category = Category(name=name, description=description)
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


def list_products(db: Session, store_id: int | None = None) -> list[Product]:
    query = db.query(Product)
    if store_id is not None:
        query = query.filter(Product.store_id == store_id)
    return query.order_by(Product.name.asc()).all()


def create_product(
    db: Session,
    sku: str,
    name: str,
    category_id: int,
    price: float | None,
    shelf_space_meters: float | None,
    store_id: int,
) -> Product:
    product = Product(
        sku=sku,
        name=name,
        category_id=category_id,
        price=price,
        shelf_space_meters=shelf_space_meters,
        store_id=store_id,
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return product
