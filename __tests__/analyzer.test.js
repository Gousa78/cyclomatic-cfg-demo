const esprima = require('esprima');
const fs = require('fs');

const {
    calculateCyclomaticComplexity,
    buildCFG,
    exportToDot
} = require('../analyzer');


// ============================================================
// 1. TESTS DE LA COMPLEXITÉ CYCLOMATIQUE
// ============================================================

describe('calculateCyclomaticComplexity()', () => {

    test('fonction simple : complexité = 1', () => {
        const source = `
            function simple(a) {
                return a * 2;
            }
        `;

        const ast = esprima.parseScript(source);

        expect(calculateCyclomaticComplexity(ast)).toBe(1);
    });


    test('fonction avec if : complexité = 2', () => {
        const source = `
            function test(x) {
                if (x > 0) {
                    return x;
                }

                return 0;
            }
        `;

        const ast = esprima.parseScript(source);

        expect(calculateCyclomaticComplexity(ast)).toBe(2);
    });


    test('fonction avec if / else : complexité = 2', () => {
        const source = `
            function test(x) {
                if (x > 0) {
                    return x;
                } else {
                    return -x;
                }
            }
        `;

        const ast = esprima.parseScript(source);

        expect(calculateCyclomaticComplexity(ast)).toBe(2);
    });


    test('fonction avec if / else if : complexité = 3', () => {
        const source = `
            function test(x) {
                if (x > 10) {
                    return 10;
                } else if (x > 0) {
                    return x;
                } else {
                    return 0;
                }
            }
        `;

        const ast = esprima.parseScript(source);

        expect(calculateCyclomaticComplexity(ast)).toBe(3);
    });


    test('fonction avec for : complexité = 2', () => {
        const source = `
            function test() {
                for (let i = 0; i < 10; i++) {
                    console.log(i);
                }
            }
        `;

        const ast = esprima.parseScript(source);

        expect(calculateCyclomaticComplexity(ast)).toBe(2);
    });


    test('fonction avec while : complexité = 2', () => {
        const source = `
            function test(x) {
                while (x > 0) {
                    x--;
                }
            }
        `;

        const ast = esprima.parseScript(source);

        expect(calculateCyclomaticComplexity(ast)).toBe(2);
    });


    test('fonction avec do...while : complexité = 2', () => {
        const source = `
            function test(x) {
                do {
                    x--;
                } while (x > 0);
            }
        `;

        const ast = esprima.parseScript(source);

        expect(calculateCyclomaticComplexity(ast)).toBe(2);
    });


    test('fonction avec switch : complexité = 3', () => {
        const source = `
            function test(x) {
                switch (x) {
                    case 1:
                        return 10;

                    case 2:
                        return 20;

                    default:
                        return 0;
                }
            }
        `;

        const ast = esprima.parseScript(source);

        expect(calculateCyclomaticComplexity(ast)).toBe(3);
    });


    test('fonction avec opérateurs && et || : complexité = 4', () => {
        const source = `
            function test(a, b, c) {
                if (a && b || c) {
                    return true;
                }

                return false;
            }
        `;

        const ast = esprima.parseScript(source);

        expect(calculateCyclomaticComplexity(ast)).toBe(4);
    });


    test('fonction complexe : complexité = 6', () => {
        const source = `
            function complex(a, b, c) {

                if (a > b) {

                    if (b > c) {
                        console.log(a);
                    }

                } else if (a === c) {
                    console.log(c);
                }

                for (let i = 0; i < 3; i++) {

                    if (i % 2 === 0) {
                        console.log(i);
                    }

                }

                return b;
            }
        `;

        const ast = esprima.parseScript(source);

        expect(calculateCyclomaticComplexity(ast)).toBe(6);
    });

});


// ============================================================
// 2. TESTS DE CONSTRUCTION DU CFG
// ============================================================

