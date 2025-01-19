# app/services/user_service.py
from bson import ObjectId
from app.database import get_db
from app.models.user import UserInDB, User, UserInDBResponse
from pydantic import BaseModel
from passlib.context import CryptContext
from typing import Optional
from time import time

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def create_user(user: User) -> UserInDB:
    db = get_db()
    user_dict = user.dict()

    # Hash the password before saving
    hashed_password = hash_password(user.password)
    user_dict['password'] = hashed_password

    # Insert the user into the database
    result = db["users"].insert_one(user_dict)
    created_user = db["users"].find_one({"_id": result.inserted_id})

    # Convert _id to string and add it as the 'id' field in the response
    created_user["id"] = str(created_user["_id"])
    del created_user["_id"]

    return UserInDB(**created_user)

def hash_password(password: str) -> str:
    hashed = pwd_context.hash(password)
    print(f"Hashing password: {password} -> {hashed}")
    return hashed

def verify_password(plain_password: str, hashed_password: str) -> bool:
    print(f"Verifying {plain_password} against {hashed_password}")
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception as e:
        print(f"Password verification error: {e}")
        return False

async def get_user_by_email(email: str) -> Optional[UserInDB]:
    db = get_db()
    user = db["users"].find_one({"email": email})
    print(f"get_user_by_email - Fetched user: {user}")

    if not user:
        print("User not found")
        return None

    user["id"] = str(user["_id"])
    projects = list(db["projects"].find({"user_associated": user["username"]}))
    
    # Update project data format
    user["projects"] = []
    timestamp = int(time())
    for project in projects:
        project_data = {
            "id": str(project["_id"]),
            "name": project["name"],
            "description": project.get("description", ""),
            "project_pic": None,
            "project_url": project.get("project_url"),
            "like_count": project.get("like_count", 0),
        }
        
        project_pic = project.get("project_pic")
        if not project_pic:
            project_data["project_pic"] = f"http://localhost:8000/uploads/default-project-pic.png?t={timestamp}"
        else:
            base_url = project_pic.split('?')[0]
            if not base_url.startswith(("http://", "https://")):
                base_url = f"http://localhost:8000/{base_url}"
            project_data["project_pic"] = f"{base_url}?t={timestamp}"
            
        user["projects"].append(project_data)
        
    return UserInDB(**user)

async def login_user(email: str, password: str) -> Optional[UserInDB]:
    user = await get_user_by_email(email)
    if user:
        print(f"User found for email {email}: {user}")
        if verify_password(password, user.password):
            print("Login successful")
            return user
        else:
            print("Password verification failed")
    else:
        print("User not found or email mismatch")
    return None

async def get_user_by_id(user_id: str) -> Optional[UserInDB]:
    db = get_db()
    user = db["users"].find_one({"_id": ObjectId(user_id)})
    
    if user is None:
        return None

    timestamp = int(time())
        
    # Handle profile picture path with proper URL formatting
    if not user.get("profile_pic") or user["profile_pic"] == "No Profile Pic":
        user["profile_pic"] = f"http://localhost:8000/uploads/default-profile-pic.png?t={timestamp}"
    else:
        profile_pic = user["profile_pic"]
        if not profile_pic.startswith(("http://", "https://")):
            user["profile_pic"] = f"http://localhost:8000/{profile_pic}?t={timestamp}"

    user["id"] = str(user["_id"])
    projects = list(db["projects"].find({"user_associated": user["username"]}))
    timestamp = int(time())
    
    # Format project data with proper image URLs
    user["projects"] = []
    for project in projects:
        project_data = {
            "id": str(project["_id"]),
            "name": project["name"],
            "description": project.get("description", ""),
            "like_count": project.get("like_count", 0),
            "project_url": project.get("project_url"),
            "project_pic": None,  # Initialize project_pic
            "reviews": project.get("reviews", [])  # Add reviews to project data
        }
        
        # Add debug logging
        print(f"Processing project: {project}")
        
        project_pic = project.get("project_pic")
        if not project_pic:
            project_data["project_pic"] = f"http://localhost:8000/uploads/default-project-pic.png?t={timestamp}"
        else:
            base_url = project_pic.split('?')[0]
            if not base_url.startswith(("http://", "https://")):
                base_url = f"http://localhost:8000/{base_url}"
            project_data["project_pic"] = f"{base_url}?t={timestamp}"
            
        # Add debug logging
        print(f"Processed project data: {project_data}")
        user["projects"].append(project_data)
    
    return UserInDB(**user)

async def get_all_users() -> list[UserInDB]:
    db = get_db()
    users = db["users"].find()
    user_list = []
    
    for user in users:
        user["id"] = str(user["_id"])
        print(f"Fetching projects for user: {user['username']}")
        
        projects = list(db["projects"].find({"user_associated": user["username"]}))
        print(f"Found projects: {projects}")
        
        user["projects"] = [{"id": str(project["_id"]), "name": project["name"]} for project in projects]
        user_list.append(UserInDB(**user))
    
    return user_list

async def update_user_profile(user_id: str, update_data: dict):
    db = get_db()
    user = db["users"].find_one({"_id": ObjectId(user_id)})

    if not user:
        return None

    # If there's a profile_pic in update_data, make sure it starts with 'uploads/'
    if "profile_pic" in update_data and not update_data["profile_pic"].startswith("uploads/"):
        update_data["profile_pic"] = f"uploads/{update_data['profile_pic']}"

    db["users"].update_one({"_id": ObjectId(user_id)}, {"$set": update_data})
    updated_user = db["users"].find_one({"_id": ObjectId(user_id)})
    updated_user["id"] = str(updated_user["_id"])
    del updated_user["_id"]

    return updated_user

