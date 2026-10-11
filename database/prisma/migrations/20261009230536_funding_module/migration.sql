-- CreateEnum
CREATE TYPE "FundingType" AS ENUM ('EQUITY', 'GRANT', 'DEBT', 'REVENUE_SHARE', 'OTHER');

-- CreateEnum
CREATE TYPE "FundingStatus" AS ENUM ('RECORDED', 'VERIFIED', 'APPROVED', 'DISBURSED', 'RECEIVED', 'REJECTED');

-- CreateTable
CREATE TABLE "FundingRecord" (
    "id" TEXT NOT NULL,
    "fundingCode" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "fundingType" "FundingType" NOT NULL,
    "status" "FundingStatus" NOT NULL DEFAULT 'RECORDED',
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verifiedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "notes" TEXT,
    "supportingDocumentUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FundingRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FundingDisbursement" (
    "id" TEXT NOT NULL,
    "fundingId" TEXT NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "expectedDate" TIMESTAMP(3) NOT NULL,
    "receivedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "reference" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FundingDisbursement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FundingDocument" (
    "id" TEXT NOT NULL,
    "fundingId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "verifiedBy" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FundingDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FundingRecord_fundingCode_key" ON "FundingRecord"("fundingCode");

-- CreateIndex
CREATE INDEX "FundingRecord_status_idx" ON "FundingRecord"("status");

-- CreateIndex
CREATE INDEX "FundingDisbursement_fundingId_idx" ON "FundingDisbursement"("fundingId");

-- CreateIndex
CREATE INDEX "FundingDocument_fundingId_idx" ON "FundingDocument"("fundingId");

-- AddForeignKey
ALTER TABLE "FundingDisbursement" ADD CONSTRAINT "FundingDisbursement_fundingId_fkey" FOREIGN KEY ("fundingId") REFERENCES "FundingRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FundingDocument" ADD CONSTRAINT "FundingDocument_fundingId_fkey" FOREIGN KEY ("fundingId") REFERENCES "FundingRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;
