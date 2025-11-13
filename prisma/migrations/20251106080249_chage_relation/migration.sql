/*
  Warnings:

  - You are about to drop the column `mobile` on the `Role` table. All the data in the column will be lost.
  - Added the required column `userId` to the `Role` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Role" DROP CONSTRAINT "Role_mobile_fkey";

-- AlterTable
ALTER TABLE "Role" DROP COLUMN "mobile",
ADD COLUMN     "userId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Role" ADD CONSTRAINT "Role_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
