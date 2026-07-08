-- CreateTable
CREATE TABLE "DealAlert" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "categoryId" TEXT,
    "keyword" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DealAlert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DealAlert_userId_idx" ON "DealAlert"("userId");

-- CreateIndex
CREATE INDEX "DealAlert_categoryId_idx" ON "DealAlert"("categoryId");

-- AddForeignKey
ALTER TABLE "DealAlert" ADD CONSTRAINT "DealAlert_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DealAlert" ADD CONSTRAINT "DealAlert_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
