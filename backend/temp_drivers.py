import asyncio
from app.database import engine
from sqlalchemy import text

async def get_drivers():
    async with engine.connect() as conn:
        result = await conn.execute(text("SELECT email, name, role FROM users WHERE role = 'driver' LIMIT 5"))
        for r in result:
            print(r)

asyncio.run(get_drivers())
