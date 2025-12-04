-- CreateTable
CREATE TABLE "AnnotationImage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "annotationId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "ordinal" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AnnotationImage_annotationId_fkey" FOREIGN KEY ("annotationId") REFERENCES "Annotation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "AnnotationImage_annotationId_idx" ON "AnnotationImage"("annotationId");

-- CreateIndex
CREATE INDEX "AnnotationImage_annotationId_ordinal_idx" ON "AnnotationImage"("annotationId", "ordinal");
