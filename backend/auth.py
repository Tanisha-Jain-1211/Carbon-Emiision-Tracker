from fastapi import APIRouter, HTTPException, Response, Request
from schemas import RegisterUser, LoginUser
from passlib.hash import bcrypt
from jose import jwt
import os
from database import db

router = APIRouter()
SECRET = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")

@router.post("/api/register")
def register(user: RegisterUser):
    if db.users.find_one({"username": user.username}):
        raise HTTPException(status_code=400, detail="Username already exists")
    hashed = bcrypt.hash(user.password)
    db.users.insert_one({**user.dict(), "password": hashed})
    return {"msg": "User registered"}

@router.post("/api/login")
def login(user: LoginUser, response: Response):
    db_user = db.users.find_one({"username": user.username})
    if not db_user or not bcrypt.verify(user.password, db_user['password']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = jwt.encode({"id": str(db_user['_id']), "name": db_user['name']}, SECRET, algorithm=ALGORITHM)
    response.set_cookie(key="token", value=token, httponly=True)
    return {"msg": "Login successful"}

@router.get("/api/user")
def get_user(request: Request):
    token = request.cookies.get("token")
    if not token:
        raise HTTPException(status_code=401, detail="Not logged in")
    try:
        user_data = jwt.decode(token, SECRET, algorithms=[ALGORITHM])
        return {"name": user_data["name"]}
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")
