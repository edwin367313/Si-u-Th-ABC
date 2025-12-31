"""
Image Classification Service
"""

import numpy as np
from PIL import Image
import io
import base64
from typing import Dict, Any, List
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from utils.model_loader import model_loader, MODEL_IMAGE_CNN

class ImageService:
    """Product image classification service"""
    
    def __init__(self, image_size: tuple = (224, 224)):
        self.image_size = image_size
        self.model = None
        self.categories = [
            "Thực phẩm tươi sống",
            "Đồ uống",
            "Bánh kẹo",
            "Gia vị",
            "Đồ gia dụng",
            "Chăm sóc cá nhân",
            "Khác"
        ]
    
    def preprocess_image(self, image_data: bytes) -> np.ndarray:
        """Preprocess image for model"""
        # Open image
        image = Image.open(io.BytesIO(image_data))
        
        # Convert to RGB
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Resize
        image = image.resize(self.image_size)
        
        # Convert to numpy array
        img_array = np.array(image)
        
        # Normalize to [0, 1]
        img_array = img_array.astype('float32') / 255.0
        
        # Add batch dimension
        img_array = np.expand_dims(img_array, axis=0)
        
        return img_array
    
    def train(self, retrain: bool = False) -> Dict[str, Any]:
        """Train image classification model"""
        # Note: Actual training would require TensorFlow/PyTorch
        # This is a placeholder implementation
        
        if not retrain and model_loader.model_exists(MODEL_IMAGE_CNN):
            self.load_model()
            return {
                "success": True,
                "message": "Model đã tồn tại, sử dụng model có sẵn",
                "model_loaded": True
            }
        
        # Mock training (in production, use real CNN training)
        print("⚠️  Image classification training requires TensorFlow/PyTorch")
        print("    Sử dụng mock model cho demo")
        
        # Create mock model
        model_data = {
            'categories': self.categories,
            'image_size': self.image_size,
            'model_type': 'mock'
        }
        model_loader.save_model(model_data, MODEL_IMAGE_CNN)
        self.model = model_data
        
        return {
            "success": True,
            "message": "Mock model created (requires real CNN training)",
            "n_categories": len(self.categories),
            "categories": self.categories,
            "image_size": self.image_size
        }
    
    def load_model(self) -> bool:
        """Load trained model"""
        model_data = model_loader.load_model(MODEL_IMAGE_CNN)
        
        if model_data:
            self.model = model_data
            self.categories = model_data.get('categories', self.categories)
            self.image_size = model_data.get('image_size', self.image_size)
            return True
        return False
    
    def classify_image(self, image_data: bytes) -> Dict[str, Any]:
        """Classify product image"""
        if not self.model:
            if not self.load_model():
                # Create mock model if not exists
                self.train()
        
        try:
            # Preprocess image
            img_array = self.preprocess_image(image_data)
            
            # Mock prediction (in production, use real model prediction)
            # For demo purposes, return mock probabilities
            np.random.seed(hash(image_data) % 2**32)  # Deterministic but varied
            probabilities = np.random.dirichlet(np.ones(len(self.categories)))
            
            # Sort by probability
            sorted_indices = probabilities.argsort()[::-1]
            
            # Get top predictions
            top_predictions = []
            for idx in sorted_indices[:3]:
                top_predictions.append({
                    "category": self.categories[idx],
                    "probability": float(probabilities[idx])
                })
            
            predicted_category = self.categories[sorted_indices[0]]
            confidence = float(probabilities[sorted_indices[0]])
            
            return {
                "success": True,
                "predicted_category": predicted_category,
                "confidence": confidence,
                "top_predictions": top_predictions,
                "note": "Mock prediction (requires real CNN model)"
            }
            
        except Exception as e:
            return {
                "success": False,
                "message": f"Lỗi xử lý ảnh: {str(e)}"
            }
    
    def classify_image_from_base64(self, base64_string: str) -> Dict[str, Any]:
        """Classify image from base64 string"""
        try:
            # Remove data URL prefix if present
            if ',' in base64_string:
                base64_string = base64_string.split(',')[1]
            
            # Decode base64
            image_data = base64.b64decode(base64_string)
            
            return self.classify_image(image_data)
            
        except Exception as e:
            return {
                "success": False,
                "message": f"Lỗi decode base64: {str(e)}"
            }
    
    def classify_image_from_url(self, image_url: str) -> Dict[str, Any]:
        """Classify image from URL"""
        try:
            import requests
            
            # Download image
            response = requests.get(image_url, timeout=10)
            response.raise_for_status()
            
            image_data = response.content
            return self.classify_image(image_data)
            
        except Exception as e:
            return {
                "success": False,
                "message": f"Lỗi tải ảnh: {str(e)}"
            }
    
    def get_image_info(self, image_data: bytes) -> Dict[str, Any]:
        """Get image information"""
        try:
            image = Image.open(io.BytesIO(image_data))
            
            return {
                "success": True,
                "format": image.format,
                "mode": image.mode,
                "size": image.size,
                "width": image.width,
                "height": image.height
            }
        except Exception as e:
            return {
                "success": False,
                "message": f"Lỗi đọc ảnh: {str(e)}"
            }

# Singleton instance
image_service = ImageService()
