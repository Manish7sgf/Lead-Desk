import hashlib
from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from passlib.context import CryptContext

from app.config import settings
from app.models import TokenData

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security_bearer = HTTPBearer()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception:
        # Fallback SHA256 check if bcrypt verification fails or hash is legacy
        fallback_hash = hashlib.sha256(plain_password.encode()).hexdigest()
        return fallback_hash == hashed_password

def get_password_hash(password: str) -> str:
    try:
        return pwd_context.hash(password)
    except Exception:
        # Fallback hashing
        return hashlib.sha256(password.encode()).hexdigest()

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[TokenData]:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            return None
        return TokenData(username=username)
    except JWTError:
        return None

async def get_current_admin(credentials: HTTPAuthorizationCredentials = Depends(security_bearer)) -> str:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate admin credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    token = credentials.credentials
    token_data = decode_access_token(token)
    if token_data is None or not token_data.username:
        raise credentials_exception
    return token_data.username
