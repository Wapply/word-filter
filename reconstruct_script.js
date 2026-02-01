const fs = require('fs');
const scriptPath = 'c:/coding/word-filter/rent-filter.user.js';

let script = fs.readFileSync(scriptPath, 'utf8');

const streetsMatch = script.match(/const STREETS = \[\s*([\s\S]*?)\s*\];/);
if (!streetsMatch) {
    console.error('Could not find STREETS.');
    process.exit(1);
}

const reconstruction = `    };

    const LIMITE = 780000;
    const regexMontos = /(?:(?:U\\$S|\\$)\\s?)?(?:\\d{1,3}(?:[.,]\\d{3})+|\\d{6,})(?!\\d)/gi;

    // Helper to escape special regex characters
    const escapeRegex = (str) => str.replace(/[.*+?^$\${}()|[\\]\\\\]/g, '\\\\$&');

    // Improved Regex to handle "al", commas, and spaces
    const regexDireccion = new RegExp(\`\\\\b(\${STREETS.map(escapeRegex).join("|")})\\\\s*(?:,\\\\s*|al\\\\s+|al\\\\s*,\\\\s*)*(\\\\d+)\\\\b\`, "gi");

    // Persistence for 'seen' apartments
    let seenApartments = GM_getValue('seen_apartments', []);

    GM_addStyle(\`
        .visto-btn { margin-left: 5px; padding: 2px 5px; font-size: 10px; cursor: pointer; background: #666; color: white; border: 1px solid #999; border-radius: 3px; }
        .visto-btn:hover { background: #444; }
        .visto-btn.active { background: #28a745; border-color: #1e7e34; }
        .address-seen { text-decoration: line-through; opacity: 0.6; }
    \`);`;

// We need to find the start of 'let filtros' and replace up to 'function normalizarMonto'
const startToken = 'let filtros = {';
const endToken = 'function normalizarMonto';

const startIndex = script.indexOf(startToken);
const endIndex = script.indexOf(endToken);

if (startIndex !== -1 && endIndex !== -1) {
    // Find the end of the filtros object (first }; after startIndex)
    // Actually, I'll just replace the whole mess in between.

    // Let's be more precise: replace from the first 'rojo:' line to before endToken
    const firstSection = script.substring(0, startIndex + startToken.length);
    const lastSection = script.substring(endIndex);

    // The filtros content needs to be preserved
    const rojo = '        rojo: ["marzo", "diciembre", "estudiantes", "estudiante", "estudiantil", "temporal", "9 meses", "12 meses", "sin gas", "reservado", "temporada", "temporario"],';
    const verde = '        verde: ["24 meses", "lavadero", "garantia propietaria", "ICL"],';
    const amarillo = '        amarillo: ["recibo de sueldo", "demostracion de ingresos", "USD"]';

    const fullFiltros = `\n${rojo}\n${verde}\n${amarillo}\n`;

    const newScript = firstSection + fullFiltros + reconstruction + "\n\n    " + lastSection;

    fs.writeFileSync(scriptPath, newScript, 'utf8');
    console.log('Script fully reconstructed and fixed.');
} else {
    console.error('Could not locate markers for reconstruction.');
}
