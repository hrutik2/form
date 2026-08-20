from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes_auth import router as auth_router
from app.api.routes_forms import router as forms_router
from app.api.routes_public import router as public_router
from app.core.config import settings

app = FastAPI(title="Form Builder API")

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


@app.get("/health")
def health_check():
    return {"status": "ok"}
