import pyodbc
import os

server = 'localhost' 
database = 'DB_SieuThi_Hung' 
username = 'sa' 
password = '123456' 

print(f"Testing connection to {server}...")

try:
    # Try connecting with ODBC Driver 17
    conn_str = f'DRIVER={{ODBC Driver 17 for SQL Server}};SERVER={server};DATABASE={database};UID={username};PWD={password}'
    print(f"Attempting: {conn_str}")
    conn = pyodbc.connect(conn_str)
    print("✅ Connection successful with ODBC Driver 17!")
    conn.close()
except Exception as e:
    print(f"❌ Failed with ODBC Driver 17: {e}")
    
    try:
        # Try connecting with SQL Server Native Client 11.0
        conn_str = f'DRIVER={{SQL Server Native Client 11.0}};SERVER={server};DATABASE={database};UID={username};PWD={password}'
        print(f"Attempting: {conn_str}")
        conn = pyodbc.connect(conn_str)
        print("✅ Connection successful with Native Client 11.0!")
        conn.close()
    except Exception as e2:
        print(f"❌ Failed with Native Client 11.0: {e2}")
        
        try:
            # Try connecting with generic 'SQL Server' driver
            conn_str = f'DRIVER={{SQL Server}};SERVER={server};DATABASE={database};UID={username};PWD={password}'
            print(f"Attempting: {conn_str}")
            conn = pyodbc.connect(conn_str)
            print("✅ Connection successful with generic SQL Server driver!")
            conn.close()
        except Exception as e3:
            print(f"❌ Failed with generic SQL Server driver: {e3}")

