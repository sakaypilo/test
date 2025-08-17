@extends('layouts.admin')

@section('title', 'Corbeille')

@section('content')
<div class="container-fluid">
    <!-- En-tête -->
    <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
            <h1 class="h3 mb-0 text-gray-800">
                <i class="fas fa-trash-alt me-2"></i>Corbeille
            </h1>
            <p class="text-muted">Gérer les éléments supprimés</p>
        </div>
        
        <div class="btn-group" role="group">
            <button type="button" class="btn btn-outline-danger" onclick="emptyTrash('all')">
                <i class="fas fa-trash me-1"></i>Vider la corbeille
            </button>
        </div>
    </div>

    <!-- Statistiques -->
    <div class="row mb-4">
        <div class="col-md-4">
            <div class="card border-left-danger shadow h-100 py-2">
                <div class="card-body">
                    <div class="row no-gutters align-items-center">
                        <div class="col mr-2">
                            <div class="text-xs font-weight-bold text-danger text-uppercase mb-1">
                                Incidents supprimés
                            </div>
                            <div class="h5 mb-0 font-weight-bold text-gray-800">{{ $stats['incidents'] }}</div>
                        </div>
                        <div class="col-auto">
                            <i class="fas fa-exclamation-triangle fa-2x text-gray-300"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="col-md-4">
            <div class="card border-left-warning shadow h-100 py-2">
                <div class="card-body">
                    <div class="row no-gutters align-items-center">
                        <div class="col mr-2">
                            <div class="text-xs font-weight-bold text-warning text-uppercase mb-1">
                                Caméras supprimées
                            </div>
                            <div class="h5 mb-0 font-weight-bold text-gray-800">{{ $stats['cameras'] }}</div>
                        </div>
                        <div class="col-auto">
                            <i class="fas fa-video fa-2x text-gray-300"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="col-md-4">
            <div class="card border-left-info shadow h-100 py-2">
                <div class="card-body">
                    <div class="row no-gutters align-items-center">
                        <div class="col mr-2">
                            <div class="text-xs font-weight-bold text-info text-uppercase mb-1">
                                Personnes supprimées
                            </div>
                            <div class="h5 mb-0 font-weight-bold text-gray-800">{{ $stats['personnes'] }}</div>
                        </div>
                        <div class="col-auto">
                            <i class="fas fa-users fa-2x text-gray-300"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Filtres -->
    <div class="card shadow mb-4">
        <div class="card-header py-3">
            <div class="row align-items-center">
                <div class="col">
                    <h6 class="m-0 font-weight-bold text-primary">Éléments supprimés</h6>
                </div>
                <div class="col-auto">
                    <div class="btn-group" role="group">
                        <a href="{{ route('admin.trash.index', ['type' => 'all']) }}" 
                           class="btn btn-sm {{ $currentType === 'all' ? 'btn-primary' : 'btn-outline-primary' }}">
                            Tous
                        </a>
                        <a href="{{ route('admin.trash.index', ['type' => 'incidents']) }}" 
                           class="btn btn-sm {{ $currentType === 'incidents' ? 'btn-primary' : 'btn-outline-primary' }}">
                            Incidents
                        </a>
                        <a href="{{ route('admin.trash.index', ['type' => 'cameras']) }}" 
                           class="btn btn-sm {{ $currentType === 'cameras' ? 'btn-primary' : 'btn-outline-primary' }}">
                            Caméras
                        </a>
                        <a href="{{ route('admin.trash.index', ['type' => 'personnes']) }}" 
                           class="btn btn-sm {{ $currentType === 'personnes' ? 'btn-primary' : 'btn-outline-primary' }}">
                            Personnes
                        </a>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="card-body">
            @if(count($deletedItems) > 0)
                <div class="table-responsive">
                    <table class="table table-bordered" id="trashTable">
                        <thead>
                            <tr>
                                <th>Type</th>
                                <th>Titre</th>
                                <th>Description</th>
                                <th>Supprimé le</th>
                                <th>Supprimé par</th>
                                <th>Raison</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach($deletedItems as $item)
                            <tr data-type="{{ $item['type'] }}" data-id="{{ $item['id'] }}">
                                <td>
                                    @switch($item['type'])
                                        @case('incident')
                                            <span class="badge badge-danger">
                                                <i class="fas fa-exclamation-triangle me-1"></i>Incident
                                            </span>
                                            @break
                                        @case('camera')
                                            <span class="badge badge-warning">
                                                <i class="fas fa-video me-1"></i>Caméra
                                            </span>
                                            @break
                                        @case('personne')
                                            <span class="badge badge-info">
                                                <i class="fas fa-user me-1"></i>Personne
                                            </span>
                                            @break
                                    @endswitch
                                </td>
                                <td>
                                    <strong>{{ $item['title'] }}</strong>
                                    @if(isset($item['zone']))
                                        <br><small class="text-muted">Zone: {{ $item['zone'] }}</small>
                                    @endif
                                </td>
                                <td>
                                    {{ $item['description'] }}
                                    @if(isset($item['ip']))
                                        <br><small class="text-muted">IP: {{ $item['ip'] }}</small>
                                    @endif
                                    @if(isset($item['cin']))
                                        <br><small class="text-muted">CIN: {{ $item['cin'] }}</small>
                                    @endif
                                </td>
                                <td>
                                    {{ $item['deleted_at'] ? \Carbon\Carbon::parse($item['deleted_at'])->format('d/m/Y H:i') : 'N/A' }}
                                </td>
                                <td>{{ $item['deleted_by'] ?? 'Système' }}</td>
                                <td>
                                    <small>{{ $item['deletion_reason'] ?? 'Aucune raison spécifiée' }}</small>
                                </td>
                                <td>
                                    <div class="btn-group btn-group-sm" role="group">
                                        <button type="button" class="btn btn-success" 
                                                onclick="restoreItem('{{ $item['type'] }}', {{ $item['id'] }})"
                                                title="Restaurer">
                                            <i class="fas fa-undo"></i>
                                        </button>
                                        <button type="button" class="btn btn-danger" 
                                                onclick="forceDeleteItem('{{ $item['type'] }}', {{ $item['id'] }})"
                                                title="Supprimer définitivement">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
            @else
                <div class="text-center py-5">
                    <i class="fas fa-trash-alt fa-3x text-gray-300 mb-3"></i>
                    <h5 class="text-gray-500">Aucun élément dans la corbeille</h5>
                    <p class="text-muted">
                        @if($currentType === 'all')
                            La corbeille est vide.
                        @else
                            Aucun {{ $currentType }} supprimé.
                        @endif
                    </p>
                </div>
            @endif
        </div>
    </div>
