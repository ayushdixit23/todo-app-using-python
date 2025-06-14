from dotenv import load_dotenv
import os
import asyncpg

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

async def init_db():
    global pool
    pool = await asyncpg.create_pool(DATABASE_URL)
    print("✅ Database pool created")

async def get_connection():
    async with pool.acquire() as conn:
        yield conn
