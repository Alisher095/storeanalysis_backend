from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String

from app.db.base import Base


class ImportJob(Base):
    __tablename__ = "imports"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    type = Column(String(50), nullable=False)
    status = Column(String(50), nullable=False, default="queued")
    original_filename = Column(String(255), nullable=True)
    total_rows = Column(Integer, nullable=True)
    processed_rows = Column(Integer, nullable=True)
    error_count = Column(Integer, nullable=True)
    error_report_path = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
