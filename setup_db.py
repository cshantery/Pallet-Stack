import mysql.connector
from mysql.connector import Error

import string

def has_dataBase():
    try:
        connection = connection = mysql.connector.connect(
            host='127.0.0.1',
            port=3306,
            user='root',
            password='Ruby1313!'
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
        print(" Connection failed:", e)
    finally:
        cursor.close()
        connection.close()

def create_database():
    try:
        connection = connection = mysql.connector.connect(
            host='127.0.0.1',
            port=3306,
            user='root',
            password='Ruby1313!'
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
            host='127.0.0.1',
            port=3306,
            user='root',
            password='Ruby1313!',
            database='icwp_db'
        )
        if connection.is_connected():
            print(" Connected to MySQL version:", connection.get_server_info())
            return connection
    except Error as e:
        print(" Connection failed:", e)
        return None

#create tables 
def create_tables(connection):
    try:
        cursor = connection.cursor()

        tables = [
            # 1. Pallets Table (No Foreign Keys)
            """
            CREATE TABLE IF NOT EXISTS pallets (
                Pallet_ID INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                Pallet_Condition VARCHAR(25),
                Size VARCHAR(25),
                Inventory_Count INT,
                Price DOUBLE
            )
            """,
            # 2. Customer Table (No Foreign Keys)
            """
            CREATE TABLE IF NOT EXISTS customer (
                Customer_ID INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                Customer_Name VARCHAR(25),
                Phone VARCHAR(25),
                Address VARCHAR(25)
            )
            """,
            # 3. Orders Table (Links to Pallets and Customer)
            """
            CREATE TABLE IF NOT EXISTS orders (
                Order_ID INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                Pallet_ID INT,
                Customer_ID INT,
                Order_Date Date,
                Quantity INT,
                Order_Price DOUBLE,
                FOREIGN KEY (Pallet_ID) REFERENCES pallets(Pallet_ID),
                FOREIGN KEY (Customer_ID) REFERENCES customer(Customer_ID)
            )
            """,
            # 4. Shipments Table
            """
            CREATE TABLE IF NOT EXISTS shipments (
                Shipment_ID INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                Order_ID INT,
                Shipment_Date DATE,
                Shipment_Status VARCHAR(25)
            )
            """,
            # 5. Invoice Table (Links to Customer and Orders)
            """
            CREATE TABLE IF NOT EXISTS invoice (
                Invoice_ID INT NOT NULL AUTO_INCREMENT PRIMARY KEY, 
                Customer_ID INT,
                Order_ID INT,
                Invoice_Status CHAR(25),
                FOREIGN KEY (Customer_ID) REFERENCES customer(Customer_ID),
                FOREIGN KEY (Order_ID) REFERENCES orders(Order_ID)
            )
            """
        ]

        for table in tables:
            cursor.execute(table)
        connection.commit()
        print(" Tables created successfully!")
    except Error as e:
        print(" Table creation failed:", e)
        