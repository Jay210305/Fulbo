-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- CreateEnum
CREATE TYPE "booking_status" AS ENUM ('pending', 'confirmed', 'cancelled');

-- CreateEnum
CREATE TYPE "payment_status" AS ENUM ('pending', 'succeeded', 'failed');

-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('player', 'manager');

-- CreateEnum
CREATE TYPE "auth_provider_type" AS ENUM ('email', 'google', 'facebook', 'apple');

-- CreateEnum
CREATE TYPE "discount_type" AS ENUM ('percentage', 'fixed_amount');

-- CreateEnum
CREATE TYPE "product_category" AS ENUM ('bebida', 'snack', 'equipo', 'promocion');

-- CreateTable
CREATE TABLE "bookings" (
    "booking_id" UUID NOT NULL,
    "player_id" UUID NOT NULL,
    "field_id" UUID NOT NULL,
    "start_time" TIMESTAMPTZ(6) NOT NULL,
    "end_time" TIMESTAMPTZ(6) NOT NULL,
    "total_price" DECIMAL(10,2) NOT NULL,
    "status" "booking_status" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("booking_id")
);

-- CreateTable
CREATE TABLE "field_photos" (
    "photo_id" UUID NOT NULL,
    "field_id" UUID NOT NULL,
    "image_url" VARCHAR(1024) NOT NULL,
    "is_cover" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "field_photos_pkey" PRIMARY KEY ("photo_id")
);

-- CreateTable
CREATE TABLE "fields" (
    "field_id" UUID NOT NULL,
    "owner_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "address" TEXT NOT NULL,
    "description" TEXT,
    "location" geography,
    "amenities" JSONB DEFAULT '{}',
    "base_price_per_hour" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "fields_pkey" PRIMARY KEY ("field_id")
);

-- CreateTable
CREATE TABLE "promotions" (
    "promotion_id" UUID NOT NULL,
    "field_id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "discount_type" "discount_type" NOT NULL,
    "discount_value" DECIMAL(10,2) NOT NULL,
    "start_date" TIMESTAMPTZ(6) NOT NULL,
    "end_date" TIMESTAMPTZ(6) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "promotions_pkey" PRIMARY KEY ("promotion_id")
);

-- CreateTable
CREATE TABLE "products" (
    "product_id" UUID NOT NULL,
    "field_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "image_url" VARCHAR(1024),
    "category" "product_category" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "products_pkey" PRIMARY KEY ("product_id")
);

-- CreateTable
CREATE TABLE "payments" (
    "payment_id" UUID NOT NULL,
    "booking_id" UUID NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" "payment_status" NOT NULL DEFAULT 'pending',
    "payment_gateway_id" VARCHAR(255),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("payment_id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "review_id" UUID NOT NULL,
    "field_id" UUID NOT NULL,
    "player_id" UUID,
    "rating" SMALLINT NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("review_id")
);

-- CreateTable
CREATE TABLE "users" (
    "user_id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255),
    "phone_number" VARCHAR(50),
    "role" "user_role" NOT NULL DEFAULT 'player',
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "auth_provider" "auth_provider_type" NOT NULL DEFAULT 'email',
    "auth_provider_id" VARCHAR(255),
    "city" VARCHAR(100),
    "district" VARCHAR(100),
    "document_number" VARCHAR(20),
    "document_type" VARCHAR(20),
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateIndex
CREATE INDEX "idx_bookings_field_id" ON "bookings"("field_id");

-- CreateIndex
CREATE INDEX "idx_bookings_player_id" ON "bookings"("player_id");

-- CreateIndex
CREATE INDEX "idx_fields_location" ON "fields" USING GIST ("location");

-- CreateIndex
CREATE INDEX "idx_fields_owner_id" ON "fields"("owner_id");

-- CreateIndex
CREATE INDEX "idx_promotions_field_id" ON "promotions"("field_id");

-- CreateIndex
CREATE INDEX "idx_products_field_id" ON "products"("field_id");

-- CreateIndex
CREATE INDEX "idx_payments_booking_id" ON "payments"("booking_id");

-- CreateIndex
CREATE INDEX "idx_reviews_field_id" ON "reviews"("field_id");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_field_id_player_id_key" ON "reviews"("field_id", "player_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "idx_users_email" ON "users"("email");

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_field_id_fkey" FOREIGN KEY ("field_id") REFERENCES "fields"("field_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "field_photos" ADD CONSTRAINT "field_photos_field_id_fkey" FOREIGN KEY ("field_id") REFERENCES "fields"("field_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "fields" ADD CONSTRAINT "fields_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "promotions" ADD CONSTRAINT "promotions_field_id_fkey" FOREIGN KEY ("field_id") REFERENCES "fields"("field_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_field_id_fkey" FOREIGN KEY ("field_id") REFERENCES "fields"("field_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("booking_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_field_id_fkey" FOREIGN KEY ("field_id") REFERENCES "fields"("field_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE NO ACTION;
