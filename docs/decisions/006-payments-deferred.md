# ADR 006: Defer payments and real-time features to Phase 2

## Decision

Ship Phase 1 without Mercado Pago payment processing, real-time chat (Socket.IO),
the social graph, teams, search events, advertising, staff management, and push
notifications. Payment state is tracked on bookings but processed manually.

## Rationale

The core value is end-to-end booking and manager field administration. Payments and
realtime features add external-service and infrastructure complexity that would
delay a working booking flow.

## Consequences

- `Booking.paymentMethod` and `Booking.paymentStatus` are recorded, but no gateway
  charges are executed in Phase 1.
- Manager payment settings (Yape, Plin, bank transfer, cash) describe how the
  manager collects payment off-platform.
- Introducing Mercado Pago later must not change the existing booking contract.
