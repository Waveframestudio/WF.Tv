import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOverlayTemplateDto } from './dto/create-overlay-template.dto';
import { CreateOverlayElementDto } from './dto/create-overlay-element.dto';
import { UpdateOverlayElementDto } from './dto/update-overlay-element.dto';

@Injectable()
export class OverlaysService {
  constructor(private prisma: PrismaService) {}

  async findTemplatesByVideo(videoAssetId: string) {
    return this.prisma.overlayTemplate.findMany({
      where: { videoAssetId },
      include: { elements: { orderBy: { zIndex: 'asc' } } },
    });
  }

  async createTemplate(createDto: CreateOverlayTemplateDto) {
    return this.prisma.overlayTemplate.create({
      data: { name: createDto.name, videoAssetId: createDto.videoAssetId },
      include: { elements: true },
    });
  }

  async findTemplateById(id: string) {
    const template = await this.prisma.overlayTemplate.findUnique({
      where: { id },
      include: { elements: { orderBy: { zIndex: 'asc' } } },
    });
    if (!template) throw new NotFoundException('Template de overlay no encontrado');
    return template;
  }

  async updateTemplate(id: string, data: Partial<CreateOverlayTemplateDto>) {
    await this.findTemplateById(id);
    return this.prisma.overlayTemplate.update({ where: { id }, data });
  }

  async deleteTemplate(id: string) {
    await this.findTemplateById(id);
    return this.prisma.overlayTemplate.delete({ where: { id } });
  }

  async createElement(overlayTemplateId: string, createDto: CreateOverlayElementDto) {
    return this.prisma.overlayElement.create({
      data: { overlayTemplateId, ...createDto },
    });
  }

  async updateElement(id: string, updateDto: UpdateOverlayElementDto) {
    const element = await this.prisma.overlayElement.findUnique({ where: { id } });
    if (!element) throw new NotFoundException('Elemento de overlay no encontrado');
    return this.prisma.overlayElement.update({ where: { id }, data: updateDto });
  }

  async deleteElement(id: string) {
    const element = await this.prisma.overlayElement.findUnique({ where: { id } });
    if (!element) throw new NotFoundException('Elemento de overlay no encontrado');
    return this.prisma.overlayElement.delete({ where: { id } });
  }
}
