from fastapi import FastAPI, APIRouter, HTTPException, Depends, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import random
import string
import jwt
import hashlib
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, timezone, timedelta

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_SECRET = os.environ.get('JWT_SECRET', 'lucky-wheel-secret-key-2024')
MASTER_ADMIN_USER = os.environ.get('MASTER_ADMIN_USER', 'master')
MASTER_ADMIN_PASS = os.environ.get('MASTER_ADMIN_PASS', 'dragonmaster2024!')

app = FastAPI()
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# --- Helpers ---
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password: str, hashed: str) -> bool:
    return hash_password(password) == hashed

# --- Models ---
class AdminLoginRequest(BaseModel):
    username: str
    password: str

class CreateAdminRequest(BaseModel):
    username: str
    password: str

class GenerateCodesRequest(BaseModel):
    usernames: List[str]

class PrizeItem(BaseModel):
    label: str
    image_url: str = ""
    color: str
    probability: float = 50.0

class UpdatePrizesRequest(BaseModel):
    prizes: List[PrizeItem]

class SpinRequest(BaseModel):
    username: str
    redeem_code: str

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

# --- Auth helpers ---
def create_token(data: dict):
    payload = {**data, "exp": datetime.now(timezone.utc) + timedelta(hours=24)}
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

async def verify_admin(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=["HS256"])
        if payload.get("role") not in ("admin", "master"):
            raise HTTPException(status_code=403, detail="Not authorized")
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def verify_master(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=["HS256"])
        if payload.get("role") != "master":
            raise HTTPException(status_code=403, detail="Only master admin can perform this action")
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# --- Seed defaults ---
DEFAULT_PRIZES = [
    {"label": "Grand Prize", "image_url": "", "color": "#9B1B30", "probability": 5},
    {"label": "Dragon Gem", "image_url": "", "color": "#D4A030", "probability": 10},
    {"label": "Gold Coin", "image_url": "", "color": "#7A1526", "probability": 15},
    {"label": "Lucky Charm", "image_url": "", "color": "#B8860B", "probability": 20},
    {"label": "Fire Scroll", "image_url": "", "color": "#8B0000", "probability": 15},
    {"label": "Bronze Medal", "image_url": "", "color": "#DAA520", "probability": 15},
    {"label": "Mystic Stone", "image_url": "", "color": "#5C0A1A", "probability": 10},
    {"label": "Dragon Scale", "image_url": "", "color": "#C5943A", "probability": 10},
]

@app.on_event("startup")
async def seed_data():
    # Seed prizes
    prize_count = await db.prizes.count_documents({})
    if prize_count == 0:
        for i, prize in enumerate(DEFAULT_PRIZES):
            prize["id"] = f"prize_{i}"
            prize["created_at"] = datetime.now(timezone.utc).isoformat()
        await db.prizes.insert_many(DEFAULT_PRIZES)
        logger.info("Seeded default prizes")

    # Seed master admin
    master = await db.admins.find_one({"username": MASTER_ADMIN_USER})
    if not master:
        await db.admins.insert_one({
            "username": MASTER_ADMIN_USER,
            "password_hash": hash_password(MASTER_ADMIN_PASS),
            "role": "master",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        logger.info(f"Seeded master admin: {MASTER_ADMIN_USER}")

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

    # Filter out prizes with 0 probability
    eligible = [p for p in prizes if p.get("probability", 0) > 0]
    if not eligible:
        raise HTTPException(status_code=500, detail="No eligible prizes")

    weights = [p.get("probability", 0) for p in eligible]
    chosen = random.choices(eligible, weights=weights, k=1)[0]

    now = datetime.now(timezone.utc).isoformat()
    record = {
        "username": req.username,
        "prize_label": chosen["label"],
        "prize_image_url": chosen.get("image_url", ""),
        "prize_color": chosen["color"],
        "drawn_at": now,
    }
    await db.draw_history.insert_one({**record})

    await db.users.update_one(
        {"username": req.username, "redeem_code": req.redeem_code},
        {"$set": {"is_used": True, "used_at": now}}
    )

    return {"prize": chosen, "message": f"Congratulations! You won {chosen['label']}!"}

# --- Admin Routes ---
@api_router.post("/admin/login")
async def admin_login(req: AdminLoginRequest):
    admin = await db.admins.find_one({"username": req.username}, {"_id": 0})
    if not admin or not verify_password(req.password, admin["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    token = create_token({"role": admin["role"], "username": req.username})
    return {"token": token, "role": admin["role"], "message": "Login successful"}

@api_router.post("/admin/change-password")
async def change_password(req: ChangePasswordRequest, admin=Depends(verify_admin)):
    username = admin.get("username")
    account = await db.admins.find_one({"username": username})
    if not account or not verify_password(req.current_password, account["password_hash"]):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    if len(req.new_password) < 6:
        raise HTTPException(status_code=400, detail="New password must be at least 6 characters")
    await db.admins.update_one(
        {"username": username},
        {"$set": {"password_hash": hash_password(req.new_password)}}
    )
    return {"message": "Password changed successfully"}


@api_router.post("/admin/create-admin")
async def create_admin(req: CreateAdminRequest, master=Depends(verify_master)):
    existing = await db.admins.find_one({"username": req.username})
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")
    await db.admins.insert_one({
        "username": req.username,
        "password_hash": hash_password(req.password),
        "role": "admin",
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    return {"message": f"Admin '{req.username}' created successfully"}

@api_router.get("/admin/admins")
async def list_admins(master=Depends(verify_master)):
    admins = await db.admins.find({}, {"_id": 0, "password_hash": 0}).to_list(100)
    return {"admins": admins}

@api_router.delete("/admin/admins/{username}")
async def delete_admin(username: str, master=Depends(verify_master)):
    if username == MASTER_ADMIN_USER:
        raise HTTPException(status_code=400, detail="Cannot delete master admin")
    result = await db.admins.delete_one({"username": username, "role": "admin"})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Admin not found")
    return {"message": f"Admin '{username}' deleted"}

@api_router.post("/admin/generate-codes")
async def generate_codes(req: GenerateCodesRequest, admin=Depends(verify_admin)):
    codes = []
    for uname in req.usernames:
        uname = uname.strip()
        if not uname:
            continue
        existing = await db.users.find_one({"username": uname})
        if existing:
            continue  # skip duplicates
        redeem_code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
        doc = {
            "username": uname,
            "redeem_code": redeem_code,
            "is_used": False,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        await db.users.insert_one(doc)
        codes.append({"username": uname, "redeem_code": redeem_code})
    return {"codes": codes, "message": f"Generated {len(codes)} code(s)"}

@api_router.get("/admin/codes")
async def get_codes(status: Optional[str] = Query(None), admin=Depends(verify_admin)):
    query = {}
    if status == "used":
        query["is_used"] = True
    elif status == "unused":
        query["is_used"] = False
    codes = await db.users.find(query, {"_id": 0}).sort("created_at", -1).to_list(500)
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
            "image_url": prize.image_url,
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
        {"$group": {"_id": "$prize_label", "count": {"$sum": 1}}},
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

# CORS configuration - allow all origins for now
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
