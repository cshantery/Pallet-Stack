import mysql.connector
from mysql.connector import Error
import random
import string

# randomly generate ID
def generate_id(length=6):
    chars = string.ascii_uppercase + string.digits
    return ''.join(random.choices(chars, k=length))

def has_dataBase():
    try:
        connection = connection = mysql.connector.connect(
            host='localhost',
            port=3306,
            user='root',
            password=''
        )
        if connection.is_connected():
            cursor = connection.cursor()
            db_name = "icwp_db"
            cursor.execute("SHOW DATABASES")

            databases =[db[0] for db in cursor.fetchall()]
            if db_name in databases:
                return True
            else:
                return False
    except Error as e:
        print("❌ Connection failed:", e)
    finally:
        cursor.close()
        connection.close()

def create_database():
    try:
        connection = connection = mysql.connector.connect(
            host='localhost',
            port=3306,
            user='root',
            password=''
        )
        cursor = connection.cursor()
        cursor.execute("CREATE DATABASE IF NOT EXISTS icwp_db")
        print("Database created successfully")
    except Error as e:
        print("Database connection failed:", e)
    finally:
        connection.close()
        

#connect to mysql db
def create_connection():
    try:
        connection = mysql.connector.connect(
            host='localhost',
            port=3306,
            user='root',
            password='',
            database='icwp_db'
        )
        if connection.is_connected():
            print(" Connected to MySQL version:", connection.get_server_info())
            return connection
    except Error as e:
        print("❌ Connection failed:", e)
        return None

#create tables 
def create_tables(connection):
    try:
        cursor = connection.cursor()

        tables = [
            """
            CREATE TABLE IF NOT EXISTS users (
                id CHAR(6) PRIMARY KEY,
                username VARCHAR(50) NOT NULL,
                email VARCHAR(100),
                password VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """,
            """
            CREATE TABLE IF NOT EXISTS pallets (
                Pallet_ID CHAR(6) PRIMARY KEY,
                Pallet_Condition VARCHAR(25),
                Size VARCHAR(25),
                Inventory_Count INT,
                Price DOUBLE
            )
            """,
            """
            CREATE TABLE IF NOT EXISTS customer (
                Customer_ID CHAR(6) PRIMARY KEY,
                Customer_Name VARCHAR(25),
                Phone VARCHAR(25),
                Address VARCHAR(25)
            )
            """,
            """
            CREATE TABLE IF NOT EXISTS supplier (
                Supplier_ID CHAR(6) PRIMARY KEY,
                Supplier_type VARCHAR(25),
                Supplier_Name VARCHAR(25),
                Supplier_Phone VARCHAR(25),
                Lumber_Price DOUBLE
            )
            """,
            """
            CREATE TABLE IF NOT EXISTS orders (
                Order_ID CHAR(6) PRIMARY KEY,
                Pallet_ID CHAR(6),
                Lumber_Price DOUBLE,
                Customer_ID CHAR(6),
                Order_Date DATE,
                Quantity INT
            )
            """,
            """
            CREATE TABLE IF NOT EXISTS shipments (
                Shipment_ID CHAR(6) PRIMARY KEY,
                Order_ID CHAR(6),
                Shipment_Date DATE,
                Shipment_Status VARCHAR(25)
            )
            """,
            """
            CREATE TABLE IF NOT EXISTS invoice (
                Invoice_ID CHAR(6) PRIMARY KEY,
                Customer_ID CHAR(6),
                Order_ID CHAR(6),
                Order_Price DOUBLE
            )
            """
        ]

        for table in tables:
            cursor.execute(table)
        print("🧱 Tables created successfully!")
    except Error as e:
        print("❌ Table creation failed:", e)

