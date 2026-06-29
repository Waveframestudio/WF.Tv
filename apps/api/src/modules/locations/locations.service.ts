import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class LocationsService {
  constructor(private prisma: PrismaService) {}

  async create(organizationId: string, data: { name: string; address?: string }) {
    return this.prisma.location.create({
      data: {
        ...data,
        organizationId,
      },
    });
  }

  async findAll(organizationId: string) {
    return this.prisma.location.findMany({
      where: { organizationId },
      include: { screens: true, playlists: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, organizationId: string) {
    const loc = await this.prisma.location.findFirst({
      where: { id, organizationId },
      include: { screens: true, playlists: true },
    });
    if (!loc) throw new NotFoundException('Local no encontrado');
    return loc;
  }

  async update(id: string, organizationId: string, data: any) {
    await this.findOne(id, organizationId);
    return this.prisma.location.update({
      where: { id },
      data,
    });
  }

  async remove(id: string, organizationId: string) {
    await this.findOne(id, organizationId);
    return this.prisma.location.delete({
      where: { id },
    });
  }
}
