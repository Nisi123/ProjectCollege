from fastapi import APIRouter, HTTPException
from app.models.user import User, UserInDB, UserInDBResponse
from app.database import get_db
from bson import ObjectId
from typing import List, Optional
from app.services.user_service import create_user, update_user_profile, login_user, get_all_users, get_user_by_id, get_user_by_email  
from pydantic import BaseModel


router = APIRouter()

@router.post("/", response_model=UserInDB)
async def create_user_route(user: User):
    return await create_user(user)

@router.get("/{user_id}", response_model=UserInDBResponse)
async def get_user(user_id: str):
    user_data = await get_user_by_id(user_id)
    if user_data is None:
        raise HTTPException(status_code=404, detail="User not found")
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

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/login", response_model=UserInDB)
async def login(request: LoginRequest):
    user = await login_user(request.email, request.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return user

@router.get("/email/{email}", response_model=UserInDBResponse)
async def get_user_by_email_route(email: str):
    """
    Fetch a user by their email address.
    """
    user = await get_user_by_email(email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


class ProfileUpdateRequest(BaseModel):
    description: Optional[str] = None
    position: Optional[str] = None
    year_of_birth: Optional[int] = None
    level: Optional[str] = None

@router.put("/complete-profile/{user_id}", response_model=UserInDBResponse)
async def complete_profile(user_id: str, update_data: ProfileUpdateRequest):
    # Exclude unset fields to allow partial updates
    update_dict = update_data.dict(exclude_unset=True)
    updated_user = await update_user_profile(user_id, update_dict)
    if not updated_user:
        raise HTTPException(status_code=404, detail="User not found")
    return updated_user