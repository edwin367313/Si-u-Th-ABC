"""
Feature Engineering for ML Models
"""

import pandas as pd
import numpy as np
from typing import List
from datetime import datetime

class FeatureEngineering:
    """Create features for ML models"""
    
    @staticmethod
    def create_rfm_features(df: pd.DataFrame) -> pd.DataFrame:
        """Create RFM (Recency, Frequency, Monetary) features"""
        # Recency
        df['recency'] = df['days_since_last_order']
        
        # Frequency
        df['frequency'] = df['total_orders']
        
        # Monetary
        df['monetary'] = df['total_spent']
        
        # Average order value
        df['avg_order_value'] = df['total_spent'] / df['total_orders']
        
        # Years active
        df['years_active'] = df.get('years_active', 1)
        
        print(f"✅ Created RFM features")
        return df
    
    @staticmethod
    def create_date_features(df: pd.DataFrame, date_column: str = 'created_at') -> pd.DataFrame:
        """Create date-based features"""
        if date_column not in df.columns:
            return df
        
        # Ensure datetime type
        df[date_column] = pd.to_datetime(df[date_column])
        
        # Extract features
        df['year'] = df[date_column].dt.year
        df['month'] = df[date_column].dt.month
        df['day'] = df[date_column].dt.day
        df['weekday'] = df[date_column].dt.weekday
        df['quarter'] = df[date_column].dt.quarter
        df['week_of_year'] = df[date_column].dt.isocalendar().week
        df['is_weekend'] = (df['weekday'] >= 5).astype(int)
        df['is_month_start'] = df[date_column].dt.is_month_start.astype(int)
        df['is_month_end'] = df[date_column].dt.is_month_end.astype(int)
        
        print(f"✅ Created date features from {date_column}")
        return df
    
    @staticmethod
    def create_rolling_features(df: pd.DataFrame, value_column: str, windows: List[int] = [7, 30]) -> pd.DataFrame:
        """Create rolling statistics features"""
        df = df.sort_values('created_at')
        
        for window in windows:
            # Rolling mean
            df[f'{value_column}_avg_{window}d'] = df[value_column].rolling(
                window=window, min_periods=1
            ).mean()
            
            # Rolling sum
            df[f'{value_column}_sum_{window}d'] = df[value_column].rolling(
                window=window, min_periods=1
            ).sum()
            
            # Rolling std
            df[f'{value_column}_std_{window}d'] = df[value_column].rolling(
                window=window, min_periods=1
            ).std().fillna(0)
        
        print(f"✅ Created rolling features for {value_column}")
        return df
    
    @staticmethod
    def create_lag_features(df: pd.DataFrame, value_column: str, lags: List[int] = [1, 7, 30]) -> pd.DataFrame:
        """Create lag features"""
        df = df.sort_values('created_at')
        
        for lag in lags:
            df[f'{value_column}_lag_{lag}'] = df[value_column].shift(lag)
        
        # Fill NaN with 0
        for lag in lags:
            df[f'{value_column}_lag_{lag}'].fillna(0, inplace=True)
        
        print(f"✅ Created lag features for {value_column}")
        return df
    
    @staticmethod
    def create_aggregation_features(df: pd.DataFrame, group_by: str, agg_column: str) -> pd.DataFrame:
        """Create aggregation features by group"""
        # Count
        count_df = df.groupby(group_by)[agg_column].count().reset_index()
        count_df.columns = [group_by, f'{agg_column}_count']
        
        # Sum
        sum_df = df.groupby(group_by)[agg_column].sum().reset_index()
        sum_df.columns = [group_by, f'{agg_column}_sum']
        
        # Mean
        mean_df = df.groupby(group_by)[agg_column].mean().reset_index()
        mean_df.columns = [group_by, f'{agg_column}_mean']
        
        # Merge back
        df = df.merge(count_df, on=group_by, how='left')
        df = df.merge(sum_df, on=group_by, how='left')
        df = df.merge(mean_df, on=group_by, how='left')
        
        print(f"✅ Created aggregation features for {agg_column} by {group_by}")
        return df
    
    @staticmethod
    def create_text_features(df: pd.DataFrame, text_column: str) -> pd.DataFrame:
        """Create text-based features"""
        if text_column not in df.columns:
            return df
        
        # Length
        df[f'{text_column}_length'] = df[text_column].str.len().fillna(0)
        
        # Word count
        df[f'{text_column}_word_count'] = df[text_column].str.split().str.len().fillna(0)
        
        # Has numbers
        df[f'{text_column}_has_numbers'] = df[text_column].str.contains(r'\d', na=False).astype(int)
        
        print(f"✅ Created text features for {text_column}")
        return df
    
    @staticmethod
    def create_customer_segment_features(df: pd.DataFrame) -> pd.DataFrame:
        """Create customer segmentation specific features"""
        # RFM features
        df = FeatureEngineering.create_rfm_features(df)
        
        # Customer lifetime value
        df['customer_lifetime_value'] = df['monetary']
        
        # Purchase frequency rate
        df['purchase_frequency'] = df['frequency'] / df['years_active']
        
        # Average days between purchases
        df['avg_days_between_purchases'] = df['recency'] / df['frequency']
        df['avg_days_between_purchases'] = df['avg_days_between_purchases'].replace([np.inf, -np.inf], 0).fillna(0)
        
        print(f"✅ Created customer segment features")
        return df
    
    @staticmethod
    def create_revenue_prediction_features(df: pd.DataFrame) -> pd.DataFrame:
        """Create revenue prediction specific features"""
        # Date features
        df = FeatureEngineering.create_date_features(df, 'created_at')
        
        # Rolling features
        df = FeatureEngineering.create_rolling_features(df, 'total', windows=[7, 30])
        
        # Lag features
        df = FeatureEngineering.create_lag_features(df, 'total', lags=[1, 7])
        
        print(f"✅ Created revenue prediction features")
        return df

# Singleton instance
feature_engineering = FeatureEngineering()
