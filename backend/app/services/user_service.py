# app/services/user_service.py
from bson import ObjectId
from app.database import get_db
from app.models.user import UserInDB, User
from pydantic import BaseModel

# Create a new user
async def create_user(user: User) -> UserInDB:
    db = get_db()
    user_dict = user.dict()
    # Insert the user data into the database and return the inserted data with _id
    result = db["users"].insert_one(user_dict)
    # Fetch the newly created user by _id
    created_user = db["users"].find_one({"_id": result.inserted_id})
    return UserInDB(**created_user)

# Get a user by their MongoDB _id
async def get_user_by_id(user_id: str) -> UserInDB:
    db = get_db()
    user = db["users"].find_one({"_id": ObjectId(user_id)})
    if user is None:
        return None
    return UserInDB(**user)
