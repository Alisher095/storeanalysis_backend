from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.traffic_zone import TrafficZone
from app.schemas.traffic_zone import TrafficZoneCreate, TrafficZoneRead

router = APIRouter(prefix="/traffic", tags=["traffic"])


@router.get("", response_model=list[TrafficZoneRead])
def get_traffic_zones(store_id: int | None = Query(default=None), db: Session = Depends(get_db)) -> list[TrafficZoneRead]:
    query = db.query(TrafficZone)
    if store_id is not None:
        query = query.filter(TrafficZone.store_id == store_id)
    zones = query.all()
    return [TrafficZoneRead.model_validate(zone) for zone in zones]


@router.post("", response_model=TrafficZoneRead, status_code=201)
def add_traffic_zone(payload: TrafficZoneCreate, db: Session = Depends(get_db)) -> TrafficZoneRead:
    zone = TrafficZone(
        store_id=payload.store_id,
        zone_name=payload.zone_name,
        x=payload.x,
        y=payload.y,
        traffic_score=payload.traffic_score,
    )
    db.add(zone)
    db.commit()
    db.refresh(zone)
    return TrafficZoneRead.model_validate(zone)
