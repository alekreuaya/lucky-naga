from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import random
import string
import jwt
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, timezone, timedelta

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'admin123')
JWT_SECRET = os.environ.get('JWT_SECRET', 'lucky-wheel-secret-key-2024')

app = FastAPI()
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# --- Models ---
class AdminLogin(BaseModel):
    password: str

class GenerateCodesRequest(BaseModel):
    count: int = 1
    prefix: str = ""

class PrizeItem(BaseModel):
    label: str
    points: int
    color: str
    probability: float = 1.0

class UpdatePrizesRequest(BaseModel):
    prizes: List[PrizeItem]

class SpinRequest(BaseModel):
    username: str
    redeem_code: str

# --- Auth helpers ---
def create_token(data: dict):
    payload = {**data, "exp": datetime.now(timezone.utc) + timedelta(hours=24)}
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

async def verify_admin(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=["HS256"])
        if payload.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Not authorized")
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# --- Seed default prizes ---
DEFAULT_PRIZES = [
    {"label": "1000 Points", "points": 1000, "color": "#8B5CF6", "probability": 0.05},
    {"label": "500 Points", "points": 500, "color": "#F472B6", "probability": 0.10},
    {"label": "250 Points", "points": 250, "color": "#06B6D4", "probability": 0.15},
    {"label": "100 Points", "points": 100, "color": "#10B981", "probability": 0.20},
    {"label": "75 Points", "points": 75, "color": "#F59E0B", "probability": 0.15},
    {"label": "50 Points", "points": 50, "color": "#EF4444", "probability": 0.15},
    {"label": "25 Points", "points": 25, "color": "#3B82F6", "probability": 0.10},
    {"label": "10 Points", "points": 10, "color": "#EC4899", "probability": 0.10},
]

@app.on_event("startup")
async def seed_prizes():
    count = await db.prizes.count_documents({})
    if count == 0:
        for i, prize in enumerate(DEFAULT_PRIZES):
            prize["id"] = f"prize_{i}"
            prize["created_at"] = datetime.now(timezone.utc).isoformat()
        await db.prizes.insert_many(DEFAULT_PRIZES)
        logger.info("Seeded default prizes")

# --- Public Routes ---
@api_router.get("/")
async def root():
    return {"message": "Lucky Wheel API"}

@api_router.get("/prizes")
async def get_prizes():
    prizes = await db.prizes.find({}, {"_id": 0}).to_list(100)
    return {"prizes": prizes}

@api_router.get("/history")
async def get_history():
    history = await db.draw_history.find({}, {"_id": 0}).sort("drawn_at", -1).to_list(50)
    return {"history": history}

@api_router.post("/spin")
async def spin_wheel(req: SpinRequest):
    user = await db.users.find_one(
        {"username": req.username, "redeem_code": req.redeem_code},
        {"_id": 0}
    )
    if not user:
        raise HTTPException(status_code=400, detail="Invalid username or redeem code")
    if user.get("is_used"):
        raise HTTPException(status_code=400, detail="This redeem code has already been used")

    prizes = await db.prizes.find({}, {"_id": 0}).to_list(100)
    if not prizes:
        raise HTTPException(status_code=500, detail="No prizes configured")

    weights = [p.get("probability", 1.0) for p in prizes]
    total = sum(weights)
    weights = [w / total for w in weights]

    chosen = random.choices(prizes, weights=weights, k=1)[0]

    now = datetime.now(timezone.utc).isoformat()
    record = {
        "username": req.username,
        "prize_label": chosen["label"],
        "prize_points": chosen["points"],
        "prize_color": chosen["color"],
        "drawn_at": now,
    }
    await db.draw_history.insert_one({**record, "_id_track": req.username})

    await db.users.update_one(
        {"username": req.username, "redeem_code": req.redeem_code},
        {"$set": {"is_used": True, "used_at": now}}
    )

    return {"prize": chosen, "message": f"Congratulations! You won {chosen['label']}!"}

# --- Admin Routes ---
@api_router.post("/admin/login")
async def admin_login(req: AdminLogin):
    if req.password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid password")
    token = create_token({"role": "admin"})
    return {"token": token, "message": "Login successful"}

@api_router.post("/admin/generate-codes")
async def generate_codes(req: GenerateCodesRequest, admin=Depends(verify_admin)):
    codes = []
    for _ in range(req.count):
        prefix = req.prefix.upper() if req.prefix else "USER"
        username = f"{prefix}_{random.randint(1000, 9999)}"
        redeem_code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
        doc = {
            "username": username,
            "redeem_code": redeem_code,
            "is_used": False,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        await db.users.insert_one(doc)
        codes.append({"username": username, "redeem_code": redeem_code})
    return {"codes": codes, "message": f"Generated {len(codes)} code(s)"}

@api_router.get("/admin/codes")
async def get_codes(admin=Depends(verify_admin)):
    codes = await db.users.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return {"codes": codes}

@api_router.get("/admin/prizes")
async def admin_get_prizes(admin=Depends(verify_admin)):
    prizes = await db.prizes.find({}, {"_id": 0}).to_list(100)
    return {"prizes": prizes}

@api_router.put("/admin/prizes")
async def update_prizes(req: UpdatePrizesRequest, admin=Depends(verify_admin)):
    await db.prizes.delete_many({})
    new_prizes = []
    for i, prize in enumerate(req.prizes):
        doc = {
            "id": f"prize_{i}",
            "label": prize.label,
            "points": prize.points,
            "color": prize.color,
            "probability": prize.probability,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        new_prizes.append(doc)
    if new_prizes:
        await db.prizes.insert_many(new_prizes)
    return {"message": "Prize pool updated", "prizes": [{k: v for k, v in p.items() if k != "_id"} for p in new_prizes]}

@api_router.get("/admin/stats")
async def get_stats(admin=Depends(verify_admin)):
    total_codes = await db.users.count_documents({})
    used_codes = await db.users.count_documents({"is_used": True})
    unused_codes = total_codes - used_codes
    total_draws = await db.draw_history.count_documents({})

    pipeline = [
        {"$group": {"_id": "$prize_label", "count": {"$sum": 1}, "total_points": {"$sum": "$prize_points"}}},
        {"$sort": {"count": -1}}
    ]
    prize_distribution = await db.draw_history.aggregate(pipeline).to_list(100)

    history = await db.draw_history.find({}, {"_id": 0}).sort("drawn_at", -1).to_list(200)

    return {
        "total_codes": total_codes,
        "used_codes": used_codes,
        "unused_codes": unused_codes,
        "total_draws": total_draws,
        "prize_distribution": prize_distribution,
        "history": history,
    }

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
