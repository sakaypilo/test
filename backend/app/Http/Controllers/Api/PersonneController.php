<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Personne;
use App\Models\Interpellation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Facades\Image;

class PersonneController extends Controller
{
    public function index(Request $request)
    {
        $query = Personne::with(['interpellations.utilisateur']);

        // Filtres
        if ($request->has('statut')) {
            $query->where('statut', $request->statut);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('nom', 'like', "%{$search}%")
                  ->orWhere('prenom', 'like', "%{$search}%")
                  ->orWhere('CIN', 'like', "%{$search}%");
            });
        }

        $personnes = $query->orderBy('nom')->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $personnes->items(),
            'pagination' => [
                'current_page' => $personnes->currentPage(),
                'last_page' => $personnes->lastPage(),
                'per_page' => $personnes->perPage(),
                'total' => $personnes->total(),
            ]
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nom' => 'required|string|max:50',
            'prenom' => 'required|string|max:50',
            'CIN' => 'required|string|max:20|unique:personnes,CIN',
            'statut' => 'required|in:interne,externe',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'faitAssocie' => 'required|string' // Pour l'interpellation
        ]);

        // Vérifier si la personne existe déjà
        $personne = Personne::where('CIN', $request->CIN)->first();

        if (!$personne) {
            // Créer nouvelle personne (R24)
            $personne = new Personne($request->only([
                'nom', 'prenom', 'CIN', 'statut'
            ]));

            // Traitement de la photo
            if ($request->hasFile('photo')) {
                $photo = $request->file('photo');
                $filename = 'personne_' . time() . '.' . $photo->getClientOriginalExtension();
                
                // Redimensionner et optimiser l'image
                $image = Image::make($photo)->resize(300, 400, function ($constraint) {
                    $constraint->aspectRatio();
                    $constraint->upsize();
                });
                
                Storage::disk('public')->put('personnes/' . $filename, $image->encode());
                $personne->photo = 'personnes/' . $filename;
            }

            $personne->save();
        }

        // Créer l'interpellation (R25)
        $interpellation = Interpellation::create([
            'dateHeure' => now(),
            'faitAssocie' => $request->faitAssocie,
            'idPersonne' => $personne->idPersonne,
            'idUtilisateur' => $request->user()->idUtilisateur
        ]);

        $personne->load(['interpellations.utilisateur']);

        return response()->json([
            'success' => true,
            'message' => 'Interpellation enregistrée avec succès',
            'data' => $personne
        ], 201);
    }

    public function show($id)
    {
        $personne = Personne::with(['interpellations.utilisateur'])
                           ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $personne
        ]);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'nom' => 'required|string|max:50',
            'prenom' => 'required|string|max:50',
            'CIN' => 'required|string|max:20|unique:personnes,CIN,' . $id . ',idPersonne',
            'statut' => 'required|in:interne,externe',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg|max:2048'
        ]);

        $user = $request->user();

        // Vérifier les permissions (R26)
        if (!in_array($user->role, ['responsable', 'admin'])) {
            return response()->json([
                'success' => false,
                'message' => 'Vous n\'avez pas les permissions pour modifier une personne'
            ], 403);
        }

        $personne = Personne::findOrFail($id);

        $personne->update($request->only([
            'nom', 'prenom', 'CIN', 'statut'
        ]));

        // Traitement de la nouvelle photo
        if ($request->hasFile('photo')) {
            // Supprimer l'ancienne photo
            if ($personne->photo) {
                Storage::disk('public')->delete($personne->photo);
            }

            $photo = $request->file('photo');
            $filename = 'personne_' . time() . '.' . $photo->getClientOriginalExtension();
            
            $image = Image::make($photo)->resize(300, 400, function ($constraint) {
                $constraint->aspectRatio();
                $constraint->upsize();
            });
            
            Storage::disk('public')->put('personnes/' . $filename, $image->encode());
            $personne->photo = 'personnes/' . $filename;
            $personne->save();
        }

        $personne->load(['interpellations.utilisateur']);

        return response()->json([
            'success' => true,
            'message' => 'Personne mise à jour avec succès',
            'data' => $personne
        ]);
    }

    public function destroy($id)
{
    $personne = Personne::findOrFail($id);

    // Vérifier les permissions
    if (!in_array(auth()->user()->role, ['admin', 'responsable'])) {
        return response()->json([
            'success' => false,
            'message' => 'Permission refusée pour supprimer une personne.'
        ], 403);
    }

    $personne->actif = false;
    $personne->save();

    return response()->json([
        'success' => true,
        'message' => 'Personne supprimée avec succès (logiquement).'
    ]);
}


    public function addInterpellation(Request $request, $id)
    {
        $request->validate([
            'faitAssocie' => 'required|string'
        ]);

        $personne = Personne::findOrFail($id);

        $interpellation = Interpellation::create([
            'dateHeure' => now(),
            'faitAssocie' => $request->faitAssocie,
            'idPersonne' => $personne->idPersonne,
            'idUtilisateur' => $request->user()->idUtilisateur
        ]);

        $interpellation->load('utilisateur');

        return response()->json([
            'success' => true,
            'message' => 'Interpellation ajoutée avec succès',
            'data' => $interpellation
        ], 201);
    }

    public function statistics()
    {
        $stats = [
            'total' => Personne::count(),
            'internes' => Personne::where('statut', 'interne')->count(),
            'externes' => Personne::where('statut', 'externe')->count(),
            'interpellations_ce_mois' => Interpellation::whereMonth('dateHeure', now()->month)
                                                       ->whereYear('dateHeure', now()->year)
                                                       ->count(),
            'personnes_recurrentes' => Personne::withCount('interpellations')
                                              ->having('interpellations_count', '>', 1)
                                              ->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }
}