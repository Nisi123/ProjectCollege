import os
import shutil
from datetime import datetime
from fastapi import UploadFile, HTTPException

UPLOAD_DIR = "uploads"

def save_upload_file(upload_file: UploadFile, user_associated: str) -> str:
    try:
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        
        # Create unique filename with timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        file_extension = os.path.splitext(upload_file.filename)[1]
        unique_filename = f"project_pic_{user_associated}_{timestamp}{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)
        
        print(f"Saving file to: {file_path}")
        print(f"Returning URL: /uploads/{unique_filename}")
        
        # Save the file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(upload_file.file, buffer)
            
        return f"/uploads/{unique_filename}"
    
    except Exception as e:
        print(f"Error saving file: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Could not save image: {str(e)}")
