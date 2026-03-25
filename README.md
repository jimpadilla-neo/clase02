# API FastAPI — Jim Padilla (Clase 2)

API REST construida con [FastAPI](https://fastapi.tiangolo.com/) para practicar rutas modulares (`APIRouter`), autenticación simulada, catálogo de servicios y registro de mascotas por dueño.

## Requisitos

- Python 3.10 o superior (recomendado)
- Dependencias principales:
  - `fastapi`
  - `uvicorn`
  - `pydantic` (incluida con FastAPI)

Instalación típica en un entorno virtual (versiones alineadas al archivo `requirements.txt`):

```bash
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

Si prefieres instalar solo lo mínimo sin fijar versiones:

```bash
pip install fastapi uvicorn
```

## Cómo ejecutar el servidor

Desde la carpeta del proyecto (donde está `main.py`):

```bash
uvicorn main:app --reload --port 8000
```

- API base: `http://127.0.0.1:8000`
- Documentación interactiva (Swagger UI): [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- Esquema OpenAPI (JSON): [http://127.0.0.1:8000/openapi.json](http://127.0.0.1:8000/openapi.json)

## Arquitectura del proyecto

```
Jim Padilla - Clase 2/
├── main.py                 # Instancia FastAPI, rutas de saludo, include_router
├── routes/
│   ├── auth.py             # Registro y login (usuarios en memoria)
│   ├── servicios.py        # Lista y alta de servicios
│   └── mascotas.py         # Mascotas, listado y reporte por correo
└── README.md
```

Los datos se guardan en **listas en memoria**: al reiniciar el servidor se pierden (adecuado para pruebas y clase).

## Uso de la API

Todas las peticiones que llevan cuerpo deben usar el encabezado:

`Content-Type: application/json`

### Saludo (en `main.py`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/` | Mensaje de bienvenida |
| GET | `/bienvenido/{nombre}` | Saludo personalizado |

**Ejemplo**

```bash
curl http://127.0.0.1:8000/
curl http://127.0.0.1:8000/bienvenido/Ana
```

---

### Servicios (`routes/servicios.py`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/servicios` | Lista el catálogo actual (`servicios_db`) |
| POST | `/agregar-servicio` | Agrega un servicio (cualquier objeto JSON, p. ej. `nombre` y `precio`) |

**GET `/servicios`** — Respuesta: `{ "servicios": [ { "nombre": "...", "precio": ... }, ... ] }`

**POST `/agregar-servicio`** — Cuerpo JSON libre; se agrega tal cual a la lista.

```json
{ "nombre": "vacuna", "precio": 80 }
```

---

### Autenticación simulada (`routes/auth.py`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/register` | Guarda correo y contraseña en `usuarios_temporales` |
| POST | `/login` | Comprueba si existen las credenciales; devuelve si encontró al usuario |

**Cuerpo (ambas rutas)** — Puedes usar **`contrasena`** o **`contraseña`**:

```json
{
  "correo": "usuario@ejemplo.com",
  "contrasena": "mi_clave"
}
```

o

```json
{
  "correo": "usuario@ejemplo.com",
  "contraseña": "mi_clave"
}
```

**Respuesta típica**

- `register`: `{ "mensaje": "...", "datos_recibidos": { "correo": "...", "contraseña": "..." } }`
- `login`: incluye además `"usuario_encontrado": true | false`

**Flujo sugerido:** primero `POST /register`, luego `POST /login` con los mismos datos.

---

### Mascotas y reportes (`routes/mascotas.py`)

El precio de cada registro se calcula al guardar: el campo `tipo_servicio` debe coincidir con el **`nombre`** de un ítem en `servicios_db` (por ejemplo `consulta`, `baño`, `corte`). Si no coincide, `precio` queda `null` y el gasto total tratará ese registro como 0.

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/registrar-mascota` | Registra mascota asociada al correo del dueño |
| GET | `/mascotas/{correo}` | Lista mascotas y resumen de servicios de ese dueño |
| GET | `/reporte/{correo}` | Cantidad de servicios registrados, desglose y total gastado |

**POST `/registrar-mascota`**

```json
{
  "correo": "dueño@ejemplo.com",
  "nombre_mascota": "Rex",
  "tipo_servicio": "consulta",
  "fecha": "2026-03-25"
}
```

`fecha` debe ser una fecha válida en formato ISO (`YYYY-MM-DD`).

**GET `/mascotas/{correo}`** — Devuelve:

- `mascotas`: cada registro con nombre, tipo de servicio y fecha
- `servicios`: tipos únicos con `precio` y `cantidad` de veces registrados

**GET `/reporte/{correo}`** — Devuelve:

- `cantidad_servicios`: número total de registros (visitas/servicios)
- `servicios`: por tipo, `precio_unitario`, `cantidad`
- `total_gastado`: suma de precios de todos los registros (0 si no había precio)

**Ejemplo con curl**

```bash
curl -X POST http://127.0.0.1:8000/registrar-mascota ^
  -H "Content-Type: application/json" ^
  -d "{\"correo\":\"dueño@ejemplo.com\",\"nombre_mascota\":\"Rex\",\"tipo_servicio\":\"corte\",\"fecha\":\"2026-03-25\"}"

curl http://127.0.0.1:8000/mascotas/due%C3%B1o%40ejemplo.com
curl http://127.0.0.1:8000/reporte/due%C3%B1o%40ejemplo.com
```

En PowerShell suele ser más cómodo usar `Invoke-RestMethod` o probar desde `/docs`.

## Notas importantes

1. **Sin base de datos real:** todo vive en variables del proceso; reiniciar Uvicorn borra usuarios, servicios agregados manualmente y mascotas (salvo los servicios iniciales definidos en código).
2. **Seguridad:** las contraseñas no están hasheadas; es solo para aprendizaje.
3. **Correo en la URL:** en `GET /mascotas/{correo}` y `GET /reporte/{correo}` el símbolo `@` debe ir codificado como `%40` en la URL si no usas el cliente de `/docs`.

## Licencia y propósito

Proyecto educativo (Clase 2). Ajusta y extiende según lo que pida tu curso.
