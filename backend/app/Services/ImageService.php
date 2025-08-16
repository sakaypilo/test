<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;

class ImageService
{
    private ImageManager $imageManager;
    
    public function __construct()
    {
        $this->imageManager = new ImageManager(new Driver());
    }
    
    /**
     * Traiter et sauvegarder une image avec optimisation
     */
    public function processAndStore(UploadedFile $file, string $directory, array $options = []): string
    {
        $options = array_merge([
            'max_width' => 1920,
            'max_height' => 1080,
            'quality' => 85,
            'create_thumbnail' => true,
            'thumbnail_size' => 300,
        ], $options);
        
        // Générer un nom unique
        $filename = $this->generateUniqueFilename($file->getClientOriginalExtension());
        
        // Créer le répertoire s'il n'existe pas
        if (!Storage::disk('public')->exists($directory)) {
            Storage::disk('public')->makeDirectory($directory);
        }
        
        // Traiter l'image principale
        $image = $this->imageManager->read($file->getPathname());
        
        // Redimensionner si nécessaire
        if ($image->width() > $options['max_width'] || $image->height() > $options['max_height']) {
            $image->scale(
                width: $options['max_width'],
                height: $options['max_height']
            );
        }
        
        // Sauvegarder l'image principale
        $mainPath = "{$directory}/{$filename}";
        Storage::disk('public')->put(
            $mainPath,
            $image->toJpeg($options['quality'])
        );
        
        // Créer une miniature si demandé
        if ($options['create_thumbnail']) {
            $thumbnailFilename = 'thumb_' . $filename;
            $thumbnailPath = "{$directory}/thumbnails/{$thumbnailFilename}";
            
            if (!Storage::disk('public')->exists("{$directory}/thumbnails")) {
                Storage::disk('public')->makeDirectory("{$directory}/thumbnails");
            }
            
            $thumbnail = $image->scale($options['thumbnail_size']);
            Storage::disk('public')->put(
                $thumbnailPath,
                $thumbnail->toJpeg(80)
            );
        }
        
        return $mainPath;
    }
    
    /**
     * Supprimer une image et sa miniature
     */
    public function deleteImage(string $path): void
    {
        if (Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }
        
        // Supprimer la miniature si elle existe
        $directory = dirname($path);
        $filename = basename($path);
        $thumbnailPath = "{$directory}/thumbnails/thumb_{$filename}";
        
        if (Storage::disk('public')->exists($thumbnailPath)) {
            Storage::disk('public')->delete($thumbnailPath);
        }
    }
    
    /**
     * Générer un nom de fichier unique
     */
    private function generateUniqueFilename(string $extension): string
    {
        return time() . '_' . uniqid() . '.' . $extension;
    }
    
    /**
     * Valider un fichier image
     */
    public function validateImage(UploadedFile $file): array
    {
        $errors = [];
        
        // Vérifier le type MIME
        $allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!in_array($file->getMimeType(), $allowedMimes)) {
            $errors[] = 'Type de fichier non autorisé. Utilisez JPEG, PNG ou WebP.';
        }
        
        // Vérifier la taille (max 10MB)
        if ($file->getSize() > 10 * 1024 * 1024) {
            $errors[] = 'Le fichier est trop volumineux. Maximum 10MB.';
        }
        
        // Vérifier les dimensions
        $imageInfo = getimagesize($file->getPathname());
        if ($imageInfo) {
            [$width, $height] = $imageInfo;
            if ($width > 4000 || $height > 4000) {
                $errors[] = 'Image trop grande. Maximum 4000x4000 pixels.';
            }
        }
        
        return $errors;
    }
}
