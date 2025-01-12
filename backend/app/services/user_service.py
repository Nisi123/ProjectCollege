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
    user_dict['password'] = hash_password(user.password)  # Hash the password before storing
    result = db["users"].insert_one(user_dict)
    created_user = db["users"].find_one({"_id": result.inserted_id})
    return UserInDB(**created_user)

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

async def get_user_by_email(email: str) -> Optional[UserInDB]:
    db = get_db()
    user = db["users"].find_one({"email": email})
    if user:
        user["id"] = str(user["_id"])  # Add the id field
        return UserInDB(**user)
    return None

async def login_user(email: str, password: str) -> Optional[UserInDB]:
    user = await get_user_by_email(email)
    if user and verify_password(password, user.password):
        return user
    return None

async def get_user_by_id(user_id: str) -> UserInDB:
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

