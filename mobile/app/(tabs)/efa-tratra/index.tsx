import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { usePersonnesStore } from '@/stores/personnes';
import { apiService } from '@/services/api';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import { Users, Plus, Calendar, User, Phone, MapPin, CircleAlert as AlertCircle } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const isTablet = width > 768;

export default function PersonnesScreen() {
  const {
    personnes,
    setPersonnes,
    setSelectedPersonne,
    isLoading,
    error,
    setLoading,
    setError,
  } = usePersonnesStore();
  
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'tous' | 'en_garde_a_vue' | 'libere' | 'transfere'>('tous');

  const loadPersonnes = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const response = await apiService.getEfaTratra();

      if (response.success && response.data) {
        setPersonnes(response.data);
        console.log('Données personnes chargées:', response.data);
      } else {
        setError(response.message || 'Erreur lors du chargement');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadPersonnes();
  }, []);

  const onRefresh = () => {
    loadPersonnes(true);
  };

  const handlePersonPress = (person: any) => {
    setSelectedPersonne(person);
    const personId = person.idPersonne || person.id;
    router.push(`/(tabs)/efa-tratra/details?id=${personId}`);
  };

  const handleAddPerson = () => {
    router.push('/(tabs)/efa-tratra/add');
  };

  const getFilteredPersons = () => {
    if (filter === 'tous') return personnes;
    // Filtrer par le statut de la dernière interpellation
    return personnes.filter(person => {
      if (!person.interpellations || person.interpellations.length === 0) return false;
      const lastInterpellation = person.interpellations[person.interpellations.length - 1];
      return lastInterpellation.statut === filter;
    });
  };

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'en_garde_a_vue': return '#dc2626';
      case 'libere': return '#10b981';
      case 'transfere': return '#f59e0b';
      default: return '#64748b';
    }
  };

  const getStatusText = (statut: string) => {
    switch (statut) {
      case 'en_garde_a_vue': return 'En garde à vue';
      case 'libere': return 'Libéré';
      case 'transfere': return 'Transféré';
      default: return statut;
    }
  };

  if (isLoading && !personnes.length) {
    return <LoadingSpinner message="Chargement des personnes appréhendées..." />;
  }

  if (error && !personnes.length) {
    return (
      <ErrorMessage
        message={error}
        onRetry={() => loadPersonnes()}
      />
    );
  }

  const filteredPersons = getFilteredPersons();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Interpellations</Text>
        <Text style={styles.subtitle}>
          Personnes appréhendées - {personnes.length} enregistrements
        </Text>
      </View>

      <View style={styles.actions}>
        <Button
          title="Nouvelle Interpellation"
          onPress={handleAddPerson}
          variant="primary"
          style={styles.addButton}
        />
      </View>

      <View style={styles.filters}>
        {(['tous', 'en_garde_a_vue', 'libere', 'transfere'] as const).map((filterOption) => (
          <TouchableOpacity
            key={filterOption}
            style={[
              styles.filterButton,
              filter === filterOption && styles.filterButtonActive,
            ]}
            onPress={() => setFilter(filterOption)}
          >
            <Text
              style={[
                styles.filterText,
                filter === filterOption && styles.filterTextActive,
              ]}
            >
              {filterOption === 'tous' ? 'Tous' : getStatusText(filterOption)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredPersons.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Users size={64} color="#94a3b8" />
            <Text style={styles.emptyTitle}>
              {filter === 'tous' ? 'Aucune personne' : `Aucune personne ${getStatusText(filter).toLowerCase()}`}
            </Text>
            <Text style={styles.emptyMessage}>
              {filter === 'tous'
                ? 'Aucune interpellation enregistrée pour le moment'
                : `Aucune personne avec le statut "${getStatusText(filter).toLowerCase()}" trouvée`
              }
            </Text>
            {filter === 'tous' && (
              <Button
                title="Première interpellation"
                onPress={handleAddPerson}
                variant="primary"
                style={styles.emptyButton}
              />
            )}
          </Card>
        ) : (
          <View style={styles.personsGrid}>
            {filteredPersons.map((person, index) => (
              <TouchableOpacity
                key={person.idPersonne || person.id || index}
                onPress={() => handlePersonPress(person)}
                activeOpacity={0.8}
              >
                <Card style={styles.personCard}>
                  <View style={styles.personHeader}>
                    <View style={styles.avatarContainer}>
                      {person.photo ? (
                        <Image source={{ uri: person.photo }} style={styles.avatar} />
                      ) : (
                        <View style={styles.avatarPlaceholder}>
                          <User size={24} color="#64748b" />
                        </View>
                      )}
                    </View>
                    
                    <View style={styles.personInfo}>
                      <Text style={styles.personName}>
                        {person.prenom} {person.nom}
                      </Text>
                      <Text style={styles.personCIN}>
                        CIN: {person.CIN || 'Non renseigné'}
                      </Text>
                    </View>

                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: `${getStatusColor(person.statut)}15` }
                    ]}>
                      <Text style={[styles.statusText, { color: getStatusColor(person.statut) }]}>
                        {(person.statut || '').toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.personDetails}>
                    <View style={styles.detailRow}>
                      <Calendar size={14} color="#64748b" />
                      <Text style={styles.detailText}>
                        {person.created_at
                          ? `Enregistré le ${new Date(person.created_at).toLocaleDateString('fr-FR')}`
                          : `Appréhendé le ${new Date(person.dateApprehension).toLocaleDateString('fr-FR')}`
                        }
                      </Text>
                    </View>

                    {((person.interpellations && person.interpellations.length > 0) ||
                      (person.faitsAssocies && person.faitsAssocies.length > 0)) && (
                      <View style={styles.detailRow}>
                        <AlertCircle size={14} color="#64748b" />
                        <Text style={styles.detailText}>
                          {person.interpellations
                            ? `${person.interpellations.length} interpellation(s)`
                            : `${person.faitsAssocies.length} fait(s) associé(s)`
                          }
                        </Text>
                      </View>
                    )}
                  </View>
                  
                  {((person.interpellations && person.interpellations.length > 0) ||
                    (person.faitsAssocies && person.faitsAssocies.length > 0)) && (
                    <View style={styles.factsContainer}>
                      <Text style={styles.factsTitle}>
                        {person.interpellations ? 'Dernier fait:' : 'Faits associés:'}
                      </Text>
                      <Text style={styles.factsText} numberOfLines={2}>
                        {person.interpellations
                          ? person.interpellations[person.interpellations.length - 1]?.faitAssocie
                          : person.faitsAssocies?.join(', ')
                        }
                      </Text>
                    </View>
                  )}
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
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
  actions: {
    padding: 20,
    paddingBottom: 10,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filters: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 10,
    gap: 10,
    flexWrap: 'wrap',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  filterButtonActive: {
    backgroundColor: '#00A550', // primary.500
    borderColor: '#00A550', // primary.500
  },
  filterText: {
    fontSize: isTablet ? 14 : 12,
    color: '#64748b',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#ffffff',
  },
  content: {
    flex: 1,
  },
  emptyCard: {
    alignItems: 'center',
    margin: 20,
    padding: 40,
  },
  emptyTitle: {
    fontSize: isTablet ? 20 : 18,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: isTablet ? 16 : 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  emptyButton: {
    paddingHorizontal: 30,
  },
  personsGrid: {
    padding: 20,
    gap: 15,
  },
  personCard: {
    padding: 16,
  },
  personHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarContainer: {
    marginRight: 15,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  personInfo: {
    flex: 1,
  },
  personName: {
    fontSize: isTablet ? 18 : 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  personCIN: {
    fontSize: isTablet ? 14 : 12,
    color: '#64748b',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: isTablet ? 12 : 10,
    fontWeight: '600',
  },
  personDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontSize: isTablet ? 14 : 12,
    color: '#475569',
    marginLeft: 8,
  },
  factsContainer: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  factsTitle: {
    fontSize: isTablet ? 14 : 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  factsText: {
    fontSize: isTablet ? 14 : 12,
    color: '#64748b',
    lineHeight: 18,
  },
});