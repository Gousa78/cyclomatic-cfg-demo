const esprima = require('esprima');
const { calculateCyclomaticComplexity, buildCFG, exportToDot } = require('./analyzer');
const { simple, medium, complex } = require('./examples');
const { printReport } = require('./report');
const { generateSVG } = require('./visualizer');

// ajout d'une trace
console.log("=== ANALYSE EN COURS ===");
async function analyzeFunction(fn, name) {
    const ast = esprima.parseScript(fn.toString());
	// const ast = esprima.parseScript(fn.toString(), { range: true });
	
    const complexity = calculateCyclomaticComplexity(ast);
    printReport(name, complexity);

    const { nodes, edges } = buildCFG(ast);

    // 🔥 Générer SVG avec TON CFG
	await generateSVG(nodes, edges, complexity, `cfg_${name}.svg`);
}

// Analyser toutes les fonctions

analyzeFunction(simple, "simple");
analyzeFunction(medium, "medium");
analyzeFunction(complex, "complex");