from fastapi import APIRouter, HTTPException, File, UploadFile, Form
from app.models.project import Project, ProjectInDB
from app.database import get_db
from bson import ObjectId
from typing import List, Optional
from datetime import datetime
import os

router = APIRouter()

@router.post("/", response_model=ProjectInDB)
async def create_project(
    name: str = Form(...),
    description: str = Form(...),
    user_associated: str = Form(...),
    project_url: Optional[str] = Form(None),
    project_pic: Optional[UploadFile] = File(None)
):
    db = get_db()
    
    # Check if the user exists
    user = db.users.find_one({"username": user_associated})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    project_dict = {
        "name": name,
        "description": description,
        "user_associated": user_associated,
        "project_url": project_url,
        "time_submitted": datetime.now().isoformat(),
        "reviews": [],
        "like_count": 0
    }

    # Handle project picture upload
    if project_pic:
        timestamp = int(datetime.now().timestamp())
        safe_filename = f"project_{timestamp}_{project_pic.filename.replace(' ', '_')}"
        file_location = f"uploads/{safe_filename}"
        
        try:
            with open(file_location, "wb+") as file_object:
                content = await project_pic.read()
                file_object.write(content)
            # Store the full URL with timestamp
            project_dict["project_pic"] = f"http://localhost:8000/{file_location}?t={timestamp}"
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Could not upload file: {e}")
    else:
        timestamp = int(datetime.now().timestamp())
        project_dict["project_pic"] = f"http://localhost:8000/uploads/default-project-pic.png?t={timestamp}"
    
    result = db.projects.insert_one(project_dict)
    created_project = db.projects.find_one({"_id": result.inserted_id})
    created_project["id"] = str(created_project["_id"])
    
    return ProjectInDB(**created_project)

# Add this helper function to format project data
def format_project_data(project):
    """Format project data with full URLs for images"""
    if project.get("project_pic"):
        project["project_pic"] = f"http://localhost:8000/{project['project_pic']}"
    return project

@router.get("/{project_id}", response_model=ProjectInDB)
async def get_project(project_id: str):
    db = get_db()

    # Fetch the project by its ObjectId
    project_data = db.projects.find_one({"_id": ObjectId(project_id)})

    if not project_data:
        raise HTTPException(status_code=404, detail="Project not found")
    
    project_data["id"] = str(project_data["_id"])  # Map MongoDB _id to 'id'
    return ProjectInDB(**format_project_data(project_data))

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

@router.delete("/{project_id}")
async def delete_project(project_id: str):
    """Delete a project"""
    db = get_db()
    
    # Check if project exists
    project = db.projects.find_one({"_id": ObjectId(project_id)})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Delete project image if it exists and isn't the default
    if project.get("project_pic") and "default-project-pic" not in project["project_pic"]:
        try:
            file_path = project["project_pic"].split("http://localhost:8000/")[1].split("?")[0]
            if os.path.exists(file_path):
                os.remove(file_path)
        except Exception as e:
            print(f"Error deleting project image: {e}")
    
    # Delete the project
    result = db.projects.delete_one({"_id": ObjectId(project_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
        
    return {"message": "Project deleted successfully"}