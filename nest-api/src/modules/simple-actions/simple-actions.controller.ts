import {
  Controller,
  Delete,
  Post,
  Get,
  Param,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SoftDeleteDto } from './dto/soft-delete.dto';

@Controller()
@UseGuards(JwtAuthGuard)
export class SimpleActionsController {
  constructor(private readonly prisma: PrismaService) {}

  @Delete('incidents/:id/delete')
  async deleteIncident(
    @Param('id') id: string,
    @Body() dto: SoftDeleteDto,
    @Req() req: any,
  ) {
    await this.prisma.incident.update({
      where: { idIncident: parseInt(id) },
      data: {
        actif: false,
        deletedAt: new Date(),
        deletedBy: req.user.idUtilisateur,
        deletionReason: dto.reason,
      },
    });
    return { success: true, message: 'Incident supprimé' };
  }

  @Post('incidents/:id/restore')
  async restoreIncident(@Param('id') id: string, @Req() req: any) {
    await this.prisma.incident.update({
      where: { idIncident: parseInt(id) },
      data: {
        actif: true,
        restoredAt: new Date(),
        restoredBy: req.user.idUtilisateur,
      },
    });
    return { success: true, message: 'Incident restauré' };
  }

  @Delete('cameras/:id/delete')
  async deleteCamera(
    @Param('id') id: string,
    @Body() dto: SoftDeleteDto,
    @Req() req: any,
  ) {
    await this.prisma.camera.update({
      where: { idCamera: parseInt(id) },
      data: {
        actif: false,
        deletedAt: new Date(),
        deletedBy: req.user.idUtilisateur,
        deletionReason: dto.reason,
      },
    });
    return { success: true, message: 'Caméra supprimée' };
  }

  @Delete('personnes/:id/delete')
  async deletePersonne(
    @Param('id') id: string,
    @Body() dto: SoftDeleteDto,
    @Req() req: any,
  ) {
    await this.prisma.personne.update({
      where: { idPersonne: parseInt(id) },
      data: {
        actif: false,
        deletedAt: new Date(),
        deletedBy: req.user.idUtilisateur,
        deletionReason: dto.reason,
      },
    });
    return { success: true, message: 'Personne supprimée' };
  }

  @Get('deleted')
  async getDeleted() {
    const incidents = await this.prisma.incident.findMany({
      where: { actif: false },
      include: { utilisateur: true },
    });
    const cameras = await this.prisma.camera.findMany({
      where: { actif: false },
      include: { technicien: true },
    });
    const personnes = await this.prisma.personne.findMany({
      where: { actif: false },
    });
    return {
      success: true,
      data: {
        incidents,
        cameras,
        personnes,
      },
    };
  }
}