describe('buildCFG()', () => {

    test('le CFG contient un nœud Start et un nœud End', () => {

        const source = `
            function test(x) {
                return x;
            }
        `;

        const ast = esprima.parseScript(source, {
            range: true
        });

        const cfg = buildCFG(ast, source);

        const labels = cfg.nodes.map(node => node.label);

        expect(labels).toContain('Start');
        expect(labels).toContain('End');
    });


    test('le CFG contient un nœud if', () => {

        const source = `
            function test(x) {
                if (x > 0) {
                    return x;
                }

                return 0;
            }
        `;

        const ast = esprima.parseScript(source, {
            range: true
        });

        const cfg = buildCFG(ast, source);

        const labels = cfg.nodes.map(node => node.label);

        expect(labels).toContain('if');
    });


    test('le CFG contient les branches true et false du if', () => {

        const source = `
            function test(x) {
                if (x > 0) {
                    return x;
                }

                return 0;
            }
        `;

        const ast = esprima.parseScript(source, {
            range: true
        });

        const cfg = buildCFG(ast, source);

        const trueEdges = cfg.edges.filter(edge => edge.type === 'true');
        const falseEdges = cfg.edges.filter(edge => edge.type === 'false');

        expect(trueEdges.length).toBeGreaterThan(0);
        expect(falseEdges.length).toBeGreaterThan(0);
    });


    test('le CFG contient un nœud for', () => {

        const source = `
            function test() {
                for (let i = 0; i < 3; i++) {
                    console.log(i);
                }
            }
        `;

        const ast = esprima.parseScript(source, {
            range: true
        });

        const cfg = buildCFG(ast, source);

        const labels = cfg.nodes.map(node => node.label);

        expect(labels).toContain('for');
    });


    test('le CFG contient le retour avec son expression', () => {

        const source = `
            function test(x) {
                return x * 2;
            }
        `;

        const ast = esprima.parseScript(source, {
            range: true
        });

        const cfg = buildCFG(ast, source);

        const labels = cfg.nodes.map(node => node.label);

        expect(labels).toContain('return x * 2');
    });

	test('le CFG traite correctement une branche else', () => {

    const source = `
        function test(x) {
            if (x > 0) {
                return x;
            } else {
                return 0;
            }
        }
    `;

    const ast = esprima.parseScript(source, {
        range: true
    });

    const cfg = buildCFG(ast, source);

    const labels = cfg.nodes.map(node => node.label);

    expect(labels).toContain('if');
    expect(labels).toContain('then');
    expect(labels).toContain('else');
    expect(labels).toContain('return x');
    expect(labels).toContain('return 0');
    expect(labels).toContain('merge');
	});

	test('le CFG gère une expression qui n\'est pas un appel de fonction', () => {

    const source = `
        function test(x) {
            x++;
        }
    `;

    const ast = esprima.parseScript(source, {
        range: true
    });

    const cfg = buildCFG(ast, source);

    const labels = cfg.nodes.map(node => node.label);

    expect(labels).toContain('expr');
	});

	test('le CFG gère un return sans expression', () => {

    const source = `
        function test() {
            return;
        }
    `;

    const ast = esprima.parseScript(source, {
        range: true
    });

    const cfg = buildCFG(ast, source);

    const labels = cfg.nodes.map(node => node.label);

    expect(labels).toContain('return');
	});

    test('le CFG contient l\'appel console.log avec ses arguments', () => {

        const source = `
            function test(x) {
                console.log(x);
            }
        `;

        const ast = esprima.parseScript(source, {
            range: true
        });

        const cfg = buildCFG(ast, source);

        const labels = cfg.nodes.map(node => node.label);

        expect(labels).toContain('console.log(x)');
    });

});


// ============================================================
// 3. TEST DE L'EXPORT GRAPHVIZ
// ============================================================

describe('exportToDot()', () => {

    test('exporte correctement le CFG au format DOT', () => {

        const nodes = [
            { id: 0, label: 'Start' },
            { id: 1, label: 'return x' },
            { id: 2, label: 'End' }
        ];

        const edges = [
            { from: 0, to: 1 },
            { from: 1, to: 2 }
        ];

        const filename = '__tests__/test-output.dot';

        exportToDot(nodes, edges, filename);

        expect(fs.existsSync(filename)).toBe(true);

        const content = fs.readFileSync(filename, 'utf8');

        expect(content).toContain('digraph CFG');
        expect(content).toContain('Start');
        expect(content).toContain('return x');
        expect(content).toContain('End');
        expect(content).toContain('0 -> 1');
        expect(content).toContain('1 -> 2');

        // Nettoyage du fichier temporaire
        fs.unlinkSync(filename);
    });

});