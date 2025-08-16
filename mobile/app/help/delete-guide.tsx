import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Stack, router } from 'expo-router';
import {
  Trash2,
  RotateCcw,
  Eye,
  AlertTriangle,
  CheckCircle,
  ArrowLeft
} from 'lucide-react-native';
import { colors } from '@/theme/colors';

export default function DeleteGuideScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Guide de Suppression',
          headerShown: true,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color="#000" />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🗑️ Comment Supprimer des Éléments</Text>
          
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Trouver l'élément à supprimer</Text>
              <Text style={styles.stepDescription}>
                Allez dans la liste des incidents, caméras ou personnes
              </Text>
            </View>
          </View>

          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Cliquer sur le bouton rouge</Text>
              <View style={styles.buttonExample}>
                <Trash2 size={16} color="#fff" />
              </View>
              <Text style={styles.stepDescription}>
                Chaque élément a des boutons d'actions à droite
              </Text>
            </View>
          </View>

          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Confirmer la suppression</Text>
              <Text style={styles.stepDescription}>
                Une popup de confirmation apparaîtra. Cliquez sur "Supprimer" pour confirmer.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔄 Restaurer des Éléments</Text>
          
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Accéder à la corbeille</Text>
              <View style={styles.buttonExample}>
                <Trash2 size={16} color="#fff" />
              </View>
              <Text style={styles.stepDescription}>
                Cliquez sur l'icône de corbeille en haut à droite des listes
              </Text>
            </View>
          </View>

          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Restaurer l'élément</Text>
              <View style={styles.buttonExample}>
                <RotateCcw size={16} color="#fff" />
              </View>
              <Text style={styles.stepDescription}>
                Cliquez sur le bouton vert "Restaurer" à côté de l'élément
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔐 Permissions</Text>
          
          <View style={styles.permissionItem}>
            <CheckCircle size={20} color="#10b981" />
            <Text style={styles.permissionText}>
              <Text style={styles.bold}>Admin :</Text> Peut tout supprimer et restaurer
            </Text>
          </View>

          <View style={styles.permissionItem}>
            <CheckCircle size={20} color="#10b981" />
            <Text style={styles.permissionText}>
              <Text style={styles.bold}>Responsable :</Text> Peut supprimer incidents, caméras, personnes
            </Text>
          </View>

          <View style={styles.permissionItem}>
            <CheckCircle size={20} color="#f59e0b" />
            <Text style={styles.permissionText}>
              <Text style={styles.bold}>Agent :</Text> Peut supprimer seulement ses propres incidents
            </Text>
          </View>

          <View style={styles.permissionItem}>
            <AlertTriangle size={20} color="#ef4444" />
            <Text style={styles.permissionText}>
              <Text style={styles.bold}>Technicien :</Text> Ne peut pas supprimer
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💡 Conseils</Text>
          
          <View style={styles.tip}>
            <Text style={styles.tipText}>
              • Les éléments supprimés ne sont pas perdus définitivement
            </Text>
          </View>

          <View style={styles.tip}>
            <Text style={styles.tipText}>
              • Vous pouvez toujours les restaurer depuis la corbeille
            </Text>
          </View>

          <View style={styles.tip}>
            <Text style={styles.tipText}>
              • Seuls les admins peuvent supprimer définitivement
            </Text>
          </View>

          <View style={styles.tip}>
            <Text style={styles.tipText}>
              • Utilisez la fonction de recherche pour retrouver des éléments
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 Actions Disponibles</Text>
          
          <View style={styles.actionItem}>
            <View style={[styles.actionButton, { backgroundColor: colors.primary[500] }]}>
              <Eye size={16} color="#fff" />
            </View>
            <Text style={styles.actionText}>Voir les détails</Text>
          </View>



          <View style={styles.actionItem}>
            <View style={[styles.actionButton, { backgroundColor: '#ef4444' }]}>
              <Trash2 size={16} color="#fff" />
            </View>
            <Text style={styles.actionText}>Supprimer</Text>
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
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  step: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  buttonExample: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  permissionText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 12,
    flex: 1,
  },
  bold: {
    fontWeight: '600',
  },
  tip: {
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionText: {
    fontSize: 14,
    color: '#374151',
  },
});
