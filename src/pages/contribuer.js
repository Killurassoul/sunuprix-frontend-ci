import { etatVide } from '../components/etats.js';

// Page à implémenter sur la branche feat/contribuer.
export async function render(el) {
  el.innerHTML = `<h1>Proposer un relevé de prix</h1>${etatVide('Page en construction.')}`;
}
