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
    user = db.users.find_one({"email": payload.email})
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    return LoginResponse(
        access_token=create_access_token(str(user["_id"])),
        user=UserResponse(id=str(user["_id"]), email=user["email"], name=user["name"]),
    )


@router.post("/register", response_model=LoginResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest):
    email = payload.email.lower()
    existing_user = db.users.find_one({"email": email})
    if existing_user:
        raise HTTPException(status_code=409, detail="An account with this email already exists")

    user = {
        "email": email,
        "name": payload.name.strip(),
        "password_hash": hash_password(payload.password),
    }
    result = db.users.insert_one(user)

    return LoginResponse(
        access_token=create_access_token(str(result.inserted_id)),
        user=UserResponse(id=str(result.inserted_id), email=email, name=user["name"]),
    )
