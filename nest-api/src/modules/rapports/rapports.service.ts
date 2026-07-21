import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Response } from 'express';
import { createReadStream, existsSync } from 'fs';
import { join } from 'path';

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

    const pdfFilename = await this.generatePdf(rapport, incident);
    await this.prisma.rapport.update({
      where: { idRapport: rapport.idRapport },
      data: { fichierPDF: pdfFilename },
    });

    const updated = await this.prisma.rapport.findUnique({
      where: { idRapport: rapport.idRapport },
      include: { validateur: true, incident: { include: { camera: true, utilisateur: true } } },
    });

    return { success: true, message: 'Rapport généré avec succès', data: updated };
  }

  private async generatePdf(rapport: any, incident: any): Promise<string> {
    const fs = require('fs');
    const PDFDocument = require('pdfkit');
    const { join } = require('path');

    const filename = `rapport_incident_${incident.idIncident}_${Date.now()}.pdf`;
    const filePath = join(process.cwd(), 'public', 'rapports', filename);

    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    doc.fontSize(18).text('SMMC - SOCIÉTÉ DE MANUTENTION DE MADAGASCAR', { align: 'center' });
    doc.fontSize(12).text('Port de Toamasina - Service de Sécurité', { align: 'center' });
    doc.moveDown();
    doc.fontSize(16).text('RAPPORT D\'INCIDENT', { align: 'center' });
    doc.fontSize(10).text(`N° RPT-${incident.idIncident}-${new Date().getFullYear()} | Généré le ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveDown(2);

    doc.fontSize(12).text('DÉTAILS DE L\'INCIDENT:', { underline: true });
    doc.text(`Type: ${incident.typeIncident}`);
    doc.text(`Date/Heure: ${new Date(incident.dateHeure).toLocaleString('fr-FR')}`);
    doc.text(`Zone: ${incident.zone}`);
    doc.text(`Description: ${incident.description}`);
    doc.moveDown();

    doc.text('CAMÉRA CONCERNÉE:');
    doc.text(`Numéro de série: ${incident.camera?.numeroSerie || 'N/A'}`);
    doc.text(`Emplacement: ${incident.camera?.emplacement || 'N/A'}`);
    doc.text(`Adresse IP: ${incident.camera?.adresseIP || 'N/A'}`);
    doc.moveDown();

    doc.text('AGENT RAPPORTEUR:');
    doc.text(`Nom: ${incident.utilisateur?.prenom || ''} ${incident.utilisateur?.nom || ''}`);
    doc.text(`Matricule: ${incident.utilisateur?.matricule || 'N/A'}`);
    doc.moveDown();

    const photos: string[] = [];
    for (let i = 1; i <= 6; i++) {
      const p = incident[`photo${i}`];
      if (p) photos.push(p);
    }

    if (photos.length) {
      doc.text(`Photos jointes: ${photos.length}`, { underline: true });
      const pageWidth = doc.page.width
      const marginLeft = doc.page.margins.left
      const marginRight = doc.page.margins.right
      const availableWidth = pageWidth - marginLeft - marginRight
      const maxWidth = Math.min(150, availableWidth)
      const maxHeight = 150
      let yPos = doc.y
      for (const photo of photos) {
        const photoPath = join(process.cwd(), 'public', photo)
        if (fs.existsSync(photoPath)) {
          try {
            const x = marginLeft + (availableWidth - maxWidth) / 2
            doc.image(photoPath, x, yPos, { fit: [maxWidth, maxHeight] })
            yPos = doc.y + 10
            if (yPos + maxHeight > doc.page.height - doc.page.margins.bottom) {
              doc.addPage()
              yPos = doc.page.margins.top
            }
          } catch (e) {
            doc.text(`[Photo indisponible: ${photo}]`)
            yPos = doc.y + 20
          }
        }
      }
    }

    doc.end();

    return new Promise((resolve, reject) => {
      stream.on('finish', () => resolve(`rapports/${filename}`));
      stream.on('error', reject);
    });
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

  async downloadPdf(id: number, res: any) {
    const rapport = await this.prisma.rapport.findUnique({
      where: { idRapport: id },
      include: { incident: { include: { camera: true, utilisateur: true } } },
    });

    if (!rapport) {
      throw new NotFoundException({ success: false, message: 'Rapport non trouvé' });
    }

    const rawPath = rapport.fichierPDF || `rapport_incident_${rapport.idIncident || id}_${Date.now()}.pdf`
    const filename = rawPath.replace(/^rapports\//, '')
    const filePath = join(process.cwd(), 'public', 'rapports', filename);

    if (!existsSync(filePath)) {
      throw new NotFoundException({ success: false, message: 'Fichier PDF non trouvé' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="rapport_incident_${rapport.idIncident || id}.pdf"`);
    
    const fileStream = createReadStream(filePath);
    fileStream.pipe(res);
  }

  async exportIncidentsCsv(filters: { from?: string; to?: string; zone?: string }) {
    const where: any = { actif: true };

    if (filters.from && filters.to) {
      where.dateHeure = {
        gte: new Date(filters.from),
        lte: new Date(filters.to),
      };
    }

    if (filters.zone) {
      where.zone = filters.zone;
    }

    const incidents = await this.prisma.incident.findMany({
      where,
      include: { camera: true, utilisateur: true },
      orderBy: { dateHeure: 'asc' },
    });

    const BOM = '\uFEFF';
    const headers = [
      'ID Incident',
      'Date/Heure',
      'Type',
      'Zone',
      'Description',
      'Caméra',
      'Emplacement',
      'Agent',
      'Statut',
    ];

    const rows = incidents.map((i) => [
      i.idIncident,
      i.dateHeure ? new Date(i.dateHeure).toISOString().replace('T', ' ').substring(0, 19) : '',
      i.typeIncident,
      i.zone,
      i.description,
      i.camera?.numeroSerie || '',
      i.camera?.emplacement || '',
      `${i.utilisateur?.prenom || ''} ${i.utilisateur?.nom || ''}`,
      i.statut,
    ]);

    const csvContent = BOM + [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(';'))
      .join('\n');

    return csvContent;
  }
}
