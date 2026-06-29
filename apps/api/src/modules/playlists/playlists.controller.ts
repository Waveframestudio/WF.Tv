import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query,
  UseGuards, Request, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PlaylistsService } from './playlists.service';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { AddPlaylistItemDto } from './dto/add-playlist-item.dto';
import { ReorderPlaylistDto } from './dto/reorder-playlist.dto';
import { PublishPlaylistDto } from './dto/publish-playlist.dto';

@ApiTags('Playlists')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('playlists')
export class PlaylistsController {
  constructor(private readonly playlistsService: PlaylistsService) {}

  @Get()
  @ApiQuery({ name: 'locationId', required: false })
  findAll(@Query('locationId') locationId?: string) {
    return this.playlistsService.findAll(locationId);
  }

  @Post()
  create(@Body() dto: CreatePlaylistDto) {
    return this.playlistsService.create(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.playlistsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreatePlaylistDto>) {
    return this.playlistsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.playlistsService.remove(id);
  }

  @Post(':id/items')
  addItem(@Param('id') id: string, @Body() dto: AddPlaylistItemDto) {
    return this.playlistsService.addItem(id, dto);
  }

  @Patch(':id/items/:itemId')
  updateItem(@Param('itemId') itemId: string, @Body() dto: Partial<AddPlaylistItemDto>) {
    return this.playlistsService.updateItem(itemId, dto);
  }

  @Delete(':id/items/:itemId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeItem(@Param('itemId') itemId: string) {
    return this.playlistsService.removeItem(itemId);
  }

  @Post(':id/reorder')
  reorder(@Param('id') id: string, @Body() dto: ReorderPlaylistDto) {
    return this.playlistsService.reorderItems(id, dto);
  }

  @Post(':id/publish')
  @ApiOperation({ summary: 'Publicar versión de la playlist (genera snapshot inmutable)' })
  publish(@Param('id') id: string, @Request() req, @Body() dto: PublishPlaylistDto) {
    return this.playlistsService.publish(id, req.user.email, dto.note);
  }

  @Get(':id/versions')
  @ApiOperation({ summary: 'Historial de versiones publicadas' })
  getVersions(@Param('id') id: string) {
    return this.playlistsService.getVersions(id);
  }
}
