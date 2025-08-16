<?php

namespace App\Services;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class TrashService
{
    /**
     * Marquer un élément comme supprimé (soft delete)
     */
    public function moveToTrash(Model $model, string $reason = null): bool
    {
        try {
            // Préparer les données de mise à jour
            $updateData = [
                'actif' => false,
                'deleted_at' => now(),
                'deletion_reason' => $reason,
            ];

            // Ajouter l'ID utilisateur si disponible
            if (auth()->check()) {
                $updateData['deleted_by'] = auth()->id();
            }

            // Mettre à jour le modèle
            $model->update($updateData);

            // Log de l'action
            \Log::info('Élément déplacé vers la corbeille', [
                'model' => get_class($model),
                'id' => $model->getKey(),
                'reason' => $reason,
                'user_id' => auth()->id()
            ]);

            return true;
        } catch (\Exception $e) {
            \Log::error('Erreur lors de la suppression logique', [
                'model' => get_class($model),
                'id' => $model->getKey(),
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Restaurer un élément de la corbeille
     */
    public function restoreFromTrash(Model $model): bool
    {
        try {
            // Préparer les données de restauration
            $updateData = [
                'actif' => true,
                'deleted_at' => null,
                'deleted_by' => null,
                'deletion_reason' => null,
                'restored_at' => now(),
            ];

            // Ajouter l'ID utilisateur si disponible
            if (auth()->check()) {
                $updateData['restored_by'] = auth()->id();
            }

            // Mettre à jour le modèle
            $model->update($updateData);

            // Log de l'action
            \Log::info('Élément restauré de la corbeille', [
                'model' => get_class($model),
                'id' => $model->getKey(),
                'user_id' => auth()->id()
            ]);

            return true;
        } catch (\Exception $e) {
            \Log::error('Erreur lors de la restauration', [
                'model' => get_class($model),
                'id' => $model->getKey(),
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Supprimer définitivement un élément
     */
    public function permanentDelete(Model $model): bool
    {
        try {
            // Log avant suppression
            \Log::info('Suppression définitive d\'un élément', [
                'model' => get_class($model),
                'id' => $model->getKey(),
                'user_id' => auth()->id()
            ]);

            // Supprimer les fichiers associés si nécessaire
            $this->deleteAssociatedFiles($model);

            // Suppression définitive
            $model->delete();

            return true;
        } catch (\Exception $e) {
            \Log::error('Erreur lors de la suppression définitive', [
                'model' => get_class($model),
                'id' => $model->getKey(),
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Obtenir les éléments dans la corbeille
     */
    public function getTrashItems(string $modelClass, int $limit = 50): array
    {
        try {
            $model = new $modelClass;

            $query = $model->where('actif', false)
                ->whereNotNull('deleted_at')
                ->orderBy('deleted_at', 'desc')
                ->limit($limit);

            // Essayer d'utiliser withoutGlobalScopes si disponible
            if (method_exists($model, 'withoutGlobalScopes')) {
                $query = $model->withoutGlobalScopes()
                    ->where('actif', false)
                    ->whereNotNull('deleted_at')
                    ->orderBy('deleted_at', 'desc')
                    ->limit($limit);
            }

            return $query->get()->toArray();
        } catch (\Exception $e) {
            \Log::error('Erreur lors de la récupération des éléments de la corbeille', [
                'model' => $modelClass,
                'error' => $e->getMessage()
            ]);
            return [];
        }
    }

    /**
     * Nettoyer automatiquement la corbeille (éléments > 30 jours)
     */
    public function cleanupTrash(string $modelClass, int $daysOld = 30): int
    {
        $model = new $modelClass;
        $cutoffDate = Carbon::now()->subDays($daysOld);
        
        $itemsToDelete = $model->withoutGlobalScopes()
            ->where('actif', false)
            ->where('deleted_at', '<', $cutoffDate)
            ->get();

        $deletedCount = 0;
        foreach ($itemsToDelete as $item) {
            if ($this->permanentDelete($item)) {
                $deletedCount++;
            }
        }

        return $deletedCount;
    }

    /**
     * Vérifier si un utilisateur peut supprimer un élément
     */
    public function canDelete(Model $model, $user = null): bool
    {
        $user = $user ?? auth()->user();
        
        // Règles de base selon le rôle
        switch ($user->role) {
            case 'admin':
                return true;
            case 'responsable':
                return in_array(get_class($model), [
                    'App\Models\Incident',
                    'App\Models\Personne',
                    'App\Models\Camera'
                ]);
            case 'agent':
                // Les agents ne peuvent supprimer que leurs propres incidents
                return get_class($model) === 'App\Models\Incident' 
                    && $model->idUtilisateur === $user->idUtilisateur;
            default:
                return false;
        }
    }

    /**
     * Vérifier si un utilisateur peut restaurer un élément
     */
    public function canRestore(Model $model, $user = null): bool
    {
        $user = $user ?? auth()->user();
        
        // Seuls les admins et responsables peuvent restaurer
        return in_array($user->role, ['admin', 'responsable']);
    }



    /**
     * Supprimer les fichiers associés à un modèle
     */
    private function deleteAssociatedFiles(Model $model): void
    {
        // Pour les incidents - supprimer les photos
        if (get_class($model) === 'App\Models\Incident') {
            for ($i = 1; $i <= 6; $i++) {
                $photoField = "photo{$i}";
                if ($model->$photoField) {
                    \Storage::disk('public')->delete($model->$photoField);
                }
            }
        }

        // Pour les personnes - supprimer la photo
        if (get_class($model) === 'App\Models\Personne' && $model->photo) {
            \Storage::disk('public')->delete($model->photo);
        }
    }
}
