from contextlib import asynccontextmanager
import logging
from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.database import connect_to_mongo, close_mongo_connection
from app.routers import leads, auth

# Setup Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("leaddesk.main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic
    logger.info("Initializing LeadDesk Mini backend service...")
    await connect_to_mongo()
    yield
    # Shutdown logic
    await close_mongo_connection()

app = FastAPI(
    title="LeadDesk Mini API",
    description="Backend API for Lead capture and admin management",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration
origins = settings.cors_origins
logger.info(f"Configured CORS origins: {origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Standardized Error Handler for Validation Errors
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = []
    for err in exc.errors():
        field = " -> ".join([str(loc) for loc in err.get("loc", []) if loc != "body"])
        msg = err.get("msg")
        errors.append(f"{field}: {msg}" if field else msg)
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": "Invalid submission payload.",
            "errors": errors
        }
    )

# Health Check Route
@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "service": "LeadDesk Mini API",
        "version": "1.0.0"
    }

# Include Routers
app.include_router(leads.router)
app.include_router(auth.router)
