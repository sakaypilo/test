<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'users';
    protected $primaryKey = 'idUtilisateur';

    protected $fillable = [
        'matricule',
        'nom',
        'prenom',
        'motDePasse',
        'role',
        'email',
        'telephone',
        'actif'
    ];

    protected $hidden = [
        'motDePasse',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'actif' => 'boolean',
    ];

    // Relations
    public function incidents()
    {
        return $this->hasMany(Incident::class, 'idUtilisateur');
    }

    public function vols()
    {
        return $this->hasMany(Vol::class, 'idUtilisateur');
    }

    public function cameras()
    {
        return $this->hasMany(Camera::class, 'idTechnicien');
    }

    public function connexions()
    {
        return $this->hasMany(Connexion::class, 'idUtilisateur');
    }

    public function interpellations()
    {
        return $this->hasMany(Interpellation::class, 'idUtilisateur');
    }

    public function rapportsValides()
    {
        return $this->hasMany(Rapport::class, 'validePar');
    }

    // Accessors & Mutators
    public function getAuthPassword()
    {
        return $this->motDePasse;
    }

    public function setMotDePasseAttribute($value)
    {
        $this->attributes['motDePasse'] = bcrypt($value);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('actif', true);
    }

    public function scopeByRole($query, $role)
    {
        return $query->where('role', $role);
    }
}