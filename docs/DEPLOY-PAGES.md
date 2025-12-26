# Deploy Pages

Apps/web se publica en GitHub Pages mediante GitHub Actions.
El build usa Vite con base "/atlas/" en production y "/" en dev.

## Contrato de entorno
VITE_API_BASE_URL define el ORIGIN del backend (sin /api).
- Produccion recomendada: https://atlas-atlas.up.railway.app
- Dev local: http://localhost:4000
Si no se setea la variable, el front usa esos valores por defecto.

## Configurar variable en GitHub
1) Repo Settings -> Secrets and variables -> Actions -> Variables
2) Add variable VITE_API_BASE_URL con valor VITE_API_BASE_URL_AQUI
   Recomendado: https://atlas-atlas.up.railway.app

## Deploy
El workflow construye apps/web y publica apps/web/dist en Pages cuando el push es a main.

## Nota sobre Auth en Pages
- Para request-link, session y logout, el backend debe permitir CORS con credentials desde el origin de Pages.
- VITE_API_BASE_URL debe apuntar al backend de Railway y no incluir /api.
- Al abrir el link magico se redirige a /atlas/?auth=success.
