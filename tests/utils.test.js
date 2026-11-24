import { describe, it, expect } from 'vitest';
import { formatFCFA, escapeHtml } from '../src/utils/format.js';
import { ageEnJours, estAncien, libelleFraicheur, SEUIL_ANCIEN_JOURS } from '../src/utils/fraicheur.js';
import { validerContribution, PHOTO_TAILLE_MAX } from '../src/utils/validation.js';

const espaces = (s) => s.replace(/\s/g, ' ');

describe('formatFCFA', () => {
  it('sépare les milliers et ajoute la devise', () => {
    expect(espaces(formatFCFA(1250))).toBe('1 250 FCFA');
    expect(espaces(formatFCFA(1500000))).toBe('1 500 000 FCFA');
    expect(formatFCFA(90)).toBe('90 FCFA');
  });
});

describe('escapeHtml', () => {
  it('neutralise les balises', () => {
    expect(escapeHtml('<img src=x onerror="a">')).toBe('&lt;img src=x onerror=&quot;a&quot;&gt;');
    expect(escapeHtml(null)).toBe('');
  });
});

describe('fraîcheur', () => {
  const maintenant = new Date('2026-11-24T12:00:00Z');
  const ilYa = (j) => new Date(maintenant - j * 86_400_000).toISOString();

  it('calcule l’âge en jours', () => {
    expect(ageEnJours(ilYa(0), maintenant)).toBe(0);
    expect(ageEnJours(ilYa(3), maintenant)).toBe(3);
  });

  it('marque « ancien » au-delà du seuil seulement', () => {
    expect(SEUIL_ANCIEN_JOURS).toBe(30);
    expect(estAncien(ilYa(30), maintenant)).toBe(false);
    expect(estAncien(ilYa(31), maintenant)).toBe(true);
    expect(estAncien(ilYa(10), maintenant, 7)).toBe(true);
  });

  it('donne un libellé lisible', () => {
    expect(libelleFraicheur(ilYa(0), maintenant)).toBe("Aujourd'hui");
    expect(libelleFraicheur(ilYa(1), maintenant)).toBe('Hier');
    expect(libelleFraicheur(ilYa(12), maintenant)).toBe('Il y a 12 jours');
  });
});

describe('validerContribution', () => {
  const maintenant = new Date('2026-11-24T12:00:00');
  const valide = { product_id: '1', market_id: '2', price: '650', observed_at: '2026-11-24T09:30', source_note: 'Affichage' };

  it('accepte un relevé valide', () => {
    expect(validerContribution(valide, maintenant)).toEqual({});
  });

  it('refuse un prix nul, négatif ou absent', () => {
    expect(validerContribution({ ...valide, price: '0' }, maintenant).price).toMatch(/strictement positif/);
    expect(validerContribution({ ...valide, price: '-5' }, maintenant).price).toMatch(/strictement positif/);
    expect(validerContribution({ ...valide, price: '' }, maintenant).price).toBeDefined();
    expect(validerContribution({ ...valide, price: 'abc' }, maintenant).price).toBeDefined();
  });

  it('refuse une date future ou absente', () => {
    expect(validerContribution({ ...valide, observed_at: '2026-11-25T08:00' }, maintenant).observed_at).toMatch(/futur/);
    expect(validerContribution({ ...valide, observed_at: '' }, maintenant).observed_at).toBeDefined();
  });

  it('exige produit, marché et source', () => {
    const e = validerContribution({ ...valide, product_id: '', market_id: '', source_note: '  ' }, maintenant);
    expect(Object.keys(e).sort()).toEqual(['market_id', 'product_id', 'source_note']);
  });

  it('contrôle le type et la taille de la photo', () => {
    const photo = (type, size) => ({ type, size });
    expect(validerContribution({ ...valide, photo: photo('image/jpeg', 1000) }, maintenant)).toEqual({});
    expect(validerContribution({ ...valide, photo: photo('application/pdf', 1000) }, maintenant).photo).toMatch(/Formats/);
    expect(validerContribution({ ...valide, photo: photo('image/png', PHOTO_TAILLE_MAX + 1) }, maintenant).photo).toMatch(/5 Mo/);
  });
});
