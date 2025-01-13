from pydantic import BaseModel, validator
from typing import List, Optional
from bson import ObjectId

class User(BaseModel):
    username: str
    email: str
    password: str
    profile_pic: Optional[str] = "no profile pic"

class Project(BaseModel):
    id: str
    name: str

class UserInDB(User):
    id: str
    projects: Optional[List[Project]] = []

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