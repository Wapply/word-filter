// ==UserScript==
// @name         Rent Filter
// @description  A Word Filter Script with MutationObserver and GTM Safety
// @author       Wapply
// @namespace    http://tampermonkey.net/
// @updateURL    https://raw.githubusercontent.com/Wapply/word-filter/main/rent-filter.user.js
// @downloadURL  https://raw.githubusercontent.com/Wapply/word-filter/main/rent-filter.user.js
// @version      4.0
// @match        *://*/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// ==/UserScript==

(function () {
    'use strict';

    // List of streets (sorted by length descending for better matching)
    const STREETS = ["PASEO COSTANERO DEL SUD PRESIDENTE ARTURO HUMBERTO ILLIA", "AVENIDA PRESIDENTE ARTURO ALBERTO ILLIA", "COLECTORA AVENIDA MARIO BRAVO", "AUTOPISTA  MAR DEL PLATA - BALCARCE", "AVENIDA PRESIDENTE JUAN DOMINGO PERON", "COLECTORA AUTOPISTA MAR DEL PLATA-BS AS", "AVENIDA FERNANDEZ DE LA CRUZ", "BOULEVARD MARITIMO PATRICIO PERALTA RAMOS", "PASEO ADOLFO DAVILA", "AVENIDA DOCTOR ARTURO ALIEGRO", "AVENIDA CARLOS GARDEL", "AVENIDA ERNESTO  CH. GUEVARA", "AVENIDA VICTORIO TETTAMANTI", "AVENIDA JACINTO PERALTA RAMOS", "AUTOPISTA MAR DEL PLATA-BS AS", "AVENIDA DOCTOR JORGE NEWBERY", "MONSE?OR ENRIQUE RAU", "AVENIDA FORTUNATO DE LA PLAZA", "DIAGONAL ESTADOS UNIDOS DE AMERICA", "AVENIDA GABRIEL DEL MAZO", "AVENIDA MONSE?OR ENRIQUE RAU", "AVENIDA BERNARDINO RIVADAVIA", "AVENIDA COLON", "AVENIDA ANTARTIDA ARGENTINA", "AVENIDA CONSTITUCION", "AVENIDA INDEPENDENCIA", "AVENIDA JUAN HECTOR JARA", "AVENIDA JUAN BUSTO", "AVENIDA REPUBLICA DE CUBA", "AVENIDA DOCTOR JUAN B. JUSTO", "DIAGONAL JUAN DE GARAY", "AVENIDA PEDRO LURO", "AVENIDA ARTURO ALIEGRO", "AVENIDA MARIO BRAVO", "CAMINO DEL MATADERO", "ESTANCIA CABO CORRIENTES", "PASEO VICTORIA", "AVENIDA 25 DE MAYO", "AVENIDA PASO", "AVENIDA TETTAMANTI", "AVENIDA DE LOS TRABAJADORES", "AVENIDA MARTINEZ DE HOZ", "AVENIDA PATRICIO PERALTA RAMOS", "CALAZA BIS", "TALCAHUANO", "LOS CEDROS", "LOS CEIBOS", "LOS AROMOS", "YAPEYU BIS", "EL ESTRIBO", "CAMPESINOS", "CALLE 27 B", "RIO JACHAL", "LAS OSTRAS", "PUJIA JOSE", "CORRIENTES", "COSTA AZUL", "MIGUELETES", "CALLE 11 B", "CHAMPAGNAT", "PESCADORES", "CALLE 30 B", "RIO BLANCO", "CALLE 31 B", "ARQ.CEDRON", "CALLE 10 B", "RIO CURACO", "CAMPO FLOR", "CALLE 17 B", "SAN BENITO", "JOSE MARTI", "DEL LUCERO", "LOS ROBLES", "CALLE 23 B", "CALLE 18 B", "ROCA JULIO", "CALLE 24 B", "CALLE 53 B", "EL ROSILLO", "DEL ALJIBE", "CALLE 16 B", "GOLONDRINA", "CALLE 55 B", "GUAYCURUES", "B/P FOCA B", "9 DE JULIO", "EL TOBIANO", "LUIS AGOTE", "CALLE 20 B", "B/P MARLIN", "CALLE 56 B", "LOS SAUCES", "EL TAJAMAR", "CALLE 19 B", "CALLE 22 B", "B/P ALTAIR", "ALMAFUERTE", "EL REMANSO", "CALLE 13 B", "LOS NARDOS", "LA GAVIOTA", "LA SERRANA", "RIO SUQUIA", "25 DE MAYO", "LOS MIRLOS", "GENOVA BIS", "CALLE 15 B", "PAGO CHICO", "SANTA INES", "CERRO AZUL", "LA CIGUE?A", "SAN MARTIN", "LA ALONDRA", "SANTA CRUZ", "LOS OMBUES", "CANAI QUEN", "ATAHUALPA", "CALLE 471", "CALLE 803", "CHACABUCO", "CALLE 775", "LOS TAPES", "MARGARITA", "CALLE 823", "CALLE 797", "CALLE 467", "MOCTEZUMA", "CALLE 799", "CALLE 781", "CALLE 827", "CALLE 4 C", "CALLE 455", "CALLE 457", "CALLE 445", "CALLE 795", "CALLE 783", "CALLE 833", "RAUCH BIS", "CALLE 791", "CALLE 825", "CALLE 777", "CALLE 779", "CALLE 459", "CALLE 453", "CALLE 767", "CALLE 813", "CALLE 801", "CALLE 829", "CALLE 811", "CALLE 815", "LOS PINOS", "CALLE 461", "CALLE 793", "CALLE 771", "LOS ORTIZ", "CALLE 805", "CALLE 449", "CALLE 789", "CALLE 807", "ARAUCANOS", "CATAMARCA", "CALLE 809", "LOS INCAS", "CALLE 787", "CALLE 831", "CALLE 785", "ARRIBE?OS", "CALLE 819", "CALLE 447", "PATAGONIA", "ARGENTINA", "CALLE 769", "CALLE 821", "LOS OLMOS", "CALLE 465", "CALLE 817", "CALLE 463", "CALLE 773", "CALLE 451", "CALLE 429", "PATAGONES", "CALLE 8 B", "CALLE 847", "CALLE 485", "CALLE 849", "EL JAGUEL", "EL HORCON", "SEMBRADOR", "CALLE 693", "CALLE 475", "CALLE 477", "INCA HUEN", "CALLE 851", "CALLE 487", "EL TEJADO", "GUILLERMO", "O'HIGGINS", "GUANAHANI", "CALLE 6 C", "CALLE 853", "EL RECADO", "CALLE 6 B", "EL RINCON", "CALLE 841", "CALLE 7 B", "CALLE 160", "CALLE 843", "CALLE 159", "CALLE 196", "CALLE 198", "CALLE 194", "NATIVIDAD", "CALLE 701", "SAN PEDRO", "CALLE 142", "CALLE 699", "CALLE 697", "EL ALAZAN", "SARMIENTO", "DON BOSCO", "CALLE 845", "ITUZAINGO", "CALLE 483", "CALLE 481", "CALLE 1 C", "CALLE 501", "CALLE 1 B", "CALLE 5 C", "ORO NEGRO", "FRANCISCO", "CALLE 505", "FRANCISCA", "CALLE 503", "CALLE 9 B", "CALLE 5 B", "CALLE 497", "CALLE 9 C", "CALLE 495", "CALLE 491", "CALLE 493", "CALLE 489", "CALFUCURA", "FLORENCIO", "CALLE 499", "FLORENCIA", "GERTRUDIS", "CALLE 479", "VALENTINA", "CALLE 511", "CALLE 513", "EL ZORZAL", "OLAVARRIA", "PALESTINA", "CALLE 136", "GO?I JUAN", "CALLE 128", "1 DE MAYO", "ESPIGON 7", "CALLE 105", "CALLE 101", "CALLE 103", "CALLE 509", "VENEZUELA", "CALLE 107", "ESPIGON 3", "CALLE 507", "LAS LISAS", "LAS LOMAS", "LAS HERAS", "CALLE 739", "LAS HAYAS", "LAS ROSAS", "RIO DULCE", "LAS ORCAS", "CALLE 741", "COLECTORA", "LAS FOCAS", "CALLE 735", "RIO NEGRO", "LA SURE?A", "CALLE 733", "RIO PINTO", "LAS CALAS", "RIO LIMAY", "RIO LULES", "CALLE 737", "NAHUELPAN", "CALLE 743", "AVENIDA 7", "CALLE 759", "CALLE 757", "LOMBARDIA", "AVENIDA 8", "CALLE 765", "CALLE 4 B", "CALLE 763", "LOS ARCES", "CALLE 761", "CALLE 755", "CALLE 747", "CALLE 749", "CALLE 3 C", "CALLE 3 B", "CALLE 745", "RIO ATUEL", "CALLE 753", "RIO BELEN", "CALLE 473", "CALLE 751", "LA PERDIZ", "CALLE 835", "CALLE 721", "CALLE 719", "AZCUENAGA", "CALLE 717", "CALLE 727", "CALLE 729", "CALLE 705", "DEL TEJAR", "CALLE 723", "CALLE 206", "CALLE 208", "CALLE 204", "CALLE 202", "Juan Acha", "CALLE 837", "CALLE 228", "CALLE 715", "CALLE 713", "CALLE 839", "CALLE 236", "CALLE 731", "RIO TEUCO", "LA LAGUNA", "RIVADAVIA", "LA LOMADA", "LA MATERA", "CALLE 725", "CALLE 2 B", "LOS TILOS", "CALLE 2 C", "JURAMENTO", "CALLE 200", "CALLE 238", "NAMUNCURA", "LA AGUADA", "LA CUESTA", "CALLE 703", "LA AURORA", "LA COLINA", "CALLE 91", "CALLE 83", "PARAGUAY", "CALLE 89", "CALLE 87", "AGUATERO", "PATRICIA", "CALLE 85", "CALLE 60", "CALLE 61", "CALLE 62", "CALLE 57", "CALLE 58", "CALLE 59", "CALLE 66", "CALLE 67", "CALLE 68", "CALLE 63", "CALLE 64", "CALLE 65", "CALLE 56", "VICTORIA", "VIAMONTE", "VERONICA", "CALLE 49", "VIRGINIA", "CALLE 50", "CALLE 53", "CALLE 54", "CALLE 55", "CALLE 51", "CALLE 52", "VALENCIA", "CALLE 69", "PUCO YAN", "CALLE 48", "CALLE 80", "CALLE 78", "CALLE 79", "PUELCHES", "PEUMAYEN", "CALLE 81", "CALLE 82", "PRINGLES", "PRAXEDES", "PORTUGAL", "CALLE 77", "CALLE 70", "CALLE 71", "RUMEN CO", "SANTA FE", "SAN LUIS", "SAN JUAN", "CALLE 74", "CALLE 75", "CALLE 76", "CALLE 72", "CALLE 73", "RIO MAYO", "JOSEFINA", "CALLE 21", "CHINGOLO", "CALLE 20", "CALLE 19", "CHARRUAS", "BALCARCE", "B/P FOCA", "FAUSTINO", "AYACUCHO", "LOS TALA", "CALLE 23", "CALLE 22", "CIPRESES", "DIAGONAL", "CHARLONE", "CALLE 46", "BELL MAR", "BELGRANO", "EL CERRO", "CALLE 14", "CATALU?A", "EL CHAJA", "CALLE 15", "CALLE 17", "CALLE 18", "MALVINAS", "MANSILLA", "ARENALES", "CALLE 16", "BAUTISTA", "CALLE 45", "LA POSTA", "CALLE 30", "LA RIOJA", "CALLE 31", "CALLE 33", "CALLE 25", "CALLE 32", "LABARDEN", "CALLE 27", "CALLE 26", "LAMADRID", "COLOMBIA", "CALLE 29", "CALLE 28", "COLIQUEO", "CALLE 34", "CALLE 41", "CALLE 40", "CALLE 39", "CALLE 42", "CALLE 44", "CALLE 43", "ASTURIAS", "CALLE 24", "LA LAURA", "LITUANIA", "LA PAMPA", "CALLE 35", "CALLE 38", "CALLE 37", "CALLE 36", "GUERNICA", "MERCEDES", "MENENDEZ", "CALLE 11", "Nogueira", "CALLE 47", "CALLE 10", "EL RODEO", "EL MONTE", "NORBERTO", "El Sulky", "AMEGHINO", "EL ZAINO", "GREGORIO", "MOCOBIES", "GRACIELA", "NECOCHEA", "CALLE 13", "CALLE 12", "CARDENAL", "BRANDSEN", "EL VALLE", "MISIONES", "EL TORDO", "El Mateo", "CALLE 93", "CALLE 94", "CALLE 97", "CALLE 99", "EVARISTO", "LA LEGUA", "MONSALVO", "CALABRIA", "HERRERIA", "CALLE 95", "EL MIXTO", "LAFQUEN", "USHUAIA", "ENRIQUE", "LAPRIDA", "BRIGIDA", "GALICIA", "RODOLFO", "FALUCHO", "211 BIS", "YOLANDA", "FRANCIA", "FORMOSA", "CALLE 0", "VIEYTES", "LA LOMA", "CALLE 1", "OSVALDO", "DANIELA", "LA TABA", "GABRIEL", "EVELINA", "EUGENIA", "ROBERTO", "CABILDO", "CALLE 5", "175 BIS", "CALLE 7", "DORREGO", "BERMEJO", "ECUADOR", "DOMINGO", "177 BIS", "JOAQUIN", "DOROTEA", "JACINTO", "BOLIVIA", "EL LAZO", "HUARPES", "BOLIVAR", "Hermida", "EL CANO", "ISIDORO", "SICILIA", "173 BIS", "IGNACIO", "ROTONDA", "RONDEAU", "HILARIO", "CALLE 2", "BRAULIO", "209 BIS", "URUGUAY", "TUCUMAN", "201 BIS", "203 BIS", "BEATRIZ", "181 BIS", "BELGICA", "TINGUES", "179 BIS", "GUAYANA", "TOSCANA", "CALLE 6", "183 BIS", "EL TERO", "LUCIANO", "PIERINA", "MARIANO", "CHOCORI", "MATILDE", "PI?ACAL", "CERRITO", "NAPOLES", "ADRIANA", "CLAUDIA", "PASCUAL", "LUCANIA", "PEHUAJO", "MANGORE", "NATALIA", "CASEROS", "ARMENIA", "CALLE 8", "ALELIES", "CAROYAS", "CALLE 9", "MARCELA", "OLLEROS", "ARMANDO", "CALLE14", "NARCISO", "ACACIAS", "LETICIA", "LEGH II", "CECILIA", "LINIERS", "LILIANA", "CORDOBA", "PILAGAS", "MARIANA", "LEANDRO", "PASTEUR", "CALLE 3", "272 BIS", "433 BIS", "NEUQUEN", "MENDOZA", "CALLE 4", "POSADAS", "MELINAO", "RICARDO", "LOBERIA", "270 BIS", "POLONIA", "SILVIA", "EGIDIO", "MARTIN", "GENARO", "ISABEL", "NESTOR", "ANGELA", "HUILEN", "MIGUEL", "ALVARO", "MEJICO", "PERDIZ", "PELAYO", "MORENO", "GRECIA", "CANADA", "Cannes", "CARLOS", "BRASIL", "SUSANA", "TANDIL", "EMILIO", "GENOVA", "Catani", "ADOLFO", "HECTOR", "HAYDIN", "TERESA", "HIGINO", "ANALIA", "ROSANA", "WALTER", "DERQUI", "RAQUEL", "AYELEP", "CHUBUT", "ESTELA", "ALICIA", "VULCAN", "AYOLAS", "RAWSON", "LLIFEN", "OVIDIO", "Zurita", "DAMIAN", "DANIEL", "YAPEYU", "FABIAN", "JULIAN", "FELIPE", "JUNCAL", "ARTURO", "ESQUEL", "LARREA", "MARCOS", "VICTOR", "ARAGON", "ESPA?A", "PINCEN", "GABOTO", "CEDROS", "FRIULI", "ITALIA", "ALSINA", "OFELIA", "AROMOS", "VIEDMA", "FRANCA", "PARANA", "CAMILO", "ESTER", "Farro", "OSCAR", "PABLO", "ELINA", "NOEMI", "TULIO", "FELIX", "UDINE", "BRUNO", "ELENA", "ELISA", "CHACO", "Bassi", "MAIPU", "SALTA", "CHILE", "MARIO", "MARTA", "JORGE", "DIEGO", "MARIA", "MABEL", "JUSTO", "JULIA", "DARDO", "LAURA", "LIDIA", "LUISA", "LULES", "LUCIO", "JUJUY", "JUANA", "SOLIS", "TOBAS", "SIOUX", "SOFIA", "HILDA", "TAGLE", "ANGEL", "Huder", "MAURO", "IRENE", "MIRTA", "PAULA", "PIGUE", "IRALA", "PEDRO", "LUIS", "Ruiz", "PERU", "ROSA", "RITA", "NN A", "JOSE", "PUAN", "NN B", "SARA", "INES", "NORA", "JUAN", "OLGA", "ELSA", "ALDO", "ACHA", "EVA", "S/N", "EMA"];

    let filtros = {
        rojo: ["marzo", "diciembre", "estudiantes", "estudiante", "estudiantil", "temporal", "9 meses", "12 meses", "sin gas", "reservado", "temporada", "ICL"],
        verde: ["24 meses", "lavadero", "garantia propietaria"],
        amarillo: ["recibo de sueldo", "demostracion de ingresos", "USD"]
    };

    const LIMITE = 780000;
    const regexMontos = /(?:(?:U\$S|\$)\s?)?(?:\d{1,3}(?:[.,]\d{3})+|\d{6,})(?!\d)/gi;
    const regexDireccion = new RegExp(`\\b(${STREETS.join('|')})\\s+(\\d+)\\b`, 'gi');

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
                            const addrId = part.value.toUpperCase().trim();
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
