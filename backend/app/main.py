from fastapi import FastAPI
from app.routes import users, projects
from app.database import init_db
from fastapi.staticfiles import StaticFiles

app = FastAPI()

@app.on_event("startup")
def startup_db():
    init_db()

app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(projects.router, prefix="/projects", tags=["projects"])
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
