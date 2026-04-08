# Imagen para Google Cloud Run: escucha en $PORT (por defecto 8080) y en todas las interfaces.
FROM python:3.12-slim-bookworm

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

RUN useradd --create-home --shell /bin/bash appuser

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY main.py .
COPY routes/ ./routes/
COPY index.html style.css app.js ./

RUN chown -R appuser:appuser /app

USER appuser

EXPOSE 8080

# Cloud Run inyecta PORT; localmente puedes usar -e PORT=8000 o el valor por defecto.
CMD ["sh", "-c", "exec uvicorn main:app --host 0.0.0.0 --port ${PORT:-8080}"]
