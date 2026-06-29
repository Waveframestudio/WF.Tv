import { IsString, IsOptional, IsNumber, IsUUID } from 'class-validator';
export class AddPlaylistItemDto {
  @IsString() videoAssetId: string;
  @IsOptional() @IsString() overlayTemplateId?: string;
  @IsNumber() order: number;
  @IsOptional() @IsNumber() durationOverride?: number;
}
