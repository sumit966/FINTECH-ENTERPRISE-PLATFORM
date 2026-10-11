-- CreateEnum
CREATE TYPE "AttendanceSource" AS ENUM ('MANUAL', 'BIOMETRIC', 'INTEGRATION');

-- CreateEnum
CREATE TYPE "OnboardingStage" AS ENUM ('OFFER_ACCEPTED', 'PERSONAL_DETAILS', 'DOCUMENTS', 'DEPT_ASSIGNMENT', 'MANAGER_ASSIGNMENT', 'ACCOUNT_SETUP', 'ASSET_ASSIGNMENT', 'POLICY_ACK', 'ORIENTATION', 'COMPLETE');

-- CreateEnum
CREATE TYPE "OnboardingStatus" AS ENUM ('IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED');

-- AlterTable
ALTER TABLE "Attendance" ADD COLUMN     "source" "AttendanceSource" NOT NULL DEFAULT 'MANUAL';

-- CreateTable
CREATE TABLE "OnboardingRecord" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "currentStage" "OnboardingStage" NOT NULL DEFAULT 'OFFER_ACCEPTED',
    "status" "OnboardingStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OnboardingRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OnboardingTask" (
    "id" TEXT NOT NULL,
    "recordId" TEXT NOT NULL,
    "stage" "OnboardingStage" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "assignedTo" TEXT,
    "isComplete" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "completedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OnboardingTask_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OnboardingRecord_employeeId_key" ON "OnboardingRecord"("employeeId");

-- CreateIndex
CREATE INDEX "OnboardingRecord_status_idx" ON "OnboardingRecord"("status");

-- CreateIndex
CREATE INDEX "OnboardingTask_recordId_idx" ON "OnboardingTask"("recordId");

-- CreateIndex
CREATE INDEX "OnboardingTask_stage_idx" ON "OnboardingTask"("stage");

-- CreateIndex
CREATE INDEX "OnboardingTask_isComplete_idx" ON "OnboardingTask"("isComplete");

-- AddForeignKey
ALTER TABLE "OnboardingRecord" ADD CONSTRAINT "OnboardingRecord_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnboardingTask" ADD CONSTRAINT "OnboardingTask_recordId_fkey" FOREIGN KEY ("recordId") REFERENCES "OnboardingRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;
