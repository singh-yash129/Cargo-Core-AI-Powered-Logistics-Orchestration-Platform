"""
Delete test users from the database.
Run this script to clean up test accounts.
"""
import asyncio
import sys
sys.path.insert(0, 'backend')

from app.database import engine
from sqlalchemy import text

async def delete_test_users():
    emails_to_delete = [
        'pruthviprasads14@gmail.com',
        'pruthviprasad280@gmail.com',
    ]

    async with engine.begin() as conn:
        for email in emails_to_delete:
            result = await conn.execute(
                text("DELETE FROM users WHERE email = :email"),
                {"email": email}
            )
            if result.rowcount > 0:
                print(f"✓ Deleted user: {email}")
            else:
                print(f"✗ User not found: {email}")

    print("\nRemaining users:")
    async with engine.connect() as conn:
        result = await conn.execute(text('SELECT email, name FROM users'))
        rows = result.fetchall()
        if not rows:
            print('  (No users in database)')
        for row in rows:
            print(f'  - {row[0]} | {row[1]}')

if __name__ == '__main__':
    asyncio.run(delete_test_users())
