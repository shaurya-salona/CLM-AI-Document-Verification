import os
import shutil
from fastapi import UploadFile, HTTPException, status
from app.config import settings

ALLOWED_EXTENSIONS = {".pdf"}
MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024  # 15 MB limit

class StorageService:
    """
    Service layer responsible for managing file storage, folder creation,
    PDF file type validation, size checks, and disk file lifecycle.
    """

    @staticmethod
    def get_request_folder(request_id: int) -> str:
        """Returns target directory path for a vendor request."""
        folder_name = f"request_{request_id}"
        target_dir = os.path.join(settings.UPLOAD_DIR, folder_name)
        os.makedirs(target_dir, exist_ok=True)
        return target_dir

    @staticmethod
    def validate_pdf_file(file_obj: UploadFile) -> None:
        """Validates file extension is .pdf."""
        if not file_obj or not file_obj.filename:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or missing file."
            )
        
        ext = os.path.splitext(file_obj.filename)[1].lower()
        if ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File '{file_obj.filename}' must be a PDF document (.pdf)."
            )

    @staticmethod
    def save_upload_file(file_obj: UploadFile, target_dir: str, target_filename: str) -> tuple[str, int]:
        """
        Saves uploaded file to target directory, validates size limits, 
        and returns (file_path, file_size_bytes).
        """
        StorageService.validate_pdf_file(file_obj)
        file_path = os.path.join(target_dir, target_filename)

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file_obj.file, buffer)

        file_size = os.path.getsize(file_path) if os.path.exists(file_path) else 0

        if file_size > MAX_FILE_SIZE_BYTES:
            if os.path.exists(file_path):
                os.remove(file_path)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File '{file_obj.filename}' exceeds maximum allowed size of 15MB."
            )

        return file_path, file_size

    @staticmethod
    def delete_request_folder(request_id: int) -> bool:
        """Deletes all files and folder associated with a request ID."""
        target_dir = StorageService.get_request_folder(request_id)
        if os.path.exists(target_dir):
            shutil.rmtree(target_dir)
            return True
        return False
