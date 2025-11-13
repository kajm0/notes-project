import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { 
  Search, Plus, Edit2, Trash2, Share2, Link2, 
  LogOut, Sparkles, Lock, Users, Globe, Copy, X, Check
} from 'lucide-react';
import { FaLock, FaGlobe, FaStickyNote } from 'react-icons/fa';
import api from '../lib/api';
import { useNotesStore, useAuthStore } from '../lib/store';
import toast from 'react-hot-toast';

interface Note {
  id: string;
  ownerId: string;
  title: string;
  contentMd: string;
  visibility: 'PRIVATE' | 'SHARED' | 'PUBLIC';
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export function NotesPage() {
  const { notes, setNotes } = useNotesStore();
  const { logout, user } = useAuthStore();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const previousNotesRef = useRef<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState<string | null>(null);
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  const [showEditor, setShowEditor] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState<'PRIVATE' | 'PUBLIC'>('PRIVATE');
  const [tags, setTags] = useState('');
  
  const [showShare, setShowShare] = useState(false);
  const [shareNoteId, setShareNoteId] = useState('');
  const [shareEmail, setShareEmail] = useState('');
  const [publicLink, setPublicLink] = useState('');
  const [publicLinkId, setPublicLinkId] = useState('');
  const [copied, setCopied] = useState(false);
  const [confirmPrivateDialog, setConfirmPrivateDialog] = useState(false);
  const [sharedUsersCount, setSharedUsersCount] = useState(0);
  const [pendingVisibilityChange, setPendingVisibilityChange] = useState<'PRIVATE' | 'PUBLIC' | null>(null);

  const loadNotes = useCallback(async (showLoading = true) => {
    // Ne montrer le loading que lors du chargement initial ou manuel
    if (showLoading) {
      setLoading(true);
    }
    
    try {
      const params: any = { page, size: 9 };
      if (searchQuery) params.query = searchQuery;
      if (visibilityFilter) params.visibility = visibilityFilter;
      if (tagFilter) params.tag = tagFilter;
      
      const { data } = await api.get('/api/notes', { params });
      const newNotes = data.content || [];
      const newNotesJson = JSON.stringify(newNotes);
      
      // Comparer les notes pour détecter les changements
      const notesChanged = previousNotesRef.current !== newNotesJson;
      
      // Ne mettre à jour visuellement que s'il y a des changements
      if (notesChanged) {
        setNotes(newNotes);
        previousNotesRef.current = newNotesJson;
      }
      
      setTotalPages(data.totalPages || 1);
      
      // Marquer que le chargement initial est terminé
      if (isInitialLoad) {
        setIsInitialLoad(false);
      }
    } catch (error: any) {
      // Ne pas afficher d'erreur si c'est un problème d'authentification
      // (l'intercepteur va déconnecter automatiquement)
      const status = error.response?.status;
      if (status !== 401 && status !== 403) {
        toast.error('❌ Échec du chargement des notes');
      }
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, [searchQuery, visibilityFilter, tagFilter, page, isInitialLoad, setNotes]);

  useEffect(() => {
    loadNotes(true); // Chargement initial avec loading
  }, [searchQuery, visibilityFilter, tagFilter, page]);

  // Rafraîchissement automatique en continu (toutes les 200ms)
  useEffect(() => {
    // Ne pas démarrer le rafraîchissement si on est en train d'éditer ou de partager
    if (showEditor || showShare || isInitialLoad) {
      return;
    }

    const intervalId = setInterval(() => {
      // Rafraîchir silencieusement (sans loading) pour éviter les re-renders visuels
      loadNotes(false);
    }, 200); // 200ms pour un rafraîchissement quasi-instantané

    // Nettoyer l'intervalle quand le composant est démonté ou quand les conditions changent
    return () => clearInterval(intervalId);
  }, [showEditor, showShare, isInitialLoad, loadNotes]);

  const openEditor = (note?: Note) => {
    if (note) {
      setEditingNote(note);
      setTitle(note.title);
      setContent(note.contentMd);
      // Si la note est SHARED, on la met en PRIVATE (la visibilité SHARED est gérée automatiquement par le partage)
      setVisibility(note.visibility === 'SHARED' ? 'PRIVATE' : note.visibility === 'PUBLIC' ? 'PUBLIC' : 'PRIVATE');
      setTags(note.tags.join(', '));
    } else {
      setEditingNote(null);
      setTitle('');
      setContent('');
      setVisibility('PRIVATE');
      setTags('');
    }
    setShowEditor(true);
  };

  const closeEditor = () => {
    setShowEditor(false);
    setEditingNote(null);
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error('Le titre et le contenu sont obligatoires');
      return;
    }

    // Si on passe d'une note SHARED à PRIVATE, vérifier les partages actifs
    if (editingNote && editingNote.visibility === 'SHARED' && visibility === 'PRIVATE') {
      try {
        const { data: count } = await api.get(`/api/notes/${editingNote.id}/share/count`);
        if (count > 0) {
          setSharedUsersCount(count);
          setPendingVisibilityChange('PRIVATE');
          setConfirmPrivateDialog(true);
          return;
        }
      } catch (error) {
        // Si erreur, continuer quand même
      }
    }

    await performSave();
  };

  const performSave = async () => {
    try {
      const payload = {
        title,
        contentMd: content,
        visibility: pendingVisibilityChange || visibility,
        tags: tags.split(',').map(t => t.trim()).filter(t => t)
      };

      if (editingNote) {
        await api.put(`/api/notes/${editingNote.id}`, payload);
        toast.success('✓ Note mise à jour avec succès');
      } else {
        await api.post('/api/notes', payload);
        toast.success('✓ Note créée avec succès');
      }

      setConfirmPrivateDialog(false);
      setPendingVisibilityChange(null);
      closeEditor();
      loadNotes();
    } catch (error: any) {
      const message = error.response?.data?.message;
      if (message && !message.includes('Backend error')) {
        toast.error(message);
      } else {
        toast.error('❌ Échec de l\'enregistrement de la note');
      }
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette note ?')) return;

    try {
      await api.delete(`/api/notes/${id}`);
      toast.success('✅ Note supprimée avec succès');
      loadNotes();
    } catch (error: any) {
      const message = error.response?.data?.message;
      if (message && !message.includes('Backend error')) {
        toast.error(message);
      } else {
        toast.error('❌ Échec de la suppression');
      }
    }
  };

  const openShareModal = (noteId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setShareNoteId(noteId);
    setShareEmail('');
    setPublicLink('');
    setPublicLinkId('');
    setCopied(false);
    setShowShare(true);
  };

  const handleShareWithUser = async () => {
    if (!shareEmail.trim()) {
      toast.error('⚠️ Veuillez entrer une adresse email valide');
      return;
    }

    try {
      await api.post(`/api/notes/${shareNoteId}/share/user`, { email: shareEmail });
      toast.success(`✅ Note partagée avec succès avec ${shareEmail}`);
      setShareEmail('');
      setShowShare(false);
      loadNotes(); // Recharger pour voir les changements
    } catch (error: any) {
      const message = error.response?.data?.message;
      
      // Le backend envoie déjà des messages francisés et clairs avec ❌
      if (message && !message.includes('Backend error')) {
        toast.error(message);
      } else {
        toast.error('❌ Échec du partage de la note');
      }
    }
  };

  const handleCreatePublicLink = async () => {
    try {
      const { data } = await api.post(`/api/notes/${shareNoteId}/share/public`);
      const fullUrl = `${window.location.origin}/p/${data.urlToken}`;
      setPublicLink(fullUrl);
      setPublicLinkId(data.id);
      toast.success('✅ Lien public créé avec succès !');
      loadNotes(); // Recharger pour mettre à jour la visibilité
    } catch (error: any) {
      const message = error.response?.data?.message;
      
      if (message && !message.includes('Backend error')) {
        toast.error(message);
      } else {
        toast.error('❌ Échec de la création du lien public');
      }
    }
  };

  const handleRevokePublicLink = async () => {
    if (!confirm('Êtes-vous sûr de vouloir révoquer ce lien public ?')) return;
    
    try {
      await api.delete(`/api/notes/public-links/${publicLinkId}`);
      setPublicLink('');
      setPublicLinkId('');
      toast.success('✅ Lien public révoqué avec succès');
      loadNotes(); // Recharger pour mettre à jour la visibilité
    } catch (error: any) {
      const message = error.response?.data?.message;
      if (message && !message.includes('Backend error')) {
        toast.error(message);
      } else {
        toast.error('❌ Échec de la révocation du lien');
      }
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(publicLink);
    setCopied(true);
    toast.success('✓ Lien copié !');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <nav className="navbar">
        <div className="navbar-content">
          <div className="navbar-brand">
            <Sparkles size={24} color="#6366f1" />
            My Notes
          </div>
          <div className="navbar-user">
            <span className="user-email">{user?.email || 'User'}</span>
            <button className="btn btn-secondary btn-sm" onClick={() => { logout(); navigate('/login'); }}>
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container">
        <div className="notes-header">
          <div className="search-container">
            <div className="search-wrapper">
              <Search className="search-icon" size={20} />
              <input 
                type="text" 
                className="search-input" 
                placeholder="Rechercher des notes par titre ou contenu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="btn btn-primary" onClick={() => openEditor()}>
              <Plus size={18} />
              Nouvelle Note
            </button>
          </div>

          <div className="filters">
            <button
              className={`filter-chip ${visibilityFilter === null ? 'active' : ''}`}
              onClick={() => setVisibilityFilter(null)}
            >
              Toutes les Notes
            </button>
            <button
              className={`filter-chip ${visibilityFilter === 'PRIVATE' ? 'active' : ''}`}
              onClick={() => setVisibilityFilter('PRIVATE')}
            >
              <Lock size={14} />
              Privées
            </button>
            <button
              className={`filter-chip ${visibilityFilter === 'SHARED' ? 'active' : ''}`}
              onClick={() => setVisibilityFilter('SHARED')}
            >
              <Users size={14} />
              Partagées
            </button>
            <button
              className={`filter-chip ${visibilityFilter === 'PUBLIC' ? 'active' : ''}`}
              onClick={() => setVisibilityFilter('PUBLIC')}
            >
              <Globe size={14} />
              Publiques
            </button>
            {tagFilter && (
              <button
                className="filter-chip active"
                onClick={() => setTagFilter(null)}
                style={{ background: '#6366f1', color: '#fff' }}
              >
                #{tagFilter}
                <X size={14} style={{ marginLeft: '4px' }} />
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="notes-grid">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="note-card">
                <div className="skeleton" style={{ height: '24px', width: '70%', marginBottom: '12px' }}></div>
                <div className="skeleton" style={{ height: '80px', marginBottom: '12px' }}></div>
                <div className="skeleton" style={{ height: '20px', width: '50%' }}></div>
              </div>
            ))}
          </div>
        ) : notes.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <FaStickyNote size={64} style={{ color: 'var(--text-muted)' }} />
            </div>
            <h2>No notes found</h2>
            <p>
              {searchQuery || visibilityFilter 
                ? 'Try adjusting your search or filters' 
                : 'Create your first note to get started!'}
            </p>
            {!searchQuery && !visibilityFilter && (
              <button 
                className="btn btn-primary" 
                onClick={() => openEditor()}
                style={{ marginTop: '24px' }}
              >
                <Plus size={18} />
                Create Your First Note
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="notes-grid">
              {notes.map((note) => {
                const isOwner = note.ownerId === user?.id;
                const sharedLabel = note.visibility === 'PUBLIC' ? '(Note publique)' : '(Partagée avec vous)';
                return (
                  <div 
                    key={note.id} 
                    className="note-card" 
                    onClick={() => openEditor(note)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="note-card-header">
                      <h3>{note.title}</h3>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        {!isOwner && (
                          <span style={{ 
                            fontSize: '11px', 
                            color: '#94a3b8',
                            fontStyle: 'italic',
                            whiteSpace: 'nowrap'
                          }}>
                            (Lecture seule)
                          </span>
                        )}
                        <span className={`visibility-badge visibility-${note.visibility.toLowerCase()}`}>
                          {note.visibility === 'PRIVATE' && <><Lock size={14} /> Privée</>}
                          {note.visibility === 'SHARED' && <><Users size={14} /> Partagée</>}
                          {note.visibility === 'PUBLIC' && <><Globe size={14} /> Publique</>}
                        </span>
                      </div>
                    </div>
                    
                    <div className="note-content">
                      <ReactMarkdown>{note.contentMd}</ReactMarkdown>
                    </div>
                    
                    {note.tags.length > 0 && (
                      <div className="note-tags">
                        {note.tags.map((tag, idx) => (
                          <span 
                            key={idx} 
                            className={`tag ${tagFilter === tag ? 'tag-active' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setTagFilter(tagFilter === tag ? null : tag);
                              setPage(0);
                            }}
                            style={{ cursor: 'pointer' }}
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <div className="note-actions">
                      {isOwner ? (
                      <>
                        <button 
                          className="btn btn-secondary btn-sm" 
                          onClick={(e) => { e.stopPropagation(); openEditor(note); }}
                        >
                          <Edit2 size={14} />
                          Modifier
                        </button>
                        <button 
                          className="btn btn-secondary btn-sm" 
                          onClick={(e) => openShareModal(note.id, e)}
                        >
                          <Share2 size={14} />
                          Partager
                        </button>
                        <button 
                          className="btn btn-danger btn-sm" 
                          onClick={(e) => handleDelete(note.id, e)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    ) : (
                      <div style={{
                        fontSize: '13px',
                        color: 'var(--text-muted)',
                        fontStyle: 'italic'
                      }}>
                        Accès lecture seule
                      </div>
                    )}
                    </div>
                  </div>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>
                  ← Previous
                </button>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
                  Page {page + 1} of {totalPages}
                </span>
                <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1}>
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {showEditor && (() => {
        const isOwner = !editingNote || editingNote.ownerId === user?.id;
        const isReadOnly = !isOwner;
        return (
          <div className="modal-overlay" onClick={closeEditor}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>
                  {isReadOnly ? 'Voir la Note' : editingNote ? 'Modifier la Note' : 'Créer une Nouvelle Note'}
                  {isReadOnly && (
                    <span style={{ 
                      marginLeft: '12px', 
                      fontSize: '14px', 
                      color: 'var(--text-muted)', 
                      fontWeight: 400 
                    }}>
                      (Lecture seule)
                    </span>
                  )}
                </h2>
                <button 
                  className="btn btn-secondary btn-icon" 
                  onClick={closeEditor}
                  aria-label="Fermer"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="form-group">
                <label className="form-label">Titre</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Donnez un titre à votre note..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  autoFocus={!isReadOnly}
                  disabled={isReadOnly}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Tags (séparés par des virgules)</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="travail, personnel, important"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    disabled={isReadOnly}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Visibilité</label>
                  <div style={{ position: 'relative' }}>
                    <select 
                      className="form-input" 
                      value={visibility}
                      onChange={(e) => setVisibility(e.target.value as any)}
                      style={{ cursor: isReadOnly ? 'default' : 'pointer', paddingLeft: '32px' }}
                      disabled={isReadOnly}
                    >
                      <option value="PRIVATE">Privée</option>
                      <option value="PUBLIC">Publique</option>
                    </select>
                    <div style={{ 
                      position: 'absolute', 
                      left: '12px', 
                      top: '50%', 
                      transform: 'translateY(-50%)',
                      pointerEvents: 'none',
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      {visibility === 'PRIVATE' ? (
                        <FaLock size={14} style={{ color: 'var(--text-secondary)' }} />
                      ) : (
                        <FaGlobe size={14} style={{ color: 'var(--text-secondary)' }} />
                      )}
                    </div>
                  </div>
                  {editingNote && editingNote.visibility === 'SHARED' && (
                    <p style={{ 
                      fontSize: '12px', 
                      color: 'var(--text-muted)', 
                      marginTop: '4px',
                      fontStyle: 'italic'
                    }}>
                      Note partagée avec des utilisateurs (utilisez le bouton "Partager" pour gérer)
                    </p>
                  )}
                </div>
              </div>

              <div className="editor-container">
                {isReadOnly ? (
                  <div className="editor-panel" style={{ gridColumn: '1 / -1' }}>
                    <div className="editor-label">
                      <Sparkles size={14} />
                      Contenu
                    </div>
                    <div className="preview-panel">
                      {content ? <ReactMarkdown>{content}</ReactMarkdown> : (
                        <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                          Aucun contenu disponible.
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="editor-panel">
                      <div className="editor-label">
                        <Edit2 size={14} />
                        Éditeur
                      </div>
                      <textarea 
                        className="editor-textarea"
                        placeholder="# Écrivez votre note ici...

Utilisez le **Markdown** pour formater votre texte !

## Exemples :
- **Texte en gras**
- *Texte en italique*
- [Liens](https://exemple.com)
- Listes et plus encore !"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                      />
                    </div>

                    <div className="editor-panel">
                      <div className="editor-label">
                        <Sparkles size={14} />
                        Aperçu
                      </div>
                      <div className="preview-panel">
                        {content ? <ReactMarkdown>{content}</ReactMarkdown> : (
                          <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                            Votre note formatée apparaîtra ici...
                          </p>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                {isReadOnly ? (
                  <button className="btn btn-primary" onClick={closeEditor}>
                    Fermer
                  </button>
                ) : (
                  <>
                    <button className="btn btn-secondary" onClick={closeEditor}>
                      Annuler
                    </button>
                    <button className="btn btn-primary" onClick={handleSave}>
                      {editingNote ? 'Mettre à jour' : 'Créer la Note'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Dialogue de confirmation pour passage SHARED → PRIVATE */}
      {confirmPrivateDialog && (
        <div className="modal-overlay" onClick={() => setConfirmPrivateDialog(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '20px' 
            }}>
              <h2 style={{ margin: 0, color: 'var(--text-primary)' }}>
                Confirmer le changement de visibilité
              </h2>
              <button 
                className="btn btn-secondary btn-icon" 
                onClick={() => {
                  setConfirmPrivateDialog(false);
                  setPendingVisibilityChange(null);
                }}
                aria-label="Fermer"
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <p style={{ 
                color: 'var(--text-primary)', 
                marginBottom: '16px',
                fontSize: '15px',
                lineHeight: '1.6'
              }}>
                Cette note est actuellement partagée avec <strong>{sharedUsersCount} utilisateur{sharedUsersCount > 1 ? 's' : ''}</strong>.
              </p>
              <p style={{ 
                color: 'var(--text-secondary)', 
                marginBottom: '16px',
                fontSize: '14px',
                lineHeight: '1.5'
              }}>
                En rendant cette note privée, tous les partages seront automatiquement révoqués et ces utilisateurs perdront l'accès à cette note.
              </p>
              <div style={{ 
                backgroundColor: 'var(--bg-tertiary)', 
                padding: '12px', 
                borderRadius: '8px',
                border: '1px solid var(--border-color)'
              }}>
                <p style={{ 
                  color: 'var(--warning)', 
                  margin: 0,
                  fontSize: '13px',
                  fontWeight: 500
                }}>
                  ⚠️ Cette action est irréversible.
                </p>
              </div>
            </div>

            <div style={{ 
              display: 'flex', 
              gap: '12px', 
              justifyContent: 'flex-end' 
            }}>
              <button 
                className="btn btn-secondary" 
                onClick={() => {
                  setConfirmPrivateDialog(false);
                  setPendingVisibilityChange(null);
                }}
              >
                Annuler
              </button>
              <button 
                className="btn btn-danger" 
                onClick={performSave}
              >
                Confirmer et rendre privée
              </button>
            </div>
          </div>
        </div>
      )}

      {showShare && (
        <div className="modal-overlay" onClick={() => setShowShare(false)}>
          <div className="modal share-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2 style={{ marginBottom: '4px' }}>Partager la Note</h2>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 400, margin: 0 }}>
                  Collaborez et partagez avec d'autres
                </p>
              </div>
              <button 
                className="btn btn-secondary btn-icon" 
                onClick={() => setShowShare(false)}
                aria-label="Fermer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Share with User Section */}
            <div className="share-section-card">
              <div className="share-section-icon">
                <Users size={24} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ marginBottom: '12px' }}>
                  <h3 style={{ 
                    fontSize: '16px', 
                    fontWeight: 600, 
                    margin: '0 0 4px 0', 
                    color: 'var(--text-primary)' 
                  }}>
                    Partager avec un Utilisateur Spécifique
                  </h3>
                  <p style={{ 
                    fontSize: '13px', 
                    color: 'var(--text-muted)', 
                    margin: 0 
                  }}>
                    Donnez un accès en lecture seule par email
                  </p>
                </div>

                <div className="input-group">
                  <input 
                    type="email" 
                    className="form-input" 
                    placeholder="Entrez l'adresse email (ex: collegue@exemple.com)"
                    value={shareEmail}
                    onChange={(e) => setShareEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleShareWithUser()}
                  />
                  <button 
                    className="btn btn-primary" 
                    onClick={handleShareWithUser}
                    disabled={!shareEmail.trim()}
                  >
                    <Share2 size={16} />
                    Partager
                  </button>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div style={{ 
              height: '1px', 
              background: 'var(--border-color)', 
              margin: '24px 0' 
            }}></div>

            {/* Public Link Section */}
            <div className="share-section-card">
              <div className="share-section-icon">
                <Globe size={24} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ marginBottom: '12px' }}>
                  <h3 style={{ 
                    fontSize: '16px', 
                    fontWeight: 600, 
                    margin: '0 0 4px 0', 
                    color: 'var(--text-primary)' 
                  }}>
                    Lien Public
                  </h3>
                  <p style={{ 
                    fontSize: '13px', 
                    color: 'var(--text-muted)', 
                    margin: 0 
                  }}>
                    N'importe qui avec ce lien peut voir la note
                  </p>
                </div>
                
                {publicLink ? (
                  <div>
                    <div className="link-display">
                      <input
                        type="text"
                        value={publicLink}
                        readOnly
                        onClick={(e) => (e.target as HTMLInputElement).select()}
                        style={{ 
                          fontSize: '13px',
                          fontFamily: 'monospace',
                          color: 'var(--primary)'
                        }}
                      />
                      <button 
                        className={`btn ${copied ? 'btn-success' : 'btn-primary'} btn-icon`}
                        onClick={copyToClipboard}
                        aria-label="Copier le lien"
                        title={copied ? 'Copié !' : 'Copier dans le presse-papier'}
                      >
                        {copied ? <Check size={18} /> : <Copy size={18} />}
                      </button>
                    </div>
                    {copied && (
                      <p style={{ 
                        fontSize: '13px', 
                        color: 'var(--success)', 
                        marginTop: '8px', 
                        fontWeight: 500 
                      }}>
                        ✓ Lien copié dans le presse-papier !
                      </p>
                    )}
                    <button 
                      className="btn btn-danger btn-sm"
                      onClick={handleRevokePublicLink}
                      style={{ marginTop: '12px', width: '100%' }}
                    >
                      <Trash2 size={14} />
                      Révoquer le Lien Public
                    </button>
                  </div>
                ) : (
                  <button 
                    className="btn btn-secondary" 
                    onClick={handleCreatePublicLink} 
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    <Link2 size={16} />
                    Générer un Lien Public
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
