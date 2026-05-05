/*
  Warnings:

  - The values [GITHUB,TWITTER,LINKEDIN] on the enum `Platform` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Platform_new" AS ENUM ('INSTAGRAM', 'FACEBOOK', 'SNAPCHAT', 'TIKTOK', 'PHONE', 'MAPS', 'WEBSITE', 'YOUTUBE', 'OTHER');
ALTER TABLE "links" ALTER COLUMN "platform" TYPE "Platform_new" USING ("platform"::text::"Platform_new");
ALTER TYPE "Platform" RENAME TO "Platform_old";
ALTER TYPE "Platform_new" RENAME TO "Platform";
DROP TYPE "public"."Platform_old";
COMMIT;
