const fs = require('fs');

const scriptPath = 'c:/coding/word-filter/rent-filter.user.js';
const streetsPath = 'c:/coding/word-filter/all_streets_final.json';

const streets = JSON.parse(fs.readFileSync(streetsPath, 'utf8'));
let script = fs.readFileSync(scriptPath, 'utf8');

// Sort streets by length descending
streets.sort((a, b) => b.length - a.length);

// 1. Format STREETS array nicely across multiple lines
const streetsChunks = [];
for (let i = 0; i < streets.length; i += 10) {
    streetsChunks.push(streets.slice(i, i + 10).map(s => JSON.stringify(s)).join(', '));
}
const formattedStreets = 'const STREETS = [\n        ' + streetsChunks.join(',\n        ') + '\n    ];';

script = script.replace(/const STREETS = \[.*?\];/s, formattedStreets);

// 2. Update regex to use the variable instead of hardcoding the list again
// Note: We escape backslashes for the template literal string in the script
const dynamicRegexString = 'const regexDireccion = new RegExp(`\\\\b(${STREETS.join("|")})\\\\s*(?:,\\\\s*|al\\\\s+|al\\\\s*,\\\\s*)*(\\\\d+)\\\\b`, "gi");';
script = script.replace(/const regexDireccion = new RegExp\(.*?, "gi"\);|const regexDireccion = new RegExp\(.*?, 'gi'\);/, dynamicRegexString);

// 3. Ensure normalization is correct
script = script.replace(/const addrId = part\.value\.toUpperCase\(\)\.replace\(.*?\.trim\(\);/, `const addrId = part.value.toUpperCase().replace(/[^A-Z0-9]/g, ' ').replace(/\\s+/g, ' ').trim();`);

// 4. Update button text (ensure ✓ is handled correctly)
script = script.replace(/btn\.textContent = seenApartments\.includes\(addrId\) \? ".*?" : "visto";/, 'btn.textContent = seenApartments.includes(addrId) ? "Visto ✓" : "visto";');

// 5. Update version
script = script.replace(/\/\/ @version\s+\d+\.\d+/, '// @version      4.7');

fs.writeFileSync(scriptPath, script, 'utf8');
console.log('Script refactored successfully. Line length issues resolved.');
