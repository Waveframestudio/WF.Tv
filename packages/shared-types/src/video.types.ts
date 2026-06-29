export type VideoStatus = 'UPLOADING' | 'PROCESSING' | 'READY' | 'ERROR';

export interface VideoAsset {
  id: string;
  title: string;
  description?: string;
  s3Key: string;
  s3Url: string;
  thumbnailUrl?: string;
  duration?: number;
  fileSize?: number;
  mimeType: string;
  status: VideoStatus;
  organizationId: string;
  createdAt: string;
}

export interface UploadUrlRequest {
  fileName: string;
  fileSize: number;
  mimeType: string;
}

export interface UploadUrlResponse {
  uploadUrl: string;  // Supabase Storage presigned URL
  filePath: string;   // path en el bucket
  uploadJobId: string;
}

export interface CreateVideoDto {
  title: string;
  description?: string;
  filePath: string;
  uploadJobId: string;
  mimeType: string;
  fileSize: number;
}

export interface UpdateVideoDto {
  title?: string;
  description?: string;
}

export interface VideoListResponse {
  data: VideoAsset[];
  total: number;
  page: number;
  limit: number;
}
