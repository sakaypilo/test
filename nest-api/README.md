# SMMC NestJS API

Migration complète de l'API Laravel vers NestJS pour la gestion des caméras, incidents et vols du SMMC Port de Toamasina.

## Installation

### 1. Installer les dépendances
```bash
cd nest-api
npm install
```

### 2. Configurer la base de données
- Modifiez le fichier `.env` et renseignez votre URL de base de données MySQL :
```
DATABASE_URL="mysql://utilisateur:mot_de_passe@localhost:3306/nom_base_de_donnees"
```

### 3. Générer le client Prisma et exécuter les migrations
```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 4. (Optionnel) Exécuter le seeding
Pour peupler la base de données avec des données de test :
```bash
npx prisma db seed
```

## Démarrage du serveur

### Développement (avec rechargement à chaud)
```bash
npm run start:dev
```

Le serveur démarre sur http://localhost:3001/api

### Production
```bash
npm run build
npm run start:prod
```

## API Reference

Les endpoints sont **strictement identiques** à ceux de l'API Laravel :

### Authentification
- `POST /api/login` - Connexion avec matricule et mot de passe
- `POST /api/logout` - Déconnexion (nécessite un token JWT)
- `GET /api/me` - Récupérer les informations de l'utilisateur connecté

### Dashboard
- `GET /api/dashboard` - Statistiques du tableau de bord
- `GET /api/dashboard/alertes` - Alertes système

### Caméras
- `GET /api/cameras` - Liste des caméras
- `POST /api/cameras` - Ajouter une caméra
- `GET /api/cameras/:id` - Détails d'une caméra
- `PUT /api/cameras/:id` - Mettre à jour une caméra
- `DELETE /api/cameras/:id` - Supprimer une caméra
- `GET /api/cameras/statistics` - Statistiques des caméras

### Incidents
- `GET /api/incidents` - Liste des incidents
- `POST /api/incidents` - Créer un incident
- `GET /api/incidents/:id` - Détails d'un incident
- `PUT /api/incidents/:id` - Mettre à jour un incident
- `DELETE /api/incidents/:id` - Supprimer (soft delete) un incident
- `POST /api/incidents/:id/validate` - Valider ou rejeter un incident
- `GET /api/incidents/statistics` - Statistiques des incidents
- `POST /api/incidents/bulk-update` - Mise à jour en masse
- `POST /api/incidents/bulk-delete` - Suppression en masse

### Personnes
- `GET /api/personnes` - Liste des personnes appréhendées
- `POST /api/personnes` - Ajouter une personne + interpellation
- `GET /api/personnes/:id` - Détails d'une personne
- `PUT /api/personnes/:id` - Mettre à jour une personne
- `DELETE /api/personnes/:id` - Supprimer (soft delete) une personne
- `POST /api/personnes/:id/interpellations` - Ajouter une interpellation
- `GET /api/personnes/statistics` - Statistiques des personnes

### Rapports
- `GET /api/rapports` - Liste des rapports
- `POST /api/rapports/incidents/:id` - Générer un rapport d'incident
- `GET /api/rapports/statistics` - Statistiques des rapports

### Utilisateurs
- `GET /api/users` - Liste des utilisateurs (admin seul)
- `POST /api/users` - Créer un utilisateur (admin seul)
- `GET /api/users/:id` - Détails d'un utilisateur
- `PUT /api/users/:id` - Mettre à jour un utilisateur (admin seul)
- `POST /api/users/:id/reset-password` - Réinitialiser le mot de passe (admin seul)
- `POST /api/users/:id/change-password` - Changer le mot de passe
- `POST /api/users/:id/toggle-status` - Activer/désactiver un utilisateur (admin seul)
- `GET /api/users/statistics` - Statistiques des utilisateurs (admin seul)

## Format des réponses

Les réponses utilisent **exactement le même format** que l'API Laravel :
- Champs en `snake_case`
- Erreurs 422 avec `{ "success": false, "message": "...", "errors": { "field": ["erreur"] } }`
- Réponses succès avec `{ "success": true, "data": ... }`

## Differences Laravel vs NestJS

| Concept | Laravel | NestJS |
|---------|---------|--------|
| Service Providers | Fournisseurs de services | Modules NestJS (`@Module`) |
| Middleware | Middleware | Guards, Interceptors, Middleware |
| Form Requests | Classes de requête | DTO + `class-validator` |
| Eloquent ORM | Eloquent | Prisma ORM |
| Sanctum | Laravel Sanctum | `@nestjs/jwt` + `@nestjs/passport` |

## Migration de Laravel vers NestJS

Pour utiliser la même base de données que Laravel :
1. Utilisez la même URL `DATABASE_URL`
2. Vous pouvez utiliser `npx prisma db pull` pour générer le schéma Prisma depuis la base existante
