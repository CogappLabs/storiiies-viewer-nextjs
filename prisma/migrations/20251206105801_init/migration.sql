-- CreateTable
CREATE TABLE "Story" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT,
    "description" TEXT,
    "attribution" TEXT,
    "imageUrl" TEXT NOT NULL,
    "imageWidth" INTEGER NOT NULL,
    "imageHeight" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Story_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Annotation" (
    "id" TEXT NOT NULL,
    "storyId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "x" DOUBLE PRECISION NOT NULL,
    "y" DOUBLE PRECISION NOT NULL,
    "width" DOUBLE PRECISION NOT NULL,
    "height" DOUBLE PRECISION NOT NULL,
    "viewportX" DOUBLE PRECISION,
    "viewportY" DOUBLE PRECISION,
    "viewportWidth" DOUBLE PRECISION,
    "viewportHeight" DOUBLE PRECISION,
    "ordinal" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Annotation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnnotationImage" (
    "id" TEXT NOT NULL,
    "annotationId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "ordinal" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnnotationImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Annotation_storyId_idx" ON "Annotation"("storyId");

-- CreateIndex
CREATE INDEX "Annotation_storyId_ordinal_idx" ON "Annotation"("storyId", "ordinal");

-- CreateIndex
CREATE INDEX "AnnotationImage_annotationId_idx" ON "AnnotationImage"("annotationId");

-- CreateIndex
CREATE INDEX "AnnotationImage_annotationId_ordinal_idx" ON "AnnotationImage"("annotationId", "ordinal");

-- AddForeignKey
ALTER TABLE "Annotation" ADD CONSTRAINT "Annotation_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "Story"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnnotationImage" ADD CONSTRAINT "AnnotationImage_annotationId_fkey" FOREIGN KEY ("annotationId") REFERENCES "Annotation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
