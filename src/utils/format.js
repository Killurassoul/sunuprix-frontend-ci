const nombre = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 });
const dateCourte = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeZone: 'Africa/Dakar' });
const dateHeure = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Africa/Dakar' });

/** 1250 -> "1 250 FCFA" (espaces insécables fines, convention française). */
export const formatFCFA = (montant) => `${nombre.format(montant)} FCFA`;

export const formatDate = (iso) => dateCourte.format(new Date(iso));
export const formatDateHeure = (iso) => dateHeure.format(new Date(iso));

const ENTITES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
/** À appliquer à toute donnée venant de l'API avant insertion via innerHTML (notes de contributeurs, etc.). */
export const escapeHtml = (valeur) => String(valeur ?? '').replace(/[&<>"']/g, (c) => ENTITES[c]);
