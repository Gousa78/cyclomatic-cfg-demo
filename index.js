const esprima = require('esprima');
const { calculateCyclomaticComplexity, buildCFG, exportToDot } = require('./analyzer');
const { simple, medium, complex } = require('./examples');
const { printReport } = require('./report');
const { visualizeFunction } = require('./visualizer');


function analyzeFunction(fn, name) {
    const ast = esprima.parseScript(fn.toString());
	
	// Complexité cyclomatique
    const complexity = calculateCyclomaticComplexity(ast);
    printReport(name, complexity);
	
	// Générer CFG visuel
    const { nodes, edges } = buildCFG(ast);
    exportToDot(nodes, edges, `cfg_${name}.dot`);
    console.log(`CFG exporté : cfg_${name}.dot`);
}
// Analyser toutes les fonctions
(async () => {
    await visualizeFunction(simple, "simple");
    await visualizeFunction(medium, "medium");
    await visualizeFunction(complex, "complex");
})();

analyzeFunction(simple, "simple");
analyzeFunction(medium, "medium");
analyzeFunction(complex, "complex");