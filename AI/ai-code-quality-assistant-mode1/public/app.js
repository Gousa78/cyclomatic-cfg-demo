const codeInput = document.getElementById('codeInput');
const fileInput = document.getElementById('fileInput');
const analyzeBtn = document.getElementById('analyzeBtn');
const charCount = document.getElementById('charCount');
const statusEl = document.getElementById('status');
const emptyState = document.getElementById('emptyState');
const results = document.getElementById('results');
const errorBox = document.getElementById('errorBox');

function updateCount() {
  const n = codeInput.value.length;
  charCount.textContent = `${n.toLocaleString('fr-FR')} caractère${n > 1 ? 's' : ''}`;
}
function setStatus(text, kind = '') {
  statusEl.textContent = text;
  statusEl.className = `status ${kind}`.trim();
}
function showError(message) {
  errorBox.textContent = message;
  errorBox.classList.remove('hidden');
}
function clearError() { errorBox.classList.add('hidden'); errorBox.textContent = ''; }
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

codeInput.addEventListener('input', updateCount);
fileInput.addEventListener('change', async () => {
  const file = fileInput.files && fileInput.files[0];
  if (!file) return;
  if (!file.name.toLowerCase().endsWith('.js')) {
    showError('Choisissez un fichier portant l’extension .js.');
    fileInput.value = '';
    return;
  }
  if (file.size > 100 * 1024) {
    showError('Le fichier dépasse 100 Ko. Réduisez sa taille avant de le charger.');
    fileInput.value = '';
    return;
  }
  codeInput.value = await file.text();
  updateCount();
  clearError();
});

analyzeBtn.addEventListener('click', async () => {
  clearError();
  results.classList.add('hidden');
  emptyState.classList.remove('hidden');
  if (!codeInput.value.trim()) {
    showError('Collez du code JavaScript ou importez un fichier .js.');
    return;
  }
  analyzeBtn.disabled = true;
  analyzeBtn.textContent = 'Analyse en cours…';
  setStatus('Analyse en cours', 'working');
  emptyState.querySelector('h4').textContent = 'Analyse statique et revue IA en cours…';
  emptyState.querySelector('p').textContent = 'La durée dépend du fournisseur de modèle et de la taille du code.';
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: codeInput.value })
    });
    const data = await response.json();
    if (!response.ok) {
      if (data.staticAnalysis) renderStatic(data.staticAnalysis);
      throw new Error(data.error?.message || `Erreur HTTP ${response.status}`);
    }
    renderStatic(data.staticAnalysis);
    document.getElementById('aiText').textContent = data.aiReview.text;
    document.getElementById('usage').textContent = data.aiReview.usage
      ? `Modèle : ${data.aiReview.model} · Tokens : ${data.aiReview.usage.inputTokens} entrée / ${data.aiReview.usage.outputTokens} sortie`
      : `Modèle : ${data.aiReview.model}`;
    setStatus('Terminé', 'success');
  } catch (error) {
    showError(error.message || 'Une erreur est survenue.');
    if (!results.classList.contains('hidden')) setStatus('Partiel', '');
    else setStatus('Erreur', '');
  } finally {
    analyzeBtn.disabled = false;
    analyzeBtn.innerHTML = 'Analyser avec l’IA <span aria-hidden="true">→</span>';
    emptyState.querySelector('h4').textContent = 'Votre analyse apparaîtra ici';
    emptyState.querySelector('p').textContent = 'Complexité cyclomatique, graphe de contrôle quand il est pris en charge, puis revue IA.';
  }
});

function renderStatic(analysis) {
  document.getElementById('complexity').textContent = analysis.complexity;
  document.getElementById('interpretation').textContent = analysis.interpretation;
  document.getElementById('lines').textContent = analysis.sourceLines;
  const notice = document.getElementById('cfgNotice');
  if (analysis.cfgNotice) {
    notice.textContent = analysis.cfgNotice;
    notice.classList.remove('hidden');
  } else notice.classList.add('hidden');
  document.getElementById('cfgDetails').textContent = analysis.cfg
    ? JSON.stringify(analysis.cfg, null, 2)
    : 'CFG non disponible pour cette structure de code.';
  emptyState.classList.add('hidden');
  results.classList.remove('hidden');
}
updateCount();
