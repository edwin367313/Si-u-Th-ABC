"""
Product Association API Endpoints
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from services.apriori_service import apriori_service

router = APIRouter()

class TrainRequest(BaseModel):
    """Training request"""
    retrain: bool = False
    min_support: float = 0.01
    min_confidence: float = 0.3

class RecommendationRequest(BaseModel):
    """Recommendation request"""
    product_names: List[str]
    top_n: int = 5

@router.post("/product-association/train")
async def train_association_model(request: TrainRequest):
    """
    Train product association model using Apriori algorithm
    
    - **retrain**: Force retrain even if model exists
    - **min_support**: Minimum support threshold (default: 0.01)
    - **min_confidence**: Minimum confidence threshold (default: 0.3)
    """
    try:
        # Update thresholds
        apriori_service.min_support = request.min_support
        apriori_service.min_confidence = request.min_confidence
        
        result = apriori_service.train(retrain=request.retrain)
        
        if not result['success']:
            raise HTTPException(status_code=400, detail=result['message'])
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/product-association/recommendations")
async def get_product_recommendations(request: RecommendationRequest):
    """
    Get product recommendations based on cart items
    
    - **product_names**: List of product names in cart
    - **top_n**: Number of recommendations to return (default: 5)
    """
    try:
        result = apriori_service.get_recommendations(
            product_names=request.product_names,
            top_n=request.top_n
        )
        
        if not result['success']:
            raise HTTPException(status_code=400, detail=result['message'])
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/product-association/rules")
async def get_association_rules(top_n: int = 10):
    """
    Get top association rules
    
    - **top_n**: Number of top rules to return (default: 10)
    """
    try:
        result = apriori_service.get_top_rules(top_n=top_n)
        
        if not result['success']:
            raise HTTPException(status_code=400, detail=result['message'])
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/product-association/frequent-itemsets")
async def get_frequent_itemsets(min_length: int = 2, top_n: int = 20):
    """
    Get frequent itemsets
    
    - **min_length**: Minimum itemset length (default: 2)
    - **top_n**: Number of itemsets to return (default: 20)
    """
    try:
        result = apriori_service.get_frequent_itemsets(
            min_length=min_length,
            top_n=top_n
        )
        
        if not result['success']:
            raise HTTPException(status_code=400, detail=result['message'])
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/product-association/status")
async def get_model_status():
    """Get model training status"""
    try:
        from utils.model_loader import model_loader, MODEL_APRIORI
        
        model_exists = model_loader.model_exists(MODEL_APRIORI)
        
        return {
            "success": True,
            "model_trained": model_exists,
            "model_name": MODEL_APRIORI,
            "message": "Model đã được training" if model_exists else "Model chưa được training"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
