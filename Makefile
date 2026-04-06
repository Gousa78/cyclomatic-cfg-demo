# Variables
NODE=node
NPM=npm

# Cible par défaut
all: install analyze test

# 📦 Installer dépendances
install:
	$(NPM) install

# 🧠 Analyse locale (CFG + complexité)
analyze:
	$(NODE) index.js

# 🧪 Tests unitaires
test:
	$(NPM) test

# 🧪 Tests avec couverture
coverage:
	$(NPM) run test:coverage
	
# 💾 Git commit interactif (Windows cmd.exe)
git:
	@echo Running interactive Git commit...
	@git-commit.bat

# 🔍 Analyse Sonar locale (optionnel si sonar-scanner installé)
sonar:
	sonar-scanner \
	-Dsonar.projectKey=Gousa78_cyclomatic-cfg-demo \
	-Dsonar.organization=gousa78 \
	-Dsonar.sources=. \
	-Dsonar.javascript.lcov.reportPaths=coverage/lcov.info

# 🚀 Simulation CI/CD local
ci: install analyze coverage

# 🧹 Nettoyage
clean:
	rm -rf node_modules coverage *.svg *.dot