import os
from datetime import datetime

from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.models.import_job import ImportJob


def enqueue_import(db: Session, user_id: int, import_type: str, file: UploadFile) -> ImportJob:
    os.makedirs("backend/data/imports", exist_ok=True)
    timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
    safe_name = f"{timestamp}_{file.filename}"
    file_path = os.path.join("backend/data/imports", safe_name)

    with open(file_path, "wb") as output:
        output.write(file.file.read())

    job = ImportJob(
        user_id=user_id,
        type=import_type,
        status="queued",
        original_filename=file.filename,
        total_rows=None,
        processed_rows=None,
        error_count=None,
        error_report_path=None,
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    return job
