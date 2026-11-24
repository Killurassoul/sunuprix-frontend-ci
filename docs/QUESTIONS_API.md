# Questions ouvertes sur le contrat d'API

Le cahier §13 est une « proposition initiale ». Le client simulé (`src/api/mock.js`) applique les formes ci-dessous en attendant le contrat OpenAPI figé. Merci de répondre ou de corriger directement ici.

## 1. `GET /api/products` : agrégats du catalogue (F1)
F1 affiche le nombre de marchés, le nombre de relevés approuvés et le plus bas prix récent avec sa date et son lieu.
**Forme supposée** : `{ id, name, category_id, category_name, unit, active, markets_count, approved_count, lowest_observation: { price, observed_at, market_name } | null }`.
Le filtre par catégorie est supposé être `?category_id=`.
Si le backend ne renvoie pas ces agrégats, le front devra appeler `GET /api/prices` et les calculer lui-même.

## 2. `POST /api/auth/login`
**Supposé** : corps JSON `{ username, password }` ; réponse `{ access_token, token_type: "bearer", user: { id, username, role } }`, avec `role` ∈ `CONTRIBUTOR` | `ADMIN`.
Si FastAPI utilise `OAuth2PasswordRequestForm`, le corps doit être en `application/x-www-form-urlencoded` et le rôle n'est pas renvoyé. Dans ce cas, quelle route permet d'obtenir le rôle ? (Il n'y a pas de `GET /api/me` dans le contrat.)

## 3. Format commun d'un relevé
**Supposé** pour `/prices`, `/prices/compare`, `/me/prices` et `/admin/prices/pending` :
`{ id, product_id, product_name, unit, market_id, market_name, market_area, price, observed_at, source_note, photo_url, status, reason, contributor_username, created_at, reliability_labels: [] }`.
La file admin ajoute `alerts: string[]`.
- Quelles sont les valeurs possibles de `reliability_labels` ? (Le mock utilise `CORROBORE` et `PHOTO`.)
- Comment la photo est-elle servie : URL publique, URL signée, ou route protégée par le jeton ?

## 4. `GET /api/prices/compare/{product_id}`
**Supposé** : `{ product, observations: [relevé…] triées par prix croissant, lowest_observation: relevé | null }`, et 404 si le produit est inconnu.

## 5. `GET /api/prices/search?q=`
Que renvoie cette route : des **produits** (forme du point 1) ou des **relevés** ? Le mock renvoie des produits.
Le filtre est supposé être `&category_id=`. Une requête vide est supposée renvoyer 422.

## 6. `POST /api/prices`
**Supposé** : toujours en `multipart/form-data` (`product_id, market_id, price, observed_at` en ISO 8601, `source_note, photo?`). Réponse 201 `{ id, status: "PENDING", message }`. Un doublon renvoie 409.

## 7. Modération
**Supposé** : `POST /api/admin/prices/{id}/reject` avec un corps JSON `{ reason }` ; `approve` sans corps. Un relevé déjà modéré renvoie 409.

## 8. Localisation (« marchés proches de moi »)
La table `markets` (cahier §12) ne contient que `area`, sans latitude ni longitude, et le cahier exclut le GPS du MVP (§3, §23).
**Décision front** : on affiche seulement la zone (`area`). La fonction « proches de moi » n'est **pas** développée tant que l'API ne fournit pas `latitude` et `longitude`. Faut-il les ajouter ?
