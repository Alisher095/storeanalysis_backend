from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.shelf_space import ShelfSpace
from app.schemas.shelf_space import ShelfSpaceCreate, ShelfSpaceRead

router = APIRouter(prefix="/shelf-space", tags=["shelf-space"])


@router.get("", response_model=list[ShelfSpaceRead])
def get_shelf_space(store_id: int | None = Query(default=None), db: Session = Depends(get_db)) -> list[ShelfSpaceRead]:
    query = db.query(ShelfSpace)
    if store_id is not None:
        query = query.filter(ShelfSpace.store_id == store_id)
    rows = query.all()
    return [ShelfSpaceRead.model_validate(row) for row in rows]


@router.post("", response_model=ShelfSpaceRead, status_code=201)
def add_shelf_space(payload: ShelfSpaceCreate, db: Session = Depends(get_db)) -> ShelfSpaceRead:
    record = ShelfSpace(
        store_id=payload.store_id,
        category_id=payload.category_id,
        current_meters=payload.current_meters,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return ShelfSpaceRead.model_validate(record)
