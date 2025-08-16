<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Incident;
use App\Models\Camera;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use App\Services\TrashService;

class IncidentController extends Controller
{
    protected $trashService;

    public function __construct(TrashService $trashService)
    {
        $this->trashService = $trashService;
    }
    public function index(Request $request)
    {
        $query = Incident::with(['camera', 'utilisateur', 'validateur']);

        // Filtrer les incidents actifs (non supprimés) par défaut
        $query->where('actif', true);

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
            Log::info('Début de création d\'incident', $request->all());

            // Validation des données
            $validatedData = $request->validate([
                'dateHeure' => 'required|date',
                'typeIncident' => 'required|string|max:50',
                'description' => 'required|string',
                'zone' => 'required|string|max:100',
                'idCamera' => 'required|exists:cameras,idCamera',
            ]);

            Log::info('Validation réussie', $validatedData);

            // Créer l'incident
            $incident = new Incident();
            $incident->dateHeure = $request->dateHeure;
            $incident->typeIncident = $request->typeIncident;
            $incident->description = $request->description;
            $incident->zone = $request->zone;
            $incident->idCamera = $request->idCamera;
            $incident->idUtilisateur = $request->user()->idUtilisateur;
            $incident->statut = 'en_attente';

            Log::info('Incident créé en mémoire', $incident->toArray());

            // Traitement des photos si présentes
            if ($request->hasFile('photos')) {
                Log::info('Photos détectées', ['count' => count($request->file('photos'))]);
                
                // Créer le dossier s'il n'existe pas
                if (!Storage::disk('public')->exists('incidents')) {
                    Storage::disk('public')->makeDirectory('incidents');
                }

                $photos = $request->file('photos');
                $photoIndex = 1;

                foreach ($photos as $index => $photo) {
                    if ($photo && $photo->isValid() && $photoIndex <= 6) {
                        try {
                            $filename = 'incident_' . time() . '_' . $photoIndex . '.' . $photo->getClientOriginalExtension();
                            $path = $photo->storeAs('incidents', $filename, 'public');
                            
                            $incident->{'photo' . $photoIndex} = $path;
                            Log::info("Photo {$photoIndex} sauvegardée", ['path' => $path]);
                            
                            $photoIndex++;
                        } catch (\Exception $e) {
                            Log::error("Erreur sauvegarde photo {$photoIndex}", ['error' => $e->getMessage()]);
                        }
                    }
                }
            }

            // Sauvegarder l'incident
            $incident->save();
            Log::info('Incident sauvegardé avec ID', ['id' => $incident->idIncident]);

            // Charger les relations pour la réponse
            $incident->load(['camera', 'utilisateur']);

            return response()->json([
                'success' => true,
                'message' => 'Incident enregistré avec succès',
                'data' => $incident
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Erreur de validation', ['errors' => $e->errors()]);
            return response()->json([
                'success' => false,
                'message' => 'Erreur de validation',
                'errors' => $e->errors()
            ], 422);

        } catch (\Exception $e) {
            Log::error('Erreur lors de la création d\'incident', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

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

    /**
     * Mettre à jour un incident
     */
    public function update(Request $request, $id)
    {
        $user = $request->user();
        $incident = Incident::findOrFail($id);

        // Vérifier les permissions
        if (!in_array($user->role, ['admin', 'responsable']) && $incident->idUtilisateur !== $user->idUtilisateur) {
            return response()->json([
                'success' => false,
                'message' => 'Permission refusée pour modifier cet incident.'
            ], 403);
        }

        // Validation
        $request->validate([
            'typeIncident' => 'sometimes|required|string|max:50',
            'description' => 'sometimes|required|string',
            'zone' => 'sometimes|required|string|max:100',
            'dateHeure' => 'sometimes|required|date',
            'photos.*' => 'sometimes|image|mimes:jpeg,png,jpg|max:10240'
        ]);

        try {
            // Mettre à jour les champs de base
            $incident->update($request->only([
                'typeIncident', 'description', 'zone', 'dateHeure'
            ]));

            // Traitement des nouvelles photos si présentes
            if ($request->hasFile('photos')) {
                $photos = $request->file('photos');
                $photoIndex = 1;

                foreach ($photos as $photo) {
                    if ($photo && $photo->isValid() && $photoIndex <= 6) {
                        // Supprimer l'ancienne photo si elle existe
                        $oldPhotoField = "photo{$photoIndex}";
                        if ($incident->$oldPhotoField) {
                            Storage::disk('public')->delete($incident->$oldPhotoField);
                        }

                        // Sauvegarder la nouvelle photo
                        $filename = 'incident_' . time() . '_' . $photoIndex . '.' . $photo->getClientOriginalExtension();
                        $path = $photo->storeAs('incidents', $filename, 'public');
                        $incident->$oldPhotoField = $path;

                        $photoIndex++;
                    }
                }
                $incident->save();
            }

            return response()->json([
                'success' => true,
                'message' => 'Incident mis à jour avec succès.',
                'data' => $incident
            ]);
        } catch (\Exception $e) {
            Log::error('Erreur mise à jour incident', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour de l\'incident.'
            ], 500);
        }
    }

    /**
     * Supprimer un incident (déplacer vers la corbeille)
     */
    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        $incident = Incident::findOrFail($id);

        // Vérifier les permissions de base
        $canDelete = false;
        if ($user->role === 'admin') {
            $canDelete = true;
        } elseif ($user->role === 'responsable') {
            $canDelete = true;
        } elseif ($user->role === 'agent' && $incident->idUtilisateur === $user->idUtilisateur) {
            $canDelete = true;
        }

        if (!$canDelete) {
            return response()->json([
                'success' => false,
                'message' => 'Permission refusée pour supprimer cet incident.'
            ], 403);
        }

        $reason = $request->input('reason', 'Suppression par l\'utilisateur');

        try {
            // Suppression logique simple
            $incident->update([
                'actif' => false,
                'deleted_at' => now(),
                'deleted_by' => $user->idUtilisateur,
                'deletion_reason' => $reason,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Incident supprimé avec succès.'
            ]);
        } catch (\Exception $e) {
            Log::error('Erreur suppression incident', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression de l\'incident.'
            ], 500);
        }
    }
}