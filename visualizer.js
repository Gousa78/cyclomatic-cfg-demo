const esprima = require('esprima');
const fs = require('fs');
const { Module, render } = require('viz.js/full.render.js');
const Viz = require('viz.js');

const viz = new Viz({ Module, render });

// Créer un noeud unique
let nodeId = 0;
function createNode(label) {
    return { id: nodeId++, label };
}

// Construire CFG
function buildCFG(node, parent = null, edges = [], nodes = []) {
    if (!node) return { nodes, edges };
    const current = createNode(node.type);
    nodes.push(current);
    if (parent) edges.push({ from: parent.id, to: current.id });
    switch (node.type) {
        case 'IfStatement':
            buildCFG(node.consequent, current, edges, nodes);
            if (node.alternate) buildCFG(node.alternate, current, edges, nodes);
            break;
        case 'BlockStatement':
            node.body.forEach(stmt => buildCFG(stmt, current, edges, nodes));
            break;
        default:
            for (let key in node) {
                if (node[key] && typeof node[key] === 'object') buildCFG(node[key], current, edges, nodes);
            }
    }
    return { nodes, edges };
}

// Convertir CFG en format DOT
function cfgToDot(nodes, edges) {
    let dot = 'digraph CFG {\n';
    nodes.forEach(n => dot += `  ${n.id} [label="${n.label}", shape=box];\n`);
    edges.forEach(e => dot += `  ${e.from} -> ${e.to};\n`);
    dot += '}';
    return dot;
}

// Générer PNG
async function generatePNG(dot, filename) {
    const svg = await viz.renderString(dot, { format: 'svg' });
    fs.writeFileSync(filename, svg);
    console.log(`Graphique généré : ${filename}`);
}

// Exemple d'utilisation
async function visualizeFunction(fn, name) {
    nodeId = 0;
    const ast = esprima.parseScript(fn.toString());
    const { nodes, edges } = buildCFG(ast);
    const dot = cfgToDot(nodes, edges);
    await generatePNG(dot, `cfg_${name}.svg`);
}

// Export
module.exports = { visualizeFunction };