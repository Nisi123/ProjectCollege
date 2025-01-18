from pydantic import BaseModel, validator
from typing import List, Optional
from bson import ObjectId

class User(BaseModel):
    username: str
    email: str
    password: str
    profile_pic: Optional[str] = "No Profile Pic"
    description: Optional[str] = "No Description"
    position: Optional[str] = "User Position"  # New field
    year_of_birth: Optional[int] = 0 # New field
    level: Optional[str] = "No Level"  # New field

class Project(BaseModel):
    id: str
    name: str
    description: Optional[str] = ""
    like_count: int = 0
    project_pic: Optional[str] = None  # Add this field
    project_url: Optional[str] = None  # Add this field too

class UserInDB(User):
    id: str
    projects: Optional[List[Project]] = []

class UserInDBResponse(BaseModel):
    id: str
    username: str
    email: str
    profile_pic: Optional[str]
    projects: Optional[List[Project]] = []
    description: Optional[str]
    position: Optional[str]
    year_of_birth: Optional[int]
    level: Optional[str]


    class Config:
        orm_mode = True
        json_encoders = {
            ObjectId: str
        }