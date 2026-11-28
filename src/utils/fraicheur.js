/** Au-delà de ce nombre de jours, un relevé est marqué « ancien relevé ». */
export const SEUIL_ANCIEN_JOURS = 30;

const JOUR = 86_400_000;

export const ageEnJours = (date, maintenant = new Date()) => Math.floor((maintenant - new Date(date)) / JOUR);

export const estAncien = (date, maintenant = new Date(), seuil = SEUIL_ANCIEN_JOURS) => ageEnJours(date, maintenant) > seuil;

export function libelleFraicheur(date, maintenant = new Date()) {
  const jours = ageEnJours(date, maintenant);
  if (jours <= 0) return "Aujourd'hui";
  if (jours === 1) return 'Hier';
  return `Il y a ${jours} jours`;
}
