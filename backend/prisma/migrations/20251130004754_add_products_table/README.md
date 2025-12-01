# Migration: add_products_table

**Timestamp:** 2025-11-30 00:47:54  
**Migration ID:** `20251130004754_add_products_table`

## Overview

This is the **initial migration** that sets up the core database schema for the Fulbo application. It establishes all base tables, enums, indexes, and foreign key relationships.

## Changes

### Extensions

- Enables **PostGIS** extension for geographic data support

### Enums Created

| Enum Name | Values |
|-----------|--------|
| `booking_status` | `pending`, `confirmed`, `cancelled` |
| `payment_status` | `pending`, `succeeded`, `failed` |
| `user_role` | `player`, `manager` |
| `auth_provider_type` | `email`, `google`, `facebook`, `apple` |
| `discount_type` | `percentage`, `fixed_amount` |
| `product_category` | `bebida`, `snack`, `equipo`, `promocion` |

### Tables Created

#### `users`
Core user table for both players and field managers.

| Column | Type | Constraints |
|--------|------|-------------|
| `user_id` | UUID | PRIMARY KEY |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL |
| `password_hash` | VARCHAR(255) | NULLABLE |
| `phone_number` | VARCHAR(50) | NULLABLE |
| `role` | user_role | DEFAULT 'player' |
| `auth_provider` | auth_provider_type | DEFAULT 'email' |
| `auth_provider_id` | VARCHAR(255) | NULLABLE |
| `first_name` | VARCHAR(100) | NOT NULL |
| `last_name` | VARCHAR(100) | NOT NULL |
| `city` | VARCHAR(100) | NULLABLE |
| `district` | VARCHAR(100) | NULLABLE |
| `document_type` | VARCHAR(20) | NULLABLE |
| `document_number` | VARCHAR(20) | NULLABLE |
| `created_at` | TIMESTAMPTZ(6) | DEFAULT CURRENT_TIMESTAMP |
| `updated_at` | TIMESTAMPTZ(6) | DEFAULT CURRENT_TIMESTAMP |

#### `fields`
Soccer fields/courts owned by managers.

| Column | Type | Constraints |
|--------|------|-------------|
| `field_id` | UUID | PRIMARY KEY |
| `owner_id` | UUID | FK → users(user_id) |
| `name` | VARCHAR(255) | NOT NULL |
| `address` | TEXT | NOT NULL |
| `description` | TEXT | NULLABLE |
| `location` | GEOGRAPHY | PostGIS point (NULLABLE) |
| `amenities` | JSONB | DEFAULT '{}' |
| `base_price_per_hour` | DECIMAL(10,2) | NOT NULL |
| `created_at` | TIMESTAMPTZ(6) | DEFAULT CURRENT_TIMESTAMP |
| `updated_at` | TIMESTAMPTZ(6) | DEFAULT CURRENT_TIMESTAMP |
| `deleted_at` | TIMESTAMPTZ(6) | NULLABLE (soft delete) |

#### `field_photos`
Photos associated with fields.

| Column | Type | Constraints |
|--------|------|-------------|
| `photo_id` | UUID | PRIMARY KEY |
| `field_id` | UUID | FK → fields(field_id) ON DELETE CASCADE |
| `image_url` | VARCHAR(1024) | NOT NULL |
| `is_cover` | BOOLEAN | DEFAULT false |
| `created_at` | TIMESTAMPTZ(6) | DEFAULT CURRENT_TIMESTAMP |

#### `bookings`
Reservations made by players.

| Column | Type | Constraints |
|--------|------|-------------|
| `booking_id` | UUID | PRIMARY KEY |
| `player_id` | UUID | FK → users(user_id) ON DELETE SET NULL |
| `field_id` | UUID | FK → fields(field_id) ON DELETE CASCADE |
| `start_time` | TIMESTAMPTZ(6) | NOT NULL |
| `end_time` | TIMESTAMPTZ(6) | NOT NULL |
| `total_price` | DECIMAL(10,2) | NOT NULL |
| `status` | booking_status | DEFAULT 'pending' |
| `created_at` | TIMESTAMPTZ(6) | DEFAULT CURRENT_TIMESTAMP |
| `updated_at` | TIMESTAMPTZ(6) | DEFAULT CURRENT_TIMESTAMP |

#### `payments`
Payment records for bookings.

