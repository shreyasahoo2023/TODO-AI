import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
import certifi
from dotenv import load_dotenv
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime
from functools import wraps
from bson.objectid import ObjectId
import ssl

# Disable SSL certificate verification
import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# ---------------- LOAD ENV ----------------
load_dotenv()

app = Flask(__name__)

# ---------------- CORS ----------------
CORS(app, origins=[
    "http://localhost:5173",
    "https://shreya-todo.vercel.app"
])

# ---------------- DATABASE ----------------
MONGO_URI = os.getenv("MONGO_URI")
try:
    client = MongoClient(MONGO_URI, tlsInsecure=True, serverSelectionTimeoutMS=10000, connectTimeoutMS=10000)
    # Force a connection to validate it works
    client.admin.command('ping')
    print("[OK] MongoDB connected successfully")
except Exception as e:
    print(f"[ERROR] MongoDB connection failed: {e}")
    print("Using mock database for testing")
    client = None

db = client["todo_db"] if client else None

tasks_collection = db["tasks"] if db else None
users_collection = db["users"] if db else None

# Mock in-memory storage if MongoDB is not available
mock_users = {}
mock_tasks = {}

# ---------------- ENV VARIABLES ----------------
JWT_SECRET = os.getenv("JWT_SECRET", "fallback-secret")

# ---------------- ROOT ----------------
@app.route("/")
def home():
    return "Backend Running 🚀"

# ---------------- LOGIN ----------------
@app.route('/auth/login', methods=['POST'])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    if users_collection:
        user = users_collection.find_one({"email": email})
    else:
        user = mock_users.get(email)

    if not user or not check_password_hash(user.get("password_hash", ""), password):
        return jsonify({"error": "Invalid credentials"}), 401

    token = jwt.encode({
        "email": email,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    }, JWT_SECRET, algorithm="HS256")

    return jsonify({
        "user": {"email": email},
        "token": token
    })


# ---------------- REGISTER ----------------
@app.route('/auth/register', methods=['POST'])
def register():
    data = request.json
    email = data.get("email")
    name = data.get("name")
    password = data.get("password")

    if users_collection:
        if users_collection.find_one({"email": email}):
            return jsonify({"error": "User already exists"}), 409
        users_collection.insert_one({
            "email": email,
            "name": name,
            "password_hash": generate_password_hash(password)
        })
    else:
        if email in mock_users:
            return jsonify({"error": "User already exists"}), 409
        mock_users[email] = {
            "email": email,
            "name": name,
            "password_hash": generate_password_hash(password)
        }

    return jsonify({"message": "Registered successfully"})





# ---------------- AUTH DECORATOR ----------------
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith("Bearer "):
                token = auth_header.split(" ")[1]

        if not token:
            return jsonify({'error': 'Token is missing!'}), 401

        try:
            data = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
            current_user_email = data['email']
        except:
            return jsonify({'error': 'Token is invalid!'}), 401

        return f(current_user_email, *args, **kwargs)

    return decorated


# ---------------- TASK ROUTES ----------------

@app.route('/tasks', methods=['GET'])
@token_required
def get_tasks(current_user_email):
    if tasks_collection:
        tasks = list(tasks_collection.find({"user_email": current_user_email}))
        # Convert ObjectId to string for JSON serialization
        for task in tasks:
            task['id'] = str(task['_id'])
            del task['_id']
    else:
        tasks = [task for task in mock_tasks.values() if task.get("user_email") == current_user_email]
    return jsonify(tasks)


@app.route('/add', methods=['POST'])
@token_required
def add_task(current_user_email):
    data = request.json
    new_task = {
        "title": data.get("title"),
        "dueDate": data.get("dueDate"),
        "order": data.get("order", 0),
        "completed": False,
        "user_email": current_user_email,
        "created_at": datetime.datetime.utcnow()
    }
    
    if tasks_collection:
        result = tasks_collection.insert_one(new_task)
        new_task['id'] = str(result.inserted_id)
        del new_task['_id']
    else:
        task_id = str(len(mock_tasks) + 1)
        new_task['id'] = task_id
        mock_tasks[task_id] = new_task
    
    return jsonify(new_task)


@app.route('/update/<task_id>', methods=['PUT'])
@token_required
def update_task(current_user_email, task_id):
    data = request.json
    update_data = {}
    
    if 'completed' in data:
        update_data['completed'] = data['completed']
    if 'order' in data:
        update_data['order'] = data['order']
    if 'title' in data:
        update_data['title'] = data['title']

    if tasks_collection:
        result = tasks_collection.update_one(
            {"_id": ObjectId(task_id), "user_email": current_user_email},
            {"$set": update_data}
        )
        if result.matched_count == 0:
            return jsonify({"error": "Task not found"}), 404
    else:
        if task_id not in mock_tasks or mock_tasks[task_id].get("user_email") != current_user_email:
            return jsonify({"error": "Task not found"}), 404
        mock_tasks[task_id].update(update_data)

    return jsonify({"message": "Updated successfully"})


@app.route('/delete/<task_id>', methods=['DELETE'])
@token_required
def delete_task(current_user_email, task_id):
    if tasks_collection:
        result = tasks_collection.delete_one({"_id": ObjectId(task_id), "user_email": current_user_email})
        if result.deleted_count == 0:
            return jsonify({"error": "Task not found"}), 404
    else:
        if task_id not in mock_tasks or mock_tasks[task_id].get("user_email") != current_user_email:
            return jsonify({"error": "Task not found"}), 404
        del mock_tasks[task_id]

    return jsonify({"message": "Deleted successfully"})


# ---------------- RUN ----------------
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)