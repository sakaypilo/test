import { Stack } from 'expo-router';

export default function IncidentsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="add" />
      <Stack.Screen name="details" />
    </Stack>
  );
}