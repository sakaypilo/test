@extends('layouts.admin')

@section('title', 'Dashboard')

@section('content')
<div class="container-fluid">
    <!-- En-tête de bienvenue -->
    <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
            <h1 class="h3 mb-0 text-gray-800">
                <i class="fas fa-tachometer-alt me-2"></i>Dashboard
            </h1>
            <p class="text-muted">
                Bienvenue, {{ $user['prenom'] }} {{ $user['nom'] }} 
                <span class="badge bg-primary">{{ ucfirst($user['role']) }}</span>
            </p>
        </div>
        
        <div class="text-muted">
            <i class="fas fa-calendar me-1"></i>
            {{ \Carbon\Carbon::now()->format('d/m/Y H:i') }}
        </div>
    </div>

    <!-- Statistiques principales -->
    <div class="row mb-4">
        <!-- Incidents -->
        <div class="col-xl-3 col-md-6 mb-4">
            <div class="card border-left-danger shadow h-100 py-2">
                <div class="card-body">
                    <div class="row no-gutters align-items-center">
                        <div class="col mr-2">
                            <div class="text-xs font-weight-bold text-danger text-uppercase mb-1">
                                Incidents Actifs
                            </div>
                            <div class="h5 mb-0 font-weight-bold text-gray-800">
                                {{ $stats['incidents']['total'] }}
                            </div>
                            <div class="text-xs text-muted">
                                {{ $stats['incidents']['en_attente'] }} en attente, 
                                {{ $stats['incidents']['valides'] }} validés
                            </div>
                        </div>
                        <div class="col-auto">
                            <i class="fas fa-exclamation-triangle fa-2x text-gray-300"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Caméras -->
        <div class="col-xl-3 col-md-6 mb-4">
            <div class="card border-left-warning shadow h-100 py-2">
                <div class="card-body">
                    <div class="row no-gutters align-items-center">
                        <div class="col mr-2">
                            <div class="text-xs font-weight-bold text-warning text-uppercase mb-1">
                                Caméras
                            </div>
                            <div class="h5 mb-0 font-weight-bold text-gray-800">
                                {{ $stats['cameras']['total'] }}
                            </div>
                            <div class="text-xs text-muted">
                                {{ $stats['cameras']['actives'] }} actives, 
                                {{ $stats['cameras']['hors_ligne'] }} hors ligne
                            </div>
                        </div>
                        <div class="col-auto">
                            <i class="fas fa-video fa-2x text-gray-300"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Personnes -->
        <div class="col-xl-3 col-md-6 mb-4">
            <div class="card border-left-info shadow h-100 py-2">
                <div class="card-body">
                    <div class="row no-gutters align-items-center">
                        <div class="col mr-2">
                            <div class="text-xs font-weight-bold text-info text-uppercase mb-1">
                                Personnes
                            </div>
                            <div class="h5 mb-0 font-weight-bold text-gray-800">
                                {{ $stats['personnes']['total'] }}
                            </div>
                            <div class="text-xs text-muted">
                                {{ $stats['personnes']['libres'] }} libres, 
                                {{ $stats['personnes']['detenus'] }} détenus
                            </div>
                        </div>
                        <div class="col-auto">
                            <i class="fas fa-users fa-2x text-gray-300"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Utilisateurs -->
        <div class="col-xl-3 col-md-6 mb-4">
            <div class="card border-left-success shadow h-100 py-2">
                <div class="card-body">
                    <div class="row no-gutters align-items-center">
                        <div class="col mr-2">
                            <div class="text-xs font-weight-bold text-success text-uppercase mb-1">
                                Utilisateurs
                            </div>
                            <div class="h5 mb-0 font-weight-bold text-gray-800">
                                {{ $stats['utilisateurs']['total'] }}
                            </div>
                            <div class="text-xs text-muted">
                                {{ $stats['utilisateurs']['admins'] }} admins, 
                                {{ $stats['utilisateurs']['agents'] }} agents
                            </div>
                        </div>
                        <div class="col-auto">
                            <i class="fas fa-user-shield fa-2x text-gray-300"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Statistiques de la corbeille -->
    <div class="row mb-4">
        <div class="col-12">
            <div class="card shadow">
                <div class="card-header py-3 d-flex justify-content-between align-items-center">
                    <h6 class="m-0 font-weight-bold text-primary">
                        <i class="fas fa-trash-alt me-2"></i>Éléments Supprimés
                    </h6>
                    <a href="{{ route('admin.trash.index') }}" class="btn btn-sm btn-outline-primary">
                        <i class="fas fa-eye me-1"></i>Voir la corbeille
                    </a>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-4">
                            <div class="text-center">
                                <div class="h4 text-danger">{{ $stats['incidents']['supprimes'] }}</div>
                                <div class="text-muted">Incidents supprimés</div>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="text-center">
                                <div class="h4 text-warning">{{ $stats['cameras']['supprimees'] }}</div>
                                <div class="text-muted">Caméras supprimées</div>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="text-center">
                                <div class="h4 text-info">{{ $stats['personnes']['supprimees'] }}</div>
                                <div class="text-muted">Personnes supprimées</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Actions rapides -->
    <div class="row">
        <div class="col-lg-6 mb-4">
            <div class="card shadow">
                <div class="card-header py-3">
                    <h6 class="m-0 font-weight-bold text-primary">
                        <i class="fas fa-tools me-2"></i>Actions Rapides
                    </h6>
                </div>
                <div class="card-body">
                    <div class="list-group list-group-flush">
                        <a href="{{ route('admin.trash.index') }}" class="list-group-item list-group-item-action">
                            <i class="fas fa-trash-alt text-danger me-3"></i>
                            <strong>Gérer la corbeille</strong>
                            <small class="text-muted d-block">Restaurer ou supprimer définitivement des éléments</small>
                        </a>
                        <a href="/test-models" class="list-group-item list-group-item-action">
                            <i class="fas fa-database text-info me-3"></i>
                            <strong>Tester les modèles</strong>
                            <small class="text-muted d-block">Vérifier la connectivité à la base de données</small>
                        </a>
                        <a href="/test-trash" class="list-group-item list-group-item-action">
                            <i class="fas fa-vial text-warning me-3"></i>
                            <strong>Tester la corbeille</strong>
                            <small class="text-muted d-block">Vérifier les éléments supprimés</small>
                        </a>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-lg-6 mb-4">
            <div class="card shadow">
                <div class="card-header py-3">
                    <h6 class="m-0 font-weight-bold text-primary">
                        <i class="fas fa-info-circle me-2"></i>Informations Système
                    </h6>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-6">
                            <div class="text-xs font-weight-bold text-uppercase text-muted mb-1">
                                Version
                            </div>
                            <div class="mb-3">SMMC v1.0</div>
                        </div>
                        <div class="col-6">
                            <div class="text-xs font-weight-bold text-uppercase text-muted mb-1">
                                Environnement
                            </div>
                            <div class="mb-3">{{ app()->environment() }}</div>
                        </div>
                        <div class="col-6">
                            <div class="text-xs font-weight-bold text-uppercase text-muted mb-1">
                                Laravel
                            </div>
                            <div class="mb-3">{{ app()->version() }}</div>
                        </div>
                        <div class="col-6">
                            <div class="text-xs font-weight-bold text-uppercase text-muted mb-1">
                                PHP
                            </div>
                            <div class="mb-3">{{ PHP_VERSION }}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

@section('scripts')
<script>
// Actualiser les statistiques toutes les 30 secondes
setInterval(function() {
    // Ici on pourrait ajouter un appel AJAX pour actualiser les stats
    console.log('Actualisation des statistiques...');
}, 30000);

// Animation des cartes au chargement
$(document).ready(function() {
    $('.card').each(function(index) {
        $(this).delay(index * 100).animate({
            opacity: 1
        }, 500);
    });
});
</script>
@endsection
