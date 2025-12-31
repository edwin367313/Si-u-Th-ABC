"""
Decision Tree Revenue Prediction Service
"""

import numpy as np
import pandas as pd
from sklearn.tree import DecisionTreeRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from typing import Dict, List, Any
from datetime import datetime, timedelta
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from utils.database import db
from utils.helpers import calculate_mae, calculate_rmse, get_date_features
from utils.model_loader import model_loader, MODEL_DECISION_TREE

class DecisionTreeService:
    """Revenue prediction using Decision Tree"""
    
    def __init__(self, max_depth: int = 10):
        self.max_depth = max_depth
        self.model = None
        self.scaler = StandardScaler()
        self.feature_names = [
            'month', 'weekday', 'items_count', 
            'avg_order_7d', 'avg_order_30d'
        ]
    
    def prepare_data(self, orders_data: List[Dict]) -> pd.DataFrame:
        """Prepare orders data for training"""
        df = pd.DataFrame(orders_data)
        
        # Convert created_at to datetime
        df['created_at'] = pd.to_datetime(df['created_at'])
        df = df.sort_values('created_at')
        
        # Calculate rolling averages
        df['avg_order_7d'] = df['total'].rolling(window=7, min_periods=1).mean()
        df['avg_order_30d'] = df['total'].rolling(window=30, min_periods=1).mean()
        
        # Target variable
        df['revenue'] = df['total']
        
        return df
    
    def train(self, retrain: bool = False) -> Dict[str, Any]:
        """Train Decision Tree model"""
        if not retrain and model_loader.model_exists(MODEL_DECISION_TREE):
            self.load_model()
            return {
                "success": True,
                "message": "Model đã tồn tại, sử dụng model có sẵn",
                "model_loaded": True
            }
        
        # Get training data
        orders_data = db.get_orders_data()
        
        if not orders_data or len(orders_data) < 100:
            return {
                "success": False,
                "message": "Không đủ dữ liệu (cần ít nhất 100 đơn hàng)"
            }
        
        # Prepare data
        df = self.prepare_data(orders_data)
        X = df[self.feature_names].values
        y = df['revenue'].values
        
        # Split train/test
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        # Normalize features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Train model
        self.model = DecisionTreeRegressor(
            max_depth=self.max_depth,
            random_state=42,
            min_samples_split=10,
            min_samples_leaf=5
        )
        self.model.fit(X_train_scaled, y_train)
        
        # Evaluate
        y_pred = self.model.predict(X_test_scaled)
        mae = calculate_mae(y_test, y_pred)
        rmse = calculate_rmse(y_test, y_pred)
        
        # Save model
        model_data = {
            'model': self.model,
            'scaler': self.scaler,
            'feature_names': self.feature_names
        }
        model_loader.save_model(model_data, MODEL_DECISION_TREE)
        
        return {
            "success": True,
            "message": f"Training thành công với {len(orders_data)} đơn hàng",
            "n_samples": len(orders_data),
            "train_size": len(X_train),
            "test_size": len(X_test),
            "mae": float(mae),
            "rmse": float(rmse),
            "max_depth": self.max_depth
        }
    
    def load_model(self) -> bool:
        """Load trained model"""
        model_data = model_loader.load_model(MODEL_DECISION_TREE)
        
        if model_data:
            self.model = model_data['model']
            self.scaler = model_data['scaler']
            self.feature_names = model_data['feature_names']
            return True
        return False
    
    def predict_revenue(self, date: datetime, items_count: int = 3) -> Dict[str, Any]:
        """Predict revenue for a specific date"""
        if not self.model:
            if not self.load_model():
                return {
                    "success": False,
                    "message": "Model chưa được training"
                }
        
        # Get historical averages (mock for now)
        avg_order_7d = 150000
        avg_order_30d = 145000
        
        # Prepare features
        date_features = get_date_features(date)
        features = np.array([[
            date_features['month'],
            date_features['weekday'],
            items_count,
            avg_order_7d,
            avg_order_30d
        ]])
        
        # Scale and predict
        features_scaled = self.scaler.transform(features)
        prediction = float(self.model.predict(features_scaled)[0])
        
        return {
            "success": True,
            "date": date.strftime("%Y-%m-%d"),
            "predicted_revenue": prediction,
            "features": {
                "month": date_features['month'],
                "weekday": date_features['weekday'],
                "items_count": items_count
            }
        }
    
    def forecast_next_days(self, days: int = 7) -> Dict[str, Any]:
        """Forecast revenue for next N days"""
        if not self.model:
            if not self.load_model():
                return {
                    "success": False,
                    "message": "Model chưa được training"
                }
        
        today = datetime.now()
        forecasts = []
        
        for i in range(days):
            future_date = today + timedelta(days=i+1)
            result = self.predict_revenue(future_date)
            
            if result['success']:
                forecasts.append({
                    "date": result['date'],
                    "predicted_revenue": result['predicted_revenue']
                })
        
        total_forecast = sum(f['predicted_revenue'] for f in forecasts)
        avg_daily = total_forecast / len(forecasts) if forecasts else 0
        
        return {
            "success": True,
            "forecast_period": f"{days} ngày",
            "start_date": (today + timedelta(days=1)).strftime("%Y-%m-%d"),
            "end_date": (today + timedelta(days=days)).strftime("%Y-%m-%d"),
            "total_predicted_revenue": total_forecast,
            "avg_daily_revenue": avg_daily,
            "daily_forecasts": forecasts
        }

# Singleton instance
decision_tree_service = DecisionTreeService()
