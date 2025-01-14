# app/services/user_service.py
from bson import ObjectId
from app.database import get_db
from app.models.user import UserInDB, User
from pydantic import BaseModel
from passlib.context import CryptContext
from typing import Optional

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
    if user:
        user["id"] = str(user["_id"])  # Add the id field
        print(f"User fetched: {user}")  # Debugging line
        return UserInDB(**user)
    print("User not found")
    return None

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
    user["id"] = str(user["_id"])
    projects = list(db["projects"].find({"user_associated": user["username"]}))
    user["projects"] = [{"id": str(project["_id"]), "name": project["name"]} for project in projects]
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
