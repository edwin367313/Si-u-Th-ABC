"""
Customer Segmentation API Endpoints
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from services.kmeans_service import kmeans_service

router = APIRouter()

class CustomerData(BaseModel):
    """Customer data for prediction"""
    recency: int
    frequency: int
    monetary: float

class TrainRequest(BaseModel):
    """Training request"""
    retrain: bool = False

@router.post("/customer-segmentation/train")
async def train_segmentation_model(request: TrainRequest):
    """
    Train customer segmentation model
    
    - **retrain**: Force retrain even if model exists
    """
    try:
        result = kmeans_service.train(retrain=request.retrain)
        
        if not result['success']:
            raise HTTPException(status_code=400, detail=result['message'])
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/customer-segmentation/predict")
async def predict_customer_segment(customer: CustomerData):
    """
    Predict customer segment
    
    - **recency**: Days since last order
    - **frequency**: Total number of orders
    - **monetary**: Total amount spent
    """
    try:
        result = kmeans_service.predict(customer.dict())
        
        if not result['success']:
            raise HTTPException(status_code=400, detail=result['message'])
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/customer-segmentation/segments")
async def get_all_segments():
    """
    Get all customer segments
    
    Returns segmentation for all customers in database
    """
    try:
        result = kmeans_service.segment_all_customers()
        
        if not result['success']:
            raise HTTPException(status_code=400, detail=result['message'])
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/customer-segmentation/status")
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
