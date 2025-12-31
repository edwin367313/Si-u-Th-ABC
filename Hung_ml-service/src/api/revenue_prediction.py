"""
Revenue Prediction API Endpoints
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any
from datetime import datetime
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from services.decision_tree_service import decision_tree_service

router = APIRouter()

class TrainRequest(BaseModel):
    """Training request"""
    retrain: bool = False

class PredictRequest(BaseModel):
    """Revenue prediction request"""
    date: str  # YYYY-MM-DD format
    items_count: int = 3

class ForecastRequest(BaseModel):
    """Forecast request"""
    days: int = 7

@router.post("/revenue-prediction/train")
async def train_revenue_model(request: TrainRequest):
    """
    Train revenue prediction model
    
    - **retrain**: Force retrain even if model exists
    """
    try:
        result = decision_tree_service.train(retrain=request.retrain)
        
        if not result['success']:
            raise HTTPException(status_code=400, detail=result['message'])
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/revenue-prediction/predict")
async def predict_revenue(request: PredictRequest):
    """
    Predict revenue for a specific date
    
    - **date**: Date in YYYY-MM-DD format
    - **items_count**: Expected number of items per order
    """
    try:
        # Parse date
        date = datetime.strptime(request.date, "%Y-%m-%d")
        
        result = decision_tree_service.predict_revenue(
            date=date,
            items_count=request.items_count
        )
        
        if not result['success']:
            raise HTTPException(status_code=400, detail=result['message'])
        
        return result
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/revenue-prediction/forecast")
async def forecast_revenue(request: ForecastRequest):
    """
    Forecast revenue for next N days
    
    - **days**: Number of days to forecast (default: 7)
    """
    try:
        if request.days < 1 or request.days > 90:
            raise HTTPException(status_code=400, detail="Days must be between 1 and 90")
        
        result = decision_tree_service.forecast_next_days(days=request.days)
        
        if not result['success']:
            raise HTTPException(status_code=400, detail=result['message'])
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/revenue-prediction/status")
async def get_model_status():
    """Get model training status"""
    try:
        from utils.model_loader import model_loader, MODEL_DECISION_TREE
        
        model_exists = model_loader.model_exists(MODEL_DECISION_TREE)
        
        return {
            "success": True,
            "model_trained": model_exists,
            "model_name": MODEL_DECISION_TREE,
            "message": "Model đã được training" if model_exists else "Model chưa được training"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
