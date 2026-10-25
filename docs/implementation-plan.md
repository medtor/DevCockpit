# Plan de livraison — DevCockpit

- **État au 2026-10-25**
- **Dépôt public de référence :** `medtor/DevCockpit`, branche `main` à `f8c4de3`
- **Branche de travail locale :** `security/encrypted-storage`
- **Délai fourni :** aucun. Les jalons sont donc ordonnés par dépendances et critères, sans dates inventées.

## Objectif

Améliorer DevCockpit par tranches testables : fiabiliser les secrets, automatiser les contrôles, aligner les outils et la documentation sur le besoin, puis ajouter des intégrations GitHub et IA avec consentement explicite avant toute transmission externe.

## État initial et contraintes

- La branche locale contient la sécurisation du stockage/sauvegardes, le générateur de mots de passe cryptographique et un workflow CI local. Les changements ne sont ni commités ni poussés.
- Après le générateur et le test de l’estimation d’entropie, la suite passe à 23 tests; TypeScript et le build passent; une revue indépendante du lot 1–2 n’a relevé aucun blocage.
- La branche GitHub `main` ne contient pas encore ces changements locaux, ni la suite de tests ni le workflow CI. Le workflow n’a pas été exécuté sur GitHub.
- Aucune équipe persistante/spécialiste connecté n’est confirmée dans les outils disponibles. Les lots de code indépendants peuvent être confiés à des sous-agents ponctuels, puis revus indépendamment.
- Mhammed est le seul décideur produit identifié. Les avis demandés après chaque lot servent de jalons de retour ; aucune approbation produit ou sécurité n’est présumée.
- Pas de commit, push, publication, création de compte, ni activation d’intégration externe sans demande séparée. Pas de jeton collé dans le chat.
- Les accès GitHub privés et les appels de modèles transmettent des données hors du navigateur : ils restent opt-in et nécessitent une décision explicite sur les scopes/données avant activation.

## Lots de livraison

| Ordre | Lot et responsable | Taille relative | Dépendances | Critères d’acceptation |
|---|---|---:|---|---|
| 0 | **Base sécurité existante** — coordination + revue indépendante | Acquis localement | Aucun | Données chiffrées au repos; migration et rollback préservent les données; verrouillage et imports sérialisés; exports chiffrés; tests/build propres. Préserver les modifications existantes. |
| 1 | **Durcir la génération des mots de passe** — sous-agent de code ponctuel; coordination QA | S | Lot 0 | Les modes phrase et caractères utilisent exclusivement une source cryptographique; éviter le biais modulo par échantillonnage par rejet; aucun `Math.random()` pour un secret; tests déterministes des cas limites; l’entropie des phrases est calculée depuis le nombre de choix indépendants (taille de la liste, nombre de mots, suffixe numérique) plutôt que les caractères imprimés; typecheck/build passent. |
| 2 | **CI minimale** — sous-agent de code ponctuel; coordination QA | S | Tests du lot 0 | Workflow GitHub Actions sur PR/push vers `main`; Bun avec version définie; installation figée, `lint`, `test`, `build`; aucune clé ni secret CI requis; fichier vérifié localement. Ne s’exécute sur GitHub qu’après publication autorisée. |
| 3 | **Aligner documentation et toolbox** — coordination + revue produit Mhammed | M | Lots 1–2 | README fidèle aux écrans réels; ajouter d’abord un inspecteur JWT hors ligne (décodage clair, avertissement qu’un décodage ne vérifie pas la signature); puis analyseur Cron si les cas de fuseau et d’expression sont couverts par tests. Les outils restent utilisables hors ligne. |
| 4 | **Intégration GitHub en lecture seule** — implémentation ponctuelle + revue sécurité | M | Lots 1–2 | Vue dépôts publics/issues/PRs/releases avec appels `GET` seulement, timeout, limites de débit, gestion d’erreurs et aucune persistance de jeton; indiquer clairement les données téléchargées. Le privé est exclu du premier incrément; scopes et authentification à décider avec Mhammed avant conception/activation. |
| 5 | **Prompt Studio avec exécution contrôlée** — implémentation ponctuelle + revue produit/sécurité | L | Lots 0–2; choix explicite des fournisseurs et de la transmission de contenu | Appel seulement après action explicite; afficher fournisseur/modèle et contenu envoyé; réutiliser une clé déverrouillée sans journalisation; erreurs/timeout/cancel; tests des adapters; coûts ou tokens affichés uniquement si la source fournisseur est vérifiée. Aucun envoi automatique. |
| 6 | **Exécution de serveurs MCP** — à cadrer séparément | L/XL | Architecture desktop/companion non présente | Ne pas prétendre lancer des serveurs depuis l’application navigateur. Avant toute implémentation, cadrer processus local, isolation, permissions filesystem/réseau, secrets env, confirmation utilisateur et sandbox. |

