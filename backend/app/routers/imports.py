from fastapi import APIRouter, Depends, File, Form, UploadFile, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.import_job import ImportJob
from app.schemas.import_job import ImportJobRead
from app.services.import_service import enqueue_import

router = APIRouter(prefix="/imports", tags=["imports"])


@router.post("", response_model=ImportJobRead, status_code=201)
def upload_import(
    file: UploadFile = File(...),
    import_type: str = Form(...),
    user_id: int = Form(...),
    db: Session = Depends(get_db),
) -> ImportJobRead:
    job = enqueue_import(db, user_id=user_id, import_type=import_type, file=file)
    return ImportJobRead.model_validate(job)


@router.get("/{import_id}", response_model=ImportJobRead)
def get_import(import_id: int, db: Session = Depends(get_db)) -> ImportJobRead:
    job = db.query(ImportJob).filter(ImportJob.id == import_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Import not found")
    return ImportJobRead.model_validate(job)


@router.get("/{import_id}/errors")
def get_import_errors(import_id: int, db: Session = Depends(get_db)) -> dict:
    job = db.query(ImportJob).filter(ImportJob.id == import_id).first()
    if not job or not job.error_report_path:
        return {"errors": []}
    return {"error_report_path": job.error_report_path}
