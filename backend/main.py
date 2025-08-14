from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from pymongo import MongoClient
from bson import ObjectId
import hashlib
import secrets
from datetime import datetime, time

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = MongoClient("mongodb://localhost:27017")
db = client.carbon_tracker
users_collection = db.users
sessions = {}

class RegisterUser(BaseModel):
    name: str
    username: str
    password: str
    mobile: str

class LoginUser(BaseModel):
    username: str
    password: str

class FoodLog(BaseModel):
    date: str
    items: list[str]

class TravelLog(BaseModel):
    date: str
    mode: str
    distance_km: float

class ElectricityLog(BaseModel):
    date: str
    units: float 

class LifestyleLog(BaseModel):
    date: str
    habits: list[str]  



def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

@app.post("/api/register")
def register(user: RegisterUser):
    if users_collection.find_one({"username": user.username}):
        raise HTTPException(status_code=400, detail="Username already exists")
    users_collection.insert_one({
    "name": user.name,
    "username": user.username,
    "password": hash_password(user.password),
    "mobile": user.mobile,
    "food_logs": [],
    "travel_logs": [],
    "electricity_logs": [],
    "lifestyle_logs": []
})

    return {"message": "User registered successfully"}

@app.post("/api/login")
def login(user: LoginUser, request: Request):
    db_user = users_collection.find_one({"username": user.username})
    if not db_user or db_user["password"] != hash_password(user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = secrets.token_hex(16)
    sessions[token] = str(db_user["_id"])
    response = JSONResponse({"message": "Login successful"})
    response.set_cookie(key="session", value=token, httponly=True)
    return response

@app.get("/api/user")
def get_user(request: Request):
    token = request.cookies.get("session")
    if not token or token not in sessions:
        raise HTTPException(status_code=401, detail="Unauthorized")
    user_id = sessions[token]
    user = users_collection.find_one({"_id": ObjectId(user_id)}, {"password": 0})
    if user:
        user["_id"] = str(user["_id"])
        return user
    raise HTTPException(status_code=404, detail="User not found")

@app.post("/api/food")
def log_food(data: FoodLog, request: Request):
    token = request.cookies.get("session")
    if not token or token not in sessions:
        raise HTTPException(status_code=401, detail="Unauthorized")
    user_id = sessions[token]
    users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$push": {"food_logs": {"date": data.date, "items": data.items}}}
    )
    return {"message": "Food log added"}

@app.get("/api/food/month/{month}")
def get_monthly_food(month: str, request: Request):
    token = request.cookies.get("session")
    if not token or token not in sessions:
        raise HTTPException(status_code=401, detail="Unauthorized")
    user_id = sessions[token]
    user = users_collection.find_one({"_id": ObjectId(user_id)})
    food_data = [entry for entry in user.get("food_logs", []) if entry['date'].startswith(month)]
    return food_data

# Travel Log
@app.post("/api/travel")
def log_travel(data: TravelLog, request: Request):
    print("🔥 Travel POST hit")
    print("Cookies received:", request.cookies)
    print("Travel data received:", data)

    token = request.cookies.get("session")
    if not token:
        print("❌ No session cookie found")
    elif token not in sessions:
        print("❌ Invalid session token:", token)
    else:
        print("✅ Authenticated user:", sessions[token])

    if not token or token not in sessions:
        raise HTTPException(status_code=401, detail="Unauthorized")

    user_id = sessions[token]
    result = users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$push": {"travel_logs": {
            "date": data.date,
            "mode": data.mode,
            "distance_km": data.distance_km
        }}}
    )

    print("✅ MongoDB update result:", result.modified_count)

    return {"message": "Travel log added"}


@app.get("/api/travel/month/{month}")
def get_monthly_travel(month: str, request: Request):
    token = request.cookies.get("session")
    if not token or token not in sessions:
        raise HTTPException(status_code=401, detail="Unauthorized")
    user_id = sessions[token]
    user = users_collection.find_one({"_id": ObjectId(user_id)})
    travel_data = [entry for entry in user.get("travel_logs", []) if entry['date'].startswith(month)]
    return travel_data

