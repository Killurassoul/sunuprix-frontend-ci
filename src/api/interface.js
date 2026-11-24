// Seul point d'entrée des pages vers l'API. Passer au vrai backend = VITE_USE_MOCK=false, rien d'autre.
import * as http from './http.js';
import * as mock from './mock.js';
import { clearSession } from './session.js';

export { ApiError } from './http.js';

// shortcut: le mock est inclus dans le bundle même en mode réel (quelques Ko) ; passer à un import() dynamique s'il grossit.
export const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';
const impl = USE_MOCK ? mock : http;

export const METHODES = [
  'getCategories',
  'getMarkets',
  'getProducts',
  'getPrices',
  'comparePrices',
  'searchPrices',
  'login',
  'submitPrice',
  'getMyPrices',
  'getPendingPrices',
  'approvePrice',
  'rejectPrice',
];

// Un 401 hors connexion = jeton absent ou expiré : on déconnecte et on renvoie vers la connexion.
export const api = Object.fromEntries(
  METHODES.map((nom) => [
    nom,
    async (...args) => {
      try {
        return await impl[nom](...args);
      } catch (err) {
        if (err?.status === 401 && nom !== 'login') {
          clearSession();
          location.hash = `#/connexion?retour=${encodeURIComponent(location.hash.slice(1))}`;
        }
        throw err;
      }
    },
  ]),
);
