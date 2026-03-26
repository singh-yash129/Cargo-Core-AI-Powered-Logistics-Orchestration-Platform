import asyncio
import asyncpg

async def main():
    conn = await asyncpg.connect('postgresql://logistics_user:logistics_pass@localhost:5432/logistics_db')
    query = """
    SELECT u.email, u.name 
    FROM users u 
    JOIN roles r ON u.role_id = r.id 
    WHERE r.name = 'DRIVER' 
    LIMIT 10
    """
    rows = await conn.fetch(query)
    if not rows:
        print("No DRIVERs found.")
    for row in rows:
        print(f"Driver: {row['email']} | {row['name']}")
    await conn.close()

asyncio.run(main())
