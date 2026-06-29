import { IsOptional, IsString } from 'class-validator';
export class PublishPlaylistDto {
  @IsOptional() @IsString() note?: string;
}
