# will have sql query functions
#impliment CRUD operations for specified tables

from db import get_db




#create invoice
def insert_invoice(invoice_id, customer_id, order_id, order_price):
    connection = get_db()
    cursor = connection.cursor()
   
    try:
        query =  """ INSERT INTO invoice (Invoice_ID, Customer_ID, Order_ID, Order_Price) VALUES(%s,%s,%s) """
        cursor.execute(query, (invoice_id, customer_id, order_id, order_price))
        connection.commit()
        return True
    except Exception as e:
        print("Error creating invoice:", e)
        connection.rollback()
        return False
    finally:
        cursor.close()

#read operation for invoice, search by customer id invoice id or order id
def search_invoice(invoice_id = None, order_id = None, customer_id = None):
    connection = get_db()
    cursor = connection.cursor()

    try:
        query = "SELECT * FROM invoice WHERE 1=1"  # 1=1 makes appending conditions easier
        values = []

        if invoice_id != None:
            query += " AND Invoice_ID = %s"
            values.append(invoice_id)

        if order_id != None:
            query += " AND Order_ID = %s"
            values.append(order_id)

        cursor.execute(query, tuple(values))
        results = cursor.fetchall()
        return results

    except Exception as e:
        print(" Error searching invoices:", e)
        return []
    finally:
        cursor.close()

    
#update operation for invoice table
def update_invoice(invoice_id, customer_id = None, order_id = None, order_price = None):
    connection = get_db()
    cursor = connection.cursor()

    try:
        updates = []
        values = []

        if customer_id != None:
            updates.append("Customer_ID = %s")
            values.append(customer_id)

        if order_id != None:
            updates.append("Order_ID = %s")
            values.append(order_id)

        if order_price != None:
            updates.append("Order_Price = %s")
            values.append(order_price)

        if not updates:
            return False
        
        values.append(invoice_id)

        query = f"""UPDATE invoice SET {', '.join(updates)} WHERE Invoice_ID = %s"""
        cursor.execute(query, tuple(values))
        connection.commit()

        #return true if any rows were updated
        return cursor.rowcount > 0

    except Exception as e:
        print("Error updating invoice:", e)
        connection.rollback()
        return False
    finally:
        cursor.close()



def delete_invoice(invoice_id):
    connection = get_db()
    cursor = connection.cursor()

    try:
        query = "DELETE FROM invoice WHERE Invoice_ID = %s"
        cursor.execute(query, (invoice_id,))
        connection.commit()
        
        #return true if at least one row was deleted
        return cursor.rowcount > 0  
    
    except Exception as e:
        print(" Error deleting invoice {invoice_id}:", e)
        connection.rollback()
        return False
    finally:
        cursor.close()


#create order
def insert_order(order_id, pallet_id, customer_id, lumber_price, date, quantity):
    connection = get_db()
    cursor = connection.cursor()

    try:
        query = """INSERT INTO orders (Order_ID, Pallet_ID, Lumber_Price, Customer_ID, Order_Date, Quantity) 
        VALUES (%s,%s,%s,%s,%s,%s,)"""
        cursor.execute(query, (order_id, pallet_id, customer_id, lumber_price, date, quantity))
        connection.commit()
        return True
    except Exception as e:
        print("Error creating order:", e)
        connection.rollback()
        return False
    finally:
        cursor.close()


#orders can be view by order_id, pallet_id, or customer_id
def view_orders(order_id = None, pallet_id = None, customer_id = None):
    connection = get_db()
    cursor = connection.cursor()

    try:
        query = "SELECT * FROM orders WHERE 1=1"
        values =[]

        if order_id != None:
            query += " AND Order_ID = %s"
            values.append(order_id)
        if pallet_id != None:
            query += " AND Pallet_ID = %s"
            values.append(pallet_id)
        if customer_id != None:
            query += " AND Customer_ID = %s"
            values.append(customer_id)

        cursor.execute(query, tuple(values))
        results = cursor.fetchall()
        return results
    except Exception as e:
        print(" Error searching orders:", e)
        return []
    finally:
        cursor.close()


