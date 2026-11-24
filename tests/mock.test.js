// Le client simulé doit respecter le même contrat que le client réel.
import { describe, it, expect, beforeEach } from 'vitest';
import * as mock from '../src/api/mock.js';
import * as http from '../src/api/http.js';
import { METHODES } from '../src/api/interface.js';
import { setSession, clearSession } from '../src/api/session.js';

const seConnecter = async (username) => {
  const r = await mock.login({ username, password: 'demo1234' });
  setSession({ token: r.access_token, user: r.user });
  return r;
};

beforeEach(() => {
  mock.reset();
  clearSession();
});

describe('interface commune', () => {
  it('les deux clients exposent exactement les mêmes méthodes', () => {
    for (const nom of METHODES) {
      expect(typeof mock[nom], `mock.${nom}`).toBe('function');
      expect(typeof http[nom], `http.${nom}`).toBe('function');
    }
  });
});

describe('données de démonstration', () => {
  it('contient 12 produits, 5 marchés et des catégories', async () => {
    expect(await mock.getProducts()).toHaveLength(12);
    expect(await mock.getMarkets()).toHaveLength(5);
    const cats = await mock.getCategories();
    expect(cats.length).toBeGreaterThan(0);
    expect(cats[0]).toEqual({ id: expect.any(Number), name: expect.any(String) });
  });

  it('expose les champs du catalogue (F1)', async () => {
    const [p] = await mock.getProducts();
    expect(p).toMatchObject({
      id: expect.any(Number),
      name: expect.any(String),
      category_id: expect.any(Number),
      category_name: expect.any(String),
      unit: expect.any(String),
      markets_count: expect.any(Number),
      approved_count: expect.any(Number),
    });
    expect(p.lowest_observation).toMatchObject({ price: expect.any(Number), observed_at: expect.any(String), market_name: expect.any(String) });
  });

  it('filtre le catalogue par catégorie', async () => {
    const legumes = await mock.getProducts({ category_id: 4 });
    expect(legumes.length).toBeGreaterThan(0);
    expect(legumes.every((p) => p.category_id === 4)).toBe(true);
  });
});

describe('vues publiques', () => {
  it('GET /prices ne renvoie que des relevés APPROVED', async () => {
    const prix = await mock.getPrices();
    expect(prix.length).toBeGreaterThan(0);
    expect(prix.every((r) => r.status === 'APPROVED')).toBe(true);
  });

  it('la comparaison est triée par prix croissant avec le plus bas relevé', async () => {
    const c = await mock.comparePrices(1);
    expect(c.product.id).toBe(1);
    const prix = c.observations.map((o) => o.price);
    expect(prix).toEqual([...prix].sort((a, b) => a - b));
    expect(c.lowest_observation.price).toBe(Math.min(...prix));
    expect(c.observations.every((o) => o.status === 'APPROVED')).toBe(true);
    expect(c.observations[0]).toMatchObject({ market_name: expect.any(String), unit: 'kg', observed_at: expect.any(String), source_note: expect.any(String), reliability_labels: expect.any(Array) });
  });

  it('un produit sans relevé approuvé donne une comparaison vide', async () => {
    const c = await mock.comparePrices(12);
    expect(c.observations).toEqual([]);
    expect(c.lowest_observation).toBeNull();
  });

  it('un produit inconnu donne 404', async () => {
    await expect(mock.comparePrices(999)).rejects.toMatchObject({ status: 404 });
  });

  it('la recherche ignore accents et casse, et refuse une requête vide', async () => {
    const r = await mock.searchPrices({ q: 'HUILE' });
    expect(r.map((p) => p.id).sort()).toEqual([4, 5]);
    expect((await mock.searchPrices({ q: 'oeuf' })).map((p) => p.id)).toEqual([12]);
    expect(await mock.searchPrices({ q: 'sucre', category_id: 1 })).toEqual([]);
    await expect(mock.searchPrices({ q: '  ' })).rejects.toMatchObject({ status: 422 });
  });
});

describe('authentification et rôles', () => {
  it('refuse un mauvais mot de passe', async () => {
    await expect(mock.login({ username: 'admin.demo', password: 'faux' })).rejects.toMatchObject({ status: 401 });
  });

  it('renvoie un jeton et le rôle', async () => {
    const r = await seConnecter('contributeur.demo');
    expect(r).toMatchObject({ access_token: expect.any(String), token_type: 'bearer', user: { role: 'CONTRIBUTOR' } });
    expect(r.user).not.toHaveProperty('password');
  });

  it('bloque un anonyme (401) et un mauvais rôle (403)', async () => {
    await expect(mock.getMyPrices()).rejects.toMatchObject({ status: 401 });
    await seConnecter('contributeur.demo');
    await expect(mock.getPendingPrices()).rejects.toMatchObject({ status: 403 });
  });
});

describe('contribution puis modération', () => {
  const formulaire = (champs) => {
    const fd = new FormData();
    for (const [k, v] of Object.entries(champs)) fd.append(k, v);
    return fd;
  };
  const relevé = { product_id: '3', market_id: '3', price: '410', observed_at: new Date(Date.now() - 3_600_000).toISOString(), source_note: 'Test' };

  it('crée un relevé PENDING invisible au public, puis l’admin l’approuve', async () => {
    await seConnecter('contributeur.demo');
    const r = await mock.submitPrice(formulaire(relevé));
    expect(r).toMatchObject({ id: expect.any(Number), status: 'PENDING' });
    expect((await mock.getPrices()).some((p) => p.id === r.id)).toBe(false);
    expect((await mock.getMyPrices()).find((p) => p.id === r.id).status).toBe('PENDING');
    await expect(mock.submitPrice(formulaire(relevé))).rejects.toMatchObject({ status: 409 });

    await seConnecter('admin.demo');
    const file = await mock.getPendingPrices();
    expect(file.every((p) => p.status === 'PENDING' && Array.isArray(p.alerts))).toBe(true);
    await mock.approvePrice(r.id);
    expect((await mock.getPrices()).some((p) => p.id === r.id)).toBe(true);
    await expect(mock.approvePrice(r.id)).rejects.toMatchObject({ status: 409 });
  });

  it('rejette avec motif obligatoire, et le contributeur voit le motif', async () => {
    await seConnecter('admin.demo');
    const [premier] = await mock.getPendingPrices();
    await expect(mock.rejectPrice(premier.id, ' ')).rejects.toMatchObject({ status: 422 });
    await mock.rejectPrice(premier.id, 'Photo illisible');
    await seConnecter('contributeur.demo');
    expect((await mock.getMyPrices()).find((p) => p.id === premier.id)).toMatchObject({ status: 'REJECTED', reason: 'Photo illisible' });
  });

  it('refuse un prix négatif côté « serveur » aussi', async () => {
    await seConnecter('contributeur.demo');
    await expect(mock.submitPrice(formulaire({ ...relevé, price: '-1' }))).rejects.toMatchObject({ status: 422 });
  });
});
