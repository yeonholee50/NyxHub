from fastapi import FastAPI, HTTPException, Header, Depends, File, UploadFile, Form
from pydantic import BaseModel, Field
from bson import ObjectId
import bcrypt
import jwt
import datetime
from typing import List
import os
import dotenv
from fastapi.middleware.cors import CORSMiddleware
import motor.motor_asyncio
import logging
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
from werkzeug.utils import secure_filename
from fastapi.responses import FileResponse
import shutil
import logging

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads/'
ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

users = {}
files = {}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S',
    handlers=[
        logging.FileHandler('system.log'),  # Log messages to a file
        logging.StreamHandler()             # Log messages to the console
    ]
)

# Load environment variables
dotenv.load_dotenv()

MONGO_URI = os.environ.get("MONGO_URI")
SECRET_KEY = os.environ.get("SECRET_KEY")
ALGORITHM = os.environ.get("ALGORITHM")


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this to the specific domain of your frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB Connection using Motor (asynchronous)
client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URI)
db = client.get_database("nyx")
users_collection = db.get_collection("users")
files_collection = db.get_collection("files")
tokens_collection = db.get_collection("token")

# Helper Functions
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))

def create_jwt(user_id: str) -> str:
    payload = {
        "user_id": user_id,
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    return token

def verify_jwt(token: str) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired.")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token.")

# Models
class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v, field=None):
        if not ObjectId.is_valid(v):
            raise ValueError('Invalid ObjectId')
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, schema, model):
        schema.update(type='string')
        return schema

class UserOutModel(BaseModel):
    id: PyObjectId = Field(alias="_id")
    username: str

    class Config:
        json_encoders = {ObjectId: str}

class SignupModel(BaseModel):
    username: str = Field(..., max_length=50)
    password: str = Field(..., min_length=8)

class LoginModel(BaseModel):
    username: str
    password: str

class UserModel(BaseModel):
    username: str
    hashed_password: str
class FileModel(BaseModel):
    filename: str
    filepath: str
    sender_id: str
    recipient_id: str

# Endpoints
@app.post("/signup")
async def signup(user: SignupModel):
    if await users_collection.find_one({"username": user.username}):
        raise HTTPException(status_code=400, detail="Username is already taken.")

    hashed_password = hash_password(user.password)
    user_data = {
        "username": user.username,
        "hashed_password": hashed_password
    }
    result = await users_collection.insert_one(user_data)
    return {"message": "User registered successfully", "user_id": str(result.inserted_id)}

@app.post("/login")
async def login(credentials: LoginModel):
    user = await users_collection.find_one({"username": credentials.username})
    if not user or not verify_password(credentials.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid username or password.")
    token = create_jwt(str(user["_id"]))
    await tokens_collection.insert_one({"user_id": str(user["_id"]), "generated token": token})
    return {"message": "Login successful", "token": token}

@app.route('/profile', methods=['GET'])
async def profile(token: str = Header(None)):
    await tokens_collection.insert_one({"user_id": str(user["_id"]), "received token": token})
    payload = verify_jwt(token)
    user_id = payload.get("user_id")
    user = await users_collection.find_one({"_id": ObjectId(user_id)}, {"hashed_password": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    return user

@app.route('/send_file', methods=['POST'])
async def send_file(
    token: str = Header(...), 
    recipient_username: str = Form(...), 
    file: UploadFile = File(...)
):
    await tokens_collection.insert_one({"user_id": str(user["_id"]), "received token": token})
    payload = verify_jwt(token)
    sender_id = payload["user_id"]

    recipient = await users_collection.find_one({"username": recipient_username})
    if not recipient:
        raise HTTPException(status_code=400, detail="Recipient user not found")

    filename = secure_filename(file.filename)
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    file_data = {
        "filename": filename,
        "filepath": file_path,
        "sender_id": sender_id,
        "recipient_id": str(recipient["_id"])
    }
    await files_collection.insert_one(file_data)

    return {"message": "File sent successfully!"}

@app.route('/received_files', methods=['GET'])
def received_files(token: str = Header(None)):
    try:
        payload = verify_jwt(token)
    except Exception as e:
        return jsonify({"error": "Invalid token"}), 401
    user_id = payload.get("user_id")
    if not user_id or user_id not in users:
        return jsonify({"error": "User not found"}), 404

    user_files = users[user_id]["files"]
    return jsonify(user_files), 200

@app.route('/download/<filename>', methods=['GET'])
def download_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

if __name__ == '__main__':
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)
    app.run(debug=True)

@app.get("/")
async def root():
    return {"message": "Nyx API is running!"}