from __future__ import annotations

from datetime import date

from fastapi import APIRouter
from pydantic import BaseModel

from routes.servicios import servicios_db

router = APIRouter()


# "Base de datos" temporal para registrar mascotas/servicios por dueño.
mascotas_db: list[dict] = []


class RegistrarMascotaPayload(BaseModel):
    correo: str
    nombre_mascota: str
    tipo_servicio: str
    fecha: date


def _obtener_precio_por_servicio(tipo_servicio: str) -> int | None:
    servicio = next(
        (s for s in servicios_db if s.get("nombre") == tipo_servicio),
        None,
    )
    if not servicio:
        return None
    return servicio.get("precio")


@router.post("/registrar-mascota")
def registrar_mascota(payload: RegistrarMascotaPayload):
    precio = _obtener_precio_por_servicio(payload.tipo_servicio)

    registro = {
        "correo": payload.correo,
        "nombre_mascota": payload.nombre_mascota,
        "tipo_servicio": payload.tipo_servicio,
        "fecha": payload.fecha.isoformat(),
        "precio": precio,
    }

    mascotas_db.append(registro)
    return {"mensaje": "Mascota registrada exitosamente", "datos_registro": registro}


@router.get("/mascotas/{correo}")
def listar_mascotas_por_usuario(correo: str):
    registros = [m for m in mascotas_db if m.get("correo") == correo]

    # Servicios (únicos) que esa persona registró, con precio si existe en servicios_db.
    servicios_map: dict[str, dict] = {}
    for r in registros:
        tipo = r.get("tipo_servicio")
        if not tipo:
            continue
        if tipo not in servicios_map:
            servicios_map[tipo] = {
                "tipo_servicio": tipo,
                "precio": r.get("precio"),
                "cantidad": 0,
            }
        servicios_map[tipo]["cantidad"] += 1

    return {
        "correo": correo,
        "mascotas": [
            {
                "nombre_mascota": r.get("nombre_mascota"),
                "tipo_servicio": r.get("tipo_servicio"),
                "fecha": r.get("fecha"),
            }
            for r in registros
        ],
        "servicios": list(servicios_map.values()),
    }


@router.get("/reporte/{correo}")
def reporte_por_usuario(correo: str):
    registros = [m for m in mascotas_db if m.get("correo") == correo]

    total_gastado = sum((r.get("precio") or 0) for r in registros)

    servicios_map: dict[str, dict] = {}
    for r in registros:
        tipo = r.get("tipo_servicio")
        if not tipo:
            continue
        if tipo not in servicios_map:
            servicios_map[tipo] = {
                "tipo_servicio": tipo,
                "precio_unitario": r.get("precio"),
                "cantidad": 0,
            }
        servicios_map[tipo]["cantidad"] += 1

    return {
        "correo": correo,
        "cantidad_servicios": len(registros),
        "servicios": list(servicios_map.values()),
        "total_gastado": total_gastado,
    }

