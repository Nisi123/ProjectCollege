# app/models/project.py
from pydantic import BaseModel, HttpUrl
from typing import List, Optional
from bson import ObjectId



class Project(BaseModel):
    name: str
    description: str
    time_submitted: Optional[str] = None
    user_associated: str
    reviews: List[str] = []
    like_count: int = 0
    project_pic: Optional[str] = None  # Changed from "No Project Pic"
    project_url: Optional[str] = None  # For external project links
    liked_by: List[str] = []  # Add this field to track who liked the project

    
class ProjectInDB(Project):
    id: str
    
    
    class Config:
        # Make sure the json_encoders block is properly indented
        json_encoders = {
            ObjectId: str  # Convert ObjectId to string during serialization
        }