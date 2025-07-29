<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Rapport;
use App\Models\Incident;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Barryvdh\DomPDF\Facade\Pdf;

class RapportController extends Controller
{
    public function index(Request $request)
    {
        $query = Rapport::with(['incident.camera', 'utilisateur']);

        // Filtres
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        if ($request->has('validateur')) {
            $query->where('idUtilisateur', $request->validateur);
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
            'notes' => 'nullable|string',
        ]);

        $user = $request->user();
        $incident = Incident::with(['camera', 'utilisateur'])->findOrFail($incidentId);

        // Vérifier que l'incident est validé
        if ($incident->statut !== 'valide') {
            return response()->json([
                'success' => false,
                'message' => 'Seuls les incidents validés peuvent avoir un rapport'
            ], 400);
        }

        // Vérifier les permissions (R19, R20)
        if (!in_array($user->role, ['responsable', 'admin'])) {
            return response()->json([
                'success' => false,
                'message' => 'Vous n\'avez pas les permissions pour générer un rapport'
            ], 403);
        }

        // Créer le rapport
        $rapport = Rapport::create([
            'idIncident' => $incident->idIncident,
            'idUtilisateur' => $user->idUtilisateur,
            'dateCreation' => now(),
            'notes' => $request->notes,
            'type' => 'incident'
        ]);

        // Générer le PDF
        $pdf = Pdf::loadView('rapports.incident', [
            'rapport' => $rapport,
            'incident' => $incident,
            'user' => $user
        ]);

        $filename = 'rapport_incident_' . $incident->idIncident . '_' . date('Y-m-d_H-i-s') . '.pdf';
        Storage::disk('public')->put('rapports/' . $filename, $pdf->output());

        $rapport->update(['fichier' => 'rapports/' . $filename]);

        $rapport->load(['incident.camera', 'utilisateur']);

        return response()->json([
            'success' => true,
            'message' => 'Rapport généré avec succès',
            'data' => $rapport
        ], 201);
    }

    public function download($id)
    {
        $rapport = Rapport::findOrFail($id);
        
        if (!$rapport->fichier || !Storage::disk('public')->exists($rapport->fichier)) {
            return response()->json([
                'success' => false,
                'message' => 'Fichier rapport introuvable'
            ], 404);
        }

        $path = Storage::disk('public')->path($rapport->fichier);
        
        return response()->download($path, basename($rapport->fichier));
    }

    public function statistics()
    {
        $stats = [
            'total' => Rapport::count(),
            'ce_mois' => Rapport::whereMonth('dateCreation', now()->month)
                                ->whereYear('dateCreation', now()->year)
                                ->count(),
            'par_type' => Rapport::selectRaw('type, COUNT(*) as count')
                                 ->groupBy('type')
                                 ->get(),
            'par_utilisateur' => Rapport::with('utilisateur')
                                       ->selectRaw('idUtilisateur, COUNT(*) as count')
                                       ->groupBy('idUtilisateur')
                                       ->get(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }
}