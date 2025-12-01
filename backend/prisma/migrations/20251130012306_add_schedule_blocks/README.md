# Migration: add_schedule_blocks

**Timestamp:** 2025-11-30 01:23:06  
**Migration ID:** `20251130012306_add_schedule_blocks`

## Overview

This migration adds the **schedule blocking system** that allows field managers to block time slots for maintenance, personal reasons, or special events.

## Changes

### Enums Created

| Enum Name | Values | Description |
|-----------|--------|-------------|
| `schedule_block_reason` | `maintenance`, `personal`, `event` | Reason for blocking the time slot |

### Tables Created

#### `schedule_blocks`
Blocked time slots for fields where bookings are not allowed.

| Column | Type | Constraints |
|--------|------|-------------|
| `block_id` | UUID | PRIMARY KEY |
| `field_id` | UUID | FK → fields(field_id) ON DELETE CASCADE |
| `start_time` | TIMESTAMPTZ(6) | NOT NULL |
| `end_time` | TIMESTAMPTZ(6) | NOT NULL |
| `reason` | schedule_block_reason | NOT NULL |
| `note` | TEXT | NULLABLE (additional details) |
| `created_at` | TIMESTAMPTZ(6) | DEFAULT CURRENT_TIMESTAMP |
| `updated_at` | TIMESTAMPTZ(6) | DEFAULT CURRENT_TIMESTAMP |

### Indexes Created

| Index Name | Table | Columns | Purpose |
|------------|-------|---------|---------|
| `idx_schedule_blocks_field_id` | schedule_blocks | field_id | Fast lookup by field |
| `idx_schedule_blocks_time_range` | schedule_blocks | (start_time, end_time) | Efficient time range queries |

### Foreign Keys

| Table | Column | References | On Delete |
|-------|--------|------------|-----------|
| schedule_blocks | field_id | fields(field_id) | CASCADE |

## Use Cases

1. **Maintenance blocks**: When the field needs maintenance or repairs
2. **Personal blocks**: Manager's personal time (vacation, etc.)
3. **Event blocks**: Reserved for special events or tournaments

## Example Usage

```sql
-- Block a field for maintenance on December 1st, 2025
INSERT INTO schedule_blocks (block_id, field_id, start_time, end_time, reason, note)
VALUES (
  gen_random_uuid(),
  'field-uuid-here',
  '2025-12-01 08:00:00+00',
  '2025-12-01 12:00:00+00',
  'maintenance',
  'Grass replacement'
);
```

## Relationship Diagram

```
fields
  │
  └── schedule_blocks (1:N)
        ├── block_id (PK)
        ├── field_id (FK)
        ├── start_time
        ├── end_time
        ├── reason (enum)
        └── note
```

## Rollback

To rollback this migration:
1. Drop the `schedule_blocks` table
2. Drop the `schedule_block_reason` enum
