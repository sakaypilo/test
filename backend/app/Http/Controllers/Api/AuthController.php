<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Connexion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'matricule' => 'required|string',
            'motDePasse' => 'required|string',
        ]);

        $user = User::where('matricule', $request->matricule)
                   ->where('actif', true)
                   ->first();

        // Journaliser la tentative de connexion
        $connexion = new Connexion([
            'dateHeure' => now(),
            'adresseIP' => $request->ip(),
            'userAgent' => $request->userAgent(),
            'succes' => false,
            'idUtilisateur' => $user ? $user->idUtilisateur : null
        ]);

        if (!$user || !Hash::check($request->motDePasse, $user->motDePasse)) {
            if ($user) {
                $connexion->save();
            }
            
            throw ValidationException::withMessages([
                'matricule' => ['Matricule ou mot de passe incorrect.'],
            ]);
        }

        // Connexion réussie
        $connexion->succes = true;
        $connexion->save();

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'user' => [
                'idUtilisateur' => $user->idUtilisateur,
                'matricule' => $user->matricule,
                'nom' => $user->nom,
                'prenom' => $user->prenom,
                'role' => $user->role,
                'email' => $user->email,
                'telephone' => $user->telephone,
            ],
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Déconnexion réussie'
        ]);
    }

    public function me(Request $request)
    {
        $user = $request->user();
        
        return response()->json([
            'success' => true,
            'user' => [
                'idUtilisateur' => $user->idUtilisateur,
                'matricule' => $user->matricule,
                'nom' => $user->nom,
                'prenom' => $user->prenom,
                'role' => $user->role,
                'email' => $user->email,
                'telephone' => $user->telephone,
            ]
        ]);
    }
}