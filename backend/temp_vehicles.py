import asyncio
import asyncpg

async def main():
    conn = await asyncpg.connect('postgresql://logistics_user:logistics_pass@localhost:5432/logistics_db')
    
    # Try fetching from fleet_vehicles or vehicles table
    try:
        rows = await conn.fetch("SELECT id, vehicle_code FROM fleet_vehicles LIMIT 5")
        for r in rows:
            print(f"Vehicle Code: {r['vehicle_code']} (ID: {r['id']})")
    except asyncpg.exceptions.UndefinedTableError:
        try:
            rows = await conn.fetch("SELECT id FROM vehicles LIMIT 5")
            for r in rows:
                 print(f"Vehicle ID: {r['id']}")
        except asyncpg.exceptions.UndefinedTableError:
            print("No vehicles table found.")
            
    await conn.close()

asyncio.run(main())
