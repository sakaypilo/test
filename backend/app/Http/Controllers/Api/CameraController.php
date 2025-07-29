<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Camera;
use App\Models\MutationCamera;
use Illuminate\Http\Request;

class CameraController extends Controller
{
    public function index(Request $request)
    {
        $query = Camera::with('technicien');

        // Filtres
        if ($request->has('statut')) {
            $query->where('statut', $request->statut);
        }

        if ($request->has('zone')) {
            $query->where('zone', $request->zone);
        }

        $cameras = $query->orderBy('numeroSerie')->get();

        return response()->json([
            'success' => true,
            'data' => $cameras
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'numeroSerie' => 'required|string|max:50|unique:cameras,numeroSerie',
            'adresseIP' => 'required|ip|unique:cameras,adresseIP',
            'zone' => 'required|string|max:100',
            'emplacement' => 'required|string',
            'dateInstallation' => 'required|date',
        ]);

        $user = $request->user();

        // Vérifier les permissions (R12)
        if (!in_array($user->role, ['admin', 'technicien'])) {
            return response()->json([
                'success' => false,
                'message' => 'Vous n\'avez pas les permissions pour ajouter une caméra'
            ], 403);
        }

        $camera = Camera::create([
            'numeroSerie' => $request->numeroSerie,
            'adresseIP' => $request->adresseIP,
            'zone' => $request->zone,
            'emplacement' => $request->emplacement,
            'dateInstallation' => $request->dateInstallation,
            'idTechnicien' => $user->idUtilisateur,
            'statut' => 'actif'
        ]);

        $camera->load('technicien');

        return response()->json([
            'success' => true,
            'message' => 'Caméra ajoutée avec succès',
            'data' => $camera
        ], 201);
    }

    public function show($id)
    {
        $camera = Camera::with(['technicien', 'mutations.technicien', 'incidents', 'vols'])
                        ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $camera
        ]);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'numeroSerie' => 'required|string|max:50|unique:cameras,numeroSerie,' . $id . ',idCamera',
            'adresseIP' => 'required|ip|unique:cameras,adresseIP,' . $id . ',idCamera',
            'zone' => 'required|string|max:100',
            'emplacement' => 'required|string',
            'statut' => 'required|in:actif,panne,hors ligne',
        ]);

        $user = $request->user();

        // Vérifier les permissions
        if (!in_array($user->role, ['admin', 'technicien'])) {
            return response()->json([
                'success' => false,
                'message' => 'Vous n\'avez pas les permissions pour modifier une caméra'
            ], 403);
        }

        $camera = Camera::findOrFail($id);
        $ancienEmplacement = $camera->emplacement;

        $camera->update($request->only([
            'numeroSerie', 'adresseIP', 'zone', 'emplacement', 'statut'
        ]));

        // Si l'emplacement a changé, créer une mutation (R9)
        if ($ancienEmplacement !== $request->emplacement) {
            MutationCamera::create([
                'dateHeureMutation' => now(),
                'ancienEmplacement' => $ancienEmplacement,
                'nouvelEmplacement' => $request->emplacement,
                'motif' => $request->motif ?? 'Déplacement de caméra',
                'idCamera' => $camera->idCamera,
                'idTechnicien' => $user->idUtilisateur
            ]);
        }

        $camera->load('technicien');

        return response()->json([
            'success' => true,
            'message' => 'Caméra mise à jour avec succès',
            'data' => $camera
        ]);
    }

    public function destroy($id)
    {
        $user = request()->user();

        // Seul un admin peut supprimer une caméra
        if ($user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Vous n\'avez pas les permissions pour supprimer une caméra'
            ], 403);
        }

        $camera = Camera::findOrFail($id);

        // Vérifier s'il y a des incidents liés
        if ($camera->incidents()->count() > 0 || $camera->vols()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Impossible de supprimer une caméra ayant des incidents associés'
            ], 400);
        }

        $camera->delete();

        return response()->json([
            'success' => true,
            'message' => 'Caméra supprimée avec succès'
        ]);
    }

    public function statistics()
    {
        $stats = [
            'total' => Camera::count(),
            'actives' => Camera::where('statut', 'actif')->count(),
            'en_panne' => Camera::where('statut', 'panne')->count(),
            'hors_ligne' => Camera::where('statut', 'hors ligne')->count(),
            'par_zone' => Camera::selectRaw('zone, COUNT(*) as count, statut')
                                ->groupBy('zone', 'statut')
                                ->get()
                                ->groupBy('zone'),
            'installations_recentes' => Camera::where('dateInstallation', '>=', now()->subDays(30))
                                              ->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }
}