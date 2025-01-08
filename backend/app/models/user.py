from pydantic import BaseModel
from typing import List, Optional
from bson import ObjectId

class User(BaseModel):
    username: str
    email: str
    password: str
    profile_pic: Optional[str] = "no profile pic"  # Default profile pic

class Project(BaseModel):
    id: str
    name: str

class UserInDB(User):
    id: str  # MongoDB _id as 'id'
    projects: Optional[List[Project]] = []  # Optional field for associated projects
# Note: 'projects' is an Optional field with a default empty list.

class UserInDBResponse(BaseModel):
    id: str
    username: str
    email: str
    profile_pic: Optional[str]
    projects: Optional[List[Project]] = []

    class Config:
        orm_mode = True
        json_encoders = {
            ObjectId: str
        }