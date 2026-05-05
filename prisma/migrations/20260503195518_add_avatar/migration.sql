/*
  Warnings:

  - The values [SNAPCHAT,ADDRESS,PHONE] on the enum `Platform` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Platform_new" AS ENUM ('GITHUB', 'TWITTER', 'LINKEDIN', 'INSTAGRAM', 'YOUTUBE', 'TIKTOK', 'FACEBOOK', 'WEBSITE', 'OTHER');
ALTER TABLE "links" ALTER COLUMN "platform" TYPE "Platform_new" USING ("platform"::text::"Platform_new");
ALTER TYPE "Platform" RENAME TO "Platform_old";
ALTER TYPE "Platform_new" RENAME TO "Platform";
DROP TYPE "public"."Platform_old";
COMMIT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "avatar_url" TEXT;
