import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'large';
}

export default function LoadingSpinner({ 
  message = 'Chargement...', 
  size = 'large' 
}: LoadingSpinnerProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color="#00A550" />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  message: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
});