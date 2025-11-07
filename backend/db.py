import mysql.connector
from mysql.connector import Error

#connect to mysql db
def get_db_connection():
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
        return connection
