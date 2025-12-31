"""
Apriori Product Association Service
"""

import pandas as pd
from mlxtend.frequent_patterns import apriori, association_rules
from mlxtend.preprocessing import TransactionEncoder
from typing import Dict, List, Any
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from utils.database import db
from utils.helpers import calculate_confidence, calculate_lift
from utils.model_loader import model_loader, MODEL_APRIORI

class AprioriService:
    """Product association using Apriori algorithm"""
    
    def __init__(self, min_support: float = 0.01, min_confidence: float = 0.3):
        self.min_support = min_support
        self.min_confidence = min_confidence
        self.rules = None
        self.frequent_itemsets = None
    
    def prepare_transactions(self, transactions_data: List[Dict]) -> List[List[str]]:
        """Prepare transaction data"""
        df = pd.DataFrame(transactions_data)
        
        # Group by order_id to get list of products per transaction
        transactions = []
        for order_id, group in df.groupby('order_id'):
            products = group['product_name'].tolist()
            if len(products) > 1:  # Only transactions with multiple products
                transactions.append(products)
        
        return transactions
    
    def train(self, retrain: bool = False) -> Dict[str, Any]:
        """Train Apriori model (generate association rules)"""
        if not retrain and model_loader.model_exists(MODEL_APRIORI):
            self.load_model()
            return {
                "success": True,
                "message": "Model đã tồn tại, sử dụng model có sẵn",
                "model_loaded": True
            }
        
        # Get transaction data
        transactions_data = db.get_transactions_data()
        
        if not transactions_data:
            return {
                "success": False,
                "message": "Không có dữ liệu giao dịch"
            }
        
        # Prepare transactions
        transactions = self.prepare_transactions(transactions_data)
        
        if len(transactions) < 50:
            return {
                "success": False,
                "message": "Không đủ dữ liệu (cần ít nhất 50 giao dịch)"
            }
        
        # Encode transactions
        te = TransactionEncoder()
        te_ary = te.fit(transactions).transform(transactions)
        df = pd.DataFrame(te_ary, columns=te.columns_)
        
        # Find frequent itemsets
        self.frequent_itemsets = apriori(
            df,
            min_support=self.min_support,
            use_colnames=True
        )
        
        if len(self.frequent_itemsets) == 0:
            return {
                "success": False,
                "message": "Không tìm thấy itemset phổ biến với min_support hiện tại"
            }
        
        # Generate association rules
        self.rules = association_rules(
            self.frequent_itemsets,
            metric="confidence",
            min_threshold=self.min_confidence
        )
        
        # Save model
        model_data = {
            'frequent_itemsets': self.frequent_itemsets,
            'rules': self.rules,
            'min_support': self.min_support,
            'min_confidence': self.min_confidence
        }
        model_loader.save_model(model_data, MODEL_APRIORI)
        
        return {
            "success": True,
            "message": f"Training thành công với {len(transactions)} giao dịch",
            "n_transactions": len(transactions),
            "n_frequent_itemsets": len(self.frequent_itemsets),
            "n_rules": len(self.rules),
            "min_support": self.min_support,
            "min_confidence": self.min_confidence
        }
    
    def load_model(self) -> bool:
        """Load trained model"""
        model_data = model_loader.load_model(MODEL_APRIORI)
        
        if model_data:
            self.frequent_itemsets = model_data['frequent_itemsets']
            self.rules = model_data['rules']
            self.min_support = model_data['min_support']
            self.min_confidence = model_data['min_confidence']
            return True
        return False
    
    def get_recommendations(self, product_names: List[str], top_n: int = 5) -> Dict[str, Any]:
        """Get product recommendations based on cart items"""
        if self.rules is None:
            if not self.load_model():
                return {
                    "success": False,
                    "message": "Model chưa được training"
                }
        
        if not product_names:
            return {
                "success": False,
                "message": "Danh sách sản phẩm trống"
            }
        
        # Find rules where antecedents contain any of the input products
        recommendations = []
        
        for _, rule in self.rules.iterrows():
            antecedents = set(rule['antecedents'])
            consequents = set(rule['consequents'])
            
            # Check if any input product is in antecedents
            if any(p in antecedents for p in product_names):
                # Check if consequents are not already in cart
                new_products = consequents - set(product_names)
                
                if new_products:
                    for product in new_products:
                        recommendations.append({
                            "product_name": product,
                            "confidence": float(rule['confidence']),
                            "lift": float(rule['lift']),
                            "support": float(rule['support']),
                            "rule": f"{list(antecedents)} → {list(consequents)}"
                        })
        
        # Sort by confidence and lift
        recommendations.sort(key=lambda x: (x['confidence'], x['lift']), reverse=True)
        
        # Remove duplicates and take top N
        seen = set()
        unique_recommendations = []
        for rec in recommendations:
            if rec['product_name'] not in seen:
                seen.add(rec['product_name'])
                unique_recommendations.append(rec)
                if len(unique_recommendations) >= top_n:
                    break
        
        return {
            "success": True,
            "input_products": product_names,
            "recommendations": unique_recommendations,
            "total_recommendations": len(unique_recommendations)
        }
    
    def get_top_rules(self, top_n: int = 10) -> Dict[str, Any]:
        """Get top association rules"""
        if self.rules is None:
            if not self.load_model():
                return {
                    "success": False,
                    "message": "Model chưa được training"
                }
        
        # Sort rules by lift
        top_rules = self.rules.nlargest(top_n, 'lift')
        
        rules_list = []
        for _, rule in top_rules.iterrows():
            rules_list.append({
                "antecedents": list(rule['antecedents']),
                "consequents": list(rule['consequents']),
                "support": float(rule['support']),
                "confidence": float(rule['confidence']),
                "lift": float(rule['lift'])
            })
        
        return {
            "success": True,
            "total_rules": len(self.rules),
            "top_rules": rules_list
        }
    
    def get_frequent_itemsets(self, min_length: int = 2, top_n: int = 20) -> Dict[str, Any]:
        """Get frequent itemsets"""
        if self.frequent_itemsets is None:
            if not self.load_model():
                return {
                    "success": False,
                    "message": "Model chưa được training"
                }
        
        # Filter by itemset length
        filtered = self.frequent_itemsets[
            self.frequent_itemsets['itemsets'].apply(lambda x: len(x) >= min_length)
        ]
        
        # Sort by support
        top_itemsets = filtered.nlargest(top_n, 'support')
        
        itemsets_list = []
        for _, row in top_itemsets.iterrows():
            itemsets_list.append({
                "items": list(row['itemsets']),
                "support": float(row['support']),
                "length": len(row['itemsets'])
            })
        
        return {
            "success": True,
            "total_itemsets": len(self.frequent_itemsets),
            "frequent_itemsets": itemsets_list
        }

# Singleton instance
apriori_service = AprioriService()
