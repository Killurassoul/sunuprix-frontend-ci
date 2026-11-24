// Client simulé : mêmes fonctions et mêmes formes de réponse que http.js, données 100 % FICTIVES.
// L'état vit en mémoire et se réinitialise au rechargement de la page.
import { ApiError } from './http.js';
import { getToken } from './session.js';

const DELAI_MS = import.meta.env.MODE === 'test' ? 0 : 250;
const JOUR = 86_400_000;

const categories = [
  { id: 1, name: 'Céréales' },
  { id: 2, name: 'Huiles' },
  { id: 3, name: 'Épicerie' },
  { id: 4, name: 'Légumes' },
  { id: 5, name: 'Produits laitiers' },
  { id: 6, name: 'Poissons et viandes' },
];

const markets = [
  { id: 1, name: 'Marché Sandaga', area: 'Dakar Plateau', active: true },
  { id: 2, name: 'Marché Tilène', area: 'Médina, Dakar', active: true },
  { id: 3, name: 'Marché Castors', area: 'Dakar', active: true },
  { id: 4, name: 'Marché Thiaroye', area: 'Pikine', active: true },
  { id: 5, name: 'Marché Central de Thiès', area: 'Thiès', active: true },
];

const products = [
  { id: 1, name: 'Riz brisé parfumé', category_id: 1, unit: 'kg' },
  { id: 2, name: 'Riz local de la vallée', category_id: 1, unit: 'kg' },
  { id: 3, name: 'Mil', category_id: 1, unit: 'kg' },
  { id: 4, name: "Huile d'arachide", category_id: 2, unit: 'litre' },
  { id: 5, name: 'Huile végétale', category_id: 2, unit: 'litre' },
  { id: 6, name: 'Sucre en poudre', category_id: 3, unit: 'kg' },
  { id: 7, name: 'Lait en poudre 400 g', category_id: 5, unit: 'paquet' },
  { id: 8, name: 'Oignon', category_id: 4, unit: 'kg' },
  { id: 9, name: 'Pomme de terre', category_id: 4, unit: 'kg' },
  { id: 10, name: 'Tomate', category_id: 4, unit: 'kg' },
  { id: 11, name: 'Poisson yaboye', category_id: 6, unit: 'kg' },
  { id: 12, name: 'Œuf', category_id: 3, unit: 'pièce' },
].map((p) => ({ ...p, active: true }));

// Comptes de démonstration (mock uniquement, jamais dans le vrai backend).
export const DEMO_USERS = [
  { id: 1, username: 'contributeur.demo', password: 'demo1234', role: 'CONTRIBUTOR' },
  { id: 2, username: 'admin.demo', password: 'demo1234', role: 'ADMIN' },
];

const PHOTO_FICTIVE =
  'data:image/svg+xml;charset=utf-8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="200"><rect width="100%" height="100%" fill="#e7ecef"/>' +
      '<text x="50%" y="50%" text-anchor="middle" font-family="sans-serif" font-size="18" fill="#445">Photo fictive</text></svg>',
  );

// [produit, marché, prix FCFA, il y a N jours, statut A/P/R, source, motif de refus]
const BRUT = [
  [1, 1, 650, 3, 'A', 'Affichage sur l’étal'], [1, 2, 600, 5, 'A', 'Ticket de caisse'],
  [1, 3, 625, 12, 'A', 'Observation directe'], [1, 4, 575, 40, 'A', 'Observation directe'],
  [1, 5, 610, 2, 'P', 'Affichage sur l’étal'],
  [2, 1, 500, 8, 'A', 'Observation directe'], [2, 4, 450, 6, 'A', 'Affichage sur l’étal'],
  [2, 5, 900, 1, 'P', 'Observation directe'],
  [3, 2, 400, 10, 'A', 'Observation directe'], [3, 5, 350, 4, 'A', 'Affichage sur l’étal'],
  [3, 1, 425, 1, 'P', 'Observation directe'],
  [4, 1, 1500, 7, 'A', 'Ticket de caisse'], [4, 3, 1450, 15, 'A', 'Observation directe'],
  [4, 5, 1400, 35, 'A', 'Affichage sur l’étal'],
  [4, 2, 150, 1, 'R', 'Observation directe', 'Prix incohérent : 150 FCFA le litre ressemble à une erreur de saisie.'],
  [5, 1, 1200, 2, 'A', 'Affichage sur l’étal'], [5, 4, 1150, 20, 'A', 'Observation directe'],
  [5, 2, 1180, 0, 'P', 'Ticket de caisse'],
  [6, 1, 700, 4, 'A', 'Affichage sur l’étal'], [6, 2, 675, 9, 'A', 'Observation directe'],
  [6, 3, 690, 45, 'A', 'Ticket de caisse'], [6, 4, 700, 1, 'P', 'Affichage sur l’étal'],
  [7, 1, 2500, 6, 'A', 'Ticket de caisse'], [7, 3, 2400, 11, 'A', 'Affichage sur l’étal'],
  [7, 5, 2600, 3, 'R', 'Observation directe', 'Photo illisible : marque et format non identifiables.'],
  [8, 2, 450, 2, 'A', 'Observation directe'], [8, 4, 400, 5, 'A', 'Observation directe'],
  [8, 5, 375, 60, 'A', 'Affichage sur l’étal'], [8, 1, 480, 0, 'P', 'Observation directe'],
  [9, 1, 550, 3, 'A', 'Affichage sur l’étal'], [9, 3, 500, 14, 'A', 'Observation directe'],
  [9, 4, 525, 2, 'R', 'Observation directe', 'Doublon d’un relevé déjà enregistré.'],
  [10, 2, 800, 1, 'A', 'Observation directe'], [10, 4, 700, 4, 'A', 'Observation directe'],
  [10, 5, 650, 2, 'P', 'Affichage sur l’étal'],
  [11, 4, 1500, 1, 'A', 'Observation directe'],
  [11, 2, 1800, 8, 'R', 'Observation directe', 'Marché non cohérent avec la photo.'],
  [11, 1, 1700, 3, 'P', 'Observation directe'],
  [12, 3, 100, 30, 'R', 'Observation directe', 'Date d’observation douteuse.'],
  [12, 1, 90, 0, 'P', 'Affichage sur l’étal'],
];
const STATUTS = { A: 'APPROVED', P: 'PENDING', R: 'REJECTED' };

