from flask import Flask, jsonify, request, render_template
from flask_cors import CORS
import modules as db
import setup_db as setup



app = Flask(__name__)

CORS(app)

##app.register_blueprint(users_bp, url_prefix='/api')

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/invoices')
def invoices():
    return render_template('invoices.html')

@app.route('/order')
def orders():
    return render_template('orders.html')

@app.route('/inventory')
def inventory():
    return render_template('inventory.html')




@app.route('/api/invoices', methods=['GET'])
def search_invoices():
    invoice_id = request.args.get('invoice_id')
    order_id = request.args.get('order_id')
    customer_id = request.args.get('customer_id')

    results = db.search_invoice(invoice_id, order_id, customer_id)
    return jsonify(results), 200

@app.route('/api/invoice', methods=['GET'])
def get_invoice():
  
    try:
        items = db.search_invoice()
        return jsonify(items)

    except Exception as e:
        print(f"Error in GET /api/invoice: {e}")
        return jsonify({"error": "Failed to fetch invoice"}), 500


@app.route('/api/invoices', methods=['POST'])
def create_invoices():
    data = request.get_json()
    customer_id = data.get('customer_id')
    order_id = data.get('order_id')
    invoice_status = data.get('invoice_status')

    complete = db.insert_invoice(customer_id, order_id, invoice_status)
    if complete:
        return jsonify({"message" : "Invoice successfully created"}), 201
    else:
        return jsonify({"error" : "failed to create invoice"}), 400




@app.route('/api/invoices/<invoice_id>', methods=['PUT'])
def update_invoices(invoice_id):
    data = request.get_json()
    customer_id = data.get('customer_id')
    order_id = data.get('order_id')
    invoice_status = data.get('invoice_status')

    complete = db.update_invoice(invoice_id, customer_id, order_id, invoice_status)
    if complete:
        return jsonify({"message" : "invoice update complete"}), 200
    else:
        return jsonify({"error" : "invoice could not be updated"}), 400
    



@app.route('/api/invoices/<invoice_id>', methods=['DELETE'])
def delete_invoices(invoice_id):
    complete = db.delete_invoice(invoice_id)
    if complete:
        return jsonify({"message": f"invoice {invoice_id} deleted"}), 200
    else:
        return jsonify({"message" : "invoice not found or deletion failed"}), 400




@app.route('/api/inventory', methods=['POST'])
def create_inventory():
    data = request.get_json()
    pallet_condition = data.get('pallet_condition')
    size = data.get('size')
    inventory_count = data.get('inventory_count')
    price = data.get('price')
    complete = db.insert_inventory(pallet_condition, size, inventory_count, price)
    if complete:
        return jsonify({"message" : "Inventory successfully created"}), 201
    else:
        return jsonify({"error" : "failed to create inventory"}), 400




@app.route('/api/inventory', methods=['GET'])
def get_inventory():
    try:
        # Get the search term from the URL query parameters
        search_term = request.args.get('search')
        
        # Pass the term to the database function
        items = db.get_inventory(search_term)
        
        return jsonify(items)

    except Exception as e:
        print(f"Error in GET /api/inventory: {e}")
        return jsonify({"error": "Failed to fetch inventory"}), 500


@app.route('/api/inventory/<pallet_id>', methods=['DELETE'])
def delete_inventory(pallet_id):
    complete = db.delete_inventory(pallet_id)
    if complete:
        return jsonify({"message": f"inventory {pallet_id} deleted"}), 200
    else:
        return jsonify({"message" : "inventory not found or deletion failed"}), 400




@app.route('/api/inventory/<pallet_id>', methods=['PUT'])
def update_inventory(pallet_id):
    data = request.get_json()
    pallet_condition = data.get('pallet_condition')
    size = data.get('size')
    inventory_count = data.get('inventory_count')
    price = data.get('price')

    complete = db.update_inventory(pallet_id, pallet_condition, size, inventory_count, price)
    if complete:
        return jsonify({"message" : "inventory update complete"}), 200
    else:
        return jsonify({"error" : "inventory could not be updated"}), 400




@app.route('/api/order', methods=['POST'])
def create_order():
    data = request.get_json()
    pallet_id = data.get('pallet_id')
    customer_id = data.get('customer_id')
    order_date = data.get('order_date')
    quantity = data.get('quantity')
    order_price = data.get('price')

    complete = db.insert_order(pallet_id, customer_id, order_date, quantity, order_price)
    if complete:
        return jsonify({"message" : "Order successfully created"}), 201 
    else: 
        return jsonify({"error" : "failed to create order"}), 400




@app.route('/api/order', methods=['GET'])
def search_order():
    order_id = request.args.get('order_id')
    pallet_id = request.args.get('pallet_id')
    customer_id = request.args.get('customer_id')
    
    results = db.view_orders(order_id, pallet_id, customer_id)
    return jsonify(results), 200




@app.route('/api/order/<order_id>', methods=['PUT'])
def update_order(order_id):
    data = request.get_json()
    
    pallet_id = data.get('pallet_id')
    customer_id = data.get('customer_id')
    order_date = data.get('order_date')
    quantity = data.get('quantity')
    order_price = data.get('price')

    complete = db.update_order(order_id, pallet_id, customer_id, order_date, quantity, order_price)
    if complete:
        return jsonify({"message" : "order update complete"}), 200
    else:
        return jsonify({"error" : "order could not be updated"}), 400




@app.route('/api/order/<order_id>', methods=['DELETE'])
def delete_order(order_id):
    complete = db.delete_order(order_id)
    if complete:
        return jsonify({"message": f"order {order_id} deleted"}), 200
    else:
        return jsonify({"message" : "order not found or deletion failed"}), 400

if __name__ == '__main__':

    if(not setup.has_dataBase()):
        setup.create_database()
        setup.create_tables(setup.create_connection())

    app.run(debug=True)
