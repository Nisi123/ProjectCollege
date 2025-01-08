from fastapi import FastAPI
from app.routes import users, projects
from app.database import init_db
from fastapi.middleware.cors import CORSMiddleware  # Correctly import CORSMiddleware


app = FastAPI()

origins = [
    "http://localhost:5173",  # React frontend (localhost:5173 is the default port for React dev server)
    # You can add more allowed origins for production or other environments if needed
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Specify the allowed origins (React frontend in this case)
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # Allow all headers
)


@app.on_event("startup")
def startup_db():
    init_db()

app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(projects.router, prefix="/projects", tags=["projects"])
