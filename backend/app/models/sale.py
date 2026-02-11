from datetime import datetime

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer

from app.db.base import Base


class Sale(Base):
    __tablename__ = "sales"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    store_id = Column(Integer, ForeignKey("stores.id"), nullable=False)
    date = Column(DateTime, nullable=False)
    units_sold = Column(Integer, nullable=False)
    revenue = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
