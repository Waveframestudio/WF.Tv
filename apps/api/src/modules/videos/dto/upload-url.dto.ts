import { IsString, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UploadUrlDto {
  @ApiProperty({ example: 'promo-hamburguesa.mp4' })
  @IsString()
  fileName: string;

  @ApiProperty({ example: 'video/mp4' })
  @IsString()
  mimeType: string;

  @ApiProperty({ example: 52428800 })
  @IsNumber()
  @Min(1)
  fileSize: number;
}
