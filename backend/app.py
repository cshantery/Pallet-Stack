from flask import Flask
from flask_cors import CORS
from backend.routes.users import users_bp
from backend.test import test_db

app = Flask(__name__)
CORS(app)

app.register_blueprint(users_bp, url_prefix='/api')

if __name__ == '__main__':
    #test_db()
    #print()
    
    app.run(debug=True)
