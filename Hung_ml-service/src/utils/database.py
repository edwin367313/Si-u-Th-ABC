"""
Database connection utilities for SQL Server
"""

import pymssql
import os
from contextlib import contextmanager
from typing import Dict, List, Any

class Database:
    """SQL Server database connection manager"""
    
    def __init__(self):
        self.host = os.getenv("DB_HOST", "localhost")
        self.port = int(os.getenv("DB_PORT", 1433))
        self.database = os.getenv("DB_NAME", "SieuThiABC")
        self.user = os.getenv("DB_USER", "sa")
        self.password = os.getenv("DB_PASSWORD", "13032004Nghi@")
    
    @contextmanager
    def get_connection(self):
        """Get database connection with context manager"""
        conn = None
        try:
            conn = pymssql.connect(
                server=self.host,
                port=self.port,
                database=self.database,
                user=self.user,
                password=self.password,
                as_dict=True
            )
            yield conn
        except Exception as e:
            print(f"Database connection error: {e}")
            raise
        finally:
            if conn:
                conn.close()
    
    def execute_query(self, query: str, params: tuple = None) -> List[Dict[str, Any]]:
        """Execute SELECT query and return results"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query, params or ())
            results = cursor.fetchall()
            return results
    
    def execute_non_query(self, query: str, params: tuple = None) -> int:
        """Execute INSERT/UPDATE/DELETE query"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query, params or ())
            conn.commit()
            return cursor.rowcount
    
    def get_customers_data(self) -> List[Dict[str, Any]]:
        """Get customer data for segmentation"""
        query = """
            SELECT 
                u.id as user_id,
                COUNT(DISTINCT o.id) as total_orders,
                SUM(o.total) as total_spent,
                AVG(o.total) as avg_order_value,
                DATEDIFF(day, MAX(o.created_at), GETDATE()) as days_since_last_order,
                COUNT(DISTINCT YEAR(o.created_at)) as years_active
            FROM Users u
            LEFT JOIN Orders o ON u.id = o.user_id AND o.order_status = 'delivered'
            WHERE u.role = 'customer'
            GROUP BY u.id
            HAVING COUNT(o.id) > 0
        """
        return self.execute_query(query)
    
    def get_orders_data(self) -> List[Dict[str, Any]]:
        """Get orders data for revenue prediction"""
        query = """
            SELECT 
                o.id,
                o.user_id,
                o.total,
                o.subtotal,
                o.discount,
                o.shipping_fee,
                o.payment_method,
                o.order_status,
                o.created_at,
                DATEPART(year, o.created_at) as year,
                DATEPART(month, o.created_at) as month,
                DATEPART(day, o.created_at) as day,
                DATEPART(weekday, o.created_at) as weekday,
                COUNT(oi.id) as items_count
            FROM Orders o
            LEFT JOIN OrderItems oi ON o.id = oi.order_id
            WHERE o.order_status = 'delivered'
            GROUP BY o.id, o.user_id, o.total, o.subtotal, o.discount, 
                     o.shipping_fee, o.payment_method, o.order_status, o.created_at
            ORDER BY o.created_at DESC
        """
        return self.execute_query(query)
    
    def get_transactions_data(self) -> List[Dict[str, Any]]:
        """Get transaction data for Apriori algorithm"""
        query = """
            SELECT 
                o.id as order_id,
                p.id as product_id,
                p.name as product_name,
                oi.quantity,
                o.created_at
            FROM Orders o
            JOIN OrderItems oi ON o.id = oi.order_id
            JOIN Products p ON oi.product_id = p.id
            WHERE o.order_status = 'delivered'
            ORDER BY o.id
        """
        return self.execute_query(query)
    
    def get_products_data(self) -> List[Dict[str, Any]]:
        """Get products data"""
        query = """
            SELECT 
                p.id,
                p.name,
                p.description,
                p.price,
                p.discount_percent,
                p.stock,
                p.category_id,
                c.name as category_name,
                p.images,
                p.unit,
                p.status
            FROM Products p
            LEFT JOIN Categories c ON p.category_id = c.id
            WHERE p.status = 'active'
        """
        return self.execute_query(query)

# Singleton instance
db = Database()
