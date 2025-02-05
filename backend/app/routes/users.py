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
    try:
        db = get_db()
        user = db.users.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Fetch all projects for this user with proper image URLs
        projects = list(db.projects.find({"user_associated": user["username"]}))
        formatted_projects = []
        
        for project in projects:
            project_dict = dict(project)
            project_dict["id"] = str(project_dict["_id"])
            del project_dict["_id"]
            
            # Ensure project_images exists and is a list
            if "project_images" not in project_dict:
                project_dict["project_images"] = []
                
            # Log the project data for debugging
            print(f"Project data: {project_dict}")
            
            formatted_projects.append(project_dict)

        user["id"] = str(user["_id"])
        del user["_id"]
        user["projects"] = formatted_projects

        return UserInDBResponse(**user)
        
    except Exception as e:
        print(f"Error fetching user data: {e}")
        raise HTTPException(status_code=500, detail=str(e))

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
        try:
            # Use the file handler utility for consistent file saving
            file_path = save_upload_file(profile_pic, f"profile_{user_id}")
            update_dict["profile_pic"] = file_path  # Save the relative path
            print(f"Profile picture saved at: {file_path}")
        except Exception as e:
            print(f"Error saving profile picture: {e}")
            raise HTTPException(status_code=500, detail=f"Could not upload file: {e}")

    updated_user = await update_user_profile(user_id, update_dict)
    if not updated_user:
        raise HTTPException(status_code=404, detail="User not found")
    return updated_user

@router.delete("/{user_id}")
async def delete_user(user_id: str):
    """Delete a user and all their projects"""
    db = get_db()
    
    # First check if user exists
    user = db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Delete all projects associated with the user
    db.projects.delete_many({"user_associated": user["username"]})
    
    # Delete the user
    result = db.users.delete_one({"_id": ObjectId(user_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
        
    return {"message": "User and associated projects deleted successfully"}