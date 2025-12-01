-- CreateEnum
CREATE TYPE "schedule_block_reason" AS ENUM ('maintenance', 'personal', 'event');

-- CreateTable
CREATE TABLE "schedule_blocks" (
    "block_id" UUID NOT NULL,
    "field_id" UUID NOT NULL,
    "start_time" TIMESTAMPTZ(6) NOT NULL,
    "end_time" TIMESTAMPTZ(6) NOT NULL,
    "reason" "schedule_block_reason" NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "schedule_blocks_pkey" PRIMARY KEY ("block_id")
);

-- CreateIndex
CREATE INDEX "idx_schedule_blocks_field_id" ON "schedule_blocks"("field_id");

-- CreateIndex
CREATE INDEX "idx_schedule_blocks_time_range" ON "schedule_blocks"("start_time", "end_time");

-- AddForeignKey
ALTER TABLE "schedule_blocks" ADD CONSTRAINT "schedule_blocks_field_id_fkey" FOREIGN KEY ("field_id") REFERENCES "fields"("field_id") ON DELETE CASCADE ON UPDATE NO ACTION;
