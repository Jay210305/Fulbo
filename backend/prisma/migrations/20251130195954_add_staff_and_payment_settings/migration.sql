-- CreateEnum
CREATE TYPE "staff_role" AS ENUM ('encargado', 'administrador', 'recepcionista', 'mantenimiento');

-- CreateTable
CREATE TABLE "staff_members" (
    "staff_id" UUID NOT NULL,
    "manager_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(50),
    "role" "staff_role" NOT NULL DEFAULT 'encargado',
    "permissions" JSONB DEFAULT '{}',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "staff_members_pkey" PRIMARY KEY ("staff_id")
);

-- CreateTable
CREATE TABLE "payment_settings" (
    "setting_id" UUID NOT NULL,
    "manager_id" UUID NOT NULL,
    "yape_enabled" BOOLEAN NOT NULL DEFAULT false,
    "yape_phone" VARCHAR(50),
    "plin_enabled" BOOLEAN NOT NULL DEFAULT false,
    "plin_phone" VARCHAR(50),
    "bank_transfer_enabled" BOOLEAN NOT NULL DEFAULT false,
    "bank_name" VARCHAR(100),
    "bank_account_number" VARCHAR(50),
    "bank_account_holder" VARCHAR(255),
    "bank_cci" VARCHAR(50),
    "cash_enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_settings_pkey" PRIMARY KEY ("setting_id")
);

-- CreateIndex
CREATE INDEX "idx_staff_members_manager_id" ON "staff_members"("manager_id");

-- CreateIndex
CREATE UNIQUE INDEX "payment_settings_manager_id_key" ON "payment_settings"("manager_id");

-- CreateIndex
CREATE INDEX "idx_payment_settings_manager_id" ON "payment_settings"("manager_id");

-- AddForeignKey
ALTER TABLE "staff_members" ADD CONSTRAINT "staff_members_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "payment_settings" ADD CONSTRAINT "payment_settings_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;
