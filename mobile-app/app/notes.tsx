import { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, ScrollView } from 'react-native';
import { FAB, Searchbar, Chip, Card, Text, Menu, Appbar } from 'react-native-paper';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useStore } from '../lib/store';
import api from '../lib/api';
import { NotesResponse } from '../types';

export default function Notes() {
  const router = useRouter();
  const { user, logout, notes, setNotes, isOffline, setOffline, saveNotesToCache, loadNotesFromCache, syncPendingOperations, updatePendingOperationsCount, pendingOperationsCount } = useStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState<'ALL' | 'PRIVATE' | 'SHARED' | 'PUBLIC'>('ALL');
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    loadNotes();
  }, [visibilityFilter]);

  const loadNotes = async () => {
    try {
      setOffline(false);
      const params: any = { page: 0, size: 100 };
      if (searchQuery) params.query = searchQuery;
      if (visibilityFilter !== 'ALL') params.visibility = visibilityFilter;

      const { data } = await api.get<NotesResponse>('/notes', { params });
      setNotes(data.content);
      await saveNotesToCache();
      
      // Si on était offline et qu'on vient de se reconnecter, synchroniser la queue
      if (isOffline) {
        await syncPendingOperations();
      }
      
      // Mettre à jour le compteur d'opérations en attente
      await updatePendingOperationsCount();
    } catch (error: any) {
      // Si erreur d'authentification, rediriger vers login
      if (error.response?.status === 401 || error.response?.status === 403) {
        await logout();
        router.replace('/login');
        return;
      }
      
      // Sinon, passer en mode offline
      setOffline(true);
      await loadNotesFromCache();
      await updatePendingOperationsCount();
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadNotes();
    // Synchroniser la queue après le refresh
    if (!isOffline) {
      await syncPendingOperations();
    }
    setRefreshing(false);
  }, [searchQuery, visibilityFilter, isOffline]);

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  const filteredNotes = searchQuery
    ? notes.filter(note => 
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.contentMd.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : notes;

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title={`Bonjour, ${user?.email?.split('@')[0] || 'Utilisateur'}`} />
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={<Appbar.Action icon="dots-vertical" onPress={() => setMenuVisible(true)} />}
        >
          <Menu.Item onPress={handleLogout} title="Déconnexion" leadingIcon="logout" />
        </Menu>
      </Appbar.Header>

      <View style={styles.content}>
        {isOffline && (
          <View style={styles.offlineBanner}>
            <Text variant="labelSmall" style={styles.offlineText}>
              📡 Mode Hors ligne - Affichage des notes en cache
              {pendingOperationsCount > 0 && ` (${pendingOperationsCount} opération${pendingOperationsCount > 1 ? 's' : ''} en attente)`}
            </Text>
          </View>
        )}

        <Searchbar
          placeholder="Rechercher des notes..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}
        >
          <Chip
            selected={visibilityFilter === 'ALL'}
            onPress={() => setVisibilityFilter('ALL')}
            mode={visibilityFilter === 'ALL' ? 'flat' : 'outlined'}
            style={styles.chip}
            textStyle={styles.filterText}
          >
            Toutes
          </Chip>
          <Chip
            selected={visibilityFilter === 'PRIVATE'}
            onPress={() => setVisibilityFilter('PRIVATE')}
            mode={visibilityFilter === 'PRIVATE' ? 'flat' : 'outlined'}
            style={styles.chip}
            textStyle={styles.filterText}
            icon={() => <FontAwesome5 name="lock" size={12} color={visibilityFilter === 'PRIVATE' ? '#fff' : '#6366f1'} />}
          >
            Privées
          </Chip>
          <Chip
            selected={visibilityFilter === 'SHARED'}
            onPress={() => setVisibilityFilter('SHARED')}
            mode={visibilityFilter === 'SHARED' ? 'flat' : 'outlined'}
            style={styles.chip}
            textStyle={styles.filterText}
            icon={() => <FontAwesome5 name="users" size={12} color={visibilityFilter === 'SHARED' ? '#fff' : '#6366f1'} />}
          >
            Partagées
          </Chip>
          <Chip
            selected={visibilityFilter === 'PUBLIC'}
            onPress={() => setVisibilityFilter('PUBLIC')}
            mode={visibilityFilter === 'PUBLIC' ? 'flat' : 'outlined'}
            style={styles.chip}
            textStyle={styles.filterText}
            icon={() => <FontAwesome5 name="globe" size={12} color={visibilityFilter === 'PUBLIC' ? '#fff' : '#6366f1'} />}
          >
            Publiques
          </Chip>
        </ScrollView>

        <FlatList
          data={filteredNotes}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6366f1']} />
          }
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <FontAwesome5 name="sticky-note" size={64} color="#64748b" />
              <Text variant="titleMedium" style={styles.emptyText}>
                Aucune note trouvée
              </Text>
              <Text variant="bodyMedium" style={styles.emptySubtext}>
                Appuyez sur le bouton + pour créer votre première note
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <Card
              style={styles.card}
              onPress={() => router.push(`/note/${item.id}`)}
            >
              <Card.Content>
                <View style={styles.cardHeader}>
                  <Text variant="titleMedium" style={styles.cardTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Chip 
                    compact 
                    mode="outlined" 
                    style={styles.visibilityChip} 
                    icon={() => (
                      <FontAwesome5 
                        name={
                          item.visibility === 'PRIVATE' ? 'lock' : 
                          item.visibility === 'SHARED' ? 'users' : 
                          'globe'
                        } 
                        size={12} 
                        color="#94a3b8" 
                      />
                    )}
                  />
                </View>
                <Text variant="bodyMedium" style={styles.cardContent} numberOfLines={2}>
                  {item.contentMd.replace(/[#*`]/g, '')}
                </Text>
                {item.tags.length > 0 && (
                  <View style={styles.tags}>
                    {item.tags.map((tag, idx) => (
                      <Chip key={idx} compact style={styles.tag} textStyle={styles.tagText}>
                        #{tag}
                      </Chip>
                    ))}
                  </View>
                )}
              </Card.Content>
            </Card>
          )}
        />

        <FAB
          icon="plus"
          style={styles.fab}
          onPress={() => router.push('/note/edit')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  content: {
    flex: 1,
  },
  offlineBanner: {
    backgroundColor: '#f59e0b',
    padding: 8,
    alignItems: 'center',
  },
  offlineText: {
    color: '#fff',
    fontWeight: '600',
  },
  searchbar: {
    margin: 16,
    backgroundColor: '#1e293b',
  },
  filters: {
    flexDirection: 'row',
    paddingLeft: 16,
    paddingRight: 16,
    paddingBottom: 8,
    gap: 8,
  },
  chip: {
    backgroundColor: '#1e293b',
    height: 36,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  list: {
    padding: 16,
    paddingBottom: 80,
  },
  card: {
    marginBottom: 12,
    backgroundColor: '#1e293b',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    flex: 1,
    fontWeight: '600',
    color: '#fff',
  },
  visibilityChip: {
    height: 32,
    minWidth: 42,
  },
  visibilityIcon: {
    fontSize: 18,
    lineHeight: 20,
  },
  cardContent: {
    color: '#94a3b8',
    marginBottom: 8,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  tag: {
    height: 28,
    backgroundColor: '#334155',
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    color: '#fff',
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#94a3b8',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#6366f1',
  },
});

