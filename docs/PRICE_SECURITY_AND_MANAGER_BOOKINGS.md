# Price Security & Manager Manual Bookings

## Overview

This document describes the implementation of **Price Security** and **Manager Manual Bookings** features in the Fulbo booking system.

**Implementation Date:** December 1, 2025  
**Migration:** `20251201203159_add_guest_booking_fields`

---

## Features Implemented

### 1. Price Security 🔒

Players can no longer manipulate booking prices from the frontend. All pricing is now calculated server-side.

#### How It Works:
- The `totalPrice` field from frontend requests is **ignored**
- Backend calculates the real price using `calculateBookingPrice()` method
- Price calculation considers:
  - Field's `base_price_per_hour`
  - Booking duration in hours
  - Active promotions (percentage or fixed discounts)
  - Best applicable discount is automatically applied

#### Price Calculation Logic:
```typescript
// 1. Fetch field base price
// 2. Calculate duration: (endTime - startTime) in hours
// 3. Base total = basePricePerHour × durationHours
// 4. Apply best promotion (highest percentage discount wins)
// 5. Return final price rounded to 2 decimals
```

---

### 2. Manager Manual Bookings 📞

Managers can now create "Walk-in" or "Phone" reservations for guests who don't have an app account.

#### New Database Fields:
| Field | Type | Description |
|-------|------|-------------|
| `player_id` | `String?` | Now **optional** - null for guest bookings |
| `guest_name` | `String?` | Guest's name for manual bookings |
| `guest_phone` | `String?` | Guest's phone number for contact |

#### Manager Privileges:
- ✅ Create bookings without a registered player
- ✅ Booking is immediately **confirmed** (bypasses payment flow)
- ✅ Payment record created as `CASH` type
- ✅ Field ownership is verified before allowing booking

#### Player Restrictions:
- ❌ Cannot create bookings without authentication
- ❌ Cannot manipulate prices
- ⏳ Booking goes through normal payment flow

---

## API Changes

### POST `/api/bookings` - Create Booking

#### Request Body (Updated):
```json
{
  "fieldId": "uuid",
  "startTime": "2025-12-15T10:00:00Z",
  "endTime": "2025-12-15T11:00:00Z",
  "totalPrice": 50.00,        // Optional - IGNORED by backend
  "paymentMethod": "yape",    // Optional
  "matchName": "Partido Domingo", // Optional
  "guestName": "Juan Pérez",  // NEW - Optional (for managers)
  "guestPhone": "987654321"   // NEW - Optional (for managers)
}
```

#### New Error Responses:
| Status | Code | Message |
|--------|------|---------|
| 404 | `FIELD_NOT_FOUND` | Cancha no encontrada |
| 403 | `UNAUTHORIZED_FIELD_ACCESS` | No tienes permiso para crear reservas en esta cancha |
| 400 | `PLAYER_ID_REQUIRED` | Se requiere ID de jugador para esta reserva |

---

## Files Modified

### Backend

| File | Changes |
|------|---------|
| `prisma/schema.prisma` | Added `guest_name`, `guest_phone`; made `player_id` optional |
| `src/services/booking.service.ts` | Added `calculateBookingPrice()`, role-based booking logic |
| `src/controllers/booking.controller.ts` | Extract role, pass guest info to service |
| `src/schemas/booking.schema.ts` | Added `guestName`, `guestPhone`; made `totalPrice` optional |

### Database Migration

```sql
-- Migration: 20251201203159_add_guest_booking_fields
ALTER TABLE "bookings" ALTER COLUMN "player_id" DROP NOT NULL;
ALTER TABLE "bookings" ADD COLUMN "guest_name" VARCHAR(255);
ALTER TABLE "bookings" ADD COLUMN "guest_phone" VARCHAR(50);
```

---

## Usage Examples

### Manager Creating a Walk-in Booking:
```typescript
// Request from Manager dashboard
POST /api/bookings
Authorization: Bearer <manager_token>

{
  "fieldId": "cancha-uuid",
  "startTime": "2025-12-15T18:00:00Z",
  "endTime": "2025-12-15T19:00:00Z",
  "guestName": "Carlos Rodríguez",
  "guestPhone": "912345678"
}
```

### Player Creating a Normal Booking:
```typescript
// Request from Player app
POST /api/bookings
Authorization: Bearer <player_token>

{
  "fieldId": "cancha-uuid",
  "startTime": "2025-12-15T20:00:00Z",
  "endTime": "2025-12-15T21:00:00Z",
  "paymentMethod": "yape"
}
// Note: totalPrice is calculated by backend
```

---

## Security Considerations

1. **Price Manipulation Prevention**: Frontend prices are completely ignored
2. **Field Ownership Verification**: Managers can only book on fields they own
3. **Role-Based Access**: JWT token contains user role for authorization
4. **Guest Booking Audit Trail**: `guest_name` and `guest_phone` stored for records

---

## Testing Checklist

- [ ] Player cannot submit fake prices
- [ ] Manager can create booking without player account
- [ ] Manager cannot book on fields they don't own
- [ ] Promotions are correctly applied to calculated price
- [ ] Guest bookings show correctly in manager dashboard
- [ ] Email notifications work for registered players only

---

## Future Improvements

- [ ] Add `booked_by` field to track which manager created guest booking
- [ ] SMS notification for guest phone numbers
- [ ] Guest booking conversion to registered player account
- [ ] Price breakdown in booking response (base price, discount, final)
