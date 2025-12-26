# Cookie Contract

Cookie de sesion:
- Name: atlas_session
- HttpOnly: true
- Path: /
- Max-Age y Expires coherentes con AUTH_SESSION_TTL_DAYS
- En production:
  - Secure: true
  - SameSite: none
- En development/test:
  - Secure: false
  - SameSite: lax

La cookie se setea en /api/auth/consume y se limpia en /api/auth/logout.
No se expone el token en el body.

## Proxy
En production se habilita trust proxy para que Express confie en el proxy de Railway.
