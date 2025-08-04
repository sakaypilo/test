import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

// Stores
import { useAuthStore } from './src/stores/authStore';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import CamerasScreen from './src/screens/CamerasScreen';
import IncidentsScreen from './src/screens/IncidentsScreen';
import NewIncidentScreen from './src/screens/NewIncidentScreen';
import PersonsScreen from './src/screens/PersonsScreen';
import ReportsScreen from './src/screens/ReportsScreen';
import ProfileScreen from './src/screens/ProfileScreen';

// Theme
import { theme } from './src/theme/theme';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Incidents') {
            iconName = focused ? 'warning' : 'warning-outline';
          } else if (route.name === 'Cameras') {
            iconName = focused ? 'videocam' : 'videocam-outline';
          } else if (route.name === 'Persons') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen} 
        options={{ tabBarLabel: 'Accueil' }}
      />
      <Tab.Screen 
        name="Incidents" 
        component={IncidentsScreen} 
        options={{ tabBarLabel: 'Incidents' }}
      />
      <Tab.Screen 
        name="Cameras" 
        component={CamerasScreen} 
        options={{ tabBarLabel: 'Caméras' }}
      />
      <Tab.Screen 
        name="Persons" 
        component={PersonsScreen} 
        options={{ tabBarLabel: 'Personnes' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ tabBarLabel: 'Profil' }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const { isAuthenticated, initialize, isInitialized } = useAuthStore();

  useEffect(() => {
    initialize();
  }, []);

  if (!isInitialized) {
    return null; // Ou un écran de chargement
  }

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!isAuthenticated ? (
            <Stack.Screen name="Login" component={LoginScreen} />
          ) : (
            <>
              <Stack.Screen name="Main" component={MainTabs} />
              <Stack.Screen 
                name="NewIncident" 
                component={NewIncidentScreen}
                options={{ 
                  headerShown: true,
                  title: 'Nouvel Incident',
                  headerStyle: { backgroundColor: theme.colors.primary },
                  headerTintColor: 'white'
                }}
              />
              <Stack.Screen 
                name="Reports" 
                component={ReportsScreen}
                options={{ 
                  headerShown: true,
                  title: 'Rapports',
                  headerStyle: { backgroundColor: theme.colors.primary },
                  headerTintColor: 'white'
                }}
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}