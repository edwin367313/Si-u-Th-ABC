"""
Helper utilities for ML service
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Any, Union
from datetime import datetime, timedelta
import json

def format_currency(amount: float) -> str:
    """Format amount to Vietnamese currency"""
    return f"{int(amount):,}đ"

def calculate_rfm_score(recency: int, frequency: int, monetary: float) -> int:
    """Calculate RFM score for customer segmentation"""
    # Simple scoring: 1-5 for each dimension
    r_score = 5 if recency <= 30 else (4 if recency <= 60 else (3 if recency <= 90 else (2 if recency <= 180 else 1)))
    f_score = 5 if frequency >= 10 else (4 if frequency >= 7 else (3 if frequency >= 4 else (2 if frequency >= 2 else 1)))
    m_score = 5 if monetary >= 5000000 else (4 if monetary >= 3000000 else (3 if monetary >= 1000000 else (2 if monetary >= 500000 else 1)))
    
    return (r_score + f_score + m_score) // 3

def get_customer_segment_label(cluster: int) -> str:
    """Get segment label from cluster number"""
    segments = {
        0: "VIP",
        1: "Trung thành",
        2: "Tiềm năng",
        3: "Mới",
        4: "Ngủ đông"
    }
    return segments.get(cluster, "Khác")

def calculate_confidence(support_a: float, support_ab: float) -> float:
    """Calculate confidence for association rules"""
    if support_a == 0:
        return 0
    return support_ab / support_a

def calculate_lift(support_a: float, support_b: float, support_ab: float) -> float:
    """Calculate lift for association rules"""
    if support_a == 0 or support_b == 0:
        return 0
    return support_ab / (support_a * support_b)

def normalize_features(data: np.ndarray) -> np.ndarray:
    """Normalize features using min-max scaling"""
    min_vals = data.min(axis=0)
    max_vals = data.max(axis=0)
    range_vals = max_vals - min_vals
    range_vals[range_vals == 0] = 1  # Avoid division by zero
    return (data - min_vals) / range_vals

def standardize_features(data: np.ndarray) -> np.ndarray:
    """Standardize features using z-score"""
    mean_vals = data.mean(axis=0)
    std_vals = data.std(axis=0)
    std_vals[std_vals == 0] = 1  # Avoid division by zero
    return (data - mean_vals) / std_vals

def split_train_test(data: pd.DataFrame, test_size: float = 0.2, random_state: int = 42):
    """Split data into train and test sets"""
    from sklearn.model_selection import train_test_split
    return train_test_split(data, test_size=test_size, random_state=random_state)

def calculate_accuracy(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    """Calculate accuracy score"""
    return np.mean(y_true == y_pred)

def calculate_mae(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    """Calculate Mean Absolute Error"""
    return np.mean(np.abs(y_true - y_pred))

def calculate_mse(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    """Calculate Mean Squared Error"""
    return np.mean((y_true - y_pred) ** 2)

def calculate_rmse(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    """Calculate Root Mean Squared Error"""
    return np.sqrt(calculate_mse(y_true, y_pred))

def get_date_features(date: datetime) -> Dict[str, int]:
    """Extract date features"""
    return {
        "year": date.year,
        "month": date.month,
        "day": date.day,
        "weekday": date.weekday(),
        "quarter": (date.month - 1) // 3 + 1,
        "week_of_year": date.isocalendar()[1],
        "is_weekend": 1 if date.weekday() >= 5 else 0
    }

def parse_images(images_json: str) -> List[str]:
    """Parse images JSON string"""
    try:
        if not images_json:
            return []
        return json.loads(images_json) if isinstance(images_json, str) else images_json
    except:
        return []

def get_first_image(images_json: str, default: str = None) -> str:
    """Get first image from images JSON"""
    images = parse_images(images_json)
    return images[0] if images else default

def create_response(success: bool, data: Any = None, message: str = None) -> Dict:
    """Create standardized API response"""
    response = {
        "success": success,
        "message": message or ("Thành công" if success else "Có lỗi xảy ra")
    }
    if data is not None:
        response["data"] = data
    return response

def safe_float(value: Any, default: float = 0.0) -> float:
    """Safely convert value to float"""
    try:
        return float(value) if value is not None else default
    except:
        return default

def safe_int(value: Any, default: int = 0) -> int:
    """Safely convert value to int"""
    try:
        return int(value) if value is not None else default
    except:
        return default

def chunks(lst: List, n: int):
    """Yield successive n-sized chunks from list"""
    for i in range(0, len(lst), n):
        yield lst[i:i + n]
