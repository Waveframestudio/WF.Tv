import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) {}

  async findOne(id: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id },
      include: { locations: true, users: true },
    });
    if (!org) throw new NotFoundException('Organización no encontrada');
    return org;
  }

  async update(id: string, data: any) {
    await this.findOne(id);
    return this.prisma.organization.update({
      where: { id },
      data,
    });
  }
}
