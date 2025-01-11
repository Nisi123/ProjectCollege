# app/models/project.py

from pydantic import BaseModel
from typing import List

class Project(BaseModel):
    name: str
    description: str
    time_submitted: str
    user_associated: str
    reviews: List[str]

class ProjectInDB(Project):
    id: str