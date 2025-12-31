"""
Customer Segmentation API Endpoints
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from services.decision_tree_service import customer_classification_service

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
    Train customer segmentation model (Decision Tree)
    """
    try:
        result = customer_classification_service.train(retrain=request.retrain)
        
        if not result['success']:
            raise HTTPException(status_code=400, detail=result['message'])
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/customer-segmentation/predict")
async def predict_customer_segment(customer: CustomerData):
    """
    Predict customer segment (Decision Tree)
    """
    try:
        segment = customer_classification_service.predict(
            customer.recency, customer.frequency, customer.monetary
        )
        return {
            "success": True,
            "segment": segment,
            "input": customer.dict()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/customer-segmentation/segments")
async def get_all_segments():
    """
    Get all customer segments (Decision Tree)
    """
    try:
        result = customer_classification_service.segment_all_customers()
        
        if not result['success']:
            raise HTTPException(status_code=400, detail=result['message'])
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/customer-segmentation/status")
async def get_model_status():
    """Get model training status"""
    try:
        from utils.model_loader import model_loader, MODEL_CUSTOMER_CLASSIFIER
        
        model_exists = model_loader.model_exists(MODEL_CUSTOMER_CLASSIFIER)
        
        return {
            "success": True,
            "model_trained": model_exists,
            "model_name": MODEL_CUSTOMER_CLASSIFIER,
            "message": "Model đã được training" if model_exists else "Model chưa được training"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
