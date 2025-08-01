<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Rapport;
use App\Models\Incident;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class RapportController extends Controller
{
    public function index(Request $request)
    {
        $query = Rapport::with(['validateur', 'incident.camera', 'incident.utilisateur']);

        // Filtres
        if ($request->has('type')) {
            $query->where('typeRapport', $request->type);
        }

        if ($request->has('validateur')) {
            $query->where('validePar', $request->validateur);
        }

        $rapports = $query->orderBy('dateCreation', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $rapports
        ]);
    }

    public function generateIncidentReport(Request $request, $incidentId)
    {
        try {
            Log::info('Début génération rapport', ['incident_id' => $incidentId]);

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

            $incident = Incident::with(['camera', 'utilisateur'])->find($incidentId);
            
            if (!$incident) {
                return response()->json([
                    'success' => false,
                    'message' => 'Incident non trouvé'
                ], 404);
            }

            Log::info('Incident trouvé', ['incident' => $incident->toArray()]);

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

            Log::info('Rapport créé', ['rapport_id' => $rapport->idRapport]);

            // Générer le PDF
            try {
                $pdf = $this->generatePDF($rapport, $incident);
                $filename = 'rapport_incident_' . $incident->idIncident . '_' . time() . '.pdf';
                
                // Créer le dossier s'il n'existe pas
                if (!Storage::disk('public')->exists('rapports')) {
                    Storage::disk('public')->makeDirectory('rapports');
                }
                
                Storage::disk('public')->put('rapports/' . $filename, $pdf->output());
                
                $rapport->fichierPDF = 'rapports/' . $filename;
                $rapport->save();

                Log::info('PDF généré', ['filename' => $filename]);
            } catch (\Exception $e) {
                Log::error('Erreur génération PDF', ['error' => $e->getMessage()]);
                // Continuer même si le PDF échoue
            }

            $rapport->load(['validateur', 'incident.camera', 'incident.utilisateur']);

            return response()->json([
                'success' => true,
                'message' => 'Rapport généré avec succès',
                'data' => $rapport
            ], 201);

        } catch (\Exception $e) {
            Log::error('Erreur génération rapport', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la génération du rapport: ' . $e->getMessage()
            ], 500);
        }
    }

    public function download($id)
    {
        try {
            $rapport = Rapport::findOrFail($id);

            if (!$rapport->fichierPDF || !Storage::disk('public')->exists($rapport->fichierPDF)) {
                // Régénérer le PDF si nécessaire
                $incident = $rapport->incident()->with(['camera', 'utilisateur'])->first();
                if ($incident) {
                    $pdf = $this->generatePDF($rapport, $incident);
                    $filename = 'rapport_incident_' . $incident->idIncident . '_' . time() . '.pdf';
                    
                    Storage::disk('public')->put('rapports/' . $filename, $pdf->output());
                    $rapport->fichierPDF = 'rapports/' . $filename;
                    $rapport->save();
                } else {
                    return response()->json([
                        'success' => false,
                        'message' => 'Fichier PDF non trouvé et impossible de le régénérer'
                    ], 404);
                }
            }

            return Storage::disk('public')->download($rapport->fichierPDF);
        } catch (\Exception $e) {
            Log::error('Erreur téléchargement rapport', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du téléchargement'
            ], 500);
        }
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