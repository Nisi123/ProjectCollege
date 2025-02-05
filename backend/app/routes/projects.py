import os
import shutil
from fastapi import UploadFile
from fastapi import APIRouter, HTTPException, Body, Form, File, UploadFile
from pydantic import BaseModel
from app.models.project import Project, ProjectInDB
from app.database import get_db
from bson import ObjectId
from typing import List, Optional
from app.utils.file_handler import save_upload_file

router = APIRouter()

@router.post("/", response_model=ProjectInDB)
async def create_project(
    name: str = Form(...),
    description: str = Form(...),
    user_associated: str = Form(...),
    time_submitted: str = Form(...),
    project_url: Optional[str] = Form(None),
    project_pic: Optional[UploadFile] = File(None),
    project_images: List[UploadFile] = File([])  # Add this parameter
):
    try:
        db = get_db()
        
        user = db.users.find_one({"username": user_associated})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Process main project pic
        project_pic_url = None
        if project_pic:
            try:
                relative_url = save_upload_file(project_pic, user_associated)
                project_pic_url = f"http://localhost:8000{relative_url}"
            except Exception as e:
                print(f"Error saving main project pic: {e}")
                raise HTTPException(status_code=500, detail="Failed to save main project image")
            
        # Process additional project images
        project_image_urls = []
        for idx, image in enumerate(project_images):
            try:
                # Add index to filename to make it unique
                relative_url = save_upload_file(image, f"{user_associated}_additional_{idx}")
                image_url = f"http://localhost:8000{relative_url}"
                project_image_urls.append(image_url)
            except Exception as e:
                print(f"Error saving additional image {idx}: {e}")
                continue
            
        # Create project object
        project_dict = {
            "name": name,
            "description": description,
            "user_associated": user_associated,
            "time_submitted": time_submitted,
            "reviews": [],
            "like_count": 0,
            "project_url": project_url,
            "project_pic": project_pic_url,
            "project_images": project_image_urls,  # Add this field
            "liked_by": []
        }
        
        # Debug print
        print("Creating project with:", project_dict)
        
        result = db.projects.insert_one(project_dict)
        project_dict["id"] = str(result.inserted_id)
        
        return ProjectInDB(**project_dict)

    except Exception as e:
        print(f"Error in create_project: {str(e)}")
        if "Could not save image" in str(e):
            raise HTTPException(status_code=500, detail=str(e))
        raise HTTPException(status_code=422, detail=str(e))

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
    try:
        db = get_db()

        # Ensure skip and limit are valid integers
        skip = max(0, skip)
        limit = max(1, min(1000, limit))  # Cap limit at 1000

        # Set default sort field
        sort_field = [("like_count", -1)]  # Default sort by likes descending

        # Fetch projects with pagination and sorting
        cursor = db.projects.find().skip(skip).limit(limit).sort(sort_field)
        
        # Convert cursor to list (remove async for)
        projects_list = []
        for project in cursor:
            # Get user info for each project
            user = db.users.find_one({"username": project["user_associated"]})
            project_dict = dict(project)
            project_dict["id"] = str(project_dict["_id"])
            project_dict["user_id"] = str(user["_id"]) if user else None  # Add user_id
            del project_dict["_id"]
            projects_list.append(project_dict)

        # Get total count
        total_projects = db.projects.count_documents({})
        total_pages = (total_projects + limit - 1) // limit

        return {
            "projects": projects_list,
            "totalPages": total_pages,
            "totalProjects": total_projects
        }

    except Exception as e:
        print(f"Error in get_all_projects: {str(e)}")  # Log the error
        raise HTTPException(
            status_code=500, 
            detail=f"Internal server error: {str(e)}"
        )

# Add this class for the request body
class LikeRequest(BaseModel):
    current_user: str

