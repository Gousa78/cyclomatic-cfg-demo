require('dotenv').config();
const express = require('express');
const path = require('path');
const rateLimit = require('express-rate-limit');
const { analyzeSource } = require('./src/analyze');
const { reviewCode } = require('./src/llm');

const app = express();
const port = Number(process.env.PORT || 3002);
const maxChars = Number(process.env.MAX_CODE_CHARS || 20000);

app.disable('x-powered-by');
app.use(express.json({ limit: '100kb' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api/', rateLimit({ windowMs: 60 * 1000, limit: 10, standardHeaders: 'draft-8', legacyHeaders: false }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', llmConfigured: Boolean(process.env.OPENAI_API_KEY), model: process.env.OPENAI_MODEL || 'gpt-5.4-mini' });
});

app.post('/api/analyze', async (req, res, next) => {
  try {
    const code = req.body && req.body.code;
    if (typeof code !== 'string' || !code.trim()) {
      return res.status(400).json({ success: false, error: { code: 'CODE_REQUIRED', message: 'Fournissez du code JavaScript non vide.' } });
    }
    if (code.length > maxChars) {
      return res.status(413).json({ success: false, error: { code: 'CODE_TOO_LARGE', message: `Le code dépasse la limite de ${maxChars} caractères.` } });
    }

    const analysis = analyzeSource(code);
    let aiReview;
    try {
      aiReview = await reviewCode(code, analysis);
    } catch (error) {
      if (error.status === 503) {
        return res.status(503).json({
          success: false,
          staticAnalysis: analysis,
          error: { code: error.code, message: error.message }
        });
      }
      if (error.status === 429) {
        error.status = 429;
        error.code = 'LLM_RATE_LIMIT';
        error.message = 'Limite de requêtes du fournisseur LLM atteinte. Réessayez plus tard.';
      } else if (!error.status) {
        error.status = 502;
        error.code = 'LLM_REQUEST_FAILED';
        error.message = 'L’appel au fournisseur LLM a échoué. Vérifiez la configuration et réessayez.';
      }
      throw error;
    }

    res.json({ success: true, staticAnalysis: analysis, aiReview });
  } catch (error) {
    next(error);
  }
});

app.use((error, _req, res, _next) => {
  const status = Number.isInteger(error.status) ? error.status : 500;
  res.status(status).json({
    success: false,
    error: {
      code: error.code || 'INTERNAL_ERROR',
      message: status >= 500 && status !== 503 && status !== 502 ? 'Une erreur interne est survenue.' : error.message
    }
  });
});

if (require.main === module) {
  app.listen(port, () => console.log(`AI Code Quality Assistant disponible sur http://localhost:${port}`));
}

module.exports = app;
