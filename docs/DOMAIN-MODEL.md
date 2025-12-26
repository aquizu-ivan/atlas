# Domain Model

## Entidades
User:
- email
- displayName?
- createdAt
- status

Service:
- name
- durationMinutes
- rules?
- isActive

Booking:
- user
- service
- startAt
- endAt
- status
- createdAt

## Reglas
- Estados de Booking: pending, confirmed, canceled.
- Transiciones permitidas: pending -> confirmed, pending -> canceled, confirmed -> canceled.
- Reprogramacion: ajusta startAt/endAt de una reserva confirmada si hay slot libre; si no, conflicto.

Nota: DB constraints resolveran colisiones; la app solo mapea a 409.
