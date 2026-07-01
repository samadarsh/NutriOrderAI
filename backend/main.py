from fastapi import FastAPI
import uvicorn
from backend.auth import swiggy_oauth
from backend.users import routes as users_routes
from backend.orders import routes as orders_routes

app = FastAPI(
    title="NutriOrder AI Production Backend",
    description="Multi-user FastAPI production server with OAuth, memory persistence, and order state machine.",
    version="1.0.0"
)

# Include modules
app.include_router(swiggy_oauth.router)
app.include_router(users_routes.router)
app.include_router(orders_routes.router)

@app.get("/health")
async def health():
    """Health check route for container environments and status validation."""
    return {
        "status": "healthy",
        "app": "NutriOrder AI Production Backend"
    }

if __name__ == "__main__":
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
