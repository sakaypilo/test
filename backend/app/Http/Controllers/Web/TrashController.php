<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Incident;
use App\Models\Camera;
use App\Models\Personne;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TrashController extends Controller
{
    public function __construct()
    {
        // S'assurer que l'utilisateur est connecté
        $this->middleware('web.auth');
    }

    /**
     * Afficher la page de la corbeille
     */
    public function index(Request $request)
    {
        $type = $request->get('type', 'all');
        
        $deletedItems = [];
        
        if ($type === 'all' || $type === 'incidents') {
            $deletedIncidents = Incident::with(['camera', 'utilisateur'])
                ->where('actif', false)
                ->orderBy('deleted_at', 'desc')
                ->get()
                ->map(function ($incident) {
                    return [
                        'id' => $incident->idIncident,
                        'type' => 'incident',
                        'title' => $incident->typeIncident,
                        'description' => $incident->description,
                        'deleted_at' => $incident->deleted_at,
                        'deleted_by' => $incident->deleted_by,
                        'deletion_reason' => $incident->deletion_reason,
                        'zone' => $incident->zone,
                        'camera' => $incident->camera ? $incident->camera->emplacement : null,
                        'user' => $incident->utilisateur ? $incident->utilisateur->nom . ' ' . $incident->utilisateur->prenom : null,
                    ];
                });
            
            $deletedItems = array_merge($deletedItems, $deletedIncidents->toArray());
        }
        
        if ($type === 'all' || $type === 'cameras') {
            $deletedCameras = Camera::with('technicien')
                ->where('actif', false)
                ->orderBy('deleted_at', 'desc')
                ->get()
                ->map(function ($camera) {
                    return [
                        'id' => $camera->idCamera,
                        'type' => 'camera',
                        'title' => 'Caméra ' . $camera->numeroSerie,
                        'description' => $camera->emplacement . ' - ' . $camera->zone,
                        'deleted_at' => $camera->deleted_at,
                        'deleted_by' => $camera->deleted_by,
                        'deletion_reason' => $camera->deletion_reason,
                        'zone' => $camera->zone,
                        'ip' => $camera->adresseIP,
                        'technicien' => $camera->technicien ? $camera->technicien->nom . ' ' . $camera->technicien->prenom : null,
                    ];
                });
            
            $deletedItems = array_merge($deletedItems, $deletedCameras->toArray());
        }
        
        if ($type === 'all' || $type === 'personnes') {
            $deletedPersonnes = Personne::where('actif', false)
                ->orderBy('deleted_at', 'desc')
                ->get()
                ->map(function ($personne) {
                    return [
                        'id' => $personne->idPersonne,
                        'type' => 'personne',
                        'title' => $personne->prenom . ' ' . $personne->nom,
                        'description' => 'CIN: ' . $personne->CIN . ' - ' . $personne->statut,
                        'deleted_at' => $personne->deleted_at,
                        'deleted_by' => $personne->deleted_by,
                        'deletion_reason' => $personne->deletion_reason,
                        'cin' => $personne->CIN,
                        'statut' => $personne->statut,
                        'fait_associe' => $personne->faitAssocie,
                    ];
                });
            
            $deletedItems = array_merge($deletedItems, $deletedPersonnes->toArray());
        }
        
        // Trier par date de suppression
        usort($deletedItems, function ($a, $b) {
            return strtotime($b['deleted_at']) - strtotime($a['deleted_at']);
        });
        
        return view('admin.trash.index', [
            'deletedItems' => $deletedItems,
            'currentType' => $type,
            'stats' => [
                'incidents' => Incident::where('actif', false)->count(),
                'cameras' => Camera::where('actif', false)->count(),
                'personnes' => Personne::where('actif', false)->count(),
            ]
        ]);
    }
    
    /**
     * Restaurer un élément
     */
    public function restore(Request $request)
    {
        $type = $request->input('type');
        $id = $request->input('id');
        
        try {
            switch ($type) {
                case 'incident':
                    $item = Incident::where('idIncident', $id)->first();
                    break;
                case 'camera':
                    $item = Camera::where('idCamera', $id)->first();
                    break;
                case 'personne':
                    $item = Personne::where('idPersonne', $id)->first();
                    break;
                default:
                    return response()->json(['success' => false, 'message' => 'Type invalide']);
            }
            
            if (!$item) {
                return response()->json(['success' => false, 'message' => 'Élément non trouvé']);
            }
            
            $item->update([
                'actif' => true,
                'deleted_at' => null,
                'deleted_by' => null,
                'deletion_reason' => null,
            ]);
            
            return response()->json([
                'success' => true, 
                'message' => ucfirst($type) . ' restauré(e) avec succès'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false, 
                'message' => 'Erreur lors de la restauration: ' . $e->getMessage()
            ]);
        }
    }
    
    /**
     * Supprimer définitivement un élément
     */
    public function forceDelete(Request $request)
    {
        $type = $request->input('type');
        $id = $request->input('id');
        
        try {
            switch ($type) {
                case 'incident':
                    $item = Incident::where('idIncident', $id)->first();
                    break;
                case 'camera':
                    $item = Camera::where('idCamera', $id)->first();
                    break;
                case 'personne':
                    $item = Personne::where('idPersonne', $id)->first();
                    break;
                default:
                    return response()->json(['success' => false, 'message' => 'Type invalide']);
            }
            
            if (!$item) {
                return response()->json(['success' => false, 'message' => 'Élément non trouvé']);
            }
            
            $item->delete();
            
            return response()->json([
                'success' => true, 
                'message' => ucfirst($type) . ' supprimé(e) définitivement'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false, 
                'message' => 'Erreur lors de la suppression: ' . $e->getMessage()
            ]);
        }
    }
    
    /**
     * Vider la corbeille pour un type donné
     */
    public function empty(Request $request)
    {
        $type = $request->input('type', 'all');
        
        try {
            $count = 0;
            
            if ($type === 'all' || $type === 'incidents') {
                $count += Incident::where('actif', false)->delete();
            }
            
            if ($type === 'all' || $type === 'cameras') {
                $count += Camera::where('actif', false)->delete();
            }
            
            if ($type === 'all' || $type === 'personnes') {
                $count += Personne::where('actif', false)->delete();
            }
            
            return response()->json([
                'success' => true, 
                'message' => "$count élément(s) supprimé(s) définitivement"
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false, 
                'message' => 'Erreur lors du vidage: ' . $e->getMessage()
            ]);
        }
    }
}
