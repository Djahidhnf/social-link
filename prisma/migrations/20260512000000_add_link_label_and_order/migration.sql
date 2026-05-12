-- AlterTable
ALTER TABLE "links" ADD COLUMN "label" TEXT,
                    ADD COLUMN "order" INTEGER NOT NULL DEFAULT 0;
