/*
  Warnings:

  - You are about to drop the `Provider` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Assignment" DROP CONSTRAINT "Assignment_providerId_fkey";

-- DropTable
DROP TABLE "public"."Provider";

-- CreateTable
CREATE TABLE "public"."provider" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "specialty" TEXT NOT NULL,
    "availability" JSONB NOT NULL,

    CONSTRAINT "provider_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Assignment" ADD CONSTRAINT "Assignment_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "public"."provider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
