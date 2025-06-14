from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.db import init_db
from src.routes.users.auth import auth_router

app = FastAPI()

@app.on_event("startup")
async def start_up():
    await init_db()


origins = ["http://localhost:3000", "http://localhost:3001"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/auth")


@app.get("/")
def get_root():
    return {"message": "Hello World"}
