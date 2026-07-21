import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RapportsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters?: any) {
    const where: any = {};

    if (filters.type) where.typeRapport = filters.type;
    if (filters.validateur) where.validePar = parseInt(filters.validateur);

    const rapports = await this.prisma.rapport.findMany({
      where,
      include: { validateur: true, incident: { include: { camera: true, utilisateur: true } } },
      orderBy: { dateCreation: 'desc' },
    });

    return { success: true, data: rapports };
  }

  async createIncidentReport(incidentId: number, data: any, authUser: any) {
    if (!['responsable', 'admin'].includes(authUser.role)) {
      throw new ForbiddenException({
        success: false,
        message: 'Vous n\'avez pas les permissions pour générer un rapport',
      });
    }

    const incident = await this.prisma.incident.findUnique({
      where: { idIncident: incidentId },
      include: { camera: true, utilisateur: true },
    });

    if (!incident) {
      throw new NotFoundException({
        success: false,
        message: 'Incident not found',
      });
    }

    if (incident.statut !== 'valide') {
      throw new ForbiddenException({
        success: false,
        message: 'Seuls les incidents validés peuvent générer un rapport',
      });
    }

    // Check if report already exists
    const existing = await this.prisma.rapport.findFirst({
      where: { idIncident: incidentId },
    });

    if (existing) {
      throw new ForbiddenException({
        success: false,
        message: 'Un rapport existe déjà pour cet incident',
      });
    }

    // Generate report content
    const contenu = this.generateIncidentContent(incident);

    const rapport = await this.prisma.rapport.create({
      data: {
        typeRapport: 'incident',
        contenu,
        dateCreation: new Date(),
        validePar: authUser.idUtilisateur,
        idIncident: incidentId,
        observations: data.observations,
      },
      include: { validateur: true, incident: { include: { camera: true, utilisateur: true } } },
    });

    return { success: true, message: 'Rapport généré avec succès', data: rapport };
  }

  private generateIncidentContent(incident: any): string {
    return `RAPPORT D'INCIDENT - SMMC PORT DE TOAMASINA

Numéro de rapport: RPT-${incident.idIncident}-${new Date().getFullYear()}
Date de création: ${new Date().toLocaleString()}

DÉTAILS DE L'INCIDENT:
Type: ${incident.typeIncident}
Date/Heure: ${incident.dateHeure}
Zone: ${incident.zone}
Description: ${incident.description}

CAMÉRA CONCERNÉE:
Numéro de série: ${incident.camera?.numeroSerie || 'N/A'}
Emplacement: ${incident.camera?.emplacement || 'N/A'}
Adresse IP: ${incident.camera?.adresseIP || 'N/A'}

SIGNALÉ PAR:
Agent: ${incident.utilisateur?.prenom || ''} ${incident.utilisateur?.nom || ''}
Matricule: ${incident.utilisateur?.matricule || 'N/A'}
`;
  }

  async getStatistics() {
    const total = await this.prisma.rapport.count();
    const incidents = await this.prisma.rapport.count({
      where: { typeRapport: 'incident' },
    });

    // Ce mois
    const now = new Date();
    const ce_mois = await this.prisma.rapport.count({
      where: {
        dateCreation: {
          gte: new Date(now.getFullYear(), now.getMonth(), 1),
        },
      },
    });

    const par_validateur = await this.prisma.rapport.groupBy({
      by: ['validePar'],
      _count: { idRapport: true },
    });

    const validateurs = await this.prisma.user.findMany({
      where: { idUtilisateur: { in: par_validateur.map(p => p.validePar) } },
    });

    const par_validateur_formatted = par_validateur.map(p => {
      const user = validateurs.find(u => u.idUtilisateur === p.validePar);
      return {
        validePar: p.validePar,
        user,
        count: p._count.idRapport,
      };
    });

    return {
      success: true,
      data: { total, incidents, ce_mois, par_validateur: par_validateur_formatted },
    };
  }
}
