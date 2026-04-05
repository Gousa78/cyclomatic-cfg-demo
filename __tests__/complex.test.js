
const { complex } = require('../examples');

describe('Tests de la fonction complex', () => {

    beforeEach(() => {
        jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
        console.log.mockRestore();
    });

    // ✅ Test 1 : a > b ET b > c
    test('a > b et b > c', () => {
        complex(5, 3, 1);
        expect(console.log).toHaveBeenCalledWith(5);
    });

    // ✅ Test 2 : a > b ET b <= c
    test('a > b et b <= c', () => {
        complex(5, 3, 10);
        expect(console.log).not.toHaveBeenCalledWith(5);
    });

    // ✅ Test 3 : a <= b ET a === c
    test('a <= b et a === c', () => {
        complex(3, 5, 3);
        expect(console.log).toHaveBeenCalledWith(3);
    });

    // ✅ Test 4 : a <= b ET a !== c
    test('a <= b et a !== c', () => {
        complex(2, 5, 3);
        expect(console.log).not.toHaveBeenCalledWith(3);
    });

    // ✅ Test 5 : boucle → i pair
    test('boucle affiche les nombres pairs', () => {
        complex(1, 2, 3);
        expect(console.log).toHaveBeenCalledWith(0);
        expect(console.log).toHaveBeenCalledWith(2);
    });

    // ✅ Test 6 : boucle → i impair
    test('boucle n’affiche pas les nombres impairs', () => {
        complex(1, 2, 3);
        expect(console.log).not.toHaveBeenCalledWith(1);
    });

});