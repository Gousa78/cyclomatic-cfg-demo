const { simple } = require('../examples');

describe('Tests de la fonction simple (multiplication par 2)', () => {

    // ✅ cas nominal
    test('multiplie un nombre positif par 2', () => {
        expect(simple(4)).toBe(8);
    });

    // 🔥 cas limite : zéro
    test('multiplie zéro', () => {
        expect(simple(0)).toBe(0);
    });

    // 🔥 cas négatif
    test('multiplie un nombre négatif', () => {
        expect(simple(-3)).toBe(-6);
    });

});