"""
Product Classifier API Endpoints
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from services.nlp_service import nlp_service

router = APIRouter()

class TrainRequest(BaseModel):
    """Training request"""
    retrain: bool = False

class ClassifyRequest(BaseModel):
    """Classification request"""
    text: str

class BatchClassifyRequest(BaseModel):
    """Batch classification request"""
    texts: List[str]

@router.post("/product-classifier/train")
async def train_classifier_model(request: TrainRequest):
    """
    Train product text classifier
    
    - **retrain**: Force retrain even if model exists
    """
    try:
        result = nlp_service.train(retrain=request.retrain)
        
        if not result['success']:
            raise HTTPException(status_code=400, detail=result['message'])
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/product-classifier/classify")
async def classify_product(request: ClassifyRequest):
    """
    Classify product from text
    
    - **text**: Product name and description
    """
    try:
        if not request.text or not request.text.strip():
            raise HTTPException(status_code=400, detail="Text không được rỗng")
        
        result = nlp_service.classify(request.text)
        
        if not result['success']:
            raise HTTPException(status_code=400, detail=result['message'])
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/product-classifier/batch-classify")
async def batch_classify_products(request: BatchClassifyRequest):
    """
    Classify multiple products
    
    - **texts**: List of product texts
    """
    try:
        if not request.texts:
            raise HTTPException(status_code=400, detail="Danh sách text rỗng")
        
        result = nlp_service.batch_classify(request.texts)
        
        if not result['success']:
            raise HTTPException(status_code=400, detail=result['message'])
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/product-classifier/categories")
async def get_categories():
    """Get available product categories"""
    try:
        # Load model to get categories
        if not nlp_service.model:
            nlp_service.load_model()
        
        return {
            "success": True,
            "categories": nlp_service.categories or [],
            "total": len(nlp_service.categories) if nlp_service.categories else 0
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/product-classifier/status")
async def get_model_status():
    """Get model training status"""
    try:
        from utils.model_loader import model_loader, MODEL_PRODUCT_NLP
        
        model_exists = model_loader.model_exists(MODEL_PRODUCT_NLP)
        
        return {
            "success": True,
            "model_trained": model_exists,
            "model_name": MODEL_PRODUCT_NLP,
            "message": "Model đã được training" if model_exists else "Model chưa được training"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
