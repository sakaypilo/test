<?php

use Illuminate\Support\Facades\Route;
use App\Models\Incident;
use App\Models\Camera;
use App\Models\Personne;
use App\Http\Controllers\Web\TrashController;
use App\Http\Controllers\Web\AuthController;

// Redirection de la racine vers la page de connexion
Route::get('/', function () {
    return redirect()->route('login');
});

// Routes d'authentification
Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
Route::post('/login', [AuthController::class, 'login'])->name('login.post');
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

// Page de test des comptes
Route::get('/test-accounts', function () {
    return view('test-accounts');
})->name('test.accounts');

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

// Routes d'administration protégées
Route::prefix('admin')->name('admin.')->middleware('web.auth')->group(function () {
    // Dashboard
    Route::get('/', [AuthController::class, 'dashboard'])->name('dashboard');
    Route::get('/dashboard', [AuthController::class, 'dashboard'])->name('dashboard.alt');

    // Corbeille
    Route::prefix('trash')->name('trash.')->group(function () {
        Route::get('/', [TrashController::class, 'index'])->name('index');
        Route::post('/restore', [TrashController::class, 'restore'])->name('restore');
        Route::post('/force-delete', [TrashController::class, 'forceDelete'])->name('force-delete');
        Route::post('/empty', [TrashController::class, 'empty'])->name('empty');
    });
});
