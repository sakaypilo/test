#!/bin/bash

# Script de configuration du stockage Laravel
echo "🔧 Configuration du stockage Laravel..."

# Créer les dossiers de stockage s'ils n'existent pas
echo "📁 Création des dossiers de stockage..."
mkdir -p storage/app/public/incidents
mkdir -p storage/app/public/personnes
mkdir -p storage/app/public/rapports

# Définir les permissions appropriées
echo "🔒 Configuration des permissions..."
chmod -R 755 storage/
chmod -R 755 bootstrap/cache/

# Créer le lien symbolique
echo "🔗 Création du lien symbolique..."
php artisan storage:link

# Vérifier que le lien fonctionne
echo "✅ Vérification du lien symbolique..."
if [ -L "public/storage" ]; then
    echo "✅ Lien symbolique créé avec succès"
    ls -la public/storage
else
    echo "❌ Erreur : Lien symbolique non créé"
    exit 1
fi

# Tester l'accès aux fichiers
echo "🧪 Test d'accès aux fichiers..."
if [ -f "storage/app/public/incidents/incident_1755380852_1.jpg" ]; then
    echo "📸 Test d'accès à une photo existante..."
    curl -I http://localhost:8000/storage/incidents/incident_1755380852_1.jpg
else
    echo "ℹ️  Aucune photo de test trouvée"
fi

echo "🎉 Configuration terminée !"
echo ""
echo "📋 Résumé :"
echo "   - Dossiers de stockage créés"
echo "   - Permissions configurées"
echo "   - Lien symbolique créé"
echo "   - Les photos sont maintenant accessibles via /storage/"
echo ""
echo "🌐 URLs d'accès :"
echo "   - Web : http://localhost:8000/storage/"
echo "   - Mobile iOS : http://localhost:8000/storage/"
echo "   - Mobile Android : http://10.0.2.2:8000/storage/"
