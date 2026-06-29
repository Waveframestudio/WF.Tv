import {
  Controller, Get, Post, Patch, Delete, Body, Param,
  UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OverlaysService } from './overlays.service';
import { CreateOverlayTemplateDto } from './dto/create-overlay-template.dto';
import { CreateOverlayElementDto } from './dto/create-overlay-element.dto';
import { UpdateOverlayElementDto } from './dto/update-overlay-element.dto';

@ApiTags('Overlays')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class OverlaysController {
  constructor(private readonly overlaysService: OverlaysService) {}

  // ─── Templates ───────────────────────────────────────────────────────────────

  @Get('videos/:videoId/overlay-templates')
  @ApiOperation({ summary: 'Listar templates de overlay por video' })
  findTemplatesByVideo(@Param('videoId') videoId: string) {
    return this.overlaysService.findTemplatesByVideo(videoId);
  }

  @Post('videos/:videoId/overlay-templates')
  @ApiOperation({ summary: 'Crear template de overlay para un video' })
  createTemplate(@Param('videoId') videoId: string, @Body() dto: CreateOverlayTemplateDto) {
    return this.overlaysService.createTemplate({ ...dto, videoAssetId: videoId });
  }

  @Get('overlay-templates/:id')
  @ApiOperation({ summary: 'Obtener template de overlay por ID' })
  findTemplateById(@Param('id') id: string) {
    return this.overlaysService.findTemplateById(id);
  }

  @Patch('overlay-templates/:id')
  @ApiOperation({ summary: 'Actualizar template de overlay' })
  updateTemplate(@Param('id') id: string, @Body() dto: Partial<CreateOverlayTemplateDto>) {
    return this.overlaysService.updateTemplate(id, dto);
  }

  @Delete('overlay-templates/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar template de overlay' })
  deleteTemplate(@Param('id') id: string) {
    return this.overlaysService.deleteTemplate(id);
  }

  // ─── Elements ────────────────────────────────────────────────────────────────

  @Post('overlay-templates/:templateId/elements')
  @ApiOperation({ summary: 'Agregar elemento a un template de overlay' })
  createElement(@Param('templateId') templateId: string, @Body() dto: CreateOverlayElementDto) {
    return this.overlaysService.createElement(templateId, dto);
  }

  @Patch('overlay-elements/:id')
  @ApiOperation({ summary: 'Actualizar elemento de overlay' })
  updateElement(@Param('id') id: string, @Body() dto: UpdateOverlayElementDto) {
    return this.overlaysService.updateElement(id, dto);
  }

  @Delete('overlay-elements/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar elemento de overlay' })
  deleteElement(@Param('id') id: string) {
    return this.overlaysService.deleteElement(id);
  }
}
