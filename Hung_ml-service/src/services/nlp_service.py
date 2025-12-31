"""
NLP Product Classifier Service
"""

import re
import string
from typing import Dict, List, Any
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.model_selection import train_test_split
import pandas as pd
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from utils.database import db
from utils.model_loader import model_loader, MODEL_PRODUCT_NLP

class NLPService:
    """Product text classification using NLP"""
    
    def __init__(self):
        self.model = None
        self.vectorizer = TfidfVectorizer(max_features=1000, ngram_range=(1, 2))
        self.categories = []
    
    def preprocess_text(self, text: str) -> str:
        """Preprocess text for NLP"""
        if not text:
            return ""
        
        # Lowercase
        text = text.lower()
        
        # Remove URLs
        text = re.sub(r'http\S+', '', text)
        
        # Remove punctuation
        text = text.translate(str.maketrans('', '', string.punctuation))
        
        # Remove extra whitespace
        text = ' '.join(text.split())
        
        return text
    
    def prepare_data(self, products_data: List[Dict]) -> pd.DataFrame:
        """Prepare product data for training"""
        df = pd.DataFrame(products_data)
        
        # Combine name and description
        df['text'] = df['name'] + ' ' + df['description'].fillna('')
        df['text'] = df['text'].apply(self.preprocess_text)
        
        # Use category_name as label
        df = df[df['category_name'].notna()]
        
        return df[['text', 'category_name']]
    
    def train(self, retrain: bool = False) -> Dict[str, Any]:
        """Train NLP classifier"""
        if not retrain and model_loader.model_exists(MODEL_PRODUCT_NLP):
            self.load_model()
            return {
                "success": True,
                "message": "Model đã tồn tại, sử dụng model có sẵn",
                "model_loaded": True
            }
        
        # Get product data
        products_data = db.get_products_data()
        
        if not products_data or len(products_data) < 50:
            return {
                "success": False,
                "message": "Không đủ dữ liệu sản phẩm (cần ít nhất 50 sản phẩm)"
            }
        
        # Prepare data
        df = self.prepare_data(products_data)
        
        if len(df) < 50:
            return {
                "success": False,
                "message": "Không đủ dữ liệu sau khi xử lý"
            }
        
        X = df['text'].values
        y = df['category_name'].values
        
        # Store categories
        self.categories = list(set(y))
        
        # Split train/test
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        # Vectorize
        X_train_vec = self.vectorizer.fit_transform(X_train)
        X_test_vec = self.vectorizer.transform(X_test)
        
        # Train classifier
        self.model = MultinomialNB()
        self.model.fit(X_train_vec, y_train)
        
        # Evaluate
        train_score = self.model.score(X_train_vec, y_train)
        test_score = self.model.score(X_test_vec, y_test)
        
        # Save model
        model_data = {
            'model': self.model,
            'vectorizer': self.vectorizer,
            'categories': self.categories
        }
        model_loader.save_model(model_data, MODEL_PRODUCT_NLP)
        
        return {
            "success": True,
            "message": f"Training thành công với {len(products_data)} sản phẩm",
            "n_samples": len(df),
            "n_categories": len(self.categories),
            "categories": self.categories,
            "train_accuracy": float(train_score),
            "test_accuracy": float(test_score)
        }
    
    def load_model(self) -> bool:
        """Load trained model"""
        model_data = model_loader.load_model(MODEL_PRODUCT_NLP)
        
        if model_data:
            self.model = model_data['model']
            self.vectorizer = model_data['vectorizer']
            self.categories = model_data['categories']
            return True
        return False
    
    def classify(self, text: str) -> Dict[str, Any]:
        """Classify product text"""
        if not self.model:
            if not self.load_model():
                return {
                    "success": False,
                    "message": "Model chưa được training"
                }
        
        # Preprocess
        text_clean = self.preprocess_text(text)
        
        if not text_clean:
            return {
                "success": False,
                "message": "Text rỗng sau khi xử lý"
            }
        
        # Vectorize
        text_vec = self.vectorizer.transform([text_clean])
        
        # Predict
        prediction = self.model.predict(text_vec)[0]
        probabilities = self.model.predict_proba(text_vec)[0]
        
        # Get top predictions
        top_indices = probabilities.argsort()[-3:][::-1]
        top_predictions = []
        
        for idx in top_indices:
            top_predictions.append({
                "category": self.model.classes_[idx],
                "probability": float(probabilities[idx])
            })
        
        return {
            "success": True,
            "text": text,
            "predicted_category": prediction,
            "confidence": float(max(probabilities)),
            "top_predictions": top_predictions
        }
    
    def batch_classify(self, texts: List[str]) -> Dict[str, Any]:
        """Classify multiple texts"""
        if not self.model:
            if not self.load_model():
                return {
                    "success": False,
                    "message": "Model chưa được training"
                }
        
        results = []
        for text in texts:
            result = self.classify(text)
            if result['success']:
                results.append({
                    "text": text,
                    "category": result['predicted_category'],
                    "confidence": result['confidence']
                })
        
        return {
            "success": True,
            "total": len(texts),
            "results": results
        }

# Singleton instance
nlp_service = NLPService()
