# Auth Session

## Flujo completo
- request-link genera LoginToken (hash) con expiracion y usedAt null.
- consume valida token, marca usedAt y crea Session con cookie httpOnly.
- session lee la cookie y devuelve identidad abstracta.

## Cookies
- Nombre: atlas_session
- httpOnly: true
- sameSite: lax
- secure: true solo en production
- path: /

## TTLs
- AUTH_TOKEN_TTL_MINUTES: expira login token (default 15).
- AUTH_SESSION_TTL_DAYS: expira sesion (default 7).

## Atomicidad
- consume usa updateMany con where tokenHash + usedAt null + expiresAt > now.
- Si count = 0, el link ya fue usado, expiro o es invalido.

## Ejemplos
Consume (ok):
GET /api/auth/consume?token=TOKEN_AQUI
```json
{
  "ok": true,
  "data": {
    "message": "Sesión activa."
  }
}
```

Consume (401):
```json
{
  "ok": false,
  "error": {
    "code": "UNAUTHENTICATED",
    "message": "El link expiró o es inválido.",
    "details": null,
    "timestamp": "2025-01-10T09:00:00Z"
  }
}
```

Session (ok):
```json
{
  "ok": true,
  "data": {
    "user": {
      "email": "user@example.com",
      "status": "ACTIVE"
    }
  }
}
```

Session (401):
```json
{
  "ok": false,
  "error": {
    "code": "UNAUTHENTICATED",
    "message": "Necesitas iniciar sesión.",
    "details": null,
    "timestamp": "2025-01-10T09:00:00Z"
  }
}
```
