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
    # Convert the string to ObjectId for querying
    user = db["users"].find_one({"_id": ObjectId(user_id)})
    if user is None:
        return None
    return UserInDB(**user)

# Get all users
async def get_all_users() -> list[UserInDB]:
    db = get_db()
    users = db["users"].find()
    return [UserInDB(**user) for user in users]

# Update user profile (for example, change profile pic)
async def update_user_profile(user_id: str, profile_pic: str) -> UserInDB:
    db = get_db()
    # Update the user’s profile pic based on _id
    updated_user = db["users"].find_one_and_update(
        {"_id": ObjectId(user_id)},
        {"$set": {"profile_pic": profile_pic}},
        return_document=True
    )
    if updated_user is None:
        return None
    return UserInDB(**updated_user)
