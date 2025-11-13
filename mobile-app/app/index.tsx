import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useStore } from '../lib/store';

export default function Index() {
  const router = useRouter();
  const { loadAuth } = useStore();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      await loadAuth();
      const { user, updatePendingOperationsCount } = useStore.getState();
      
      // Mettre à jour le compteur d'opérations en attente au démarrage
      await updatePendingOperationsCount();
      
      // Redirect based on auth status
      if (user) {
        router.replace('/notes');
      } else {
        router.replace('/login');
      }
    } catch (error) {
      // On error, redirect to login
      router.replace('/login');
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' }}>
      <ActivityIndicator size="large" color="#6366f1" />
    </View>
  );
}

