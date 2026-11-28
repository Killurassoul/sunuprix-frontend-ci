# Hypothèses et décisions prises seules (frontend)

À valider avec M1 (contrats API) et le binôme backend. Chaque ligne peut changer quand le contrat OpenAPI sera figé.

## Organisation
- **Répartition** : le prompt du binôme (Dev A : catalogue, recherche, comparaison ; Dev B : connexion, contribuer, mes contributions, admin) est suivi, alors que le cahier §15 répartit autrement entre M4 et M5. À confirmer avec M1.
- **Dockerfile / CI frontend** : le cahier les attribue à M7 ; ce dépôt ne fournit que des brouillons.
- Les 7 pages existent dès le squelette (contenu « en construction ») pour que chaque branche `feat/<page>` ne modifie que son propre fichier.

## Page d'accueil et thème
- Une page d'accueil (`#/`, `src/pages/accueil.js`) a été ajoutée. Le cahier §15 la mentionne (« home ») pour M4, mais le prompt ne la listait pas.
- Le thème visuel s'inspire d'une maquette de landing page : fond violet sombre, surfaces en verre dépoli, polices Inter Tight, Instrument Serif et Fira Code. Il a été adapté : **pas de 3D, pas de vidéo, pas de dépendance ajoutée**. La scène du hero (marché au crépuscule, baobab) est un SVG inline.
- Les polices sont chargées depuis Google Fonts. Sans réseau, des polices système de repli prennent le relais.
- Les chiffres de l'accueil (produits, marchés, relevés approuvés) viennent de l'API. Aucun chiffre n'est inventé.
- `--ink-3` est fixé à une opacité de .64 (au lieu de .5 dans la maquette) pour respecter le contraste AA sur le fond.

## Technique
- `src/api/session.js` ajouté (absent de la structure du prompt) : stockage du jeton en sessionStorage, partagé par le client réel et le mock.
- `ApiError` (status, message, details) est la seule forme d'erreur que voient les pages, en mode réel comme en mode simulé.
- Un 401 sur toute route sauf `login` vide la session et renvoie vers `#/connexion?retour=…`.
- Les gardes de route redirigent un rôle non autorisé vers le catalogue (ergonomie uniquement).
- Un administrateur ne peut pas soumettre de relevé (rôle `CONTRIBUTOR` requis), conformément à l'annexe A.
- `GET /health` n'est pas appelé par le frontend : aucune page n'en a besoin. Le conteneur frontend expose son propre `/healthz`.
- Le mock est inclus dans le bundle même en mode réel (quelques Ko) ; le bandeau « données fictives » ne s'affiche qu'en mode simulé.
- Dates affichées dans le fuseau `Africa/Dakar` (UTC+0).

## Métier
- « Ancien relevé » : plus de **30 jours** (`SEUIL_ANCIEN_JOURS` dans `src/utils/fraicheur.js`).
- Photo : JPEG, PNG ou WebP, **5 Mo** maximum (`src/utils/validation.js`). Seuils à aligner avec le backend.
- Champ « source ou note » considéré comme **obligatoire** (cahier §24 : « source/note »).
- Prix en FCFA entiers affichés sans décimales.
- Alertes de modération du mock : écart de plus de 30 % avec la moyenne des relevés approuvés du produit (seuil fictif ; le vrai seuil est côté backend).
- Badge « corroboré » du mock : au moins un autre relevé approuvé du même produit à ±10 %.
