-- CreateTable
CREATE TABLE "business_profiles" (
    "profile_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "business_name" VARCHAR(255) NOT NULL,
    "ruc" VARCHAR(20) NOT NULL,
    "address" VARCHAR(500),
    "phone" VARCHAR(50),
    "email" VARCHAR(255),
    "settings" JSONB DEFAULT '{}',
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "business_profiles_pkey" PRIMARY KEY ("profile_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "business_profiles_user_id_key" ON "business_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "business_profiles_ruc_key" ON "business_profiles"("ruc");

-- CreateIndex
CREATE INDEX "idx_business_profiles_user_id" ON "business_profiles"("user_id");

-- AddForeignKey
ALTER TABLE "business_profiles" ADD CONSTRAINT "business_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;
