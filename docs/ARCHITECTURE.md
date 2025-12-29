# Architecture

## Vision general
ATLAS es una agenda premium con flujo humano y confirmacion administrativa. El sistema prioriza claridad, silencio visual y confiabilidad, sin exponer detalles tecnicos al usuario final.

## Arquitectura de alto nivel
- Front: Vite + JS vanilla, una sola pagina con secciones editoriales.
- API: Node + Express, contratos canonicos y error shape unico.
- DB: Postgres (Neon) con Prisma como schema y client.

## Separacion de planos
- Usuario: reserva, historial, cancelacion y reprogramacion.
- Admin: agenda diaria, usuarios y servicios, acceso por token.
- Sistema: health y diagnostico tecnico (colapsado en UI).

## Estados de reserva
- PENDING
- CONFIRMED
- CANCELED

## Seguridad (alto nivel)
- Auth por link magico con token de un solo uso.
- Admin por token, separado de la sesion de usuario.
- No exposicion de secretos ni tokens en frontend.

## QA y confiabilidad
- Script reproducible: `pnpm run qa:exhibicion`.
- Endpoint `/api/health` para observabilidad.
- CORS con credentials y allowlist para Pages + Railway.
