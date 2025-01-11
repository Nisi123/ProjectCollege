# app/database.py

from pymongo import MongoClient
from app.config import settings

# MongoDB connection
client = MongoClient(settings.MONGO_URI)
db = client[settings.DATABASE_NAME]

def init_db():
    """Initialize the database by checking collections and creating them if necessary."""
    if 'users' not in db.list_collection_names():
        db.create_collection('users')

    if 'projects' not in db.list_collection_names():
        db.create_collection('projects')

def get_db():
    return db
