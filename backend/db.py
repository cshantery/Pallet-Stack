import mysql.connector
from mysql.connector import Error
import random
import string

#connect to mysql db
def get_db_connection():
    try:
        connection = mysql.connector.connect(
            host='localhost',
            port=3307,
            user='root',
            password='ICWP',
            database='icwp_db'
        )
        if connection.is_connected():
            print(" Connected to MySQL version:", connection.get_server_info())
            return connection
    except Error as e:
        print("❌ Connection failed:", e)
        return connection
