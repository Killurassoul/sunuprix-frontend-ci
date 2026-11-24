import { etatVide } from '../components/etats.js';

// Page à implémenter sur la branche feat/catalogue.
export async function render(el) {
  el.innerHTML = `<h1>Catalogue des produits</h1>${etatVide('Page en construction.')}`;
}
