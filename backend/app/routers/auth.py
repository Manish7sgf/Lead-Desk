from fastapi import APIRouter, HTTPException, Depends, status
from app.models import LoginRequest, Token, UserResponse
from app.auth import verify_password, create_access_token, get_current_admin
from app.database import get_database

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/login", response_model=Token)
async def login(credentials: LoginRequest):
    """
    Authenticate admin credentials and issue a JWT access token.
    """
    username = credentials.username.strip()
    password = credentials.password
    
    db_obj = get_database()
    user_record = None

    if db_obj.is_connected:
        try:
            user_record = await db_obj.db.users.find_one({"username": username})
        except Exception:
            pass

    if not user_record and username in db_obj.in_memory_users:
        user_record = db_obj.in_memory_users[username]

    if not user_record or not verify_password(password, user_record["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(data={"sub": username})
    return Token(access_token=access_token, token_type="bearer")

@router.get("/me", response_model=UserResponse)
async def get_me(current_admin: str = Depends(get_current_admin)):
    """
    Get information about current logged in admin user.
    """
    return UserResponse(id="admin-1", username=current_admin)
