<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Incident;
use App\Models\Camera;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Facades\Image;

class IncidentController extends Controller
{
    public function index(Request $request)
    {
        $query = Incident::with(['camera', 'utilisateur', 'validateur']);

        // Filtres
        if ($request->has('statut')) {
            $query->where('statut', $request->statut);
        }

        if ($request->has('type')) {
            $query->where('typeIncident', $request->type);
        }

        if ($request->has('zone')) {
            $query->where('zone', $request->zone);
        }

        if ($request->has('date')) {
            $query->whereDate('dateHeure', $request->date);
        }

        $incidents = $query->orderBy('dateHeure', 'desc')->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $incidents->items(),
            'pagination' => [
                'current_page' => $incidents->currentPage(),
                'last_page' => $incidents->lastPage(),
                'per_page' => $incidents->perPage(),
                'total' => $incidents->total(),
            ]
        ]);
    }

    public function store(Request $request)
    {
        try {
            $request->validate([
                'dateHeure' => 'required|date',
                'typeIncident' => 'required|string|max:50',
                'description' => 'required|string',
                'zone' => 'required|string|max:100',
                'idCamera' => 'required|exists:cameras,idCamera',
                'photos' => 'nullable|array|max:6',
                'photos.*' => 'image|mimes:jpeg,png,jpg|max:2048'
            ]);

            $incident = new Incident($request->only([
                'dateHeure', 'typeIncident', 'description', 'zone', 'idCamera'
            ]));

            $incident->idUtilisateur = $request->user()->idUtilisateur;

            // Traitement des photos
            if ($request->hasFile('photos')) {
                foreach ($request->file('photos') as $index => $photo) {
                    if ($index < 6) {
                        $filename = 'incident_' . time() . '_' . ($index + 1) . '.' . $photo->getClientOriginalExtension();
                        
                        // Redimensionner et optimiser l'image
                        $image = Image::make($photo)->resize(800, 600, function ($constraint) {
                            $constraint->aspectRatio();
                            $constraint->upsize();
                        });
                        
                        Storage::disk('public')->put('incidents/' . $filename, $image->encode());
                        
                        $incident->{'photo' . ($index + 1)} = 'incidents/' . $filename;
                    }
                }
            }

            $incident->save();

            // Charger les relations pour la réponse
            $incident->load(['camera', 'utilisateur']);

            return response()->json([
                'success' => true,
                'message' => 'Incident enregistré avec succès',
                'data' => $incident
            ], 201);
        } catch (\Exception $e) {
            \Log::error('Erreur lors de la création d\'incident: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur serveur lors de la création de l\'incident',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        $incident = Incident::with(['camera', 'utilisateur', 'validateur'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $incident
        ]);
    }

    public function validate(Request $request, $id)
    {
        $request->validate([
            'statut' => 'required|in:valide,rejete',
            'commentaire' => 'nullable|string'
        ]);

        $user = $request->user();
        
        // Vérifier les permissions (R17, R18)
        if (!in_array($user->role, ['responsable', 'admin'])) {
            return response()->json([
                'success' => false,
                'message' => 'Vous n\'avez pas les permissions pour valider un incident'
            ], 403);
        }

        $incident = Incident::findOrFail($id);

        if ($incident->statut !== 'en_attente') {
            return response()->json([
                'success' => false,
                'message' => 'Cet incident a déjà été traité'
            ], 400);
        }

        $incident->update([
            'statut' => $request->statut,
            'validePar' => $user->idUtilisateur,
            'dateValidation' => now(),
            'commentaireValidation' => $request->commentaire
        ]);

        $incident->load(['camera', 'utilisateur', 'validateur']);

        return response()->json([
            'success' => true,
            'message' => 'Incident ' . ($request->statut === 'valide' ? 'validé' : 'rejeté') . ' avec succès',
            'data' => $incident
        ]);
    }

    public function statistics()
    {
        $stats = [
            'total' => Incident::count(),
            'en_attente' => Incident::where('statut', 'en_attente')->count(),
            'valides' => Incident::where('statut', 'valide')->count(),
            'rejetes' => Incident::where('statut', 'rejete')->count(),
            'ce_mois' => Incident::whereMonth('dateHeure', now()->month)
                                ->whereYear('dateHeure', now()->year)
                                ->count(),
            'par_type' => Incident::selectRaw('typeIncident, COUNT(*) as count')
                                 ->groupBy('typeIncident')
                                 ->get(),
            'par_zone' => Incident::selectRaw('zone, COUNT(*) as count')
                                 ->groupBy('zone')
                                 ->get(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }
}