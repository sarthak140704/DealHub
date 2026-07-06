-- AlterTable
ALTER TABLE "Deal" ADD COLUMN "imageUrl" TEXT;

-- CreateTable
CREATE TABLE "DealClick" (
    "id" TEXT NOT NULL,
    "dealId" TEXT NOT NULL,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DealClick_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DealClick_dealId_idx" ON "DealClick"("dealId");

-- CreateIndex
CREATE INDEX "DealClick_createdAt_idx" ON "DealClick"("createdAt");

-- AddForeignKey
ALTER TABLE "DealClick" ADD CONSTRAINT "DealClick_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DealClick" ADD CONSTRAINT "DealClick_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
