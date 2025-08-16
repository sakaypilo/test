<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Builder;
use App\Services\TrashService;

trait HasTrash
{
    /**
     * Boot the trait
     */
    protected static function bootHasTrash()
    {
        // Ne pas ajouter de scope global pour éviter les conflits
        // Les modèles qui ont déjà un scope global peuvent le garder
    }

    /**
     * Scope pour inclure les éléments supprimés
     */
    public function scopeWithTrashed(Builder $query)
    {
        return $query->withoutGlobalScope('active');
    }

    /**
     * Scope pour ne récupérer que les éléments supprimés
     */
    public function scopeOnlyTrashed(Builder $query)
    {
        return $query->withoutGlobalScope('active')->where('actif', false);
    }

    /**
     * Vérifier si l'élément est dans la corbeille
     */
    public function isTrashed(): bool
    {
        return !$this->actif && $this->deleted_at !== null;
    }

    /**
     * Déplacer vers la corbeille
     */
    public function moveToTrash(string $reason = null): bool
    {
        $trashService = new TrashService();
        return $trashService->moveToTrash($this, $reason);
    }

    /**
     * Restaurer de la corbeille
     */
    public function restoreFromTrash(): bool
    {
        $trashService = new TrashService();
        return $trashService->restoreFromTrash($this);
    }

    /**
     * Supprimer définitivement
     */
    public function permanentDelete(): bool
    {
        $trashService = new TrashService();
        return $trashService->permanentDelete($this);
    }

    /**
     * Relations pour les champs de corbeille
     */
    public function deletedBy()
    {
        return $this->belongsTo(\App\Models\User::class, 'deleted_by', 'idUtilisateur');
    }

    public function restoredBy()
    {
        return $this->belongsTo(\App\Models\User::class, 'restored_by', 'idUtilisateur');
    }

    /**
     * Accesseurs pour les dates formatées
     */
    public function getDeletedAtFormattedAttribute()
    {
        return $this->deleted_at ? $this->deleted_at->format('d/m/Y H:i') : null;
    }

    public function getRestoredAtFormattedAttribute()
    {
        return $this->restored_at ? $this->restored_at->format('d/m/Y H:i') : null;
    }

    /**
     * Vérifier les permissions de suppression
     */
    public function canBeDeleted($user = null): bool
    {
        $trashService = new TrashService();
        return $trashService->canDelete($this, $user);
    }

    /**
     * Vérifier les permissions de restauration
     */
    public function canBeRestored($user = null): bool
    {
        $trashService = new TrashService();
        return $trashService->canRestore($this, $user);
    }
}
