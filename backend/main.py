from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers.captcha import router as captcha_router

app = FastAPI(
    title="CAPTCHA Recognition & Verification Platform",
    description="Synthetic CAPTCHA testing application",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "http://localhost:5173",
    "https://frontend-pi-two-24.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(captcha_router)


@app.get("/")
def home():
    return {
        "status": "running",
        "project": "CAPTCHA Testing Platform"
    }


@app.get("/health")
def health():
    return {"healthy": True}