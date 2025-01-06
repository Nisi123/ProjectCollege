from fastapi import APIRouter, HTTPException
from app.models.user import User, UserInDB
from app.database import get_db
from bson import ObjectId
from typing import List

router = APIRouter()

# POST /users/ - Create a new user
@router.post("/", response_model=UserInDB)
async def create_user(user: User):
    db = get_db()
    user_dict = user.dict()
    # Save user to the database
    result = db.users.insert_one(user_dict)
    user_in_db = user_dict
    user_in_db["id"] = str(result.inserted_id)
    return user_in_db

# GET /users/{user_id} - Fetch user by user_id
@router.get("/{user_id}", response_model=UserInDB)
async def get_user(user_id: str):
    db = get_db()
    
    # Fetch user data by user_id
    user_data = db.users.find_one({"_id": ObjectId(user_id)})
    
    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_data["id"] = str(user_data["_id"])

    # Get associated projects for the user by matching username and user_associated
    projects = list(db.projects.find({"user_associated": user_data["username"]}))
    
    
    # If projects are found, add them to user_data, otherwise set "projects" to an empty list
    if projects:
        user_data["projects"] = [{"id": str(project["_id"]), "name": project["name"]} for project in projects]
    else:
        user_data["projects"] = []  # If no projects, set an empty list
    
    # Log the final user data including projects for debugging
    print(f"Returning user data with projects: {user_data}")
    
    return user_data
