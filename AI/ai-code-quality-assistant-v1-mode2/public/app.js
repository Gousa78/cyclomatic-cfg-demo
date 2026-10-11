
const codeInput = document.getElementById('codeInput');
const fileInput = document.getElementById('fileInput');
const charCount = document.getElementById('charCount');

const generateTestsBtn = document.getElementById('generateTestsBtn');
const testResultsPanel = document.getElementById('testResultsPanel');
const testStatus = document.getElementById('testStatus');
const testErrorBox = document.getElementById('testErrorBox');
const testPlanOutput = document.getElementById('testPlanOutput');
const jestCodeOutput = document.getElementById('jestCodeOutput');

function updateCount() {
  const n = codeInput.value.length;
  charCount.textContent =
    `${n.toLocaleString('fr-FR')} caractère${n > 1 ? 's' : ''}`;
}

function showTestError(message) {
  testErrorBox.textContent = message;
  testErrorBox.classList.remove('hidden');
}

function clearTestError() {
  testErrorBox.textContent = '';
  testErrorBox.classList.add('hidden');
}

codeInput.addEventListener('input', updateCount);

fileInput.addEventListener('change', async () => {
  const file = fileInput.files && fileInput.files[0];
  if (!file) return;

  if (!file.name.toLowerCase().endsWith('.js')) {
    showTestError('Choisissez un fichier portant l’extension .js.');
    fileInput.value = '';
    return;
  }

  if (file.size > 100 * 1024) {
    showTestError('Le fichier dépasse 100 Ko. Réduisez sa taille avant de le charger.');
    fileInput.value = '';
    return;
  }

  try {
    codeInput.value = await file.text();
    updateCount();
    clearTestError();
  } catch {
    showTestError('Impossible de lire le fichier sélectionné.');
  }
});

generateTestsBtn.addEventListener('click', async () => {
  clearTestError();

  if (!codeInput.value.trim()) {
    testResultsPanel.classList.remove('hidden');
    showTestError('Collez du code JavaScript ou importez un fichier .js.');
    testStatus.textContent = 'Erreur';
    testStatus.className = 'status';
    return;
  }

  testResultsPanel.classList.remove('hidden');
  testPlanOutput.textContent = '';
  jestCodeOutput.textContent = '';

  generateTestsBtn.disabled = true;
  generateTestsBtn.textContent = 'Génération en cours…';
  testStatus.textContent = 'Génération en cours';
  testStatus.className = 'status working';

  try {
    const response = await fetch('/api/generate-tests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: codeInput.value })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error?.message || `Erreur HTTP ${response.status}`
      );
    }

	testPlanOutput.textContent = data.testPlan;
	jestCodeOutput.textContent = data.jestCode;
	
	testStatus.textContent = 'Terminé';
	testStatus.className = 'status success';
		
  } catch (error) {
    showTestError(error.message || 'Une erreur est survenue.');
    testStatus.textContent = 'Erreur';
    testStatus.className = 'status';
  } finally {
    generateTestsBtn.disabled = false;
    generateTestsBtn.innerHTML =
      'Générer les tests Jest <span aria-hidden="true">→</span>';
  }
});

updateCount();
