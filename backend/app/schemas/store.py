from pydantic import BaseModel, ConfigDict


class StoreCreate(BaseModel):
    name: str
    address: str | None = None
    city: str | None = None
    state: str | None = None
    country: str | None = None


class StoreRead(StoreCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
