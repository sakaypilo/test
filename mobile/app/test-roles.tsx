import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { Stack } from 'expo-router';
import { useAuthStore } from '@/stores/auth';
import { apiService } from '@/services/api';
import { colors } from '@/theme/colors';

export default function TestRolesScreen() {
  const { user, setUser, setTokens, logout } = useAuthStore();
  const [matricule, setMatricule] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const testAccounts = [
    { matricule: '2018001', password: 'admin123', role: 'Admin', description: 'Peut tout faire' },
    { matricule: '2018025', password: 'password', role: 'Responsable', description: 'Peut gérer incidents/caméras/personnes' },
    { matricule: '2020012', password: 'password', role: 'Agent', description: 'Peut gérer ses incidents' },
    { matricule: '2021008', password: 'password', role: 'Technicien', description: 'Peut gérer les caméras' },
  ];

  const handleLogin = async (testMatricule?: string, testPassword?: string) => {
    const loginMatricule = testMatricule || matricule;
    const loginPassword = testPassword || password;

    if (!loginMatricule || !loginPassword) {
      Alert.alert('Erreur', 'Veuillez saisir le matricule et le mot de passe');
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiService.login(loginMatricule, loginPassword);
      
      if (response.success && response.data) {
        setUser(response.data.user);
        setTokens(response.data.token, response.data.refreshToken || response.data.token);
        
        Alert.alert(
          'Connexion Réussie',
          `Bienvenue ${response.data.user.prenom} ${response.data.user.nom}\nRôle: ${response.data.user.role}`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Erreur', response.message || 'Erreur de connexion');
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      Alert.alert('Erreur', 'Erreur de connexion au serveur');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    Alert.alert('Déconnexion', 'Vous avez été déconnecté');
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin': return '#dc2626';
      case 'responsable': return '#ea580c';
      case 'agent': return '#2563eb';
      case 'technicien': return '#16a34a';
      default: return '#6b7280';
    }
  };

  const getRolePermissions = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return ['✅ Supprimer tous les incidents', '✅ Accès corbeille', '✅ Gestion utilisateurs', '✅ Toutes permissions'];
      case 'responsable':
        return ['✅ Supprimer incidents/caméras/personnes', '✅ Accès corbeille', '✅ Validation incidents'];
      case 'agent':
        return ['✅ Supprimer ses incidents', '❌ Pas d\'accès corbeille', '✅ Créer incidents'];
      case 'technicien':
        return ['❌ Pas de suppression', '❌ Pas d\'accès corbeille', '✅ Gestion caméras'];
      default:
        return ['❓ Permissions inconnues'];
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Test des Rôles' }} />
      
      <ScrollView style={styles.content}>
        {/* Utilisateur connecté */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👤 Utilisateur Connecté</Text>
          {user ? (
            <View style={styles.userCard}>
              <View style={styles.userHeader}>
                <Text style={styles.userName}>{user.prenom} {user.nom}</Text>
                <View style={[styles.roleBadge, { backgroundColor: getRoleColor(user.role) }]}>
                  <Text style={styles.roleText}>{user.role.toUpperCase()}</Text>
                </View>
              </View>
              
              <View style={styles.userDetails}>
                <Text style={styles.userDetail}>Matricule: {user.matricule}</Text>
                <Text style={styles.userDetail}>Email: {user.email}</Text>
                <Text style={styles.userDetail}>ID: {user.id}</Text>
                <Text style={styles.userDetail}>ID Utilisateur: {user.idUtilisateur}</Text>
                <Text style={styles.userDetail}>Actif: {user.isActive ? 'Oui' : 'Non'}</Text>
              </View>

              <View style={styles.permissionsSection}>
                <Text style={styles.permissionsTitle}>Permissions:</Text>
                {getRolePermissions(user.role).map((permission, index) => (
                  <Text key={index} style={styles.permissionItem}>{permission}</Text>
                ))}
              </View>

              <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutButtonText}>🚪 Se Déconnecter</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={styles.noUserText}>Aucun utilisateur connecté</Text>
          )}
        </View>

        {/* Connexion manuelle */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔐 Connexion Manuelle</Text>
          
          <View style={styles.loginForm}>
            <TextInput
              style={styles.input}
              placeholder="Matricule"
              value={matricule}
              onChangeText={setMatricule}
              autoCapitalize="none"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Mot de passe"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            
            <TouchableOpacity 
              style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
              onPress={() => handleLogin()}
              disabled={isLoading}
            >
              <Text style={styles.loginButtonText}>
                {isLoading ? 'Connexion...' : '🔑 Se Connecter'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Comptes de test */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🧪 Comptes de Test</Text>
          
          {testAccounts.map((account, index) => (
            <View key={index} style={styles.testAccount}>
              <View style={styles.accountHeader}>
                <Text style={styles.accountRole}>{account.role}</Text>
                <View style={[styles.roleBadge, { backgroundColor: getRoleColor(account.role) }]}>
                  <Text style={styles.roleText}>{account.matricule}</Text>
                </View>
              </View>
              
              <Text style={styles.accountDescription}>{account.description}</Text>
              
              <View style={styles.accountCredentials}>
                <Text style={styles.credentialText}>Matricule: {account.matricule}</Text>
                <Text style={styles.credentialText}>Mot de passe: {account.password}</Text>
              </View>

              <View style={styles.permissionsSection}>
                {getRolePermissions(account.role).map((permission, permIndex) => (
                  <Text key={permIndex} style={styles.permissionItem}>{permission}</Text>
                ))}
              </View>
              
              <TouchableOpacity
                style={[styles.testLoginButton, { backgroundColor: getRoleColor(account.role) }]}
                onPress={() => handleLogin(account.matricule, account.password)}
                disabled={isLoading}
              >
                <Text style={styles.testLoginButtonText}>
                  🚀 Tester {account.role}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Guide d'utilisation */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Guide de Test</Text>
          
          <View style={styles.guideStep}>
            <Text style={styles.stepNumber}>1</Text>
            <Text style={styles.stepText}>Connectez-vous avec un compte de test</Text>
          </View>
          
          <View style={styles.guideStep}>
            <Text style={styles.stepNumber}>2</Text>
            <Text style={styles.stepText}>Vérifiez que le rôle s'affiche correctement</Text>
          </View>
          
          <View style={styles.guideStep}>
            <Text style={styles.stepNumber}>3</Text>
            <Text style={styles.stepText}>Allez dans "Incidents" pour tester les permissions</Text>
          </View>
          
          <View style={styles.guideStep}>
            <Text style={styles.stepNumber}>4</Text>
            <Text style={styles.stepText}>Vérifiez que les boutons de suppression apparaissent selon le rôle</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  userCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 16,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  roleBadge: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  roleText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  userDetails: {
    marginBottom: 12,
  },
  userDetail: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  permissionsSection: {
    marginBottom: 12,
  },
  permissionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  permissionItem: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 4,
  },
  logoutButton: {
    backgroundColor: '#ef4444',
    borderRadius: 6,
    padding: 12,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  noUserText: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  loginForm: {
    gap: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  loginButton: {
    backgroundColor: colors.primary[500],
    borderRadius: 6,
    padding: 12,
    alignItems: 'center',
  },
  loginButtonDisabled: {
    opacity: 0.5,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  testAccount: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  accountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  accountRole: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  accountDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  accountCredentials: {
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    padding: 8,
    marginBottom: 8,
  },
  credentialText: {
    fontSize: 12,
    color: '#374151',
    fontFamily: 'monospace',
  },
  testLoginButton: {
    borderRadius: 6,
    padding: 12,
    alignItems: 'center',
  },
  testLoginButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  guideStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary[500],
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 24,
    marginRight: 12,
  },
  stepText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
});
