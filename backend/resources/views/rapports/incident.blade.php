<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rapport d'incident - SMMC</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            line-height: 1.4;
            color: #333;
            margin: 0;
            padding: 20px;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        .header h1 {
            margin: 0;
            font-size: 18px;
            font-weight: bold;
        }
        .header p {
            margin: 5px 0;
            font-size: 10px;
        }
        .section {
            margin-bottom: 15px;
        }
        .section h2 {
            font-size: 14px;
            font-weight: bold;
            margin: 0 0 5px 0;
            color: #333;
            border-bottom: 1px solid #ccc;
            padding-bottom: 2px;
        }
        .info-grid {
            display: table;
            width: 100%;
            margin-bottom: 10px;
        }
        .info-row {
            display: table-row;
        }
        .info-label {
            display: table-cell;
            font-weight: bold;
            width: 30%;
            padding: 2px 5px;
        }
        .info-value {
            display: table-cell;
            padding: 2px 5px;
        }
        .description {
            background-color: #f9f9f9;
            padding: 10px;
            border-left: 3px solid #333;
            margin: 10px 0;
        }
        .footer {
            margin-top: 30px;
            padding-top: 10px;
            border-top: 1px solid #ccc;
            font-size: 10px;
            text-align: center;
        }
        .signature {
            margin-top: 20px;
            text-align: right;
        }
        .signature-line {
            border-top: 1px solid #333;
            width: 200px;
            margin-left: auto;
            margin-top: 30px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>SOCIÉTÉ DE MANUTENTION MARITIME ET PORTUAIRE</h1>
        <p>SMMC - PORT DE TOAMASINA</p>
        <p>RAPPORT D'INCIDENT</p>
        <p>Numéro: RPT-{{ $incident->idIncident }}-{{ date('Y') }}</p>
    </div>

    <div class="section">
        <h2>INFORMATIONS GÉNÉRALES</h2>
        <div class="info-grid">
            <div class="info-row">
                <div class="info-label">Date de création:</div>
                <div class="info-value">{{ $rapport->dateCreation->format('d/m/Y H:i') }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Généré par:</div>
                <div class="info-value">{{ $user->prenom }} {{ $user->nom }} ({{ $user->matricule }})</div>
            </div>
            <div class="info-row">
                <div class="info-label">Rôle:</div>
                <div class="info-value">{{ ucfirst($user->role) }}</div>
            </div>
        </div>
    </div>

    <div class="section">
        <h2>DÉTAILS DE L'INCIDENT</h2>
        <div class="info-grid">
            <div class="info-row">
                <div class="info-label">Numéro d'incident:</div>
                <div class="info-value">#{{ $incident->idIncident }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Type d'incident:</div>
                <div class="info-value">{{ $incident->typeIncident }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Date/Heure:</div>
                <div class="info-value">{{ \Carbon\Carbon::parse($incident->dateHeure)->format('d/m/Y H:i') }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Zone:</div>
                <div class="info-value">{{ $incident->zone }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Statut:</div>
                <div class="info-value">{{ ucfirst(str_replace('_', ' ', $incident->statut)) }}</div>
            </div>
        </div>

        <div class="description">
            <strong>Description:</strong><br>
            {{ $incident->description }}
        </div>
    </div>

    <div class="section">
        <h2>CAMÉRA CONCERNÉE</h2>
        <div class="info-grid">
            <div class="info-row">
                <div class="info-label">Numéro de série:</div>
                <div class="info-value">{{ $incident->camera->numeroSerie }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Adresse IP:</div>
                <div class="info-value">{{ $incident->camera->adresseIP }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Emplacement:</div>
                <div class="info-value">{{ $incident->camera->emplacement }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Zone:</div>
                <div class="info-value">{{ $incident->camera->zone }}</div>
            </div>
        </div>
    </div>

    <div class="section">
        <h2>AGENT SIGNALANT</h2>
        <div class="info-grid">
            <div class="info-row">
                <div class="info-label">Nom:</div>
                <div class="info-value">{{ $incident->utilisateur->prenom }} {{ $incident->utilisateur->nom }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Matricule:</div>
                <div class="info-value">{{ $incident->utilisateur->matricule }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Rôle:</div>
                <div class="info-value">{{ ucfirst($incident->utilisateur->role) }}</div>
            </div>
        </div>
    </div>

    @if($rapport->notes)
    <div class="section">
        <h2>NOTES DU RAPPORT</h2>
        <div class="description">
            {{ $rapport->notes }}
        </div>
    </div>
    @endif

    <div class="signature">
        <p>Signature du responsable:</p>
        <div class="signature-line"></div>
        <p style="margin-top: 5px; font-size: 10px;">{{ $user->prenom }} {{ $user->nom }}</p>
    </div>

    <div class="footer">
        <p>Document généré automatiquement par le système SMMC</p>
        <p>© {{ date('Y') }} SMMC - Tous droits réservés</p>
    </div>
</body>
</html>