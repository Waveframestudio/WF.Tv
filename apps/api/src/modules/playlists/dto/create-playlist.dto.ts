import { IsString, IsOptional } from 'class-validator';
export class CreatePlaylistDto {
  @IsString() name: string;
  @IsOptional() @IsString() description?: string;
  @IsString() locationId: string;
}
