import type { VideoAsset } from './video.types';
import type { OverlayTemplate } from './overlay.types';

export interface PlaylistItem {
  id: string;
  playlistId: string;
  videoAssetId: string;
  videoAsset?: VideoAsset;
  overlayTemplateId?: string;
  overlayTemplate?: OverlayTemplate;
  order: number;
  durationOverride?: number;
  createdAt: string;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  locationId: string;
  items: PlaylistItem[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePlaylistDto {
  name: string;
  description?: string;
  locationId: string;
}

export interface AddPlaylistItemDto {
  videoAssetId: string;
  overlayTemplateId?: string;
  order: number;
  durationOverride?: number;
}

export interface ReorderPlaylistDto {
  items: { id: string; order: number }[];
}

export interface PublishedVersion {
  id: string;
  playlistId: string;
  version: number;
  snapshot: Playlist;
  publishedBy: string;
  note?: string;
  createdAt: string;
}

export interface PublishPlaylistDto {
  note?: string;
}
