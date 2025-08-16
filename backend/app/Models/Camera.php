<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\HasTrash;

class Camera extends Model
{
    use HasFactory, HasTrash;

    protected $table = 'cameras';
    protected $primaryKey = 'idCamera';

    protected $fillable = [
        'numeroSerie',
        'adresseIP',
        'zone',
        'emplacement',
        'statut',
        'dateInstallation',
        'idTechnicien',
        'actif',
        'deleted_at',
        'deleted_by',
        'deletion_reason',
        'restored_at',
        'restored_by'
    ];

    protected $casts = [
        'dateInstallation' => 'datetime',
    ];

    // Relations
    public function technicien()
    {
        return $this->belongsTo(User::class, 'idTechnicien', 'idUtilisateur');
    }

    public function incidents()
    {
        return $this->hasMany(Incident::class, 'idCamera');
    }

    public function vols()
    {
        return $this->hasMany(Vol::class, 'idCamera');
    }

    public function mutations()
    {
        return $this->hasMany(MutationCamera::class, 'idCamera');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('statut', 'actif');
    }

    public function scopeByZone($query, $zone)
    {
        return $query->where('zone', $zone);
    }

    public function scopeByStatut($query, $statut)
    {
        return $query->where('statut', $statut);
    }
}