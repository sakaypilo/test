import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardData() {
    // Cameras stats
    const total_cameras = await this.prisma.camera.count();
    const actives_cameras = await this.prisma.camera.count({
      where: { statut: 'actif' },
    });
    const en_panne_cameras = await this.prisma.camera.count({
      where: { statut: 'panne' },
    });
    const hors_ligne_cameras = await this.prisma.camera.count({
      where: { statut: 'hors ligne' },
    });

    // Incidents stats
    const total_incidents = await this.prisma.incident.count();
    const en_attente_incidents = await this.prisma.incident.count({
      where: { statut: 'en_attente' },
    });
    const valides_incidents = await this.prisma.incident.count({
      where: { statut: 'valide' },
    });
    const rejetes_incidents = await this.prisma.incident.count({
      where: { statut: 'rejete' },
    });
    const ce_mois_incidents = await this.prisma.incident.count({
      where: {
        dateHeure: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    });

    // Vols stats
    const total_vols = await this.prisma.vol.count();
    const ce_mois_vols = await this.prisma.vol.count({
      where: {
        dateHeure: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    });
    const en_attente_vols = await this.prisma.vol.count({
      where: { statut: 'en_attente' },
    });
    const valides_vols = await this.prisma.vol.count({
      where: { statut: 'valide' },
    });

    // Personnes stats
    const total_personnes = await this.prisma.personne.count();
    const internes_personnes = await this.prisma.personne.count({
      where: { statut: 'interne' },
    });
    const externes_personnes = await this.prisma.personne.count({
      where: { statut: 'externe' },
    });

    // Rapports stats
    const total_rapports = await this.prisma.rapport.count();
    const ce_mois_rapports = await this.prisma.rapport.count({
      where: {
        dateCreation: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    });

    // Recent incidents
    const incidents_recents = await this.prisma.incident.findMany({
      take: 5,
      orderBy: { dateHeure: 'desc' },
      include: { camera: true, utilisateur: true },
    });

    // Cameras par zone
    const cameras_par_zone_group = await this.prisma.camera.groupBy({
      by: ['zone', 'statut'],
      _count: { idCamera: true },
    });
    const cameras_par_zone: Record<string, any> = {};
    cameras_par_zone_group.forEach(item => {
      if (!cameras_par_zone[item.zone]) {
        cameras_par_zone[item.zone] = [];
      }
      cameras_par_zone[item.zone].push({
        statut: item.statut,
        count: item._count.idCamera,
      });
    });

    // Evolution incidents last 12 months (validated)
    const now = new Date();
    const twelveMonthsAgo = new Date(
      now.getFullYear() - 1,
      now.getMonth(),
      1
    );

    const evolution_incidents_group = await this.prisma.incident.groupBy({
      by: ['dateHeure'],
      where: {
        dateHeure: { gte: twelveMonthsAgo },
        statut: 'valide',
      },
      _count: { idIncident: true },
    });

    // Group by year and month
    const evolution_incidents: any[] = [];
    const monthMap: Record<string, number> = {};

    evolution_incidents_group.forEach(item => {
      const d = new Date(item.dateHeure);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!monthMap[key]) {
        monthMap[key] = 0;
      }
      monthMap[key] += item._count.idIncident;
    });

    for (const [key, count] of Object.entries(monthMap)) {
      const [year, month] = key.split('-').map(Number);
      evolution_incidents.push({ year, month, count });
    }

    // Top incident types (validated)
    const types_incidents_group = await this.prisma.incident.groupBy({
      by: ['typeIncident'],
      where: { statut: 'valide' },
      _count: { idIncident: true },
      orderBy: { _count: { idIncident: 'desc' } },
      take: 5,
    });
    const types_incidents = types_incidents_group.map(item => ({
      typeIncident: item.typeIncident,
      count: item._count.idIncident,
    }));

    // System alerts
    const cameras_hors_ligne_15m = await this.prisma.camera.count({
      where: {
        statut: 'hors ligne',
        updatedAt: {
          lte: new Date(Date.now() - 15 * 60 * 1000),
        },
      },
    });

    const alertes: any[] = [];
    if (cameras_hors_ligne_15m > 0) {
      alertes.push({
        type: 'warning',
        message: `${cameras_hors_ligne_15m} caméra(s) hors ligne depuis plus de 15 minutes`,
        count: cameras_hors_ligne_15m,
      });
    }

    return {
      success: true,
      data: {
        statistiques: {
          cameras: {
            total: total_cameras,
            actives: actives_cameras,
            en_panne: en_panne_cameras,
            hors_ligne: hors_ligne_cameras,
          },
          incidents: {
            total: total_incidents,
            ce_mois: ce_mois_incidents,
            en_attente: en_attente_incidents,
            valides: valides_incidents,
            rejetes: rejetes_incidents,
          },
          vols: {
            total: total_vols,
            ce_mois: ce_mois_vols,
            en_attente: en_attente_vols,
            valides: valides_vols,
          },
          personnes: {
            total: total_personnes,
            internes: internes_personnes,
            externes: externes_personnes,
          },
          rapports: {
            total: total_rapports,
            ce_mois: ce_mois_rapports,
          },
        },
        incidents_recents,
        cameras_par_zone,
        evolution_incidents,
        types_incidents,
        alertes,
        derniere_mise_a_jour: new Date().toISOString(),
      },
    };
  }

  async getAlertes(authUser: any) {
    const alertes: any[] = [];

    // Cameras with issues
    const problemCameras = await this.prisma.camera.findMany({
      where: { OR: [{ statut: 'panne' }, { statut: 'hors ligne' }] },
    });
    for (const cam of problemCameras) {
      alertes.push({
        type: cam.statut === 'panne' ? 'error' : 'warning',
        titre: `Caméra ${cam.statut}`,
        message: `Caméra ${cam.numeroSerie} (${cam.zone}) est ${cam.statut}`,
        date: cam.updatedAt,
        priorite: cam.statut === 'panne' ? 'haute' : 'moyenne',
      });
    }

    // Incidents waiting for validation (for resp/admin)
    if (['responsable', 'admin'].includes(authUser.role)) {
      const pendingIncidents = await this.prisma.incident.findMany({
        where: { statut: 'en_attente' },
        include: { camera: true, utilisateur: true },
        orderBy: { dateHeure: 'desc' },
      });
      for (const inc of pendingIncidents) {
        alertes.push({
          type: 'info',
          titre: 'Validation requise',
          message: `Incident ${inc.typeIncident} signalé par ${inc.utilisateur.prenom} ${inc.utilisateur.nom}`,
          date: inc.dateHeure,
          priorite: 'normale',
          lien: `/incidents/${inc.idIncident}`,
        });
      }
    }

    // Sort by priority and date
    const priorityMap: Record<string, number> = {
      haute: 3,
      moyenne: 2,
      normale: 1,
    };

    alertes.sort((a, b) => {
      const prioA = priorityMap[a.priorite] || 1;
      const prioB = priorityMap[b.priorite] || 1;

      if (prioA === prioB) {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      return prioB - prioA;
    });

    return { success: true, data: alertes.slice(0, 20) };
  }
}
