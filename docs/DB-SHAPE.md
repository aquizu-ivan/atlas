# DB Shape (FASE 2A)

FASE 2A define el shape ejecutable sin migraciones.
En este ticket NO existe apps/api/prisma/migrations/.

## Entidades y enums
- UserStatus: ACTIVE, DISABLED
- BookingStatus: PENDING, CONFIRMED, CANCELED
- User, Service, Booking (resumen en schema.prisma).

## Constraint canonica
- unique(serviceId, startAt) para colision de slot por servicio.
- La app mapeara colisiones a 409 BOOKING_CONFLICT.

## Nota
No resolvemos no-overlap por rango todavia; queda para ticket avanzado futuro.