let records;
let prochainId;

/** Remet les données fictives à leur état initial (utile pour les tests). */
export function reset(now = Date.now()) {
  records = BRUT.map(([product_id, market_id, price, jours, s, source_note, reason], i) => {
    const observed = now - jours * JOUR - 2 * 3_600_000;
    return {
      id: i + 1,
      product_id,
      market_id,
      contributor_id: 1,
      price,
      observed_at: new Date(observed).toISOString(),
      created_at: new Date(observed + 3_600_000).toISOString(),
      source_note,
      photo_url: s === 'P' && i % 2 === 0 ? PHOTO_FICTIVE : null,
      status: STATUTS[s],
      reason: reason ?? null,
    };
  });
  prochainId = records.length + 1;
}
reset();

// ---------- utilitaires internes ----------
const attendre = (valeur) => new Promise((ok) => setTimeout(() => ok(structuredClone(valeur)), DELAI_MS));
const trouver = (liste, id) => liste.find((x) => x.id === Number(id));
const approuves = () => records.filter((r) => r.status === 'APPROVED');

function utilisateurCourant(rolesAutorises) {
  const id = Number(String(getToken() || '').replace('mock-token-', ''));
  const user = trouver(DEMO_USERS, id);
  if (!user) throw new ApiError(401, 'Session expirée ou identifiants invalides. Veuillez vous connecter.');
  if (rolesAutorises && !rolesAutorises.includes(user.role)) {
    throw new ApiError(403, "Vous n'avez pas les droits pour cette action.");
  }
  return user;
}

function vueRelevé(r) {
  const p = trouver(products, r.product_id);
  const m = trouver(markets, r.market_id);
  const autres = approuves().filter((o) => o.product_id === r.product_id && o.id !== r.id);
  const labels = [];
  if (r.status === 'APPROVED' && autres.some((o) => Math.abs(o.price - r.price) / r.price <= 0.1)) labels.push('CORROBORE');
  if (r.photo_url) labels.push('PHOTO');
  return {
    id: r.id,
    product_id: p.id,
    product_name: p.name,
    unit: p.unit,
    market_id: m.id,
    market_name: m.name,
    market_area: m.area,
    price: r.price,
    observed_at: r.observed_at,
    source_note: r.source_note,
    photo_url: r.photo_url,
    status: r.status,
    reason: r.reason,
    contributor_username: trouver(DEMO_USERS, r.contributor_id)?.username ?? null,
    created_at: r.created_at,
    reliability_labels: labels,
  };
}

function vueProduit(p) {
  const obs = approuves().filter((r) => r.product_id === p.id);
  const plusBas = obs.reduce((min, r) => (!min || r.price < min.price ? r : min), null);
  return {
    ...p,
    category_name: trouver(categories, p.category_id).name,
    markets_count: new Set(obs.map((r) => r.market_id)).size,
    approved_count: obs.length,
    lowest_observation: plusBas && {
      price: plusBas.price,
      observed_at: plusBas.observed_at,
      market_name: trouver(markets, plusBas.market_id).name,
    },
  };
}

const normaliser = (s) =>
  String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/œ/g, 'oe').trim();

// Écart de plus de 30 % avec la moyenne des relevés APPROVED du même produit (seuil fictif).
function alertes(r) {
  const obs = approuves().filter((o) => o.product_id === r.product_id);
  if (!obs.length) return ['Aucun relevé approuvé pour comparer'];
  const moyenne = obs.reduce((s, o) => s + o.price, 0) / obs.length;
  return Math.abs(r.price - moyenne) / moyenne > 0.3 ? ['Écart inhabituel avec les relevés récents'] : [];
}

