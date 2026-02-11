from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.category import CategoryCreate, CategoryRead
from app.services.catalog_service import create_category, list_categories

router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("", response_model=list[CategoryRead])
def get_categories(db: Session = Depends(get_db)) -> list[CategoryRead]:
    categories = list_categories(db)
    return [CategoryRead.model_validate(category) for category in categories]


@router.post("", response_model=CategoryRead, status_code=status.HTTP_201_CREATED)
def add_category(payload: CategoryCreate, db: Session = Depends(get_db)) -> CategoryRead:
    category = create_category(db, payload.name, payload.description)
    return CategoryRead.model_validate(category)
