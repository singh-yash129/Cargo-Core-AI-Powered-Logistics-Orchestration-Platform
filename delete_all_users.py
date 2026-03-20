"""
Delete ALL users from the database.
Use with caution!
"""
import asyncio
import sys
sys.path.insert(0, 'backend')

from app.database import engine
from sqlalchemy import text

async def delete_all_users():
    print("⚠️  WARNING: This will delete ALL users from the database!")
    
    async with engine.begin() as conn:
        # Get count first
        result = await conn.execute(text("SELECT COUNT(*) FROM users"))
        count = result.scalar()
        print(f"Found {count} users in database")
        
        if count > 0:
            # Delete all users
            result = await conn.execute(text("DELETE FROM users"))
            print(f"✓ Deleted {result.rowcount} users")
        else:
            print("Database is already empty")
    
    print("\nVerifying deletion...")
    async with engine.connect() as conn:
        result = await conn.execute(text('SELECT COUNT(*) FROM users'))
        remaining = result.scalar()
        if remaining == 0:
            print('✓ All users deleted successfully!')
        else:
            print(f'⚠️  Warning: {remaining} users still remain')

if __name__ == '__main__':
    asyncio.run(delete_all_users())