</div>

<!-- Modal de confirmation -->
<div class="modal fade" id="confirmModal" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="confirmModalTitle">Confirmation</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body" id="confirmModalBody">
                <!-- Contenu dynamique -->
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annuler</button>
                <button type="button" class="btn btn-primary" id="confirmModalAction">Confirmer</button>
            </div>
        </div>
    </div>
</div>
@endsection

@section('scripts')
<script>
$(document).ready(function() {
    $('#trashTable').DataTable({
        "language": {
            "url": "//cdn.datatables.net/plug-ins/1.10.24/i18n/French.json"
        },
        "order": [[ 3, "desc" ]], // Trier par date de suppression
        "pageLength": 25
    });
});

function restoreItem(type, id) {
    showConfirmModal(
        'Restaurer l\'élément',
        `Êtes-vous sûr de vouloir restaurer cet ${type} ?`,
        'btn-success',
        'Restaurer',
        function() {
            $.ajax({
                url: '{{ route("admin.trash.restore") }}',
                method: 'POST',
                data: {
                    _token: '{{ csrf_token() }}',
                    type: type,
                    id: id
                },
                success: function(response) {
                    if (response.success) {
                        showAlert('success', response.message);
                        $(`tr[data-type="${type}"][data-id="${id}"]`).fadeOut();
                        setTimeout(() => location.reload(), 1500);
                    } else {
                        showAlert('danger', response.message);
                    }
                },
                error: function() {
                    showAlert('danger', 'Erreur lors de la restauration');
                }
            });
        }
    );
}

function forceDeleteItem(type, id) {
    showConfirmModal(
        'Suppression définitive',
        `⚠️ ATTENTION: Cette action est irréversible!\n\nÊtes-vous sûr de vouloir supprimer définitivement cet ${type} ?`,
        'btn-danger',
        'Supprimer définitivement',
        function() {
            $.ajax({
                url: '{{ route("admin.trash.force-delete") }}',
                method: 'POST',
                data: {
                    _token: '{{ csrf_token() }}',
                    type: type,
                    id: id
                },
                success: function(response) {
                    if (response.success) {
                        showAlert('success', response.message);
                        $(`tr[data-type="${type}"][data-id="${id}"]`).fadeOut();
                        setTimeout(() => location.reload(), 1500);
                    } else {
                        showAlert('danger', response.message);
                    }
                },
                error: function() {
                    showAlert('danger', 'Erreur lors de la suppression');
                }
            });
        }
    );
}

function emptyTrash(type) {
    const typeText = type === 'all' ? 'toute la corbeille' : `tous les ${type}`;
    
    showConfirmModal(
        'Vider la corbeille',
        `⚠️ ATTENTION: Cette action est irréversible!\n\nÊtes-vous sûr de vouloir vider ${typeText} ?`,
        'btn-danger',
        'Vider la corbeille',
        function() {
            $.ajax({
                url: '{{ route("admin.trash.empty") }}',
                method: 'POST',
                data: {
                    _token: '{{ csrf_token() }}',
                    type: type
                },
                success: function(response) {
                    if (response.success) {
                        showAlert('success', response.message);
                        setTimeout(() => location.reload(), 1500);
                    } else {
                        showAlert('danger', response.message);
                    }
                },
                error: function() {
                    showAlert('danger', 'Erreur lors du vidage');
                }
            });
        }
    );
}

function showConfirmModal(title, body, buttonClass, buttonText, callback) {
    $('#confirmModalTitle').text(title);
    $('#confirmModalBody').html(body.replace(/\n/g, '<br>'));
    
    const actionButton = $('#confirmModalAction');
    actionButton.removeClass().addClass(`btn ${buttonClass}`).text(buttonText);
    
    actionButton.off('click').on('click', function() {
        $('#confirmModal').modal('hide');
        callback();
    });
    
    $('#confirmModal').modal('show');
}

function showAlert(type, message) {
    const alertHtml = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    $('.container-fluid').prepend(alertHtml);
    
    setTimeout(() => {
        $('.alert').fadeOut();
    }, 5000);
}
</script>
@endsection
