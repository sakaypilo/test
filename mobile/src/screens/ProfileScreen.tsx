import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  Avatar,
  List,
  Divider,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../stores/authStore';
import { colors } from '../theme/theme';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Déconnexion', onPress: logout, style: 'destructive' }
      ]
    );
  };

  const getRoleDisplayName = (role: string) => {
    const roleNames: Record<string, string> = {
      admin: 'Administrateur',
      responsable: 'Responsable',
      agent: 'Agent de sécurité',
      technicien: 'Technicien'
    };
    return roleNames[role] || role;
  };

  const getRoleColor = (role: string) => {
    const roleColors: Record<string, string> = {
      admin: colors.error,
      responsable: colors.primary,
      agent: colors.info,
      technicien: colors.success
    };
    return roleColors[role] || colors.textSecondary;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.headerTitle}>
          Profil
        </Text>
      </View>

      {/* User Info Card */}
      <Card style={styles.userCard}>
        <Card.Content style={styles.userContent}>
          <Avatar.Icon 
            size={80} 
            icon="account" 
            style={[styles.avatar, { backgroundColor: getRoleColor(user?.role || '') }]}
          />
          <View style={styles.userInfo}>
            <Text variant="headlineSmall" style={styles.userName}>
              {user?.prenom} {user?.nom}
            </Text>
            <Text variant="bodyMedium" style={styles.userRole}>
              {getRoleDisplayName(user?.role || '')}
            </Text>
            <Text variant="bodySmall" style={styles.userMatricule}>
              Matricule: {user?.matricule}
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Contact Info */}
      <Card style={styles.card}>
        <Card.Title title="Informations de contact" />
        <Card.Content>
          <List.Item
            title="Email"
            description={user?.email}
            left={(props) => <List.Icon {...props} icon="email" />}
          />
          <Divider />
          <List.Item
            title="Téléphone"
            description={user?.telephone || 'Non renseigné'}
            left={(props) => <List.Icon {...props} icon="phone" />}
          />
        </Card.Content>
      </Card>

      {/* App Info */}
      <Card style={styles.card}>
        <Card.Title title="Application" />
        <Card.Content>
          <List.Item
            title="Version"
            description="1.0.0"
            left={(props) => <List.Icon {...props} icon="information" />}
          />
          <Divider />
          <List.Item
            title="Organisation"
            description="SMMC - Port de Toamasina"
            left={(props) => <List.Icon {...props} icon="domain" />}
          />
        </Card.Content>
      </Card>

      {/* Actions */}
      <Card style={styles.card}>
        <Card.Title title="Actions" />
        <Card.Content>
          <Button
            mode="outlined"
            icon="lock-reset"
            onPress={() => {
              Alert.alert(
                'Changer mot de passe',
                'Cette fonctionnalité sera disponible prochainement.'
              );
            }}
            style={styles.actionButton}
          >
            Changer le mot de passe
          </Button>
          
          <Button
            mode="outlined"
            icon="help-circle"
            onPress={() => {
              Alert.alert(
                'Aide',
                'Pour toute assistance, contactez l\'administrateur système.'
              );
            }}
            style={styles.actionButton}
          >
            Aide et support
          </Button>
          
          <Button
            mode="contained"
            icon="logout"
            onPress={handleLogout}
            style={[styles.actionButton, styles.logoutButton]}
            buttonColor={colors.error}
          >
            Se déconnecter
          </Button>
        </Card.Content>
      </Card>

      {/* Footer */}
      <View style={styles.footer}>
        <Text variant="bodySmall" style={styles.footerText}>
          SMMC Security Platform Mobile
        </Text>
        <Text variant="bodySmall" style={styles.footerText}>
          © 2024 Société de Manutention de Madagascar
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.primary,
    padding: 16,
    paddingTop: 50,
  },
  headerTitle: {
    color: 'white',
    fontWeight: 'bold',
  },
  userCard: {
    margin: 16,
    marginTop: -40,
    elevation: 4,
  },
  userContent: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatar: {
    marginBottom: 16,
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userRole: {
    color: colors.textSecondary,
    marginBottom: 8,
  },
  userMatricule: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  card: {
    margin: 16,
    marginTop: 0,
  },
  actionButton: {
    marginBottom: 12,
  },
  logoutButton: {
    marginTop: 8,
  },
  footer: {
    alignItems: 'center',
    padding: 24,
  },
  footerText: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 4,
  },
});