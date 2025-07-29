<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Camera;
use App\Models\Incident;
use App\Models\Vol;
use App\Models\Personne;
use App\Models\Rapport;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        // Statistiques générales
        $stats = [
            'cameras' => [
                'total' => Camera::count(),
                'actives' => Camera::where('statut', 'actif')->count(),
                'en_panne' => Camera::where('statut', 'panne')->count(),
                'hors_ligne' => Camera::where('statut', 'hors ligne')->count(),
            ],
            'incidents' => [
                'total' => Incident::count(),
                'ce_mois' => Incident::whereMonth('dateHeure', now()->month)
                                   ->whereYear('dateHeure', now()->year)
                                   ->count(),
                'en_attente' => Incident::where('statut', 'en_attente')->count(),
                'valides' => Incident::where('statut', 'valide')->count(),
                'rejetes' => Incident::where('statut', 'rejete')->count(),
            ],
            'vols' => [
                'total' => Vol::count(),
                'ce_mois' => Vol::whereMonth('dateHeure', now()->month)
                               ->whereYear('dateHeure', now()->year)
                               ->count(),
                'en_attente' => Vol::where('statut', 'en_attente')->count(),
                'valides' => Vol::where('statut', 'valide')->count(),
            ],
            'personnes' => [
                'total' => Personne::count(),
                'internes' => Personne::where('statut', 'interne')->count(),
                'externes' => Personne::where('statut', 'externe')->count(),
            ],
            'rapports' => [
                'total' => Rapport::count(),
                'ce_mois' => Rapport::whereMonth('dateCreation', now()->month)
                                   ->whereYear('dateCreation', now()->year)
                                   ->count(),
            ]
        ];

        // Incidents récents
        $incidentsRecents = Incident::with(['camera', 'utilisateur'])
                                   ->orderBy('dateHeure', 'desc')
                                   ->limit(5)
                                   ->get();

        // Caméras par zone avec statuts
        $camerasParZone = Camera::selectRaw('zone, statut, COUNT(*) as count')
                               ->groupBy('zone', 'statut')
                               ->get()
                               ->groupBy('zone');

        // Évolution des incidents sur les 12 derniers mois (R28)
        $evolutionIncidents = Incident::selectRaw('YEAR(dateHeure) as year, MONTH(dateHeure) as month, COUNT(*) as count')
                                     ->where('dateHeure', '>=', now()->subMonths(12))
                                     ->where('statut', 'valide') // R29: Seulement les validés
                                     ->groupBy('year', 'month')
                                     ->orderBy('year')
                                     ->orderBy('month')
                                     ->get();

        // Types d'incidents les plus fréquents
        $typesIncidents = Incident::selectRaw('typeIncident, COUNT(*) as count')
                                 ->where('statut', 'valide')
                                 ->groupBy('typeIncident')
                                 ->orderBy('count', 'desc')
                                 ->limit(5)
                                 ->get();

        // Alertes système
        $alertes = [];

        // Caméras hors ligne depuis plus de 15 minutes (R35)
        $camerasHorsLigne = Camera::where('statut', 'hors ligne')
                                 ->where('updated_at', '<=', now()->subMinutes(15))
                                 ->count();

        if ($camerasHorsLigne > 0) {
            $alertes[] = [
                'type' => 'warning',
                'message' => "{$camerasHorsLigne} caméra(s) hors ligne depuis plus de 15 minutes",
                'count' => $camerasHorsLigne
            ];
        }

        // Incidents en attente de validation
        $incidentsEnAttente = Incident::where('statut', 'en_attente')->count();
        if ($incidentsEnAttente > 0 && in_array($user->role, ['responsable', 'admin'])) {
            $alertes[] = [
                'type' => 'info',
                'message' => "{$incidentsEnAttente} incident(s) en attente de validation",
                'count' => $incidentsEnAttente
            ];
        }

        return response()->json([
            'success' => true,
            'data' => [
                'statistiques' => $stats,
                'incidents_recents' => $incidentsRecents,
                'cameras_par_zone' => $camerasParZone,
                'evolution_incidents' => $evolutionIncidents,
                'types_incidents' => $typesIncidents,
                'alertes' => $alertes,
                'derniere_mise_a_jour' => now()->toISOString()
            ]
        ]);
    }

    public function alertes(Request $request)
    {
        $user = $request->user();
        $alertes = [];

        // Caméras avec problèmes
        $camerasProblemes = Camera::whereIn('statut', ['panne', 'hors ligne'])->get();
        foreach ($camerasProblemes as $camera) {
            $alertes[] = [
                'type' => $camera->statut === 'panne' ? 'error' : 'warning',
                'titre' => 'Caméra ' . $camera->statut,
                'message' => "Caméra {$camera->numeroSerie} ({$camera->zone}) est {$camera->statut}",
                'date' => $camera->updated_at,
                'priorite' => $camera->statut === 'panne' ? 'haute' : 'moyenne'
            ];
        }

        // Incidents nécessitant une validation (pour responsables/admin)
        if (in_array($user->role, ['responsable', 'admin'])) {
            $incidentsEnAttente = Incident::with(['camera', 'utilisateur'])
                                         ->where('statut', 'en_attente')
                                         ->orderBy('dateHeure', 'desc')
                                         ->get();

            foreach ($incidentsEnAttente as $incident) {
                $alertes[] = [
                    'type' => 'info',
                    'titre' => 'Validation requise',
                    'message' => "Incident {$incident->typeIncident} signalé par {$incident->utilisateur->prenom} {$incident->utilisateur->nom}",
                    'date' => $incident->dateHeure,
                    'priorite' => 'normale',
                    'lien' => "/incidents/{$incident->idIncident}"
                ];
            }
        }

        // Trier par priorité et date
        usort($alertes, function($a, $b) {
            $priorites = ['haute' => 3, 'moyenne' => 2, 'normale' => 1];
            $prioriteA = $priorites[$a['priorite']] ?? 1;
            $prioriteB = $priorites[$b['priorite']] ?? 1;
            
            if ($prioriteA === $prioriteB) {
                return $b['date'] <=> $a['date']; // Plus récent en premier
            }
            
            return $prioriteB <=> $prioriteA; // Priorité haute en premier
        });

        return response()->json([
            'success' => true,
            'data' => array_slice($alertes, 0, 20) // Limiter à 20 alertes
        ]);
    }
}