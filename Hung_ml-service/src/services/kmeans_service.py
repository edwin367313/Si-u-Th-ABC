"""
K-Means Product Classification Service
"""

import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.feature_extraction.text import TfidfVectorizer
from typing import Dict, List, Any, Optional
import sys
import os
import joblib

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from utils.database import db
from utils.model_loader import model_loader, MODEL_KMEANS

class ProductClusteringService:
    """Product classification using K-Means clustering on product names"""
    
    def __init__(self, n_clusters: int = 5):
        self.n_clusters = n_clusters
        self.model = None
        self.vectorizer = TfidfVectorizer(stop_words='english')
        self.cluster_labels = {} # Map cluster ID to a human-readable label
    
    def train(self, retrain: bool = False) -> Dict[str, Any]:
        """Train K-Means model on product names"""
        # Check if model exists
        if not retrain and model_loader.model_exists(MODEL_KMEANS):
            self.load_model()
            return {
                "success": True,
                "message": "Model đã tồn tại, sử dụng model có sẵn",
                "model_loaded": True
            }
        
        # Get training data (Products)
        products_data = db.get_products_data()
        
        if not products_data:
            return {
                "success": False,
                "message": "Không có dữ liệu sản phẩm"
            }
        
        df = pd.DataFrame(products_data)
        # Ensure we have 'name'
        if 'name' not in df.columns:
             return {"success": False, "message": "Dữ liệu sản phẩm thiếu trường 'name'"}

        names = df['name'].fillna('').tolist()
        
        # Vectorize names
        X = self.vectorizer.fit_transform(names)
        
        # Train K-Means
        n_clusters = min(self.n_clusters, len(names))
        if n_clusters < 2:
             n_clusters = 1
             
        self.model = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
        self.model.fit(X)
        
        # Assign labels to clusters based on majority category in that cluster
        df['cluster'] = self.model.labels_
        self.cluster_labels = {}
        
        if 'category_name' in df.columns:
            for i in range(n_clusters):
                cluster_products = df[df['cluster'] == i]
                if not cluster_products.empty:
                    # Find most frequent category
                    top_cat = cluster_products['category_name'].mode()
                    if not top_cat.empty:
                        self.cluster_labels[i] = top_cat[0]
                    else:
                        self.cluster_labels[i] = f"Cluster {i}"
                else:
                    self.cluster_labels[i] = f"Cluster {i}"
        else:
             for i in range(n_clusters):
                 self.cluster_labels[i] = f"Cluster {i}"

        # Save model
        model_data = {
            'model': self.model,
            'vectorizer': self.vectorizer,
            'cluster_labels': self.cluster_labels
        }
        model_loader.save_model(model_data, MODEL_KMEANS)
        
        return {
            "success": True,
            "message": f"Training thành công với {len(names)} sản phẩm",
            "n_clusters": n_clusters,
            "inertia": float(self.model.inertia_)
        }

    def predict(self, product_name: str) -> Dict[str, Any]:
        """Predict category for a product name"""
        if not self.model:
            if not self.load_model():
                return {"success": False, "message": "Model chưa được training"}
        
        # Vectorize
        X = self.vectorizer.transform([product_name])
        
        # Predict cluster
        cluster_id = int(self.model.predict(X)[0])
        suggested_category = self.cluster_labels.get(cluster_id, f"Cluster {cluster_id}")
        
        return {
            "success": True,
            "product_name": product_name,
            "cluster_id": cluster_id,
            "suggested_category": suggested_category
        }

    def get_all_clusters(self) -> Dict[str, Any]:
        """Get all product clusters"""
        if not self.model:
            if not self.load_model():
                return {"success": False, "message": "Model chưa được training"}
        
        products_data = db.get_products_data()
        if not products_data:
            return {"success": False, "message": "Không có dữ liệu sản phẩm"}
            
        df = pd.DataFrame(products_data)
        if 'name' not in df.columns:
             return {"success": False, "message": "Dữ liệu sản phẩm thiếu trường 'name'"}

        names = df['name'].fillna('').tolist()
        X = self.vectorizer.transform(names)
        clusters = self.model.predict(X)
        
        df['cluster'] = clusters
        df['suggested_category'] = df['cluster'].map(lambda x: self.cluster_labels.get(x, f"Cluster {x}"))
        
        # Group by cluster
        result = {}
        for cluster_id in range(self.n_clusters):
            cluster_products = df[df['cluster'] == cluster_id]
            result[cluster_id] = {
                "label": self.cluster_labels.get(cluster_id, f"Cluster {cluster_id}"),
                "count": len(cluster_products),
                "products": cluster_products[['id', 'name', 'price']].to_dict('records')
            }
            
        return {
            "success": True,
            "clusters": result
        }

    def load_model(self) -> bool:
        """Load model from disk"""
        model_data = model_loader.load_model(MODEL_KMEANS)
        if model_data:
            self.model = model_data['model']
            self.vectorizer = model_data['vectorizer']
            self.cluster_labels = model_data.get('cluster_labels', {})
            return True
        return False

# Singleton instance
kmeans_service = ProductClusteringService()
