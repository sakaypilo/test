<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        // Seul un admin peut lister tous les utilisateurs (R6)
        if ($user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Vous n\'avez pas les permissions pour accéder à cette ressource'
            ], 403);
        }

        $query = User::query();

        // Filtres
        if ($request->has('role')) {
            $query->where('role', $request->role);
        }

        if ($request->has('actif')) {
            $query->where('actif', $request->boolean('actif'));
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('nom', 'like', "%{$search}%")
                  ->orWhere('prenom', 'like', "%{$search}%")
                  ->orWhere('matricule', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $query->orderBy('nom')->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $users->items(),
            'pagination' => [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
            ]
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();

        // Seul un admin peut créer des utilisateurs (R6)
        if ($user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Vous n\'avez pas les permissions pour créer un utilisateur'
            ], 403);
        }

        $request->validate([
            'matricule' => [
                'required',
                'string',
                'size:7',
                'regex:/^\d{7}$/', // R3: Format AAAANNN
                'unique:users,matricule'
            ],
            'nom' => 'required|string|max:50',
            'prenom' => 'required|string|max:50',
            'motDePasse' => 'required|string|min:6',
            'role' => 'required|in:admin,agent,technicien,responsable',
            'email' => 'required|email|max:100|unique:users,email',
            'telephone' => 'nullable|string|max:20'
        ]);

        $newUser = User::create([
            'matricule' => $request->matricule,
            'nom' => $request->nom,
            'prenom' => $request->prenom,
            'motDePasse' => $request->motDePasse, // Sera hashé par le mutator
            'role' => $request->role,
            'email' => $request->email,
            'telephone' => $request->telephone,
            'actif' => true
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Utilisateur créé avec succès',
            'data' => $newUser
        ], 201);
    }

    public function show($id)
    {
        $user = request()->user();

        // Un utilisateur peut voir ses propres infos, un admin peut voir tous
        if ($user->idUtilisateur != $id && $user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Vous n\'avez pas les permissions pour accéder à cette ressource'
            ], 403);
        }

        $targetUser = User::findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $targetUser
        ]);
    }

    public function update(Request $request, $id)
    {
        $user = $request->user();

        // Seul un admin peut modifier les utilisateurs (R6)
        if ($user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Vous n\'avez pas les permissions pour modifier un utilisateur'
            ], 403);
        }

        $targetUser = User::findOrFail($id);

        $request->validate([
            'matricule' => [
                'required',
                'string',
                'size:7',
                'regex:/^\d{7}$/',
                Rule::unique('users', 'matricule')->ignore($id, 'idUtilisateur')
            ],
            'nom' => 'required|string|max:50',
            'prenom' => 'required|string|max:50',
            'role' => 'required|in:admin,agent,technicien,responsable',
            'email' => [
                'required',
                'email',
                'max:100',
                Rule::unique('users', 'email')->ignore($id, 'idUtilisateur')
            ],
            'telephone' => 'nullable|string|max:20',
            'actif' => 'boolean'
        ]);

        $targetUser->update($request->only([
            'matricule', 'nom', 'prenom', 'role', 'email', 'telephone', 'actif'
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Utilisateur mis à jour avec succès',
            'data' => $targetUser
        ]);
    }

    public function resetPassword(Request $request, $id)
    {
        $user = $request->user();

        // Seul un admin peut réinitialiser les mots de passe (R4, R6)
        if ($user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Vous n\'avez pas les permissions pour réinitialiser un mot de passe'
            ], 403);
        }

        $targetUser = User::findOrFail($id);

        // Générer un nouveau mot de passe temporaire
        $newPassword = 'SMMC' . rand(1000, 9999);
        
        $targetUser->update([
            'motDePasse' => $newPassword
        ]);

        // En production, envoyer le nouveau mot de passe par email
        // Mail::to($targetUser->email)->send(new PasswordReset($newPassword));

        return response()->json([
            'success' => true,
            'message' => 'Mot de passe réinitialisé avec succès',
            'temporary_password' => $newPassword // À supprimer en production
        ]);
    }

    public function toggleStatus($id)
    {
        $user = request()->user();

        // Seul un admin peut activer/désactiver des utilisateurs (R6)
        if ($user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Vous n\'avez pas les permissions pour modifier le statut d\'un utilisateur'
            ], 403);
        }

        $targetUser = User::findOrFail($id);

        $targetUser->update([
            'actif' => !$targetUser->actif
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Statut utilisateur mis à jour avec succès',
            'data' => $targetUser
        ]);
    }

    public function statistics()
    {
        $user = request()->user();

        if ($user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Vous n\'avez pas les permissions pour accéder aux statistiques'
            ], 403);
        }

        $stats = [
            'total' => User::count(),
            'actifs' => User::where('actif', true)->count(),
            'inactifs' => User::where('actif', false)->count(),
            'par_role' => User::selectRaw('role, COUNT(*) as count')
                             ->groupBy('role')
                             ->get(),
            'connexions_recentes' => User::whereHas('connexions', function($query) {
                $query->where('dateHeure', '>=', now()->subDays(7));
            })->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }
}