import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, UserPlus, Sparkles } from 'lucide-react';
import api from '../lib/api';
import { useAuthStore } from '../lib/store';
import toast from 'react-hot-toast';

export function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
      const { data } = await api.post(endpoint, { email, password });
      setAuth(data.user, data.accessToken);
      toast.success(isRegister ? '🎉 Account created successfully!' : '👋 Welcome back!');
      navigate('/notes');
    } catch (error: any) {
      const message = error.response?.data?.message || 
                     error.response?.data?.details?.email ||
                     error.response?.data?.details?.password ||
                     'Authentication failed. Please check your credentials.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <Sparkles size={28} color="white" />
          </div>
          <h1>Notes App</h1>
          <p className="subtitle">
            {isRegister 
              ? 'Créez votre compte et commencez à organiser vos notes' 
              : 'Bon retour ! Connectez-vous pour continuer'}
          </p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              <Mail size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
              Adresse Email
            </label>
            <input
              type="email"
              className="form-input"
              placeholder="vous@exemple.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              autoComplete="email"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">
              <Lock size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
              Mot de passe
            </label>
            <input
              type="password"
              className="form-input"
              placeholder={isRegister ? 'Min. 6 caractères' : 'Entrez votre mot de passe'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              disabled={loading}
              autoComplete={isRegister ? 'new-password' : 'current-password'}
            />
          </div>
          
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                Traitement...
              </>
            ) : isRegister ? (
              <>
                <UserPlus size={18} />
                Créer un compte
              </>
            ) : (
              <>
                <LogIn size={18} />
                Se connecter
              </>
            )}
          </button>
        </form>
        
        <div className="auth-switch">
          <button onClick={() => setIsRegister(!isRegister)} disabled={loading}>
            {isRegister 
              ? 'Vous avez déjà un compte ? Connectez-vous' 
              : 'Besoin d\'un compte ? Créez-en un gratuitement'}
          </button>
        </div>

        {!isRegister && (
          <div style={{ 
            marginTop: '24px', 
            padding: '16px', 
            background: 'var(--bg-tertiary)', 
            borderRadius: '12px',
            fontSize: '13px',
            color: 'var(--text-secondary)'
          }}>
            <strong style={{ color: 'var(--text-primary)' }}>Compte Démo :</strong><br />
            Email : demo@example.com<br />
            Mot de passe : password123
          </div>
        )}
      </div>
    </div>
  );
}
