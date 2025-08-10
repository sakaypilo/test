import React from 'react';
import { Tabs } from 'expo-router';
import { Dimensions } from 'react-native';
import { useAuthStore } from '@/stores/auth';
import { ChartBar as BarChart3, Camera, TriangleAlert as AlertTriangle, Users, User } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const isTablet = width > 768;

export default function TabLayout() {
  const { user } = useAuthStore();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#1e40af',
        tabBarInactiveTintColor: '#64748b',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e2e8f0',
          height: isTablet ? 80 : 60,
          paddingBottom: isTablet ? 15 : 5,
          paddingTop: isTablet ? 15 : 5,
        },
        tabBarLabelStyle: {
          fontSize: isTablet ? 14 : 12,
          fontWeight: '600',
        },
        tabBarIconStyle: {
          marginBottom: isTablet ? 5 : 0,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Tableau de Bord',
          tabBarIcon: ({ color, size }) => (
            <BarChart3 size={isTablet ? size + 4 : size} color={color} />
          ),
        }}
      />
      
      {user?.role === 'technicien' && (
        <Tabs.Screen
          name="cameras"
          options={{
            title: 'Caméras',
            tabBarIcon: ({ color, size }) => (
              <Camera size={isTablet ? size + 4 : size} color={color} />
            ),
          }}
        />
      )}
      
      {user?.role === 'agent' && (
        <Tabs.Screen
          name="incidents"
          options={{
            title: 'Incidents',
            tabBarIcon: ({ color, size }) => (
              <AlertTriangle size={isTablet ? size + 4 : size} color={color} />
            ),
          }}
        />
      )}
      
      <Tabs.Screen
        name="efa-tratra"
        options={{
          title: 'Efa Tratra',
          tabBarIcon: ({ color, size }) => (
            <Users size={isTablet ? size + 4 : size} color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => (
            <User size={isTablet ? size + 4 : size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}