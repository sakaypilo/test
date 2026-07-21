import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CamerasService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters?: any) {
    const where: any = { actif: true };
    if (filters.statut) where.statut = filters.statut;
    if (filters.zone) where.zone = filters.zone;

    const cameras = await this.prisma.camera.findMany({
      where,
      include: { technicien: true },
      orderBy: { numeroSerie: 'asc' },
    });

    return { success: true, data: cameras };
  }

  async findOne(id: number) {
    const camera = await this.prisma.camera.findUnique({
      where: { idCamera: id },
      include: {
        technicien: true,
        mutationCameras: { include: { technicien: true } },
        incidents: true,
        vols: true,
      },
    });

    if (!camera) {
      throw new NotFoundException({ success: false, message: 'Camera not found' });
    }

    return { success: true, data: camera };
  }

  async create(data: any, authUser: any) {
    if (!['admin', 'technicien'].includes(authUser.role)) {
      throw new ForbiddenException({
        success: false,
        message: 'Vous n\'avez pas les permissions pour ajouter une caméra',
      });
    }

    const createData = {
      ...data,
      idTechnicien: authUser.idUtilisateur,
      statut: 'actif',
    };
    if (createData.dateInstallation) {
      createData.dateInstallation = new Date(createData.dateInstallation);
    }

    const camera = await this.prisma.camera.create({
      data: createData,
      include: { technicien: true },
    });

    return { success: true, message: 'Caméra ajoutée avec succès', data: camera };
  }

  async update(id: number, data: any, authUser: any) {
    if (!['admin', 'technicien'].includes(authUser.role)) {
      throw new ForbiddenException({
        success: false,
        message: 'Vous n\'avez pas les permissions pour modifier une caméra',
      });
    }

    const camera = await this.prisma.camera.findUnique({
      where: { idCamera: id },
    });

    if (!camera) {
      throw new NotFoundException({ success: false, message: 'Camera not found' });
    }

    const { motif, ...updateData } = data;
    if (updateData.dateInstallation) {
      updateData.dateInstallation = new Date(updateData.dateInstallation);
    }

    const updatedCamera = await this.prisma.camera.update({
      where: { idCamera: id },
      data: updateData,
      include: { technicien: true },
    });

    // If the emplacement changed, log a mutation
    if (camera.emplacement !== updatedCamera.emplacement) {
      await this.prisma.mutationCamera.create({
        data: {
          dateHeureMutation: new Date(),
          ancienEmplacement: camera.emplacement,
          nouvelEmplacement: updatedCamera.emplacement,
          motif: motif || 'Déplacement de caméra',
          idCamera: id,
          idTechnicien: authUser.idUtilisateur,
        },
      });
    }

    return { success: true, message: 'Caméra mise à jour avec succès', data: updatedCamera };
  }

  async remove(id: number, authUser: any) {
    if (authUser.role !== 'admin') {
      throw new ForbiddenException({
        success: false,
        message: 'Vous n\'avez pas les permissions pour supprimer une caméra',
      });
    }

    const camera = await this.prisma.camera.findUnique({
      where: { idCamera: id },
      include: { incidents: true, vols: true },
    });

    if (!camera) {
      throw new NotFoundException({ success: false, message: 'Camera not found' });
    }

    if (camera.incidents.length > 0 || camera.vols.length > 0) {
      throw new ForbiddenException({
        success: false,
        message: 'Impossible de supprimer une caméra ayant des incidents associés',
      });
    }

    await this.prisma.camera.delete({ where: { idCamera: id } });

    return { success: true, message: 'Caméra supprimée avec succès' };
  }

  async getStatistics() {
    const total = await this.prisma.camera.count();
    const actives = await this.prisma.camera.count({
      where: { statut: 'actif' },
    });
    const en_panne = await this.prisma.camera.count({
      where: { statut: 'panne' },
    });
    const hors_ligne = await this.prisma.camera.count({
      where: { statut: 'hors ligne' },
    });

    const groupByZoneStatut = await this.prisma.camera.groupBy({
      by: ['zone', 'statut'],
      _count: { idCamera: true },
    });

    // Transform the group by into a more usable format
    const par_zone: Record<string, any[]> = {};
    groupByZoneStatut.forEach((item) => {
      if (!par_zone[item.zone]) {
        par_zone[item.zone] = [];
      }
      par_zone[item.zone].push({
        statut: item.statut,
        count: item._count.idCamera,
      });
    });

    // Recent installations (last 30 days)
    const installations_recentes = await this.prisma.camera.count({
      where: {
        dateInstallation: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    });

    return {
      success: true,
      data: {
        total,
        actives,
        en_panne,
        hors_ligne,
        par_zone,
        installations_recentes,
      },
    };
  }
}
