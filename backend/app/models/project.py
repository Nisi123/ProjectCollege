# app/models/project.py
from pydantic import BaseModel, HttpUrl, validator
from typing import List, Optional
from bson import ObjectId
from datetime import datetime

class Project(BaseModel):
    name: str
    description: str
    time_submitted: str
    user_associated: str
    reviews: List[str] = []
    like_count: int = 0
    project_pic: Optional[str] = None  
    project_url: Optional[str] = None  
    liked_by: List[str] = []

    @validator('time_submitted')
    def validate_time(cls, v):
        try:
            datetime.fromisoformat(v.replace('Z', '+00:00'))
            return v
        except ValueError:
            raise ValueError('Invalid ISO format for time_submitted')

class ProjectInDB(Project):
    id: str

    class Config:
        json_encoders = {
            ObjectId: str  # Convert ObjectId to string during serialization
        }