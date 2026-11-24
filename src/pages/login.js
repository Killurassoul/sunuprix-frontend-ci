import { etatVide } from '../components/etats.js';

// Page à implémenter sur la branche feat/login.
export async function render(el) {
  el.innerHTML = `<h1>Connexion</h1>${etatVide('Page en construction.')}`;
}
