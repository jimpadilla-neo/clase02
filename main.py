"""Backend REST PetCare. La interfaz web estática vive en `frontend/` (p. ej. Nginx en Cloud Run)."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.auth import router as auth_router
from routes.servicios import router as servicios_router
from routes.mascotas import router as mascotas_router

app = FastAPI(
    title="PetCare API",
    description="Backend: autenticación temporal, servicios y mascotas. Sin archivos estáticos.",
    version="1.0.0",
)

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


@app.get("/")
def root():
    return {"mensaje": "¡Hola! Bienvenido a mi API", "documentacion": "/docs"}


@app.get("/api")
def saludar():
    return {"mensaje": "¡Hola! Bienvenido a mi API"}


@app.get("/bienvenido/{nombre}")
def saludar_persona(nombre: str):
    return {"mensaje": f"Hola {nombre}, ¡qué bueno verte por aquí!"}

