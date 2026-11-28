// Routeur maison basé sur le hash : '#/comparer/12?x=1' -> route '/comparer/:id', params { id: '12' }, query.
// Le hash évite toute configuration de repli (fallback) côté nginx.

export function matchRoute(routes, hash) {
  const [path, search = ''] = (hash.replace(/^#/, '') || '/').split('?');
  for (const route of routes) {
    const keys = [];
    const pattern = route.path.replace(/:(\w+)/g, (_, key) => {
      keys.push(key);
      return '([^/]+)';
    });
    const m = path.match(new RegExp(`^${pattern}/?$`));
    if (m) {
      const params = Object.fromEntries(keys.map((k, i) => [k, decodeURIComponent(m[i + 1])]));
      return { route, params, query: new URLSearchParams(search) };
    }
  }
  return null;
}

/**
 * routes : [{ path, title, render(el, { params, query }), roles?: ['ADMIN'], redirect?: '/x' }]
 * guard(route) : null si l'accès est permis, sinon un hash de redirection (ergonomie seulement :
 * la vraie sécurité est côté backend).
 */
export function startRouter(routes, { container, guard = () => null, onNavigate = () => {} }) {
  async function navigate() {
    const hash = location.hash;
    if (hash && !hash.startsWith('#/')) return; // ancre interne, ex. lien d'évitement
    const found = matchRoute(routes, hash || '#/');
    if (!found) {
      container.innerHTML = '<h1>Page introuvable</h1><p><a href="#/catalogue">Retour au catalogue</a></p>';
      return;
    }
    const { route, params, query } = found;
    if (route.redirect) return location.replace(`#${route.redirect}`);
    const redirection = guard(route);
    if (redirection) return location.replace(redirection);

    // Un nouveau conteneur par navigation : une page lente qui répond après un changement
    // de route écrit dans un élément détaché au lieu d'écraser la page courante.
    const el = document.createElement('div');
    container.replaceChildren(el);
    document.title = `${route.title} – SunuPrix`;
    onNavigate(route);
    container.focus({ preventScroll: true });
    window.scrollTo?.(0, 0);
    try {
      await route.render(el, { params, query });
    } catch (err) {
      console.error(err);
      el.innerHTML = '<p role="alert" class="etat etat--erreur">Une erreur inattendue est survenue.</p>';
    }
  }
  window.addEventListener('hashchange', navigate);
  navigate();
  return navigate;
}
