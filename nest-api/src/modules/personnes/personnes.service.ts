import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PersonnesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters?: any) {
    const where: any = { actif: true };
    if (filters.statut) where.statut = filters.statut;

    if (filters.search) {
      where.OR = [
        { nom: { contains: filters.search } },
        { prenom: { contains: filters.search } },
        { CIN: { contains: filters.search } },
      ];
    }

    const personnes = await this.prisma.personne.findMany({
      where,
      include: { interpellations: { include: { utilisateur: true } } },
      orderBy: { nom: 'asc' },
    });

    return { success: true, data: personnes };
  }

  async findOne(id: number) {
    const personne = await this.prisma.personne.findUnique({
      where: { idPersonne: id },
      include: { interpellations: { include: { utilisateur: true } } },
    });

    if (!personne) {
      throw new NotFoundException({ success: false, message: 'Personne not found' });
    }

    return { success: true, data: personne };
  }

  async create(data: any, userId: number, files?: Express.Multer.File[]) {
    // Check if person already exists
    let personne = await this.prisma.personne.findUnique({
      where: { CIN: data.CIN },
    });

    const photo = files && files.length > 0 ? `personnes/${files[0].filename}` : data.photo;

    if (!personne) {
      personne = await this.prisma.personne.create({
        data: {
          nom: data.nom,
          prenom: data.prenom,
          CIN: data.CIN,
          statut: data.statut,
          photo,
          actif: true,
        },
      });
    }

    // Create the interpellation
    const interpellation = await this.prisma.interpellation.create({
      data: {
        dateHeure: new Date(),
        faitAssocie: data.faitAssocie,
        idPersonne: personne.idPersonne,
        idUtilisateur: userId,
      },
      include: { utilisateur: true, personne: true },
    });

    // Return with interpellations included
    const result = await this.prisma.personne.findUnique({
      where: { idPersonne: personne.idPersonne },
      include: { interpellations: { include: { utilisateur: true } } },
    });

    return { success: true, message: 'Interpellation enregistrée avec succès', data: result };
  }

  async update(id: number, data: any, authUser: any, files?: Express.Multer.File[]) {
    if (!['responsable', 'admin'].includes(authUser.role)) {
      throw new ForbiddenException({
        success: false,
        message: 'Vous n\'avez pas les permissions pour modifier une personne',
      });
    }

    const photo = files && files.length > 0 ? `personnes/${files[0].filename}` : data.photo;

    const updated = await this.prisma.personne.update({
      where: { idPersonne: id },
      data: {
        ...data,
        photo,
      },
      include: { interpellations: { include: { utilisateur: true } } },
    });

    return { success: true, message: 'Personne mise à jour avec succès', data: updated };
  }

  async softDelete(id: number, authUser: any) {
    if (!['responsable', 'admin'].includes(authUser.role)) {
      throw new ForbiddenException({
        success: false,
        message: 'Permission refusée pour supprimer une personne.',
      });
    }

    await this.prisma.personne.update({
      where: { idPersonne: id },
      data: { actif: false },
    });

    return { success: true, message: 'Personne supprimée avec succès (logiquement).' };
  }

  async addInterpellation(id: number, data: any, userId: number) {
    const personne = await this.prisma.personne.findUnique({
      where: { idPersonne: id },
    });

    if (!personne) {
      throw new NotFoundException({ success: false, message: 'Personne not found' });
    }

    const interpellation = await this.prisma.interpellation.create({
      data: {
        dateHeure: new Date(),
        faitAssocie: data.faitAssocie,
        idPersonne: id,
        idUtilisateur: userId,
      },
      include: { utilisateur: true },
    });

    return { success: true, message: 'Interpellation ajoutée avec succès', data: interpellation };
  }

  async getStatistics() {
    const total = await this.prisma.personne.count();
    const internes = await this.prisma.personne.count({
      where: { statut: 'interne' },
    });
    const externes = await this.prisma.personne.count({
      where: { statut: 'externe' },
    });

    // Count interpellations this month
    const now = new Date();
    const interpellations_ce_mois = await this.prisma.interpellation.count({
      where: {
        dateHeure: {
          gte: new Date(now.getFullYear(), now.getMonth(), 1),
        },
      },
    });

    // Count personnes with > 1 interpellations
    const peopleWithCounts = await this.prisma.personne.findMany({
      include: {
        _count: { select: { interpellations: true } },
      },
    });
    const personnes_recurrentes = peopleWithCounts.filter(
      (p) => p._count.interpellations > 1,
    ).length;

    return {
      success: true,
      data: {
        total,
        internes,
        externes,
        interpellations_ce_mois,
        personnes_recurrentes,
      },
    };
  }
}
