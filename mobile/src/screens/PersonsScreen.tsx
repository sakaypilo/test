import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
} from 'react-native';
import {
  Text,
  Card,
  Chip,
  FAB,
  Searchbar,
  ActivityIndicator,
  Avatar,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { personnesAPI } from '../services/api';
import { colors } from '../theme/theme';

export default function PersonsScreen() {
  const [persons, setPersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadPersons = async () => {
    try {
      const response = await personnesAPI.getAll();
      if (response.success) {
        setPersons(response.data);
      }
    } catch (error) {
      console.error('Erreur chargement personnes:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadPersons();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadPersons();
  };

  const getStatusColor = (status: string) => {
    return status === 'interne' ? colors.success : colors.warning;
  };

  const filteredPersons = persons.filter((person: any) =>
    person.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
    person.prenom.toLowerCase().includes(searchQuery.toLowerCase()) ||
    person.CIN.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderPerson = ({ item }: { item: any }) => (
    <Card style={styles.personCard}>
      <Card.Content>
        <View style={styles.personHeader}>
          <View style={styles.personInfo}>
            {item.photo ? (
              <Avatar.Image size={48} source={{ uri: item.photo }} />
            ) : (
              <Avatar.Icon size={48} icon="account" />
            )}
            <View style={styles.personDetails}>
              <Text variant="titleMedium" style={styles.personName}>
                {item.prenom} {item.nom}
              </Text>
              <Text variant="bodySmall" style={styles.personCIN}>
                CIN: {item.CIN}
              </Text>
            </View>
          </View>
          <Chip
            mode="outlined"
            textStyle={{ fontSize: 12 }}
            style={[
              styles.statusChip,
              { borderColor: getStatusColor(item.statut) }
            ]}
          >
            {item.statut}
          </Chip>
        </View>
        
        {item.interpellations && item.interpellations.length > 0 && (
          <View style={styles.interpellationsContainer}>
            <Text variant="bodySmall" style={styles.interpellationsTitle}>
              Dernières interpellations:
            </Text>
            {item.interpellations.slice(0, 2).map((interpellation: any) => (
              <View key={interpellation.idInterpellation} style={styles.interpellationItem}>
                <Text variant="bodySmall" style={styles.interpellationDate}>
                  📅 {new Date(interpellation.dateHeure).toLocaleDateString('fr-FR')}
                </Text>
                <Text variant="bodySmall" style={styles.interpellationFait}>
                  {interpellation.faitAssocie}
                </Text>
              </View>
            ))}
            {item.interpellations.length > 2 && (
              <Text variant="bodySmall" style={styles.moreInterpellations}>
                +{item.interpellations.length - 2} autre(s) interpellation(s)
              </Text>
            )}
          </View>
        )}
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Chargement des personnes...</Text>
      </View>
    );
  }

  // Statistiques
  const stats = {
    total: persons.length,
    internes: persons.filter((p: any) => p.statut === 'interne').length,
    externes: persons.filter((p: any) => p.statut === 'externe').length,
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.headerTitle}>
          Personnes
        </Text>
        
        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: 'white' }]}>
              {stats.total}
            </Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.success }]}>
              {stats.internes}
            </Text>
            <Text style={styles.statLabel}>Internes</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.warning }]}>
              {stats.externes}
            </Text>
            <Text style={styles.statLabel}>Externes</Text>
          </View>
        </View>

        <Searchbar
          placeholder="Rechercher une personne..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
      </View>

      <FlatList
        data={filteredPersons}
        renderItem={renderPerson}
        keyExtractor={(item) => item.idPersonne.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Aucune personne trouvée</Text>
          </View>
        }
      />

      <FAB
        icon="account-plus"
        style={styles.fab}
        onPress={() => {
          // Navigation vers écran d'ajout de personne
          // navigation.navigate('NewPerson');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: colors.textSecondary,
  },
  header: {
    backgroundColor: colors.primary,
    padding: 16,
    paddingTop: 50,
  },
  headerTitle: {
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  searchbar: {
    marginBottom: 8,
  },
  listContainer: {
    padding: 16,
  },
  personCard: {
    marginBottom: 12,
  },
  personHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  personInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  personDetails: {
    marginLeft: 12,
    flex: 1,
  },
  personName: {
    fontWeight: 'bold',
  },
  personCIN: {
    color: colors.textSecondary,
    marginTop: 2,
  },
  statusChip: {
    height: 28,
  },
  interpellationsContainer: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
  },
  interpellationsTitle: {
    fontWeight: '500',
    marginBottom: 8,
    color: colors.text,
  },
  interpellationItem: {
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  interpellationDate: {
    color: colors.textSecondary,
    marginBottom: 4,
  },
  interpellationFait: {
    color: colors.text,
    lineHeight: 18,
  },
  moreInterpellations: {
    color: colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: colors.primary,
  },
});