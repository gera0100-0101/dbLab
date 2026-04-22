from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from database import engine, Base
from routes import router
from config import settings

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Retail Store API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(router, prefix="/api")

# Create uploads directory
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

# Mount static files for uploaded images
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")


@app.get("/")
def read_root():
    return {"message": "Welcome to Retail Store API"}
