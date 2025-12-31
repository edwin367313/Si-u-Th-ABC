"""
K-Means Customer Segmentation Service
"""

import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from typing import Dict, List, Any, Optional
import sys
import os

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from utils.database import db
from utils.helpers import get_customer_segment_label, calculate_rfm_score
from utils.model_loader import model_loader, MODEL_KMEANS

class KMeansService:
    """Customer segmentation using K-Means clustering"""
    
    def __init__(self, n_clusters: int = 5):
        self.n_clusters = n_clusters
        self.model = None
        self.scaler = StandardScaler()
        self.feature_names = ['recency', 'frequency', 'monetary']
    
    def prepare_data(self, customers_data: List[Dict]) -> pd.DataFrame:
        """Prepare customer data for clustering"""
        df = pd.DataFrame(customers_data)
        
        # Calculate RFM features
        df['recency'] = df['days_since_last_order']
        df['frequency'] = df['total_orders']
        df['monetary'] = df['total_spent']
        
        # Calculate RFM score
        df['rfm_score'] = df.apply(
            lambda row: calculate_rfm_score(
                row['recency'],
                row['frequency'],
                row['monetary']
            ),
            axis=1
        )
        
        return df
    
    def train(self, retrain: bool = False) -> Dict[str, Any]:
        """Train K-Means model"""
        # Check if model exists
        if not retrain and model_loader.model_exists(MODEL_KMEANS):
            self.load_model()
            return {
                "success": True,
                "message": "Model đã tồn tại, sử dụng model có sẵn",
                "model_loaded": True
            }
        
        # Get training data
        customers_data = db.get_customers_data()
        
        if not customers_data:
            return {
                "success": False,
                "message": "Không có dữ liệu khách hàng"
            }
        
        # Prepare data
        df = self.prepare_data(customers_data)
        X = df[self.feature_names].values
        
        # Normalize features
        X_scaled = self.scaler.fit_transform(X)
        
        # Train K-Means
        self.model = KMeans(n_clusters=self.n_clusters, random_state=42, n_init=10)
        self.model.fit(X_scaled)
        
        # Save model and scaler
        model_data = {
            'model': self.model,
            'scaler': self.scaler,
            'feature_names': self.feature_names
        }
        model_loader.save_model(model_data, MODEL_KMEANS)
        
        # Calculate statistics
        df['cluster'] = self.model.labels_
        stats = self._calculate_cluster_stats(df)
        
        return {
            "success": True,
            "message": f"Training thành công với {len(customers_data)} khách hàng",
            "n_clusters": self.n_clusters,
            "n_samples": len(customers_data),
            "inertia": float(self.model.inertia_),
            "statistics": stats
        }
    
    def load_model(self) -> bool:
        """Load trained model"""
        model_data = model_loader.load_model(MODEL_KMEANS)
        
        if model_data:
            self.model = model_data['model']
            self.scaler = model_data['scaler']
            self.feature_names = model_data['feature_names']
            return True
        return False
    
    def predict(self, customer_data: Dict) -> Dict[str, Any]:
        """Predict customer segment"""
        if not self.model:
            if not self.load_model():
                return {
                    "success": False,
                    "message": "Model chưa được training"
                }
        
        # Prepare features
        features = np.array([[
            customer_data.get('recency', 0),
            customer_data.get('frequency', 0),
            customer_data.get('monetary', 0)
        ]])
        
        # Scale and predict
        features_scaled = self.scaler.transform(features)
        cluster = int(self.model.predict(features_scaled)[0])
        
        return {
            "success": True,
            "cluster": cluster,
            "segment": get_customer_segment_label(cluster),
            "rfm_score": calculate_rfm_score(
                customer_data.get('recency', 0),
                customer_data.get('frequency', 0),
                customer_data.get('monetary', 0)
            )
        }
    
    def segment_all_customers(self) -> Dict[str, Any]:
        """Segment all customers"""
        if not self.model:
            if not self.load_model():
                return {
                    "success": False,
                    "message": "Model chưa được training"
                }
        
        # Get all customers
        customers_data = db.get_customers_data()
        
        if not customers_data:
            return {
                "success": False,
                "message": "Không có dữ liệu khách hàng"
            }
        
        # Prepare and predict
        df = self.prepare_data(customers_data)
        X = df[self.feature_names].values
        X_scaled = self.scaler.transform(X)
        
        clusters = self.model.predict(X_scaled)
        df['cluster'] = clusters
        df['segment'] = df['cluster'].apply(get_customer_segment_label)
        
        # Calculate statistics
        stats = self._calculate_cluster_stats(df)
        
        # Prepare results
        segments = []
        for _, row in df.iterrows():
            segments.append({
                "user_id": int(row['user_id']),
                "cluster": int(row['cluster']),
                "segment": row['segment'],
                "rfm_score": int(row['rfm_score']),
                "recency": int(row['recency']),
                "frequency": int(row['frequency']),
                "monetary": float(row['monetary'])
            })
        
        return {
            "success": True,
            "total_customers": len(segments),
            "segments": segments,
            "statistics": stats
        }
    
    def _calculate_cluster_stats(self, df: pd.DataFrame) -> List[Dict]:
        """Calculate statistics for each cluster"""
        stats = []
        
        for cluster in range(self.n_clusters):
            cluster_df = df[df['cluster'] == cluster]
            
            if len(cluster_df) > 0:
                stats.append({
                    "cluster": int(cluster),
                    "segment": get_customer_segment_label(cluster),
                    "count": len(cluster_df),
                    "percentage": round(len(cluster_df) / len(df) * 100, 2),
                    "avg_recency": round(cluster_df['recency'].mean(), 2),
                    "avg_frequency": round(cluster_df['frequency'].mean(), 2),
                    "avg_monetary": round(cluster_df['monetary'].mean(), 2),
                    "avg_rfm_score": round(cluster_df['rfm_score'].mean(), 2)
                })
        
        return stats

# Singleton instance
kmeans_service = KMeansService()
