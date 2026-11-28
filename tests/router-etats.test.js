import { describe, it, expect } from 'vitest';
import { matchRoute } from '../src/router.js';
import { avecEtats } from '../src/components/etats.js';

describe('matchRoute', () => {
  const routes = [{ path: '/catalogue' }, { path: '/comparer/:id' }];

  it('reconnaît une route simple et une route paramétrée', () => {
    expect(matchRoute(routes, '#/catalogue').route.path).toBe('/catalogue');
    const m = matchRoute(routes, '#/comparer/12');
    expect(m.params).toEqual({ id: '12' });
  });

  it('lit la query string du hash', () => {
    expect(matchRoute(routes, '#/catalogue?categorie=3').query.get('categorie')).toBe('3');
  });

  it('renvoie null pour une route inconnue', () => {
    expect(matchRoute(routes, '#/inconnue')).toBeNull();
  });
});

describe('avecEtats', () => {
  it('affiche l’état vide', async () => {
    const el = document.createElement('div');
    await avecEtats(el, async () => [], () => {}, { vide: 'Aucun produit.' });
    expect(el.textContent).toContain('Aucun produit.');
  });

  it('affiche l’erreur puis réessaie avec succès', async () => {
    const el = document.createElement('div');
    let appels = 0;
    const charger = async () => {
      appels += 1;
      if (appels === 1) throw new Error('Serveur injoignable.');
      return [1];
    };
    await avecEtats(el, charger, () => (el.textContent = 'OK'));
    expect(el.querySelector('[role="alert"]').textContent).toContain('Serveur injoignable.');
    el.querySelector('[data-action="reessayer"]').click();
    await new Promise((r) => setTimeout(r));
    expect(el.textContent).toBe('OK');
  });
});