// ---------- API publique (même signature que http.js) ----------
export const getCategories = () => attendre(categories);
export const getMarkets = () => attendre(markets);

export const getProducts = ({ category_id } = {}) =>
  attendre(products.filter((p) => !category_id || p.category_id === Number(category_id)).map(vueProduit));

export const getPrices = ({ product_id, market_id } = {}) =>
  attendre(
    approuves()
      .filter((r) => (!product_id || r.product_id === Number(product_id)) && (!market_id || r.market_id === Number(market_id)))
      .map(vueRelevé),
  );

export async function comparePrices(productId) {
  const p = trouver(products, productId);
  if (!p) throw new ApiError(404, 'Produit introuvable.');
  const observations = approuves()
    .filter((r) => r.product_id === p.id)
    .map(vueRelevé)
    .sort((a, b) => a.price - b.price);
  return attendre({ product: vueProduit(p), observations, lowest_observation: observations[0] ?? null });
}

export async function searchPrices({ q, category_id } = {}) {
  const terme = normaliser(q ?? '');
  if (!terme) throw new ApiError(422, 'Saisissez au moins un caractère.');
  return attendre(
    products
      .filter((p) => normaliser(p.name).includes(terme) && (!category_id || p.category_id === Number(category_id)))
      .map(vueProduit),
  );
}

export async function login({ username, password } = {}) {
  const user = DEMO_USERS.find((u) => u.username === username && u.password === password);
  if (!user) {
    await attendre(null);
    throw new ApiError(401, 'Identifiant ou mot de passe incorrect.');
  }
  return attendre({
    access_token: `mock-token-${user.id}`,
    token_type: 'bearer',
    user: { id: user.id, username: user.username, role: user.role },
  });
}

export async function submitPrice(formData) {
  const user = utilisateurCourant(['CONTRIBUTOR']);
  const champ = (k) => formData.get(k);
  const price = Number(champ('price'));
  const observed = new Date(champ('observed_at'));
  if (!trouver(products, champ('product_id')) || !trouver(markets, champ('market_id'))) {
    throw new ApiError(422, 'Produit ou marché inconnu.');
  }
  if (!(price > 0)) throw new ApiError(422, 'Le prix doit être strictement positif.');
  if (Number.isNaN(observed.getTime()) || observed.getTime() > Date.now()) {
    throw new ApiError(422, "La date d'observation est invalide ou dans le futur.");
  }
  const doublon = records.some(
    (r) =>
      r.product_id === Number(champ('product_id')) &&
      r.market_id === Number(champ('market_id')) &&
      r.contributor_id === user.id &&
      r.price === price &&
      r.observed_at.slice(0, 10) === observed.toISOString().slice(0, 10),
  );
  if (doublon) throw new ApiError(409, 'Ce relevé semble déjà exister (doublon).');
  const photo = champ('photo');
  const r = {
    id: prochainId++,
    product_id: Number(champ('product_id')),
    market_id: Number(champ('market_id')),
    contributor_id: user.id,
    price,
    observed_at: observed.toISOString(),
    created_at: new Date().toISOString(),
    source_note: String(champ('source_note') ?? ''),
    photo_url: photo && photo.size ? PHOTO_FICTIVE : null,
    status: 'PENDING',
    reason: null,
  };
  records.push(r);
  return attendre({ id: r.id, status: 'PENDING', message: 'Relevé enregistré, en attente de validation.' });
}

export async function getMyPrices() {
  const user = utilisateurCourant(['CONTRIBUTOR']);
  return attendre(
    records
      .filter((r) => r.contributor_id === user.id)
      .map(vueRelevé)
      .sort((a, b) => b.created_at.localeCompare(a.created_at)),
  );
}

export async function getPendingPrices() {
  utilisateurCourant(['ADMIN']);
  return attendre(
    records
      .filter((r) => r.status === 'PENDING')
      .map((r) => ({ ...vueRelevé(r), alerts: alertes(r) }))
      .sort((a, b) => a.created_at.localeCompare(b.created_at)),
  );
}

function decider(id, status, reason) {
  utilisateurCourant(['ADMIN']);
  const r = trouver(records, id);
  if (!r) throw new ApiError(404, 'Relevé introuvable.');
  if (r.status !== 'PENDING') throw new ApiError(409, 'Ce relevé a déjà été modéré.');
  r.status = status;
  r.reason = reason ?? null;
  return attendre({ id: r.id, status: r.status, reason: r.reason });
}

export async function approvePrice(id) {
  return decider(id, 'APPROVED');
}

export async function rejectPrice(id, reason) {
  if (!String(reason ?? '').trim()) throw new ApiError(422, 'Le motif de refus est obligatoire.');
  return decider(id, 'REJECTED', String(reason).trim());
}
