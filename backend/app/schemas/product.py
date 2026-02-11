from pydantic import BaseModel, ConfigDict


class ProductCreate(BaseModel):
    sku: str
    name: str
    category_id: int
    price: float | None = None
    shelf_space_meters: float | None = None
    store_id: int


class ProductRead(ProductCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
