import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TrashService {
  constructor(private readonly prisma: PrismaService) {}

  async getTrash() {
    // Get all soft-deleted records
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

  async restore(type: string, id: number, userId: number) {
    const now = new Date();

    switch (type) {
      case 'incidents':
        await this.prisma.incident.update({
          where: { idIncident: id },
          data: {
            actif: true,
            restoredAt: now,
            restoredBy: userId,
          },
        });
        break;
      case 'cameras':
        await this.prisma.camera.update({
          where: { idCamera: id },
          data: {
            actif: true,
            restoredAt: now,
            restoredBy: userId,
          },
        });
        break;
      case 'personnes':
        await this.prisma.personne.update({
          where: { idPersonne: id },
          data: {
            actif: true,
            restoredAt: now,
            restoredBy: userId,
          },
        });
        break;
      default:
        throw new ForbiddenException('Type de restoration invalide');
    }

    return {
      success: true,
      message: `${type} restauré avec succès`,
    };
  }

  async permanentDelete(type: string, id: number, authUser: any) {
    if (authUser.role !== 'admin') {
      throw new ForbiddenException('Seul un admin peut supprimer définitivement');
    }

    switch (type) {
      case 'incidents':
        await this.prisma.incident.delete({
          where: { idIncident: id },
        });
        break;
      case 'cameras':
        // Verify no linked incidents/vols
        const camera = await this.prisma.camera.findUnique({
          where: { idCamera: id },
          include: { incidents: true, vols: true },
        });
        if (camera && (camera.incidents.length > 0 || camera.vols.length > 0)) {
          throw new ForbiddenException('Impossible de supprimer: incidents/vols liés');
        }
        await this.prisma.camera.delete({
          where: { idCamera: id },
        });
        break;
      case 'personnes':
        await this.prisma.personne.delete({
          where: { idPersonne: id },
        });
        break;
      default:
        throw new ForbiddenException('Type invalide');
    }

    return {
      success: true,
      message: `${type} supprimé définitivement`,
    };
  }

  async emptyTrash(authUser: any) {
    if (authUser.role !== 'admin') {
      throw new ForbiddenException('Seul un admin peut vider la corbeille');
    }

    // Delete soft-deleted records
    await this.prisma.incident.deleteMany({
      where: { actif: false },
    });
    await this.prisma.camera.deleteMany({
      where: { actif: false },
    });
    await this.prisma.personne.deleteMany({
      where: { actif: false },
    });

    return {
      success: true,
      message: 'Corbeille vidée avec succès',
    };
  }
}
