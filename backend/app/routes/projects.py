from fastapi import APIRouter, HTTPException
from app.models.project import Project, ProjectInDB
from app.database import get_db
from bson import ObjectId
from typing import List

router = APIRouter()

@router.post("/", response_model=ProjectInDB)
async def create_project(project: Project):
    db = get_db()

    # Check if the user exists
    user = db.users.find_one({"username": project.user_associated})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Create project object and insert it into the database
    project_dict = project.dict()
    project_dict["like_count"] = 0  # Ensure like_count is initialized to 0
    
    result = db.projects.insert_one(project_dict)
    
    project_in_db = ProjectInDB(**project_dict, id=str(result.inserted_id))
    
    return project_in_db

@router.get("/{project_id}", response_model=ProjectInDB)
async def get_project(project_id: str):
    db = get_db()

    # Fetch the project by its ObjectId
    project_data = db.projects.find_one({"_id": ObjectId(project_id)})

    if not project_data:
        raise HTTPException(status_code=404, detail="Project not found")
    
    project_data["id"] = str(project_data["_id"])  # Map MongoDB _id to 'id'
    return ProjectInDB(**project_data)

@router.get("/", response_model=dict)
async def get_all_projects(skip: int = 0, limit: int = 20, sort: str = "like_count"):
    db = get_db()

    # Ensure skip and limit are valid integers and set default values if not
    skip = max(skip, 0)
    limit = max(limit, 1)

    # Determine sorting based on the provided parameter (like_count)
    if sort == "like_count":
        sort_field = [("like_count", -1)]  # Sort by like_count descending

    # Fetch projects with pagination and sorting
    projects_cursor = db.projects.find().skip(skip).limit(limit).sort(sort_field)
    projects_list = [ProjectInDB(**project, id=str(project["_id"])) for project in projects_cursor]

    # Calculate the total number of projects
    total_projects = db.projects.count_documents({})

    # Calculate total pages
    total_pages = (total_projects + limit - 1) // limit  # This rounds up the total pages

    return {
        "projects": projects_list,
        "totalPages": total_pages,  # Include totalPages in the response
        "totalProjects": total_projects  # Include total number of projects
    }
      
@router.post("/{project_id}/like", response_model=ProjectInDB)
async def like_project(project_id: str):
    db = get_db()

    # Find the project by ID
    project_data = db.projects.find_one({"_id": ObjectId(project_id)})

    if not project_data:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Increment the like_count
    new_like_count = project_data.get("like_count", 0) + 1
    db.projects.update_one({"_id": ObjectId(project_id)}, {"$set": {"like_count": new_like_count}})

    # Fetch the updated project data
    updated_project = db.projects.find_one({"_id": ObjectId(project_id)})
    updated_project["id"] = str(updated_project["_id"])

    return ProjectInDB(**updated_project)

@router.get("/top", response_model=List[ProjectInDB])
async def get_top_projects():
    db = get_db()

    # Fetch top 3 most liked projects from MongoDB
    top_projects = db.projects.find().sort("like_count", -1).limit(3)
    
    # Convert MongoDB cursor to list of dicts
    top_projects_list = [
        ProjectInDB(**project, id=str(project["_id"])) for project in top_projects
    ]

    return top_projects_list