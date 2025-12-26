# QA Concurrency Demo

Objetivo: demostrar 1x201 y N-1x409 al crear bookings concurrentes con sesion valida.

## Pasos reproducibles
1) Configurar DATABASE_URL:
   - set DATABASE_URL=URL_AQUI
2) Instalar dependencias (preferible en root):
   - pnpm install
   - (alternativa) pnpm -C apps/api install
3) Generar cliente Prisma:
   - pnpm -C apps/api run db:generate
4) Crear shape en DB limpia:
   - pnpm -C apps/api run db:push
5) Sembrar datos demo (copiar serviceId y startAt):
   - pnpm -C apps/api run db:seed
6) Levantar API (otra terminal):
   - pnpm -C apps/api run dev
7) Solicitar magic link (dev):
   - POST http://localhost:4000/api/auth/request-link con { "email": "demo@atlas.local" }
8) Abrir el devLink y capturar la cookie atlas_session:
   - GET http://localhost:4000/api/auth/consume?token=TOKEN_AQUI
9) Exportar variables para QA:
   - set SERVICE_ID=TOKEN_SERVICE_ID
   - set ATLAS_SESSION=TOKEN_SESSION
   - (opcional) set START_AT=2025-01-10T10:00:00Z
   - set N=10
10) Ejecutar prueba de concurrencia:
   - pnpm -C apps/api run qa:concurrency

## Output esperado (resumen)
{
  "success201": 1,
  "conflict409": 9,
  "ok": true
}

Nota: la colision 409 se produce por unique(serviceId, startAt).
