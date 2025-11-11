from setup_db import *
from modules import *

def test_db():
    if(not has_dataBase()):
        create_database()
        create_tables(create_connection())
    else: 
        print("Database already exist")

    print("view orders before insert", view_orders())
    insert_order("111111", "222222", 125.50, "444444", "2025/07/11", 50)
    print("view orders after insert", view_orders())
    update_order("111111", "333333")
    print("view orders after update", view_orders())
    delete_order("111111")
    print("view orders after delete order", view_orders())

    if __name__ == "main":
        test_db()