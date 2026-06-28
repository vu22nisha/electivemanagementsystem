from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, SessionLocal, engine
from app.routes import router
from app.seed import seed_database

Base.metadata.create_all(bind=engine)

db = SessionLocal()
try:
    seed_database(db)
finally:
    db.close()

app = FastAPI(
    title="PES University Elective Management System",
    description="API for student elective registration and management",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")


@app.get("/api/health")
def health():
    return {"status": "ok"}
