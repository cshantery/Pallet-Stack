# will have sql query functions
#impliment CRUD operations for specified tables

from db import get_db




#create invoice
def insert_invoice(customer_id, order_id, invoice_status):
    connection = get_db()
    cursor = connection.cursor()
   
    try:
        query =  """ INSERT INTO invoice (Customer_ID, Order_ID,  Invoice_Status) VALUES(%s,%s,%s) """
        cursor.execute(query, ( customer_id, order_id, invoice_status))
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
    cursor = connection.cursor(dictionary=True)

    try:
        query = "SELECT * FROM invoice WHERE 1=1"  # 1=1 makes appending conditions easier
        values = []

        if invoice_id != None:
            query += " AND Invoice_ID = %s"
            values.append(invoice_id)

        if order_id != None:
            query += " AND Order_ID = %s"
            values.append(order_id)

        if customer_id != None:
            query += " AND Customer_ID = %s"
            values.append(customer_id)

        cursor.execute(query, tuple(values))
        results = cursor.fetchall()
        return results

    except Exception as e:
        print(" Error searching invoices:", e)
        return []
    finally:
        cursor.close()

    
#update operation for invoice table
def update_invoice(invoice_id, customer_id = None, order_id = None, invoice_status = None):
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

        if invoice_status != None:
            updates.append("Invoice_Status = %s")
            values.append(invoice_status)

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

def auto_fill_invoice(order_id):
    connection = get_db()
    cursor = connection.cursor()

    try:
        query = """SELECT 
                    orders.Order_ID,
                    orders.Customer_ID,
                    orders.Customer_Name
                FROM orders
                Join customers ON orders.Customer_ID = customer.Customer_ID
                WHERE orders.Order_ID = %s; 
                    
                """
        cursor.execute(query, (order_id,))
        connection.commit()

        return row;

    except Exception as e:
        print(" Error auto filling invoice {invoice_id}:", e)
        return False
    finally:
        cursor.close()
    
                
#create order
# Replaced the existing insert_order function

def insert_order(pallet_id, customer_id, date, quantity, price, order_status):
    # 1. Deduct Inventory First
    if not adjust_inventory(pallet_id, -int(quantity)):
        print(f"Failed to deduct inventory for Pallet {pallet_id}")
        return False 

    connection = get_db()
    cursor = connection.cursor()

    try:
        # 2. If deduction succeeded, create the order
        query = """INSERT INTO orders (Pallet_ID,  Customer_ID, Order_Date, Quantity, Order_Price, Order_Status) 
        VALUES (%s,%s,%s,%s,%s,%s)"""
        cursor.execute(query, (pallet_id, customer_id, date, quantity, price, order_status))
        connection.commit()
        return True
    except Exception as e:
        print("Error creating order:", e)
        # 3. CRITICAL: If the order fails, PUT THE INVENTORY BACK
        print("Rolling back inventory deduction...")
        adjust_inventory(pallet_id, int(quantity)) 
        connection.rollback()
        return False
    finally:
        cursor.close()


#orders can be view by order_id, pallet_id, or customer_id
def view_orders(order_id = None, pallet_id = None, customer_id = None):
    connection = get_db()
    cursor = connection.cursor(dictionary=True)

    try:
        query =  """
        SELECT 
            o.Order_ID AS Order_ID,
            o.Pallet_ID AS Pallet_ID,
            o.Customer_ID AS Customer_ID,
            DATE_FORMAT(o.Order_Date, '%Y-%m-%d') AS Order_Date,
            o.Quantity AS Quantity,
            o.Order_Price AS Order_Price,
            o.Order_Status AS Order_Status,
            c.Customer_Name AS Customer_Name
        FROM orders o
        JOIN customer c ON o.Customer_ID = c.Customer_ID
        WHERE 1=1
    """
        values =[]

        if order_id != None:
            query += " AND o.Order_ID = %s"
            values.append(order_id)
        if pallet_id != None:
            query += " AND o.Pallet_ID = %s"
            values.append(pallet_id)
        if customer_id != None:
            query += " AND o.Customer_ID = %s"
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
def update_order(order_id, pallet_id= None, customer_id= None, order_date= None, quantity= None, price=None, order_status=None):
    connection = get_db()
    cursor = connection.cursor()

    try:
        updates = []
        values = []

        if pallet_id != None:
            updates.append("Pallet_ID = %s")
            values.append(pallet_id)

        if customer_id != None: 
            updates.append("Customer_ID = %s")
            values.append(customer_id)
    
        if order_date != None:
            updates.append("Order_Date = %s")
            values.append(order_date)
    
        if quantity != None:
            updates.append("Quantity = %s")
            values.append(quantity)

        if price != None:
            updates.append("Order_Price = %s")
            values.append(price)

        if price != None:
            updates.append("Order_Status = %s")
            values.append(order_status)
            
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

