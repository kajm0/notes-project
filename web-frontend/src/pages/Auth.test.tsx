import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Auth } from './Auth';

/**
 * Tests composants Auth - 2 tests simples comme demandé
 */
describe('Auth Component', () => {
  it('affiche le formulaire de connexion', () => {
    render(<Auth />);
    
    // Vérifier que le composant Auth se rend correctement
    const form = screen.getByRole('button', { name: /Se connecter|Connexion/i });
    expect(form).toBeTruthy();
  });

  it('affiche les informations du compte de démonstration', () => {
    render(<Auth />);
    
    // Vérifier que l'email demo est présent dans le document
    const demoInfo = document.body.textContent;
    expect(demoInfo).toContain('demo@example.com');
  });
});
