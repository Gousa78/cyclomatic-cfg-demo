function simple(a) {
    return a * 2;
}

function medium(x, y) {
    if (x > y) {
        return x;
    } else {
        return y;
    }
}

function complex(a, b, c) {
    if (a > b) {
        if (b > c) console.log(a);
    } else if (a === c) {
        console.log(c);
    }

    for (let i = 0; i < 3; i++) {
        if (i % 2 === 0) console.log(i);
    }

    return b;
}

module.exports = { simple, medium, complex };