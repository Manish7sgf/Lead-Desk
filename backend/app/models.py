from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel, EmailStr, Field

# Valid Budget Ranges as required by Phase 1 specification
BUDGET_RANGES = ["<$1k", "$1k-5k", "$5k-20k", "$20k+"]
# Valid Lead Statuses
LEAD_STATUSES = ["New", "Contacted", "Closed"]

class LeadCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, description="Lead full name")
    email: EmailStr = Field(..., description="Lead email address")
    budget_range: str = Field(..., min_length=1, max_length=50, description="Budget range selection")
    message: str = Field(..., min_length=5, max_length=2000, description="Lead project message")

class LeadStatusUpdate(BaseModel):
    status: Literal["New", "Contacted", "Closed"] = Field(..., description="Lead status")

class LeadResponse(BaseModel):
    id: str
    name: str
    email: EmailStr
    budget_range: str
    message: str
    status: str
    created_at: str

class LoginRequest(BaseModel):
    username: str = Field(..., min_length=1)
    password: str = Field(..., min_length=1)

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    username: Optional[str] = None

class UserResponse(BaseModel):
    id: str
    username: str
