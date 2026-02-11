from datetime import datetime

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String

from app.db.base import Base


class TrafficZone(Base):
    __tablename__ = "traffic_zones"

    id = Column(Integer, primary_key=True, index=True)
    store_id = Column(Integer, ForeignKey("stores.id"), nullable=False)
    zone_name = Column(String(50), nullable=False)
    x = Column(Integer, nullable=False)
    y = Column(Integer, nullable=False)
    traffic_score = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
