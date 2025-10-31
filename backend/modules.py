# will have sql query functions
#impliment CRUD operations for specified tables

from backend.db import get_db
import uuid


#this will genrate a randome unique ID .hex 5 will take only the first 5 digits
def generate_invoice_id():
    return "INV" + str(uuid.uuid4().hex[:5]).upper()



#create invoice
def insert_invoice(customer_id, order_id, order_price):
    connection = get_db()
    cursor = connection.cursor()
    invoice_id = generate_invoice_id()
    try:
        query =  """ INSERT INTO invoices (Invoice_ID, Customer_ID, Order_ID, Order_Price) VALUES(%s,%s,%s) """
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
        query = "SELECT * FROM invoices WHERE 1=1"  # 1=1 makes appending conditions easier
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

        query = """UPDATE invoices SET {', '.join(updates)} WHERE Invoice_ID = %s"""
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
        query = "DELETE FROM invoices WHERE Invoice_ID = %s"
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
