from sqlalchemy.orm import Session

from app.core.security import create_access_token, create_refresh_token, hash_password, verify_password
from app.models.user import User


def get_user_by_email(db: Session, email: str) -> User | None:
    return db.query(User).filter(User.email == email).first()


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


def authenticate_user(db: Session, email: str, password: str) -> User | None:
    user = get_user_by_email(db, email)
    if not user:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user


def issue_tokens(user: User) -> dict:
    access_token = create_access_token(str(user.id))
    refresh_token = create_refresh_token(str(user.id))
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }


def has_users(db: Session) -> bool:
    return db.query(User).count() > 0


def create_admin_user(db: Session, email: str, password: str, full_name: str | None = None) -> User:
    user = User(
        email=email,
        password_hash=hash_password(password),
        full_name=full_name,
        role="admin",
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
