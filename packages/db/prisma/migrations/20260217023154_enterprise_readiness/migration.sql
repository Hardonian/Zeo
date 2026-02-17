-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "OrganizationMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OrganizationMember_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "metadata" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Repository" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Repository_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "repositoryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    CONSTRAINT "Project_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReadyLayerRun" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "repositoryId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ReadyLayerRun_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ReadyLayerRun_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EvidenceAttestation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "repositoryId" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "manifestHash" TEXT NOT NULL,
    "bundleHash" TEXT NOT NULL,
    "treeHash" TEXT NOT NULL,
    "signingMode" TEXT NOT NULL,
    "signature" TEXT,
    "publicKeyId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EvidenceAttestation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "EvidenceAttestation_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "EvidenceAttestation_runId_fkey" FOREIGN KEY ("runId") REFERENCES "ReadyLayerRun" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EvidenceObject" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "runId" TEXT,
    "kind" TEXT NOT NULL,
    "storageProvider" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "contentHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EvidenceObject_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PolicyPack" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "description" TEXT,
    "contentsJson" TEXT NOT NULL,
    "packHash" TEXT NOT NULL,
    "signature" TEXT,
    "signingMode" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PolicyPack_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PolicyPackAssignment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "repositoryId" TEXT,
    "scope" TEXT NOT NULL,
    "policyPackId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PolicyPackAssignment_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PolicyPackAssignment_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PolicyPackAssignment_policyPackId_fkey" FOREIGN KEY ("policyPackId") REFERENCES "PolicyPack" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WebhookReceipt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "deliveryId" TEXT NOT NULL,
    "receivedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bodyHash" TEXT NOT NULL,
    "signatureValid" BOOLEAN NOT NULL,
    "replayBlocked" BOOLEAN NOT NULL,
    "processed" BOOLEAN NOT NULL,
    "correlationId" TEXT,
    CONSTRAINT "WebhookReceipt_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DeadLetterJob" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jobId" TEXT NOT NULL,
    "jobType" TEXT NOT NULL,
    "payloadJson" TEXT NOT NULL,
    "errorCode" TEXT NOT NULL,
    "failureClass" TEXT NOT NULL,
    "errorMessage" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastFailedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationMember_organizationId_userId_key" ON "OrganizationMember" ("organizationId", "userId");

-- CreateIndex
CREATE INDEX "OrganizationMember_userId_idx" ON "OrganizationMember" ("userId");

-- CreateIndex
CREATE INDEX "AuditLog_organizationId_idx" ON "AuditLog" ("organizationId");

-- CreateIndex
CREATE INDEX "AuditLog_actorId_idx" ON "AuditLog" ("actorId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog" ("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "EvidenceAttestation_runId_key" ON "EvidenceAttestation" ("runId");

-- CreateIndex
CREATE INDEX "EvidenceAttestation_organizationId_idx" ON "EvidenceAttestation" ("organizationId");

-- CreateIndex
CREATE INDEX "EvidenceAttestation_repositoryId_idx" ON "EvidenceAttestation" ("repositoryId");

-- CreateIndex
CREATE INDEX "EvidenceObject_organizationId_idx" ON "EvidenceObject" ("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "PolicyPack_organizationId_name_version_key" ON "PolicyPack" (
    "organizationId",
    "name",
    "version"
);

-- CreateIndex
CREATE INDEX "PolicyPackAssignment_organizationId_idx" ON "PolicyPackAssignment" ("organizationId");

-- CreateIndex
CREATE INDEX "PolicyPackAssignment_repositoryId_idx" ON "PolicyPackAssignment" ("repositoryId");

-- CreateIndex
CREATE UNIQUE INDEX "WebhookReceipt_organizationId_provider_deliveryId_key" ON "WebhookReceipt" (
    "organizationId",
    "provider",
    "deliveryId"
);

-- CreateIndex
CREATE INDEX "DeadLetterJob_jobType_idx" ON "DeadLetterJob" ("jobType");

-- CreateIndex
CREATE INDEX "DeadLetterJob_createdAt_idx" ON "DeadLetterJob" ("createdAt");

-- Manual: Enable RLS for sensitive tables
-- Note: SQLite does not support native RLS like PostgreSQL.
-- If deploying to Supabase (Postgres), uncomment these lines or ensure they run on that target.
-- Since current target is 'sqlite' (as per schema), RLS syntax is invalid.
-- However, strict enterprise readiness implies Postgres compatibility.
-- I will add conditional comments or assume target environment upgrade.
-- For now, I will add a comment block explaining RLS policy application
-- as requested by user, acknowledging SQLite limitation if local dev uses it.

-- IF POSTGRES:
-- ALLTER TABLE "OrganizationMember" ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "User can see own memberships" ON "OrganizationMember" FOR SELECT USING (auth.uid() = "userId");