# app/routes/projects.py

from fastapi import APIRouter, HTTPException
from app.models.project import Project, ProjectInDB
from app.database import get_db
from bson import ObjectId

router = APIRouter()

# POST /projects/ - Create a new project
@router.post("/", response_model=ProjectInDB)
async def create_project(project: Project):
    db = get_db()
    
    # Check if the user exists
    user = db.users.find_one({"username": project.user_associated})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    project_dict = project.dict()
    
    result = db.projects.insert_one(project_dict)
    
    project_in_db = project_dict
    project_in_db["id"] = str(result.inserted_id)
    
    return project_in_db

# GET /projects/ - Get all projects
@router.get("/", response_model=list[ProjectInDB])
async def get_all_projects():
    db = get_db()
    
    projects = db.projects.find()
    
    return [{"id": str(project["_id"]), **project} for project in projects]

# GET /projects/{project_id} - Get a specific project by ID
@router.get("/{project_id}", response_model=ProjectInDB)
async def get_project(project_id: str):
    db = get_db()
    
    # Fetch the project by its ObjectId
    project_data = db.projects.find_one({"_id": ObjectId(project_id)})
    
    if not project_data:
        raise HTTPException(status_code=404, detail="Project not found")
    
    project_data["id"] = str(project_data["_id"])  # Map MongoDB _id to 'id'
    
    return project_data