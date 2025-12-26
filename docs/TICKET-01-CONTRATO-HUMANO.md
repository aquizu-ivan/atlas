# TICKET-01 - Contrato Humano

## Principios
- No pedir user_id ni identificadores al usuario.
- La identidad nace en backend y se deriva en la UI.
- Separacion clara Usuario / Admin / Instrumentacion.
- Front premium no es consola tecnica.
- "Funciona" = habitable sin explicacion.
- Mensajes humanos primero; lo tecnico queda para observabilidad.

## Actores
- Usuario final
- Admin
- Sistema (backend observable)

## User journeys
- Registro / entrada por email magico (link): ingresa email y accede desde el link.
- Sesion valida y expiracion (alto nivel): se mantiene activa hasta expirar; luego pide nuevo link.
- Ver servicios publicos: explora oferta disponible.
- Elegir slot/horario: selecciona fecha y hora disponibles.
- Confirmar reserva: revisa resumen y confirma.
- Ver "Mis reservas": lista proximas y pasadas.
- Cancelar: confirma cancelacion y ve estado final.
- Reprogramar: elige nuevo horario disponible.
- Admin: gestionar servicios, ver agenda, ver usuarios (sin IDs).

## Reglas humanas
Mensajes por paso:
- "Te enviamos un link para entrar."
- "Sesion activa."
- "Selecciona un horario disponible."
- "Reserva confirmada."
- "Reserva cancelada."
- "Reserva reprogramada."

Errores visibles:
- "El link expiro. Solicita uno nuevo."
- "Ese horario ya no esta disponible."
- "No pudimos confirmar tu reserva. Intenta otra vez."
- "No tienes acceso a esta accion."
