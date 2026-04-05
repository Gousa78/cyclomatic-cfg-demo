const { medium } = require('../examples');

describe('Tests de la fonction medium', () => {

    // ✅ chemin 1 : x > y
    test('retourne x si x > y', () => {
        expect(medium(5, 3)).toBe(5);
    });

    // ✅ chemin 2 : x <= y
    test('retourne y si x <= y', () => {
        expect(medium(2, 4)).toBe(4);
    });

    // 🔥 cas limite (égalité)
    test('retourne y si x === y', () => {
        expect(medium(3, 3)).toBe(3);
    });

});