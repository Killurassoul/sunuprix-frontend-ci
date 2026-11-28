import '../styles/accueil.css';
import { api } from '../api/interface.js';
import { avecEtats } from '../components/etats.js';
import { escapeHtml, formatFCFA, formatDate } from '../utils/format.js';
import { estAncien } from '../utils/fraicheur.js';

const ICONES = {
  oeil: '<path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  balance: '<path d="M12 4v16M5 20h14M4 8h16M7 8l-3 6a3 3 0 006 0L7 8zM17 8l-3 6a3 3 0 006 0l-3-6z"/>',
  crayon: '<path d="M4 20l1-5L16 4l4 4L9 19l-5 1zM14 6l4 4"/>',
  personne: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>',
  panier: '<path d="M3 6h18l-2 12H5L3 6zM8 6l4-3 4 3M9 10v5M15 10v5"/>',
  bouclier: '<path d="M12 3l8 3v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6l8-3z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
};
const icone = (nom) =>
  `<span class="icone" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">${ICONES[nom]}</svg></span>`;
const FLECHE = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4"/></svg>';

// Charge utile d'exemple tapée à l'écran (fictive, purement décorative).
const RELEVE_JSON = `POST /api/prices
{
  "product_id": 8,
  "market_id": 2,
  "price": 450,
  "observed_at": "2026-11-24T09:30",
  "source_note": "Affichage sur l'étal",
  "photo": "oignon.jpg"
}
→ 201 { "status": "PENDING" }`;

const mouvementReduit = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

// Silhouette d'un marché au crépuscule : étals, parasols et baobab (SVG, aucune image externe).
const SCENE = `
<svg class="hero__scene" viewBox="0 0 1440 360" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
  <circle cx="1040" cy="170" r="92" fill="#ffd9a0" opacity=".9"/>
  <circle cx="1040" cy="170" r="140" fill="#ffb27a" opacity=".12"/>
  <g fill="#2a1352">
    <path d="M112 360c8-50 6-96 18-128h44c12 32 10 78 18 128z"/>
    <g stroke="#2a1352" stroke-width="9" stroke-linecap="round" fill="none">
      <path d="M136 236l-30-40-24-8M146 234l-12-58-16-18M158 234l10-58 18-18M168 236l36-40 24-4"/>
    </g>
    <ellipse cx="80" cy="184" rx="22" ry="9"/><ellipse cx="114" cy="156" rx="20" ry="9"/>
    <ellipse cx="190" cy="154" rx="22" ry="9"/><ellipse cx="232" cy="190" rx="22" ry="9"/>
  </g>
  <g fill="#1d0d40">
    <path d="M0 300h1440v60H0z"/>
    <path d="M300 300l60-44 60 44zM330 300v-10h60v10z"/>
    <path d="M470 300l80-58 80 58zM540 300v-40h20v40z"/>
    <path d="M700 300l70-50 70 50z"/><path d="M765 300v-30h10v30z"/>
    <path d="M1180 300l90-60 90 60z"/><path d="M1262 300v-40h16v40z"/>
    <path d="M880 300c0-28 40-40 70-40s70 12 70 40z"/>
  </g>
  <g fill="#140834"><path d="M0 330c240-18 480-18 720 0s480 18 720 0v30H0z"/></g>
</svg>`;

