import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import PhotoUrlTester from '@/components/debug/PhotoUrlTester';

export default function PhotoTesterScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Test des Photos',
          headerShown: true,
        }} 
      />
      <PhotoUrlTester />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
