# SMMC Security Mobile App

Application mobile React Native pour le système de monitoring et management des caméras (SMMC) du Port de Toamasina.

## 🚀 Démarrage rapide

### Prérequis
- Node.js 16+
- Expo CLI
- Un émulateur Android/iOS ou un appareil physique

### Installation

1. **Installer les dépendances**
```bash
cd mobile
npm install
```

2. **Démarrer l'application**
```bash
npm start
```

3. **Lancer sur un appareil**
```bash
# Android
npm run android

# iOS
npm run ios
```

## 📱 Fonctionnalités

### ✅ Authentification
- Connexion sécurisée avec matricule et mot de passe
- Persistance de session
- Déconnexion automatique

### ✅ Dashboard
- Statistiques en temps réel
- Incidents récents
- Actions rapides
- Alertes système

### ✅ Gestion des incidents
- Liste des incidents avec filtres
- Création d'incidents avec photos
- Validation par les responsables
- Recherche avancée

### ✅ Surveillance des caméras
- État des caméras en temps réel
- Statistiques par zone
- Informations techniques

### ✅ Personnes appréhendées
- Liste des personnes avec photos
- Historique des interpellations
- Recherche par nom/CIN

### ✅ Rapports
- Génération de rapports PDF
- Incidents disponibles pour rapport
- Historique des rapports générés

### ✅ Profil utilisateur
- Informations personnelles
- Gestion du compte
- Déconnexion sécurisée

## 🏗️ Architecture

### Technologies utilisées
- **React Native** avec Expo
- **TypeScript** pour la sécurité des types
- **React Navigation** pour la navigation
- **React Native Paper** pour l'UI Material Design
- **Zustand** pour la gestion d'état
- **Axios** pour les appels API
- **Expo Camera** pour la prise de photos
- **AsyncStorage** pour la persistance

### Structure du projet
```
mobile/
├── src/
│   ├── screens/          # Écrans de l'application
│   ├── stores/           # Gestion d'état Zustand
│   ├── services/         # Services API
│   └── theme/            # Thème et couleurs
├── assets/               # Images et ressources
└── App.tsx              # Point d'entrée
```

## 🎨 Design

L'application suit les principes Material Design avec :
- **Couleur primaire** : #00A550 (vert SMMC)
- **Interface responsive** adaptée aux mobiles
- **Navigation intuitive** avec onglets
- **Feedback visuel** pour toutes les actions

## 🔐 Sécurité

- **Authentification** par tokens JWT
- **Stockage sécurisé** des credentials
- **Validation** des données côté client
- **Gestion des permissions** par rôle utilisateur

## 📊 Permissions requises

### Android
- `CAMERA` : Prise de photos pour les incidents
- `READ_EXTERNAL_STORAGE` : Accès aux photos existantes
- `WRITE_EXTERNAL_STORAGE` : Sauvegarde des photos

### iOS
- Accès à la caméra et à la galerie photo

## 🚀 Déploiement

### Build de production
```bash
# Android APK
expo build:android

# iOS IPA
expo build:ios
```

### Publication sur les stores
```bash
# Google Play Store
expo upload:android

# Apple App Store
expo upload:ios
```

## 🔧 Configuration

### Variables d'environnement
Modifiez l'URL de l'API dans `src/services/api.ts` :
```typescript
const API_BASE_URL = 'https://votre-serveur.com/api';
```

### Personnalisation
- **Logo** : Remplacez `assets/smmc-logo.png`
- **Couleurs** : Modifiez `src/theme/theme.ts`
- **Icônes** : Utilisez Ionicons ou ajoutez vos propres icônes

## 📱 Compatibilité

- **Android** : 6.0+ (API 23+)
- **iOS** : 11.0+
- **Expo SDK** : 49+

## 🐛 Dépannage

### Problèmes courants

1. **Erreur de connexion API**
   - Vérifiez l'URL de l'API
   - Assurez-vous que le serveur backend est accessible

2. **Problème de permissions caméra**
   - Accordez les permissions dans les paramètres de l'appareil

3. **Erreur de build**
   - Nettoyez le cache : `expo r -c`
   - Réinstallez les dépendances : `rm -rf node_modules && npm install`

## 📞 Support

Pour toute question ou problème :
1. Vérifiez les logs avec `expo logs`
2. Consultez la documentation Expo
3. Contactez l'équipe de développement

---

*Application développée pour SMMC - Port de Toamasina*