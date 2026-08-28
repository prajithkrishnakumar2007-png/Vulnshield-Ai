import asyncio
from sqlalchemy.future import select
from app.core.database import AsyncSessionLocal
from app.core.security import get_password_hash
from app.models.user import User

async def main():
    async with AsyncSessionLocal() as db:
        res = await db.execute(select(User).where(User.email == "levi@gmail.com"))
        user = res.scalars().first()
        if user:
            user.hashed_password = get_password_hash("password123")
            user.full_name = "Levi"
            await db.commit()
            print("Updated levi@gmail.com password to password123")
        else:
            new_user = User(
                email="levi@gmail.com",
                hashed_password=get_password_hash("password123"),
                full_name="Levi",
                role="analyst"
            )
            db.add(new_user)
            await db.commit()
            print("Created levi@gmail.com with password password123")

if __name__ == "__main__":
    asyncio.run(main())
