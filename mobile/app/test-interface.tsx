import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { useAuthStore } from '@/stores/auth';
import { 
  User, 
  Trash2, 
  Home, 
  Settings,
  CheckCircle,
  XCircle,
  ArrowRight
} from 'lucide-react-native';
import { colors } from '@/theme/colors';

export default function TestInterfaceScreen() {
  const { user } = useAuthStore();

  const getRoleDisplayName = (role: string): string => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'Administrateur';
      case 'responsable':
        return 'Responsable Sécurité';
      case 'agent':
        return 'Agent de Sécurité';
      case 'technicien':
        return 'Technicien';
      default:
        return 'Utilisateur';
    }
  };

  const getRoleColor = (role: string): string => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return '#dc2626';
      case 'responsable':
        return '#ea580c';
      case 'agent':
        return '#2563eb';
      case 'technicien':
        return '#16a34a';
      default:
        return '#6b7280';
    }
  };

  const testItems = [
    {
      title: 'Dashboard',
      description: 'Vérifier l\'affichage du rôle et le bouton corbeille',
      route: '/(tabs)/dashboard',
      icon: <Home size={20} color="#fff" />,
      shouldShowTrash: user && ['admin', 'responsable'].includes(user.role),
    },
    {
      title: 'Profil',
      description: 'Vérifier l\'affichage du rôle et l\'accès corbeille',
      route: '/(tabs)/profile',
      icon: <User size={20} color="#fff" />,
      shouldShowTrash: user && ['admin', 'responsable'].includes(user.role),
    },
    {
      title: 'Incidents',
      description: 'Vérifier les boutons de suppression et corbeille',
      route: '/(tabs)/incidents',
      icon: <Settings size={20} color="#fff" />,
      shouldShowTrash: user && ['admin', 'responsable'].includes(user.role),
    },
    {
      title: 'Corbeille',
      description: 'Accès direct à la corbeille',
      route: '/simple-trash',
      icon: <Trash2 size={20} color="#fff" />,
      shouldShowTrash: true,
      requiresPermission: true,
    },
  ];

  const handleNavigate = (route: string, requiresPermission?: boolean) => {
    if (requiresPermission && user && !['admin', 'responsable'].includes(user.role)) {
      Alert.alert(
        'Accès Refusé',
        'Vous n\'avez pas les permissions pour accéder à cette section.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    router.push(route as any);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Test Interface' }} />
      
      <ScrollView style={styles.content}>
        {/* Statut utilisateur */}
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
              
              <Text style={styles.roleDisplay}>
                Rôle affiché : {getRoleDisplayName(user.role)}
              </Text>
              
              <View style={styles.permissionsInfo}>
                <Text style={styles.permissionsTitle}>Permissions :</Text>
                <View style={styles.permissionItem}>
                  {['admin', 'responsable'].includes(user.role) ? (
                    <CheckCircle size={16} color="#10b981" />
                  ) : (
                    <XCircle size={16} color="#ef4444" />
                  )}
                  <Text style={styles.permissionText}>Accès à la corbeille</Text>
                </View>
                <View style={styles.permissionItem}>
                  {user.role === 'admin' ? (
                    <CheckCircle size={16} color="#10b981" />
                  ) : (
                    <XCircle size={16} color="#ef4444" />
                  )}
                  <Text style={styles.permissionText}>Suppression de tous les incidents</Text>
                </View>
              </View>
            </View>
          ) : (
            <Text style={styles.noUserText}>Aucun utilisateur connecté</Text>
          )}
        </View>

        {/* Tests d'interface */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🧪 Tests d'Interface</Text>
          
          {testItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.testItem}
              onPress={() => handleNavigate(item.route, item.requiresPermission)}
            >
              <View style={styles.testHeader}>
                <View style={[styles.testIcon, { backgroundColor: colors.primary[500] }]}>
                  {item.icon}
                </View>
                <View style={styles.testContent}>
                  <Text style={styles.testTitle}>{item.title}</Text>
                  <Text style={styles.testDescription}>{item.description}</Text>
                </View>
                <ArrowRight size={20} color="#6b7280" />
              </View>
              
              <View style={styles.testExpectations}>
                <Text style={styles.expectationTitle}>À vérifier :</Text>
                <View style={styles.expectationItem}>
                  <Text style={styles.expectationText}>
                    • Rôle affiché : {getRoleDisplayName(user?.role || '')}
                  </Text>
                </View>
                {item.shouldShowTrash && (
                  <View style={styles.expectationItem}>
                    <CheckCircle size={14} color="#10b981" />
                    <Text style={styles.expectationText}>Bouton corbeille visible</Text>
                  </View>
                )}
                {!item.shouldShowTrash && (
                  <View style={styles.expectationItem}>
                    <XCircle size={14} color="#ef4444" />
                    <Text style={styles.expectationText}>Pas de bouton corbeille</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Guide de test */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Guide de Test</Text>
          
          <View style={styles.guideStep}>
            <Text style={styles.stepNumber}>1</Text>
            <Text style={styles.stepText}>
              Connectez-vous avec différents rôles (admin, responsable, agent)
            </Text>
          </View>
          
          <View style={styles.guideStep}>
            <Text style={styles.stepNumber}>2</Text>
            <Text style={styles.stepText}>
              Vérifiez que le rôle s'affiche correctement dans chaque section
            </Text>
          </View>
          
          <View style={styles.guideStep}>
            <Text style={styles.stepNumber}>3</Text>
            <Text style={styles.stepText}>
              Testez l'accès à la corbeille selon les permissions
            </Text>
          </View>
          
          <View style={styles.guideStep}>
            <Text style={styles.stepNumber}>4</Text>
            <Text style={styles.stepText}>
              Vérifiez les boutons de suppression dans la liste des incidents
            </Text>
          </View>
        </View>

        {/* Raccourcis rapides */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Raccourcis Rapides</Text>
          
          <View style={styles.shortcutsGrid}>
            <TouchableOpacity 
              style={styles.shortcutButton}
              onPress={() => router.push('/test-roles')}
            >
              <Text style={styles.shortcutText}>🔐 Test Rôles</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.shortcutButton}
              onPress={() => router.push('/test-permissions')}
            >
              <Text style={styles.shortcutText}>🛡️ Test Permissions</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.shortcutButton}
              onPress={() => router.push('/debug-user')}
            >
              <Text style={styles.shortcutText}>🐛 Debug User</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.shortcutButton}
              onPress={() => router.push('/simple-trash')}
            >
              <Text style={styles.shortcutText}>🗑️ Corbeille</Text>
            </TouchableOpacity>
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
  roleDisplay: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 12,
  },
  permissionsInfo: {
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
    padding: 12,
  },
  permissionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  permissionText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
  },
  noUserText: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  testItem: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  testHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  testIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  testContent: {
    flex: 1,
  },
  testTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  testDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  testExpectations: {
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
    padding: 12,
  },
  expectationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  expectationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  expectationText: {
    fontSize: 13,
    color: '#6b7280',
    marginLeft: 8,
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
  shortcutsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  shortcutButton: {
    backgroundColor: colors.primary[500],
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minWidth: '48%',
    alignItems: 'center',
  },
  shortcutText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