@router.post("/{project_id}/like")
async def like_project(project_id: str, request: LikeRequest):
    try:
        db = get_db()
        project = db.projects.find_one({"_id": ObjectId(project_id)})
        
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Ensure liked_by exists
        liked_by = project.get("liked_by", [])
        
        # Check if user already liked the project
        if request.current_user in liked_by:
            raise HTTPException(status_code=400, detail="Already liked")

        # Update project
        result = db.projects.update_one(
            {"_id": ObjectId(project_id)},
            {
                "$inc": {"like_count": 1},
                "$addToSet": {"liked_by": request.current_user}
            }
        )

        if result.modified_count == 0:
            raise HTTPException(status_code=500, detail="Failed to update project")

        # Fetch updated project
        updated_project = db.projects.find_one({"_id": ObjectId(project_id)})
        if not updated_project:
            raise HTTPException(status_code=404, detail="Project not found after update")
        
        # Ensure all fields are present in response
        response_data = {
            "id": str(updated_project["_id"]),
            "like_count": updated_project.get("like_count", 0),
            "liked_by": updated_project.get("liked_by", []),
            **{k: v for k, v in updated_project.items() if k not in ["_id", "like_count", "liked_by"]}
        }
        
        return response_data
        
    except Exception as e:
        print(f"Error in like_project: {str(e)}")  # Server-side debug log
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{project_id}/unlike")
async def unlike_project(project_id: str, request: LikeRequest):
    try:
        db = get_db()
        project = db.projects.find_one({"_id": ObjectId(project_id)})
        
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Ensure liked_by exists
        liked_by = project.get("liked_by", [])
        
        # Check if user has liked the project
        if request.current_user not in liked_by:
            raise HTTPException(status_code=400, detail="Haven't liked yet")

        # Update project
        result = db.projects.update_one(
            {"_id": ObjectId(project_id)},
            {
                "$inc": {"like_count": -1},
                "$pull": {"liked_by": request.current_user}
            }
        )

        if result.modified_count == 0:
            raise HTTPException(status_code=500, detail="Failed to update project")

        # Fetch updated project
        updated_project = db.projects.find_one({"_id": ObjectId(project_id)})
        if not updated_project:
            raise HTTPException(status_code=404, detail="Project not found after update")
        
        # Ensure all fields are present in response
        response_data = {
            "id": str(updated_project["_id"]),
            "like_count": updated_project.get("like_count", 0),
            "liked_by": updated_project.get("liked_by", []),
            **{k: v for k, v in updated_project.items() if k not in ["_id", "like_count", "liked_by"]}
        }
        
        return response_data
        
    except Exception as e:
        print(f"Error in unlike_project: {str(e)}")  # Server-side debug log
        raise HTTPException(status_code=500, detail=str(e))

class ReviewRequest(BaseModel):
    review_text: str
    user_name: str

@router.post("/{project_id}/review")
async def add_review(project_id: str, request: ReviewRequest):
    try:
        db = get_db()
        project = db.projects.find_one({"_id": ObjectId(project_id)})
        
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Create simple review
        review = request.review_text

        # Ensure reviews array exists
        if "reviews" not in project:
            db.projects.update_one(
                {"_id": ObjectId(project_id)},
                {"$set": {"reviews": []}}
            )

        # Update project with new review
        result = db.projects.update_one(
            {"_id": ObjectId(project_id)},
            {"$push": {"reviews": review}}
        )

        if result.modified_count == 0:
            raise HTTPException(status_code=500, detail="Failed to add review")

        # Fetch updated project
        updated_project = db.projects.find_one({"_id": ObjectId(project_id)})
        if not updated_project:
            raise HTTPException(status_code=404, detail="Project not found after update")

        # Format response
        updated_project["id"] = str(updated_project["_id"])
        del updated_project["_id"]
        return updated_project
        
    except Exception as e:
        print(f"Error in add_review: {str(e)}")  # Server-side debug log
        raise HTTPException(status_code=500, detail=str(e))

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
    try:
        db = get_db()
        # First check if project exists
        project = db.projects.find_one({"_id": ObjectId(project_id)})
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Delete the project
        result = db.projects.delete_one({"_id": ObjectId(project_id)})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=500, detail="Failed to delete project")
            
        return {"message": "Project deleted successfully"}
        
    except Exception as e:
        print(f"Error in delete_project: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/by-user/{user_id}")
async def get_projects_by_user_id(user_id: str):
    try:
        db = get_db()
        # Get user first to find their username
        user = db.users.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Get all projects for this user
        projects = list(db.projects.find({"user_associated": user["username"]}))
        
        # Format projects
        formatted_projects = []
        for project in projects:
            project["id"] = str(project["_id"])
            del project["_id"]
            formatted_projects.append(project)
            
        return {"projects": formatted_projects}
        
    except Exception as e:
        print(f"Error getting user projects: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))