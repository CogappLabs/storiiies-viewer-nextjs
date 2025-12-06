-- CreateEnum
CREATE TYPE "ImageSourceType" AS ENUM ('url', 'manifest', 'upload');

-- CreateTable
CREATE TABLE "ImageSource" (
    "id" TEXT NOT NULL,
    "infoJsonUrl" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "sourceType" "ImageSourceType" NOT NULL,
    "originalName" TEXT,
    "manifestUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ImageSource_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ImageSource_infoJsonUrl_key" ON "ImageSource"("infoJsonUrl");

-- Migrate existing Story data to ImageSource
-- First, create ImageSource records for existing stories
INSERT INTO "ImageSource" ("id", "infoJsonUrl", "width", "height", "sourceType", "createdAt", "updatedAt")
SELECT gen_random_uuid(), "imageUrl", "imageWidth", "imageHeight", 'url'::"ImageSourceType", "createdAt", "updatedAt"
FROM "Story"
ON CONFLICT ("infoJsonUrl") DO NOTHING;

-- Migrate existing Image records (uploads) to ImageSource
INSERT INTO "ImageSource" ("id", "infoJsonUrl", "width", "height", "sourceType", "originalName", "createdAt", "updatedAt")
SELECT
    i."id",
    CONCAT((SELECT COALESCE(current_setting('app.blob_base_url', true), 'https://blob.vercel-storage.com')), '/iiif/', i."id", '/info.json'),
    i."width",
    i."height",
    'upload'::"ImageSourceType",
    i."originalName",
    i."createdAt",
    i."updatedAt"
FROM "Image" i
ON CONFLICT ("infoJsonUrl") DO NOTHING;

-- Add imageSourceId column to Story (nullable initially)
ALTER TABLE "Story" ADD COLUMN "imageSourceId" TEXT;

-- Update Story to reference the ImageSource based on imageUrl
UPDATE "Story" s
SET "imageSourceId" = (
    SELECT is2."id"
    FROM "ImageSource" is2
    WHERE is2."infoJsonUrl" = s."imageUrl"
);

-- Make imageSourceId NOT NULL
ALTER TABLE "Story" ALTER COLUMN "imageSourceId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Story_imageSourceId_key" ON "Story"("imageSourceId");

-- AddForeignKey
ALTER TABLE "Story" ADD CONSTRAINT "Story_imageSourceId_fkey" FOREIGN KEY ("imageSourceId") REFERENCES "ImageSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Drop old columns from Story
ALTER TABLE "Story" DROP COLUMN "imageUrl";
ALTER TABLE "Story" DROP COLUMN "imageWidth";
ALTER TABLE "Story" DROP COLUMN "imageHeight";
ALTER TABLE "Story" DROP COLUMN IF EXISTS "imageId";

-- Drop old Image table
DROP TABLE IF EXISTS "Image";
