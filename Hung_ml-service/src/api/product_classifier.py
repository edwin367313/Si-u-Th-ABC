"""
Product Classifier API Endpoints
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from services.kmeans_service import kmeans_service

router = APIRouter()

class TrainRequest(BaseModel):
    """Training request"""
    retrain: bool = False

class ClassifyRequest(BaseModel):
    """Classification request"""
    text: str

@router.post("/product-classifier/train")
async def train_classifier_model(request: TrainRequest):
    """
    Train product text classifier (K-Means)
    
    - **retrain**: Force retrain even if model exists
    """
    try:
        result = kmeans_service.train(retrain=request.retrain)
        
        if not result['success']:
            raise HTTPException(status_code=400, detail=result['message'])
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/product-classifier/classify")
async def classify_product(request: ClassifyRequest):
    """
    Classify product from text (K-Means)
    
    - **text**: Product name
    """
    try:
        if not request.text or not request.text.strip():
            raise HTTPException(status_code=400, detail="Text không được rỗng")
        
        result = kmeans_service.predict(request.text)
        
        if not result['success']:
            raise HTTPException(status_code=400, detail=result['message'])
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/product-classifier/clusters")
async def get_product_clusters():
    """Get all product clusters (K-Means)"""
    try:
        result = kmeans_service.get_all_clusters()
        if not result['success']:
             raise HTTPException(status_code=400, detail=result['message'])
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/product-classifier/status")
async def get_model_status():
    """Get model training status"""
    try:
        from utils.model_loader import model_loader, MODEL_KMEANS
        
        model_exists = model_loader.model_exists(MODEL_KMEANS)
        
        return {
            "success": True,
            "model_trained": model_exists,
            "model_name": MODEL_KMEANS,
            "message": "Model đã được training" if model_exists else "Model chưa được training"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
