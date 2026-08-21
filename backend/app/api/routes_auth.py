import logging

from fastapi import APIRouter, HTTPException, status
from pymongo.errors import PyMongoError

from app.db.mongo import db
from app.schemas.auth import LoginRequest, LoginResponse, RegisterRequest, UserResponse
from app.utils.security import create_access_token, hash_password, verify_password

router = APIRouter(prefix="/api/auth", tags=["auth"])
logger = logging.getLogger(__name__)


@router.on_event("startup")
def ensure_admin_seed():
    try:
        if db.users.find_one({"email": "admin@example.com"}):
            return
        db.users.insert_one(
            {
                "email": "admin@example.com",
                "name": "Portal Admin",
                "password_hash": hash_password("admin123"),
            }
        )
    except PyMongoError as error:
        logger.warning("Skipping admin seed during startup: %s", error)


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest):
    try:
        user = db.users.find_one({"email": payload.email.lower()})
    except PyMongoError as error:
        logger.exception("Database error during login")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database unavailable",
        ) from error

    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    return LoginResponse(
        detail="Login successful",
        access_token=create_access_token(str(user["_id"])),
        user=UserResponse(id=str(user["_id"]), email=user["email"], name=user["name"]),
    )


@router.post("/register", response_model=LoginResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest):
    email = payload.email.lower()
    name = payload.name.strip()
    if not name:
        raise HTTPException(status_code=422, detail="Name is required")

    try:
        existing_user = db.users.find_one({"email": email})
        if existing_user:
            raise HTTPException(
                status_code=409,
                detail="An account with this email already exists",
            )

        user = {
            "email": email,
            "name": name,
            "password_hash": hash_password(payload.password),
        }
        result = db.users.insert_one(user)
    except HTTPException:
        raise
    except PyMongoError as error:
        logger.exception("Database error during registration")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database unavailable",
        ) from error

    return LoginResponse(
        detail="Registration successful",
        access_token=create_access_token(str(result.inserted_id)),
        user=UserResponse(id=str(result.inserted_id), email=email, name=name),
    )
