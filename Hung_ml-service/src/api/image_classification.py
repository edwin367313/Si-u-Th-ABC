"""
Image Classification API Endpoints
"""

from fastapi import APIRouter, HTTPException, File, UploadFile
from pydantic import BaseModel
from typing import Optional
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from services.image_service import image_service

router = APIRouter()

class TrainRequest(BaseModel):
    """Training request"""
    retrain: bool = False

class ClassifyBase64Request(BaseModel):
    """Base64 image classification request"""
    image_base64: str

class ClassifyURLRequest(BaseModel):
    """URL image classification request"""
    image_url: str

@router.post("/image-classification/train")
async def train_image_model(request: TrainRequest):
    """
    Train image classification model
    
    - **retrain**: Force retrain even if model exists
    
    Note: This is a mock implementation. Real training requires TensorFlow/PyTorch.
    """
    try:
        result = image_service.train(retrain=request.retrain)
        
        if not result['success']:
            raise HTTPException(status_code=400, detail=result['message'])
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/image-classification/classify")
async def classify_image(file: UploadFile = File(...)):
    """
    Classify product image from uploaded file
    
    - **file**: Image file (JPEG, PNG)
    """
    try:
        # Validate file type
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File phải là ảnh")
        
        # Read image data
        image_data = await file.read()
        
        # Classify
        result = image_service.classify_image(image_data)
        
        if not result['success']:
            raise HTTPException(status_code=400, detail=result['message'])
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/image-classification/classify-base64")
async def classify_image_base64(request: ClassifyBase64Request):
    """
    Classify product image from base64 string
    
    - **image_base64**: Base64 encoded image
    """
    try:
        result = image_service.classify_image_from_base64(request.image_base64)
        
        if not result['success']:
            raise HTTPException(status_code=400, detail=result['message'])
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/image-classification/classify-url")
async def classify_image_url(request: ClassifyURLRequest):
    """
    Classify product image from URL
    
    - **image_url**: URL of the image
    """
    try:
        result = image_service.classify_image_from_url(request.image_url)
        
        if not result['success']:
            raise HTTPException(status_code=400, detail=result['message'])
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/image-classification/categories")
async def get_categories():
    """Get available image categories"""
    try:
        return {
            "success": True,
            "categories": image_service.categories,
            "total": len(image_service.categories)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/image-classification/status")
async def get_model_status():
    """Get model training status"""
    try:
        from utils.model_loader import model_loader, MODEL_IMAGE_CNN
        
        model_exists = model_loader.model_exists(MODEL_IMAGE_CNN)
        
        return {
            "success": True,
            "model_trained": model_exists,
            "model_name": MODEL_IMAGE_CNN,
            "message": "Model đã được training" if model_exists else "Model chưa được training"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
