<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\HasTrash;

class Incident extends Model
{
    use HasFactory, HasTrash;

    protected $table = 'incidents';
    protected $primaryKey = 'idIncident';

    protected $fillable = [
        'dateHeure',
        'typeIncident',
        'description',
        'zone',
        'photo1',
        'photo2',
        'photo3',
        'photo4',
        'photo5',
        'photo6',
        'statut',
        'idCamera',
        'idUtilisateur',
        'validePar',
        'dateValidation',
        'commentaireValidation',
        'actif',
        'deleted_at',
        'deleted_by',
        'deletion_reason',
        'restored_at',
        'restored_by'
    ];

    protected $casts = [
        'dateHeure' => 'datetime',
        'dateValidation' => 'datetime',
    ];
    
    protected $attributes = [
        'statut' => 'en_attente',
    ];

    // Relations
    public function camera()
    {
        return $this->belongsTo(Camera::class, 'idCamera', 'idCamera');
    }

    public function utilisateur()
    {
        return $this->belongsTo(User::class, 'idUtilisateur', 'idUtilisateur');
    }

    public function validateur()
    {
        return $this->belongsTo(User::class, 'validePar', 'idUtilisateur');
    }

    public function rapport()
    {
        return $this->hasOne(Rapport::class, 'idIncident');
    }

    // Accessors
    public function getPhotosAttribute()
    {
        $photos = [];
        for ($i = 1; $i <= 6; $i++) {
            $photo = $this->{"photo$i"};
            if ($photo) {
                $photos[] = $photo;
            }
        }
        return $photos;
    }

    // Scopes
    public function scopeEnAttente($query)
    {
        return $query->where('statut', 'en_attente');
    }

    public function scopeValide($query)
    {
        return $query->where('statut', 'valide');
    }

    public function scopeRejete($query)
    {
        return $query->where('statut', 'rejete');
    }

    public function scopeByType($query, $type)
    {
        return $query->where('typeIncident', $type);
    }

    public function scopeByZone($query, $zone)
    {
        return $query->where('zone', $zone);
    }
}