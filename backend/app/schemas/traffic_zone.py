from pydantic import BaseModel, ConfigDict


class TrafficZoneCreate(BaseModel):
    store_id: int
    zone_name: str
    x: int
    y: int
    traffic_score: float


class TrafficZoneRead(TrafficZoneCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
