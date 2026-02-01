const fs = require('fs');
const scriptPath = 'c:/coding/word-filter/rent-filter.user.js';

let script = fs.readFileSync(scriptPath, 'utf8');

const streetsMatch = script.match(/const STREETS = \[\s*([\s\S]*?)\s*\];/);
if (!streetsMatch) {
    console.error('Could not find STREETS array.');
    process.exit(1);
}

const rawArrayStr = streetsMatch[1];
const streets = JSON.parse('[' + rawArrayStr + ']');

const titles = [
    "DOCTOR", "DOCTORA", "GENERAL", "INTENDENTE", "SOLDADO", "CABO", "TENIENTE", "CORONEL",
    "PRESIDENTE", "POETA", "PRESBITERO", "OBISPO", "MONSEÑOR", "INGENIERO", "SARGENTO",
    "SUBOFICIAL", "CAPITAN", "FRAGATA", "TENIENTE", "BRIGADIER", "PROFESOR", "PROFESORA",
    "MAESTRO", "MAESTRA", "COMANDANTE", "PILOTO", "JEFE", "PRESIDENTE"
];

const blacklist = new Set([
    "NORTE", "SUR", "ESTE", "OESTE", "BIS", "BATAN", "JULIO", "MAYO", "MARZO", "ABRIL",
    "JUNIO", "AGOSTO", "SETIEMBRE", "DICIEMBRE", "ENERO", "FEBRERO", "LAGO", "MAR",
    "COSTA", "BOSQUE", "PINOS", "RIVAS", "SANTA", "EL", "LA", "DE", "DEL", "LOS", "LAS"
]);

const newStreetsSet = new Set(streets);

function addClean(name) {
    if (!name) return;
    const clean = name.trim().replace(/^"|"$/g, '').trim();
    if (clean.length >= 4 && !/^\d+$/.test(clean) && !blacklist.has(clean)) {
        newStreetsSet.add(clean);
    }
}

streets.forEach(street => {
    let name = street.toUpperCase();

    // 1. Remove titles
    let nameWithoutTitles = name;
    titles.forEach(t => {
        const regex = new RegExp(`\\b${t}\\s*`, 'g');
        nameWithoutTitles = nameWithoutTitles.replace(regex, '');
    });
    addClean(nameWithoutTitles);

    // 2. Handle " DE " / " DEL " / " DE LA "
    const deParts = name.split(/\s(?:DE|DEL|DE\sLA)\s/);
    if (deParts.length > 1) {
        addClean(deParts[deParts.length - 1]);
    }

    // 3. Last word
    const words = nameWithoutTitles.trim().split(/\s+/);
    if (words.length > 1) {
        addClean(words[words.length - 1]);
    }

    // 4. Last two words
    if (words.length > 2) {
        addClean(words[words.length - 2] + ' ' + words[words.length - 1]);
    }

    // 5. Special case for Peralta Ramos
    if (name.includes("PERALTA RAMOS")) {
        addClean("PERALTA RAMOS");
    }

    // 6. Special case for Guemes (already handled by last word usually, but to be safe)
    if (name.includes("GUEMES")) {
        addClean("GUEMES");
    }
});

const finalStreets = Array.from(newStreetsSet).sort((a, b) => b.length - a.length);

console.log('Original streets:', streets.length);
console.log('Expanded streets:', finalStreets.length);

const streetsChunks = [];
for (let i = 0; i < finalStreets.length; i += 8) {
    streetsChunks.push(finalStreets.slice(i, i + 8).map(s => JSON.stringify(s)).join(', '));
}
const formattedStreets = 'const STREETS = [\n        ' + streetsChunks.join(',\n        ') + '\n    ];';

const newScript = script.replace(/const STREETS = \[\s*[\s\S]*?\s*\];/, formattedStreets);

// Update version
const currentVersionMatch = script.match(/\/\/ @version\s+(\d+\.\d+)/);
const nextVersion = currentVersionMatch ? (parseFloat(currentVersionMatch[1]) + 0.1).toFixed(1) : "5.0";
const updatedScript = newScript.replace(/\/\/ @version\s+\d+\.\d+/, `// @version      ${nextVersion}`);

fs.writeFileSync(scriptPath, updatedScript, 'utf8');
console.log(`Script updated to v${nextVersion}`);
