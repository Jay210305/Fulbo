-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "guest_name" VARCHAR(255),
ADD COLUMN     "guest_phone" VARCHAR(50),
ALTER COLUMN "player_id" DROP NOT NULL;
