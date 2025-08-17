import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { useAuthStore } from '@/stores/auth';
import { apiService } from '@/services/api';
import CameraListItem from '@/components/lists/CameraListItem';
import PersonneListItem from '@/components/lists/PersonneListItem';
import IncidentListItem from '@/components/lists/IncidentListItem';
import { 
  Video, 
  Users, 
  AlertTriangle,
  Plus,
  RefreshCw,
  Trash2,
  CheckCircle,
  XCircle
} from 'lucide-react-native';
import { colors } from '@/theme/colors';

export default function TestSuppressionsCompletesScreen() {
  const { user } = useAuthStore();
  const [incidents, setIncidents] = useState<any[]>([]);
  const [cameras, setCameras] = useState<any[]>([]);
  const [personnes, setPersonnes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'incidents' | 'cameras' | 'personnes'>('incidents');

  const loadData = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const [incidentsRes, camerasRes, personnesRes] = await Promise.all([
        apiService.getIncidents(),
        apiService.getCameras(),
        apiService.getEfaTratra(),
      ]);

      if (incidentsRes.success && incidentsRes.data) {
        setIncidents(incidentsRes.data);
      }

      if (camerasRes.success && camerasRes.data) {
        setCameras(camerasRes.data);
      }

      if (personnesRes.success && personnesRes.data) {
        setPersonnes(personnesRes.data);
      }
    } catch (err) {
      console.error('Erreur chargement:', err);
      Alert.alert('Erreur', 'Erreur lors du chargement des données');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    loadData(true);
  };

  const createTestIncident = async () => {
    try {
      const response = await apiService.createIncident({
        dateIncident: new Date(),
        type: 'Test Suppression',
        description: `Test incident créé à ${new Date().toLocaleTimeString()}`,
        zone: 'Zone Test',
        emplacement: 'Test',
        agent: user?.nom || 'Test',
        photos: [],
        temoins: [],
        mesuresPrises: 'Test',
        statut: 'en_cours' as const,
        latitude: -18.1569,
        longitude: 49.4085,
        personnesImpliquees: [],
      });

      if (response.success) {
        Alert.alert('Succès', 'Incident de test créé !');
        loadData();
      } else {
        Alert.alert('Erreur', response.message || 'Erreur lors de la création');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Erreur de connexion');
    }
  };

  const createTestCamera = async () => {
    try {
      const response = await apiService.createCamera({
        numero: `TEST-${Date.now()}`,
        zone: 'Zone Test',
        emplacement: 'Test Suppression',
        ip: '192.168.1.100',
        statut: 'actif' as const,
        dateInstallation: new Date(),
        latitude: -18.1569,
        longitude: 49.4085,
      });

      if (response.success) {
        Alert.alert('Succès', 'Caméra de test créée !');
        loadData();
      } else {
        Alert.alert('Erreur', response.message || 'Erreur lors de la création');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Erreur de connexion');
    }
  };

  const createTestPersonne = async () => {
    try {
      const response = await apiService.addPersonne({
        nom: 'Test',
        prenom: `Personne${Date.now()}`,
        CIN: `TEST${Date.now()}`,
        statut: 'libre',
        faitAssocie: 'Test de suppression',
      });

      if (response.success) {
        Alert.alert('Succès', 'Personne de test créée !');
        loadData();
      } else {
        Alert.alert('Erreur', response.message || 'Erreur lors de la création');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Erreur de connexion');
    }
  };

  const getPermissions = () => {
    if (!user) return { canDeleteIncidents: false, canDeleteCameras: false, canDeletePersonnes: false };

    return {
      canDeleteIncidents: ['admin', 'responsable', 'agent'].includes(user.role),
      canDeleteCameras: ['admin', 'responsable', 'technicien'].includes(user.role),
      canDeletePersonnes: ['admin', 'responsable', 'agent'].includes(user.role),
    };
  };

  const permissions = getPermissions();

  const renderTabContent = () => {
    switch (activeTab) {
      case 'incidents':
        return (
          <View>
            <View style={styles.tabHeader}>
              <Text style={styles.tabTitle}>
                📋 Incidents ({incidents.length})
              </Text>
              <TouchableOpacity style={styles.createButton} onPress={createTestIncident}>
                <Plus size={16} color="#fff" />
                <Text style={styles.createButtonText}>Créer Test</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.permissionInfo}>
              {permissions.canDeleteIncidents ? (
                <View style={styles.permissionItem}>
                  <CheckCircle size={16} color="#10b981" />
                  <Text style={styles.permissionText}>Vous pouvez supprimer des incidents</Text>
                </View>
              ) : (
                <View style={styles.permissionItem}>
                  <XCircle size={16} color="#ef4444" />
                  <Text style={styles.permissionText}>Vous ne pouvez pas supprimer d'incidents</Text>
                </View>
              )}
            </View>

            {incidents.length > 0 ? (
              incidents.map((incident, index) => (
                <IncidentListItem
                  key={index}
                  incident={incident}
                  onRefresh={loadData}
                />
              ))
            ) : (
              <Text style={styles.emptyText}>Aucun incident</Text>
            )}
          </View>
        );

      case 'cameras':
        return (
          <View>
            <View style={styles.tabHeader}>
              <Text style={styles.tabTitle}>
                📹 Caméras ({cameras.length})
              </Text>
              <TouchableOpacity style={styles.createButton} onPress={createTestCamera}>
                <Plus size={16} color="#fff" />
                <Text style={styles.createButtonText}>Créer Test</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.permissionInfo}>
              {permissions.canDeleteCameras ? (
                <View style={styles.permissionItem}>
                  <CheckCircle size={16} color="#10b981" />
                  <Text style={styles.permissionText}>Vous pouvez supprimer des caméras</Text>
                </View>
              ) : (
                <View style={styles.permissionItem}>
                  <XCircle size={16} color="#ef4444" />
                  <Text style={styles.permissionText}>Vous ne pouvez pas supprimer de caméras</Text>
                </View>
              )}
            </View>

            {cameras.length > 0 ? (
              cameras.map((camera, index) => (
                <CameraListItem
                  key={index}
                  camera={camera}
                  onRefresh={loadData}
                />
              ))
            ) : (
              <Text style={styles.emptyText}>Aucune caméra</Text>
            )}
          </View>
        );

      case 'personnes':
        return (
          <View>
            <View style={styles.tabHeader}>
              <Text style={styles.tabTitle}>
                👥 Personnes ({personnes.length})
              </Text>
              <TouchableOpacity style={styles.createButton} onPress={createTestPersonne}>
                <Plus size={16} color="#fff" />
                <Text style={styles.createButtonText}>Créer Test</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.permissionInfo}>
              {permissions.canDeletePersonnes ? (
                <View style={styles.permissionItem}>
                  <CheckCircle size={16} color="#10b981" />
                  <Text style={styles.permissionText}>Vous pouvez supprimer des personnes</Text>
                </View>
              ) : (
                <View style={styles.permissionItem}>
                  <XCircle size={16} color="#ef4444" />
                  <Text style={styles.permissionText}>Vous ne pouvez pas supprimer de personnes</Text>
                </View>
              )}
            </View>

            {personnes.length > 0 ? (
              personnes.map((personne, index) => (
                <PersonneListItem
                  key={index}
                  personne={personne}
                  onRefresh={loadData}
                />
              ))
            ) : (
              <Text style={styles.emptyText}>Aucune personne</Text>
            )}
          </View>
        );
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Test Suppressions Complètes' }} />
      
      {/* En-tête avec utilisateur */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Test Suppressions Complètes</Text>
        <Text style={styles.headerSubtitle}>
          {user?.prenom} {user?.nom} ({user?.role})
        </Text>
      </View>

      {/* Onglets */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'incidents' && styles.activeTab]}
          onPress={() => setActiveTab('incidents')}
        >
          <AlertTriangle size={20} color={activeTab === 'incidents' ? '#fff' : '#6b7280'} />
          <Text style={[styles.tabText, activeTab === 'incidents' && styles.activeTabText]}>
            Incidents
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'cameras' && styles.activeTab]}
          onPress={() => setActiveTab('cameras')}
        >
          <Video size={20} color={activeTab === 'cameras' ? '#fff' : '#6b7280'} />
          <Text style={[styles.tabText, activeTab === 'cameras' && styles.activeTabText]}>
            Caméras
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'personnes' && styles.activeTab]}
          onPress={() => setActiveTab('personnes')}
        >
          <Users size={20} color={activeTab === 'personnes' ? '#fff' : '#6b7280'} />
          <Text style={[styles.tabText, activeTab === 'personnes' && styles.activeTabText]}>
            Personnes
          </Text>
        </TouchableOpacity>
      </View>

      {/* Contenu */}
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {isLoading ? (
          <Text style={styles.loadingText}>Chargement...</Text>
        ) : (
          renderTabContent()
        )}

        {/* Actions rapides */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Actions Rapides</Text>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/simple-trash')}
          >
            <Trash2 size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Voir la Corbeille</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={onRefresh}
          >
            <RefreshCw size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Rafraîchir Tout</Text>
          </TouchableOpacity>
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
  header: {
    backgroundColor: colors.primary[500],
    padding: 16,
    paddingTop: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: '#fff',
  },
  activeTab: {
    backgroundColor: colors.primary[500],
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginLeft: 8,
  },
  activeTabText: {
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  tabHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tabTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary[500],
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  permissionInfo: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  permissionText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
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
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary[500],
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  loadingText: {
    textAlign: 'center',
    color: '#6b7280',
    fontStyle: 'italic',
    marginTop: 50,
  },
  emptyText: {
    textAlign: 'center',
    color: '#6b7280',
    fontStyle: 'italic',
    marginTop: 20,
  },
});
