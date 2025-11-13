import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { Globe, Lock, Calendar, ArrowLeft, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

interface Note {
  id: string;
  title: string;
  contentMd: string;
  visibility: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export function PublicNote() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    loadPublicNote();
  }, [token]);

  const loadPublicNote = async () => {
    try {
      const apiUrl = import.meta.env.VITE_BFF_URL || 'http://localhost:4000';
      const response = await fetch(`${apiUrl}/api/p/${token}`);
      if (!response.ok) throw new Error('Note not found');
      const data = await response.json();
      setNote(data);
    } catch (err) {
      setError(true);
      toast.error('Note introuvable ou lien expiré');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        background: 'var(--bg-secondary)',
        gap: '20px'
      }}>
        <div className="skeleton" style={{ width: '120px', height: '120px', borderRadius: '20px' }}></div>
        <div className="skeleton" style={{ width: '200px', height: '24px' }}></div>
        <div className="skeleton" style={{ width: '300px', height: '16px' }}></div>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div style={{ 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        background: 'var(--bg-secondary)',
        padding: '20px'
      }}>
        <div style={{ 
          background: 'var(--bg-base)',
          padding: '48px',
          borderRadius: '24px',
          textAlign: 'center',
          maxWidth: '480px',
          boxShadow: 'var(--shadow-lg)'
        }}>
          <Lock size={64} color="#cbd5e1" style={{ marginBottom: '24px' }} />
          <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '12px' }}>
            Note Introuvable
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '15px' }}>
            Cette note n'existe pas ou le lien de partage a expiré
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/login')}>
            <ArrowLeft size={18} />
            Aller à la Connexion
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)', padding: '40px 20px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <button 
          className="btn btn-secondary"
          onClick={() => navigate('/login')}
          style={{ marginBottom: '24px' }}
        >
          <ArrowLeft size={16} />
          Retour à l'App
        </button>

        <div style={{ 
          background: 'var(--bg-base)', 
          borderRadius: '24px',
          padding: '48px',
          boxShadow: 'var(--shadow-lg)'
        }}>
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <span className="visibility-badge visibility-public">
                <Globe size={14} />
                Note Publique
              </span>
            </div>

            <h1 style={{ 
              fontSize: '40px', 
              fontWeight: '800', 
              marginBottom: '16px',
              lineHeight: '1.2',
              color: 'var(--text-primary)'
            }}>
              {note.title}
            </h1>

            {note.tags.length > 0 && (
              <div className="note-tags">
                {note.tags.map((tag, idx) => (
                  <span key={idx} className="tag">#{tag}</span>
                ))}
              </div>
            )}
          </div>

          <div style={{ 
            padding: '32px', 
            background: 'var(--bg-secondary)',
            borderRadius: '16px',
            lineHeight: '1.8',
            fontSize: '16px',
            marginBottom: '24px'
          }}>
            <ReactMarkdown>{note.contentMd}</ReactMarkdown>
          </div>

          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            paddingTop: '24px', 
            borderTop: '1px solid var(--border)',
            color: 'var(--text-muted)',
            fontSize: '14px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={16} />
              Créé le {new Date(note.createdAt).toLocaleDateString('fr-FR', { 
                day: 'numeric',
                month: 'long', 
                year: 'numeric' 
              })}
            </div>
            <span>•</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={16} />
              Modifié le {new Date(note.updatedAt).toLocaleDateString('fr-FR', { 
                day: 'numeric',
                month: 'long', 
                year: 'numeric' 
              })}
            </div>
          </div>
        </div>

        <div style={{ 
          textAlign: 'center', 
          marginTop: '40px',
          padding: '32px',
          background: 'var(--bg-base)',
          borderRadius: '20px',
          boxShadow: 'var(--shadow-md)'
        }}>
          <Sparkles size={32} color="#6366f1" style={{ marginBottom: '16px' }} />
          <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>
            Créez Vos Propres Notes
          </h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '14px' }}>
            Rejoignez des milliers d'utilisateurs organisant leurs pensées avec notre app
          </p>
          <button 
            className="btn btn-primary" 
            onClick={() => navigate('/login')}
          >
            Commencer Gratuitement
          </button>
        </div>
      </div>
    </div>
  );
}
