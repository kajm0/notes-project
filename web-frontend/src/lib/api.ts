import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_BFF_URL || 'http://localhost:4000';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { data, status } = error.response;
      
      // Déconnexion automatique si token invalide/expiré
      if (status === 401 || (status === 403 && data?.message === 'Backend error')) {
        console.warn('🔓 Session expirée - déconnexion automatique');
        localStorage.clear(); // Nettoyer tout le localStorage
        window.location.href = '/login';
        return Promise.reject(error);
      }
      
      // Ne pas afficher de toast pour les erreurs gérées manuellement
      // (ex: erreurs de validation dans les formulaires)
      if (!error.config?.skipToast) {
        switch (status) {
          case 400:
            if (data.code === 'VALIDATION_ERROR' && data.details) {
              const fieldErrors = Object.entries(data.details)
                .map(([field, message]) => `${field}: ${message}`)
                .join(', ');
              console.error('Erreurs de validation:', fieldErrors);
            }
            break;
          
          case 403:
            // Ne pas afficher de toast, les composants gèrent leurs propres messages
            break;
          
          case 404:
            // Ne pas afficher de toast, les composants gèrent leurs propres messages
            break;
          
          case 500:
            toast.error('❌ Erreur serveur. Veuillez réessayer plus tard.');
            break;
            
          default:
            if (data?.message && !data.message.includes('Backend error')) {
              console.error('Erreur API:', data.message);
            }
        }
      }
    } else if (error.request) {
      toast.error('❌ Impossible de joindre le serveur. Vérifiez votre connexion.');
    }
    
    return Promise.reject(error);
  }
);

export default api;
