import { etatVide } from '../components/etats.js';

// Page à implémenter sur la branche feat/comparaison.
export async function render(el) {
  el.innerHTML = `<h1>Comparer les prix</h1>${etatVide('Page en construction.')}`;
}
