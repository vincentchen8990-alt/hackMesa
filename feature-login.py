from flask import Flask, request, jsonify
import sqlite3
from flask_bcrypt import Bcrypt

app = Flask(__name__)
bcrypt = Bcrypt(app)

# Initialize the database and create users table if it doesn't exist
def init_db():
    conn = sqlite3.connect('users.db')
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT
        )
    ''')
    conn.commit()
    conn.close()

init_db()

# User registration endpoint
@app.route('/register', methods=['POST'])
def register():
    # Get JSON data from request
    data = request.json

    username = data.get('username')
    username = username.lower()
    password = data.get('password')

    # Validate input
    if not username or not password:
        return jsonify({"error": "Missing username or password"}), 400

    # Hash the password before storing
    hashed_pw = bcrypt.generate_password_hash(password).decode('utf-8')

    try:
        conn = sqlite3.connect('users.db')
        c = conn.cursor()

        # Insert new user into database
        c.execute(
            "INSERT INTO users (username, password) VALUES (?, ?)", 
            (username, hashed_pw)
        )

        conn.commit()
        conn.close()

        return jsonify({"message": "User registered successfully"})

    except sqlite3.IntegrityError:
        # Handle duplicate username
        return jsonify({"error": "Username already exists"}), 400

# Run the app
if __name__ == '__main__':
    app.run(debug=True)