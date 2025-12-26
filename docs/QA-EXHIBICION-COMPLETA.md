# QA Exhibicion Completa

Secuencia de verificacion en local, en orden canonico:

1) Health
- powershell -Command "Invoke-RestMethod http://localhost:4000/api/health"
- Esperado: ok true, service atlas-api.

2) Contrato (rutas)
- Ver docs/API-CONTRACT.md y docs/ERROR-CONTRACT.md.
- Confirmar rutas base: /api/health, /api/auth/request-link, /api/auth/consume,
  /api/auth/session, /api/bookings, /api/bookings/me.

3) Accion (request-link -> consume -> session)
- curl -X POST http://localhost:4000/api/auth/request-link -H "Content-Type: application/json" -d "{\"email\":\"demo@atlas.local\"}"
- Abrir el devLink devuelto en el navegador (dev/test) para recibir Set-Cookie.
- curl http://localhost:4000/api/auth/session -H "Cookie: atlas_session=TOKEN_AQUI"

4) Colision (409 con concurrencia)
- set SERVICE_ID=SERVICE_ID_AQUI
- set ATLAS_SESSION=TOKEN_AQUI
- pnpm -C apps/api run qa:concurrency
- Esperado: 1 status 201 y N-1 status 409.

5) UX (web UI sin errores)
- pnpm -C apps/web run dev
- Abrir http://localhost:5173 y confirmar estado Online, env, y DB conectado si aplica.

## Informe CodexMax de Rutas + Assets
- Pages usa base /atlas/ en production.
- En Pages, la URL debe ser https://aquizu-ivan.github.io/atlas/.
- Verificar que los assets cargan desde /atlas/assets/... y no desde /assets/ absoluto.
- Verificar que las llamadas a API usan VITE_API_BASE_URL y no rutas relativas rotas.
