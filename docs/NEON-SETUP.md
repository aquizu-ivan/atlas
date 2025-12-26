# Neon Setup

## Pasos (Windows)
1) pnpm install
2) pnpm -C apps/api run setup:neon

El script solicita DATABASE_URL, limpia comillas si las pegas, crea apps/api/.env (ignorado por git) y ejecuta:
- prisma validate
- prisma generate
- prisma db push

## Seguridad
- No pegues DATABASE_URL en issues o PRs.
- No commitees apps/api/.env ni ningun .env.
- Si necesitas compartir, usa un canal seguro y rota el secreto despues.