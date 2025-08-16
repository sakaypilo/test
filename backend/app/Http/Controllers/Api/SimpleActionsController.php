<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Incident;
use App\Models\Camera;
use App\Models\Personne;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class SimpleActionsController extends Controller
{
    /**
     * Supprimer un incident
     */
    public function deleteIncident(Request $request, $id)
    {
        try {
            $user = $request->user();
            $incident = Incident::findOrFail($id);

            // Debug des informations
            Log::info('Tentative de suppression d\'incident', [
                'incident_id' => $id,
                'user_id' => $user->idUtilisateur,
                'user_role' => $user->role,
                'incident_user_id' => $incident->idUtilisateur,
                'incident_data' => $incident->toArray()
            ]);

            // Vérifier les permissions
            $canDelete = false;
            if ($user->role === 'admin') {
                $canDelete = true;
            } elseif ($user->role === 'responsable') {
                $canDelete = true;
            } elseif ($user->role === 'agent' && $incident->idUtilisateur === $user->idUtilisateur) {
                $canDelete = true;
            }

            if (!$canDelete) {
                Log::warning('Permission refusée pour suppression incident', [
                    'user_id' => $user->idUtilisateur,
                    'user_role' => $user->role,
                    'incident_id' => $id,
                    'incident_user_id' => $incident->idUtilisateur
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Permission refusée pour supprimer cet incident',
                    'debug' => [
                        'user_role' => $user->role,
                        'user_id' => $user->idUtilisateur,
                        'incident_user_id' => $incident->idUtilisateur,
                        'can_delete' => $canDelete
                    ]
                ], 403);
            }

            // Suppression simple
            $incident->update([
                'actif' => false,
                'deleted_at' => now(),
                'deleted_by' => $user->idUtilisateur,
                'deletion_reason' => $request->input('reason', 'Suppression par utilisateur'),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Incident supprimé avec succès'
            ]);
        } catch (\Exception $e) {
            Log::error('Erreur suppression incident', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression'
            ], 500);
        }
    }

    /**
     * Restaurer un incident
     */
    public function restoreIncident(Request $request, $id)
    {
        try {
            $user = $request->user();
            
            if (!in_array($user->role, ['admin', 'responsable'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Permission refusée'
                ], 403);
            }

            $incident = Incident::where('actif', false)->findOrFail($id);

            $incident->update([
                'actif' => true,
                'deleted_at' => null,
                'deleted_by' => null,
                'deletion_reason' => null,
                'restored_at' => now(),
                'restored_by' => $user->idUtilisateur,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Incident restauré avec succès'
            ]);
        } catch (\Exception $e) {
            Log::error('Erreur restauration incident', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la restauration'
            ], 500);
        }
    }

    /**
     * Supprimer une caméra
     */
    public function deleteCamera(Request $request, $id)
    {
        try {
            $user = $request->user();
            
            if (!in_array($user->role, ['admin', 'responsable'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Permission refusée'
                ], 403);
            }

            $camera = Camera::findOrFail($id);

            $camera->update([
                'actif' => false,
                'deleted_at' => now(),
                'deleted_by' => $user->idUtilisateur,
                'deletion_reason' => $request->input('reason', 'Suppression par utilisateur'),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Caméra supprimée avec succès'
            ]);
        } catch (\Exception $e) {
            Log::error('Erreur suppression caméra', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression'
            ], 500);
        }
    }

    /**
     * Supprimer une personne
     */
    public function deletePerson(Request $request, $id)
    {
        try {
            $user = $request->user();
            
            if (!in_array($user->role, ['admin', 'responsable'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Permission refusée'
                ], 403);
            }

            $person = Personne::findOrFail($id);

            $person->update([
                'actif' => false,
                'deleted_at' => now(),
                'deleted_by' => $user->idUtilisateur,
                'deletion_reason' => $request->input('reason', 'Suppression par utilisateur'),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Personne supprimée avec succès'
            ]);
        } catch (\Exception $e) {
            Log::error('Erreur suppression personne', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression'
            ], 500);
        }
    }

    /**
     * Obtenir les éléments supprimés
     */
    public function getDeleted(Request $request)
    {
        try {
            $user = $request->user();
            
            if (!in_array($user->role, ['admin', 'responsable'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Permission refusée'
                ], 403);
            }

            $type = $request->get('type', 'all');
            $data = [];

            if ($type === 'incidents' || $type === 'all') {
                $incidents = Incident::where('actif', false)
                    ->whereNotNull('deleted_at')
                    ->orderBy('deleted_at', 'desc')
                    ->limit(50)
                    ->get();
                
                if ($type === 'incidents') {
                    $data = $incidents;
                } else {
                    $data['incidents'] = $incidents;
                }
            }

            if ($type === 'cameras' || $type === 'all') {
                $cameras = Camera::where('actif', false)
                    ->whereNotNull('deleted_at')
                    ->orderBy('deleted_at', 'desc')
                    ->limit(50)
                    ->get();
                
                if ($type === 'cameras') {
                    $data = $cameras;
                } else {
                    $data['cameras'] = $cameras;
                }
            }

            if ($type === 'personnes' || $type === 'all') {
                $personnes = Personne::where('actif', false)
                    ->whereNotNull('deleted_at')
                    ->orderBy('deleted_at', 'desc')
                    ->limit(50)
                    ->get();
                
                if ($type === 'personnes') {
                    $data = $personnes;
                } else {
                    $data['personnes'] = $personnes;
                }
            }

            return response()->json([
                'success' => true,
                'data' => $data
            ]);
        } catch (\Exception $e) {
            Log::error('Erreur récupération éléments supprimés', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération'
            ], 500);
        }
    }
}