## Jalons et retours des parties prenantes

1. **M1 — Fondations locales** : lots 1 et 2 développés et testés localement; retour de revue technique indépendant. Mhammed peut demander une correction avant le lot suivant.
2. **M2 — Valeur produit visible** : documentation corrigée et premier outil toolbox choisi; montrer le périmètre, les captures et les limites avant d’élargir la boîte à outils.
3. **M3 — Intégration publique** : prototype GitHub public et strictement en lecture seule; retour de Mhammed avant tout ajout de login privé ou permissions.
4. **M4 — IA** : prototype de génération isolé; décision explicite de Mhammed sur les données pouvant être envoyées à un fournisseur avant les essais réels.
5. **M5 — Livraison** : revue indépendante finale, tests, TypeScript, build, diff propre et documentation actualisée. Commit/push restent une décision séparée.

## Ressources et qualité

- Aucun agent persistant ou spécialiste connecté n’a été confirmé; utiliser uniquement des sous-agents ponctuels réellement disponibles et des tâches indépendantes sans écritures concurrentes sur les mêmes fichiers.
- Un responsable par lot; QA/coordination vérifie le résultat réel, les fichiers exacts et les commandes de tests. Les retours d’agents ne valent pas preuve sans livrable/test vérifiable.
- TDD pour les comportements : test rouge observé, implémentation minimale, test vert, suite complète, TypeScript, build, `git diff --check`, puis revue indépendante.
- Protéger le travail déjà présent : pas de reset/stash destructif, pas d’installation supplémentaire, pas de modification système, pas de push.
- Dépendances/résultats inter-lots : ne démarrer les intégrations externes qu’après validation des fondations; séparer clairement données locales et données envoyées.

## Avancement courant

- **Lot 0 — sécurité locale :** implémenté sur la branche de travail; 18 tests antérieurs et revue indépendante finale sans blocage.
- **Lot 1 — générateur :** modes phrase et caractères protégés par Web Crypto avec échantillonnage sans biais; entropie des phrases fondée sur les choix indépendants; tests de cas limites et d’absence de Web Crypto. La revue initiale et la revue de suivi sont passées sans blocage. Suggestions non bloquantes : ajouter les tests des seuils exacts de score et un test d’intégration qui vérifie la séparation des estimateurs phrase/caractères.
- **Lot 2 — CI :** `.github/workflows/ci.yml` créé avec permissions `contents: read`, Bun 1.4.4 et installation figée, lint, tests et build. `bun install --frozen-lockfile` a réussi localement sans changement; le YAML n’a pas été validé par un parseur local. Le workflow publié sur `main` a réussi au run [40219933002](https://github.com/medtor/DevCockpit/actions/runs/40219933002), commit `b3a447afa589cd15fff47918f2281774eb3ea5c5`. L’installation signale une déclaration en double de `vite` dans `package.json`.
- **Vérifications locales actuelles :** 47/47 tests, TypeScript, build et `git diff --check` réussis après les lots JWT et Cron; revues indépendantes finales sans blocage. Build avec avertissements sur les annotations Zod et un chunk >500 kB; `vite` est déclaré à la fois dans `dependencies` et `devDependencies`.
- **État distant :** les changements de la livraison sont publiés sur `main`, qui contient le commit `b3a447afa589cd15fff47918f2281774eb3ea5c5`; la branche distante `security/encrypted-storage` demeure à ce même point. Aucune pull request n’a été créée.
- **Lot 3 — toolbox/documentation :** incrément JWT livré, revue finale sans blocage. Analyseur Cron livré : syntaxe numérique cinq champs, timezone IANA modifiable, explication, aperçu jusqu’à cinq occurrences (25 ans), notes DST et distinction entre syntaxe valide et aucune occurrence; README actualisé. Les revues ont conduit à corriger `n/step`, les descriptions des pas en minutes, le gel dû au balayage minute, les années 0–99, la règle DOM/DOW pour champs couvrant tout leur domaine, l’horizon bissextile et l’ordre des occurrences lors du retour historique de date avec offset à la seconde. Tests ciblés et suite complète passent; revue indépendante finale sans blocage, avec assertion testant cinq résultats uniques et triés. Ces changements, le lot sécurité, les tests et la documentation sont publiés sur `main`.
