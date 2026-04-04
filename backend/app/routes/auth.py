from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.dependencies import get_current_user, get_db
from app.models.schemas import AuthResponse, LoginRequest, RegisterRequest, UserResponse
from app.utils.helpers import now_utc, serialize_user
from app.utils.security import create_access_token, hash_password, verify_password


router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def register_user(
    payload: RegisterRequest,
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> dict:
    name = payload.name.strip()
    email = payload.email.strip().lower()
    if len(name) < 2:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Enter a valid name")
    if "@" not in email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Enter a valid email")

    existing_user = await db.users.find_one({"email": email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        )

    user = {
        "name": name,
        "email": email,
        "password_hash": hash_password(payload.password),
        "created_at": now_utc(),
    }
    result = await db.users.insert_one(user)
    created_user = await db.users.find_one({"_id": result.inserted_id})
    token = create_access_token(str(result.inserted_id), email)

    return {
        "token": token,
        "user": serialize_user(created_user),
    }


@router.post("/login", response_model=AuthResponse)
async def login_user(
    payload: LoginRequest,
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> dict:
    email = payload.email.strip().lower()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    token = create_access_token(str(user["_id"]), user["email"])
    return {
        "token": token,
        "user": serialize_user(user),
    }


@router.get("/verify", response_model=UserResponse)
async def verify_token(current_user: dict = Depends(get_current_user)) -> dict:
    return serialize_user(current_user)
