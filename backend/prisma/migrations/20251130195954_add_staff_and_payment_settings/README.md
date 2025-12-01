# Migration: add_staff_and_payment_settings

**Timestamp:** 2025-11-30 19:59:54  
**Migration ID:** `20251130195954_add_staff_and_payment_settings`

## Overview

This migration adds two key features for field managers:
1. **Staff Management**: Ability to add and manage staff members with different roles and permissions
2. **Payment Settings**: Configuration for different payment methods (Yape, Plin, bank transfer, cash)

## Changes

### Enums Created

| Enum Name | Values | Description |
|-----------|--------|-------------|
| `staff_role` | `encargado`, `administrador`, `recepcionista`, `mantenimiento` | Role types for staff members |

### Tables Created

#### `staff_members`
Staff members who work for a field manager.

| Column | Type | Constraints |
|--------|------|-------------|
| `staff_id` | UUID | PRIMARY KEY |
| `manager_id` | UUID | FK → users(user_id) ON DELETE CASCADE |
| `name` | VARCHAR(255) | NOT NULL |
| `email` | VARCHAR(255) | NOT NULL |
| `phone` | VARCHAR(50) | NULLABLE |
| `role` | staff_role | DEFAULT 'encargado' |
| `permissions` | JSONB | DEFAULT '{}' |
| `is_active` | BOOLEAN | DEFAULT true |
| `created_at` | TIMESTAMPTZ(6) | DEFAULT CURRENT_TIMESTAMP |
| `updated_at` | TIMESTAMPTZ(6) | DEFAULT CURRENT_TIMESTAMP |
| `deleted_at` | TIMESTAMPTZ(6) | NULLABLE (soft delete) |

#### `payment_settings`
Payment method configuration for each manager (one-to-one with users).

| Column | Type | Constraints |
|--------|------|-------------|
| `setting_id` | UUID | PRIMARY KEY |
| `manager_id` | UUID | UNIQUE, FK → users(user_id) ON DELETE CASCADE |
| `yape_enabled` | BOOLEAN | DEFAULT false |
| `yape_phone` | VARCHAR(50) | NULLABLE |
| `plin_enabled` | BOOLEAN | DEFAULT false |
| `plin_phone` | VARCHAR(50) | NULLABLE |
| `bank_transfer_enabled` | BOOLEAN | DEFAULT false |
| `bank_name` | VARCHAR(100) | NULLABLE |
| `bank_account_number` | VARCHAR(50) | NULLABLE |
| `bank_account_holder` | VARCHAR(255) | NULLABLE |
| `bank_cci` | VARCHAR(50) | NULLABLE (interbank code) |
| `cash_enabled` | BOOLEAN | DEFAULT true |
| `created_at` | TIMESTAMPTZ(6) | DEFAULT CURRENT_TIMESTAMP |
| `updated_at` | TIMESTAMPTZ(6) | DEFAULT CURRENT_TIMESTAMP |

### Indexes Created

| Index Name | Table | Columns | Purpose |
|------------|-------|---------|---------|
| `idx_staff_members_manager_id` | staff_members | manager_id | Fast lookup by manager |
| `idx_payment_settings_manager_id` | payment_settings | manager_id | Fast lookup by manager |

### Unique Constraints

| Constraint | Table | Columns | Purpose |
|------------|-------|---------|---------|
| `payment_settings_manager_id_key` | payment_settings | manager_id | One payment config per manager |

### Foreign Keys

| Table | Column | References | On Delete |
|-------|--------|------------|-----------|
| staff_members | manager_id | users(user_id) | CASCADE |
| payment_settings | manager_id | users(user_id) | CASCADE |

## Staff Roles

| Role | Spanish | Description |
|------|---------|-------------|
| `encargado` | Encargado | General staff member |
| `administrador` | Administrador | Administrator with elevated permissions |
| `recepcionista` | Recepcionista | Receptionist for handling check-ins |
| `mantenimiento` | Mantenimiento | Maintenance staff |

## Permissions JSON Schema (Suggested)

```json
{
  "bookings": {
    "view": true,
    "create": true,
    "edit": false,
    "cancel": false
  },
  "fields": {
    "view": true,
    "edit": false
  },
  "payments": {
    "view": true,
    "process": false
  },
  "reports": {
    "view": false
  }
}
```

## Payment Methods (Peru-specific)

| Method | Description |
|--------|-------------|
| **Yape** | Popular mobile payment app by BCP |
| **Plin** | Mobile payment network (BBVA, Interbank, Scotiabank) |
| **Bank Transfer** | Traditional bank transfer with CCI (interbank code) |
| **Cash** | In-person cash payment |

## Example Usage

### Adding a staff member
```sql
INSERT INTO staff_members (staff_id, manager_id, name, email, phone, role, permissions)
VALUES (
  gen_random_uuid(),
  'manager-user-uuid',
  'Juan Pérez',
  'juan.perez@email.com',
  '+51 999 111 222',
  'recepcionista',
  '{"bookings": {"view": true, "create": true}}'::jsonb
);
```

### Setting up payment methods
```sql
INSERT INTO payment_settings (setting_id, manager_id, yape_enabled, yape_phone, plin_enabled, plin_phone, cash_enabled)
VALUES (
  gen_random_uuid(),
  'manager-user-uuid',
  true,
  '999888777',
  true,
  '999888777',
  true
);
```

## Relationship Diagram

```
users (role = 'manager')
  │
  ├── staff_members (1:N)
  │     ├── staff_id (PK)
  │     ├── manager_id (FK)
  │     ├── name, email, phone
  │     ├── role (enum)
  │     ├── permissions (JSONB)
  │     └── is_active, deleted_at
  │
  └── payment_settings (1:1)
        ├── setting_id (PK)
        ├── manager_id (FK, UNIQUE)
        ├── yape_enabled, yape_phone
        ├── plin_enabled, plin_phone
        ├── bank_transfer_enabled, bank_*
        └── cash_enabled
```

## Rollback

To rollback this migration:
1. Drop the `payment_settings` table
2. Drop the `staff_members` table
3. Drop the `staff_role` enum
