import mysql.connector
from mysql.connector import Error
import random
import string

# randomly generate ID
def generate_id(length=6):
    chars = string.ascii_uppercase + string.digits
    return ''.join(random.choices(chars, k=length))

#connect to mysql db
def create_connection():
    try:
        connection = mysql.connector.connect(
            host='localhost',
            port=3307,
            user='root',
            password='ICWP',
            database='icwp_db'
        )
        if connection.is_connected():
            print("✅ Connected to MySQL version:", connection.get_server_info())
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
            CREATE TABLE IF NOT EXISTS Customer (
                Customer_ID CHAR(6) PRIMARY KEY,
                Customer_Name VARCHAR(25),
                Phone VARCHAR(25),
                Address VARCHAR(25)
            )
            """,
            """
            CREATE TABLE IF NOT EXISTS Supplier (
                Supplier_ID CHAR(6) PRIMARY KEY,
                Supplier_type VARCHAR(25),
                Supplier_Name VARCHAR(25),
                Supplier_Phone VARCHAR(25),
                Lumber_Price DOUBLE
            )
            """,
            """
            CREATE TABLE IF NOT EXISTS Orders (
                Order_ID CHAR(6) PRIMARY KEY,
                Pallet_ID CHAR(6),
                Lumber_Price DOUBLE,
                Customer_ID CHAR(6),
                Order_Date DATE,
                Quantity INT
            )
            """,
            """
            CREATE TABLE IF NOT EXISTS Shipments (
                Shipment_ID CHAR(6) PRIMARY KEY,
                Order_ID CHAR(6),
                Shipment_Date DATE,
                Shipment_Status VARCHAR(25)
            )
            """,
            """
            CREATE TABLE IF NOT EXISTS invoice (
                Invoice_ID CHAR(6) PRIMARY KEY,
                Order_ID CHAR(6),
                Pallet_ID CHAR(6),
                Order_Price DOUBLE
            )
            """
        ]

        for table in tables:
            cursor.execute(table)
        print("🧱 Tables created successfully!")
    except Error as e:
        print("❌ Table creation failed:", e)

#insert user
def insert_user(connection, username, email, password):
    try:
        cursor = connection.cursor()
        user_id = generate_id()
        query = "INSERT INTO users (id, username, email, password) VALUES (%s, %s, %s, %s)"
        cursor.execute(query, (user_id, username, email, password))
        connection.commit()
        print(f"✅ User `{username}` added with ID {user_id}")
    except Error as e:
        print("❌ Insert failed:", e)

#get users
def get_users(connection):
    try:
        cursor = connection.cursor()
        cursor.execute("SELECT * FROM users")
        rows = cursor.fetchall()
        for row in rows:
            print(row)
    except Error as e:
        print("❌ Fetch failed:", e)


if __name__ == "__main__":
    connected = create_connection()
    if connected:
        create_tables(connected)
        insert_user(connected, "cshantery", "cshantery@email.com", "pass123")
        print("\nAll users:")
        get_users(connected)
        connected.close()
