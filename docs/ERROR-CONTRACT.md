# Error Contract

## Status a code
| Status | Code | Cuando aplica |
| --- | --- | --- |
| 400 | BAD_REQUEST | Input invalido o falta de parametros |
| 401 | UNAUTHENTICATED | Falta sesion o token valido |
| 403 | FORBIDDEN | No tiene permisos para la accion |
| 404 | NOT_FOUND | Recurso o ruta inexistente |
| 409 | BOOKING_CONFLICT | Colision de booking por slot |
| 500 | INTERNAL_ERROR | Error inesperado del servidor |

## Ejemplos
400 BAD_REQUEST:
```json
{
  "ok": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Invalid input",
    "details": { "field": "email" },
    "timestamp": "2025-01-10T09:00:00Z"
  }
}
```

401 UNAUTHENTICATED:
```json
{
  "ok": false,
  "error": {
    "code": "UNAUTHENTICATED",
    "message": "Necesitas iniciar sesion",
    "details": null,
    "timestamp": "2025-01-10T09:00:00Z"
  }
}
```

403 FORBIDDEN:
```json
{
  "ok": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "No tienes acceso",
    "details": null,
    "timestamp": "2025-01-10T09:00:00Z"
  }
}
```

404 NOT_FOUND:
```json
{
  "ok": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Not found",
    "details": null,
    "timestamp": "2025-01-10T09:00:00Z"
  }
}
```

409 BOOKING_CONFLICT:
```json
{
  "ok": false,
  "error": {
    "code": "BOOKING_CONFLICT",
    "message": "Ese horario ya no esta disponible",
    "details": null,
    "timestamp": "2025-01-10T09:00:00Z"
  }
}
```

500 INTERNAL_ERROR:
```json
{
  "ok": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Unexpected error",
    "details": null,
    "timestamp": "2025-01-10T09:00:00Z"
  }
}
```

Nota: 409 por colision de booking se origina en el constraint unique(serviceId, startAt) y se mapea a BOOKING_CONFLICT.
