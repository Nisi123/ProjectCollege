from bson import ObjectId
from app.database import get_db
from app.models.project import ProjectInDB

# Create a new project
async def create_project(project_data: dict) -> ProjectInDB:
    db = get_db()
    result = db["projects"].insert_one(project_data)
    created_project = db["projects"].find_one({"_id": result.inserted_id})
    return ProjectInDB(**created_project)

# Get all projects
async def get_all_projects() -> list[ProjectInDB]:
    db = get_db()
    projects = db["projects"].find()
    return [ProjectInDB(**project) for project in projects]

# Get a project by its MongoDB _id
async def get_project_by_id(project_id: str) -> ProjectInDB:
    db = get_db()
    project = db["projects"].find_one({"_id": ObjectId(project_id)})
    return ProjectInDB(**project) if project else None

# Get projects for a specific user
async def get_projects_by_user(user_id: str) -> list[ProjectInDB]:
    db = get_db()
    projects = db["projects"].find({"user_associated": user_id})
    return [ProjectInDB(**project) for project in projects]