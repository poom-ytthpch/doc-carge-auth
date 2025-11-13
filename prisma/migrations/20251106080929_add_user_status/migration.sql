-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'IN_ACTIVE');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE';
