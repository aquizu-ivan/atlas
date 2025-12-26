# Health Endpoint

/health expone un diagnostico minimo del proceso y del entorno.
Sirve para verificar que el servicio esta vivo y que la config base existe.
No conecta a DB, solo diagnostica.

## Ejemplo de respuesta
```json
{
  "ok": true,
  "service": "atlas-api",
  "env": "development",
  "gitSha": "dev",
  "startedAt": "2025-01-10T09:00:00.000Z",
  "uptimeSec": 42,
  "expected": {
    "apiBase": "/api",
    "webBaseUrl": null
  },
  "db": {
    "configured": false,
    "provider": "postgresql",
    "urlPresent": false
  }
}
```