| Column | Type | Constraints |
|--------|------|-------------|
| `payment_id` | UUID | PRIMARY KEY |
| `booking_id` | UUID | FK → bookings(booking_id) ON DELETE CASCADE |
| `amount` | DECIMAL(10,2) | NOT NULL |
| `status` | payment_status | DEFAULT 'pending' |
| `payment_gateway_id` | VARCHAR(255) | NULLABLE |
| `created_at` | TIMESTAMPTZ(6) | DEFAULT CURRENT_TIMESTAMP |
| `updated_at` | TIMESTAMPTZ(6) | DEFAULT CURRENT_TIMESTAMP |

#### `reviews`
Player reviews for fields.

| Column | Type | Constraints |
|--------|------|-------------|
| `review_id` | UUID | PRIMARY KEY |
| `field_id` | UUID | FK → fields(field_id) ON DELETE CASCADE |
| `player_id` | UUID | FK → users(user_id) ON DELETE SET NULL (NULLABLE) |
| `rating` | SMALLINT | NOT NULL |
| `comment` | TEXT | NULLABLE |
| `created_at` | TIMESTAMPTZ(6) | DEFAULT CURRENT_TIMESTAMP |

**Unique Constraint:** `(field_id, player_id)` - One review per player per field.

#### `promotions`
Discount promotions for fields.

| Column | Type | Constraints |
|--------|------|-------------|
| `promotion_id` | UUID | PRIMARY KEY |
| `field_id` | UUID | FK → fields(field_id) ON DELETE CASCADE |
| `title` | VARCHAR(255) | NOT NULL |
| `description` | TEXT | NULLABLE |
| `discount_type` | discount_type | NOT NULL |
| `discount_value` | DECIMAL(10,2) | NOT NULL |
| `start_date` | TIMESTAMPTZ(6) | NOT NULL |
| `end_date` | TIMESTAMPTZ(6) | NOT NULL |
| `is_active` | BOOLEAN | DEFAULT true |
| `created_at` | TIMESTAMPTZ(6) | DEFAULT CURRENT_TIMESTAMP |
| `updated_at` | TIMESTAMPTZ(6) | DEFAULT CURRENT_TIMESTAMP |
| `deleted_at` | TIMESTAMPTZ(6) | NULLABLE (soft delete) |

#### `products`
Products sold at fields (drinks, snacks, equipment).

| Column | Type | Constraints |
|--------|------|-------------|
| `product_id` | UUID | PRIMARY KEY |
| `field_id` | UUID | FK → fields(field_id) ON DELETE CASCADE |
| `name` | VARCHAR(255) | NOT NULL |
| `description` | TEXT | NULLABLE |
| `price` | DECIMAL(10,2) | NOT NULL |
| `image_url` | VARCHAR(1024) | NULLABLE |
| `category` | product_category | NOT NULL |
| `is_active` | BOOLEAN | DEFAULT true |
| `created_at` | TIMESTAMPTZ(6) | DEFAULT CURRENT_TIMESTAMP |
| `updated_at` | TIMESTAMPTZ(6) | DEFAULT CURRENT_TIMESTAMP |
| `deleted_at` | TIMESTAMPTZ(6) | NULLABLE (soft delete) |

### Indexes Created

| Index Name | Table | Columns | Type |
|------------|-------|---------|------|
| `idx_users_email` | users | email | B-tree |
| `idx_fields_owner_id` | fields | owner_id | B-tree |
| `idx_fields_location` | fields | location | GiST (spatial) |
| `idx_bookings_field_id` | bookings | field_id | B-tree |
| `idx_bookings_player_id` | bookings | player_id | B-tree |
| `idx_payments_booking_id` | payments | booking_id | B-tree |
| `idx_reviews_field_id` | reviews | field_id | B-tree |
| `idx_promotions_field_id` | promotions | field_id | B-tree |
| `idx_products_field_id` | products | field_id | B-tree |

### Foreign Keys

| Table | Column | References | On Delete |
|-------|--------|------------|-----------|
| fields | owner_id | users(user_id) | RESTRICT |
| field_photos | field_id | fields(field_id) | CASCADE |
| bookings | player_id | users(user_id) | SET NULL |
| bookings | field_id | fields(field_id) | CASCADE |
| payments | booking_id | bookings(booking_id) | CASCADE |
| reviews | field_id | fields(field_id) | CASCADE |
| reviews | player_id | users(user_id) | SET NULL |
| promotions | field_id | fields(field_id) | CASCADE |
| products | field_id | fields(field_id) | CASCADE |

## Entity Relationship Diagram (Simplified)

```
users ─────────────────┬─────────────────┐
  │                    │                 │
  ▼                    ▼                 ▼
fields              bookings          reviews
  │                    │
  ├── field_photos     └── payments
  ├── promotions
  └── products
```

## Rollback

To rollback this migration, all tables, enums, and the PostGIS extension would need to be dropped in reverse order of creation.
