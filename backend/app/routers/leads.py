from datetime import datetime, timezone
import uuid
from typing import List, Optional
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.models import LeadCreate, LeadResponse, LeadStatusUpdate
from app.auth import get_current_admin
from app.database import get_database

router = APIRouter(prefix="/api/leads", tags=["Leads"])

def format_lead(lead_dict: dict) -> dict:
    return {
        "id": str(lead_dict.get("_id") or lead_dict.get("id")),
        "name": lead_dict["name"],
        "email": lead_dict["email"],
        "budget_range": lead_dict["budget_range"],
        "message": lead_dict["message"],
        "status": lead_dict.get("status", "New"),
        "created_at": lead_dict.get("created_at", datetime.now(timezone.utc).isoformat())
    }

@router.post("", response_model=LeadResponse, status_code=status.HTTP_201_CREATED)
async def create_lead(lead: LeadCreate):
    """
    Public endpoint: Submit a new lead.
    Validates name, email, budget_range, and message.
    """
    new_lead_doc = {
        "name": lead.name.strip(),
        "email": lead.email.strip().lower(),
        "budget_range": lead.budget_range,
        "message": lead.message.strip(),
        "status": "New",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    db_obj = get_database()
    if db_obj.is_connected:
        try:
            result = await db_obj.db.leads.insert_one(new_lead_doc)
            new_lead_doc["_id"] = result.inserted_id
            return format_lead(new_lead_doc)
        except Exception as e:
            # Fallback if DB write fails temporarily
            pass

    # In-memory fallback mode
    new_lead_doc["id"] = f"lead_{uuid.uuid4().hex[:8]}"
    db_obj.in_memory_leads.insert(0, new_lead_doc)
    return format_lead(new_lead_doc)

@router.get("", response_model=List[LeadResponse])
async def list_leads(
    q: Optional[str] = Query(None, description="Search filter by name or email"),
    current_admin: str = Depends(get_current_admin)
):
    """
    Protected admin endpoint: List all leads, newest first.
    Supports search query parameter for name or email.
    """
    db_obj = get_database()
    leads = []

    if db_obj.is_connected:
        try:
            query_filter = {}
            if q:
                regex_pattern = {"$regex": q, "$options": "i"}
                query_filter = {
                    "$or": [
                        {"name": regex_pattern},
                        {"email": regex_pattern}
                    ]
                }
            
            cursor = db_obj.db.leads.find(query_filter).sort("created_at", -1)
            async for doc in cursor:
                leads.append(format_lead(doc))
            return leads
        except Exception as e:
            pass

    # In-memory fallback filtering
    all_leads = db_obj.in_memory_leads
    if q:
        query_lower = q.lower()
        all_leads = [
            l for l in all_leads
            if query_lower in l["name"].lower() or query_lower in l["email"].lower()
        ]
    # Sort newest first
    all_leads.sort(key=lambda x: x.get("created_at", ""), reverse=True)
    return [format_lead(l) for l in all_leads]

@router.patch("/{lead_id}", response_model=LeadResponse)
async def update_lead_status(
    lead_id: str,
    status_update: LeadStatusUpdate,
    current_admin: str = Depends(get_current_admin)
):
    """
    Protected admin endpoint: Update status of a specific lead (New / Contacted / Closed).
    """
    db_obj = get_database()
    new_status = status_update.status

    if db_obj.is_connected:
        try:
            # Try ObjectId first
            filter_query = {}
            if ObjectId.is_valid(lead_id):
                filter_query = {"_id": ObjectId(lead_id)}
            else:
                filter_query = {"_id": lead_id}

            updated = await db_obj.db.leads.find_one_and_update(
                filter_query,
                {"$set": {"status": new_status}},
                return_document=True
            )
            if updated:
                return format_lead(updated)
        except Exception:
            pass

    # In-memory fallback
    for lead in db_obj.in_memory_leads:
        if str(lead.get("_id") or lead.get("id")) == lead_id:
            lead["status"] = new_status
            return format_lead(lead)

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Lead with id '{lead_id}' not found"
    )
