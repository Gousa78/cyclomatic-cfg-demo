const esprima = require('esprima');
const fs = require('fs');
let nodeId = 0;

// Complexité cyclomatique
function calculateCyclomaticComplexity(ast) {
    let complexity = 1;

    function traverse(node) {
        if (!node) return;

        switch (node.type) {
            case 'IfStatement':
                complexity++;
                traverse(node.consequent);
                traverse(node.alternate);
                break;
            case 'ForStatement':
            case 'WhileStatement':
            case 'DoWhileStatement':
                complexity++;
                traverse(node.body);
                break;
            case 'SwitchCase':
                if (node.test) complexity++;
                node.consequent.forEach(traverse);
                break;
            case 'LogicalExpression':
                if (node.operator === '&&' || node.operator === '||') complexity++;
                traverse(node.left);
                traverse(node.right);
                break;
            case 'BlockStatement':
                node.body.forEach(traverse);
                break;
            default:
                for (let key in node) {
                    if (node[key] && typeof node[key] === 'object') traverse(node[key]);
                }
        }
    }

    traverse(ast);
    return complexity;
}

// Génération CFG
function buildCFG(node, parent = null, edges = [], nodes = []) {
    if (!node) return { nodes, edges };

    const current = { id: nodeId++, label: node.type };
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
                if (node[key] && typeof node[key] === 'object') {
                    buildCFG(node[key], current, edges, nodes);
                }
            }
    }

    return { nodes, edges };
}

// Export Graphviz .dot
function exportToDot(nodes, edges, filename) {
    let dot = 'digraph CFG {\n';
    nodes.forEach(n => dot += `  ${n.id} [label="${n.label}"];\n`);
    edges.forEach(e => dot += `  ${e.from} -> ${e.to};\n`);
    dot += '}';
    fs.writeFileSync(filename, dot);
}

module.exports = { calculateCyclomaticComplexity, buildCFG, exportToDot };