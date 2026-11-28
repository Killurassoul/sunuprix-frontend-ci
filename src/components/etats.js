import { escapeHtml } from '../utils/format.js';

// États d'interface communs à toutes les pages. Retournent du HTML à insérer.
export const etatChargement = (message = 'Chargement…') =>
  `<p class="etat etat--chargement" role="status" aria-live="polite"><span class="spinner" aria-hidden="true"></span>${escapeHtml(message)}</p>`;

export const etatVide = (message = 'Aucun résultat.') => `<p class="etat etat--vide" role="status">${escapeHtml(message)}</p>`;

export const etatErreur = (message = 'Une erreur est survenue.') =>
  `<div class="etat etat--erreur" role="alert"><p>${escapeHtml(message)}</p>` +
  '<button type="button" class="bouton bouton--secondaire" data-action="reessayer">Réessayer</button></div>';

/**
 * Charge des données avec affichage des états. `afficher(donnees)` rend le cas normal ;
 * le bouton « Réessayer » relance le chargement.
 */
export async function avecEtats(el, charger, afficher, { vide = 'Aucun résultat.', estVide = (d) => Array.isArray(d) && !d.length } = {}) {
  el.innerHTML = etatChargement();
  try {
    const donnees = await charger();
    if (estVide(donnees)) el.innerHTML = etatVide(vide);
    else afficher(donnees);
  } catch (err) {
    el.innerHTML = etatErreur(err?.message);
    el.querySelector('[data-action="reessayer"]').addEventListener('click', () => avecEtats(el, charger, afficher, { vide, estVide }));
  }
}
