# CORS

El API usa CORS con credentials habilitadas (cookies).
Comportamiento:
- Si CORS_ORIGIN esta definido, se usa como lista de origins permitidos (separados por coma).
- Si CORS_ORIGIN esta vacio, se permiten solo:
  - https://aquizu-ivan.github.io
  - http://localhost:5173
  - http://localhost:3000
- Cuando el origin no esta permitido, no se lanza error; la respuesta omite headers CORS.

## Ejemplos
Local (por defecto):
- set CORS_ORIGIN=

Local (custom):
- set CORS_ORIGIN=http://localhost:5173

Railway (Pages + local):
- set CORS_ORIGIN=https://aquizu-ivan.github.io,http://localhost:5173

Prod (multiple origins):
- set CORS_ORIGIN=https://app.atlas.com,https://admin.atlas.com
