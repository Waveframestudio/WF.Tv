import { Injectable, NotFoundException } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';

const VIDEO_BUCKET = 'videos';

@Injectable()
export class VideosService {
  private supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
  );

  constructor(private prisma: PrismaService) {}

  /**
   * Genera una URL prefirmada para subir directamente a Supabase Storage.
   * El frontend sube el archivo sin pasar por el backend.
   */
  async getUploadUrl(organizationId: string, fileName: string, mimeType: string, fileSize: number) {
    // Crear el UploadJob en DB
    const job = await this.prisma.uploadJob.create({
      data: { fileName, fileSize, mimeType, status: 'PENDING' },
    });

    const filePath = `${organizationId}/${job.id}/${fileName}`;

    const { data, error } = await this.supabase.storage
      .from(VIDEO_BUCKET)
      .createSignedUploadUrl(filePath);

    if (error) throw new Error(`Error generando URL de upload: ${error.message}`);

    return {
      uploadUrl: data.signedUrl,
      filePath,
      uploadJobId: job.id,
    };
  }

  /** Registra el VideoAsset después de que el frontend completó el upload */
  async create(organizationId: string, createVideoDto: CreateVideoDto) {
    const { data } = this.supabase.storage
      .from(VIDEO_BUCKET)
      .getPublicUrl(createVideoDto.filePath);

    const video = await this.prisma.videoAsset.create({
      data: {
        title: createVideoDto.title,
        description: createVideoDto.description,
        storagePath: createVideoDto.filePath,
        publicUrl: data.publicUrl,
        mimeType: createVideoDto.mimeType,
        fileSize: createVideoDto.fileSize,
        status: 'READY',
        organizationId,
        uploadJobId: createVideoDto.uploadJobId,
      },
    });

    // Marcar el job como completado
    await this.prisma.uploadJob.update({
      where: { id: createVideoDto.uploadJobId },
      data: { status: 'COMPLETED', progress: 100 },
    });

    return video;
  }

  async findAll(organizationId: string, page = 1, limit = 20, search?: string) {
    const skip = (page - 1) * limit;
    const where = {
      organizationId,
      ...(search && { title: { contains: search, mode: 'insensitive' as const } }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.videoAsset.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.videoAsset.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findOne(id: string, organizationId: string) {
    const video = await this.prisma.videoAsset.findFirst({
      where: { id, organizationId },
      include: { overlayTemplates: { include: { elements: true } } },
    });
    if (!video) throw new NotFoundException('Video no encontrado');
    return video;
  }

  async update(id: string, organizationId: string, updateVideoDto: UpdateVideoDto) {
    await this.findOne(id, organizationId);
    return this.prisma.videoAsset.update({ where: { id }, data: updateVideoDto });
  }

  async remove(id: string, organizationId: string) {
    const video = await this.findOne(id, organizationId);
    // Eliminar de Supabase Storage
    await this.supabase.storage.from(VIDEO_BUCKET).remove([video.storagePath]);
    return this.prisma.videoAsset.delete({ where: { id } });
  }
}