#Update orders table
def update_order(order_id, pallet_id= None, lumber_price= None, customer_id= None, order_date= None, quantity= None ):
    connection = get_db()
    cursor = connection.cursor()

    try:
        updates = []
        values = []

        if pallet_id != None:
            updates.append("Pallet_ID = %s")
            values.append(pallet_id)

        if lumber_price != None:
            updates.append("Lumber_Price = %s")
            values.append(lumber_price)
        
        if customer_id != None: 
            updates.append("Customer_ID = %s")
            values.append(customer_id)
    
        if order_date != None:
            updates.append("Order_Date = %s")
            values.append(order_date)
    
        if quantity != None:
            updates.append("Quantity = %s")
            values.append(quantity)
            
        if not updates:
                print("No updates.")
                return False

        values.append(order_id)
        query = f"""UPDATE orders SET {', '.join(updates)} WHERE Order_ID = %s"""
        cursor.execute(query, tuple(values))
        connection.commit()

        return cursor.rowcount > 0
    except Exception as e:
        print("Error updating inventory:", e)
        connection.rollback()
        return False
    finally: 
        cursor.close()

def delete_order(order_id):
    connection = get_db()
    cursor = connection.cursor()

    try:
        query = "DELETE FROM orders WHERE Order_ID = %s"
        cursor.execute(query, (order_id,))
        connection.commit()
        
        #return true if at least one row was deleted
        return cursor.rowcount > 0  
    
    except Exception as e:
        print(" Error deleting order {order_id}:", e)
        connection.rollback()
        return False
    finally:
        cursor.close()


#create inventory
def insert_inventory(pallet_condition, size, inventory_count, price):
    connection = get_db()
    cursor = connection.cursor()
   
    try:
        query =  """ INSERT INTO pallets (Pallet_Condition, Size, Inventory_Count, Price) VALUES(%s,%s,%s,%s) """
        cursor.execute(query, (pallet_condition, size, inventory_count, price))
        connection.commit()
        return True
    except Exception as e:
        print("Error creating inventory:", e)
        connection.rollback()
        return False
    finally:
        cursor.close()

#read inventory 
def get_inventory():
    connection = get_db()
    cursor = connection.cursor(dictionary=True)

    try:
        query = """ SELECT * FROM pallets ORDER BY pallet_id"""
        cursor.execute(query)
        results = cursor.fetchall()
        return results
    except Exception as e:
        print("Error fetching inventory", e)
        cconnection.rollback()
        return False
    finally:
        cursor.close()
   


#update operation for inventory table
def update_inventory(pallet_id, pallet_condition=None, size= None, inventory_count= None, price= None):
    connection = get_db()
    cursor = connection.cursor()
      
    try: 
        updates = []
        values = []

        if pallet_condition != None: 
            updates.append("Pallet_Condition = %s")
            values.append(pallet_condition)
        
        if size != None:
            updates.append("Size = %s")
            values.append(size)
        
        if inventory_count != None:
            updates.append("Inventory_Count = %s")
            values.append(inventory_count)

        if price != None:
            updates.append("Price = %s")
            values.append(price)

        if not updates:
            print("No updates.")
            return False

        values.append(pallet_id)
        query = f"""UPDATE Inevntory SET {', '.join(updates)} WHERE Pallet_ID = %s"""
        cursor.execute(query, tuple(values))
        connection.commit()

        return cursor.rowcount > 0

    except Exception as e:
        print("Error updtating inventory:", e)
        connection.rollback()
        return False
    finally: 
        cursor.close()


def delete_inventory(pallet_id):
    connection = get_db()
    cursor = connection.cursor()

    try:
        query = "DELETE FROM inventory WHERE Pallet_ID = %s"
        cursor.execute(query, (pallet_id,))
        connection.commit()

        return cursor.rowcount > 0
    
    except Exception as e:
        print(f" Error deleting inventory {pallet_id}:", e)
        connection.rollback()
        return False
    finally: 
        cursor.close()

