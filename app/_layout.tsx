import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#F9F7F4' },
          headerTintColor: '#1C1C1E',
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: '#F9F7F4' },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="add-item"
          options={{
            title: 'Add Clothing',
            presentation: 'modal',
            headerStyle: { backgroundColor: '#FFFFFF' },
          }}
        />
        <Stack.Screen
          name="outfit-detail"
          options={{
            title: 'Outfit',
            headerStyle: { backgroundColor: '#FFFFFF' },
          }}
        />
      </Stack>
    </>
  );
}
