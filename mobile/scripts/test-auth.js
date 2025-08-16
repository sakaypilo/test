#!/usr/bin/env node

/**
 * Script de test pour l'authentification
 * Simule différents scénarios d'authentification
 */

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔐 Test de l\'Authentification SMMC');
console.log('=====================================');
console.log('');

function showMenu() {
  console.log('Choisissez un test à effectuer :');
  console.log('');
  console.log('1. 📱 Test de première installation');
  console.log('2. 🔄 Test de reconnexion automatique');
  console.log('3. ⏰ Test de token expiré');
  console.log('4. 🚪 Test de déconnexion');
  console.log('5. 🧹 Vider le cache d\'authentification');
  console.log('6. ❌ Quitter');
  console.log('');
}

function handleChoice(choice) {
  switch (choice) {
    case '1':
      console.log('');
      console.log('📱 Test de Première Installation');
      console.log('================================');
      console.log('1. Assurez-vous que l\'app n\'est pas installée ou videz le cache');
      console.log('2. Lancez l\'app avec: npm start');
      console.log('3. Vérifiez que la page d\'accueil s\'affiche');
      console.log('4. Cliquez sur "Se connecter"');
      console.log('5. Connectez-vous avec vos identifiants');
      console.log('✅ Résultat attendu: Redirection vers le dashboard');
      break;

    case '2':
      console.log('');
      console.log('🔄 Test de Reconnexion Automatique');
      console.log('==================================');
      console.log('1. Connectez-vous à l\'application');
      console.log('2. Fermez complètement l\'app (pas seulement minimiser)');
      console.log('3. Relancez l\'app');
      console.log('4. Observez l\'écran de chargement "Vérification de l\'authentification..."');
      console.log('✅ Résultat attendu: Redirection automatique vers le dashboard');
      break;

    case '3':
      console.log('');
      console.log('⏰ Test de Token Expiré');
      console.log('=======================');
      console.log('1. Connectez-vous à l\'application');
      console.log('2. Côté serveur, invalidez le token ou attendez l\'expiration');
      console.log('3. Relancez l\'app');
      console.log('4. Observez l\'écran de chargement');
      console.log('✅ Résultat attendu: Redirection vers la page d\'accueil');
      break;

    case '4':
      console.log('');
      console.log('🚪 Test de Déconnexion');
      console.log('======================');
      console.log('1. Connectez-vous à l\'application');
      console.log('2. Allez dans l\'onglet "Profil"');
      console.log('3. Cliquez sur "Se Déconnecter"');
      console.log('4. Confirmez la déconnexion');
      console.log('5. Relancez l\'app pour vérifier');
      console.log('✅ Résultat attendu: Redirection vers la page d\'accueil');
      break;

    case '5':
      console.log('');
      console.log('🧹 Nettoyage du Cache');
      console.log('=====================');
      console.log('Exécution du script de nettoyage...');
      try {
        require('./clear-auth-cache.js');
      } catch (error) {
        console.log('❌ Erreur lors du nettoyage:', error.message);
      }
      break;

    case '6':
      console.log('');
      console.log('👋 Au revoir !');
      rl.close();
      return;

    default:
      console.log('❌ Choix invalide. Veuillez choisir entre 1 et 6.');
  }

  console.log('');
  console.log('Appuyez sur Entrée pour revenir au menu...');
  rl.question('', () => {
    console.clear();
    showMenu();
    askChoice();
  });
}

function askChoice() {
  rl.question('Votre choix (1-6): ', handleChoice);
}

// Démarrage du script
console.clear();
showMenu();
askChoice();
