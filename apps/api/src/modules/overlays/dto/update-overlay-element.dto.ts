import { PartialType } from '@nestjs/swagger';
import { CreateOverlayElementDto } from './create-overlay-element.dto';

export class UpdateOverlayElementDto extends PartialType(CreateOverlayElementDto) {}
