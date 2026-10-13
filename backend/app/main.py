from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from prometheus_fastapi_instrumentator import Instrumentator
from sqlalchemy import text
from sqlalchemy.orm import Session

from .config import settings
from .db import get_db
from .routers import items

app = FastAPI(title=settings.app_name, version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Expose Prometheus HTTP metrics
Instrumentator().instrument(app).expose(app, endpoint="/metrics")

# Include Item router
app.include_router(items.router)

@app.get("/")
def root():
    return {
        "service": settings.app_name,
        "version": "1.0.0",
        "docs": "/docs",
    }

@app.get("/health")
def health():
    # Fast liveness probe without database call
    return {"status": "UP"}

@app.get("/ready")
def ready(db: Session = Depends(get_db)):
    # Readiness probe verifying database connectivity
    db.execute(text("SELECT 1"))
    return {"status": "READY"}
