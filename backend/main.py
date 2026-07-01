from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# Import database session, engine and trigger models registration
from backend.db.session import engine, Base
import backend.db.models  # Registers SQLite/PostgreSQL models

# Import routers
from backend.auth import swiggy_oauth
from backend.users import routes as users_routes
from backend.orders import routes as orders_routes
from backend.recommendations import routes as recommendations_routes

app = FastAPI(
    title="NutriOrder AI Production Backend",
    description="Multi-user FastAPI production server with OAuth, memory persistence, and order state machine.",
    version="1.0.0"
)

# Startup DB initialization hook
@app.on_event("startup")
def init_db():
    Base.metadata.create_all(bind=engine)

# CORS configuration allowing explicit localhost frontend origin with credentials enabled
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include modules
app.include_router(swiggy_oauth.router)
app.include_router(users_routes.router)
app.include_router(orders_routes.router)
app.include_router(recommendations_routes.router)

@app.get("/health")
async def health():
    """Health check route for container environments and status validation."""
    return {
        "status": "healthy",
        "app": "NutriOrder AI Production Backend"
    }

if __name__ == "__main__":
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
