<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\TrashService;
use App\Models\Incident;
use App\Models\Camera;
use App\Models\Personne;
use App\Models\User;
use Illuminate\Http\Request;

class TrashController extends Controller
{
    protected $trashService;

    public function __construct(TrashService $trashService)
    {
        $this->trashService = $trashService;
    }

    /**
     * Obtenir tous les éléments dans la corbeille
     */
    public function index(Request $request)
    {
        $user = $request->user();

        // Vérifier les permissions
        if (!in_array($user->role, ['admin', 'responsable'])) {
            return response()->json([
                'success' => false,
                'message' => 'Permission refusée pour accéder à la corbeille.'
            ], 403);
        }

        $type = $request->get('type', 'all');
        $limit = $request->get('limit', 50);

        try {
            $trashItems = [];

            if ($type === 'incidents' || $type === 'all') {
                $incidents = Incident::where('actif', false)
                    ->whereNotNull('deleted_at')
                    ->orderBy('deleted_at', 'desc')
                    ->limit($limit)
                    ->get()
                    ->toArray();

                if ($type === 'incidents') {
                    $trashItems = $incidents;
                } else {
                    $trashItems['incidents'] = $incidents;
                }
            }

            if ($type === 'cameras' || $type === 'all') {
                $cameras = Camera::where('actif', false)
                    ->whereNotNull('deleted_at')
                    ->orderBy('deleted_at', 'desc')
                    ->limit($limit)
                    ->get()
                    ->toArray();

                if ($type === 'cameras') {
                    $trashItems = $cameras;
                } else {
                    $trashItems['cameras'] = $cameras;
                }
            }

            if ($type === 'personnes' || $type === 'all') {
                $personnes = Personne::where('actif', false)
                    ->whereNotNull('deleted_at')
                    ->orderBy('deleted_at', 'desc')
                    ->limit($limit)
                    ->get()
                    ->toArray();

                if ($type === 'personnes') {
                    $trashItems = $personnes;
                } else {
                    $trashItems['personnes'] = $personnes;
                }
            }

            return response()->json([
                'success' => true,
                'data' => $trashItems
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération de la corbeille: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Restaurer un élément de la corbeille
     */
    public function restore(Request $request, $type, $id)
    {
        $user = $request->user();

        // Vérifier les permissions
        if (!in_array($user->role, ['admin', 'responsable'])) {
            return response()->json([
                'success' => false,
                'message' => 'Permission refusée pour restaurer des éléments.'
            ], 403);
        }

        try {
            $model = null;

            switch ($type) {
                case 'incidents':
                    $model = Incident::where('actif', false)->find($id);
                    break;
                case 'cameras':
                    $model = Camera::where('actif', false)->find($id);
                    break;
                case 'personnes':
                    $model = Personne::where('actif', false)->find($id);
                    break;
            }

            if (!$model) {
                return response()->json([
                    'success' => false,
                    'message' => 'Élément non trouvé dans la corbeille.'
                ], 404);
            }

            // Restauration simple
            $model->update([
                'actif' => true,
                'deleted_at' => null,
                'deleted_by' => null,
                'deletion_reason' => null,
                'restored_at' => now(),
                'restored_by' => $user->idUtilisateur,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Élément restauré avec succès.'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la restauration: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Supprimer définitivement un élément
     */
    public function permanentDelete(Request $request, $type, $id)
    {
        $user = $request->user();
        
        // Seuls les admins peuvent supprimer définitivement
        if ($user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Seuls les administrateurs peuvent supprimer définitivement.'
            ], 403);
        }

        try {
            $model = $this->getModelInstance($type, $id);
            
            if (!$model) {
                return response()->json([
                    'success' => false,
                    'message' => 'Élément non trouvé dans la corbeille.'
                ], 404);
            }

            if ($model->permanentDelete()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Élément supprimé définitivement.'
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Erreur lors de la suppression définitive.'
                ], 500);
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Vider la corbeille (supprimer tous les éléments anciens)
     */
    public function emptyTrash(Request $request)
    {
        $user = $request->user();
        
        // Seuls les admins peuvent vider la corbeille
        if ($user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Seuls les administrateurs peuvent vider la corbeille.'
            ], 403);
        }

        $daysOld = $request->get('days_old', 30);

        try {
            $deletedCounts = [
                'incidents' => $this->trashService->cleanupTrash(Incident::class, $daysOld),
                'cameras' => $this->trashService->cleanupTrash(Camera::class, $daysOld),
                'personnes' => $this->trashService->cleanupTrash(Personne::class, $daysOld),
                'users' => $this->trashService->cleanupTrash(User::class, $daysOld),
            ];

            $totalDeleted = array_sum($deletedCounts);

            return response()->json([
                'success' => true,
                'message' => "Corbeille vidée: {$totalDeleted} éléments supprimés définitivement.",
                'details' => $deletedCounts
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du vidage de la corbeille: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtenir une instance de modèle depuis la corbeille
     */
    private function getModelInstance($type, $id)
    {
        switch ($type) {
            case 'incidents':
                return Incident::onlyTrashed()->find($id);
            case 'cameras':
                return Camera::onlyTrashed()->find($id);
            case 'personnes':
                return Personne::onlyTrashed()->find($id);
            case 'users':
                return User::onlyTrashed()->find($id);
            default:
                return null;
        }
    }
}
