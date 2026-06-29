import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query,
  UseGuards, Request, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { VideosService } from './videos.service';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { UploadUrlDto } from './dto/upload-url.dto';

@ApiTags('Videos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('videos')
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  @Post('upload-url')
  @ApiOperation({ summary: 'Obtener URL prefirmada para subir video a Supabase Storage' })
  getUploadUrl(@Request() req, @Body() uploadUrlDto: UploadUrlDto) {
    return this.videosService.getUploadUrl(
      req.user.organizationId,
      uploadUrlDto.fileName,
      uploadUrlDto.mimeType,
      uploadUrlDto.fileSize,
    );
  }

  @Post()
  @ApiOperation({ summary: 'Registrar video luego del upload directo' })
  create(@Request() req, @Body() createVideoDto: CreateVideoDto) {
    return this.videosService.create(req.user.organizationId, createVideoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar videos de la organización' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  findAll(
    @Request() req,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.videosService.findAll(
      req.user.organizationId,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
      search,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un video por ID' })
  findOne(@Request() req, @Param('id') id: string) {
    return this.videosService.findOne(id, req.user.organizationId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar metadatos de un video' })
  update(@Request() req, @Param('id') id: string, @Body() updateVideoDto: UpdateVideoDto) {
    return this.videosService.update(id, req.user.organizationId, updateVideoDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar video y su archivo en Storage' })
  remove(@Request() req, @Param('id') id: string) {
    return this.videosService.remove(id, req.user.organizationId);
  }
}
