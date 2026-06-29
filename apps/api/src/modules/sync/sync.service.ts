import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SyncPayload, ScreenStatus } from '@foodscreen/shared-types';

@Injectable()
export class SyncService {
  constructor(private prisma: PrismaService) {}

  async getSyncPlaylist(deviceId: string): Promise<SyncPayload> {
    const screen = await this.prisma.screen.findUnique({
      where: { deviceId },
      include: {
        location: {
          include: {
            playlists: {
              where: { isActive: true },
              include: {
                items: {
                  include: {
                    videoAsset: true,
                    overlayTemplate: {
                      include: { elements: true },
                    },
                  },
                  orderBy: { order: 'asc' },
                },
                publishedVersions: {
                  orderBy: { version: 'desc' },
                  take: 1,
                },
              },
            },
          },
        },
      },
    });

    if (!screen) {
      throw new NotFoundException('Dispositivo no registrado');
    }

    const activePlaylist = screen.location.playlists[0];
    if (!activePlaylist) {
      return {
        version: '0',
        playlistId: '',
        items: [],
        updatedAt: new Date().toISOString(),
      };
    }

    // Usar la última versión publicada si existe, o el draft de la playlist en su defecto
    const latestPublished = activePlaylist.publishedVersions[0];
    const versionString = latestPublished
      ? latestPublished.version.toString()
      : 'draft-' + activePlaylist.updatedAt.getTime();

    // Mapear los items de la playlist en el formato que espera la TV
    const items = activePlaylist.items.map((item) => {
      const overlayElements = item.overlayTemplate?.elements.map((el) => ({
        id: el.id,
        type: el.type,
        content: el.content,
        xPercent: el.xPercent,
        yPercent: el.yPercent,
        widthPercent: el.widthPercent,
        fontSize: el.fontSize,
        fontFamily: el.fontFamily,
        fontWeight: el.fontWeight,
        color: el.color,
        backgroundColor: el.backgroundColor || undefined,
        backgroundOpacity: el.backgroundOpacity,
        padding: el.padding,
        borderRadius: el.borderRadius,
        textAlign: el.textAlign,
        zIndex: el.zIndex,
      })) || [];

      return {
        id: item.id,
        order: item.order,
        videoUrl: item.videoAsset.publicUrl,
        durationSeconds: item.durationOverride || item.videoAsset.duration || 10,
        overlayElements,
      };
    });

    return {
      version: versionString,
      playlistId: activePlaylist.id,
      items,
      updatedAt: activePlaylist.updatedAt.toISOString(),
    };
  }

  async heartbeat(
    deviceId: string,
    status: ScreenStatus,
    currentVideoId?: string,
    currentVersion?: string,
  ) {
    const screen = await this.prisma.screen.findUnique({
      where: { deviceId },
    });

    if (!screen) {
      throw new NotFoundException('Dispositivo no registrado');
    }

    return this.prisma.screen.update({
      where: { id: screen.id },
      data: {
        status,
        lastSeenAt: new Date(),
        currentVersion: currentVersion || screen.currentVersion,
      },
    });
  }

  async logPlayback(deviceId: string, videoAssetId: string, startedAt: string, completed: boolean) {
    const screen = await this.prisma.screen.findUnique({
      where: { deviceId },
    });

    if (!screen) {
      throw new NotFoundException('Dispositivo no registrado');
    }

    // Verificar si el video existe
    const video = await this.prisma.videoAsset.findUnique({
      where: { id: videoAssetId },
    });

    if (!video) {
      throw new NotFoundException('Video no encontrado');
    }

    return this.prisma.playbackLog.create({
      data: {
        screenId: screen.id,
        videoAssetId,
        startedAt: new Date(startedAt),
        completed,
      },
    });
  }
}
