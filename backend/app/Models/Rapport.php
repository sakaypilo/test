<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Rapport extends Model
{
    use HasFactory;

    protected $table = 'rapports';
    protected $primaryKey = 'idRapport';

    protected $fillable = [
        'typeRapport',
        'contenu',
        'fichierPDF',
        'dateCreation',
        'validePar',
        'idIncident',
        'observations'
    ];

    protected $casts = [
        'dateCreation' => 'datetime',
    ];

    // Relations
    public function validateur()
    {
        return $this->belongsTo(User::class, 'validePar', 'idUtilisateur');
    }

    public function incident()
    {
        return $this->belongsTo(Incident::class, 'idIncident', 'idIncident');
    }


    // Scopes
    public function scopeIncident($query)
    {
        return $query->where('typeRapport', 'incident');
    }

}