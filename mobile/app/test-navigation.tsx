import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { useAuthStore } from '@/stores/auth';
import { Trash2, Home, User, Settings } from 'lucide-react-native';
import { colors } from '@/theme/colors';

export default function TestNavigationScreen() {
  const { user } = useAuthStore();

  const testRoutes = [
    {
      name: 'Dashboard',
      route: '/(tabs)/dashboard',
      icon: <Home size={20} color="#fff" />,
      description: 'Page d\'accueil avec stats',
    },
    {
      name: 'Profil',
      route: '/(tabs)/profile',
      icon: <User size={20} color="#fff" />,
      description: 'Page de profil utilisateur',
    },
    {
      name: 'Incidents',
      route: '/(tabs)/incidents',
      icon: <Settings size={20} color="#fff" />,
      description: 'Liste des incidents',
    },
    {
      name: 'Corbeille',
      route: '/simple-trash',
      icon: <Trash2 size={20} color="#fff" />,
      description: 'Page de la corbeille',
      requiresPermission: true,
    },
    {
      name: 'Test Rôles',
      route: '/test-roles',
      icon: <User size={20} color="#fff" />,
      description: 'Page de test des rôles',
    },
    {
      name: 'Test Interface',
      route: '/test-interface',
      icon: <Settings size={20} color="#fff" />,
      description: 'Page de test de l\'interface',
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

    try {
      console.log(`Navigation vers: ${route}`);
      router.push(route as any);
    } catch (error) {
      console.error('Erreur de navigation:', error);
      Alert.alert(
        'Erreur de Navigation',
        `Impossible de naviguer vers ${route}\nErreur: ${error}`,
        [{ text: 'OK' }]
      );
    }
  };

  const testDirectAccess = () => {
    try {
      router.replace('/simple-trash');
    } catch (error) {
      Alert.alert('Erreur', `Erreur d'accès direct: ${error}`);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Test Navigation' }} />
      
      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🧭 Test de Navigation</Text>
          
          <View style={styles.userInfo}>
            <Text style={styles.userText}>
              Utilisateur: {user?.nom || 'Non connecté'}
            </Text>
            <Text style={styles.userText}>
              Rôle: {user?.role || 'Aucun'}
            </Text>
            <Text style={styles.userText}>
              Permissions corbeille: {user && ['admin', 'responsable'].includes(user.role) ? 'OUI' : 'NON'}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📱 Routes Disponibles</Text>
          
          {testRoutes.map((route, index) => (
            <TouchableOpacity
              key={index}
              style={styles.routeItem}
              onPress={() => handleNavigate(route.route, route.requiresPermission)}
            >
              <View style={[styles.routeIcon, { backgroundColor: colors.primary[500] }]}>
                {route.icon}
              </View>
              <View style={styles.routeContent}>
                <Text style={styles.routeName}>{route.name}</Text>
                <Text style={styles.routeDescription}>{route.description}</Text>
                <Text style={styles.routePath}>Route: {route.route}</Text>
                {route.requiresPermission && (
                  <Text style={styles.permissionNote}>
                    🔒 Nécessite permissions admin/responsable
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🧪 Tests Spéciaux</Text>
          
          <TouchableOpacity 
            style={styles.testButton}
            onPress={testDirectAccess}
          >
            <Text style={styles.testButtonText}>
              🎯 Accès Direct à la Corbeille
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.testButton}
            onPress={() => {
              console.log('État de l\'utilisateur:', user);
              console.log('Permissions:', user && ['admin', 'responsable'].includes(user.role));
              Alert.alert(
                'Debug Info',
                `Utilisateur: ${JSON.stringify(user, null, 2)}`,
                [{ text: 'OK' }]
              );
            }}
          >
            <Text style={styles.testButtonText}>
              🐛 Debug Utilisateur
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.testButton}
            onPress={() => {
              router.back();
            }}
          >
            <Text style={styles.testButtonText}>
              ⬅️ Retour
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Instructions</Text>
          
          <View style={styles.instruction}>
            <Text style={styles.instructionNumber}>1</Text>
            <Text style={styles.instructionText}>
              Testez chaque route pour vérifier qu'elle fonctionne
            </Text>
          </View>
          
          <View style={styles.instruction}>
            <Text style={styles.instructionNumber}>2</Text>
            <Text style={styles.instructionText}>
              Vérifiez que la corbeille nécessite les bonnes permissions
            </Text>
          </View>
          
          <View style={styles.instruction}>
            <Text style={styles.instructionNumber}>3</Text>
            <Text style={styles.instructionText}>
              Si une route ne fonctionne pas, vérifiez la console
            </Text>
          </View>
        </View>
      </View>
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
  userInfo: {
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
    padding: 12,
  },
  userText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  routeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  routeContent: {
    flex: 1,
  },
  routeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  routeDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  routePath: {
    fontSize: 12,
    color: '#9ca3af',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  permissionNote: {
    fontSize: 12,
    color: '#f59e0b',
    fontStyle: 'italic',
  },
  testButton: {
    backgroundColor: colors.primary[500],
    borderRadius: 6,
    padding: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  testButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  instruction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  instructionNumber: {
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
  instructionText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
});
