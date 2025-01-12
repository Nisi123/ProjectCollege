# app/models/project.py
from pydantic import BaseModel
from typing import List
from bson import ObjectId



class Project(BaseModel):
    name: str
    description: str
    time_submitted: str
    user_associated: str
    reviews: List[str]
    like_count: int = 0

    
class ProjectInDB(Project):
    id: str
    
    
    class Config:
        # Make sure the json_encoders block is properly indented
        json_encoders = {
            ObjectId: str  # Convert ObjectId to string during serialization
        }