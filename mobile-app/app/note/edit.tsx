import { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { TextInput, Button, SegmentedButtons, Text, Snackbar, Dialog, Portal } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Markdown from 'react-native-markdown-display';
import { FontAwesome5 } from '@expo/vector-icons';
import { useStore } from '../../lib/store';
import api from '../../lib/api';
import { offlineQueue } from '../../lib/offlineQueue';
import { Note } from '../../types';

export default function EditNote() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { notes, addNote, updateNote: updateNoteInStore, isOffline, updatePendingOperationsCount } = useStore();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState<'PRIVATE' | 'PUBLIC'>('PRIVATE');
  const [tags, setTags] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [confirmPrivateDialog, setConfirmPrivateDialog] = useState(false);
  const [sharedUsersCount, setSharedUsersCount] = useState(0);

  useEffect(() => {
    if (id) {
      loadNote();
    }
  }, [id]);

  const loadNote = async () => {
    const localNote = notes.find(n => n.id === id);
    if (localNote) {
      setTitle(localNote.title);
      setContent(localNote.contentMd);
      // Si la note est SHARED, on la met en PRIVATE (la visibilité SHARED est gérée automatiquement par le partage)
      setVisibility(localNote.visibility === 'SHARED' ? 'PRIVATE' : localNote.visibility === 'PUBLIC' ? 'PUBLIC' : 'PRIVATE');
      setTags(localNote.tags.join(', '));
      return;
    }

    try {
      const { data } = await api.get<Note>(`/notes/${id}`);
      setTitle(data.title);
      setContent(data.contentMd);
      // Si la note est SHARED, on la met en PRIVATE (la visibilité SHARED est gérée automatiquement par le partage)
      setVisibility(data.visibility === 'SHARED' ? 'PRIVATE' : data.visibility === 'PUBLIC' ? 'PUBLIC' : 'PRIVATE');
      setTags(data.tags.join(', '));
    } catch (err) {
      // Erreur silencieuse lors du chargement
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      setError('Le titre et le contenu sont obligatoires');
      return;
    }

    // Si on passe d'une note SHARED à PRIVATE, vérifier les partages actifs
    if (id && visibility === 'PRIVATE') {
      const localNote = notes.find(n => n.id === id);
      if (localNote && localNote.visibility === 'SHARED') {
        try {
          const { data: count } = await api.get<number>(`/notes/${id}/share/count`);
          if (count > 0) {
            setSharedUsersCount(count);
            setConfirmPrivateDialog(true);
            return;
          }
        } catch (error) {
          // Si erreur, continuer quand même
        }
      }
    }

    await performSave();
  };

  const performSave = async () => {
    setSaving(true);
    setError('');

    const payload = {
      title: title.trim(),
      contentMd: content.trim(),
      visibility,
      tags: tags.split(',').map(t => t.trim()).filter(t => t),
    };

    try {
      // Si offline, mettre en queue
      if (isOffline) {
        if (id) {
          // UPDATE
          await offlineQueue.enqueueOperation({
            type: 'UPDATE',
            endpoint: `/notes/${id}`,
            method: 'PUT',
            payload,
            noteId: id,
          });
          
          // Mettre à jour localement pour l'UI
          const localNote = notes.find(n => n.id === id);
          if (localNote) {
            updateNoteInStore({
              ...localNote,
              ...payload,
              updatedAt: new Date().toISOString(),
            });
          }
        } else {
          // CREATE
          await offlineQueue.enqueueOperation({
            type: 'CREATE',
            endpoint: '/notes',
            method: 'POST',
            payload,
          });
          
          // Créer une note temporaire locale pour l'UI
          const tempNote: Note = {
            id: `temp_${Date.now()}`,
            title: payload.title,
            contentMd: payload.contentMd,
            visibility: payload.visibility,
            tags: payload.tags,
            ownerId: '',
            ownerEmail: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isReadOnly: false,
          };
          addNote(tempNote);
        }
        
        await updatePendingOperationsCount();
        setError('Note sauvegardée localement. Synchronisation automatique à la reconnexion.');
        setTimeout(() => router.back(), 1500);
        return;
      }

      // Si online, exécuter directement
      if (id) {
        const { data } = await api.put<Note>(`/notes/${id}`, payload);
        updateNoteInStore(data);
      } else {
        const { data } = await api.post<Note>('/notes', payload);
        addNote(data);
      }

      setConfirmPrivateDialog(false);
      router.back();
    } catch (err: any) {
      // Si erreur réseau, essayer de mettre en queue
      if (!err.response && isOffline) {
        // Déjà géré ci-dessus
        return;
      }
      
      const errorMsg = err.response?.data?.message || err.message || 'Échec de l\'enregistrement de la note';
      setError(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TextInput
          label="Titre"
          value={title}
          onChangeText={setTitle}
          mode="outlined"
          style={styles.input}
          placeholder="Entrez le titre de la note..."
        />

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <TextInput
              label="Tags (séparés par des virgules)"
              value={tags}
              onChangeText={setTags}
              mode="outlined"
              style={styles.input}
              placeholder="travail, personnel"
            />
          </View>
          <View style={{ flex: 1 }}>
            <SegmentedButtons
              value={visibility}
              onValueChange={(value) => setVisibility(value as any)}
              buttons={[
                { 
                  value: 'PRIVATE', 
                  label: 'Privée', 
                  icon: () => <FontAwesome5 name="lock" size={14} color={visibility === 'PRIVATE' ? '#fff' : '#94a3b8'} />,
                  style: { minWidth: 100 } 
                },
                { 
                  value: 'PUBLIC', 
                  label: 'Publique', 
                  icon: () => <FontAwesome5 name="globe" size={14} color={visibility === 'PUBLIC' ? '#fff' : '#94a3b8'} />,
                  style: { minWidth: 100 } 
                },
              ]}
            />
            {id && notes.find(n => n.id === id)?.visibility === 'SHARED' && (
              <Text variant="bodySmall" style={{ color: '#94a3b8', marginTop: 4, fontStyle: 'italic' }}>
                Note partagée (gérer via l'écran de détail)
              </Text>
            )}
          </View>
        </View>

        <SegmentedButtons
          value={previewMode ? 'preview' : 'edit'}
          onValueChange={(value) => setPreviewMode(value === 'preview')}
          buttons={[
            { value: 'edit', label: 'Éditer', icon: 'pencil' },
            { value: 'preview', label: 'Aperçu', icon: 'eye' },
          ]}
          style={styles.modeToggle}
        />

        {previewMode ? (
          <View style={styles.preview}>
            <Text variant="labelSmall" style={styles.previewLabel}>
              APERÇU
            </Text>
            <Markdown
              style={{
                body: { color: '#e2e8f0' },
                heading1: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
                heading2: { color: '#fff', fontSize: 20, fontWeight: '600', marginBottom: 8 },
                paragraph: { color: '#cbd5e1', fontSize: 15, lineHeight: 22, marginBottom: 8 },
                code_inline: { backgroundColor: '#334155', color: '#f472b6', paddingHorizontal: 4, borderRadius: 4 },
                code_block: { backgroundColor: '#1e293b', padding: 10, borderRadius: 6, marginVertical: 6 },
              }}
            >
              {content || '*Aucun contenu à prévisualiser*'}
            </Markdown>
          </View>
        ) : (
          <TextInput
            label="Contenu (Markdown supporté)"
            value={content}
            onChangeText={setContent}
            mode="outlined"
            multiline
            numberOfLines={15}
            style={[styles.input, styles.contentInput]}
            placeholder="# Écrivez votre note ici...&#10;&#10;Utilisez le **Markdown** pour formater !&#10;&#10;## Exemples :&#10;- **Texte en gras**&#10;- *Texte en italique*&#10;- [Liens](https://exemple.com)"
          />
        )}

        <Button
          mode="contained"
          onPress={handleSave}
          loading={saving}
          disabled={saving}
          style={styles.button}
          icon="content-save"
        >
          {id ? 'Mettre à Jour' : 'Créer la Note'}
        </Button>
      </ScrollView>

      <Snackbar
        visible={!!error}
        onDismiss={() => setError('')}
        duration={3000}
        action={{
          label: 'OK',
          onPress: () => setError(''),
        }}
      >
        {error}
      </Snackbar>

      <Portal>
        <Dialog 
          visible={confirmPrivateDialog} 
          onDismiss={() => setConfirmPrivateDialog(false)}
        >
          <Dialog.Title>Confirmer le changement de visibilité</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium" style={{ marginBottom: 12, color: '#e2e8f0' }}>
              Cette note est actuellement partagée avec <Text style={{ fontWeight: 'bold' }}>{sharedUsersCount} utilisateur{sharedUsersCount > 1 ? 's' : ''}</Text>.
            </Text>
            <Text variant="bodySmall" style={{ marginBottom: 12, color: '#94a3b8' }}>
              En rendant cette note privée, tous les partages seront automatiquement révoqués et ces utilisateurs perdront l'accès à cette note.
            </Text>
            <View style={{ 
              backgroundColor: '#1e293b', 
              padding: 12, 
              borderRadius: 8,
              borderWidth: 1,
              borderColor: '#f59e0b'
            }}>
              <Text variant="bodySmall" style={{ color: '#f59e0b', fontWeight: '500' }}>
                ⚠️ Cette action est irréversible.
              </Text>
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setConfirmPrivateDialog(false)}>
              Annuler
            </Button>
            <Button 
              onPress={performSave} 
              textColor="#ef4444"
              loading={saving}
            >
              Confirmer
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#1e293b',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  modeToggle: {
    marginBottom: 16,
  },
  contentInput: {
    minHeight: 300,
    textAlignVertical: 'top',
  },
  preview: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    minHeight: 300,
  },
  previewLabel: {
    color: '#64748b',
    marginBottom: 12,
    fontWeight: '600',
  },
  button: {
    marginTop: 8,
    paddingVertical: 8,
  },
});

