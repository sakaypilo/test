<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MutationCamera extends Model
{
    use HasFactory;

    protected $table = 'mutation_cameras';
    protected $primaryKey = 'idMutation';

    protected $fillable = [
        'dateHeureMutation',
        'ancienEmplacement',
        'nouvelEmplacement',
        'motif',
        'idCamera',
        'idTechnicien'
    ];

    protected $casts = [
        'dateHeureMutation' => 'datetime',
    ];

    // Relations
    public function camera()
    {
        return $this->belongsTo(Camera::class, 'idCamera', 'idCamera');
    }

    public function technicien()
    {
        return $this->belongsTo(User::class, 'idTechnicien', 'idUtilisateur');
    }
}