<?php

use Illuminate\Support\Facades\Route;
use App\Models\Incident;
use App\Models\Camera;
use App\Models\Personne;

Route::get('/', function () {
    return view('welcome');
});

// Route de test pour vérifier les modèles
Route::get('/test-models', function () {
    try {
        $incidents = Incident::count();
        $cameras = Camera::count();
        $personnes = Personne::count();

        return response()->json([
            'success' => true,
            'message' => 'Modèles fonctionnels',
            'data' => [
                'incidents' => $incidents,
                'cameras' => $cameras,
                'personnes' => $personnes,
            ]
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Erreur: ' . $e->getMessage()
        ]);
    }
});

// Route de test pour vérifier les éléments supprimés
Route::get('/test-trash', function () {
    try {
        $deletedIncidents = Incident::where('actif', false)->count();
        $deletedCameras = Camera::where('actif', false)->count();
        $deletedPersonnes = Personne::where('actif', false)->count();

        return response()->json([
            'success' => true,
            'message' => 'Test corbeille réussi',
            'data' => [
                'deleted_incidents' => $deletedIncidents,
                'deleted_cameras' => $deletedCameras,
                'deleted_personnes' => $deletedPersonnes,
            ]
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Erreur: ' . $e->getMessage()
        ]);
    }
});

// Route de test pour la suppression
Route::delete('/test-delete/{id}', function ($id) {
    try {
        return response()->json([
            'success' => true,
            'message' => "Test DELETE réussi pour l'ID {$id}",
            'method' => 'DELETE',
            'id' => $id
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Erreur: ' . $e->getMessage()
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Erreur: ' . $e->getMessage()
        ]);
    }
});

// Route pour obtenir un token de test pour l'agent
Route::get('/test-agent-token', function () {
    try {
        $agent = \App\Models\User::where('matricule', '2020012')->first();

        if (!$agent) {
            return response()->json([
                'success' => false,
                'message' => 'Agent non trouvé'
            ]);
        }

        $token = $agent->createToken('test-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Token généré pour l\'agent',
            'data' => [
                'user' => [
                    'id' => $agent->idUtilisateur,
                    'nom' => $agent->nom,
                    'prenom' => $agent->prenom,
                    'role' => $agent->role,
                    'matricule' => $agent->matricule
                ],
                'token' => $token
            ]
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Erreur: ' . $e->getMessage()
        ]);
    }
});
