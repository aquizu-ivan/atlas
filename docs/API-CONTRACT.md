# API Contract

## Base URL y version
- Base URL: /api
- Version: /api

## Error shape unico global
Error shape unico global:
```json
{
  "ok": false,
  "error": {
    "code": "STRING",
    "message": "STRING",
    "details": null,
    "timestamp": "ISO-UTC"
  }
}
```
Nota: details puede ser null o cualquier estructura JSON (objeto/array/string/number).

## Endpoints (sin implementacion)
| Metodo | Endpoint | Acceso | Notas |
| --- | --- | --- | --- |
| GET | /health | Publico | Healthcheck basico |
| GET | /services | Publico | Servicios visibles |
| GET | /availability?serviceId=...&date=YYYY-MM-DD | Publico | serviceId es interno |
| POST | /auth/request-link | Publico | body: { email } |
| GET | /auth/session | Publico | Requiere token/cookie; identidad abstracta |
| POST | /bookings | Usuario | Requiere sesion; body: { serviceId, startAt } |
| GET | /bookings/me | Usuario | Requiere sesion; mis reservas |
| POST | /bookings/:id/cancel | Usuario | id interno; UI no lo expone como dato a completar |
| POST | /bookings/:id/reschedule | Usuario | body: { startAt } |

Admin (modo separado):
| Metodo | Endpoint | Acceso | Notas |
| --- | --- | --- | --- |
| GET | /admin/services | Admin | Lista de servicios |
| POST | /admin/services | Admin | Crear servicio |
| PATCH | /admin/services/:id | Admin | Actualizar servicio |
| GET | /admin/agenda?date=YYYY-MM-DD | Admin | Agenda del dia |
| GET | /admin/users | Admin | Lista de usuarios |

## Status codes por endpoint
| Endpoint | Codigos |
| --- | --- |
| GET /health | 200, 500 |
| GET /services | 200, 500 |
| GET /availability | 200, 400, 500 |
| POST /auth/request-link | 200, 400, 500 |
| GET /auth/session | 200, 401, 500 |
| POST /bookings | 201, 400, 401, 409, 500 |
| GET /bookings/me | 200, 401, 500 |
| POST /bookings/:id/cancel | 200, 401, 403, 404, 500 |
| POST /bookings/:id/reschedule | 200, 400, 401, 403, 404, 409, 500 |
| Admin endpoints | 200, 201, 400, 401, 403, 404, 500 |

Caso 409 canonico: colision de booking por slot.

## Ejemplos
201 booking OK:
```json
{
  "ok": true,
  "data": {
    "booking": {
      "status": "confirmed",
      "startAt": "2025-01-10T10:00:00Z"
    }
  }
}
```

409 booking conflict:
```json
{
  "ok": false,
  "error": {
    "code": "BOOKING_CONFLICT",
    "message": "Ese horario ya no esta disponible.",
    "details": null,
    "timestamp": "2025-01-10T09:59:59Z"
  }
}
```

401 no autenticado:
```json
{
  "ok": false,
  "error": {
    "code": "UNAUTHENTICATED",
    "message": "Necesitas iniciar sesion.",
    "details": null,
    "timestamp": "2025-01-10T09:00:00Z"
  }
}
```
