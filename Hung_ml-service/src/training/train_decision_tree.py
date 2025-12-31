"""
Train Decision Tree Revenue Prediction Model
"""

import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from services.decision_tree_service import decision_tree_service
from preprocessing.data_loader import data_loader
from preprocessing.data_cleaner import data_cleaner
from preprocessing.feature_engineering import feature_engineering

def main():
    """Train Decision Tree revenue prediction model"""
    print("="*60)
    print("TRAINING DECISION TREE REVENUE PREDICTION MODEL")
    print("="*60)
    
    try:
        # Force retrain
        result = decision_tree_service.train(retrain=True)
        
        if result['success']:
            print("\n✅ TRAINING THÀNH CÔNG!")
            print(f"📊 Tổng số đơn hàng: {result.get('n_samples', 0)}")
            print(f"📊 Train size: {result.get('train_size', 0)}")
            print(f"📊 Test size: {result.get('test_size', 0)}")
            print(f"📊 Max depth: {result.get('max_depth', 10)}")
            print(f"\n📈 EVALUATION METRICS:")
            print(f"  - MAE: {result.get('mae', 0):,.0f}đ")
            print(f"  - RMSE: {result.get('rmse', 0):,.0f}đ")
        else:
            print(f"\n❌ TRAINING THẤT BẠI: {result.get('message', 'Unknown error')}")
            return 1
        
    except Exception as e:
        print(f"\n❌ LỖI: {str(e)}")
        return 1
    
    print("\n" + "="*60)
    return 0

if __name__ == "__main__":
    exit(main())
