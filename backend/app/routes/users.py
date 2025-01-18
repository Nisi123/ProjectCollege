from fastapi import APIRouter, HTTPException, File, UploadFile, Form
from app.models.user import User, UserInDB, UserInDBResponse
from app.database import get_db
from bson import ObjectId
from typing import List, Optional
from app.services.user_service import create_user, update_user_profile, login_user, get_all_users, get_user_by_id, get_user_by_email  
from pydantic import BaseModel
from datetime import datetime

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
    profile_pic: Optional[UploadFile] = None

@router.put("/complete-profile/{user_id}", response_model=UserInDBResponse)
async def complete_profile(
    user_id: str, 
    description: Optional[str] = Form(None),
    position: Optional[str] = Form(None),
    year_of_birth: Optional[int] = Form(None),
    level: Optional[str] = Form(None),
    profile_pic: Optional[UploadFile] = File(None)
):
    update_dict = {}
    if description is not None:
        update_dict["description"] = description
    if position is not None:
        update_dict["position"] = position
    if year_of_birth is not None:
        update_dict["year_of_birth"] = year_of_birth
    if level is not None:
        update_dict["level"] = level
    
    if profile_pic:
        timestamp = int(datetime.now().timestamp())
        safe_filename = f"profile_{timestamp}_{profile_pic.filename.replace(' ', '_')}"
        file_location = f"uploads/{safe_filename}"
        try:
            with open(file_location, "wb+") as file_object:
                content = await profile_pic.read()
                file_object.write(content)
            update_dict["profile_pic"] = file_location
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Could not upload file: {e}")

    updated_user = await update_user_profile(user_id, update_dict)
    if not updated_user:
        raise HTTPException(status_code=404, detail="User not found")
    return updated_user