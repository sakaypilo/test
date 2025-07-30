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
    
    // Rapports
    Route::get('/rapports', [RapportController::class, 'index']);
    Route::post('/rapports/incidents/{id}', [RapportController::class, 'generateIncidentReport']);
    Route::get('/rapports/{id}/download', [RapportController::class, 'download']);
    Route::get('/rapports-statistics', [RapportController::class, 'statistics']);
    
    // Utilisateurs (Admin seulement)
    Route::apiResource('users', UserController::class);
    Route::post('/users/{id}/reset-password', [UserController::class, 'resetPassword']);
    Route::post('/users/{id}/toggle-status', [UserController::class, 'toggleStatus']);
    Route::get('/users-statistics', [UserController::class, 'statistics']);
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