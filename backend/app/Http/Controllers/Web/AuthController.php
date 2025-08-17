<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Utilisateur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Session;

class AuthController extends Controller
{
    /**
     * Afficher la page de connexion
     */
    public function showLogin()
    {
        // Si l'utilisateur est déjà connecté, rediriger vers le dashboard
        if (Session::has('user')) {
            return redirect()->route('admin.dashboard');
        }
        
        return view('auth.login');
    }
    
    /**
     * Traiter la connexion
     */
    public function login(Request $request)
    {
        $request->validate([
            'matricule' => 'required|string',
            'password' => 'required|string',
        ], [
            'matricule.required' => 'Le matricule est obligatoire',
            'password.required' => 'Le mot de passe est obligatoire',
        ]);
        
        try {
            // Chercher l'utilisateur par matricule
            $user = Utilisateur::where('matricule', $request->matricule)
                              ->where('actif', true)
                              ->first();
            
            if (!$user) {
                return back()->withErrors([
                    'matricule' => 'Matricule non trouvé ou compte désactivé'
                ])->withInput();
            }
            
            // Vérifier le mot de passe
            if (!Hash::check($request->password, $user->password)) {
                return back()->withErrors([
                    'password' => 'Mot de passe incorrect'
                ])->withInput();
            }
            
            // Vérifier que l'utilisateur a les droits d'accès à l'admin
            if (!in_array($user->role, ['admin', 'responsable'])) {
                return back()->withErrors([
                    'matricule' => 'Vous n\'avez pas les droits d\'accès à cette interface'
                ])->withInput();
            }
            
            // Stocker l'utilisateur en session
            Session::put('user', [
                'id' => $user->idUtilisateur,
                'matricule' => $user->matricule,
                'nom' => $user->nom,
                'prenom' => $user->prenom,
                'email' => $user->email,
                'role' => $user->role,
                'telephone' => $user->telephone,
            ]);
            
            // Mettre à jour la dernière connexion
            $user->update([
                'updated_at' => now()
            ]);
            
            return redirect()->route('admin.dashboard')->with('success', 'Connexion réussie !');
            
        } catch (\Exception $e) {
            return back()->withErrors([
                'error' => 'Erreur lors de la connexion : ' . $e->getMessage()
            ])->withInput();
        }
    }
    
    /**
     * Déconnexion
     */
    public function logout(Request $request)
    {
        Session::forget('user');
        Session::flush();
        
        return redirect()->route('login')->with('success', 'Vous avez été déconnecté avec succès');
    }
    
    /**
     * Afficher le dashboard
     */
    public function dashboard()
    {
        $user = Session::get('user');
        
        if (!$user) {
            return redirect()->route('login');
        }
        
        // Statistiques pour le dashboard
        $stats = [
            'incidents' => [
                'total' => \App\Models\Incident::where('actif', true)->count(),
                'en_attente' => \App\Models\Incident::where('actif', true)->where('statut', 'en_attente')->count(),
                'valides' => \App\Models\Incident::where('actif', true)->where('statut', 'valide')->count(),
                'supprimes' => \App\Models\Incident::where('actif', false)->count(),
            ],
            'cameras' => [
                'total' => \App\Models\Camera::where('actif', true)->count(),
                'actives' => \App\Models\Camera::where('actif', true)->where('statut', 'actif')->count(),
                'hors_ligne' => \App\Models\Camera::where('actif', true)->where('statut', 'hors ligne')->count(),
                'supprimees' => \App\Models\Camera::where('actif', false)->count(),
            ],
            'personnes' => [
                'total' => \App\Models\Personne::where('actif', true)->count(),
                'libres' => \App\Models\Personne::where('actif', true)->where('statut', 'libre')->count(),
                'detenus' => \App\Models\Personne::where('actif', true)->where('statut', 'detenu')->count(),
                'supprimees' => \App\Models\Personne::where('actif', false)->count(),
            ],
            'utilisateurs' => [
                'total' => \App\Models\Utilisateur::where('actif', true)->count(),
                'admins' => \App\Models\Utilisateur::where('actif', true)->where('role', 'admin')->count(),
                'agents' => \App\Models\Utilisateur::where('actif', true)->where('role', 'agent')->count(),
            ]
        ];
        
        return view('admin.dashboard', compact('user', 'stats'));
    }
}
