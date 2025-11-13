import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Auth } from './pages/Auth';
import { NotesPage } from './pages/NotesPage';
import { PublicNote } from './pages/PublicNote';
import { useAuthStore } from './lib/store';
import './styles/global.css';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((state) => state.token);
  return token ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
  return (
    <BrowserRouter>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          className: 'toast-custom',
          style: {
            background: '#ffffff',
            color: '#0f172a',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            padding: '12px 16px',
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
            fontWeight: 500,
          },
          success: {
            iconTheme: {
              primary: '#22c55e',
              secondary: '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#ffffff',
            },
          },
        }}
      />
      <Routes>
        <Route path="/login" element={<Auth />} />
        <Route path="/p/:token" element={<PublicNote />} />
        <Route 
          path="/notes" 
          element={
            <ProtectedRoute>
              <NotesPage />
            </ProtectedRoute>
          } 
        />
        <Route path="/" element={<Navigate to="/notes" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
