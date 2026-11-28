import './styles/main.css';
import { startRouter } from './router.js';
import { USE_MOCK } from './api/interface.js';
import { getUser, clearSession } from './api/session.js';
import { escapeHtml } from './utils/format.js';
import * as accueil from './pages/accueil.js';
import * as catalogue from './pages/catalogue.js';
import * as recherche from './pages/recherche.js';
import * as comparaison from './pages/comparaison.js';
import * as login from './pages/login.js';
import * as contribuer from './pages/contribuer.js';
import * as mesContributions from './pages/mes-contributions.js';
import * as admin from './pages/admin.js';

const routes = [
  { path: '/', title: 'Accueil', render: accueil.render, pleineLargeur: true },
  { path: '/catalogue', title: 'Catalogue', render: catalogue.render },
  { path: '/recherche', title: 'Recherche', render: recherche.render },
  { path: '/comparer/:id', title: 'Comparaison', render: comparaison.render },
  { path: '/connexion', title: 'Connexion', render: login.render },
  { path: '/contribuer', title: 'Contribuer', render: contribuer.render, roles: ['CONTRIBUTOR'] },
  { path: '/mes-contributions', title: 'Mes contributions', render: mesContributions.render, roles: ['CONTRIBUTOR'] },
  { path: '/admin', title: 'Modération', render: admin.render, roles: ['ADMIN'] },
];

// Gardes de route : ergonomie uniquement, le backend contrôle les droits à chaque appel.
function guard(route) {
  if (!route.roles) return null;
  const user = getUser();
  if (!user) return `#/connexion?retour=${encodeURIComponent(location.hash.slice(1))}`;
  return route.roles.includes(user.role) ? null : '#/catalogue';
}

const LIENS = [
  { href: '#/catalogue', label: 'Catalogue' },
  { href: '#/recherche', label: 'Recherche' },
  { href: '#/contribuer', label: 'Contribuer', role: 'CONTRIBUTOR' },
  { href: '#/mes-contributions', label: 'Mes contributions', role: 'CONTRIBUTOR' },
  { href: '#/admin', label: 'Modération', role: 'ADMIN' },
];

function renderNav() {
  const user = getUser();
  const courant = location.hash.split('?')[0];
  const liens = LIENS.filter((l) => !l.role || l.role === user?.role)
    .map((l) => `<a href="${l.href}"${courant === l.href ? ' aria-current="page"' : ''}>${l.label}</a>`)
    .join('');
  const compte = user
    ? `<span class="nav__utilisateur">${escapeHtml(user.username)}</span><button type="button" class="bouton bouton--lien" id="deconnexion">Déconnexion</button>`
    : `<a href="#/connexion"${courant === '#/connexion' ? ' aria-current="page"' : ''}>Connexion</a>`;
  const nav = document.getElementById('nav');
  nav.innerHTML = liens + compte;
  nav.querySelector('#deconnexion')?.addEventListener('click', () => {
    clearSession();
    location.hash = '#/catalogue';
    renderNav();
  });
}

const contenu = document.getElementById('contenu');
const entete = document.querySelector('.entete');
const majEntete = () => entete.classList.toggle('entete--defile', scrollY > innerHeight * 0.5);
addEventListener('scroll', majEntete, { passive: true });

document.getElementById('bandeau-demo').hidden = !USE_MOCK;
startRouter(routes, {
  container: contenu,
  guard,
  onNavigate: (route) => {
    contenu.classList.toggle('contenu--pleine', Boolean(route.pleineLargeur));
    renderNav();
    majEntete();
  },
});
