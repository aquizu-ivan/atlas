# Prisma Tooling Smoke

Objetivo: verificar Node/pnpm/prisma y que @prisma/client se pueda importar.

## Comandos
- pnpm install
- pnpm rebuild prisma @prisma/client
- pnpm -C apps/api run db:generate
- pnpm -C apps/api run dev
- pnpm -C apps/api run qa:tooling

## Output esperado
- node -v imprime version de Node
- pnpm -v imprime version de pnpm
- prisma -v imprime version de prisma
- "prisma client ok" al final

## DATABASE_URL
DATABASE_URL define la cadena de conexion a Postgres.
Opcion A (Neon cloud):
- set DATABASE_URL=DATABASE_URL_AQUI
Opcion B (Postgres local por Docker):
- Si ya tienes un contenedor local, usa su string de conexion.
- Ejemplo generico: set DATABASE_URL=DATABASE_URL_AQUI
