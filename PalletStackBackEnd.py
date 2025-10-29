import mysql.connector
from mysql.connector import Error

try:
    connection = mysql.connector.connect(
        host='localhost',      # or 127.0.0.1
        port=3307,             # use 3307 port db is running on
        user='root',
        password='ICWP',   # your root password
        database='icwp_db'       # built-in test DB (you can change later)
    )

    if connection.is_connected():
        db_info = connection.get_server_info()
        print(" Connected to MySQL Server version:", db_info)
        cursor = connection.cursor()
        cursor.execute("SELECT DATABASE();")
        record = cursor.fetchone()
        print(" You are connected to database:", record)

except Error as e:
    print("❌ Error while connecting to MySQL:", e)

finally:
    if 'connection' in locals() and connection.is_connected():
        cursor.close()
        connection.close()
        print(" MySQL connection closed.")
