// Rendu de la page d'accueil avec le client simulé : chiffres, aperçu, et état d'erreur.
import { describe, it, expect, vi, beforeAll, afterEach } from 'vitest';

let accueil;
let mock;
beforeAll(async () => {
  vi.stubEnv('VITE_USE_MOCK', 'true');
  accueil = await import('../src/pages/accueil.js');
  mock = await import('../src/api/mock.js');
});
afterEach(() => vi.restoreAllMocks());

const attendreRendu = () => new Promise((r) => setTimeout(r, 0));

describe('page d’accueil', () => {
  it('affiche les chiffres et le plus bas relevé par produit', async () => {
    const el = document.createElement('div');
    document.body.append(el);
    await accueil.render(el);
    await attendreRendu();

    const chiffres = [...el.querySelectorAll('.stats dd')].map((dd) => dd.textContent);
    expect(chiffres.slice(0, 3)).toEqual(['12', '5', '26']);
    const lignes = el.querySelectorAll('[data-zone="apercu"] tbody tr');
    expect(lignes.length).toBe(6);
    expect(lignes[0].querySelector('a').getAttribute('href')).toMatch(/^#\/comparer\/\d+$/);
    expect(el.textContent).toContain('non garanti actuel');
    expect(el.textContent).not.toMatch(/prix garanti|officiel/i);
    el.remove();
  });

  it('affiche l’état d’erreur si l’API échoue', async () => {
    vi.spyOn(mock, 'getProducts').mockRejectedValue(new Error('Serveur injoignable.'));
    const el = document.createElement('div');
    document.body.append(el);
    await accueil.render(el);
    await attendreRendu();
    expect(el.querySelector('[data-zone="apercu"] [role="alert"]').textContent).toContain('Serveur injoignable.');
    expect(el.querySelector('.stats dd').textContent).toBe('—');
    el.remove();
  });
});
