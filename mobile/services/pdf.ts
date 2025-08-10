import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Incident, Camera, User } from '@/types';

class PdfService {
  async generateIncidentReport(incident: Incident, agent: User): Promise<string> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Rapport d'Incident - SMMC Port Toamasina</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
              color: #333;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #1e40af;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              color: #1e40af;
            }
            .subtitle {
              color: #64748b;
              margin-top: 5px;
            }
            .section {
              margin-bottom: 25px;
            }
            .section-title {
              font-size: 18px;
              font-weight: bold;
              color: #1e40af;
              border-bottom: 1px solid #e2e8f0;
              padding-bottom: 5px;
              margin-bottom: 15px;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 200px 1fr;
              gap: 10px;
            }
            .label {
              font-weight: bold;
              color: #475569;
            }
            .value {
              color: #1e293b;
            }
            .photos {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 15px;
              margin-top: 15px;
            }
            .photo {
              text-align: center;
              border: 1px solid #e2e8f0;
              padding: 10px;
            }
            .signature-section {
              margin-top: 50px;
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 50px;
            }
            .signature-box {
              text-align: center;
              border-top: 1px solid #000;
              padding-top: 10px;
            }
            .footer {
              margin-top: 50px;
              text-align: center;
              font-size: 12px;
              color: #64748b;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">SMMC - PORT DE TOAMASINA</div>
            <div class="subtitle">Société de Manutention de Marchandises Conventionnelles</div>
            <div class="subtitle">Département Sécurité et Sûreté</div>
          </div>

          <h1 style="text-align: center; color: #1e40af; margin-bottom: 30px;">
            RAPPORT D'INCIDENT N° ${incident.id.toUpperCase()}
          </h1>

          <div class="section">
            <div class="section-title">Informations Générales</div>
            <div class="info-grid">
              <div class="label">Type d'incident:</div>
              <div class="value">${incident.type.toUpperCase()}</div>
              
              <div class="label">Date et heure:</div>
              <div class="value">${new Date(incident.dateIncident).toLocaleString('fr-FR')}</div>
              
              <div class="label">Zone:</div>
              <div class="value">${incident.zone}</div>
              
              <div class="label">Emplacement:</div>
              <div class="value">${incident.emplacement}</div>
              
              <div class="label">Agent rapporteur:</div>
              <div class="value">${agent.prenom} ${agent.nom} (${agent.matricule})</div>
              
              <div class="label">Statut:</div>
              <div class="value">${incident.statut === 'en_cours' ? 'EN COURS' : 'CLOS'}</div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Description de l'Incident</div>
            <p style="line-height: 1.6; text-align: justify;">${incident.description}</p>
          </div>

          ${incident.temoins.length > 0 ? `
          <div class="section">
            <div class="section-title">Témoins</div>
            <ul>
              ${incident.temoins.map(temoin => `<li>${temoin}</li>`).join('')}
            </ul>
          </div>
          ` : ''}

          <div class="section">
            <div class="section-title">Mesures Prises</div>
            <p style="line-height: 1.6; text-align: justify;">${incident.mesuresPrises}</p>
          </div>

          ${incident.photos.length > 0 ? `
          <div class="section">
            <div class="section-title">Photos et Documents</div>
            <div class="photos">
              ${incident.photos.map((photo, index) => `
                <div class="photo">
                  <img src="${photo}" style="max-width: 100%; height: 150px; object-fit: cover;">
                  <div>Photo ${index + 1}</div>
                </div>
              `).join('')}
            </div>
          </div>
          ` : ''}

          <div class="signature-section">
            <div class="signature-box">
              <div>Signature de l'Agent</div>
              <div style="margin-top: 20px;">${agent.prenom} ${agent.nom}</div>
            </div>
            <div class="signature-box">
              <div>Visa du Responsable Sécurité</div>
              <div style="margin-top: 20px;">_________________</div>
            </div>
          </div>

          <div class="footer">
            <p>Document généré automatiquement le ${new Date().toLocaleString('fr-FR')}</p>
            <p>SMMC - Port de Toamasina | Département Sécurité et Sûreté</p>
          </div>
        </body>
      </html>
    `;

    const { uri } = await Print.printToFileAsync({
      html,
      base64: false,
    });

    return uri;
  }

  async generateCameraReport(cameras: Camera[]): Promise<string> {
    const camerasEnLigne = cameras.filter(c => c.statut === 'en_ligne').length;
    const camerasHorsLigne = cameras.filter(c => c.statut === 'hors_ligne').length;
    const camerasEnMaintenance = cameras.filter(c => c.statut === 'maintenance').length;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Rapport Caméras - SMMC Port Toamasina</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px; }
            .stat-card { text-align: center; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; }
            .stat-number { font-size: 32px; font-weight: bold; color: #1e40af; }
            .stat-label { color: #64748b; margin-top: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #e2e8f0; padding: 12px; text-align: left; }
            th { background-color: #f8fafc; font-weight: bold; }
            .status-en-ligne { color: #10b981; font-weight: bold; }
            .status-hors-ligne { color: #ef4444; font-weight: bold; }
            .status-maintenance { color: #f59e0b; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>SMMC - PORT DE TOAMASINA</h1>
            <h2>Rapport État des Caméras de Surveillance</h2>
            <p>Généré le ${new Date().toLocaleString('fr-FR')}</p>
          </div>

          <div class="stats">
            <div class="stat-card">
              <div class="stat-number status-en-ligne">${camerasEnLigne}</div>
              <div class="stat-label">Caméras En Ligne</div>
            </div>
            <div class="stat-card">
              <div class="stat-number status-hors-ligne">${camerasHorsLigne}</div>
              <div class="stat-label">Caméras Hors Ligne</div>
            </div>
            <div class="stat-card">
              <div class="stat-number status-maintenance">${camerasEnMaintenance}</div>
              <div class="stat-label">En Maintenance</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Numéro</th>
                <th>Zone</th>
                <th>Emplacement</th>
                <th>Adresse IP</th>
                <th>Statut</th>
                <th>Date Installation</th>
              </tr>
            </thead>
            <tbody>
              ${cameras.map(camera => `
                <tr>
                  <td>${camera.numero}</td>
                  <td>${camera.zone}</td>
                  <td>${camera.emplacement}</td>
                  <td>${camera.ip}</td>
                  <td class="status-${camera.statut.replace('_', '-')}">${camera.statut.replace('_', ' ').toUpperCase()}</td>
                  <td>${new Date(camera.dateInstallation).toLocaleDateString('fr-FR')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const { uri } = await Print.printToFileAsync({
      html,
      base64: false,
    });

    return uri;
  }

  async shareFile(uri: string, name: string): Promise<void> {
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: `Partager ${name}`,
        UTI: 'com.adobe.pdf',
      });
    }
  }
}

export const pdfService = new PdfService();