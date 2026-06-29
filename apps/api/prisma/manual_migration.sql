-- ============================================================
-- FoodScreen Manager — Complete Database Schema
-- Instrucciones:
--   1. Ir a Supabase Dashboard → SQL Editor
--   2. Pegar todo este contenido y ejecutar con "Run"
-- ============================================================

-- ─── ENUMS ────────────────────────────────────────────────────────────────────

CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'VIEWER');
CREATE TYPE "VideoStatus" AS ENUM ('UPLOADING', 'PROCESSING', 'READY', 'ERROR');
CREATE TYPE "UploadStatus" AS ENUM ('PENDING', 'UPLOADING', 'COMPLETED', 'FAILED');
CREATE TYPE "ScreenStatus" AS ENUM ('ONLINE', 'OFFLINE', 'SYNCING', 'ERROR');
CREATE TYPE "ElementType" AS ENUM ('TEXT', 'PRICE', 'PROMOTION', 'LOGO');

-- ─── ORGANIZATIONS ────────────────────────────────────────────────────────────

CREATE TABLE "organizations" (
    "id"        TEXT NOT NULL,
    "name"      TEXT NOT NULL,
    "slug"      TEXT NOT NULL,
    "logoUrl"   TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "organizations_slug_key" ON "organizations"("slug");

-- ─── USERS ────────────────────────────────────────────────────────────────────

CREATE TABLE "users" (
    "id"             TEXT NOT NULL,
    "email"          TEXT NOT NULL,
    "name"           TEXT NOT NULL,
    "role"           "UserRole" NOT NULL DEFAULT 'ADMIN',
    "organizationId" TEXT NOT NULL,
    "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "users_organizationId_fkey"
        FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE
);

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- ─── LOCATIONS ────────────────────────────────────────────────────────────────

CREATE TABLE "locations" (
    "id"             TEXT NOT NULL,
    "name"           TEXT NOT NULL,
    "address"        TEXT,
    "organizationId" TEXT NOT NULL,
    "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "locations_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "locations_organizationId_fkey"
        FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE
);

-- ─── UPLOAD JOBS ──────────────────────────────────────────────────────────────

CREATE TABLE "upload_jobs" (
    "id"        TEXT NOT NULL,
    "fileName"  TEXT NOT NULL,
    "fileSize"  INTEGER NOT NULL,
    "mimeType"  TEXT NOT NULL,
    "status"    "UploadStatus" NOT NULL DEFAULT 'PENDING',
    "progress"  INTEGER NOT NULL DEFAULT 0,
    "errorMsg"  TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "upload_jobs_pkey" PRIMARY KEY ("id")
);

-- ─── VIDEO ASSETS ─────────────────────────────────────────────────────────────

CREATE TABLE "video_assets" (
    "id"             TEXT NOT NULL,
    "title"          TEXT NOT NULL,
    "description"    TEXT,
    "storagePath"    TEXT NOT NULL,
    "publicUrl"      TEXT NOT NULL,
    "thumbnailUrl"   TEXT,
    "duration"       DOUBLE PRECISION,
    "fileSize"       INTEGER,
    "mimeType"       TEXT NOT NULL,
    "status"         "VideoStatus" NOT NULL DEFAULT 'PROCESSING',
    "organizationId" TEXT NOT NULL,
    "uploadJobId"    TEXT,
    "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "video_assets_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "video_assets_uploadJobId_fkey"
        FOREIGN KEY ("uploadJobId") REFERENCES "upload_jobs"("id") ON DELETE SET NULL
);

CREATE UNIQUE INDEX "video_assets_storagePath_key" ON "video_assets"("storagePath");

-- ─── SCREENS ──────────────────────────────────────────────────────────────────

CREATE TABLE "screens" (
    "id"             TEXT NOT NULL,
    "name"           TEXT NOT NULL,
    "deviceId"       TEXT NOT NULL,
    "locationId"     TEXT NOT NULL,
    "status"         "ScreenStatus" NOT NULL DEFAULT 'OFFLINE',
    "lastSeenAt"     TIMESTAMP(3),
    "currentVersion" TEXT,
    "resolution"     TEXT,
    "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "screens_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "screens_locationId_fkey"
        FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE CASCADE
);

CREATE UNIQUE INDEX "screens_deviceId_key" ON "screens"("deviceId");

-- ─── PLAYLISTS ────────────────────────────────────────────────────────────────

CREATE TABLE "playlists" (
    "id"          TEXT NOT NULL,
    "name"        TEXT NOT NULL,
    "description" TEXT,
    "locationId"  TEXT NOT NULL,
    "isActive"    BOOLEAN NOT NULL DEFAULT false,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "playlists_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "playlists_locationId_fkey"
        FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE CASCADE
);

-- ─── OVERLAY TEMPLATES ────────────────────────────────────────────────────────

CREATE TABLE "overlay_templates" (
    "id"           TEXT NOT NULL,
    "name"         TEXT NOT NULL,
    "videoAssetId" TEXT NOT NULL,
    "isDefault"    BOOLEAN NOT NULL DEFAULT false,
    "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "overlay_templates_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "overlay_templates_videoAssetId_fkey"
        FOREIGN KEY ("videoAssetId") REFERENCES "video_assets"("id") ON DELETE CASCADE
);

-- ─── OVERLAY ELEMENTS ─────────────────────────────────────────────────────────

CREATE TABLE "overlay_elements" (
    "id"                TEXT NOT NULL,
    "overlayTemplateId" TEXT NOT NULL,
    "type"              "ElementType" NOT NULL,
    "content"           TEXT NOT NULL,
    "xPercent"          DOUBLE PRECISION NOT NULL,
    "yPercent"          DOUBLE PRECISION NOT NULL,
    "widthPercent"      DOUBLE PRECISION NOT NULL,
    "fontSize"          INTEGER NOT NULL DEFAULT 24,
    "fontFamily"        TEXT NOT NULL DEFAULT 'Inter',
    "fontWeight"        TEXT NOT NULL DEFAULT 'bold',
    "color"             TEXT NOT NULL DEFAULT '#FFFFFF',
    "backgroundColor"   TEXT,
    "backgroundOpacity" DOUBLE PRECISION NOT NULL DEFAULT 0.7,
    "padding"           INTEGER NOT NULL DEFAULT 8,
    "borderRadius"      INTEGER NOT NULL DEFAULT 4,
    "textAlign"         TEXT NOT NULL DEFAULT 'left',
    "zIndex"            INTEGER NOT NULL DEFAULT 1,
    "createdAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "overlay_elements_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "overlay_elements_overlayTemplateId_fkey"
        FOREIGN KEY ("overlayTemplateId") REFERENCES "overlay_templates"("id") ON DELETE CASCADE
);

-- ─── PLAYLIST ITEMS ───────────────────────────────────────────────────────────

CREATE TABLE "playlist_items" (
    "id"                TEXT NOT NULL,
    "playlistId"        TEXT NOT NULL,
    "videoAssetId"      TEXT NOT NULL,
    "overlayTemplateId" TEXT,
    "order"             INTEGER NOT NULL,
    "durationOverride"  DOUBLE PRECISION,
    "createdAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "playlist_items_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "playlist_items_playlistId_fkey"
        FOREIGN KEY ("playlistId") REFERENCES "playlists"("id") ON DELETE CASCADE,
    CONSTRAINT "playlist_items_videoAssetId_fkey"
        FOREIGN KEY ("videoAssetId") REFERENCES "video_assets"("id") ON DELETE RESTRICT,
    CONSTRAINT "playlist_items_overlayTemplateId_fkey"
        FOREIGN KEY ("overlayTemplateId") REFERENCES "overlay_templates"("id") ON DELETE SET NULL
);

-- ─── PUBLISHED VERSIONS ───────────────────────────────────────────────────────

CREATE TABLE "published_versions" (
    "id"          TEXT NOT NULL,
    "playlistId"  TEXT NOT NULL,
    "version"     INTEGER NOT NULL,
    "snapshot"    JSONB NOT NULL,
    "publishedBy" TEXT NOT NULL,
    "note"        TEXT,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "published_versions_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "published_versions_playlistId_version_key" UNIQUE ("playlistId", "version"),
    CONSTRAINT "published_versions_playlistId_fkey"
        FOREIGN KEY ("playlistId") REFERENCES "playlists"("id") ON DELETE CASCADE
);

-- ─── PLAYBACK LOGS ────────────────────────────────────────────────────────────

CREATE TABLE "playback_logs" (
    "id"           TEXT NOT NULL,
    "screenId"     TEXT NOT NULL,
    "videoAssetId" TEXT NOT NULL,
    "startedAt"    TIMESTAMP(3) NOT NULL,
    "endedAt"      TIMESTAMP(3),
    "completed"    BOOLEAN NOT NULL DEFAULT false,
    "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "playback_logs_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "playback_logs_screenId_fkey"
        FOREIGN KEY ("screenId") REFERENCES "screens"("id") ON DELETE CASCADE
);

-- ─── SEED: Organización y usuario de prueba ───────────────────────────────────
-- Opcional: descomentá esto para crear un registro de prueba inicial

-- INSERT INTO "organizations" ("id", "name", "slug", "updatedAt")
-- VALUES ('org_demo_001', 'Mi Restaurante', 'mi-restaurante', CURRENT_TIMESTAMP);

-- INSERT INTO "locations" ("id", "name", "organizationId", "updatedAt")
-- VALUES ('loc_demo_001', 'Local Principal', 'org_demo_001', CURRENT_TIMESTAMP);