# Delete Order
# Replaced the existing delete_order function
def delete_order(order_id):
    connection = get_db()
    cursor = connection.cursor()

    try:
        # 1. Get the order details BEFORE deleting it
        cursor.execute("SELECT Pallet_ID, Quantity FROM orders WHERE Order_ID = %s", (order_id,))
        order = cursor.fetchone()
        
        if not order:
            print(f"Order {order_id} not found.")
            return False

        # Store these for step 3
        # order is a tuple: (Pallet_ID, Quantity) based on the SELECT above
        pallet_id = order[0] 
        quantity = order[1]

        # 2. Delete the order
        query = "DELETE FROM orders WHERE Order_ID = %s"
        cursor.execute(query, (order_id,))
        
        if cursor.rowcount > 0:
            connection.commit()
            
            # 3. Put the inventory back (add positive quantity)
            adjust_inventory(pallet_id, int(quantity))
            print(f"Restored {quantity} units to Pallet {pallet_id}")
            return True
        else:
            return False
            
    except Exception as e:
        print(f" Error deleting order {order_id}:", e)
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
def get_inventory(search_term=None):
    connection = get_db()
    cursor = connection.cursor(dictionary=True)

    try:
        values = []
        query = "SELECT * FROM pallets"

        # If a search term is provided, filter by condition OR size
        if search_term:
            query += " WHERE Pallet_Condition LIKE %s OR Size LIKE %s"
            # Add wildcards for partial matching
            search_like = f"%{search_term}%"
            values.extend([search_like, search_like])

        query += " ORDER BY pallet_id"
        
        cursor.execute(query, tuple(values))
        results = cursor.fetchall()
        return results
        
    except Exception as e:
        print("Error fetching inventory", e)
        connection.rollback()
        return []  # Return empty list on error
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
        query = f"""UPDATE pallets SET {', '.join(updates)} WHERE Pallet_ID = %s"""
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
        query = "DELETE FROM pallets WHERE Pallet_ID = %s"
        cursor.execute(query, (pallet_id,))
        connection.commit()

        return cursor.rowcount > 0
    
    except Exception as e:
        print(f" Error deleting inventory {pallet_id}:", e)
        connection.rollback()
        return False
    finally: 
        cursor.close()









def insert_customer(customer_id, customer_name, phone, address):
    connection = get_db()
    cursor = connection.cursor()
   
    try:
        query =  """ INSERT INTO customer (Customer_ID, Customer_Name, Phone, Address) VALUES(%s,%s,%s,%s) """
        cursor.execute(query, (customer_id, customer_name, phone, address))
        connection.commit()
        return True
    except Exception as e:
        print("Error creating customer:", e)
        connection.rollback()
        return False
    finally:
        cursor.close()


#read inventory 
def get_customers(search_term=None):
    connection = get_db()
    cursor = connection.cursor(dictionary=True)

    try:
        values = []
        query = "SELECT * FROM customer"

        # If a search term is provided, filter by condition OR size
        if search_term:
            query += " WHERE Customer_ID LIKE %s OR Customer_Name LIKE %s"
            # Add wildcards for partial matching
            search_like = f"%{search_term}%"
            values.extend([search_like, search_like])

        query += " ORDER BY Customer_ID"
        
        cursor.execute(query, tuple(values))
        results = cursor.fetchall()
        return results
        
    except Exception as e:
        print("Error fetching customer", e)
        connection.rollback()
        return []  # Return empty list on error
    finally:
        cursor.close()

#update operation for inventory table
def update_customer(customer_id, customer_name = None, phone = None, address = None):
    connection = get_db()
    cursor = connection.cursor()
      
    try: 
        updates = []
        values = []

        if customer_id != None: 
            updates.append("Customer_ID = %s")
            values.append(customer_id)
        
        if customer_name!= None:
            updates.append("Customer_Name = %s")
            values.append(customer_name)
        
        if phone != None:
            updates.append("Phone = %s")
            values.append(phone)

        if adress != None:
            updates.append("Address = %s")
            values.append(adress)

        if not updates:
            print("No updates.")
            return False

        values.append(customer_id)
        query = f"""UPDATE customer SET {', '.join(updates)} WHERE Customer_ID = %s"""
        cursor.execute(query, tuple(values))
        connection.commit()

        return cursor.rowcount > 0

    except Exception as e:
        print("Error updtating customer:", e)
        connection.rollback()
        return False
    finally: 
        cursor.close()


def delete_customer(customer_id):
    connection = get_db()
    cursor = connection.cursor()

    try:
        query = "DELETE FROM customer WHERE Customer_ID = %s"
        cursor.execute(query, (customer_id,))
        connection.commit()

        return cursor.rowcount > 0
    
    except Exception as e:
        print(f" Error deleting customer {customer_id}:", e)
        connection.rollback()
        return False
    finally: 
        cursor.close()



# Helper Function that updates pallet count

def adjust_inventory(pallet_id, quantity_change):
    """
    Updates the inventory count for a specific pallet.
    quantity_change: negative number to deduct, positive to add.
    """
    connection = get_db()
    cursor = connection.cursor()
    try:
        # Update the specific pallet's count
        query = "UPDATE pallets SET Inventory_Count = Inventory_Count + %s WHERE Pallet_ID = %s"
        cursor.execute(query, (quantity_change, pallet_id))
        connection.commit()
        
        # Return True if a row was actually updated
        return cursor.rowcount > 0
    except Exception as e:
        print("Error adjusting inventory:", e)
        connection.rollback()
        return False
    finally:
        cursor.close()