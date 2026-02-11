from datetime import datetime
from pydantic import BaseModel, ConfigDict


class ImportJobRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    type: str
    status: str
    original_filename: str | None = None
    total_rows: int | None = None
    processed_rows: int | None = None
    error_count: int | None = None
    error_report_path: str | None = None
    created_at: datetime
