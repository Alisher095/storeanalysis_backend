from sqlalchemy.orm import Session

from app.models.user import User
from app.core.security import hash_password


def create_user(db: Session, email: str, password: str, full_name: str | None = None) -> User:
    user = User(
        email=email,
        password_hash=hash_password(password),
        full_name=full_name,
        role="analyst",
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
