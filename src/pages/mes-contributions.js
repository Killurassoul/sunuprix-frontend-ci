import { etatVide } from '../components/etats.js';

// Page à implémenter sur la branche feat/mes-contributions.
export async function render(el) {
  el.innerHTML = `<h1>Mes contributions</h1>${etatVide('Page en construction.')}`;
}
