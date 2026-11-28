// Session côté navigateur : jeton JWT + infos d'affichage de l'utilisateur, en sessionStorage.
// Aucun mot de passe n'est stocké. Le rôle ne sert qu'à l'ergonomie (menus, gardes de route).
const CLE = 'sunuprix.session';

export function getSession() {
  try {
    return JSON.parse(sessionStorage.getItem(CLE)) || null;
  } catch {
    return null;
  }
}

export function setSession({ token, user }) {
  try {
    sessionStorage.setItem(CLE, JSON.stringify({ token, user }));
  } catch {
    /* stockage indisponible (navigation privée stricte) : session non conservée */
  }
}

export function clearSession() {
  try {
    sessionStorage.removeItem(CLE);
  } catch {
    /* rien à faire */
  }
}

export const getToken = () => getSession()?.token ?? null;
export const getUser = () => getSession()?.user ?? null;
