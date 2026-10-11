-- CreateTable
CREATE TABLE "AutomationRunLog" (
    "id" TEXT NOT NULL,
    "runId" TEXT,
    "ruleCode" TEXT NOT NULL,
    "trigger" TEXT NOT NULL,
    "workflow" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "triggeredBy" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "message" TEXT,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AutomationRunLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BiometricDevice" (
    "id" TEXT NOT NULL,
    "deviceCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "vendor" TEXT,
    "model" TEXT,
    "locationCode" TEXT,
    "ipAddress" TEXT,
    "integrationType" TEXT NOT NULL DEFAULT 'MANUAL',
    "status" TEXT NOT NULL DEFAULT 'INTEGRATION_REQUIRED',
    "lastSeenAt" TIMESTAMP(3),
    "lastSyncAt" TIMESTAMP(3),
    "firmwareVersion" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BiometricDevice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AutomationRunLog_workflow_idx" ON "AutomationRunLog"("workflow");

-- CreateIndex
CREATE INDEX "AutomationRunLog_status_idx" ON "AutomationRunLog"("status");

-- CreateIndex
CREATE INDEX "AutomationRunLog_ruleCode_idx" ON "AutomationRunLog"("ruleCode");

-- CreateIndex
CREATE UNIQUE INDEX "BiometricDevice_deviceCode_key" ON "BiometricDevice"("deviceCode");

-- CreateIndex
CREATE INDEX "BiometricDevice_status_idx" ON "BiometricDevice"("status");

-- CreateIndex
CREATE INDEX "BiometricDevice_locationCode_idx" ON "BiometricDevice"("locationCode");
