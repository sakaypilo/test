<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rapport d'Incident - SMMC</title>
    <style>
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 12px;
            line-height: 1.4;
            color: #333;
            margin: 0;
            padding: 20px;
        }
        
        .header {
            text-align: center;
            border-bottom: 2px solid #00A550;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #00A550;
            margin-bottom: 5px;
        }
        
        .subtitle {
            font-size: 14px;
            color: #666;
            margin-bottom: 10px;
        }
        
        .report-title {
            font-size: 18px;
            font-weight: bold;
            color: #333;
            margin-top: 15px;
        }
        
        .report-number {
            font-size: 14px;
            color: #666;
            margin-top: 5px;
        }
        
        .section {
            margin-bottom: 25px;
        }
        
        .section-title {
            font-size: 14px;
            font-weight: bold;
            color: #00A550;
            border-bottom: 1px solid #00A550;
            padding-bottom: 5px;
            margin-bottom: 15px;
        }
        
        .info-grid {
            display: table;
            width: 100%;
            margin-bottom: 15px;
        }
        
        .info-row {
            display: table-row;
        }
        
        .info-label {
            display: table-cell;
            font-weight: bold;
            width: 30%;
            padding: 5px 10px 5px 0;
            vertical-align: top;
        }
        
        .info-value {
            display: table-cell;
            padding: 5px 0;
            vertical-align: top;
        }
        
        .description-box {
            background-color: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 4px;
            padding: 15px;
            margin: 10px 0;
        }
        
        .footer {
            margin-top: 40px;
            border-top: 1px solid #dee2e6;
            padding-top: 20px;
            text-align: center;
            font-size: 10px;
            color: #666;
        }
        
        .signature-section {
            margin-top: 40px;
            display: table;
            width: 100%;
        }
        
        .signature-box {
            display: table-cell;
            width: 50%;
            text-align: center;
            padding: 20px;
        }
        
        .signature-line {
            border-top: 1px solid #333;
            margin-top: 40px;
            padding-top: 5px;
            font-size: 10px;
        }
        
        .status-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: bold;
            text-transform: uppercase;
        }
        
        .status-valide {
            background-color: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        
        .photos-section {
            margin-top: 20px;
        }
        
        .photo-count {
            font-style: italic;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">SMMC - SOCIÉTÉ DE MANUTENTION DE MADAGASCAR</div>
        <div class="subtitle">Port de Toamasina - Service de Sécurité</div>
        <div class="report-title">RAPPORT D'INCIDENT</div>
        <div class="report-number">
            N° RPT-{{ $incident->idIncident }}-{{ date('Y') }} | 
            Généré le {{ $dateGeneration }}
        </div>
    </div>

    <div class="section">
        <div class="section-title">INFORMATIONS GÉNÉRALES</div>
        <div class="info-grid">
            <div class="info-row">
                <div class="info-label">Type d'incident :</div>
                <div class="info-value">{{ $incident->typeIncident }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Date et heure :</div>
                <div class="info-value">{{ $incident->dateHeure->format('d/m/Y à H:i') }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Zone concernée :</div>
                <div class="info-value">{{ $incident->zone }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Statut :</div>
                <div class="info-value">
                    <span class="status-badge status-valide">{{ strtoupper($incident->statut) }}</span>
                </div>
            </div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">DESCRIPTION DE L'INCIDENT</div>
        <div class="description-box">
            {{ $incident->description }}
        </div>
    </div>

    <div class="section">
        <div class="section-title">CAMÉRA DE SURVEILLANCE</div>
        <div class="info-grid">
            <div class="info-row">
                <div class="info-label">Numéro de série :</div>
                <div class="info-value">{{ $incident->camera->numeroSerie }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Emplacement :</div>
                <div class="info-value">{{ $incident->camera->emplacement }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Adresse IP :</div>
                <div class="info-value">{{ $incident->camera->adresseIP }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Statut caméra :</div>
                <div class="info-value">{{ ucfirst($incident->camera->statut) }}</div>
            </div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">AGENT RAPPORTEUR</div>
        <div class="info-grid">
            <div class="info-row">
                <div class="info-label">Nom complet :</div>
                <div class="info-value">{{ $incident->utilisateur->prenom }} {{ $incident->utilisateur->nom }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Matricule :</div>
                <div class="info-value">{{ $incident->utilisateur->matricule }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Rôle :</div>
                <div class="info-value">{{ ucfirst($incident->utilisateur->role) }}</div>
            </div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">VALIDATION</div>
        <div class="info-grid">
            <div class="info-row">
                <div class="info-label">Validé par :</div>
                <div class="info-value">{{ $rapport->validateur->prenom }} {{ $rapport->validateur->nom }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Date de validation :</div>
                <div class="info-value">{{ $incident->dateValidation->format('d/m/Y à H:i') }}</div>
            </div>
            @if($incident->commentaireValidation)
            <div class="info-row">
                <div class="info-label">Commentaire :</div>
                <div class="info-value">{{ $incident->commentaireValidation }}</div>
            </div>
            @endif
        </div>
    </div>

    <div class="section photos-section">
        <div class="section-title">PIÈCES JOINTES</div>
        <div class="photo-count">
            Nombre de photos jointes : {{ count($incident->photos) }}
        </div>
        @if($incident->photos)
            <div style="margin-top: 10px; font-size: 10px; color: #666;">
                Les photos sont archivées dans le système et disponibles en version numérique.
            </div>
        @endif
    </div>

    @if($rapport->observations)
    <div class="section">
        <div class="section-title">OBSERVATIONS COMPLÉMENTAIRES</div>
        <div class="description-box">
            {{ $rapport->observations }}
        </div>
    </div>
    @endif

    <div class="signature-section">
        <div class="signature-box">
            <div><strong>Agent rapporteur</strong></div>
            <div class="signature-line">
                {{ $incident->utilisateur->prenom }} {{ $incident->utilisateur->nom }}
            </div>
        </div>
        <div class="signature-box">
            <div><strong>Responsable validateur</strong></div>
            <div class="signature-line">
                {{ $rapport->validateur->prenom }} {{ $rapport->validateur->nom }}
            </div>
        </div>
    </div>

    <div class="footer">
        <div>SMMC - Société de Manutention de Madagascar</div>
        <div>Port de Toamasina - BP 1228 - Toamasina 501 - Madagascar</div>
        <div>Tél: +261 20 53 324 95 | Email: contact@smmc.mg</div>
        <div style="margin-top: 10px;">
            Document confidentiel - Usage interne uniquement
        </div>
    </div>
</body>
</html>