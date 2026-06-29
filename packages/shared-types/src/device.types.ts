export type ScreenStatus = 'ONLINE' | 'OFFLINE' | 'SYNCING' | 'ERROR';

export interface Screen {
  id: string;
  name: string;
  deviceId: string;
  locationId: string;
  status: ScreenStatus;
  lastSeenAt?: string;
  currentVersion?: string;
  resolution?: string;
  createdAt: string;
}

export interface RegisterDeviceDto {
  deviceId: string;     // UUID generado en la TV app en primer boot
  name: string;
  resolution?: string;
}

export interface CreateScreenDto {
  name: string;
  locationId: string;
}

// Payload retornado por /sync/:deviceId
export interface SyncPayload {
  version: string;
  playlistId: string;
  items: SyncPlaylistItem[];
  updatedAt: string;
}

export interface SyncPlaylistItem {
  id: string;
  order: number;
  videoUrl: string;     // URL directa de Supabase Storage / CDN
  durationSeconds: number;
  overlayElements: SyncOverlayElement[];
}

export interface SyncOverlayElement {
  id: string;
  type: string;
  content: string;
  xPercent: number;
  yPercent: number;
  widthPercent: number;
  fontSize: number;
  fontFamily: string;
  fontWeight: string;
  color: string;
  backgroundColor?: string;
  backgroundOpacity: number;
  padding: number;
  borderRadius: number;
  textAlign: string;
  zIndex: number;
}

export interface HeartbeatDto {
  status: ScreenStatus;
  currentVideoId?: string;
  currentVersion?: string;
}
