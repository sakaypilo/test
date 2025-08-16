import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '@/stores/auth';
import { apiService } from '@/services/api';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import ErrorMessage from '@/components/ui/ErrorMessage';
import {
  User,
  Mail,
  Phone,
  Badge,
  Calendar,
  Settings,
  LogOut,
  Shield,
  Download,
  Camera
} from 'lucide-react-native';

const { width } = Dimensions.get('window');
const isTablet = width > 768;

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Déconnexion', 
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.logout();
            } catch (error) {
              console.error('Erreur lors de la déconnexion:', error);
            } finally {
              logout();
              router.replace('/');
            }
          }
        },
      ]
    );
  };

  const handleChangePassword = () => {
    router.push('/(auth)/reset-password');
  };

  const handleDownloadReports = () => {
    Alert.alert(
      'Téléchargement',
      'Fonctionnalité de téléchargement des rapports en cours de développement.',
      [{ text: 'OK' }]
    );
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <ErrorMessage message="Aucun utilisateur connecté" />
      </View>
    );
  }

  const InfoRow = ({ icon, label, value }: {
    icon: React.ReactNode;
    label: string;
    value: string;
  }) => (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>{icon}</View>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mon Profil</Text>
        <Text style={styles.subtitle}>Informations personnelles et paramètres</Text>
      </View>

      <View style={styles.content}>
        <Card style={styles.profileCard}>
          <View style={styles.avatarSection}>
            <View style={styles.avatar}>
              <User size={isTablet ? 48 : 40} color="#ffffff" />
            </View>
            <Text style={styles.userName}>{user.prenom} {user.nom}</Text>
            <Text style={styles.userRole}>
              {user.role === 'agent' ? 'Agent de Sécurité' : 'Technicien'}
            </Text>
          </View>
        </Card>

        <Card style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Informations Personnelles</Text>
          
          <InfoRow
            icon={<Badge size={20} color="#00A550" />}
            label="Matricule"
            value={user.matricule}
          />

          <InfoRow
            icon={<Mail size={20} color="#00A550" />}
            label="Email"
            value={user.email}
          />

          <InfoRow
            icon={<Phone size={20} color="#00A550" />}
            label="Téléphone"
            value={user.telephone}
          />

          <InfoRow
            icon={<Shield size={20} color="#00A550" />}
            label="Rôle"
            value={user.role === 'agent' ? 'Agent de Sécurité' : 'Technicien'}
          />

          {user.lastLogin && (
            <InfoRow
              icon={<Calendar size={20} color="#00A550" />}
              label="Dernière connexion"
              value={new Date(user.lastLogin).toLocaleString('fr-FR')}
            />
          )}
        </Card>

        <Card style={styles.actionsCard}>
          <Text style={styles.sectionTitle}>Actions</Text>
          
          <TouchableOpacity style={styles.actionRow} onPress={handleChangePassword}>
            <View style={styles.actionIcon}>
              <Settings size={20} color="#64748b" />
            </View>
            <Text style={styles.actionText}>Changer le mot de passe</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionRow} onPress={handleDownloadReports}>
            <View style={styles.actionIcon}>
              <Download size={20} color="#64748b" />
            </View>
            <Text style={styles.actionText}>Télécharger mes rapports</Text>
          </TouchableOpacity>
        </Card>

        <Card style={styles.dangerCard}>
          <Text style={styles.dangerTitle}>Zone de Danger</Text>
          <Text style={styles.dangerMessage}>
            La déconnexion effacera toutes les données non synchronisées.
          </Text>
          
          <Button
            title="Se Déconnecter"
            onPress={handleLogout}
            variant="danger"
            style={styles.logoutButton}
          />
        </Card>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            SMMC - Port de Toamasina
          </Text>
          <Text style={styles.versionText}>
            Version 1.0.0 • Département Sécurité et Sûreté
          </Text>
        </View>
      </View>
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
  title: {
    fontSize: isTablet ? 28 : 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: isTablet ? 16 : 14,
    color: '#bbf7d0', // primary.200
    marginTop: 4,
  },
  content: {
    padding: 20,
  },
  profileCard: {
    alignItems: 'center',
    marginBottom: 20,
    padding: 30,
  },
  avatarSection: {
    alignItems: 'center',
  },
  avatar: {
    width: isTablet ? 100 : 80,
    height: isTablet ? 100 : 80,
    borderRadius: isTablet ? 50 : 40,
    backgroundColor: '#00A550', // primary.500
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: isTablet ? 24 : 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  userRole: {
    fontSize: isTablet ? 16 : 14,
    color: '#64748b',
    fontWeight: '500',
  },
  infoCard: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: isTablet ? 20 : 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  infoIcon: {
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: isTablet ? 14 : 12,
    color: '#64748b',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: isTablet ? 16 : 14,
    color: '#1e293b',
    fontWeight: '500',
  },
  actionsCard: {
    marginBottom: 20,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  actionIcon: {
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    fontSize: isTablet ? 16 : 14,
    color: '#374151',
    marginLeft: 12,
    fontWeight: '500',
  },
  dangerCard: {
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#fecaca',
    backgroundColor: '#fef2f2',
  },
  dangerTitle: {
    fontSize: isTablet ? 18 : 16,
    fontWeight: 'bold',
    color: '#dc2626',
    marginBottom: 8,
  },
  dangerMessage: {
    fontSize: isTablet ? 14 : 12,
    color: '#7f1d1d',
    marginBottom: 20,
    lineHeight: 18,
  },
  logoutButton: {
    alignSelf: 'flex-start',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    fontSize: isTablet ? 16 : 14,
    color: '#64748b',
    fontWeight: '600',
  },
  versionText: {
    fontSize: isTablet ? 14 : 12,
    color: '#94a3b8',
    marginTop: 4,
  },
});