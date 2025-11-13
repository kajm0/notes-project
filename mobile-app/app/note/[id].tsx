import { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Share as RNShare } from 'react-native';
import { Text, Chip, FAB, Portal, Dialog, Button, TextInput } from 'react-native-paper';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Markdown from 'react-native-markdown-display';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useStore } from '../../lib/store';
import api from '../../lib/api';
import { offlineQueue } from '../../lib/offlineQueue';
import { Note } from '../../types';

export default function NoteDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { notes, deleteNote: deleteNoteFromStore, user, isOffline, updatePendingOperationsCount } = useStore();
  
  const [note, setNote] = useState<Note | null>(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [shareDialog, setShareDialog] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [sharing, setSharing] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);

  useEffect(() => {
    loadNote();
  }, [id]);

  const loadNote = async () => {
    // First try to find in local state
    const localNote = notes.find(n => n.id === id);
    if (localNote) {
      setNote(localNote);
      return;
    }

    // Otherwise fetch from API
    try {
      const { data } = await api.get<Note>(`/notes/${id}`);
      setNote(data);
    } catch (error) {
      // Erreur silencieuse lors du chargement
    }
  };

  const handleDelete = async () => {
    if (!note) return;
    
    setDeleting(true);
    try {
      // Si offline, mettre en queue
      if (isOffline) {
        await offlineQueue.enqueueOperation({
          type: 'DELETE',
          endpoint: `/notes/${note.id}`,
          method: 'DELETE',
          noteId: note.id,
        });
        
        // Supprimer localement pour l'UI
        deleteNoteFromStore(note.id);
        await updatePendingOperationsCount();
        
        Alert.alert(
          'Note supprimée localement',
          'La suppression sera synchronisée automatiquement à la reconnexion.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
        return;
      }

      // Si online, exécuter directement
      await api.delete(`/notes/${note.id}`);
      deleteNoteFromStore(note.id);
      router.back();
    } catch (error: any) {
      // Si erreur réseau, essayer de mettre en queue
      if (!error.response && isOffline) {
        await offlineQueue.enqueueOperation({
          type: 'DELETE',
          endpoint: `/notes/${note.id}`,
          method: 'DELETE',
          noteId: note.id,
        });
        deleteNoteFromStore(note.id);
        await updatePendingOperationsCount();
        Alert.alert(
          'Note supprimée localement',
          'La suppression sera synchronisée automatiquement à la reconnexion.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
        return;
      }
      
      Alert.alert('Erreur', 'Échec de la suppression de la note');
    } finally {
      setDeleting(false);
      setDeleteDialog(false);
    }
  };

  const handleShareWithUser = async () => {
    if (!note || !shareEmail.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer une adresse email');
      return;
    }

    setSharing(true);
    try {
      await api.post(`/notes/${note.id}/share/user`, { email: shareEmail.trim() });
      Alert.alert('Succès', `Note partagée avec ${shareEmail}`);
      setShareEmail('');
      setShareDialog(false);
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || 'Échec du partage de la note');
    } finally {
      setSharing(false);
    }
  };

  const handleGeneratePublicLink = async () => {
    if (!note) return;

    try {
      const { data } = await api.post<{ urlToken: string }>(`/notes/${note.id}/share/public`);
      const publicUrl = `http://localhost:3000/p/${data.urlToken}`;
      
      // Share via native share dialog
      try {
        await RNShare.share({
          message: `Découvrez ma note : ${note.title}\n\n${publicUrl}`,
          title: note.title,
        });
      } catch (shareError) {
        // User cancelled share, copy to clipboard instead
        Alert.alert('Lien Public', publicUrl, [
          { text: 'OK', style: 'default' }
        ]);
      }
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || 'Échec de la génération du lien public');
    }
  };

  if (!note) {
    return (
      <View style={styles.container}>
        <Text>Chargement...</Text>
      </View>
    );
  }

  const isOwner = note.ownerId === user?.id;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.title}>
            {note.title}
          </Text>
          
          <View style={styles.meta}>
            <Chip 
              mode="outlined" 
              compact 
              style={styles.visibilityChip}
              icon={() => (
                <FontAwesome5 
                  name={
                    note.visibility === 'PRIVATE' ? 'lock' : 
                    note.visibility === 'SHARED' ? 'users' : 
                    'globe'
                  } 
                  size={12} 
                  color="#94a3b8" 
                />
              )}
            >
              {note.visibility === 'PRIVATE' && 'Privée'}
              {note.visibility === 'SHARED' && 'Partagée'}
              {note.visibility === 'PUBLIC' && 'Publique'}
            </Chip>
            
            {!isOwner && (
              <Chip mode="outlined" compact style={styles.readOnlyChip}>
                Lecture seule
              </Chip>
            )}
          </View>

          {note.tags.length > 0 && (
            <View style={styles.tags}>
              {note.tags.map((tag, idx) => (
                <Chip key={idx} compact style={styles.tag}>
                  #{tag}
                </Chip>
              ))}
            </View>
          )}

          <View style={styles.dates}>
            <Text variant="bodySmall" style={styles.dateText}>
              Créé le : {format(new Date(note.createdAt), 'd MMM yyyy', { locale: fr })}
            </Text>
            <Text variant="bodySmall" style={styles.dateText}>
              Modifié le : {format(new Date(note.updatedAt), 'd MMM yyyy', { locale: fr })}
            </Text>
          </View>
        </View>

        <View style={styles.markdownContainer}>
          <Markdown
            style={{
              body: { color: '#e2e8f0' },
              heading1: { color: '#fff', fontSize: 28, fontWeight: 'bold', marginBottom: 12 },
              heading2: { color: '#fff', fontSize: 24, fontWeight: '600', marginBottom: 10 },
              heading3: { color: '#fff', fontSize: 20, fontWeight: '600', marginBottom: 8 },
              paragraph: { color: '#cbd5e1', fontSize: 16, lineHeight: 24, marginBottom: 10 },
              listItemBullet: { color: '#6366f1' },
              listItemNumber: { color: '#6366f1' },
              code_inline: { backgroundColor: '#334155', color: '#f472b6', paddingHorizontal: 4, borderRadius: 4 },
              code_block: { backgroundColor: '#1e293b', padding: 12, borderRadius: 8, marginVertical: 8 },
              strong: { fontWeight: 'bold', color: '#fff' },
              em: { fontStyle: 'italic' },
              link: { color: '#6366f1' },
            }}
          >
            {note.contentMd}
          </Markdown>
        </View>
      </ScrollView>

      {isOwner && (
        <Portal>
          <FAB.Group
            open={fabOpen}
            visible
            icon={fabOpen ? 'close' : 'pencil'}
            onStateChange={({ open }) => setFabOpen(open)}
            actions={[
              {
                icon: 'pencil',
                label: 'Modifier',
                onPress: () => {
                  setFabOpen(false);
                  router.push(`/note/edit?id=${note.id}`);
                },
              },
              {
                icon: 'share-variant',
                label: 'Partager',
                onPress: () => {
                  setFabOpen(false);
                  setShareDialog(true);
                },
                color: '#6366f1',
              },
              {
                icon: 'link',
                label: 'Lien Public',
                onPress: () => {
                  setFabOpen(false);
                  handleGeneratePublicLink();
                },
                color: '#22c55e',
              },
              {
                icon: 'delete',
                label: 'Supprimer',
                onPress: () => {
                  setFabOpen(false);
                  setDeleteDialog(true);
                },
                color: '#ef4444',
              },
            ]}
            fabStyle={styles.fab}
          />

          {/* Delete Dialog */}
          <Dialog visible={deleteDialog} onDismiss={() => setDeleteDialog(false)}>
            <Dialog.Title>Supprimer la Note</Dialog.Title>
            <Dialog.Content>
              <Text>Êtes-vous sûr de vouloir supprimer "{note.title}" ? Cette action est irréversible.</Text>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setDeleteDialog(false)}>Annuler</Button>
              <Button onPress={handleDelete} loading={deleting}>Supprimer</Button>
            </Dialog.Actions>
          </Dialog>

          {/* Share Dialog */}
          <Dialog visible={shareDialog} onDismiss={() => setShareDialog(false)}>
            <Dialog.Title>Partager la Note</Dialog.Title>
            <Dialog.Content>
              <Text variant="bodyMedium" style={{ marginBottom: 16, color: '#94a3b8' }}>
                Partager cette note avec un autre utilisateur par email
              </Text>
              <TextInput
                label="Adresse Email"
                value={shareEmail}
                onChangeText={setShareEmail}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="collegue@exemple.com"
                style={{ backgroundColor: '#1e293b' }}
              />
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => { setShareDialog(false); setShareEmail(''); }}>
                Annuler
              </Button>
              <Button onPress={handleShareWithUser} loading={sharing} disabled={!shareEmail.trim()}>
                Partager
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 12,
  },
  meta: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  visibilityChip: {
    backgroundColor: '#1e293b',
  },
  readOnlyChip: {
    backgroundColor: '#334155',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  tag: {
    backgroundColor: '#334155',
  },
  dates: {
    gap: 4,
  },
  dateText: {
    color: '#64748b',
  },
  markdownContainer: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
  },
  fab: {
    backgroundColor: '#6366f1',
  },
});

