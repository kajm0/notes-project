import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import api from '../lib/api';
import { useNotesStore, useAuthStore } from '../lib/store';
import toast from 'react-hot-toast';

export function Notes() {
  const { notes, setNotes, deleteNote: removeNote } = useNotesStore();
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const { data } = await api.get('/api/notes');
      setNotes(data.content || data);
    } catch (error) {
      toast.error('Failed to load notes');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/api/notes/${editingId}`, { title, contentMd: content, visibility: 'PRIVATE', tags: [] });
        toast.success('Note updated');
      } else {
        await api.post('/api/notes', { title, contentMd: content, visibility: 'PRIVATE', tags: [] });
        toast.success('Note created');
      }
      setTitle('');
      setContent('');
      setEditingId(null);
      loadNotes();
    } catch (error) {
      toast.error('Failed to save note');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this note?')) {
      try {
        await api.delete(`/api/notes/${id}`);
        removeNote(id);
        toast.success('Note deleted');
      } catch (error) {
        toast.error('Failed to delete note');
      }
    }
  };

  const handleEdit = (note: any) => {
    setEditingId(note.id);
    setTitle(note.title);
    setContent(note.contentMd);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>My Notes</h1>
        <button onClick={() => { logout(); navigate('/login'); }}>Logout</button>
      </div>

      <form onSubmit={handleSubmit} style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ccc' }}>
        <h2>{editingId ? 'Edit Note' : 'Create Note'}</h2>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
        />
        <textarea
          placeholder="Content (Markdown supported)"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={6}
          style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
        />
        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="submit">{editingId ? 'Update' : 'Create'}</button>
          {editingId && <button type="button" onClick={() => { setEditingId(null); setTitle(''); setContent(''); }}>Cancel</button>}
        </div>
        {content && (
          <div style={{ marginTop: '10px', padding: '10px', border: '1px solid #eee' }}>
            <h4>Preview:</h4>
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        )}
      </form>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {notes.map((note) => (
          <div key={note.id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '4px' }}>
            <h3>{note.title}</h3>
            <div style={{ maxHeight: '150px', overflow: 'hidden', marginBottom: '10px' }}>
              <ReactMarkdown>{note.contentMd}</ReactMarkdown>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button onClick={() => handleEdit(note)}>Edit</button>
              <button onClick={() => handleDelete(note.id)} style={{ background: '#f44336', color: 'white' }}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

