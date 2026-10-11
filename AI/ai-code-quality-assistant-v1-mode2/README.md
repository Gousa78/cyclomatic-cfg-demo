# AI Code Quality Assistant — MVP v0.2 (Ollama local)

Prototype web indépendant du démonstrateur GitHub Pages. L’application accepte du code JavaScript collé dans l’interface ou chargé depuis un fichier `.js`, lance une analyse statique avec Esprima et l’analyseur historique, puis demande à un modèle local via Ollama une revue pédagogique.

## Architecture

- Node.js + Express côté serveur.
- Esprima et `src/analyzer.js` pour la complexité et le CFG lorsque la structure est prise en charge.
- Ollama local via `POST /api/chat`, modèle par défaut `llama3.2`.
- Aucune clé OpenAI ni dépendance au cloud. Le code est envoyé au service Ollama configuré sur la machine ou le réseau local.

## Prérequis

- Node.js 20+ recommandé (pour `fetch` natif).
- Ollama installé et démarré.
- Modèle disponible : `ollama list`. Pour le télécharger si nécessaire : `ollama pull llama3.2`.

## Installation sous PowerShell

```powershell
npm install
Copy-Item .env.example .env
notepad .env
```

Valeurs par défaut du fichier `.env` :

```dotenv
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
OLLAMA_TIMEOUT_MS=120000
PORT=3000
MAX_CODE_CHARS=20000
```

Si Express tourne dans Docker, `localhost` désigne le conteneur Express. Il faudra utiliser le nom de service Docker ou l’adresse de l’hôte qui permet de joindre Ollama.

## Vérifier Ollama puis lancer l’application

```powershell
ollama list
Invoke-RestMethod -Uri http://localhost:11434/api/tags -Method Get
npm test
npm start
```

Ouvrir ensuite http://localhost:3000.

## API

- `GET /api/health` : indique la configuration choisie sans exposer de secret.
- `POST /api/analyze` : corps JSON `{ "code": "function f() { return 1; }" }`. L’analyse statique précède l’appel à Ollama. Limite par défaut : 20 000 caractères.

## Limites et sécurité

- Le code soumis n’est pas exécuté : Esprima l’analyse uniquement.
- Le LLM local peut produire des erreurs, des omissions ou des suggestions non pertinentes ; vérifier ses résultats.
- Le CFG historique peut être incomplet ou indisponible selon la structure du code. La complexité héritée est expérimentale, pas certifiée.
- Ollama doit rester accessible uniquement aux utilisateurs et applications de confiance. Ne publiez pas son port sur Internet sans contrôle d’accès et configuration de sécurité appropriés.
- Le serveur applique un limiteur simple de requêtes ; ce n’est pas une protection suffisante pour une exposition publique.
- Cette version ne génère pas de fichiers de tests et n’exécute aucun code généré.

## Étapes suivantes

1. Valider localement la connexion à Ollama et exécuter les tests Jest.
2. Comparer les constats de `llama3.2` à une revue humaine sur un corpus connu.
3. Ajouter la génération de tests Jest dans un environnement isolé, puis seulement ensuite le refactoring.
