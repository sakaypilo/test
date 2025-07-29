<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Vol extends Model
{
    use HasFactory;

    protected $table = 'vols';
    protected $primaryKey = 'idVol';

    protected $fillable = [
        'dateHeure',
        'description',
        'objetsVoles',
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
        'commentaireValidation'
    ];

    protected $casts = [
        'dateHeure' => 'datetime',
        'dateValidation' => 'datetime',
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
        return $this->hasOne(Rapport::class, 'idVol');
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
}