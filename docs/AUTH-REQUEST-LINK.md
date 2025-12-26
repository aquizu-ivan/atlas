# Auth Request Link

## Flujo
- POST /api/auth/request-link recibe { email }.
- Valida email y crea o asegura el User por email.
- Genera un token aleatorio de un solo uso y guarda solo su hash.
- Responde con mensaje humano y, en dev/test, un devLink para QA.

## TTL y uso unico
- AUTH_TOKEN_TTL_MINUTES controla expiracion (default 15).
- usedAt queda null hasta que el token se consume en ticket futuro.

## Dev vs prod
- AUTH_DEV_LINKS true en development/test devuelve devLink.
- En production no se devuelve devLink.
- PUBLIC_BASE_URL se usa para construir la URL del devLink.

## Ejemplos
Request:
```json
{
  "email": "user@example.com"
}
```

Response (dev/test):
```json
{
  "ok": true,
  "data": {
    "message": "Te enviamos un link para entrar.",
    "devLink": "http://localhost:4000/api/auth/consume?token=TOKEN_AQUI"
  }
}
```

Response (production):
```json
{
  "ok": true,
  "data": {
    "message": "Te enviamos un link para entrar."
  }
}
```

Error 400 (email invalido):
```json
{
  "ok": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Invalid email",
    "details": { "email": "bad" },
    "timestamp": "2025-01-10T09:00:00Z"
  }
}
```

Error 503 (DB no configurada):
```json
{
  "ok": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Database not configured",
    "details": { "configured": false },
    "timestamp": "2025-01-10T09:00:00Z"
  }
}
```
