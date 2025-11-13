import { test, expect } from '@playwright/test';

/**
 * Test e2e simple : vérification que l'application se charge correctement
 */
test('application se charge et affiche la page de login', async ({ page }) => {
  // Aller sur la page d'accueil
  await page.goto('/');

  // Vérifier que nous sommes redirigés vers login
  await expect(page).toHaveURL(/\/login/);
  
  // Vérifier que la page contient au moins un champ email et un bouton
  await expect(page.locator('input[type="email"]')).toBeVisible();
  await expect(page.locator('button').first()).toBeVisible();
});
