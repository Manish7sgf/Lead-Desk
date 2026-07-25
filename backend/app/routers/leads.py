import csv
import io
from datetime import datetime, timezone
import uuid
from typing import List, Optional
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse

from app.models import LeadCreate, LeadResponse, LeadUpdate
from app.auth import get_current_admin
from app.database import get_database

router = APIRouter(prefix="/api/leads", tags=["Leads"])

def calculate_priority(budget_str: str) -> str:
    b_lower = budget_str.lower()
    if "20k+" in b_lower or "16 lakh+" in b_lower or "16l+" in b_lower:
        return "High"
    if "5k-20k" in b_lower or "4 lakh" in b_lower or "4l" in b_lower:
        return "Medium"
    return "Standard"

def format_lead(lead_dict: dict) -> dict:
    budget = lead_dict.get("budget_range", "")
    return {
        "id": str(lead_dict.get("_id") or lead_dict.get("id")),
        "name": lead_dict["name"],
        "email": lead_dict["email"],
        "budget_range": budget,
        "message": lead_dict["message"],
        "status": lead_dict.get("status", "New"),
        "notes": lead_dict.get("notes", ""),
        "is_starred": lead_dict.get("is_starred", False),
        "priority": calculate_priority(budget),
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
        "notes": "",
        "is_starred": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    db_obj = get_database()
    if db_obj.is_connected:
        try:
            result = await db_obj.db.leads.insert_one(new_lead_doc)
            new_lead_doc["_id"] = result.inserted_id
            return format_lead(new_lead_doc)
        except Exception as e:
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
    all_leads.sort(key=lambda x: x.get("created_at", ""), reverse=True)
    return [format_lead(l) for l in all_leads]

@router.get("/export", response_class=StreamingResponse)
async def export_leads_csv(current_admin: str = Depends(get_current_admin)):
    """
    Protected admin endpoint: Export all leads as downloadable CSV file.
    """
    db_obj = get_database()
    leads = []

    if db_obj.is_connected:
        try:
            cursor = db_obj.db.leads.find().sort("created_at", -1)
            async for doc in cursor:
                leads.append(format_lead(doc))
        except Exception:
            pass

    if not leads:
        leads = [format_lead(l) for l in db_obj.in_memory_leads]

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Date", "Name", "Email", "Budget Range", "Priority", "Status", "Message", "Admin Notes"])

    for lead in leads:
        writer.writerow([
            lead["id"],
            lead["created_at"],
            lead["name"],
            lead["email"],
            lead["budget_range"],
            lead["priority"],
            lead["status"],
            lead["message"],
            lead.get("notes", "")
        ])

    output.seek(0)
    filename = f"leaddesk_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode('utf-8')),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.patch("/{lead_id}", response_model=LeadResponse)
async def update_lead(
    lead_id: str,
    lead_update: LeadUpdate,
    current_admin: str = Depends(get_current_admin)
):
    """
    Protected admin endpoint: Update status, admin notes, or starred state of a lead.
    """
    db_obj = get_database()
    update_data = {}
    
    if lead_update.status is not None:
        update_data["status"] = lead_update.status
    if lead_update.notes is not None:
        update_data["notes"] = lead_update.notes
    if lead_update.is_starred is not None:
        update_data["is_starred"] = lead_update.is_starred

    if not update_data:
        raise HTTPException(status_code=400, detail="No fields provided for update")

    if db_obj.is_connected:
        try:
            filter_query = {"_id": ObjectId(lead_id)} if ObjectId.is_valid(lead_id) else {"_id": lead_id}
            updated = await db_obj.db.leads.find_one_and_update(
                filter_query,
                {"$set": update_data},
                return_document=True
            )
            if updated:
                return format_lead(updated)
        except Exception:
            pass

    # In-memory fallback
    for lead in db_obj.in_memory_leads:
        if str(lead.get("_id") or lead.get("id")) == lead_id:
            lead.update(update_data)
            return format_lead(lead)

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Lead with id '{lead_id}' not found"
    )
