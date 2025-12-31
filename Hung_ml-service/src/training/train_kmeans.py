"""
Train K-Means Customer Segmentation Model
"""

import sys
import os

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from services.kmeans_service import kmeans_service
from preprocessing.data_loader import data_loader
from preprocessing.data_cleaner import data_cleaner
from preprocessing.feature_engineering import feature_engineering

def main():
    """Train K-Means customer segmentation model"""
    print("="*60)
    print("TRAINING K-MEANS CUSTOMER SEGMENTATION MODEL")
    print("="*60)
    
    try:
        # Force retrain
        result = kmeans_service.train(retrain=True)
        
        if result['success']:
            print("\n✅ TRAINING THÀNH CÔNG!")
            print(f"📊 Số clusters: {result.get('n_clusters', 5)}")
            print(f"📊 Số khách hàng: {result.get('n_samples', 0)}")
            print(f"📊 Inertia: {result.get('inertia', 0):.2f}")
            
            if 'statistics' in result:
                print("\n📊 THỐNG KÊ CÁC PHÂN KHÚC:")
                for stat in result['statistics']:
                    print(f"\n  {stat['segment']} (Cluster {stat['cluster']}):")
                    print(f"    - Số khách hàng: {stat['count']} ({stat['percentage']}%)")
                    print(f"    - Recency TB: {stat['avg_recency']:.1f} ngày")
                    print(f"    - Frequency TB: {stat['avg_frequency']:.1f} đơn")
                    print(f"    - Monetary TB: {stat['avg_monetary']:,.0f}đ")
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
