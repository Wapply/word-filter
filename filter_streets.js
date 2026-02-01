const fs = require('fs');
const scriptPath = 'c:/coding/word-filter/rent-filter.user.js';

let script = fs.readFileSync(scriptPath, 'utf8');

// Find the STREETS array block
const streetsMatch = script.match(/const STREETS = \[\s*([\s\S]*?)\s*\];/);
if (!streetsMatch) {
    console.error('Could not find STREETS array in script.');
    process.exit(1);
}

const rawArrayStr = streetsMatch[1];
// The array matches were joined by ", ". Let's parse them.
// We can use a trick: [ ... ] and eval or just parse with JSON if it's clean.
// Given it was built with JSON.stringify, it should be comma separated.
const streets = JSON.parse('[' + rawArrayStr + ']');

console.log('Total streets before filtering:', streets.length);

// Filtering logic: remove if it has a digit after a word (letter)
// [a-zA-Z] matches any letter. .* matches anything. \d matches any digit.
// In Spanish, we should include accented characters too: [a-zA-ZáéíóúÁÉÍÓÚñÑ]
const filteredStreets = streets.filter(name => {
    const hasDigitAfterWord = /[a-zA-ZáéíóúÁÉÍÓÚñÑ].*\d/.test(name);
    return !hasDigitAfterWord;
});

console.log('Total streets after filtering:', filteredStreets.length);

// Format the new array
const streetsChunks = [];
for (let i = 0; i < filteredStreets.length; i += 8) {
    streetsChunks.push(filteredStreets.slice(i, i + 8).map(s => JSON.stringify(s)).join(', '));
}
const formattedStreets = 'const STREETS = [\n        ' + streetsChunks.join(',\n        ') + '\n    ];';

const newScript = script.replace(/const STREETS = \[\s*[\s\S]*?\s*\];/, formattedStreets);

// Update version
const currentVersionMatch = script.match(/\/\/ @version\s+(\d+\.\d+)/);
if (currentVersionMatch) {
    const nextVersion = (parseFloat(currentVersionMatch[1]) + 0.1).toFixed(1);
    const updatedScript = newScript.replace(/\/\/ @version\s+\d+\.\d+/, `// @version      ${nextVersion}`);
    fs.writeFileSync(scriptPath, updatedScript, 'utf8');
    console.log(`Script updated to v${nextVersion}`);
} else {
    fs.writeFileSync(scriptPath, newScript, 'utf8');
    console.log('Script updated (version not found).');
}
