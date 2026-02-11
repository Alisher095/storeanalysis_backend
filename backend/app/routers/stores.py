from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.store import StoreCreate, StoreRead
from app.services.store_service import create_store, list_stores

router = APIRouter(prefix="/stores", tags=["stores"])


@router.get("", response_model=list[StoreRead])
def get_stores(db: Session = Depends(get_db)) -> list[StoreRead]:
    stores = list_stores(db)
    return [StoreRead.model_validate(store) for store in stores]


@router.post("", response_model=StoreRead, status_code=201)
def add_store(payload: StoreCreate, db: Session = Depends(get_db)) -> StoreRead:
    store = create_store(
        db,
        name=payload.name,
        address=payload.address,
        city=payload.city,
        state=payload.state,
        country=payload.country,
    )
    return StoreRead.model_validate(store)
