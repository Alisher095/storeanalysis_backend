from pydantic import BaseModel, ConfigDict


class ShelfSpaceCreate(BaseModel):
    store_id: int
    category_id: int
    current_meters: float


class ShelfSpaceRead(ShelfSpaceCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
