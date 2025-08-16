<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\IncidentController;
use App\Http\Controllers\Api\CameraController;
use App\Http\Controllers\Api\PersonneController;
use App\Http\Controllers\Api\RapportController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\TrashController;
use App\Http\Controllers\Api\SimpleActionsController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Routes publiques
Route::post('/login', [AuthController::class, 'login']);

// Routes protégées par authentification
Route::middleware('auth:sanctum')->group(function () {
    
    // Authentification
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    
    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::get('/dashboard/alertes', [DashboardController::class, 'alertes']);
    
    // Incidents
    Route::apiResource('incidents', IncidentController::class);
    Route::post('/incidents/{id}/validate', [IncidentController::class, 'validate']);
    Route::get('/incidents-statistics', [IncidentController::class, 'statistics']);
    
    // Caméras
    Route::apiResource('cameras', CameraController::class);
    Route::get('/cameras-statistics', [CameraController::class, 'statistics']);
    
    // Personnes appréhendées
    Route::apiResource('personnes', PersonneController::class);
    Route::post('/personnes/{id}/interpellations', [PersonneController::class, 'addInterpellation']);
    Route::get('/personnes-statistics', [PersonneController::class, 'statistics']);
    Route::delete('/personnes/{id}', [PersonneController::class, 'destroy']);


    // Rapports
    Route::get('/rapports', [RapportController::class, 'index']);
    Route::post('/rapports/incidents/{id}', [RapportController::class, 'generateIncidentReport']);
    Route::get('/rapports/{id}/download', [RapportController::class, 'download'])->name('rapports.download');
    Route::get('/rapports-statistics', [RapportController::class, 'statistics']);
    
    // Utilisateurs (Admin seulement)
    Route::apiResource('users', UserController::class);
    Route::post('/users/{id}/reset-password', [UserController::class, 'resetPassword']);
    Route::post('/users/{id}/toggle-status', [UserController::class, 'toggleStatus']);
    Route::get('/users-statistics', [UserController::class, 'statistics']);

    // Routes pour la corbeille
    Route::prefix('trash')->group(function () {
        Route::get('/', [TrashController::class, 'index']);
        Route::post('/{type}/{id}/restore', [TrashController::class, 'restore']);
        Route::delete('/{type}/{id}/permanent', [TrashController::class, 'permanentDelete']);
        Route::post('/empty', [TrashController::class, 'emptyTrash']);
    });

    // Routes d'actions simples
    Route::delete('/incidents/{id}/delete', [SimpleActionsController::class, 'deleteIncident']);
    Route::post('/incidents/{id}/restore', [SimpleActionsController::class, 'restoreIncident']);
    Route::delete('/cameras/{id}/delete', [SimpleActionsController::class, 'deleteCamera']);
    Route::delete('/personnes/{id}/delete', [SimpleActionsController::class, 'deletePerson']);
    Route::get('/deleted', [SimpleActionsController::class, 'getDeleted']);

    // Route de debug pour vérifier les permissions
    Route::get('/debug/user-incidents', function (Request $request) {
        $user = $request->user();
        $incidents = \App\Models\Incident::where('idUtilisateur', $user->idUtilisateur)->get();

        return response()->json([
            'success' => true,
            'user' => [
                'id' => $user->idUtilisateur,
                'nom' => $user->nom,
                'role' => $user->role,
                'matricule' => $user->matricule
            ],
            'incidents_count' => $incidents->count(),
            'incidents' => $incidents->map(function($incident) {
                return [
                    'id' => $incident->idIncident,
                    'type' => $incident->typeIncident,
                    'description' => $incident->description,
                    'user_id' => $incident->idUtilisateur,
                    'actif' => $incident->actif ?? true
                ];
            })
        ]);
    });
});

// Route de test
Route::get('/test', function () {
    return response()->json([
        'success' => true,
        'message' => 'API SMMC Security Platform - Laravel Backend',
        'version' => '1.0.0',
        'timestamp' => now()->toISOString()
    ]);
});