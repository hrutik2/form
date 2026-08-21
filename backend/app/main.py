import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pymongo.errors import PyMongoError

from app.api.routes_auth import router as auth_router
from app.api.routes_forms import router as forms_router
from app.api.routes_public import router as public_router
from app.core.config import settings
from app.db.mongo import ensure_indexes, ping_database

app = FastAPI(title="Form Builder API")
logger = logging.getLogger(__name__)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in settings.cors_origins.split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(forms_router)
app.include_router(public_router)


@app.on_event("startup")
def prepare_database():
    try:
        ensure_indexes()
    except PyMongoError as error:
        logger.warning("Skipping database index setup during startup: %s", error)


@app.get("/health")
def health_check():
    return {"status": "ok", "database": "ok" if ping_database() else "unavailable"}
