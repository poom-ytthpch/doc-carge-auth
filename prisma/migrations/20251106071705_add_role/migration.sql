/*
  Warnings:

  - Made the column `pin` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "RoleType" AS ENUM ('ROOT', 'ADMIN', 'USER', 'GUEST');

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "pin" SET NOT NULL;

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "type" "RoleType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "mobile" TEXT NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Role" ADD CONSTRAINT "Role_mobile_fkey" FOREIGN KEY ("mobile") REFERENCES "User"("mobile") ON DELETE RESTRICT ON UPDATE CASCADE;
