// ==UserScript==
// @name         Rent Filter
// @description  A Word Filter Script with MutationObserver and GTM Safety
// @author       Wapply
// @namespace    http://tampermonkey.net/
// @updateURL    https://raw.githubusercontent.com/Wapply/word-filter/main/rent-filter.user.js
// @downloadURL  https://raw.githubusercontent.com/Wapply/word-filter/main/rent-filter.user.js
// @version      3.3
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    let filtros = {
        rojo: [
            "marzo", "diciembre", "estudiantes", "estudiante", "estudiantil", "temporal", "9 meses", "12 meses", "sin gas", "reservado", "temporada", "ICL"
        ],
        verde: [
            "24 meses", "lavadero", "garantia propietaria"
        ],
        amarillo: [
            "recibo de sueldo", "demostracion de ingresos", "USD"
        ]
    };

    const LIMITE = 780000;
    const regexMontos = /(?:(?:U\$S|\$)\s?)?(?:\d{1,3}(?:[.,]\d{3})+|\d{6,})(?!\d)/gi;

    function normalizarMonto(str) {
        return parseInt(
            str.replace(/U\$S|\$/gi, "").replace(/[.,\s]/g, ""),
            10
        );
    }

    function marcar(node) {
        // Skip certain tags
        if (node.nodeType === 1 && ["SCRIPT", "STYLE", "TEXTAREA", "INPUT", "NOSCRIPT"].includes(node.tagName)) {
            return;
        }

        // Only process text nodes
        if (node.nodeType === 3) {
            let text = node.nodeValue;
            if (!text || text.trim().length === 0) return;

            // Avoid reprocessing already highlighted nodes
            if (node.parentNode && node.parentNode.hasAttribute && node.parentNode.hasAttribute('data-filtro')) {
                return;
            }

            let hasMatches = false;
            let parts = [{ type: 'text', value: text }];

            // Helper to apply regex to parts
            const applyFilter = (regex, type, style) => {
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
                            newParts.push({ type: 'span', value: match[0], marker: type, style: style });
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

            // Apply Keyword Filters
            const applyKeywordFilters = () => {
                Object.keys(filtros).forEach(color => {
                    let style = "";
                    if (color === "rojo") style = "background:red;color:white;font-weight:bold;";
                    else if (color === "verde") style = "background:limegreen;color:black;font-weight:bold;";
                    else if (color === "amarillo") style = "background:gold;color:black;font-weight:bold;";

                    filtros[color].forEach(word => {
                        const r = new RegExp(`(${word})`, "gi");
                        applyFilter(r, color, style);
                    });
                });
            };

            applyKeywordFilters();
            applyFilter(regexMontos, 'precio', "background:red;color:white;font-weight:bold;");

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
                        fragment.appendChild(span);
                    }
                });

                try {
                    if (node.parentNode) {
                        node.parentNode.replaceChild(fragment, node);
                    }
                } catch (e) {
                    console.warn("[Rent Filter] Failed to replace node:", e);
                }
            }
        } else {
            // Recurse for elements
            Array.from(node.childNodes).forEach(marcar);
        }
    }

    /* ===== OBSERVER ===== */
    let observer;
    function startObserving() {
        if (observer) observer.disconnect();
        observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    marcar(node);
                });
            });
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    function aplicarTodo() {
        marcar(document.body);
        startObserving();
    }

    /* ===== UI ELEMENTS (Optimized) ===== */
    function setupUI() {
        // ⚙ Control Button
        const btn = document.createElement("button");
        btn.textContent = "⚙";
        btn.id = "rf-settings-btn";
        btn.style.cssText = `
            position:fixed; bottom:10px; right:10px; z-index:999999;
            padding:8px; border-radius:8px; cursor:pointer;
            background:#222; color:#fff; border:1px solid #555;
        `;
        document.body.appendChild(btn);

        // 🔄 Update Button
        const updateBtn = document.createElement("button");
        updateBtn.textContent = "🔄";
        updateBtn.title = "Update Script";
        updateBtn.style.cssText = `
            position:fixed; bottom:55px; right:10px; z-index:999999;
            padding:8px; border-radius:50%; cursor:pointer;
            background:black; color:white; border:1px solid white; font-size:14px;
        `;
        updateBtn.onclick = () => window.open("https://raw.githubusercontent.com/Wapply/word-filter/main/rent-filter.user.js", "_blank");
        document.body.appendChild(updateBtn);

        // Panel
        const panel = document.createElement("div");
        panel.id = "rf-panel";
        panel.style.cssText = `
            position:fixed; bottom:100px; right:10px; background:#111; color:#fff;
            padding:10px; border-radius:10px; font-size:12px; display:none;
            z-index:999999; max-width:260px; border: 1px solid #444;
        `;

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
                    row.innerHTML = `
                        <span style="display:inline-block; width:180px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${f}</span>
                        <button style="background:red; color:white; border:none; border-radius:3px; cursor:pointer;" data-c="${color}" data-i="${i}">✖</button>
                    `;
                    panel.appendChild(row);
                });

                const input = document.createElement("input");
                input.placeholder = "Agregar...";
                input.style.cssText = "width:100%; margin-top:4px; background:#fff; color:#000; border-radius:4px; padding:3px;";
                input.onkeydown = e => {
                    if (e.key === "Enter" && input.value.trim()) {
                        filtros[color].push(input.value.trim());
                        input.value = "";
                        renderPanel();
                        aplicarTodo();
                    }
                };
                panel.appendChild(input);
                panel.appendChild(document.createElement("br"));
            });

            panel.querySelectorAll("button[data-c]").forEach(b => {
                b.onclick = () => {
                    filtros[b.dataset.c].splice(b.dataset.i, 1);
                    renderPanel();
                    aplicarTodo();
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
        setupUI();
        aplicarTodo();
    } else {
        window.addEventListener("DOMContentLoaded", () => {
            setupUI();
            aplicarTodo();
        });
    }
})();
