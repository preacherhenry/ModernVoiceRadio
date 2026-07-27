-- CreateTable
CREATE TABLE "BroadcastSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hostUserId" TEXT NOT NULL,
    "presenterId" TEXT,
    "programName" TEXT NOT NULL,
    "episodeTitle" TEXT,
    "description" TEXT,
    "category" TEXT,
    "tags" TEXT,
    "coverImage" TEXT,
    "status" TEXT NOT NULL DEFAULT 'CONNECTING',
    "isEmergency" BOOLEAN NOT NULL DEFAULT false,
    "startedAt" DATETIME,
    "endedAt" DATETIME,
    "peakListeners" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BroadcastSession_hostUserId_fkey" FOREIGN KEY ("hostUserId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BroadcastSession_presenterId_fkey" FOREIGN KEY ("presenterId") REFERENCES "Presenter" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Recording" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileSizeBytes" INTEGER,
    "durationSeconds" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'RECORDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Recording_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "BroadcastSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ChatMessage_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "BroadcastSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ChatMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "detail" TEXT,
    "ipAddress" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ListenerSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ipHash" TEXT NOT NULL,
    "country" TEXT,
    "city" TEXT,
    "device" TEXT,
    "os" TEXT,
    "browser" TEXT,
    "firstSeen" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeen" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Recording_sessionId_key" ON "Recording"("sessionId");

-- CreateIndex
CREATE INDEX "ListenerSession_ipHash_idx" ON "ListenerSession"("ipHash");

-- RenameTable: SongRequest -> ListenerMessage, extended with type + sessionId
ALTER TABLE "SongRequest" RENAME TO "ListenerMessage";
ALTER TABLE "ListenerMessage" ADD COLUMN "type" TEXT NOT NULL DEFAULT 'SONG_REQUEST';
ALTER TABLE "ListenerMessage" ADD COLUMN "sessionId" TEXT;

-- Map old status values to the new MessageStatus enum
UPDATE "ListenerMessage" SET "status" = 'READ_ON_AIR' WHERE "status" = 'HANDLED';

-- Migrate existing STAFF users to PRESENTER (Role enum no longer has STAFF)
UPDATE "User" SET "role" = 'PRESENTER' WHERE "role" = 'STAFF';
