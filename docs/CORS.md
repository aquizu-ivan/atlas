# CORS

El API usa CORS con credentials habilitadas (cookies).
Comportamiento:
- Si CORS_ORIGIN esta definido, se usa como lista de origins permitidos (separados por coma).
- En development/test y CORS_ORIGIN vacio, se permiten solo:
  - http://localhost:5173
  - http://localhost:3000
- En production y CORS_ORIGIN vacio, el server falla al iniciar.

## Ejemplos
Local (por defecto):
- set CORS_ORIGIN=

Local (custom):
- set CORS_ORIGIN=http://localhost:5173

Prod (multiple origins):
- set CORS_ORIGIN=https://app.atlas.com,https://admin.atlas.com
