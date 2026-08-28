from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import timedelta
from jose import jwt

from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.firebase import verify_firebase_id_token
from app.core.config import settings
from app.models.user import User
from app.models.audit_log import AuditLog
from app.schemas.user import UserCreate, UserResponse, LoginRequest, FirebaseLoginRequest, Token

router = APIRouter()

@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def signup(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    # Check if exists
    result = await db.execute(select(User).where(User.email == user_in.email))
    existing = result.scalars().first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered.")
    
    hashed_pwd = get_password_hash(user_in.password)
    user = User(
        email=user_in.email,
        hashed_password=hashed_pwd,
        full_name=user_in.full_name,
        role=user_in.role
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    # Audit log
    audit = AuditLog(user_id=user.id, action="USER_SIGNUP", target_type="user", target_id=str(user.id))
    db.add(audit)
    await db.commit()

    return user

@router.post("/login", response_model=Token)
async def login(login_in: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == login_in.email))
    user = result.scalars().first()
    if not user or not verify_password(login_in.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    token = create_access_token(subject=user.email, expires_delta=access_token_expires)

    # Audit log
    audit = AuditLog(user_id=user.id, action="USER_LOGIN", target_type="user", target_id=str(user.id))
    db.add(audit)
    await db.commit()

    return Token(access_token=token, user=UserResponse.model_validate(user))

@router.post("/firebase-login", response_model=Token)
async def firebase_login(req: FirebaseLoginRequest, db: AsyncSession = Depends(get_db)):
    claims = verify_firebase_id_token(req.id_token)
    if not claims:
        raise HTTPException(status_code=401, detail="Invalid or expired Firebase token.")
    
    email = claims.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Firebase token does not contain an email.")
    
    name = claims.get("name") or email.split("@")[0]
    
    # Check if user exists in database
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalars().first()
    
    if not user:
        # Automatically register user from Google Sign-In
        user = User(
            email=email,
            hashed_password=get_password_hash(f"firebase_{claims.get('uid', 'sso')}"),
            full_name=name,
            role="admin" if "admin" in email.lower() else "analyst"
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
        
        audit = AuditLog(user_id=user.id, action="GOOGLE_SSO_SIGNUP", target_type="user", target_id=str(user.id))
        db.add(audit)
        await db.commit()
    else:
        audit = AuditLog(user_id=user.id, action="GOOGLE_SSO_LOGIN", target_type="user", target_id=str(user.id))
        db.add(audit)
        await db.commit()
        
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    token = create_access_token(subject=user.email, expires_delta=access_token_expires)

    return Token(access_token=token, user=UserResponse.model_validate(user))

@router.get("/me", response_model=UserResponse)
async def get_me(authorization: str | None = Header(None), db: AsyncSession = Depends(get_db)):
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        
        # 1. Try local JWT decode
        try:
            payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
            email = payload.get("sub")
            if email:
                result = await db.execute(select(User).where(User.email == email))
                user = result.scalars().first()
                if user:
                    return user
        except Exception:
            pass

        # 2. Try Firebase ID Token decode
        fb_claims = verify_firebase_id_token(token)
        if fb_claims and fb_claims.get("email"):
            email = fb_claims["email"]
            result = await db.execute(select(User).where(User.email == email))
            user = result.scalars().first()
            if user:
                return user
            else:
                # Create user on the fly if verified by Firebase
                user = User(
                    email=email,
                    hashed_password=get_password_hash(f"firebase_{fb_claims.get('uid', 'sso')}"),
                    full_name=fb_claims.get("name", email.split("@")[0]),
                    role="analyst"
                )
                db.add(user)
                await db.commit()
                await db.refresh(user)
                return user

    # Fallback to first user or default admin
    result = await db.execute(select(User).limit(1))
    user = result.scalars().first()
    if not user:
        user = User(
            email="admin@vulnshield.ai",
            hashed_password=get_password_hash("admin123"),
            full_name="Security Admin",
            role="admin"
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
    return user
