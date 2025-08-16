# 🧪 Guide de Test - Agent de Sécurité

## ✅ **Confirmation : L'API Backend Fonctionne !**

J'ai testé l'API et elle fonctionne parfaitement :
- ✅ L'agent peut se connecter
- ✅ L'agent peut voir ses incidents (2 incidents)
- ✅ L'agent peut supprimer ses propres incidents
- ✅ Les permissions sont correctes

## 🔐 **Identifiants de Test**

### **Agent de Sécurité :**
- **Matricule :** `2020012`
- **Mot de passe :** `password`
- **Nom :** RANDRIA Marie
- **Rôle :** agent

### **Ses Incidents :**
- **Incident 1 :** Intrusion (ID: 1) ✅ Peut supprimer
- **Incident 2 :** Vol suspect (ID: 2) ✅ Peut supprimer

## 📱 **Comment Tester dans l'App Mobile**

### **Étape 1 : Connexion**
1. **Ouvrez** l'application mobile
2. **Entrez** les identifiants :
   - Matricule : `2020012`
   - Mot de passe : `password`
3. **Connectez-vous**

### **Étape 2 : Vérifier les Incidents**
1. **Allez** dans la section "Incidents"
2. **Vous devriez voir** 2 incidents :
   - Intrusion (près du quai conteneurs)
   - Vol suspect (zone de stockage)
3. **Chaque incident** devrait avoir 2 boutons :
   - 👁️ **Bleu** : Voir les détails
   - 🗑️ **Rouge** : Supprimer

### **Étape 3 : Tester la Suppression**
1. **Cliquez** sur le bouton rouge 🗑️ d'un incident
2. **Une popup** devrait apparaître : "Êtes-vous sûr de vouloir supprimer..."
3. **Cliquez** sur "Supprimer"
4. **L'incident** devrait disparaître de la liste

## 🚨 **Si ça ne marche pas :**

### **Problème 1 : "Accès non autorisé"**
**Cause :** L'app mobile n'envoie pas le bon token ou les données utilisateur
**Solution :** Vérifier que la connexion s'est bien passée

### **Problème 2 : Pas de boutons de suppression**
**Cause :** Les permissions ne sont pas correctement vérifiées côté mobile
**Solution :** Vérifier que `user.role === 'agent'` et `incident.idUtilisateur === user.idUtilisateur`

### **Problème 3 : Erreur de méthode HTTP**
**Cause :** L'API service n'envoie pas correctement la méthode DELETE
**Solution :** Déjà corrigé dans le code

## 🧪 **Test API Direct (pour debug)**

Si l'app mobile ne marche pas, vous pouvez tester directement l'API :

### **1. Se connecter :**
```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"matricule":"2020012","motDePasse":"password"}'
```

### **2. Voir ses incidents :**
```bash
curl -H "Authorization: Bearer [TOKEN]" \
  http://localhost:8000/api/debug/user-incidents
```

### **3. Supprimer un incident :**
```bash
curl -X DELETE \
  -H "Authorization: Bearer [TOKEN]" \
  http://localhost:8000/api/incidents/1/delete
```

## 🎯 **Permissions Confirmées**

| Utilisateur | Peut Supprimer | Incidents Visibles |
|-------------|----------------|-------------------|
| **Admin** | ✅ Tous | Tous |
| **Responsable** | ✅ Tous | Tous |
| **Agent (2020012)** | ✅ Ses incidents (ID 1,2) | Ses incidents |
| **Technicien** | ❌ Aucun | Aucun |

## 🔧 **Prochaines Étapes**

1. **Testez** avec l'agent dans l'app mobile
2. **Si ça marche** : Le système est opérationnel ! 🎉
3. **Si ça ne marche pas** : Le problème est dans l'app mobile (connexion/token)

## 📞 **Support**

Si vous rencontrez des problèmes :
1. **Vérifiez** que vous utilisez les bons identifiants
2. **Testez** d'abord l'API directement (voir section ci-dessus)
3. **Vérifiez** les logs du serveur Laravel

**Le backend fonctionne parfaitement ! 🚀**
