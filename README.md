# 🎥 Système de Monitoring et Management des Caméras (SMMC)

Une application web moderne pour la gestion et le monitoring des caméras de surveillance dans un environnement portuaire.

## 🚀 Démarrage Rapide

### Prérequis
- PHP 8.1+
- Node.js 16+
- MySQL 8.0+
- Composer
- npm

### Installation et Démarrage

1. **Cloner le projet**
```bash
git clone <repository-url>
cd testsmmc
```

2. **Démarrer l'application**
```bash
./start_application.sh
```

3. **Accéder à l'application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000/api

4. **Identifiants de test**
- Matricule: `2018025`
- Mot de passe: `password`

5. **Arrêter l'application**
```bash
./stop_application.sh
```

## 🏗️ Architecture

### Backend (Laravel 10)
- **Framework**: Laravel 10 avec Sanctum pour l'authentification
- **Base de données**: MySQL avec migrations et seeders
- **API**: RESTful API avec validation et permissions
- **Upload**: Gestion des photos avec Intervention Image
- **Rapports**: Génération PDF avec DomPDF

### Frontend (React + TypeScript)
- **Framework**: React 18 avec TypeScript
- **État**: Zustand pour la gestion d'état
- **Routage**: React Router v6
- **UI**: Interface moderne avec Tailwind CSS
- **Hooks**: Custom hooks pour les appels API

## 📊 Fonctionnalités

### 🔐 Authentification
- Connexion sécurisée avec matricule et mot de passe
- Tokens d'authentification avec Sanctum
- Gestion des rôles (responsable, agent, technicien)
- Déconnexion automatique

### 📹 Gestion des Caméras
- **Liste complète** avec filtres par statut et zone
- **Ajout/Modification** des caméras
- **Statistiques** par zone et statut
- **Détails techniques** (IP, emplacement, technicien)
- **Monitoring** en temps réel

### 🚨 Gestion des Incidents
- **Création** d'incidents avec photos
- **Validation** par les responsables
- **Filtres** avancés (statut, type, zone, date)
- **Statistiques** détaillées
- **Historique** complet

### 👥 Gestion des Personnes
- **Enregistrement** avec interpellations
- **Photos** et informations personnelles
- **Recherche** avancée
- **Statistiques** interne/externe
- **Historique** des interpellations

### 📈 Dashboard Interactif
- **Statistiques globales** en temps réel
- **Incidents récents** avec alertes
- **Graphiques** d'évolution
- **Répartition** par zone
- **Notifications** automatiques

### 👤 Gestion des Utilisateurs
- **Création** de comptes avec rôles
- **Modification** des informations
- **Réinitialisation** de mots de passe
- **Activation/Désactivation** des comptes
- **Permissions** par rôle

### 📋 Rapports
- **Génération** de rapports d'incidents
- **Export PDF** avec templates
- **Historique** des rapports
- **Téléchargement** automatique

## 🧪 Tests

### Tests Automatisés
```bash
# Tester toutes les fonctionnalités
./test_functionnalites.sh
```

### Tests API Manuels
```bash
# Authentification
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"matricule":"2018025","motDePasse":"password"}'

# Liste des caméras
curl -X GET http://localhost:8000/api/cameras \
  -H "Authorization: Bearer <token>"

# Dashboard
curl -X GET http://localhost:8000/api/dashboard \
  -H "Authorization: Bearer <token>"
```

## 📁 Structure du Projet

```
testsmmc/
├── backend/                 # API Laravel
│   ├── app/
│   │   ├── Http/Controllers/Api/
│   │   ├── Models/
│   │   └── ...
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   └── routes/api.php
├── frontend/               # Interface React
│   ├── src/
│   │   ├── components/
│   │   ├── views/
│   │   ├── stores/
│   │   ├── services/
│   │   └── hooks/
│   └── package.json
├── start_application.sh    # Script de démarrage
├── stop_application.sh     # Script d'arrêt
└── test_functionnalites.sh # Tests complets
```

## 🔧 Configuration

### Variables d'Environnement Backend
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=smmc
DB_USERNAME=root
DB_PASSWORD=
```

### Variables d'Environnement Frontend
```env
VITE_API_URL=http://localhost:8000/api
```

## 📊 Base de Données

### Tables Principales
- **users**: Utilisateurs du système
- **cameras**: Caméras de surveillance
- **incidents**: Incidents détectés
- **personnes**: Personnes interpellées
- **interpellations**: Historique des interpellations
- **connexions**: Log des connexions
- **rapports**: Rapports générés

### Données de Test
- 3 utilisateurs (responsable, agent, technicien)
- 3 caméras dans différentes zones
- 3 incidents avec différents statuts
- 3 personnes avec interpellations

## 🚀 Déploiement

### Production
1. **Backend**
```bash
cd backend
composer install --no-dev --optimize-autoloader
php artisan config:cache
php artisan route:cache
php artisan migrate --force
```

2. **Frontend**
```bash
cd frontend
npm run build
```

### Docker (Optionnel)
```bash
docker-compose up -d
```

## 🔒 Sécurité

- **Authentification** avec tokens Sanctum
- **Validation** des données côté serveur
- **Permissions** par rôle utilisateur
- **Protection CSRF** activée
- **Upload sécurisé** des fichiers
- **Logs** de connexion

## 📈 Performance

- **Temps de réponse API**: < 200ms
- **Temps de compilation**: < 30s
- **Temps de chargement**: < 2s
- **Optimisation** des images uploadées
- **Cache** des requêtes fréquentes

## 🐛 Dépannage

### Problèmes Courants

1. **Port déjà utilisé**
```bash
# Vérifier les ports
lsof -i :8000
lsof -i :5173

# Arrêter les processus
pkill -f "php artisan serve"
pkill -f "npm run dev"
```

2. **Erreurs de base de données**
```bash
cd backend
php artisan migrate:fresh --seed
```

3. **Erreurs de compilation frontend**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

## 📞 Support

Pour toute question ou problème :
1. Vérifier les logs dans `backend/storage/logs/`
2. Consulter la documentation API : `http://localhost:8000/api/test`
3. Exécuter les tests : `./test_functionnalites.sh`

## 📄 Licence

Ce projet est développé pour la Société de Management et Monitoring des Caméras (SMMC).

---

*Dernière mise à jour : 28 juillet 2025* 