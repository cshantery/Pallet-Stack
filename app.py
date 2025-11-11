from flask import Flask, jsonify, request, render_template
from flask_cors import CORS
import modules



app = Flask(__name__)
CORS(app)

app.register_blueprint(users_bp, url_prefix='/api')

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/invoices')
def invoices():
    return render_template('invoices.html')

@app.route('/orders')
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

    results = modules.search_invoice(invoice_id, order_id, customer_id)
    return jsonify(results), 200


@app.route('/api/invoices', methods=['POST'])
def create_invoices():
    data = request.get_json()
    invoice_id = data.get('invoice_id')
    customer_id = data.get('customer_id')
    order_id = data.get('order_id')
    order_price = data.get('order_price')

    complete = modules.insert_invoice(invoice_id, customer_id, order_id, order_price)
    if complete:
        return jsonify({"message" : "Invoice successfully created"}), 201
    else:
        return jsonify({"error" : "failed to create invoice"}), 400

@app.route('/api/invoices/<invoice_id>', methods=['PUT'])
def update_invoices(invoice_id):
    data = request.get_json()
    customer_id = data.get('customer_id')
    order_id = data.get('order_id')
    order_price = data.get('order_price')

    complete = modules.update_invoice(invoice_id, customer_id, order_id, order_price)
    if complete:
        return jsonify({"message" : "invoice update complete"}), 200
    else:
        return jsonify({"error" : "invoice could not be updated"}), 400
    

@app.route('/api/invoices/<invoice_id>', methods=['DELETE'])
def delete_invoices(invoice_id):
    complete = modules.delete_invoice(invoice_id)
    if complete:
        return jsonify({"message": f"invoice {invoice_id} deleted"}), 200
    else:
        return jsonify({"message" : "invoice not found or deletion failed"}), 400
    

if __name__ == '__main__':
    app.run(debug=True)
