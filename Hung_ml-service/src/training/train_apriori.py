"""
Train Apriori Product Association Model
"""

import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from services.apriori_service import apriori_service
from preprocessing.data_loader import data_loader

def main():
    """Train Apriori product association model"""
    print("="*60)
    print("TRAINING APRIORI PRODUCT ASSOCIATION MODEL")
    print("="*60)
    
    try:
        # Force retrain
        result = apriori_service.train(retrain=True)
        
        if result['success']:
            print("\n✅ TRAINING THÀNH CÔNG!")
            print(f"📊 Số giao dịch: {result.get('n_transactions', 0)}")
            print(f"📊 Số frequent itemsets: {result.get('n_frequent_itemsets', 0)}")
            print(f"📊 Số association rules: {result.get('n_rules', 0)}")
            print(f"📊 Min support: {result.get('min_support', 0)}")
            print(f"📊 Min confidence: {result.get('min_confidence', 0)}")
            
            # Get top rules
            print("\n📊 TOP 5 ASSOCIATION RULES:")
            rules_result = apriori_service.get_top_rules(top_n=5)
            if rules_result['success']:
                for i, rule in enumerate(rules_result['top_rules'], 1):
                    print(f"\n  Rule {i}:")
                    print(f"    {rule['antecedents']} → {rule['consequents']}")
                    print(f"    Support: {rule['support']:.3f}")
                    print(f"    Confidence: {rule['confidence']:.3f}")
                    print(f"    Lift: {rule['lift']:.3f}")
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
