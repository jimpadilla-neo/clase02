from fastapi import APIRouter
from pydantic import BaseModel, ConfigDict, Field

router = APIRouter()


class Credenciales(BaseModel):
    correo: str
    contrasena: str = Field(alias="contraseña")
    # Permite poblar el modelo usando tanto el alias ("contraseña") como el nombre
    # de campo en Python ("contrasena").
    model_config = ConfigDict(populate_by_name=True)


# "Base de datos" temporal para simular registro y luego login.
usuarios_temporales: list[dict] = []


@router.post("/register")
def register(credenciales: Credenciales):
    usuarios_temporales.append(
        {"correo": credenciales.correo, "contrasena": credenciales.contrasena}
    )
    return {
        "mensaje": "Registro exitoso",
        "datos_recibidos": credenciales.model_dump(by_alias=True),
    }


@router.post("/login")
def login(credenciales: Credenciales):
    usuario_encontrado = next(
        (
            u
            for u in usuarios_temporales
            if u["correo"] == credenciales.correo and u["contrasena"] == credenciales.contrasena
        ),
        None,
    )
    return {
        "mensaje": "Inicio de sesión exitoso",
        "datos_recibidos": credenciales.model_dump(by_alias=True),
        "usuario_encontrado": usuario_encontrado is not None,
    }

