<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Interpellation extends Model
{
    use HasFactory;

    protected $table = 'interpellations';
    protected $primaryKey = 'idInterpellation';

    protected $fillable = [
        'dateHeure',
        'faitAssocie',
        'idPersonne',
        'idUtilisateur'
    ];

    protected $casts = [
        'dateHeure' => 'datetime',
    ];

    // Relations
    public function personne()
    {
        return $this->belongsTo(Personne::class, 'idPersonne', 'idPersonne');
    }

    public function utilisateur()
    {
        return $this->belongsTo(User::class, 'idUtilisateur', 'idUtilisateur');
    }
}