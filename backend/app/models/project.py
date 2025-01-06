# app/models/project.py

from pydantic import BaseModel
from typing import List

class Project(BaseModel):
    name: str
    description: str
    time_submitted: str
    user_associated: str  # Username of the user associated with the project
    reviews: List[str]

class ProjectInDB(Project):
    id: str  # This will be used for the MongoDB _id field