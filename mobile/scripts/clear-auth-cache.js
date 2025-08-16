#!/usr/bin/env node

/**
 * Script pour vider le cache d'authentification
 * Utile pour tester le comportement de l'authentification
 */

const { execSync } = require('child_process');

console.log('Nettoyage du cache d\'authentification...');

try {
  // Pour Android
  console.log('Nettoyage du cache Android...');
  execSync('adb shell pm clear host.exp.exponent', { stdio: 'inherit' });

  // Alternative pour Expo Go
  execSync('adb shell pm clear com.android.chrome', { stdio: 'inherit' });

  console.log('Cache Android nettoye');
} catch (error) {
  console.log('Impossible de nettoyer le cache Android (normal si pas d\'emulateur)');
}

try {
  // Pour iOS Simulator
  console.log('Nettoyage du cache iOS...');
  execSync('xcrun simctl erase all', { stdio: 'inherit' });
  console.log('Cache iOS nettoye');
} catch (error) {
  console.log('Impossible de nettoyer le cache iOS (normal si pas de simulateur)');
}

console.log('');
console.log('Nettoyage termine !');
console.log('Vous pouvez maintenant tester l\'authentification depuis le debut.');
console.log('');
console.log('Pour tester manuellement :');
console.log('1. Lancez l\'app avec: npm start');
console.log('2. Vous devriez voir la page d\'accueil');
console.log('3. Connectez-vous avec vos identifiants');
console.log('4. Fermez l\'app et relancez-la');
console.log('5. L\'app devrait verifier votre token et vous connecter automatiquement');
