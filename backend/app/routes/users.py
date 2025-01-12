from fastapi import APIRouter, HTTPException
from app.models.user import User, UserInDB, UserInDBResponse
from app.database import get_db
from bson import ObjectId
from typing import List
from app.services.user_service import create_user, login_user

router = APIRouter()

@router.post("/", response_model=UserInDB)
async def create_user(user: User):
    db = get_db()
    user_dict = user.dict()
    result = db.users.insert_one(user_dict)
    user_in_db = user_dict
    user_in_db["id"] = str(result.inserted_id)
    return user_in_db

@router.get("/{user_id}", response_model=UserInDB)
async def get_user(user_id: str):
    user_data = await get_user_by_id(user_id)
    if user_data is None:
        raise HTTPException(status_code=404, detail="User  not found")
    return user_data

@router.get("/", response_model=List[UserInDBResponse])
async def get_all_users_route():
    users = await get_all_users()
    return users

@router.post("/", response_model=UserInDB)
async def sign_up(user: User):
    existing_user = await get_user_by_email(user.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return await create_user(user)

@router.post("/login", response_model=UserInDB)
async def login(email: str, password: str):
    user = await login_user(email, password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return user
