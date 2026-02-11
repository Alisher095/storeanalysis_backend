from sqlalchemy.orm import Session

from app.models.store import Store


def list_stores(db: Session) -> list[Store]:
    return db.query(Store).order_by(Store.name.asc()).all()


def create_store(
    db: Session,
    name: str,
    address: str | None = None,
    city: str | None = None,
    state: str | None = None,
    country: str | None = None,
) -> Store:
    store = Store(
        name=name,
        address=address,
        city=city,
        state=state,
        country=country,
    )
    db.add(store)
    db.commit()
    db.refresh(store)
    return store
