from datetime import datetime

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.analytics import HeatmapResponse, SpaceElasticityResponse, TailAnalysisResponse
from app.services.analytics_service import heatmap_analysis, space_elasticity, tail_analysis

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/tail", response_model=TailAnalysisResponse)
def get_tail_analysis(
    store_id: int = Query(...),
    date_start: datetime | None = Query(default=None),
    date_end: datetime | None = Query(default=None),
    category_id: int | None = Query(default=None),
    search: str | None = Query(default=None),
    db: Session = Depends(get_db),
) -> dict:
    return tail_analysis(db, store_id, date_start, date_end, category_id, search)


@router.get("/space", response_model=SpaceElasticityResponse)
def get_space_elasticity(
    store_id: int = Query(...),
    date_start: datetime | None = Query(default=None),
    date_end: datetime | None = Query(default=None),
    db: Session = Depends(get_db),
) -> dict:
    return space_elasticity(db, store_id, date_start, date_end)


@router.get("/heatmap", response_model=HeatmapResponse)
def get_heatmap(
    store_id: int = Query(...),
    date_start: datetime | None = Query(default=None),
    date_end: datetime | None = Query(default=None),
    db: Session = Depends(get_db),
) -> dict:
    return heatmap_analysis(db, store_id, date_start, date_end)
