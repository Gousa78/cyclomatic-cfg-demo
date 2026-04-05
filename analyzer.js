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


// affichage graphe
function buildCFG(ast, sourceCode) {
    let nodes = [];
    let edges = [];
    let id = 0;

    function newNode(label) {
        const node = { id: id++, label };
        nodes.push(node);
        return node;
    }

    const start = newNode("Start");
    let current = start;

    function traverse(node) {
        if (!node) return;

        switch (node.type) {

			case "IfStatement":
				const cond = newNode("if");
				edges.push({ from: current.id, to: cond.id });

				const thenNode = newNode("then");
				const elseNode = newNode("else");

			// branches
				edges.push({ from: cond.id, to: thenNode.id, type: "true" });
				edges.push({ from: cond.id, to: elseNode.id, type: "false" });

			// 🔥 noeud de fusion
				const mergeNode = newNode("merge");

			// THEN
				current = thenNode;
					traverse(node.consequent);
					edges.push({ from: current.id, to: mergeNode.id });

			// ELSE
				current = elseNode;
					if (node.alternate) {
					traverse(node.alternate);
					}
				edges.push({ from: current.id, to: mergeNode.id });

			// reprendre après le if
				current = mergeNode;
				break;


            case "ForStatement":
                const loop = newNode("for");
                edges.push({ from: current.id, to: loop.id });

                current = loop;
                traverse(node.body);

                // boucle
                edges.push({ from: current.id, to: loop.id });
                break;
				
			case "ReturnStatement":
				let returnLabel = "return";

				if (node.argument) {
					const arg = sourceCode.substring(
						node.argument.range[0],
						node.argument.range[1]
					);
					returnLabel = `return ${arg}`;
				}

				const retNode = newNode(returnLabel);
				edges.push({ from: current.id, to: retNode.id });
				current = retNode;
				break;

			case "ExpressionStatement":
				let label = "expr";

				if (node.expression && node.expression.type === "CallExpression") {
					const callee = sourceCode.substring(
					node.expression.callee.range[0],
					node.expression.callee.range[1]
				);

				const args = node.expression.arguments.map(arg =>
				sourceCode.substring(arg.range[0], arg.range[1])
				).join(", ");

				label = `${callee}(${args})`;
			}

    const exprNode = newNode(label);
    edges.push({ from: current.id, to: exprNode.id });
    current = exprNode;
    break;

            case "BlockStatement":
                node.body.forEach(traverse);
                break;
        }
    }

    // 🔥 IMPORTANT : entrer dans la fonction
    const functionNode = ast.body[0];
    traverse(functionNode.body);

    const end = newNode("End");
    edges.push({ from: current.id, to: end.id });

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