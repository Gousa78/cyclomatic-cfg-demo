# 🎤 Plan de Démo – Cyclic Complexity + CFG

---

## 0️⃣ Préparation avant la démo

- 💻 **Code** 
  - [ ] `index.js` (script de complexité + CFG)  
  - [ ] `package.json` avec Esprima installé  
  - [ ] `.github/workflows/ci-cd-ghpages.yml` (workflow CI/CD)  
  - [ ] Branche `main` avec le code

- 🌐 **GitHub Pages** 
  - [ ] Branch = `gh-pages`  
  - [ ] Folder = `/` (root)

- ⚙️ **Actions / Permissions**  
  - [ ] Vérifier dans **Settings → Actions → General** :  
  - [ ] Workflow permissions = Read & write
  
- 💻 **Automatisation CFG**  
  - [ ] Vérifier que les SVG de CFG sont générés automatiquement par le workflow

> Esprima permet de transformer du code JavaScript en un arbre syntaxique, ce qui permet d’analyser sa structure de manière automatique

> CFG (Control Flow Graph) Graphe de flux de contrôle. AST (Abstract Syntax Tree)
---



## 1️⃣ Présentation


> La démo porte sur un outil d’analyse automatique de code JavaScript qui calcule la complexité cyclomatique ainsi qu’un nombre minimum de tests et génère des graphes de flux de contrôle (CFG) publiés sur GitHub Pages.

---

## 2️⃣ Struture du projet

![Langage](https://img.shields.io/badge/Langage-JavaScript-F7DF1E?logo=JavaScript)
![Langage](https://img.shields.io/badge/Langage-json-000000?logo=json)
![Editor](https://img.shields.io/badge/Apps-Notepadplusplus-90E59A?logo=notepadplusplus)
![Editor](https://img.shields.io/badge/github-repo-blue?logo=github)
![Editor](https://img.shields.io/badge/yml-CI/CD-green?logo=yaml)

📁 cyclomatic-analyzer    
├── 📄 index.js    
├── 📄 analyzer.js       
├── 📄 examples.js
├── 📄 report.js
├── 📄 package.json
├── 📄 index.html 
└── 📁 .github
	└── 📄 ci-cd-ghpages.yml
```

- 💻 Ouvrir `index.js`  
  - [ ] Fonction simple : pas de condition  
  - [ ] Fonction medium : 1 if/else  
  - [ ] Fonction complexe : conditions imbriquées + boucle 

> Ces trois fonctions ont une complexité croissante, ce qui se reflétera dans le graphe.

---

## 3️⃣ Principe
 
> Esprima est utilisé pour transformer le code en AST.  
> Ensuite, on parcourt l’AST pour compter les chemins conditionnels et générer automatiquement la complexité cyclomatique et les CFG.

Le code :
```JavaScript
if (x > y) {
    console.log("Hello");
}
```
👉 devient une structure comme :
```json
{
  "type": "IfStatement",
  "test": { "type": "BinaryExpression" },
  "consequent": { "type": "BlockStatement" }
}
```
---

## 4️⃣ Automatisation CI/CD

- ⚙️ Aller sur **GitHub → Actions**  
- ⚙️ Cliquer sur le workflow **CI/CD - Cyclomatic + CFG**  
- ⚙️ Cliquer sur le run le plus récent → `build_and_deploy`


> “À chaque push sur main, le pipeline se lance automatiquement, exécute le script d’analyse et déploie les SVG sur GitHub Pages.”

---

## 5️⃣ Logs de complexité

- ⚙️ Cliquer sur l’étape **Run analysis script**  
- ⚙️ Vérifier les résultats :  

| Fonction | Complexité cyclomatique |
|----------|-----------------------|
| simple   |          1            |
| medium   |          2           |
| complex  |          5          |


> “Le pipeline calcule automatiquement la complexité cyclomatique, indiquant le nombre minimal de tests pour chaque fonction.”

---

## 6️⃣  Le CFG 

- 🌐 Ouvrir dans le navigateur :  
  - [ ] `cfg_simple.svg`  
  - [ ] `cfg_medium.svg`  
  - [ ] `cfg_complex.svg`  

- 💻 Chaque graphe :  
  - Simple → 1 chemin → 1 test  
  - Medium → 2 chemins → 2 tests  
  - Complex → 5 chemins → 5 tests  


> Les branches et les chemins de chaque fonction sont affichés.

---

## 7️⃣ Déploiement GitHub Pages

- 🌐 Ouvrir l’URL racine GitHub Pages :  
  `https://gousa78.github.io/cyclomatic-cfg-demo/`

- 🌐 `index.html` :  
  - [ ] Liens vers les CFG  
  - [ ] Voir les SVG  


> Les diagrammes sont publiés automatiquement et accessibles publiquement.


- 🌐 Badge de couverture GitHub

![Coverage](https://img.shields.io/badge/coverage-${{ steps.coverage.outputs.coverage }}%25-green)
---

## 8️⃣ Conclusion


Cet outil permet de visualiser les chemins d’exécution, de calculer la complexité cyclomatique et d’automatiser le déploiement avec CI/CD.  
Il aide à comprendre où le code est complexe et combien de tests sont nécessaires.

**Intérêt pour le test logiciel** 	

La complexité cyclomatique permet de quantifier l’effort de test et de garantir une couverture complète des chemins d’exécution.
L’intérêt est de déterminer automatiquement combien de tests sont nécessaires pour couvrir tous les chemins d’un programme.

**Automatiser dans un pipeline CI/CD**

👉 Intérêt
- A chaque push → analyse automatique 
- Détection du code complexe 
- Possibilité de bloquer le code trop compliqué 

👉 Utilisé en entreprise pour :
- Qualité continue 
- Dette technique
