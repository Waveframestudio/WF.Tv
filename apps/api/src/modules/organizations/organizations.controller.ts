import { Controller, Get, Patch, Body, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrganizationsService } from './organizations.service';

@ApiTags('Organizations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly orgService: OrganizationsService) {}

  @Get('me')
  @ApiOperation({ summary: 'Obtener información de la organización del usuario actual' })
  findMyOrg(@Request() req) {
    return this.orgService.findOne(req.user.organizationId);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Actualizar información de la organización del usuario actual' })
  updateMyOrg(@Request() req, @Body() data: any) {
    return this.orgService.update(req.user.organizationId, data);
  }
}
