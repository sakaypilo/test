import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { useAuthStore } from '@/stores/auth';
import { apiService } from '@/services/api';
import Card from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import { DashboardStats } from '@/types';
import { Camera, Wifi, WifiOff, TriangleAlert as AlertTriangle, Calendar, Users, MapPin } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const isTablet = width > 768;

export default function DashboardScreen() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboardData = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const response = await apiService.getDashboardStats();
      
      if (response.success && response.data) {
        setStats(response.data);
      } else {
        setError(response.message || 'Erreur lors du chargement des données');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur Laravel');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const onRefresh = () => {
    loadDashboardData(true);
  };

  if (isLoading && !stats) {
    return <LoadingSpinner message="Chargement du tableau de bord..." />;
  }

  if (error && !stats) {
    return (
      <ErrorMessage 
        message={error} 
        onRetry={() => loadDashboardData()} 
      />
    );
  }

  const StatCard = ({ icon, title, value, subtitle, color = '#00A550' }: {
    icon: React.ReactNode;
    title: string;
    value: string | number;
    subtitle?: string;
    color?: string;
  }) => (
    <Card style={styles.statCard}>
      <View style={styles.statHeader}>
        <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
          {icon}
        </View>
        <View style={styles.statInfo}>
          <Text style={[styles.statValue, { color }]}>{value}</Text>
          <Text style={styles.statTitle}>{title}</Text>
          {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
        </View>
      </View>
    </Card>
  );

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.welcomeText}>
          Bonjour, {user?.prenom} {user?.nom}
        </Text>
        <Text style={styles.roleText}>
          {user?.role === 'agent' ? 'Agent de Sécurité' : 'Technicien'}
        </Text>
        <Text style={styles.dateText}>
          {new Date().toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Text>
      </View>

      {stats && (
        <>
          <View style={styles.statsGrid}>
            <StatCard
              icon={<Camera size={24} color="#00A550" />}
              title="Total Caméras"
              value={stats.camerasTotal}
              subtitle="Système de surveillance"
            />
            
            <StatCard
              icon={<Wifi size={24} color="#10b981" />}
              title="En Ligne"
              value={stats.camerasEnLigne}
              subtitle="Fonctionnelles"
              color="#10b981"
            />
            
            <StatCard
              icon={<WifiOff size={24} color="#dc2626" />}
              title="Hors Ligne"
              value={stats.camerasHorsLigne}
              subtitle="Nécessitent intervention"
              color="#dc2626"
            />
            
            <StatCard
              icon={<AlertTriangle size={24} color="#f59e0b" />}
              title="Incidents"
              value={stats.incidentsDuMois}
              subtitle="Ce mois-ci"
              color="#f59e0b"
            />
            
            <StatCard
              icon={<Calendar size={24} color="#8b5cf6" />}
              title="Total Incidents"
              value={stats.incidentsTotal}
              subtitle="Depuis le début"
              color="#8b5cf6"
            />
            
            <StatCard
              icon={<Users size={24} color="#00A550" />}
              title="Interpellations"
              value={stats.efaTratraTotal}
              subtitle="Personnes appréhendées"
              color="#00A550"
            />
          </View>

          {stats.zonesRisque.length > 0 && (
            <Card style={styles.riskZonesCard}>
              <Text style={styles.sectionTitle}>Zones à Risque</Text>
              <Text style={styles.sectionSubtitle}>
                Zones avec le plus d'incidents ce mois
              </Text>
              
              {stats.zonesRisque.slice(0, 5).map((zone, index) => (
                <View key={zone.zone} style={styles.riskZoneItem}>
                  <View style={styles.riskZoneHeader}>
                    <MapPin size={20} color="#dc2626" />
                    <Text style={styles.riskZoneName}>{zone.zone}</Text>
                  </View>
                  <View style={styles.riskZoneIncidents}>
                    <Text style={styles.incidentCount}>{zone.incidents}</Text>
                    <Text style={styles.incidentLabel}>incidents</Text>
                  </View>
                </View>
              ))}
            </Card>
          )}
        </>
      )}

      <Card style={styles.quickActionsCard}>
        <Text style={styles.sectionTitle}>Actions Rapides</Text>
        
        {user?.role === 'agent' && (
          <View style={styles.quickAction}>
            <AlertTriangle size={20} color="#f59e0b" />
            <Text style={styles.quickActionText}>Signaler un incident</Text>
          </View>
        )}
        
        {user?.role === 'technicien' && (
          <View style={styles.quickAction}>
            <Camera size={20} color="#00A550" />
            <Text style={styles.quickActionText}>Ajouter une caméra</Text>
          </View>
        )}

        <View style={styles.quickAction}>
          <Users size={20} color="#00A550" />
          <Text style={styles.quickActionText}>Nouvelle Interpellation</Text>
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#00A550', // primary.500
    padding: isTablet ? 30 : 20,
    paddingTop: isTablet ? 60 : 50,
  },
  welcomeText: {
    fontSize: isTablet ? 28 : 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  roleText: {
    fontSize: isTablet ? 18 : 16,
    color: '#dcfce7', // primary.100
    marginTop: 4,
  },
  dateText: {
    fontSize: isTablet ? 16 : 14,
    color: '#bbf7d0', // primary.200
    marginTop: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
    gap: 15,
  },
  statCard: {
    width: isTablet ? (width - 60) / 3 - 10 : (width - 50) / 2 - 7.5,
    padding: 16,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: isTablet ? 28 : 24,
    fontWeight: 'bold',
  },
  statTitle: {
    fontSize: isTablet ? 16 : 14,
    color: '#374151',
    marginTop: 2,
  },
  statSubtitle: {
    fontSize: isTablet ? 14 : 12,
    color: '#64748b',
    marginTop: 2,
  },
  riskZonesCard: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: isTablet ? 20 : 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: isTablet ? 16 : 14,
    color: '#64748b',
    marginBottom: 20,
  },
  riskZoneItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  riskZoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  riskZoneName: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 10,
  },
  riskZoneIncidents: {
    alignItems: 'center',
  },
  incidentCount: {
    fontSize: isTablet ? 20 : 18,
    fontWeight: 'bold',
    color: '#dc2626',
  },
  incidentLabel: {
    fontSize: isTablet ? 12 : 10,
    color: '#64748b',
  },
  quickActionsCard: {
    marginHorizontal: 20,
    marginBottom: 30,
  },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  quickActionText: {
    fontSize: isTablet ? 16 : 14,
    color: '#374151',
    marginLeft: 12,
    fontWeight: '500',
  },
});