export async function render(el) {
  el.innerHTML = `
  <section class="hero" aria-labelledby="hero-titre">
    ${SCENE}
    <div class="hero__voile" aria-hidden="true"></div>
    <div class="hero__contenu">
      <h1 id="hero-titre" class="hero__titre">
        <span class="masque"><span data-in>Comparez les prix</span></span>
        <span class="masque"><span data-in>de nos <span class="serif">marchés.</span></span></span>
      </h1>
      <p class="hero__sous" data-in>Des relevés datés et sourcés, vérifiés avant publication. Devise : FCFA.</p>
      <div class="boutons hero__boutons" data-in>
        <a class="bouton" href="#/catalogue">Voir le catalogue</a>
        <a class="bouton bouton--secondaire" href="#/recherche">Rechercher un produit</a>
      </div>
    </div>
    <button type="button" class="hero__defiler" data-in data-action="defiler">
      <span>Défiler<br />&amp; découvrir</span>
      <svg viewBox="0 0 22 22" fill="none" stroke="#fff" stroke-width="1.6" aria-hidden="true"><path d="M11 3v15M5 12l6 6 6-6"/></svg>
    </button>
  </section>

  <section class="bloc bloc--centre" id="accueil-pourquoi" aria-labelledby="pourquoi-titre">
    <h2 id="pourquoi-titre" class="titre-section reveal">Le prix d'un produit change d'un marché à l'autre.<br />
      <span class="accent">SunuPrix vous aide à comparer</span> avant de vous déplacer.</h2>
    <p class="lede reveal">Riz, huile, oignon, sucre… Consultez les derniers relevés approuvés, sans compte et sans frais.</p>
    <dl class="stats reveal" data-zone="stats" aria-live="polite">
      <div><dt>produits suivis</dt><dd>…</dd></div>
      <div><dt>marchés couverts</dt><dd>…</dd></div>
      <div><dt>relevés approuvés</dt><dd>…</dd></div>
      <div><dt>compte requis pour consulter</dt><dd>0</dd></div>
    </dl>

    <div class="apercu verre reveal">
      <div class="apercu__entete">
        <h3>Plus bas relevés récents</h3>
        <span class="badge badge--live">Relevés approuvés</span>
      </div>
      <p class="avertissement">Prix observé à une date donnée, non garanti actuel.</p>
      <div data-zone="apercu"></div>
      <a class="fleche apercu__lien" href="#/catalogue">Tout le catalogue ${FLECHE}</a>
    </div>
  </section>

  <section class="bloc" aria-labelledby="etapes-titre">
    <div class="partage">
      <div class="reveal">
        <h2 id="etapes-titre" class="titre-section">Consultez, comparez,<br />et si vous avez vu un prix, <span class="accent"><span class="serif">partagez-le.</span></span></h2>
        <p class="lede">Chaque relevé proposé est contrôlé automatiquement puis validé par un administrateur avant d'apparaître au public.</p>
        <div class="boutons">
          <a class="bouton bouton--blanc" href="#/contribuer">Proposer un relevé</a>
          <a class="bouton bouton--secondaire" href="#/connexion">Se connecter</a>
        </div>
      </div>
      <div class="code reveal" aria-hidden="true">
        <div class="code__tete"><span>releve.json</span><span>Exemple fictif</span></div>
        <pre class="code__corps" data-zone="code"></pre>
        <div class="code__pied"><span>statut initial</span><span class="badge--live code__statut">en attente</span></div>
      </div>
    </div>

    <ol class="cartes">
      <li class="carte-etape carte-etape--vedette reveal">
        <div class="carte-etape__haut"><span class="mono">01</span>${icone('oeil')}</div>
        <p class="carte-etape__sur">CATALOGUE</p>
        <h3>Découvrez les produits suivis</h3>
        <p>Par catégorie, avec l'unité, les marchés couverts et le plus bas relevé récent.</p>
        <a class="fleche carte-etape__lien" href="#/catalogue">Ouvrir le catalogue ${FLECHE}</a>
      </li>
      <li class="carte-etape verre reveal">
        <div class="carte-etape__haut"><span class="mono">02</span>${icone('balance')}</div>
        <p class="carte-etape__sur">COMPARAISON</p>
        <h3>Comparez marché par marché</h3>
        <p>Prix triés du plus bas au plus haut, avec date, source et indicateur de fraîcheur.</p>
        <a class="fleche carte-etape__lien" href="#/recherche">Chercher un produit ${FLECHE}</a>
      </li>
      <li class="carte-etape verre reveal">
        <div class="carte-etape__haut"><span class="mono">03</span>${icone('crayon')}</div>
        <p class="carte-etape__sur">CONTRIBUTION</p>
        <h3>Proposez un relevé daté</h3>
        <p>Produit, marché, prix, date et source. Photo facultative. Publication après modération.</p>
        <a class="fleche carte-etape__lien" href="#/contribuer">Contribuer ${FLECHE}</a>
      </li>
    </ol>
  </section>

  <section class="bloc profils" aria-labelledby="profils-titre">
    <div class="profils__tete">
      <h2 id="profils-titre" class="titre-section reveal">Trois profils,<br />une <span class="serif">seule</span> source.</h2>
      <p class="lede reveal">La consultation est libre. La connexion n'est demandée que pour contribuer ou modérer.</p>
    </div>
    <div class="escalier">
      ${[
        ['personne', 'Visiteur', 'Consultez le catalogue, recherchez un produit et comparez les relevés sans créer de compte.', ['Sans compte', 'Fraîcheur visible']],
        ['panier', 'Contributeur', 'Proposez un prix observé au marché et suivez le statut de vos contributions.', ['Photo facultative', 'Suivi du statut']],
        ['bouclier', 'Administrateur', 'Examinez la file des relevés en attente, acceptez ou refusez avec un motif.', ['Alertes d’écart', 'Décision tracée']],
      ]
        .map(
          ([ico, titre, texte, puces]) => `
        <article class="profil verre reveal">
          <div class="carte-etape__haut"><span class="profil__tag">PROFIL</span>${icone(ico)}</div>
          <h3>${titre}</h3>
          <p>${texte}</p>
          <div class="profil__puces">${puces.map((p) => `<span class="badge">${p}</span>`).join('')}</div>
        </article>`,
        )
        .join('')}
    </div>
  </section>

  <section class="bloc bloc--fin">
    <div class="appel verre reveal">
      <h2 class="appel__titre">Comparez <span class="serif">avant</span><br />de vous déplacer.</h2>
      <p class="lede">Consultation libre et gratuite. Chaque prix est daté, situé et sourcé.</p>
      <div class="boutons boutons--centre">
        <a class="bouton" href="#/catalogue">Voir le catalogue</a>
        <a class="bouton bouton--secondaire" href="#/recherche">Rechercher</a>
      </div>
      <p class="appel__note">Sans compte  ·  Prix observés, jamais garantis  ·  FCFA</p>
    </div>
  </section>`;

  el.querySelector('[data-action="defiler"]').addEventListener('click', () =>
    el.querySelector('#accueil-pourquoi').scrollIntoView({ behavior: mouvementReduit() ? 'auto' : 'smooth' }),
  );
  observerApparitions(el);
  taperCode(el.querySelector('[data-zone="code"]'));
  chargerStats(el.querySelector('[data-zone="stats"]'));
  avecEtats(
    el.querySelector('[data-zone="apercu"]'),
    () => api.getProducts(),
    (produits) => afficherApercu(el.querySelector('[data-zone="apercu"]'), produits),
    { vide: 'Aucun relevé approuvé pour le moment.', estVide: (p) => !p.some((x) => x.lowest_observation) },
  );
}

