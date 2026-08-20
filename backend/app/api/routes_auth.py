from fastapi import APIRouter, HTTPException

from app.db.mongo import db
from app.schemas.auth import LoginRequest, LoginResponse, UserResponse
from app.utils.security import create_access_token, hash_password, verify_password

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.on_event("startup")
def ensure_admin_seed():
    if db.users.find_one({"email": "admin@example.com"}):
        return
    db.users.insert_one(
        {
            "email": "admin@example.com",
            "name": "Portal Admin",
            "password_hash": hash_password("admin123"),
        }
    )


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest):
    user = db.users.find_one({"email": payload.email})
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    return LoginResponse(
        access_token=create_access_token(str(user["_id"])),
        user=UserResponse(id=str(user["_id"]), email=user["email"], name=user["name"]),
    )
