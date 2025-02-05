import os
from fastapi import UploadFile, HTTPException
from datetime import datetime

UPLOAD_DIR = "uploads"

def save_upload_file(upload_file: UploadFile, prefix: str) -> str:
    try:
        # Create uploads directory if it doesn't exist
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        
        # Create unique filename with timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
        safe_filename = f"{prefix}_{timestamp}_{upload_file.filename.replace(' ', '_')}"
        file_path = os.path.join(UPLOAD_DIR, safe_filename)
        
        # Save the file
        with open(file_path, "wb+") as buffer:
            content = upload_file.file.read()
            buffer.write(content)
            upload_file.file.seek(0)  # Reset file pointer
            
        # Return relative path starting with 'uploads/'
        return os.path.join("uploads", safe_filename)
    
    except Exception as e:
        print(f"Error saving file: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Could not save image: {str(e)}")
