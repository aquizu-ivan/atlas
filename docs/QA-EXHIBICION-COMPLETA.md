# QA Exhibicion Completa

Secuencia de verificacion en local, en orden canonico:

1) Health
- powershell -Command "Invoke-RestMethod http://localhost:4000/api/health"
- Esperado: ok true, service atlas-api.

2) Contrato (rutas)
- Ver docs/API-CONTRACT.md y docs/ERROR-CONTRACT.md.
- Confirmar rutas base: /api/health, /api/auth/request-link, /api/auth/consume,
  /api/auth/session, /api/bookings, /api/bookings/me.

3) Accion (request-link -> consume -> session)
- curl -X POST http://localhost:4000/api/auth/request-link -H "Content-Type: application/json" -d "{\"email\":\"demo@atlas.local\"}"
- Abrir el devLink devuelto en el navegador (dev/test) para recibir Set-Cookie.
- curl http://localhost:4000/api/auth/session -H "Cookie: atlas_session=TOKEN_AQUI"

4) Colision (409 con concurrencia)
- set SERVICE_ID=SERVICE_ID_AQUI
- set ATLAS_SESSION=TOKEN_AQUI
- pnpm -C apps/api run qa:concurrency
- Esperado: 1 status 201 y N-1 status 409.

5) UX (web UI sin errores)
- pnpm -C apps/web run dev
- Abrir http://localhost:5173 y confirmar estado Online, env, y DB conectado si aplica.

## Informe CodexMax de Rutas + Assets
- Pages usa base /atlas/ en production.
- En Pages, la URL debe ser https://aquizu-ivan.github.io/atlas/.
- Verificar que los assets cargan desde /atlas/assets/... y no desde /assets/ absoluto.
- Verificar que las llamadas a API usan VITE_API_BASE_URL y no rutas relativas rotas.

## QA Produccion (Pages -> Railway)
Precondicion: AUTH_DEV_LINKS=true para mostrar acceso DEV en UI.
1) Abrir https://aquizu-ivan.github.io/atlas/ y confirmar Health Online.
2) En Auth, usar request-link con email demo.
3) Si AUTH_DEV_LINKS=true, debe aparecer un acceso DEV con botones Copiar/Abrir.
4) Abrir el link recibido (email o acceso DEV) y verificar redirect a /atlas/?auth=success o /atlas/#auth=success&devToken=TOKEN.
4) "Actualizar" debe mostrar Sesion activa con email.
5) Cerrar sesion y luego "Actualizar" debe mostrar "Necesitas iniciar sesion".
6) DevTools -> Application -> Cookies:
   - Debe existir atlas_session con Secure=true y SameSite=None.
   - La cookie es HttpOnly y no debe ser visible en JS.

Fallback DEV (cookies bloqueadas):
1) Abrir Pages y enviar request-link.
2) Abrir devLink -> vuelve a /atlas/#auth=success&devToken=TOKEN.
3) La UI guarda devToken en sessionStorage y limpia el hash.
4) Actualizar sesion -> 200 usando Authorization: Bearer devToken.
5) Reservar y ver Mis reservas sin 401.

## Booking Flow (Web)
1) Health online en Pages.
2) Auth session online.
3) Servicios cargan (select habilitado).
4) Elegir servicio + fecha -> disponibilidad carga.
5) Seleccionar slot -> confirmar reserva -> booking OK o 409 controlado.
6) Mis reservas: Activas muestra PENDING/CONFIRMED y el Historial muestra CANCELED.
7) Cancel OK y mueve la reserva al Historial.
8) Deep link: abrir /atlas/?service=focus&date=YYYY-MM-DD y precarga servicio+fecha.
9) Presets: Hoy / Manana / Prox. 7 dias actualizan fecha y URL sin recargar.
10) Reprogramar: en Mis reservas, click "Reprogramar" -> elegir nuevo slot -> confirmar reprogramacion.
11) Reprogramar: reserva original queda cancelada y la nueva aparece en Activas.
12) Estados: PENDING muestra "Pendiente (a confirmar)", CONFIRMED "Confirmada".

## Admin (Read-only)
1) Abrir Admin y ver "Acceso restringido".
2) Ingresar ADMIN_ACCESS_TOKEN y "Conectar" -> estado "Conectado".
3) Agenda: seleccionar fecha -> lista ordenada por hora.
4) Agenda: si PENDING -> confirmar; si CONFIRMED -> cancelar; CANCELED sin acciones.
5) Usuarios: lista read-only con email y createdAt.
6) Token invalido -> 401 y vuelve a "Acceso restringido".
7) Servicios: crear servicio -> aparece en lista Admin y en Reservar (servicios activos).
8) Servicios: editar nombre/duracion y activar/desactivar reflejado en la lista.

Nota: si los endpoints de servicios/disponibilidad/reservas no existen, la UI muestra "Not available yet" sin romper.

Mensajes esperados:
- 401: "Necesitas iniciar sesion" + CTA suave a Auth.
- 409: "Ese horario ya no esta disponible."
- 5xx/network: "No se pudo conectar" + boton Reintentar.

