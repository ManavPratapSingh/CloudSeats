import time
from fastapi import Depends, FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from prometheus_client import CONTENT_TYPE_LATEST, Counter, Histogram, generate_latest
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

REQUEST_COUNT = Counter(
    "http_requests_total",
    "Total HTTP requests",
    ["method", "handler", "status"],
)
REQUEST_LATENCY = Histogram(
    "http_request_duration_seconds",
    "HTTP request latency in seconds",
    ["method", "handler"],
)

@app.middleware("http")
async def prometheus_metrics_middleware(request: Request, call_next):
    start = time.perf_counter()
    response = await call_next(request)
    duration = time.perf_counter() - start

    handler = request.url.path
    for route in request.app.routes:
        match, _ = route.matches(request.scope)
        if match == 1 and hasattr(route, "path"):
            handler = route.path
            break

    status_code = str(response.status_code)
    REQUEST_COUNT.labels(method=request.method, handler=handler, status=status_code).inc()
    REQUEST_LATENCY.labels(method=request.method, handler=handler).observe(duration)
    return response

@app.get("/metrics")
def metrics():
    return Response(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)

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
