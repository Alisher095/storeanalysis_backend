from datetime import datetime
from pydantic import BaseModel, ConfigDict


class SaleCreate(BaseModel):
    product_id: int
    store_id: int
    date: datetime
    units_sold: int
    revenue: float


class SaleRead(SaleCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
