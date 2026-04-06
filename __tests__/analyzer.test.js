const { calculateCyclomaticComplexity } = require('../analyzer');
const esprima = require('esprima');

describe('Cyclomatic complexity', () => {

  test('fonction simple', () => {
    const code = `function f(){ return 1; }`;
    const ast = esprima.parseScript(code);

    const complexity = calculateCyclomaticComplexity(ast);
    expect(complexity).toBe(1);
  });

  test('fonction avec if', () => {
    const code = `
      function f(x){
        if(x > 0) return 1;
        else return 2;
      }
    `;
    const ast = esprima.parseScript(code);

    const complexity = calculateCyclomaticComplexity(ast);
    expect(complexity).toBeGreaterThan(1);
  });

});