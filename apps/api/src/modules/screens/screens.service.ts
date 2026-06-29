import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDeviceDto, CreateScreenDto } from '@foodscreen/shared-types';

@Injectable()
export class ScreensService {
  constructor(private prisma: PrismaService) {}

  async registerDevice(dto: RegisterDeviceDto) {
    // Si ya existe por deviceId, retornarlo y actualizar resolución si cambió
    const existing = await this.prisma.screen.findUnique({
      where: { deviceId: dto.deviceId },
    });

    if (existing) {
      return this.prisma.screen.update({
        where: { id: existing.id },
        data: {
          resolution: dto.resolution,
          lastSeenAt: new Date(),
        },
      });
    }

    // Si es un dispositivo totalmente nuevo, se registra pero queda sin local asignado aún.
    // Para simplificar el MVP, buscaremos una ubicación por defecto o lanzaremos error hasta que
    // el administrador lo asigne desde el panel a un Local específico.
    // Como requerimos locationId, buscaremos el primer Local existente en el sistema. En producción
    // el dispositivo se registra en una tabla temporal de "Dispositivos no asignados".
    const firstLocation = await this.prisma.location.findFirst();
    if (!firstLocation) {
      throw new NotFoundException('Debe existir al menos un local en el sistema para registrar pantallas');
    }

    return this.prisma.screen.create({
      data: {
        deviceId: dto.deviceId,
        name: dto.name,
        resolution: dto.resolution,
        status: 'OFFLINE',
        locationId: firstLocation.id,
      },
    });
  }

  async create(dto: CreateScreenDto) {
    return this.prisma.screen.create({
      data: {
        name: dto.name,
        locationId: dto.locationId,
        deviceId: `pending-${Math.random().toString(36).substr(2, 9)}`, // Temporal hasta vinculación
      },
    });
  }

  async findAll(locationId?: string) {
    return this.prisma.screen.findMany({
      where: locationId ? { locationId } : undefined,
      include: {
        location: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const screen = await this.prisma.screen.findUnique({
      where: { id },
      include: { location: true },
    });
    if (!screen) throw new NotFoundException('Pantalla no encontrada');
    return screen;
  }

  async update(id: string, data: any) {
    await this.findOne(id);
    return this.prisma.screen.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.screen.delete({
      where: { id },
    });
  }
}
