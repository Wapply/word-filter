const fs = require('fs');
const path = require('path');

const scriptPath = 'c:/coding/word-filter/rent-filter.user.js';
const streetsPath = 'c:/coding/word-filter/all_streets_final.json';

const streets = JSON.parse(fs.readFileSync(streetsPath, 'utf8'));
let script = fs.readFileSync(scriptPath, 'utf8');

// Sort streets by length descending
streets.sort((a, b) => b.length - a.length);

// 1. Update the STREETS array
const streetsArrayString = JSON.stringify(streets);
script = script.replace(/const STREETS = \[.*?\];/s, `const STREETS = ${streetsArrayString};`);

// 2. Update the regex
const regexBody = `\\\\b(${streets.join('|')})\\\\s*(?:,\\\\s*|al\\\\s+|al\\\\s*,\\\\s*)*(\\\\d+)\\\\b`;
script = script.replace(/const regexDireccion = new RegExp\(.*?, 'gi'\);/, `const regexDireccion = new RegExp(\`${regexBody}\`, 'gi');`);

// 3. Update normalization
script = script.replace(/const addrId = part\.value\.toUpperCase\(\)\.replace\(.*?\.trim\(\);/, `const addrId = part.value.toUpperCase().replace(/[^A-Z0-9]/g, ' ').replace(/\\s+/g, ' ').trim();`);

// 4. Update button text
script = script.replace(/btn\.textContent = seenApartments\.includes\(addrId\) \? ".*?" : "visto";/, `btn.textContent = seenApartments.includes(addrId) ? "Visto ✓" : "visto";`);

// 5. Update version
script = script.replace(/vversion      \d+\.\d+/, `version      4.6`);

fs.writeFileSync(scriptPath, script, 'utf8');
console.log('Script updated successfully with all 2412 streets.');
