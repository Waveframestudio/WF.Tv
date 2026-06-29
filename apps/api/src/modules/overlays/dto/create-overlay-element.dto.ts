import { IsString, IsNumber, IsOptional, IsEnum, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export type ElementType = 'TEXT' | 'PRICE' | 'PROMOTION' | 'LOGO';

export class CreateOverlayElementDto {
  @ApiProperty({ enum: ['TEXT', 'PRICE', 'PROMOTION', 'LOGO'] })
  @IsEnum(['TEXT', 'PRICE', 'PROMOTION', 'LOGO'])
  type: ElementType;

  @ApiProperty({ example: '$890' })
  @IsString()
  content: string;

  @ApiProperty({ example: 0.1, description: 'Posición X relativa (0.0 - 1.0)' })
  @IsNumber()
  @Min(0) @Max(1)
  xPercent: number;

  @ApiProperty({ example: 0.8, description: 'Posición Y relativa (0.0 - 1.0)' })
  @IsNumber()
  @Min(0) @Max(1)
  yPercent: number;

  @ApiProperty({ example: 0.2, description: 'Ancho relativo (0.0 - 1.0)' })
  @IsNumber()
  @Min(0.01) @Max(1)
  widthPercent: number;

  @ApiProperty({ required: false, default: 24 })
  @IsOptional() @IsNumber()
  fontSize?: number;

  @ApiProperty({ required: false, default: 'Inter' })
  @IsOptional() @IsString()
  fontFamily?: string;

  @ApiProperty({ required: false, default: 'bold' })
  @IsOptional() @IsString()
  fontWeight?: string;

  @ApiProperty({ required: false, default: '#FFFFFF' })
  @IsOptional() @IsString()
  color?: string;

  @ApiProperty({ required: false })
  @IsOptional() @IsString()
  backgroundColor?: string;

  @ApiProperty({ required: false, default: 0.7 })
  @IsOptional() @IsNumber() @Min(0) @Max(1)
  backgroundOpacity?: number;

  @ApiProperty({ required: false, default: 8 })
  @IsOptional() @IsNumber()
  padding?: number;

  @ApiProperty({ required: false, default: 4 })
  @IsOptional() @IsNumber()
  borderRadius?: number;

  @ApiProperty({ required: false, default: 'left', enum: ['left', 'center', 'right'] })
  @IsOptional() @IsEnum(['left', 'center', 'right'])
  textAlign?: 'left' | 'center' | 'right';

  @ApiProperty({ required: false, default: 1 })
  @IsOptional() @IsNumber()
  zIndex?: number;
}
