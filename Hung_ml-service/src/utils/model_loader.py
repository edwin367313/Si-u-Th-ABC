"""
Model loader utilities
"""

import pickle
import joblib
import os
from pathlib import Path
from typing import Any, Optional

class ModelLoader:
    """Load and save ML models"""
    
    def __init__(self, models_dir: str = None):
        if models_dir is None:
            # Default to models directory in project root
            base_dir = Path(__file__).parent.parent.parent
            models_dir = base_dir / "models"
        
        self.models_dir = Path(models_dir)
        self.models_dir.mkdir(parents=True, exist_ok=True)
    
    def save_model(self, model: Any, model_name: str, use_joblib: bool = True):
        """Save model to file"""
        model_path = self.models_dir / f"{model_name}.pkl"
        
        try:
            if use_joblib:
                joblib.dump(model, model_path)
            else:
                with open(model_path, 'wb') as f:
                    pickle.dump(model, f)
            
            print(f"✅ Model saved: {model_path}")
            return str(model_path)
        except Exception as e:
            print(f"❌ Error saving model: {e}")
            raise
    
    def load_model(self, model_name: str, use_joblib: bool = True) -> Optional[Any]:
        """Load model from file"""
        model_path = self.models_dir / f"{model_name}.pkl"
        
        if not model_path.exists():
            print(f"⚠️  Model not found: {model_path}")
            return None
        
        try:
            if use_joblib:
                model = joblib.load(model_path)
            else:
                with open(model_path, 'rb') as f:
                    model = pickle.load(f)
            
            print(f"✅ Model loaded: {model_path}")
            return model
        except Exception as e:
            print(f"❌ Error loading model: {e}")
            return None
    
    def model_exists(self, model_name: str) -> bool:
        """Check if model exists"""
        model_path = self.models_dir / f"{model_name}.pkl"
        return model_path.exists()
    
    def list_models(self) -> list:
        """List all saved models"""
        return [f.stem for f in self.models_dir.glob("*.pkl")]
    
    def delete_model(self, model_name: str) -> bool:
        """Delete model file"""
        model_path = self.models_dir / f"{model_name}.pkl"
        
        if model_path.exists():
            model_path.unlink()
            print(f"🗑️  Model deleted: {model_path}")
            return True
        return False

# Singleton instance
model_loader = ModelLoader()

# Predefined model names
MODEL_KMEANS = "customer_segmentation_kmeans"
MODEL_DECISION_TREE = "revenue_prediction_dt"
MODEL_APRIORI = "product_association_apriori"
MODEL_PRODUCT_NLP = "product_classifier_nlp"
MODEL_IMAGE_CNN = "image_classification_cnn"
