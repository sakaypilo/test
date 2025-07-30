<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Rapport;
use App\Models\Incident;
use App\Models\Vol;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;

class RapportController extends Controller
{
    public function index(Request $request)
    {
        $query = Rapport::with(['validateur', 'incident.camera', 'vol.camera']);

        // Filtres
        if ($request->has('type')) {
            $query->where('typeRapport', $request->type);
        }

        if ($request->has('validateur')) {
            $query->where('validePar', $request->validateur);
        }

        $rapports = $query->orderBy('dateCreation', 'desc')->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $rapports->items(),
            'pagination' => [
                'current_page' => $rapports->currentPage(),
                'last_page' => $rapports->lastPage(),
                'per_page' => $rapports->perPage(),
                'total' => $rapports->total(),
            ]
        ]);
    }

    public function generateIncidentReport(Request $request, $incidentId)
    {
        $request->validate([
            'observations' => 'nullable|string'
        ]);

        $user = $request->user();

        // Vérifier les permissions (R22)
        if (!in_array($user->role, ['responsable', 'admin'])) {
            return response()->json([
                'success' => false,
                'message' => 'Vous n\'avez pas les permissions pour générer un rapport'
            ], 403);
        }

        $incident = Incident::with(['camera', 'utilisateur'])->findOrFail($incidentId);

        // Vérifier que l'incident est validé (R19)
        if ($incident->statut !== 'valide') {
            return response()->json([
                'success' => false,
                'message' => 'Seuls les incidents validés peuvent générer un rapport'
            ], 400);
        }

        // Vérifier qu'un rapport n'existe pas déjà
        $existingRapport = Rapport::where('idIncident', $incidentId)->first();
        if ($existingRapport) {
            return response()->json([
                'success' => false,
                'message' => 'Un rapport existe déjà pour cet incident'
            ], 400);
        }

        // Générer le contenu du rapport
        $contenu = $this->generateIncidentContent($incident);

        // Créer le rapport
        $rapport = Rapport::create([
            'typeRapport' => 'incident',
            'contenu' => $contenu,
            'dateCreation' => now(),
            'validePar' => $user->idUtilisateur,
            'idIncident' => $incident->idIncident,
            'observations' => $request->observations
        ]);

        // Générer le PDF
        $pdf = $this->generatePDF($rapport, $incident);
        $filename = 'rapport_incident_' . $incident->idIncident . '_' . time() . '.pdf';
        
        Storage::disk('public')->put('rapports/' . $filename, $pdf->output());
        
        $rapport->fichierPDF = 'rapports/' . $filename;
        $rapport->save();

        $rapport->load(['validateur', 'incident.camera']);

        return response()->json([
            'success' => true,
            'message' => 'Rapport généré avec succès',
            'data' => $rapport
        ], 201);
    }

    public function download($id)
    {
        $rapport = Rapport::findOrFail($id);

        if (!$rapport->fichierPDF || !Storage::disk('public')->exists($rapport->fichierPDF)) {
            return response()->json([
                'success' => false,
                'message' => 'Fichier PDF non trouvé'
            ], 404);
        }

        return Storage::disk('public')->download($rapport->fichierPDF);
    }

    private function generateIncidentContent($incident)
    {
        return "RAPPORT D'INCIDENT - SMMC PORT DE TOAMASINA\n\n" .
               "Numéro de rapport: RPT-{$incident->idIncident}-" . date('Y') . "\n" .
               "Date de création: " . now()->format('d/m/Y H:i') . "\n\n" .
               "DÉTAILS DE L'INCIDENT:\n" .
               "Type: {$incident->typeIncident}\n" .
               "Date/Heure: " . $incident->dateHeure->format('d/m/Y H:i') . "\n" .
               "Zone: {$incident->zone}\n" .
               "Description: {$incident->description}\n\n" .
               "CAMÉRA CONCERNÉE:\n" .
               "Numéro de série: {$incident->camera->numeroSerie}\n" .
               "Emplacement: {$incident->camera->emplacement}\n" .
               "Adresse IP: {$incident->camera->adresseIP}\n\n" .
               "SIGNALÉ PAR:\n" .
               "Agent: {$incident->utilisateur->prenom} {$incident->utilisateur->nom}\n" .
               "Matricule: {$incident->utilisateur->matricule}\n\n" .
               "Photos jointes: " . count($incident->photos) . " photo(s)\n";
    }

    private function generatePDF($rapport, $incident)
    {
        $data = [
            'rapport' => $rapport,
            'incident' => $incident,
            'dateGeneration' => now()->format('d/m/Y H:i')
        ];

        return PDF::loadView('rapports.incident', $data)
                  ->setPaper('a4', 'portrait');
    }

    public function statistics()
    {
        $stats = [
            'total' => Rapport::count(),
            'incidents' => Rapport::where('typeRapport', 'incident')->count(),
            'vols' => Rapport::where('typeRapport', 'vol')->count(),
            'ce_mois' => Rapport::whereMonth('dateCreation', now()->month)
                               ->whereYear('dateCreation', now()->year)
                               ->count(),
            'par_validateur' => Rapport::with('validateur')
                                      ->selectRaw('validePar, COUNT(*) as count')
                                      ->groupBy('validePar')
                                      ->get(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }
}