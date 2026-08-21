from datetime import datetime, timedelta, timezone

from jose import JWTError, ExpiredSignatureError, jwt
from passlib.context import CryptContext

from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(subject: str) -> str:
    expires = datetime.now(timezone.utc) + timedelta(
        minutes=settings.access_token_expire_minutes
    )
    payload = {"sub": subject, "exp": expires}
    return jwt.encode(payload, settings.jwt_secret, algorithm="HS256")


def create_form_submission_token(form_id: str, expires_at: datetime | None = None) -> str:
    payload = {"sub": form_id, "type": "form_submission"}
    if expires_at is not None:
        payload["exp"] = expires_at
    return jwt.encode(payload, settings.jwt_secret, algorithm="HS256")


def decode_form_submission_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=["HS256"])
    except ExpiredSignatureError as error:
        raise ValueError("Form expired") from error
    except JWTError as error:
        raise ValueError("Invalid submission token") from error

    if payload.get("type") != "form_submission" or not payload.get("sub"):
        raise ValueError("Invalid submission token")

    return payload
