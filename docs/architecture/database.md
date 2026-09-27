# Database architecture

The backend uses PostgreSQL 16 with Prisma 7. The schema is in
`backend/prisma/schema.prisma`; Prisma configuration is in `backend/prisma.config.ts`.
Changing either requires a reviewed migration plus a generated client refresh (see
[ADR 004](../decisions/004-prisma-7.md)).

The schema models users and manager business profiles, fields and photos, bookings
and their products, schedules, products, promotions, reviews, and payment settings.
Notifications and integration toggles are stored as `Json` on the business profile
and field amenities.

## Enums

| Enum | Values |
|------|--------|
| `Role` | `PLAYER`, `MANAGER` |
| `FieldType` | `FIVE_V_FIVE`, `SEVEN_V_SEVEN`, `ELEVEN_V_ELEVEN` |
| `FieldStatus` | `ACTIVE`, `MAINTENANCE` |
| `ProductCategory` | `BEBIDA`, `SNACK`, `EQUIPO`, `PROMOCION` |
| `DiscountType` | `PERCENTAGE`, `FIXED_AMOUNT`, `TWO_FOR_ONE` |
| `BookingStatus` | `PENDING`, `CONFIRMED`, `CANCELLED` |
| `PaymentStatus` | `PENDING`, `SUCCEEDED`, `FAILED` |

## Models

### User

Account and player profile. `email` is unique. `password` is nullable to support
social-only accounts. `role` defaults to `PLAYER`. Carries identity fields
(`firstName`, `lastName`, `phoneNumber`, `phoneVerified`, `avatar`,
`documentType`, `documentNumber`, `city`, `district`), player profile fields
(`position`, `bio`, `gameLevel` — 1–5 stars), and relations to `Field`, `Booking`,
`Review`, `BusinessProfile`, and `PaymentSettings`.

### BusinessProfile

One-to-one with `User` (`userId` unique). Manager business identity:
`businessName`, `ruc` (11-digit Peru RUC), optional `address`, `phone`, `email`,
and a `Json` `settings` bag for notification/integration toggles.

### Field

Owned by a `User` via `ownerId`. Booking venue: `name`, `address`, `description`,
`type`, optional `surface` and `capacity`, `basePricePerHour`, optional
`weekendSurcharge` and `nightSurcharge`, `status` (default `ACTIVE`), `amenities`
(`Json`), and FulVaso options (`hasFullVaso`, `fullVasoPromo`). Relates to photos,
products, promotions, bookings, schedule blocks, and reviews.

### FieldPhoto

Field image with `url` and `isCover`. Cascades on field delete.

### Product (FulVaso item)

Belongs to a `Field`. `name`, `description`, `price`, `image`, `category`, and
`isActive` (default true). Relates to `BookingProduct`. Cascades on field delete.

### Promotion

Optionally belongs to a `Field` (`fieldId` nullable, cascades on delete). `title`,
`description`, `discountType`, `discountValue`, `startDate`, `endDate`, `isActive`,
`image`.

### Booking

Player reservation: `playerId`, `fieldId`, `startTime`, `endTime`, `totalPrice`,
`status` (default `PENDING`), `paymentMethod` (`visa`, `yape`, `plin`, `cash`,
`transfer`), `paymentStatus` (default `PENDING`), `matchName`, and related
`BookingProduct[]`. Indexed on `[fieldId, startTime, endTime]` for conflict
detection.

### BookingProduct

Join row between a booking and a product: `quantity` and `priceAtTime` (snapshot of
the product price at booking time). Cascades on booking delete.

### ScheduleBlock

Manager block on a field: `fieldId`, `startTime`, `endTime`, `reason`
(maintenance, personal, event), `note`, `createdBy`. Indexed on
`[fieldId, startTime, endTime]`. Cascades on field delete.

### Review

Belongs to a `Field`; `playerId` is nullable. `rating` (1–5), `comment`, and
Spanish `tags` (`String[]`). Unique on `[fieldId, playerId]` — one review per player
per field. Cascades on field delete.

### PaymentSettings

One-to-one with `User` (`userId` unique). Peru payment channels: Yape
(`yapeEnabled`, `yapePhone`), Plin (`plinEnabled`, `plinPhone`), bank transfer
(`bankTransferEnabled`, `bankName`, `bankAccountNumber`, `bankAccountHolder`,
`bankCci`), and `cashEnabled` (default true).

## Migration and verification rules

Database changes require a reviewed Prisma migration, generated client refresh, and
tests for the affected business rule — especially booking-conflict and ownership
logic. See the [current backend plan](../plans/current/backend.md) for the booking
conflict algorithm.
