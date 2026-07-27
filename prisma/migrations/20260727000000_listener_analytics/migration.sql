-- ListenerSession table is still empty at this point, safe to swap the plain
-- index for a unique one (one tracked row per visitor IP hash).
DROP INDEX IF EXISTS "ListenerSession_ipHash_idx";
CREATE UNIQUE INDEX "ListenerSession_ipHash_key" ON "ListenerSession"("ipHash");

-- CreateTable
CREATE TABLE "ListenerCountSample" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "count" INTEGER NOT NULL,
    "capturedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "ListenerCountSample_capturedAt_idx" ON "ListenerCountSample"("capturedAt");
