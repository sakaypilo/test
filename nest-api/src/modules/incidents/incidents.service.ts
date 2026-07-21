import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class IncidentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters?: any) {
    const where: any = { actif: true };

    if (filters.statut) where.statut = filters.statut;
    if (filters.type) where.typeIncident = filters.type;
    if (filters.zone) where.zone = filters.zone;

    if (filters.from && filters.to) {
      where.dateHeure = {
        gte: new Date(filters.from),
        lte: new Date(filters.to),
      };
    } else if (filters.date) {
      where.dateHeure = new Date(filters.date);
    }

    const items = await this.prisma.incident.findMany({
      where,
      include: { camera: true, utilisateur: true, validateur: true },
      orderBy: { dateHeure: 'desc' },
    });

    return { success: true, data: items };
  }

  async findOne(id: number) {
    const incident = await this.prisma.incident.findUnique({
      where: { idIncident: id },
      include: { camera: true, utilisateur: true, validateur: true },
    });

    if (!incident) {
      throw new NotFoundException({ success: false, message: 'Incident not found' });
    }

    return { success: true, data: incident };
  }

  async create(data: any, userId: number, files?: {
    photo0?: Express.Multer.File[]
    photo1?: Express.Multer.File[]
    photo2?: Express.Multer.File[]
    photo3?: Express.Multer.File[]
    photo4?: Express.Multer.File[]
    photo5?: Express.Multer.File[]
  }) {
    if (data.idCamera !== undefined && data.idCamera !== null && typeof data.idCamera === 'string') {
      data.idCamera = parseInt(data.idCamera)
    }
    if (data.dateHeure) {
      data.dateHeure = new Date(data.dateHeure)
    }
    // Map uploaded files to photo1, photo2, ..., photo6 preserving slot order
    const photoFields: any = {};
    if (files) {
      for (let i = 0; i < 6; i++) {
        const key = `photo${i}` as keyof typeof files
        const fileArray = files[key]
        if (fileArray && fileArray.length > 0) {
          photoFields[`photo${i + 1}`] = `incidents/${fileArray[0].filename}`
        }
      }
    }

    const incident = await this.prisma.incident.create({
      data: {
        ...data,
        ...photoFields,
        idUtilisateur: userId,
        statut: 'en_attente',
      },
      include: { camera: true, utilisateur: true },
    });

    return { success: true, message: 'Incident enregistré avec succès', data: incident };
  }

  async update(id: number, data: any, authUser: any) {
    const incident = await this.prisma.incident.findUnique({
      where: { idIncident: id },
    });

    if (!incident) {
      throw new NotFoundException({ success: false, message: 'Incident not found' });
    }

    const isAuthorized =
      authUser.role === 'admin' ||
      authUser.role === 'responsable' ||
      incident.idUtilisateur === authUser.idUtilisateur;

    if (!isAuthorized) {
      throw new ForbiddenException({
        success: false,
        message: 'Permission refusée pour modifier cet incident.',
      });
    }

    const updated = await this.prisma.incident.update({
      where: { idIncident: id },
      data: {
        ...data,
        dateHeure: data.dateHeure ? new Date(data.dateHeure) : undefined,
        idCamera: typeof data.idCamera === 'string' ? parseInt(data.idCamera) : data.idCamera,
      },
      include: { camera: true, utilisateur: true },
    });

    return { success: true, message: 'Incident mis à jour avec succès.', data: updated };
  }

  async validate(id: number, data: any, authUser: any) {
    if (!['responsable', 'admin'].includes(authUser.role)) {
      throw new ForbiddenException({
        success: false,
        message: 'Vous n\'avez pas les permissions pour valider un incident',
      });
    }

    const incident = await this.prisma.incident.findUnique({
      where: { idIncident: id },
    });

    if (!incident) {
      throw new NotFoundException({ success: false, message: 'Incident not found' });
    }

    if (incident.statut !== 'en_attente') {
      throw new ForbiddenException({
        success: false,
        message: 'Cet incident a déjà été traité',
      });
    }

    const updated = await this.prisma.incident.update({
      where: { idIncident: id },
      data: {
        statut: data.statut,
        validePar: authUser.idUtilisateur,
        dateValidation: new Date(),
        commentaireValidation: data.commentaire,
      },
      include: { camera: true, utilisateur: true, validateur: true },
    });

    return {
      success: true,
      message: `Incident ${data.statut === 'valide' ? 'validé' : 'rejeté'} avec succès`,
      data: updated,
    };
  }

  async softDelete(id: number, data: any, authUser: any) {
    const incident = await this.prisma.incident.findUnique({
      where: { idIncident: id },
    });

    if (!incident) {
      throw new NotFoundException({ success: false, message: 'Incident not found' });
    }

    const isAuthorized =
      authUser.role === 'admin' ||
      authUser.role === 'responsable' ||
      (authUser.role === 'agent' && incident.idUtilisateur === authUser.idUtilisateur);

    if (!isAuthorized) {
      throw new ForbiddenException({
        success: false,
        message: 'Permission refusée pour supprimer cet incident.',
      });
    }

    await this.prisma.incident.update({
      where: { idIncident: id },
      data: {
        actif: false,
        deletedAt: new Date(),
        deletedBy: authUser.idUtilisateur,
        deletionReason: data.reason || 'Suppression par l\'utilisateur',
      },
    });

    return { success: true, message: 'Incident supprimé avec succès.' };
  }

  async bulkUpdate(data: any, authUser: any) {
    const { ids, ...updates } = data;
    const parsedIds = ids.map((id: string) => parseInt(id));

    if (updates.dateHeure) {
      updates.dateHeure = new Date(updates.dateHeure)
    }
    if (updates.idCamera !== undefined && updates.idCamera !== null && typeof updates.idCamera === 'string') {
      updates.idCamera = parseInt(updates.idCamera)
    }

    let where: any = { idIncident: { in: parsedIds } };

    // Agents can only update their own incidents
    if (authUser.role === 'agent') {
      where.idUtilisateur = authUser.idUtilisateur;
    }

    const count = await this.prisma.incident.updateMany({
      where,
      data: updates,
    });

    return { success: true, message: `${count.count} incident(s) mis à jour avec succès.`, updated: count.count };
  }

  async bulkDelete(data: any, authUser: any) {
    const { ids, reason } = data;
    const parsedIds = ids.map((id: string) => parseInt(id));

    let where: any = { idIncident: { in: parsedIds } };

    // Agents can only delete their own incidents
    if (authUser.role === 'agent') {
      where.idUtilisateur = authUser.idUtilisateur;
    }

    const count = await this.prisma.incident.updateMany({
      where,
      data: {
        actif: false,
        deletedAt: new Date(),
        deletedBy: authUser.idUtilisateur,
        deletionReason: reason || 'Suppression en masse',
      },
    });

    return { success: true, message: `${count.count} incident(s) supprimé(s) avec succès.`, deleted: count.count };
  }

  async getStatistics() {
    const total = await this.prisma.incident.count();
    const en_attente = await this.prisma.incident.count({
      where: { statut: 'en_attente' },
    });
    const valides = await this.prisma.incident.count({
      where: { statut: 'valide' },
    });
    const rejetes = await this.prisma.incident.count({
      where: { statut: 'rejete' },
    });

    // Get current month incidents
    const now = new Date();
    const ce_mois = await this.prisma.incident.count({
      where: {
        dateHeure: {
          gte: new Date(now.getFullYear(), now.getMonth(), 1),
        },
      },
    });

    const par_type = await this.prisma.incident.groupBy({
      by: ['typeIncident'],
      _count: { idIncident: true },
    });
    const par_zone = await this.prisma.incident.groupBy({
      by: ['zone'],
      _count: { idIncident: true },
    });

    return {
      success: true,
      data: {
        total,
        en_attente,
        valides,
        rejetes,
        ce_mois,
        par_type: par_type.map(t => ({ typeIncident: t.typeIncident, count: t._count.idIncident })),
        par_zone: par_zone.map(z => ({ zone: z.zone, count: z._count.idIncident })),
      },
    };
  }
}
