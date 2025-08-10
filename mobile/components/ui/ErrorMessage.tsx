import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TriangleAlert as AlertTriangle } from 'lucide-react-native';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <View style={styles.container}>
      <AlertTriangle size={48} color="#dc2626" />
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <Text style={styles.retryText} onPress={onRetry}>
          Réessayer
        </Text>
      )}
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
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  retryText: {
    fontSize: 16,
    color: '#1e40af',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});