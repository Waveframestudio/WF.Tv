import { Controller, Get, Post, Patch, Delete, Body, Param, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LocationsService } from './locations.service';

@ApiTags('Locations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un local para la organización' })
  create(@Request() req, @Body() data: { name: string; address?: string }) {
    return this.locationsService.create(req.user.organizationId, data);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los locales de la organización' })
  findAll(@Request() req) {
    return this.locationsService.findAll(req.user.organizationId);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.locationsService.findOne(id, req.user.organizationId);
  }

  @Patch(':id')
  update(@Request() req, @Param('id') id: string, @Body() data: any) {
    return this.locationsService.update(id, req.user.organizationId, data);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.locationsService.remove(id, req.user.organizationId);
  }
}
