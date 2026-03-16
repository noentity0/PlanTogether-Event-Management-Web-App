from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.config import get_settings


settings = get_settings()
client = AsyncIOMotorClient(settings.mongo_url)
database: AsyncIOMotorDatabase = client[settings.db_name]


def get_database() -> AsyncIOMotorDatabase:
    return database

