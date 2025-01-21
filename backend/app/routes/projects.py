from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel
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