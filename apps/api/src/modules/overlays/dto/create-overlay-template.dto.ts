import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOverlayTemplateDto {
  @ApiProperty({ example: 'Overlay Precios Burguer' })
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  videoAssetId?: string;
}
