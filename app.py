from fastapi import FastAPI, HTTPException, Header, Depends, File, UploadFile, Form
from fastapi.logger import logger
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
from fastapi.responses import FileResponse
import gridfs
import io
from pymongo import MongoClient

# Initialize Flask app
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this to the specific domain of your frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

# MongoDB Connection using Motor (asynchronous)
motor_client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URI)
db = motor_client.get_database("nyx")
users_collection = db.get_collection("users")
files_collection = db.get_collection("files")

# MongoDB Connection using PyMongo (synchronous) for GridFS
client = MongoClient(MONGO_URI)
sync_db = client["nyx"]
fs = gridfs.GridFS(sync_db)

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

class FileModel(BaseModel):
    filename: str
    sender_id: str
    recipient_id: str

class ReceivedFileModel(BaseModel):
    id: PyObjectId = Field(alias="_id")
    filename: str
    sender_id: str
    recipient_id: str
    file_id: str
    class Config:
        json_encoders = {ObjectId: str}

class DownloadFileModel(BaseModel):
    filename: str
    content: bytes


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
    logger.info(f"Generated token for user: {user['username']} with token: {token}")
    return {"message": "Login successful", "token": token}

@app.get('/profile', response_model=UserOutModel)
async def profile(token: str = Header(None)):
    payload = verify_jwt(token)
    user_id = payload.get("user_id")
    logger.info(f"User received profile data: {user_id}")
    user = await users_collection.find_one({"_id": ObjectId(user_id)}, {"hashed_password": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    logger.info(f"User received profile data: {user}")
    return user

@app.post('/send_file')
async def send_file(
    token: str = Header(None), 
    recipient_username: str = Form(...), 
    file: UploadFile = File(...)
):
    logger.info(f"Received token: {token}")

    payload = verify_jwt(token)
    sender_id = payload["user_id"]

    recipient = await users_collection.find_one({"username": recipient_username})
    if not recipient:
        raise HTTPException(status_code=400, detail="Recipient user not found")

    # Save file to GridFS
    file_id = fs.put(file.file, filename=file.filename)

    file_data = {
        "file_id": str(file_id),
        "filename": file.filename,
        "sender_id": sender_id,
        "recipient_id": str(recipient["_id"])
    }
    await files_collection.insert_one(file_data)

    return {"message": "File sent successfully!"}

@app.get('/received_files', response_model=List[ReceivedFileModel])
async def received_files(token: str = Header(None)):
    payload = verify_jwt(token)
    user_id = payload.get("user_id")
    logger.info(f"User received files: {user_id}")
    files = await files_collection.find({"recipient_id": user_id}).to_list(length=100)
    return files

@app.get('/download/{file_id}', response_model=DownloadFileModel)
async def download_file(file_id: str):
    file = fs.get(ObjectId(file_id))
    logger.info(f"Downloading file: {file.filename}")
    response = FileResponse(io.BytesIO(file.read()), filename=file.filename, media_type='application/octet-stream')
    return response
if __name__ == '__main__':
    app.run(debug=True)