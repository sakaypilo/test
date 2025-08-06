<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Personne extends Model
{
    use HasFactory;

    protected $table = 'personnes';
    protected $primaryKey = 'idPersonne';

    protected $fillable = [
        'nom',
        'prenom',
        'CIN',
        'statut',
        'photo',
        'actif', 
    ];

    protected static function booted()
    {
        static::addGlobalScope('actif', function ($query) {
            $query->where('actif', true);
        });
    }
    
    // Relations
    public function interpellations()
    {
        return $this->hasMany(Interpellation::class, 'idPersonne');
    }

    // Scopes
    public function scopeInterne($query)
    {
        return $query->where('statut', 'interne');
    }

    public function scopeExterne($query)
    {
        return $query->where('statut', 'externe');
    }

    // Accessors
    public function getNomCompletAttribute()
    {
        return $this->prenom . ' ' . $this->nom;
    }
}