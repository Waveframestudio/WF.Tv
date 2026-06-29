import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ScreensService } from './screens.service';

@ApiTags('Screens')
@Controller('screens')
export class ScreensController {
  constructor(private readonly screensService: ScreensService) {}

  @Post('register')
  @ApiOperation({ summary: 'Registrar un dispositivo / TV Box desde la aplicación de TV' })
  registerDevice(@Body() dto: { deviceId: string; name: string; resolution?: string }) {
    return this.screensService.registerDevice(dto);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear una pantalla asignada a un local (Admin)' })
  create(@Body() dto: { name: string; locationId: string }) {
    return this.screensService.create(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar todas las pantallas' })
  findAll(@Query('locationId') locationId?: string) {
    return this.screensService.findAll(locationId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findOne(@Param('id') id: string) {
    return this.screensService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  update(@Param('id') id: string, @Body() data: any) {
    return this.screensService.update(id, data);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  remove(@Param('id') id: string) {
    return this.screensService.remove(id);
  }
}
