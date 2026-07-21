import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(authUser: any, filters?: { role?: string; actif?: boolean; search?: string }) {
    if (authUser.role !== 'admin') {
      throw new ForbiddenException({
        success: false,
        message: 'Vous n\'avez pas les permissions pour accéder à cette ressource',
      });
    }

    const where: any = {};

    if (filters.role) where.role = filters.role;
    if (filters.actif !== undefined) where.actif = filters.actif;

    if (filters.search) {
      where.OR = [
        { nom: { contains: filters.search } },
        { prenom: { contains: filters.search } },
        { matricule: { contains: filters.search } },
        { email: { contains: filters.search } },
      ];
    }

    return this.prisma.user.findMany({ where, orderBy: { nom: 'asc' } });
  }

  async findOne(id: number, authUser: any) {
    if (authUser.idUtilisateur !== id && authUser.role !== 'admin') {
      throw new ForbiddenException({
        success: false,
        message: 'Vous n\'avez pas les permissions pour accéder à cette ressource',
      });
    }

    const user = await this.prisma.user.findUnique({ where: { idUtilisateur: id } });

    if (!user) {
      throw new NotFoundException({
        success: false,
        message: 'User not found',
      });
    }

    return user;
  }

  async create(data: any, authUser: any) {
    if (authUser.role !== 'admin') {
      throw new ForbiddenException({
        success: false,
        message: 'Vous n\'avez pas les permissions pour créer un utilisateur',
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(data.motDePasse, 10);

    const user = await this.prisma.user.create({
      data: {
        ...data,
        motDePasse: hashedPassword,
        actif: true,
      },
    });

    return user;
  }

  async update(id: number, data: any, authUser: any) {
    if (authUser.role !== 'admin') {
      throw new ForbiddenException({
        success: false,
        message: 'Vous n\'avez pas les permissions pour modifier un utilisateur',
      });
    }

    // Don't update password directly here - use dedicated endpoints
    const { motDePasse, ...updateData } = data;

    return this.prisma.user.update({
      where: { idUtilisateur: id },
      data: updateData,
    });
  }

  async resetPassword(id: number, authUser: any) {
    if (authUser.role !== 'admin') {
      throw new ForbiddenException({
        success: false,
        message: 'Vous n\'avez pas les permissions pour réinitialiser un mot de passe',
      });
    }

    // Generate a temporary password
    const tempPassword = 'SMMC' + Math.floor(1000 + Math.random() * 9000);

    await this.prisma.user.update({
      where: { idUtilisateur: id },
      data: { motDePasse: await bcrypt.hash(tempPassword, 10) },
    });

    return {
      success: true,
      message: 'Mot de passe réinitialisé avec succès',
      temporary_password: tempPassword,
    };
  }

  async changePassword(id: number, data: any, authUser: any) {
    const isAdmin = authUser.role === 'admin';

    if (!isAdmin && authUser.idUtilisateur !== id) {
      throw new ForbiddenException({
        success: false,
        message: 'Vous n\'avez pas les permissions pour changer ce mot de passe.',
      });
    }

    // Vérifier que les mots de passe correspondent
    if (data.new_password_confirmation && data.new_password !== data.new_password_confirmation) {
      throw new ForbiddenException({
        success: false,
        message: 'Les mots de passe ne correspondent pas.',
      });
    }

    const user = await this.prisma.user.findUnique({
      where: { idUtilisateur: id },
    });

    if (!isAdmin) {
      if (!data.current_password) {
        throw new ForbiddenException({
          success: false,
          message: 'Le mot de passe actuel est requis.',
        });
      }
      const isValid = await bcrypt.compare(data.current_password, user.motDePasse);
      if (!isValid) {
        throw new ForbiddenException({
          success: false,
          message: 'Mot de passe actuel incorrect.',
        });
      }
    }

    await this.prisma.user.update({
      where: { idUtilisateur: id },
      data: { motDePasse: await bcrypt.hash(data.new_password, 10) },
    });

    return {
      success: true,
      message: 'Mot de passe modifié avec succès.',
    };
  }

  async toggleStatus(id: number, authUser: any) {
    if (authUser.role !== 'admin') {
      throw new ForbiddenException({
        success: false,
        message: 'Vous n\'avez pas les permissions pour modifier le statut d\'un utilisateur',
      });
    }

    const user = await this.prisma.user.findUnique({
      where: { idUtilisateur: id },
    });

    if (!user) {
      throw new NotFoundException();
    }

    return this.prisma.user.update({
      where: { idUtilisateur: id },
      data: { actif: !user.actif },
    });
  }

  async getStatistics(authUser: any) {
    if (authUser.role !== 'admin') {
      throw new ForbiddenException({
        success: false,
        message: 'Vous n\'avez pas les permissions pour accéder aux statistiques',
      });
    }

    const total = await this.prisma.user.count();
    const actifs = await this.prisma.user.count({ where: { actif: true } });
    const inactifs = await this.prisma.user.count({ where: { actif: false } });

    const parRole = await this.prisma.user.groupBy({
      by: ['role'],
      _count: { idUtilisateur: true },
    });

    return {
      success: true,
      data: {
        total,
        actifs,
        inactifs,
        par_role: parRole.map(r => ({ role: r.role, count: r._count.idUtilisateur })),
      },
    };
  }
}