# Electricity Log
@app.post("/api/electricity")
def log_electricity(data: ElectricityLog, request: Request):
    token = request.cookies.get("session")
    if not token or token not in sessions:
        raise HTTPException(status_code=401, detail="Unauthorized")
    user_id = sessions[token]
    users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$push": {"electricity_logs": {"date": data.date, "units": data.units}}}
    )
    return {"message": "Electricity log added"}

@app.get("/api/electricity/month/{month}")
def get_monthly_electricity(month: str, request: Request):
    token = request.cookies.get("session")
    if not token or token not in sessions:
        raise HTTPException(status_code=401, detail="Unauthorized")
    user_id = sessions[token]
    user = users_collection.find_one({"_id": ObjectId(user_id)})
    electricity_data = [entry for entry in user.get("electricity_logs", []) if entry['date'].startswith(month)]
    return electricity_data

# Lifestyle Log
@app.post("/api/lifestyle")
def log_lifestyle(data: LifestyleLog, request: Request):
    token = request.cookies.get("session")
    if not token or token not in sessions:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    user_id = sessions[token]
    # Store the list of habits in the lifestyle_logs
    users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$push": {"lifestyle_logs": {"date": data.date, "habits": data.habits}}}
    )
    return {"message": "Lifestyle log added"}



@app.get("/api/lifestyle/month/{month}")
def get_monthly_lifestyle(month: str, request: Request):
    token = request.cookies.get("session")
    if not token or token not in sessions:
        raise HTTPException(status_code=401, detail="Unauthorized")
    user_id = sessions[token]
    user = users_collection.find_one({"_id": ObjectId(user_id)})
    lifestyle_data = [entry for entry in user.get("lifestyle_logs", []) if entry['date'].startswith(month)]
    return lifestyle_data

@app.get("/api/summary/{month}")
def get_summary(month: str, request: Request):
    token = request.cookies.get("session")
    if not token or token not in sessions:
        raise HTTPException(status_code=401, detail="Unauthorized")
    user_id = sessions[token]
    user = users_collection.find_one({"_id": ObjectId(user_id)})
    
    def filter_by_month(logs, date_key="date"):
        return [x for x in logs if x[date_key].startswith(month)]
    
    food = filter_by_month(user.get("food_logs", []))
    travel = filter_by_month(user.get("travel_logs", []))
    electricity = filter_by_month(user.get("electricity_logs", []))
    lifestyle = filter_by_month(user.get("lifestyle_logs", []))

    # Basic score system
    green_score = 100
    green_score -= len(food) * 0.5
    green_score -= sum([t["distance_km"] for t in travel]) * 0.1
    green_score -= sum([e["units"] for e in electricity]) * 0.2
    green_score += len(lifestyle) * 1.5

    return {
        "food": food,
        "travel": travel,
        "electricity": electricity,
        "lifestyle": lifestyle,
        "green_score": round(green_score, 2)
    }

@app.get("/api/leaderboard")
def get_leaderboard(request: Request):
    leaderboard = []
    for user in users_collection.find():
        total = 0
        for entry in user.get("food_logs", []):
            total += 2.5 * len(entry.get("items", []))
        for entry in user.get("travel_logs", []):
            total += entry.get("distance_km", 0) * 0.21
        for entry in user.get("electricity_logs", []):
            total += entry.get("units", 0) * 0.85
        for entry in user.get("lifestyle_logs", []):
            total += 1  # Assuming 1 unit per lifestyle log

        leaderboard.append({
            "username": user["username"],
            "name": user.get("name", ""),
            "total_emission": round(total, 2)
        })

    sorted_board = sorted(leaderboard, key=lambda x: x["total_emission"])[:10]
    return sorted_board



