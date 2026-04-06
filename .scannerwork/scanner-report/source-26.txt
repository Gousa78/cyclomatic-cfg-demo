const fs = require('fs');
const { Module, render } = require('viz.js/full.render.js');
const Viz = require('viz.js');

const viz = new Viz({ Module, render });

// Transformer CFG en DOT
function cfgToDot(nodes, edges, complexity) {
    let dot = 'digraph CFG {\n';

    // Style global
    dot += '  node [shape=box, style=filled, fontname="Arial"];\n';

    // NODES
    nodes.forEach(n => {
		let label = n.label.toLowerCase().trim();
		let color = "lightblue";

        if (n.label === "Start") color = "green";
        if (n.label === "End") color = "orange";
        if (n.label === "if") color = "yellow";
        if (n.label === "return") color = "lightgray";

        dot += `  ${n.id} [label="${n.label}", fillcolor="${color}"];\n`;
    });

    // EDGES avec True / False
    edges.forEach(e => {
        let label = "";
        let color = "black";

        if (e.type === "true") {
            label = "True";
            color = "green";
        } else if (e.type === "false") {
            label = "False";
            color = "red";
        }

        dot += `  ${e.from} -> ${e.to} [label="${label}", color="${color}"];\n`;
    });

    // Affichage complexité
    dot += `  label="Complexité cyclomatique = ${complexity}";\n`;
    dot += '  labelloc="t";\n';
    dot += '  fontsize=20;\n';

    dot += '}';
    return dot;
}

// Générer SVG
async function generateSVG(nodes, edges, complexity, filename) {
    const dot = cfgToDot(nodes, edges, complexity);
    const svg = await viz.renderString(dot);
    fs.writeFileSync(filename, svg);
    console.log(`✅ CFG amélioré : ${filename}`);
}

module.exports = { generateSVG };