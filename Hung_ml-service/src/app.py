"""
Siêu Thị ABC - ML Service
FastAPI application for machine learning services
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn
import os
from dotenv import load_dotenv

# Import API routers
from api import customer_segmentation, revenue_prediction, product_association
from api import product_classifier, image_classification

# Load environment variables
load_dotenv()

# App lifespan
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle startup and shutdown events"""
    print("🚀 ML Service khởi động...")
    print(f"📍 Environment: {os.getenv('ENVIRONMENT', 'development')}")
    yield
    print("👋 ML Service đang tắt...")

# Create FastAPI app
app = FastAPI(
    title="Siêu Thị ABC - ML Service",
    description="Machine Learning API cho website thương mại điện tử",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:5000").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "service": "Siêu Thị ABC ML Service",
        "status": "running",
        "version": "1.0.0",
        "endpoints": {
            "customer_segmentation": "/api/ml/customer-segmentation",
            "revenue_prediction": "/api/ml/revenue-prediction",
            "product_association": "/api/ml/product-association",
            "product_classifier": "/api/ml/product-classifier",
            "image_classification": "/api/ml/image-classification"
        }
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "database": "connected",
        "models": "loaded"
    }

# Mount API routers
app.include_router(
    customer_segmentation.router,
    prefix="/api/ml",
    tags=["Customer Segmentation"]
)

app.include_router(
    revenue_prediction.router,
    prefix="/api/ml",
    tags=["Revenue Prediction"]
)

app.include_router(
    product_association.router,
    prefix="/api/ml",
    tags=["Product Association"]
)

app.include_router(
    product_classifier.router,
    prefix="/api/ml",
    tags=["Product Classifier"]
)

app.include_router(
    image_classification.router,
    prefix="/api/ml",
    tags=["Image Classification"]
)

# Error handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return {
        "success": False,
        "message": exc.detail,
        "status_code": exc.status_code
    }

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    return {
        "success": False,
        "message": "Có lỗi xảy ra trên server",
        "error": str(exc)
    }

# Run server
if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    
    uvicorn.run(
        "app:app",
        host=host,
        port=port,
        reload=os.getenv("ENVIRONMENT") == "development"
    )
