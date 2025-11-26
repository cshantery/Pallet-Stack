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

        # The order of these tables matters!
        # Parent tables (pallets, customer) must be created BEFORE Child tables (orders, invoice)
        tables = [

            """
            CREATE TABLE IF NOT EXISTS pallets (
                Pallet_ID INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                Pallet_Condition VARCHAR(25),
                Size VARCHAR(25),
                Inventory_Count INT,
                Price DOUBLE
            )
            """,
            """
            CREATE TABLE IF NOT EXISTS customer (
                Customer_ID INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                Customer_Name VARCHAR(25),
                Phone VARCHAR(25),
                Address VARCHAR(25)
            )
            """,
    
            """
            CREATE TABLE IF NOT EXISTS orders (
                Order_ID INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                Pallet_ID INT,
                Customer_ID INT,
                Order_Date Date,
                Quantity INT,
                FOREIGN KEY (Pallet_ID) REFERENCES pallets(Pallet_ID),
                FOREIGN KEY (Customer_ID) REFERENCES customer(Customer_ID)
                Order_Price DOUBLE
            )
            """,
            """
            CREATE TABLE IF NOT EXISTS shipments (
                Shipment_ID INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                Order_ID INT,
                Shipment_Date DATE,
                Shipment_Status VARCHAR(25),
                FOREIGN KEY (Order_ID) REFERENCES orders(Order_ID)
            )
            """,
            """
            CREATE TABLE IF NOT EXISTS invoice (
                Invoice_ID INT NOT NULL AUTO_INCREMENT PRIMARY KEY, 
                Customer_ID INT,
                Order_ID INT,
                Order_Price DOUBLE,
                Invoice_Status CHAR(25),
                FOREIGN KEY (Customer_ID) REFERENCES customer(Customer_ID),
                FOREIGN KEY (Order_ID) REFERENCES orders(Order_ID)
                Invoice_Status CHAR(25)
            )
            """
        ]

        for table in tables:
            cursor.execute(table)
        connection.commit()
        print(" Tables created successfully!")

        # --- NEW: Apply Foreign Keys to EXISTING tables safely ---
        print(" Checking Foreign Key constraints...")
        
        alter_commands = [
            ("orders", "fk_orders_pallet", "FOREIGN KEY (Pallet_ID) REFERENCES pallets(Pallet_ID)"),
            ("orders", "fk_orders_customer", "FOREIGN KEY (Customer_ID) REFERENCES customer(Customer_ID)"),
            ("shipments", "fk_shipments_order", "FOREIGN KEY (Order_ID) REFERENCES orders(Order_ID)"),
            ("invoice", "fk_invoice_customer", "FOREIGN KEY (Customer_ID) REFERENCES customer(Customer_ID)"),
            ("invoice", "fk_invoice_order", "FOREIGN KEY (Order_ID) REFERENCES orders(Order_ID)")
        ]

        for table_name, constraint_name, sql_def in alter_commands:
            try:
                # Try to add the constraint. If it exists, it throws a specific error we catch.
                query = f"ALTER TABLE {table_name} ADD CONSTRAINT {constraint_name} {sql_def}"
                cursor.execute(query)
                connection.commit()
                print(f"  [SUCCESS] Added constraint {constraint_name} to {table_name}")
            except Error as err:
                if err.errno == 1061: # Duplicate key name
                    pass # Constraint already exists, do nothing
                elif err.errno == 1452: # Data violation
                     print(f"  [WARNING] Could not add {constraint_name}. Existing data violates the rules.")
                else:
                    print(f"  [ERROR] Failed to add {constraint_name}: {err}")

    except Error as e:
        print(" Table creation failed:", e)