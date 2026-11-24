// Contrôles côté client du formulaire de contribution (confort utilisateur ; le backend revérifie tout).
export const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const PHOTO_TAILLE_MAX = 5 * 1024 * 1024; // 5 Mo

/** Retourne un objet { champ: message } ; vide si tout est valide. */
export function validerContribution({ product_id, market_id, price, observed_at, source_note, photo } = {}, maintenant = new Date()) {
  const erreurs = {};
  if (!product_id) erreurs.product_id = 'Choisissez un produit.';
  if (!market_id) erreurs.market_id = 'Choisissez un marché.';

  const prix = Number(price);
  if (price === undefined || price === null || String(price).trim() === '' || !Number.isFinite(prix)) {
    erreurs.price = 'Indiquez un prix en FCFA.';
  } else if (prix <= 0) {
    erreurs.price = 'Le prix doit être strictement positif.';
  }

  const date = new Date(observed_at);
  if (!observed_at || Number.isNaN(date.getTime())) {
    erreurs.observed_at = "Indiquez la date et l'heure de l'observation.";
  } else if (date > maintenant) {
    erreurs.observed_at = 'La date ne peut pas être dans le futur.';
  }

  if (!String(source_note ?? '').trim()) erreurs.source_note = 'Précisez la source ou ajoutez une note.';

  if (photo && photo.size > 0) {
    if (!PHOTO_TYPES.includes(photo.type)) erreurs.photo = 'Formats acceptés : JPEG, PNG ou WebP.';
    else if (photo.size > PHOTO_TAILLE_MAX) erreurs.photo = 'La photo ne doit pas dépasser 5 Mo.';
  }
  return erreurs;
}
