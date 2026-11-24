import { etatVide } from '../components/etats.js';

// Page à implémenter sur la branche feat/admin.
export async function render(el) {
  el.innerHTML = `<h1>Modération des relevés</h1>${etatVide('Page en construction.')}`;
}
