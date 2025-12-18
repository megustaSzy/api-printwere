/*
  Warnings:

  - You are about to drop the column `revoked` on the `AccessToken` table. All the data in the column will be lost.
  - You are about to drop the column `revoked` on the `RefreshToken` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[tokenId]` on the table `AccessToken` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tokenId]` on the table `RefreshToken` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "AccessToken_token_idx";

-- DropIndex
DROP INDEX "AccessToken_token_key";

-- DropIndex
DROP INDEX "AccessToken_userId_idx";

-- DropIndex
DROP INDEX "RefreshToken_token_idx";

-- DropIndex
DROP INDEX "RefreshToken_token_key";

-- DropIndex
DROP INDEX "RefreshToken_userId_idx";

-- AlterTable
ALTER TABLE "AccessToken" DROP COLUMN "revoked",
ADD COLUMN     "tokenId" TEXT;

-- AlterTable
ALTER TABLE "RefreshToken" DROP COLUMN "revoked",
ADD COLUMN     "tokenId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "AccessToken_tokenId_key" ON "AccessToken"("tokenId");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_tokenId_key" ON "RefreshToken"("tokenId");
