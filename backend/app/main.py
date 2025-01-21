from fastapi import FastAPI
from app.routes import users, projects
from app.database import init_db
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

app = FastAPI()

# Ensure uploads directory exists
os.makedirs("uploads", exist_ok=True)

# Mount the uploads directory with cache control headers
app.mount("/uploads", StaticFiles(directory="uploads", html=True), name="static")

origins = [
    "http://localhost:5173",
    "http://localhost:8000",
]

# Update CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Use the origins list instead of a single origin
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],  # Explicitly list allowed methods
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_db():
    init_db()

app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(projects.router, prefix="/projects", tags=["projects"])
