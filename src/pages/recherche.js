import { etatVide } from '../components/etats.js';

// Page à implémenter sur la branche feat/recherche.
export async function render(el) {
  el.innerHTML = `<h1>Rechercher un produit</h1>${etatVide('Page en construction.')}`;
}
