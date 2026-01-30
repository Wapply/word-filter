// ==UserScript==
// @name         Rent Filter
// @description  A Word Filter Script with MutationObserver and GTM Safety
// @author       Wapply
// @namespace    http://tampermonkey.net/
// @updateURL    https://raw.githubusercontent.com/Wapply/word-filter/main/rent-filter.user.js
// @downloadURL  https://raw.githubusercontent.com/Wapply/word-filter/main/rent-filter.user.js
// @version      4.2
// @match        *://*/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// ==/UserScript==

(function () {
    'use strict';

    // List of streets (sorted by length descending for better matching)
    // Includes variations for informal matching (stripped prefixes and suffixes)
    const STREETS = ["PASEO COSTANERO DEL SUD PRESIDENTE ARTURO HUMBERTO ILLIA", "AVENIDA PRESIDENTE ARTURO ALBERTO ILLIA", "AVENIDA PRESIDENTE JUAN DOMINGO PERON", "COLECTORA AVENIDA MARIO BRAVO", "AUTOPISTA  MAR DEL PLATA - BALCARCE", "COLECTORA AUTOPISTA MAR DEL PLATA-BS AS", "AVENIDA FERNANDEZ DE LA CRUZ", "BOULEVARD MARITIMO PATRICIO PERALTA RAMOS", "PASEO ADOLFO DAVILA", "AVENIDA DOCTOR ARTURO ALIEGRO", "AVENIDA CARLOS GARDEL", "AVENIDA ERNESTO  CH. GUEVARA", "AVENIDA VICTORIO TETTAMANTI", "AVENIDA JACINTO PERALTA RAMOS", "AUTOPISTA MAR DEL PLATA-BS AS", "AVENIDA DOCTOR JORGE NEWBERY", "MONSE?OR ENRIQUE RAU", "AVENIDA FORTUNATO DE LA PLAZA", "DIAGONAL ESTADOS UNIDOS DE AMERICA", "AVENIDA GABRIEL DEL MAZO", "AVENIDA MONSE?OR ENRIQUE RAU", "AVENIDA BERNARDINO RIVADAVIA", "AVENIDA ANTARTIDA ARGENTINA", "BOULEVARD MARITIMO PATRICIO PERALTA RAMOS", "BOULEVARD PATRICIO PERALTA RAMOS", "PATRICIO PERALTA RAMOS", "AVENIDA CONSTITUCION", "AVENIDA INDEPENDENCIA", "AVENIDA JUAN HECTOR JARA", "AVENIDA JUAN BUSTO", "AVENIDA REPUBLICA DE CUBA", "AVENIDA DOCTOR JUAN B. JUSTO", "DIAGONAL JUAN DE GARAY", "AVENIDA PEDRO LURO", "AVENIDA ARTURO ALIEGRO", "AVENIDA MARIO BRAVO", "CAMINO DEL MATADERO", "ESTANCIA CABO CORRIENTES", "AVENIDA 25 DE MAYO", "AVENIDA PASO", "AVENIDA TETTAMANTI", "AVENIDA DE LOS TRABAJADORES", "AVENIDA MARTINEZ DE HOZ", "AVENIDA PATRICIO PERALTA RAMOS", "PRESIDENTE ARTURO HUMBERTO ILLIA", "PRESIDENTE ARTURO ALBERTO ILLIA", "PRESIDENTE JUAN DOMINGO PERON", "ESTADOS UNIDOS DE AMERICA", "FORTUNATO DE LA PLAZA", "DOCTOR ARTURO ALIEGRO", "ERNESTO  CH. GUEVARA", "VICTORIO TETTAMANTI", "JACINTO PERALTA RAMOS", "AUTOPISTA MAR DEL PLATA-BS AS", "DOCTOR JORGE NEWBERY", "GABRIEL DEL MAZO", "MONSE?OR ENRIQUE RAU", "BERNARDINO RIVADAVIA", "ANTARTIDA ARGENTINA", "JUAN HECTOR JARA", "REPUBLICA DE CUBA", "DOCTOR JUAN B. JUSTO", "MARITIMO PATRICIO PERALTA RAMOS", "PATRICIO PERALTA RAMOS", "JUAN DE GARAY", "MARTINEZ DE HOZ", "DE LOS TRABAJADORES", "FRENCH DOMINGO", "PERALTA RAMOS", "CALLE 27 B", "RIO JACHAL", "CALLE 11 B", "RIO BLANCO", "CALLE 30 B", "CALLE 31 B", "CALLE 10 B", "RIO CURACO", "CALLE 17 B", "SAN BENITO", "JOSE MARTI", "DEL LUCERO", "LOS ROBLES", "CALLE 23 B", "CALLE 18 B", "ROCA JULIO", "CALLE 24 B", "CALLE 53 B", "EL ROSILLO", "DEL ALJIBE", "CALLE 16 B", "GOLONDRINA", "CALLE 55 B", "GUAYCURUES", "B/P FOCA B", "9 DE JULIO", "EL TOBIANO", "LUIS AGOTE", "CALLE 20 B", "B/P MARLIN", "CALLE 56 B", "LOS SAUCES", "EL TAJAMAR", "CALLE 19 B", "CALLE 22 B", "B/P ALTAIR", "ALMAFUERTE", "EL REMANSO", "CALLE 13 B", "LOS NARDOS", "LA GAVIOTA", "LA SERRANA", "RIO SUQUIA", "25 DE MAYO", "LOS MIRLOS", "GENOVA BIS", "CALLE 15 B", "PAGO CHICO", "SANTA INES", "CERRO AZUL", "SAN MARTIN", "LA ALONDRA", "SANTA CRUZ", "LOS OMBUES", "CANAI QUEN", "ATAHUALPA", "CHACABUCO", "LOS TAPES", "MARGARITA", "MOCTEZUMA", "RAUCH BIS", "ARUCANOS", "CATAMARCA", "LOS INCAS", "ARRIBE?OS", "PATAGONIA", "ARGENTINA", "LOS OLMOS", "PATAGONES", "CALLE 8 B", "EL JAGUEL", "EL HORCON", "SEMBRADOR", "INCA HUEN", "EL TEJADO", "GUILLERMO", "O'HIGGINS", "GUANAHANI", "CALLE 6 C", "EL RECADO", "CALLE 6 B", "EL RINCON", "CALLE 7 B", "NATIVIDAD", "SAN PEDRO", "EL ALAZAN", "SARMIENTO", "DON BOSCO", "ITUZAINGO", "CALLE 1 C", "CALLE 1 B", "CALLE 5 C", "ORO NEGRO", "FRANCISCO", "FRANCISCA", "CALLE 9 B", "CALLE 5 B", "CALLE 9 C", "CALFUCURA", "FLORENCIO", "FLORENCIA", "GERTRUDIS", "VALENTINA", "EL ZORZAL", "OLAVARRIA", "PALESTINA", "1 DE MAYO", "ESPIGON 7", "VENEZUELA", "ESPIGON 3", "LAS LISAS", "LAS LOMAS", "LAS HERAS", "LAS HAYAS", "LAS ROSAS", "RIO DULCE", "LAS ORCAS", "COLECTORA", "LAS FOCAS", "RIO NEGRO", "LA SURE?A", "RIO PINTO", "LAS CALAS", "RIO LIMAY", "RIO LULES", "NAHUELPAN", "AVENIDA 7", "LOMBARDIA", "AVENIDA 8", "CALLE 4 B", "LOS ARCES", "CALLE 3 C", "CALLE 3 B", "RIO ATUEL", "RIO BELEN", "LA PERDIZ", "AZCUENAGA", "DEL TEJAR", "Juan Acha", "RIO TEUCO", "LA LAGUNA", "RIVADAVIA", "LA LOMADA", "LA MATERA", "CALLE 2 B", "LOS TILOS", "CALLE 2 C", "JURAMENTO", "NAMUNCURA", "LA AGUADA", "LA CUESTA", "LA AURORA", "LA COLINA", "PARAGUAY", "AGUATERO", "PATRICIA", "PUCO YAN", "PUELCHES", "PEUMAYEN", "PRINGLES", "PRAXEDES", "PORTUGAL", "RUMEN CO", "SANTA FE", "SAN LUIS", "SAN JUAN", "RIO MAYO", "JOSEFINA", "CHINGOLO", "CHARRUAS", "BALCARCE", "B/P FOCA", "FAUSTINO", "AYACUCHO", "LOS TALA", "CIPRESES", "DIAGONAL", "CHARLONE", "BELL MAR", "BELGRANO", "EL CERRO", "CATALU?A", "EL CHAJA", "MALVINAS", "MANSILLA", "ARENALES", "BAUTISTA", "LA POSTA", "LA RIOJA", "LABARDEN", "LAMADRID", "COLOMBIA", "COLIQUEO", "ASTURIAS", "LA LAURA", "LITUANIA", "LA PAMPA", "GUERNICA", "MERCEDES", "MENENDEZ", "Nogueira", "EL RODEO", "EL MONTE", "NORBERTO", "El Sulky", "AMEGHINO", "EL ZAINO", "GREGORIO", "MOCOBIES", "GRACIELA", "NECOCHEA", "CARDENAL", "BRANDSEN", "EL VALLE", "MISIONES", "EL TORDO", "El Mateo", "EVARISTO", "LA LEGUA", "MONSALVO", "CALABRIA", "HERRERIA", "EL MIXTO", "LAFQUEN", "USHUAIA", "ENRIQUE", "LAPRIDA", "BRIGIDA", "GALICIA", "RODOLFO", "FALUCHO", "YOLANDA", "FRANCIA", "FORMOSA", "VIEYTES", "LA LOMA", "OSVALDO", "DANIELA", "LA TABA", "GABRIEL", "EVELINA", "EUGENIA", "ROBERTO", "CABILDO", "DORREGO", "BERMEJO", "ECUADOR", "DOMINGO", "JOAQUIN", "DOROTEA", "JACINTO", "BOLIVIA", "EL LAZO", "HUARPES", "BOLIVAR", "Hermida", "EL CANO", "ISIDORO", "SICILIA", "IGNACIO", "ROTONDA", "RONDEAU", "HILARIO", "BRAULIO", "URUGUAY", "TUCUMAN", "BEATRIZ", "BELGICA", "TINGUES", "GUAYANA", "TOSCANA", "EL TERO", "LUCIANO", "PIERINA", "MARIANO", "CHOCORI", "MATILDE", "PI?ACAL", "CERRITO", "NAPOLES", "ADRIANA", "CLAUDIA", "PASCUAL", "LUCANIA", "PEHUAJO", "MANGORE", "NATALIA", "CASEROS", "ARMENIA", "ALELIES", "CAROYAS", "MARCELA", "OLLEROS", "ARMANDO", "CALLE14", "NARCISO", "ACACIAS", "LETICIA", "LEGH II", "CECILIA", "LINIERS", "LILIANA", "CORDOBA", "PILAGAS", "MARIANA", "LEANDRO", "PASTEUR", "NEUQUEN", "MENDOZA", "POSADAS", "MELINAO", "RICARDO", "LOBERIA", "POLONIA", "SILVIA", "EGIDIO", "MARTIN", "GENARO", "ISABEL", "NESTOR", "ANGELA", "HUILEN", "MIGUEL", "ALVARO", "MEJICO", "PERDIZ", "PELAYO", "MORENO", "GRECIA", "CANADA", "Cannes", "CARLOS", "BRASIL", "SUSANA", "TANDIL", "EMILIO", "GENOVA", "Catani", "ADOLFO", "HECTOR", "HAYDIN", "TERESA", "HIGINO", "ANALIA", "ROSANA", "WALTER", "DERQUI", "RAQUEL", "AYELEP", "CHUBUT", "ESTELA", "ALICIA", "VULCAN", "AYOLAS", "RAWSON", "LLIFEN", "OVIDIO", "Zurita", "DAMIAN", "DANIEL", "YAPEYU", "FABIAN", "JULIAN", "FELIPE", "JUNCAL", "ARTURO", "ESQUEL", "LARREA", "MARCOS", "VICTOR", "ARAGON", "ESPA?A", "PINCEN", "GABOTO", "CEDROS", "FRIULI", "ITALIA", "ALSINA", "OFELIA", "AROMOS", "VIEDMA", "FRANCA", "PARANA", "CAMILO", "ESTER", "Farro", "OSCAR", "PABLO", "ELINA", "NOEMI", "TULIO", "FELIX", "UDINE", "BRUNO", "ELENA", "ELISA", "CHACO", "Bassi", "MAIPU", "SALTA", "CHILE", "MARIO", "MARTA", "JORGE", "DIEGO", "MARIA", "MABEL", "JUSTO", "JULIA", "DARDO", "LAURA", "LIDIA", "LUISA", "LULES", "LUCIO", "JUJUY", "JUANA", "SOLIS", "TOBAS", "SIOUX", "SOFIA", "HILDA", "TAGLE", "ANGEL", "Huder", "MAURO", "IRENE", "MIRTA", "PAULA", "PIGUE", "IRALA", "PEDRO", "LUIS", "Ruiz", "PERU", "ROSA", "RITA", "NN A", "JOSE", "PUAN", "NN B", "SARA", "INES", "NORA", "JUAN", "OLGA", "ELSA", "ALDO", "ACHA", "EVA", "S/N", "EMA", "FRENCH", "COLON", "LURO", "ALVARADO", "ALSINA", "ALVEAR", "PERALTA RAMOS", "CORRIENTES"];

    let filtros = {
        rojo: ["marzo", "diciembre", "estudiantes", "estudiante", "estudiantil", "temporal", "9 meses", "12 meses", "sin gas", "reservado", "temporada", "ICL"],
        verde: ["24 meses", "lavadero", "garantia propietaria"],
        amarillo: ["recibo de sueldo", "demostracion de ingresos", "USD"]
    };

    const LIMITE = 780000;
    const regexMontos = /(?:(?:U\$S|\$)\s?)?(?:\d{1,3}(?:[.,]\d{3})+|\d{6,})(?!\d)/gi;

    // Improved Regex to handle "al", commas, and spaces
    const regexDireccion = new RegExp(`\\b(${STREETS.sort((a, b) => b.length - a.length).join('|')})\\s*(?:,\\s*)?(?:al\\s+)?(\\d+)\\b`, 'gi');

    // Persistence for 'seen' apartments
    let seenApartments = GM_getValue('seen_apartments', []);

    GM_addStyle(`
        .visto-btn { margin-left: 5px; padding: 2px 5px; font-size: 10px; cursor: pointer; background: #666; color: white; border: 1px solid #999; border-radius: 3px; }
        .visto-btn:hover { background: #444; }
        .visto-btn.active { background: #28a745; border-color: #1e7e34; }
        .address-seen { text-decoration: line-through; opacity: 0.6; }
    `);

    function normalizarMonto(str) {
        return parseInt(str.replace(/U\$S|\$/gi, "").replace(/[.,\s]/g, ""), 10);
    }

    function toggleVisto(id, btn, span) {
        if (seenApartments.includes(id)) {
            seenApartments = seenApartments.filter(a => a !== id);
            btn.classList.remove('active');
            span.classList.remove('address-seen');
            btn.textContent = "visto";
        } else {
            seenApartments.push(id);
            btn.classList.add('active');
            span.classList.add('address-seen');
            btn.textContent = "✓";
        }
        GM_setValue('seen_apartments', seenApartments);
    }

    function marcar(node) {
        if (node.nodeType === 1 && ["SCRIPT", "STYLE", "TEXTAREA", "INPUT", "NOSCRIPT"].includes(node.tagName)) return;

        if (node.nodeType === 3) {
            let text = node.nodeValue;
            if (!text || text.trim().length === 0) return;
            if (node.parentNode && node.parentNode.hasAttribute && node.parentNode.hasAttribute('data-filtro')) return;

            let hasMatches = false;
            let parts = [{ type: 'text', value: text }];

            const applyFilter = (regex, type, style, isAddress = false) => {
                let newParts = [];
                parts.forEach(part => {
                    if (part.type !== 'text') {
                        newParts.push(part);
                        return;
                    }
                    let lastIndex = 0;
                    let match;
                    regex.lastIndex = 0;
                    while ((match = regex.exec(part.value)) !== null) {
                        if (match.index > lastIndex) {
                            newParts.push({ type: 'text', value: part.value.substring(lastIndex, match.index) });
                        }

                        let shouldHighlight = true;
                        if (type === 'precio') {
                            const v = normalizarMonto(match[0]);
                            if (isNaN(v) || v < LIMITE) shouldHighlight = false;
                        }

                        if (shouldHighlight) {
                            newParts.push({ type: 'span', value: match[0], marker: type, style: style, isAddress: isAddress });
                            hasMatches = true;
                        } else {
                            newParts.push({ type: 'text', value: match[0] });
                        }
                        lastIndex = regex.lastIndex;
                    }
                    if (lastIndex < part.value.length) {
                        newParts.push({ type: 'text', value: part.value.substring(lastIndex) });
                    }
                });
                parts = newParts;
            };

            // Apply Filters
            Object.keys(filtros).forEach(color => {
                let style = color === "rojo" ? "background:red;color:white;font-weight:bold;" :
                    color === "verde" ? "background:limegreen;color:black;font-weight:bold;" :
                        "background:gold;color:black;font-weight:bold;";
                filtros[color].forEach(word => applyFilter(new RegExp(`(${word})`, "gi"), color, style));
            });
            applyFilter(regexMontos, 'precio', "background:red;color:white;font-weight:bold;");
            applyFilter(regexDireccion, 'direccion', "background:cyan;color:black;", true);

            if (hasMatches) {
                const fragment = document.createDocumentFragment();
                parts.forEach(part => {
                    if (part.type === 'text') {
                        fragment.appendChild(document.createTextNode(part.value));
                    } else {
                        const span = document.createElement('span');
                        span.setAttribute('data-filtro', part.marker);
                        span.style.cssText = part.style;
                        span.textContent = part.value;

                        if (part.isAddress) {
                            // Normalize ID for seenApartments: remove "al", commas, multiple spaces
                            const addrId = part.value.toUpperCase().replace(/\s*,\s*/g, ' ').replace(/\s*al\s*/gi, ' ').replace(/\s+/g, ' ').trim();
                            const btn = document.createElement('button');
                            btn.className = 'visto-btn';
                            btn.textContent = seenApartments.includes(addrId) ? "✓" : "visto";
                            if (seenApartments.includes(addrId)) {
                                btn.classList.add('active');
                                span.classList.add('address-seen');
                            }
                            btn.onclick = (e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                toggleVisto(addrId, btn, span);
                            };
                            fragment.appendChild(span);
                            fragment.appendChild(btn);
                        } else {
                            fragment.appendChild(span);
                        }
                    }
                });
                try {
                    if (node.parentNode) node.parentNode.replaceChild(fragment, node);
                } catch (e) {
                    console.warn("[Rent Filter] Failed to replace node:", e);
                }
            }
        } else {
            Array.from(node.childNodes).forEach(marcar);
        }
    }

    /* ===== OBSERVER ===== */
    let observer;
    function startObserving() {
        if (observer) observer.disconnect();
        observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => marcar(node));
            });
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    function aplicarTodo() {
        marcar(document.body);
        startObserving();
    }

    /* ===== UI ELEMENTS ===== */
    function setupUI() {
        const btn = document.createElement("button");
        btn.textContent = "⚙";
        btn.id = "rf-settings-btn";
        btn.style.cssText = "position:fixed; bottom:10px; right:10px; z-index:999999; padding:8px; border-radius:8px; cursor:pointer; background:#222; color:#fff; border:1px solid #555;";
        document.body.appendChild(btn);

        const updateBtn = document.createElement("button");
        updateBtn.textContent = "🔄";
        updateBtn.style.cssText = "position:fixed; bottom:55px; right:10px; z-index:999999; padding:8px; border-radius:50%; cursor:pointer; background:black; color:white; border:1px solid white; font-size:14px;";
        updateBtn.onclick = () => window.open("https://raw.githubusercontent.com/Wapply/word-filter/main/rent-filter.user.js", "_blank");
        document.body.appendChild(updateBtn);

        const panel = document.createElement("div");
        panel.id = "rf-panel";
        panel.style.cssText = "position:fixed; bottom:100px; right:10px; background:#111; color:#fff; padding:10px; border-radius:10px; font-size:12px; display:none; z-index:999999; max-width:260px; border: 1px solid #444;";

        function renderPanel() {
            panel.innerHTML = "";
            Object.keys(filtros).forEach(color => {
                const titulo = document.createElement("b");
                titulo.textContent = color.toUpperCase();
                panel.appendChild(titulo);
                panel.appendChild(document.createElement("br"));
                filtros[color].forEach((f, i) => {
                    const row = document.createElement("div");
                    row.style.margin = "2px 0";
                    row.innerHTML = `<span style="display:inline-block; width:180px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${f}</span>
                                     <button style="background:red; color:white; border:none; border-radius:3px; cursor:pointer;" data-c="${color}" data-i="${i}">✖</button>`;
                    panel.appendChild(row);
                });
                const input = document.createElement("input");
                input.placeholder = "Agregar...";
                input.style.cssText = "width:100%; margin-top:4px; background:#fff; color:#000; border-radius:4px; padding:3px;";
                input.onkeydown = e => {
                    if (e.key === "Enter" && input.value.trim()) {
                        filtros[color].push(input.value.trim());
                        input.value = "";
                        renderPanel(); aplicarTodo();
                    }
                };
                panel.appendChild(input);
                panel.appendChild(document.createElement("br"));
            });
            panel.querySelectorAll("button[data-c]").forEach(b => {
                b.onclick = () => {
                    filtros[b.dataset.c].splice(b.dataset.i, 1);
                    renderPanel(); aplicarTodo();
                };
            });
        }
        btn.onclick = () => {
            panel.style.display = panel.style.display === "none" ? "block" : "none";
            renderPanel();
        };
        document.body.appendChild(panel);
    }

    if (document.readyState === "complete" || document.readyState === "interactive") {
        setupUI(); aplicarTodo();
    } else {
        window.addEventListener("DOMContentLoaded", () => { setupUI(); aplicarTodo(); });
    }
})();
