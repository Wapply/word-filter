const fs = require('fs');
const scriptPath = 'c:/coding/word-filter/rent-filter.user.js';

let script = fs.readFileSync(scriptPath, 'utf8');

// Replace corrupted markers with hex-defined strings to be encoding-safe
// \u2713 is the checkmark ✓
script = script.replace(/Visto V|Visto o"|Visto \?|Visto ?/g, 'Visto \u2713');

// Fix common encoding errors if any
script = script.replace(/\uFFFD/g, (match) => {
    // This is the replacement character, we don't know what it was.
    // However, we can try to find them in context or just leave them if they are in names.
    // In our case, the repair script already used Latin1 -> UTF8, so they should be fine.
    return match;
});

fs.writeFileSync(scriptPath, script, 'utf8');
console.log('Final character fix applied.');
