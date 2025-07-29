<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Connexion extends Model
{
    use HasFactory;

    protected $table = 'connexions';
    protected $primaryKey = 'idConnexion';

    protected $fillable = [
        'dateHeure',
        'adresseIP',
        'succes',
        'userAgent',
        'idUtilisateur'
    ];

    protected $casts = [
        'dateHeure' => 'datetime',
        'succes' => 'boolean',
    ];

    // Relations
    public function utilisateur()
    {
        return $this->belongsTo(User::class, 'idUtilisateur', 'idUtilisateur');
    }

    // Scopes
    public function scopeSucces($query)
    {
        return $query->where('succes', true);
    }

    public function scopeEchec($query)
    {
        return $query->where('succes', false);
    }
}