import { Controller, Get, Post, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SyncService } from './sync.service';
import { ScreenStatus } from '@foodscreen/shared-types';

@ApiTags('Sync (TV App)')
@Controller('sync')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Get(':deviceId')
  @ApiOperation({ summary: 'Obtener playlist sincronizada y overlays correspondientes para el dispositivo' })
  getSyncPlaylist(@Param('deviceId') deviceId: string) {
    return this.syncService.getSyncPlaylist(deviceId);
  }

  @Post(':deviceId/heartbeat')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar estado del dispositivo (heartbeat diario/minutario)' })
  heartbeat(
    @Param('deviceId') deviceId: string,
    @Body() dto: { status: ScreenStatus; currentVideoId?: string; currentVersion?: string },
  ) {
    return this.syncService.heartbeat(deviceId, dto.status, dto.currentVideoId, dto.currentVersion);
  }

  @Post(':deviceId/log')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Registrar registro de reproducción de un video en la pantalla' })
  logPlayback(
    @Param('deviceId') deviceId: string,
    @Body() dto: { videoAssetId: string; startedAt: string; completed: boolean },
  ) {
    return this.syncService.logPlayback(deviceId, dto.videoAssetId, dto.startedAt, dto.completed);
  }
}
