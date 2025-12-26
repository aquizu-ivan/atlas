# Auth Flow

## Flujo humano
1) El usuario ingresa su email en la web.
2) Se envia un link magico por email.
3) Al abrir el link se activa la cookie de sesion y se redirige a Pages con ?auth=success.
4) La UI refresca la sesion y muestra el email.
5) Logout revoca sesion y limpia cookie.

## Produccion vs dev
- En production no se devuelve devLink en la respuesta.
- En dev/test se puede devolver devLink para QA rapida.
- Si se activa un modo demo en production (AUTH_DEV_LINKS=true), el link solo aparece en logs del servidor.

## Variables esperadas
- PUBLIC_BASE_URL=https://atlas-atlas.up.railway.app
- AUTH_REDIRECT_BASE_URL=https://aquizu-ivan.github.io/atlas
- AUTH_DEV_LINKS=false
- AUTH_SESSION_TTL_DAYS=7
- AUTH_TOKEN_TTL_MINUTES=15

## QA reproducible
Dev:
1) POST /api/auth/request-link con email demo
2) Usar devLink y luego GET /api/auth/session
3) POST /api/auth/logout y luego GET /api/auth/session

Prod:
1) En Pages, pedir link con email demo
2) Abrir el link recibido en email
3) Confirmar redirect a /atlas/?auth=success y sesion Online
4) Logout y luego session Offline

Nota: nunca se expone token ni link magico en UI en production.
