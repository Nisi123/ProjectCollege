from fastapi import FastAPI
from app.routes import users, projects
from app.database import init_db
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

# Update the static files configuration
app = FastAPI()

# Ensure uploads directory exists with proper permissions
upload_dir = "uploads"
os.makedirs(upload_dir, exist_ok=True)
os.chmod(upload_dir, 0o755)  # Set proper permissions

# Mount the uploads directory
app.mount("/uploads", StaticFiles(
    directory=upload_dir,
    check_dir=True,
    html=False,  # Changed to False since we're serving images
), name="uploads")

origins = [
    "http://localhost:5173",
    "http://localhost:8000",
]

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_db():
    init_db()

app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(projects.router, prefix="/projects", tags=["projects"])
