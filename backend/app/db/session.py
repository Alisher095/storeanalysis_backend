from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import get_settings

settings = get_settings()


def normalize_database_url(raw_url: str) -> str:
    if raw_url.startswith("sqlite:///./"):
        repo_root = Path(__file__).resolve().parents[4]
        relative_path = raw_url.replace("sqlite:///./", "")
        absolute_path = (repo_root / relative_path).resolve()
        absolute_path.parent.mkdir(parents=True, exist_ok=True)
        return f"sqlite:///{absolute_path.as_posix()}"
    return raw_url


database_url = normalize_database_url(settings.database_url)

connect_args = {}
if database_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(database_url, connect_args=connect_args, future=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, future=True)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
