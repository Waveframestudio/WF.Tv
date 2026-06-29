import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { AddPlaylistItemDto } from './dto/add-playlist-item.dto';
import { ReorderPlaylistDto } from './dto/reorder-playlist.dto';

@Injectable()
export class PlaylistsService {
  constructor(private prisma: PrismaService) {}

  async findAll(locationId?: string) {
    return this.prisma.playlist.findMany({
      where: locationId ? { locationId } : undefined,
      include: {
        items: {
          include: { videoAsset: true, overlayTemplate: { include: { elements: true } } },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(createDto: CreatePlaylistDto) {
    return this.prisma.playlist.create({
      data: { name: createDto.name, description: createDto.description, locationId: createDto.locationId },
      include: { items: true },
    });
  }

  async findOne(id: string) {
    const playlist = await this.prisma.playlist.findUnique({
      where: { id },
      include: {
        items: {
          include: { videoAsset: true, overlayTemplate: { include: { elements: true } } },
          orderBy: { order: 'asc' },
        },
      },
    });
    if (!playlist) throw new NotFoundException('Playlist no encontrada');
    return playlist;
  }

  async update(id: string, data: Partial<CreatePlaylistDto>) {
    await this.findOne(id);
    return this.prisma.playlist.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.playlist.delete({ where: { id } });
  }

  async addItem(playlistId: string, addItemDto: AddPlaylistItemDto) {
    await this.findOne(playlistId);
    return this.prisma.playlistItem.create({
      data: { playlistId, ...addItemDto },
      include: { videoAsset: true, overlayTemplate: true },
    });
  }

  async updateItem(itemId: string, data: Partial<AddPlaylistItemDto>) {
    return this.prisma.playlistItem.update({ where: { id: itemId }, data });
  }

  async removeItem(itemId: string) {
    return this.prisma.playlistItem.delete({ where: { id: itemId } });
  }

  async reorderItems(playlistId: string, reorderDto: ReorderPlaylistDto) {
    await this.findOne(playlistId);
    // Actualizar el orden de cada item en una transacción
    await this.prisma.$transaction(
      reorderDto.items.map(({ id, order }) =>
        this.prisma.playlistItem.update({ where: { id }, data: { order } }),
      ),
    );
    return this.findOne(playlistId);
  }

  /**
   * Publica una versión de la playlist:
   * - Guarda un snapshot completo (inmutable) en PublishedVersion
   * - Incrementa el número de versión
   */
  async publish(playlistId: string, publishedBy: string, note?: string) {
    const playlist = await this.findOne(playlistId);

    const lastVersion = await this.prisma.publishedVersion.findFirst({
      where: { playlistId },
      orderBy: { version: 'desc' },
    });

    const newVersion = (lastVersion?.version ?? 0) + 1;

    return this.prisma.publishedVersion.create({
      data: {
        playlistId,
        version: newVersion,
        snapshot: playlist as any,
        publishedBy,
        note,
      },
    });
  }

  async getVersions(playlistId: string) {
    return this.prisma.publishedVersion.findMany({
      where: { playlistId },
      orderBy: { version: 'desc' },
    });
  }
}
