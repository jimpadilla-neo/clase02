from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

from routes.auth import router as auth_router
from routes.servicios import router as servicios_router
from routes.mascotas import router as mascotas_router

BASE_DIR = Path(__file__).resolve().parent

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(servicios_router)
app.include_router(auth_router)
app.include_router(mascotas_router)


@app.get("/api")
def saludar():
    return {"mensaje": "¡Hola! Bienvenido a mi API"}


@app.get("/")
def index():
    return FileResponse(BASE_DIR / "index.html")


@app.get("/style.css")
def stylesheet():
    return FileResponse(BASE_DIR / "style.css", media_type="text/css")


@app.get("/app.js")
def app_script():
    return FileResponse(BASE_DIR / "app.js", media_type="application/javascript")


@app.get("/bienvenido/{nombre}")
def saludar_persona(nombre: str):
    return {"mensaje": f"Hola {nombre}, ¡qué bueno verte por aquí!"}