## QA con curl (CORS)
Health con Origin:
- curl -i -H "Origin: https://aquizu-ivan.github.io" https://atlas-atlas.up.railway.app/api/health
Session con Origin (sin cookie):
- curl -i -H "Origin: https://aquizu-ivan.github.io" https://atlas-atlas.up.railway.app/api/auth/session
Preflight:
- curl -i -X OPTIONS -H "Origin: https://aquizu-ivan.github.io" -H "Access-Control-Request-Method: POST" https://atlas-atlas.up.railway.app/api/auth/logout
Session con cookie (manual):
- curl -i -H "Origin: https://aquizu-ivan.github.io" -H "Cookie: atlas_session=ATLAS_SESSION_AQUI" https://atlas-atlas.up.railway.app/api/auth/session

Servicios con Origin:
- curl -i -H "Origin: https://aquizu-ivan.github.io" https://atlas-atlas.up.railway.app/api/services

Disponibilidad con Origin:
- curl -i -H "Origin: https://aquizu-ivan.github.io" "https://atlas-atlas.up.railway.app/api/availability?serviceId=svc_basic&date=2025-12-27"

Nota de disponibilidad:
- Slots cada 30 min entre 09:00 y 17:00 UTC para la fecha solicitada.

Bookings/me sin sesion (espera 401):
- curl -i -H "Origin: https://aquizu-ivan.github.io" https://atlas-atlas.up.railway.app/api/bookings/me

## QA Tecnico (script reproducible)
Script sin dependencias externas:
- pnpm run qa:exhibicion

Con argumentos:
- pnpm run qa:exhibicion -- --pages=https://aquizu-ivan.github.io/atlas/ --api=https://atlas-atlas.up.railway.app

Evidencia esperada:
- health: status 200 y ok:true
- session-origin: status 200 o 401, nunca 500, con Access-Control-Allow-Origin y Access-Control-Allow-Credentials
- preflight: status 200/204/401 con headers CORS
- invalid-origin: status 200 sin Access-Control-Allow-Origin
- bookings-post-unauth: status 401 (no 404)
- bookings-post-auth: status 200/201 (o 409 si ya existe el slot) cuando AUTH_DEV_LINKS=true
- admin-services: si ADMIN_ACCESS_TOKEN esta definido, crea servicio y lo ve en /api/services
- admin-booking-confirm: si ADMIN_ACCESS_TOKEN esta definido, confirma booking y devuelve status CONFIRMED

Nota:
- No se exponen tokens ni cookies completas.
- En prod, devLink solo aparece si AUTH_DEV_LINKS=true; si no, el flujo requiere email real.
- El fallback devToken solo funciona cuando AUTH_DEV_LINKS=true.

## QA Web local
- pnpm -r run build
- pnpm -C apps/web run dev
- Abrir http://localhost:5173

## Pulido UX final
Checklist visual:
- Panels y cards con espaciado consistente.
- Botones con mismo alto, hover suave y estados disabled claros.
- Jerarquia tipografica clara (titulo > label > note).
- "Estado del sistema" colapsable al final, cerrado por defecto.

Checklist teclado:
- Tab order continuo en inputs/select/botones/slots.
- Focus visible consistente en botones, inputs y slots.
- Mensajes de estado anuncian cambios (aria-live polite).

Checklist estados:
- Loading/empty/error/success en Auth, Reservar, Mis reservas, Admin.
- Errores por causa: 401/409/400/5xx y network con mensajes humanos.
- Sin flashes bruscos al refrescar listas (reservas, admin servicios).

## Experiencia final usuario
Checklist orden editorial:
- Reservar -> Mis reservas -> Modo admin -> Estado del sistema (colapsado).
- Cada seccion tiene titulo y linea guia.

Checklist modo admin:
- Boton "Activar modo admin" visible y Admin oculto por defecto.
- Al activar, muestra token + agenda + usuarios + servicios.
- Al desactivar, vuelve a ocultar y mantiene token en sessionStorage.

Checklist limpieza de ruido:
- No hay URLs ni diagnosticos fuera de "Estado del sistema".
- Labels tecnicos solo dentro de "Estado del sistema" o Modo admin.

## TICKET-31 - Premium UI Pass
1) Zoom 100% / 125% / 150%: filas de Auth/Admin sin solapes.
2) Paso 1: sin ruido cuando hay seleccion; hint solo si falta servicio.
3) Paso 3: resumen con Servicio/Fecha/Hora y CTA full width.
4) Mis reservas: Activas/Historial plegables con hover suave en cards.
5) Admin: secciones plegables + usuarios muestran Alta (dd/mm/aaaa).
6) Estado del sistema sigue colapsado y sin ruido en plano usuario.

## TICKET-33 - IAQUIZU Identity Pass
1) Hero: solo una vez ATLAS (eyebrow IAQUIZU + H1 ATLAS).
2) Acordeones: cue consistente (filete izquierdo + chevron) en Mis reservas/Admin/Estado del sistema.
3) Mis reservas: Activas/Historial con aire y hover suave, sin ruido extra.
4) Zoom 100% / 125% / 150% sin solapes en summaries e inputs.

## TICKET-34 - Premium final
1) Hover/active/disabled consistente en botones, slots y summaries.
2) Admin compacto con listas contenidas (scroll suave en listas largas).
3) Focus visible consistente en todos los elementos interactivos.
4) Zoom 100% / 125% / 150% sin solapes.
