import logging
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import ConnectionFailure, OperationFailure
from app.config import settings
from app.auth import get_password_hash

logger = logging.getLogger("leaddesk.database")

class Database:
    client: AsyncIOMotorClient = None
    db = None
    is_connected: bool = False
    
    # In-memory storage fallback if MongoDB connection is unavailable
    in_memory_leads = []
    in_memory_users = {}

db_instance = Database()

async def connect_to_mongo():
    logger.info("Connecting to MongoDB Atlas...")
    try:
        db_instance.client = AsyncIOMotorClient(
            settings.MONGODB_URI,
            serverSelectionTimeoutMS=4000
        )
        db_instance.db = db_instance.client[settings.DB_NAME]
        # Ping server to confirm connection
        await db_instance.client.admin.command('ping')
        db_instance.is_connected = True
        logger.info("Successfully connected to MongoDB Atlas!")
        
        # Ensure indexes
        await db_instance.db.leads.create_index("created_at")
        await db_instance.db.users.create_index("username", unique=True)
        
    except Exception as e:
        logger.warning(f"MongoDB connection warning: {e}. Switching to in-memory/fallback mode for development.")
        db_instance.is_connected = False
    
    # Seed initial admin user
    await seed_admin_user()

async def close_mongo_connection():
    if db_instance.client:
        db_instance.client.close()
        logger.info("MongoDB connection closed.")

async def seed_admin_user():
    admin_user = settings.ADMIN_USERNAME
    admin_pass = settings.ADMIN_PASSWORD
    hashed_pwd = get_password_hash(admin_pass)
    
    if db_instance.is_connected:
        try:
            existing = await db_instance.db.users.find_one({"username": admin_user})
            if not existing:
                await db_instance.db.users.insert_one({
                    "username": admin_user,
                    "password_hash": hashed_pwd,
                    "role": "admin"
                })
                logger.info(f"Seeded admin user '{admin_user}' in MongoDB.")
            else:
                # Update password hash in case env changed
                await db_instance.db.users.update_one(
                    {"username": admin_user},
                    {"$set": {"password_hash": hashed_pwd}}
                )
        except Exception as e:
            logger.error(f"Failed to seed admin user in MongoDB: {e}")
    
    # Always keep in-memory user updated as fallback
    db_instance.in_memory_users[admin_user] = {
        "id": "admin-1",
        "username": admin_user,
        "password_hash": hashed_pwd,
        "role": "admin"
    }

def get_database():
    return db_instance
