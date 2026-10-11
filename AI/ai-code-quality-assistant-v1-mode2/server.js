require('dotenv').config();
const express = require('express');
const path = require('path');
const rateLimit = require('express-rate-limit');
const { analyzeSource } = require('./src/analyze');
const { reviewCode } = require('./src/llm');

const app = express();
const port = Number(process.env.PORT || 3002);
const maxChars = Number(process.env.MAX_CODE_CHARS || 20000);


async function callFlowise(chatflowId, inputs, question) {
  const baseUrl = (process.env.FLOWISE_BASE_URL || '').replace(/\/+$/, '');

  if (!baseUrl || !chatflowId) {
    const error = new Error('La configuration Flowise est incomplète.');
    error.status = 503;
    error.code = 'FLOWISE_NOT_CONFIGURED';
    throw error;
  }

  let response;

  try {
    const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), 300000);

	try {
	  response = await fetch(
		`${baseUrl}/api/v1/prediction/${chatflowId}`,
		{
		  method: 'POST',
		  headers: { 'Content-Type': 'application/json' },
		  body: JSON.stringify({
			question,
			overrideConfig: inputs
		  }),
		  signal: controller.signal
		}
	  );
	} finally {
	  clearTimeout(timeout);
	}
    } catch (cause) {
    console.error('[Flowise] Erreur de connexion :', cause);

    const error = new Error(
      `Impossible de joindre Flowise : ${cause.message}`
    );
    error.status = 502;
    error.code = 'FLOWISE_CONNECTION_FAILED';
    throw error;
  }

  let data;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const error = new Error(
      'Flowise a refusé la requête. Vérifiez le Chatflow et ses variables.'
    );
    error.status = 502;
    error.code = 'FLOWISE_REQUEST_FAILED';
    throw error;
  }

  if (!data || typeof data.text !== 'string' || !data.text.trim()) {
    const error = new Error('Flowise n’a pas renvoyé de résultat textuel exploitable.');
    error.status = 502;
    error.code = 'FLOWISE_INVALID_RESPONSE';
    throw error;
  }

  return data.text;
}

  
app.disable('x-powered-by');
app.use(express.json({ limit: '100kb' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api/', rateLimit({ windowMs: 60 * 1000, limit: 10, standardHeaders: 'draft-8', legacyHeaders: false }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', llmConfigured: true, provider: 'ollama', baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434', model: process.env.OLLAMA_MODEL || 'llama3.2' });
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
        error.message = error.message || 'L’appel à Ollama a échoué. Vérifiez que le service est démarré et réessayez.';
      }
      throw error;
    }

    res.json({ success: true, staticAnalysis: analysis, aiReview });
  } catch (error) {
    next(error);
  }
});

app.post('/api/generate-tests', async (req, res, next) => {
  try {
    const code = req.body && req.body.code;

    if (typeof code !== 'string' || !code.trim()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'CODE_REQUIRED',
          message: 'Fournissez du code JavaScript non vide.'
        }
      });
    }

    if (code.length > maxChars) {
      return res.status(413).json({
        success: false,
        error: {
          code: 'CODE_TOO_LARGE',
          message: `Le code dépasse la limite de ${maxChars} caractères.`
        }
      });
    }
    const testPlan = await callFlowise(
      process.env.FLOWISE_TEST_PLAN_CHATFLOW_ID,
      { code },
      'Génère le plan de tests pour le code fourni.'
    );
    const jestCode = await callFlowise(
      process.env.FLOWISE_JEST_CHATFLOW_ID,
      {
        test_plan: testPlan,
        code
      },
      'Génère le fichier de tests Jest à partir du plan fourni.'
    );
    

	return res.json({
		success: true,
		testPlan,
		jestCode
	});
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
