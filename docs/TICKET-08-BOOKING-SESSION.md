# TICKET-08 - Booking con sesion

## Que cambio
- POST /api/bookings ya no acepta userId; deriva el usuario desde la sesion.
- GET /api/bookings/me devuelve reservas del usuario autenticado.
- La concurrencia se prueba usando cookie atlas_session.

## QA rapida
1) set DATABASE_URL=URL_AQUI
2) pnpm -C apps/api run db:generate
3) pnpm -C apps/api run db:push
4) pnpm -C apps/api run db:seed (copiar serviceId y startAt)
5) pnpm -C apps/api run dev
6) POST /api/auth/request-link (dev) y abrir devLink
7) Capturar cookie atlas_session del response
8) set SERVICE_ID=TOKEN_SERVICE_ID
9) set ATLAS_SESSION=TOKEN_SESSION
10) pnpm -C apps/api run qa:concurrency

## Nota
- UI nunca pide IDs; los IDs solo se usan internamente.
- /api/bookings/me ordena por startAt asc.
