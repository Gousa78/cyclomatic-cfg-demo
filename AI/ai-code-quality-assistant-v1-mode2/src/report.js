function interpretComplexity(value) {
    if (value === 1) return "Très simple";
    if (value <= 5) return "Simple";
    if (value <= 10) return "Modéré";
    if (value <= 20) return "Complexe";
    return "Très complexe ❗";
}

function printReport(name, complexity) {
    console.log("=================================");
    console.log(`Fonction : ${name}`);
    console.log(`Complexité : ${complexity}`);
    console.log(`Interprétation : ${interpretComplexity(complexity)}`);
    console.log(`Tests minimum recommandés : ${complexity}`);
    console.log("=================================\n");
}

module.exports = { printReport };