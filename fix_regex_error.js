const fs = require('fs');
const scriptPath = 'c:/coding/word-filter/rent-filter.user.js';

let script = fs.readFileSync(scriptPath, 'utf8');

// 1. Prepare segments
const helperLine = "    // Helper to escape special regex characters\n    const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&');";
const regexLine = "    const regexDireccion = new RegExp(`\\\\b(${STREETS.map(escapeRegex).join(\"|\")})\\\\s*(?:,\\\\s*|al\\\\s+|al\\\\s*,\\\\s*)*(\\\\d+)\\\\b`, \"gi\");";

// 2. Locate insertion point
const target = '    const regexDireccion = new RegExp';
const index = script.indexOf(target);

if (index !== -1) {
    const lines = script.split('\n');
    const lineIndex = script.substring(0, index).split('\n').length - 1;

    // Replace the old regex line and prepend the helper
    lines[lineIndex] = helperLine + "\n\n" + regexLine;

    // Bump version if possible
    for (let i = 0; i < 20; i++) {
        if (lines[i].includes('@version')) {
            lines[i] = lines[i].replace(/(\d+\.)(\d+)/, (match, p1, p2) => p1 + (parseInt(p2) + 1));
            break;
        }
    }

    fs.writeFileSync(scriptPath, lines.join('\n'), 'utf8');
    console.log('Script updated successfully with regex escaping.');
} else {
    console.error('Could not find regex placement.');
}