async function chargerStats(dl) {
  const valeurs = dl.querySelectorAll('dd');
  try {
    const [produits, marches] = await Promise.all([api.getProducts(), api.getMarkets()]);
    valeurs[0].textContent = produits.length;
    valeurs[1].textContent = marches.length;
    valeurs[2].textContent = produits.reduce((s, p) => s + (p.approved_count ?? 0), 0);
  } catch {
    for (const dd of [...valeurs].slice(0, 3)) dd.textContent = '—';
  }
}

function afficherApercu(zone, produits) {
  const lignes = produits
    .filter((p) => p.lowest_observation)
    .sort((a, b) => b.approved_count - a.approved_count)
    .slice(0, 6)
    .map((p) => {
      const o = p.lowest_observation;
      const fraicheur = estAncien(o.observed_at)
        ? '<span class="badge badge--alerte">ancien relevé</span>'
        : '<span class="badge badge--succes">récent</span>';
      return `<tr>
        <td><a class="lien" href="#/comparer/${p.id}">${escapeHtml(p.name)}</a><span class="apercu__unite"> / ${escapeHtml(p.unit)}</span></td>
        <td class="nombre">${formatFCFA(o.price)}</td>
        <td class="masquer-mobile">${escapeHtml(o.market_name)}</td>
        <td><span class="masquer-mobile">${formatDate(o.observed_at)} </span>${fraicheur}</td>
      </tr>`;
    })
    .join('');
  zone.innerHTML = `<div class="tableau-conteneur"><table>
    <caption class="sr-only">Plus bas relevé approuvé par produit</caption>
    <thead><tr><th scope="col">Produit</th><th scope="col">Plus bas</th><th scope="col" class="masquer-mobile">Marché</th><th scope="col">Date</th></tr></thead>
    <tbody>${lignes}</tbody></table></div>`;
}

function observerApparitions(el) {
  const elements = el.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) || mouvementReduit()) {
    elements.forEach((e) => e.classList.add('in'));
    return;
  }
  const obs = new IntersectionObserver(
    (entrees) => {
      for (const e of entrees) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          obs.unobserve(e.target);
        }
      }
    },
    { threshold: 0.15 },
  );
  elements.forEach((e) => obs.observe(e));
}

// Tape le JSON caractère par caractère, en boucle ; s'arrête quand la page est quittée.
function taperCode(pre) {
  if (mouvementReduit() || !('IntersectionObserver' in window)) {
    pre.textContent = RELEVE_JSON;
    return;
  }
  let i = 0;
  const pas = () => {
    if (!pre.isConnected) return;
    if (i > RELEVE_JSON.length) {
      i = 0;
      return setTimeout(pas, 3200);
    }
    pre.innerHTML = `${escapeHtml(RELEVE_JSON.slice(0, i))}<span class="code__curseur"></span>`;
    const car = RELEVE_JSON[i++];
    setTimeout(pas, car === '\n' ? 120 : 22);
  };
  const obs = new IntersectionObserver(
    ([e]) => {
      if (e.isIntersecting) {
        obs.disconnect();
        pas();
      }
    },
    { threshold: 0.3 },
  );
  obs.observe(pre);
}
