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
