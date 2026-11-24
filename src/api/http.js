// Client réel : fetch vers l'API FastAPI, URL de base relative (/api) servie par nginx ou le proxy Vite.
import { getToken } from './session.js';

const BASE = '/api';

export class ApiError extends Error {
  constructor(status, message, details = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

const MESSAGES = {
  400: 'Requête invalide.',
  401: 'Session expirée ou identifiants invalides. Veuillez vous connecter.',
  403: "Vous n'avez pas les droits pour cette action.",
  404: 'Élément introuvable.',
  409: 'Ce relevé semble déjà exister (doublon).',
  413: 'Fichier trop volumineux.',
  422: 'Certaines informations sont invalides.',
};

// FastAPI renvoie { detail: "..." } ou { detail: [{ msg, loc }] } pour les erreurs de validation.
function messageErreur(data, status) {
  const detail = data?.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail) && detail[0]?.msg) return detail.map((d) => d.msg).join(' ');
  return MESSAGES[status] || 'Le serveur a rencontré un problème. Réessayez plus tard.';
}

async function request(method, path, { query, body } = {}) {
  const url = new URL(BASE + path, location.origin);
  for (const [k, v] of Object.entries(query || {})) {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
  }
  const headers = { Accept: 'application/json' };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  let payload;
  if (body instanceof FormData) payload = body; // le navigateur pose lui-même le Content-Type multipart
  else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }

  let res;
  try {
    res = await fetch(url, { method, headers, body: payload });
  } catch {
    throw new ApiError(0, 'Serveur injoignable. Vérifiez votre connexion puis réessayez.');
  }
  const data = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(res.status, messageErreur(data, res.status), data);
  return data;
}

export const getCategories = () => request('GET', '/categories');
export const getMarkets = () => request('GET', '/markets');
export const getProducts = ({ category_id } = {}) => request('GET', '/products', { query: { category_id } });
export const getPrices = ({ product_id, market_id } = {}) => request('GET', '/prices', { query: { product_id, market_id } });
export const comparePrices = (productId) => request('GET', `/prices/compare/${encodeURIComponent(productId)}`);
export const searchPrices = ({ q, category_id } = {}) => request('GET', '/prices/search', { query: { q, category_id } });
export const login = ({ username, password }) => request('POST', '/auth/login', { body: { username, password } });
export const submitPrice = (formData) => request('POST', '/prices', { body: formData });
export const getMyPrices = () => request('GET', '/me/prices');
export const getPendingPrices = () => request('GET', '/admin/prices/pending');
export const approvePrice = (id) => request('POST', `/admin/prices/${encodeURIComponent(id)}/approve`);
export const rejectPrice = (id, reason) => request('POST', `/admin/prices/${encodeURIComponent(id)}/reject`, { body: { reason } });
