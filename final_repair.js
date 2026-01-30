const fs = require('fs');

const csvPath = 'c:/coding/word-filter/callejero.csv';
const scriptPath = 'c:/coding/word-filter/rent-filter.user.js';

// 1. Read CSV with latin1 to handle Spanish characters
const csvBuf = fs.readFileSync(csvPath);
const csvContent = csvBuf.toString('latin1');
const lines = csvContent.split(/\r?\n/).slice(1); // skip header

const streetSet = new Set();
for (const line of lines) {
    if (!line.trim()) continue;
    const parts = line.split(',');
    if (parts.length < 2) continue;

    let name = parts[1].trim().toUpperCase();
    if (!name || name === '0 (COLECTORA)') continue;

    streetSet.add(name);

    // Add variations (stripped prefixes)
    // Matches: AVENIDA, CALLE, BOULEVARD, DIAGONAL, PASEO, AV., PCA., PJE., AUTOPISTA, CAMINO, DIAG., B/P
    const cleanName = name.replace(/^(AVENIDA|CALLE|BOULEVARD|DIAGONAL|PASEO|AV\.|PCA\.|PJE\.|AUTOPISTA|CAMINO|DIAG\.|B\/P)\s+/i, '').trim();
    if (cleanName.length >= 3 && cleanName !== name) {
        streetSet.add(cleanName);
    }

    // Add variations (stripped suffixes like "- BATAN")
    const strippedSuffix = name.replace(/\s*[-].*$/, '').trim();
    if (strippedSuffix.length >= 3 && strippedSuffix !== name) {
        streetSet.add(strippedSuffix);
    }
}

const streets = Array.from(streetSet).sort((a, b) => b.length - a.length);

// 2. Read existing script
let script = fs.readFileSync(scriptPath, 'utf8');

// 3. Replace STREETS array with formatted multi-line version
const streetsChunks = [];
for (let i = 0; i < streets.length; i += 8) {
    streetsChunks.push(streets.slice(i, i + 8).map(s => JSON.stringify(s)).join(', '));
}
const formattedStreets = 'const STREETS = [\n        ' + streetsChunks.join(',\n        ') + '\n    ];';
script = script.replace(/const STREETS = \[.*?\];/s, formattedStreets);

// 4. Ensure dynamic regex
const dynamicRegexString = 'const regexDireccion = new RegExp(`\\\\b(${STREETS.join("|")})\\\\s*(?:,\\\\s*|al\\\\s+|al\\\\s*,\\\\s*)*(\\\\d+)\\\\b`, "gi");';
script = script.replace(/const regexDireccion = new RegExp\(.*?, "gi"\);|const regexDireccion = new RegExp\(.*?, 'gi'\);/, dynamicRegexString);

// 5. Ensure normalization and button text (UTF-8)
script = script.replace(/const addrId = part\.value\.toUpperCase\(\)\.replace\(.*?\.trim\(\);/, `const addrId = part.value.toUpperCase().replace(/[^A-Z0-9]/g, ' ').replace(/\\s+/g, ' ').trim();`);
script = script.replace(/btn\.textContent = seenApartments\.includes\(addrId\) \? ".*?" : "visto";/, 'btn.textContent = seenApartments.includes(addrId) ? "Visto ✓" : "visto";');

// 6. Final verification - search for common names to ensure encoding is good
const hasN = streets.some(s => s.includes('Ñ'));
console.log('Detected streets with Ñ:', hasN);

// 7. Write as UTF-8
fs.writeFileSync(scriptPath, script, 'utf8');
console.log(`Script finished with ${streets.length} streets correctly encoded.`);
