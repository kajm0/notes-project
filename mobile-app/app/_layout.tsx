import { Stack } from 'expo-router';
import { PaperProvider, MD3DarkTheme, configureFonts } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';

const theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#6366f1',
    secondary: '#8b5cf6',
    background: '#0f172a',
    surface: '#1e293b',
    surfaceVariant: '#334155',
  },
};

export default function RootLayout() {
  return (
    <PaperProvider theme={theme}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.surface,
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="notes" options={{ headerShown: false }} />
        <Stack.Screen name="note/[id]" options={{ title: 'Détails de la Note' }} />
        <Stack.Screen name="note/edit" options={{ title: 'Modifier la Note' }} />
      </Stack>
    </PaperProvider>
  );
}

