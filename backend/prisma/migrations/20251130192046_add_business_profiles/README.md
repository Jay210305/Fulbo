# Migration: add_business_profiles

**Timestamp:** 2025-11-30 19:20:46  
**Migration ID:** `20251130192046_add_business_profiles`

## Overview

This migration adds the **business profiles** feature, allowing field managers to store their business/company information including RUC (tax ID) and contact details.

## Changes

### Tables Created

#### `business_profiles`
Business information for field managers (one-to-one with users).

| Column | Type | Constraints |
|--------|------|-------------|
| `profile_id` | UUID | PRIMARY KEY |
| `user_id` | UUID | UNIQUE, FK → users(user_id) ON DELETE CASCADE |
| `business_name` | VARCHAR(255) | NOT NULL |
| `ruc` | VARCHAR(20) | UNIQUE, NOT NULL (Peru tax ID) |
| `address` | VARCHAR(500) | NULLABLE |
| `phone` | VARCHAR(50) | NULLABLE |
| `email` | VARCHAR(255) | NULLABLE (business email) |
| `settings` | JSONB | DEFAULT '{}' (custom settings) |
| `created_at` | TIMESTAMPTZ(6) | DEFAULT CURRENT_TIMESTAMP |
| `updated_at` | TIMESTAMPTZ(6) | DEFAULT CURRENT_TIMESTAMP |

### Indexes Created

| Index Name | Table | Columns | Purpose |
|------------|-------|---------|---------|
| `idx_business_profiles_user_id` | business_profiles | user_id | Fast lookup by user |

### Unique Constraints

| Constraint | Table | Columns | Purpose |
|------------|-------|---------|---------|
| `business_profiles_user_id_key` | business_profiles | user_id | One profile per user |
| `business_profiles_ruc_key` | business_profiles | ruc | Unique tax ID per business |

### Foreign Keys

| Table | Column | References | On Delete |
|-------|--------|------------|-----------|
| business_profiles | user_id | users(user_id) | CASCADE |

## Business Logic

- Each **manager** user can have exactly one business profile
- The **RUC** (Registro Único de Contribuyentes) is Peru's tax identification number
- The **settings** JSONB field can store custom business configurations:
  - Notification preferences
  - Default booking rules
  - Custom branding options

## Example Usage

```sql
-- Create a business profile for a manager
INSERT INTO business_profiles (profile_id, user_id, business_name, ruc, address, phone, email)
VALUES (
  gen_random_uuid(),
  'manager-user-uuid',
  'Canchas El Golazo S.A.C.',
  '20123456789',
  'Av. Javier Prado 1234, San Isidro, Lima',
  '+51 999 888 777',
  'contacto@elgolazo.pe'
);
```

## Relationship Diagram

```
users (role = 'manager')
  │
  └── business_profiles (1:1)
        ├── profile_id (PK)
        ├── user_id (FK, UNIQUE)
        ├── business_name
        ├── ruc (UNIQUE)
        ├── address
        ├── phone
        ├── email
        └── settings (JSONB)
```

## Settings JSON Schema (Suggested)

```json
{
  "notifications": {
    "email_on_booking": true,
    "sms_on_booking": false,
    "daily_summary": true
  },
  "booking_rules": {
    "min_advance_hours": 2,
    "max_advance_days": 30,
    "cancellation_hours": 24
  },
  "branding": {
    "logo_url": "https://...",
    "primary_color": "#4CAF50"
  }
}
```

## Rollback

To rollback this migration:
1. Drop the `business_profiles` table (indexes and constraints will be dropped automatically)
