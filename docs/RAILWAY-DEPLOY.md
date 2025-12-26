# Railway Deploy

Este repo usa pnpm como package manager canonico y se ejecuta con corepack.
Se evita usar -C para que Railway no duplique rutas de trabajo.

## Comandos recomendados en Railway
Build Command:
corepack enable && corepack prepare pnpm@9.15.4 --activate && corepack pnpm install && corepack pnpm run railway:build

Start Command:
corepack enable && corepack prepare pnpm@9.15.4 --activate && corepack pnpm run railway:start

## Por que corepack pnpm
- Evita el error "pnpm: not found" en entornos donde se detecta npm por defecto.
- Fija la version de pnpm declarada en packageManager.

## Scripts de root
- railway:build ejecuta db:generate del backend con workspace filter.
- railway:start inicia el backend con workspace filter.

## Variables de entorno en Railway
- NODE_ENV=production
- DATABASE_URL=DATABASE_URL_AQUI
- CORS_ORIGIN=https://aquizu-ivan.github.io,http://localhost:5173
- PUBLIC_BASE_URL=https://atlas-atlas.up.railway.app
- AUTH_REDIRECT_BASE_URL=https://aquizu-ivan.github.io/atlas
- AUTH_DEV_LINKS=false
- AUTH_SESSION_TTL_DAYS=7
- AUTH_TOKEN_TTL_MINUTES=15

Nota: PUBLIC_BASE_URL y AUTH_REDIRECT_BASE_URL deben estar definidos en production para generar links y redirects correctos.
