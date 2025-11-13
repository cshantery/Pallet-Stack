import mysql.connector
from mysql.connector import Error
from setup_db import *

#connect to mysql db
def get_db():
    try:
        connection = mysql.connector.connect(
            host='127.0.0.1',
            port=3306,
            user='root',
            password='Ruby1313!',
            database='icwp_db'
        )
        if connection.is_connected():
            print(" Connected to MySQL version:", connection.server_info)
            return connection
    except Error as e:
        print(" Connection failed:", e)
        

if __name__ == "__main__":
    create_connection()
    create_tables(get_db())