# AI Code Quality Assistant — MVP v0.1

Prototype indépendant du démonstrateur GitHub Pages. L'application accepte du code JavaScript collé dans l'interface ou chargé depuis un fichier `.js`, lance une analyse statique avec Esprima et l'analyseur historique, puis demande au LLM une revue pédagogique.

## Choix technique initial

- Node.js + Express côté serveur.
- Esprima et `src/analyzer.js` réutilisé pour le calcul de complexité et le CFG (le CFG est best effort et limité à une seule déclaration de fonction dans ce MVP).
- API OpenAI côté serveur, modèle par défaut `gpt-5.4-mini`. Le tarif publié consulté au moment de la préparation est de 0,75 USD / million de tokens en entrée et 4,50 USD / million de tokens en sortie. Les tarifs peuvent changer : vérifier la page officielle avant usage.
- La clé API n'est jamais envoyée au navigateur.

## Prérequis

Node.js 20+ recommandé et une clé API OpenAI avec facturation configurée.

## Installation

```bash
npm install
cp .env.example .env
```

Sous PowerShell :

```powershell
Copy-Item .env.example .env
notepad .env
```

Renseigner `OPENAI_API_KEY` dans `.env`. Garder ce fichier local et ne jamais le committer.

## Lancement

```bash
npm start
```

Puis ouvrir http://localhost:3000.

## Tests

```bash
npm test
```

Les tests couvrent la santé de l'API, les entrées manquantes et les erreurs de syntaxe. Ils ne valident pas la qualité des réponses LLM et ne nécessitent pas de clé API.

## API

- `GET /api/health` : état du service et disponibilité de la configuration LLM (jamais la clé).
- `POST /api/analyze` : corps JSON `{ "code": "function f() { return 1; }" }`. Réalise une analyse statique, puis une revue LLM. Le code est limité par défaut à 20 000 caractères.

## Limites et sécurité du prototype

- Le code soumis n'est pas exécuté. Esprima le parse seulement.
- Le code envoyé à l'API LLM quitte la machine locale : ne pas soumettre de secrets ou de code confidentiel.
- Un limiteur simple limite les requêtes API à 10 par minute et par adresse IP. Ce n'est pas une protection suffisante pour une exposition publique.
- Pas d'authentification, de persistance, de génération de tests ni d'exécution de tests dans ce premier incrément.
- Le CFG historique peut être incomplet ou indisponible selon la structure de code. La complexité héritée doit être considérée comme une mesure expérimentale, pas comme un résultat certifié.
- Avant tout déploiement public, ajouter une politique de confidentialité, une authentification si nécessaire, des limites de coût côté fournisseur, des journaux expurgés et une revue de sécurité.

## Prochaines étapes

1. Installer les dépendances et exécuter les tests.
2. Valider l'analyse avec les trois exemples du démonstrateur d'origine.
3. Comparer les constats IA à une revue humaine sur un jeu de code connu.
4. Ajouter la génération de tests Jest dans un environnement isolé, puis seulement ensuite le refactoring.
