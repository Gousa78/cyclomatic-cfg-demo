const esprima = require('esprima');
const { calculateCyclomaticComplexity, buildCFG } = require('./analyzer');

function interpretComplexity(value) {
  if (value === 1) return 'Très simple';
  if (value <= 5) return 'Simple';
  if (value <= 10) return 'Modéré';
  if (value <= 20) return 'Complexe';
  return 'Très complexe';
}

function analyzeSource(code) {
  let ast;
  try {
    ast = esprima.parseScript(code, { range: true, loc: true });
  } catch (error) {
    const err = new Error(`Syntaxe JavaScript invalide : ${error.description || error.message}`);
    err.status = 400;
    err.code = 'INVALID_JAVASCRIPT';
    throw err;
  }

  const complexity = calculateCyclomaticComplexity(ast);
  let cfg = null;
  let cfgNotice = null;
  const first = ast.body[0];
  if (ast.body.length === 1 && first && first.type === 'FunctionDeclaration') {
    try {
      cfg = buildCFG(ast, code);
    } catch (error) {
      // Le CFG du dépôt historique est volontairement traité comme best effort.
      cfgNotice = 'Le code a été analysé, mais le CFG n’a pas pu être construit par le visualiseur historique.';
    }
  } else {
    cfgNotice = 'Pour cette version, le CFG est affiché uniquement pour un fichier contenant une seule déclaration de fonction.';
  }

  return {
    complexity,
    interpretation: interpretComplexity(complexity),
    cfg,
    cfgNotice,
    sourceLines: code.split(/\r?\n/).length,
    functionName: first && first.type === 'FunctionDeclaration' ? first.id.name : null
  };
}

module.exports = { analyzeSource, interpretComplexity };
