(() => {
    // --- PHOSPHOR ICONS (Duotone default, Fill active) ---
    const ICONS = {
        checkCircleFill: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm45.66,85.66-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35a8,8,0,0,1,11.32,11.32Z"></path></svg>`,
        copyDuotone: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256"><path d="M216,40V168H168V88H88V40Z" opacity="0.3"></path><path d="M216,32H88a8,8,0,0,0-8,8V80H40a8,8,0,0,0-8,8V216a8,8,0,0,0,8,8H168a8,8,0,0,0,8-8V176h40a8,8,0,0,0,8-8V40A8,8,0,0,0,216,32ZM160,208H48V96H160Zm48-48H176V88a8,8,0,0,0-8-8H96V48H208Z"></path></svg>`,
        caretUpDuotone: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256"><path d="M208,160H48l80-80Z" opacity="0.3"></path><path d="M213.66,154.34l-80-80a8,8,0,0,0-11.32,0l-80,80A8,8,0,0,0,48,168H208a8,8,0,0,0,5.66-13.66ZM67.31,152,128,91.31,188.69,152Z"></path></svg>`,
        caretUpFill: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256"><path d="M215.39,163.06A8,8,0,0,1,208,168H48a8,8,0,0,1-5.66-13.66l80-80a8,8,0,0,1,11.32,0l80,80A8,8,0,0,1,215.39,163.06Z"></path></svg>`,
        caretDownDuotone: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256"><path d="M208,96l-80,80L48,96Z" opacity="0.3"></path><path d="M215.39,92.94A8,8,0,0,0,208,88H48a8,8,0,0,0-5.66,13.66l80,80a8,8,0,0,0,11.32,0l80-80A8,8,0,0,0,215.39,92.94ZM128,164.69,67.31,104H188.69Z"></path></svg>`,
        caretDownFill: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256"><path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,48,88H208a8,8,0,0,1,5.66,13.66Z"></path></svg>`,
        caretLeftDuotone: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256"><path d="M160,48V208L80,128Z" opacity="0.3"></path><path d="M163.06,40.61a8,8,0,0,0-8.72,1.73l-80,80a8,8,0,0,0,0,11.32l80,80A8,8,0,0,0,168,208V48A8,8,0,0,0,163.06,40.61ZM152,188.69,91.31,128,152,67.31Z"></path></svg>`,
        caretLeftFill: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256"><path d="M168,48V208a8,8,0,0,1-13.66,5.66l-80-80a8,8,0,0,1,0-11.32l80-80A8,8,0,0,1,168,48Z"></path></svg>`,
        caretRightDuotone: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256"><path d="M176,128,96,208V48Z" opacity="0.3"></path><path d="M181.66,122.34l-80-80A8,8,0,0,0,88,48V208a8,8,0,0,0,13.66,5.66l80-80A8,8,0,0,0,181.66,122.34ZM104,188.69V67.31L164.69,128Z"></path></svg>`,
        caretRightFill: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256"><path d="M181.66,133.66l-80,80A8,8,0,0,1,88,208V48a8,8,0,0,1,13.66-5.66l80,80A8,8,0,0,1,181.66,133.66Z"></path></svg>`
    };

    // --- STATE MANAGEMENT ---
    let isActive = false;
    let overlayRoot = null;
    let currentElement = null;
    let isLocked = false;
    let activeTab = 'inspector'; // 'inspector', 'export', 'assets'
    let activePseudo = 'normal'; // 'normal', 'hover', 'active', 'focus'
    let colorFormat = 'hex'; // 'hex', 'rgb', 'hsl'
    let hudPosition = 'bottom-right'; // 'bottom-right', 'bottom-left', 'top-left', 'top-right'
    let allClassesData = [];
    let allColorsData = [];

    // --- SECURITY & STRING ESCAPING ---
    function escapeHtml(str) {
        if (str === null || str === undefined) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    // --- COLOR CONVERSION UTILITIES ---
    function parseRgba(colorStr) {
        if (!colorStr) return null;
        const canvas = document.createElement("canvas");
        canvas.width = 1;
        canvas.height = 1;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        ctx.fillStyle = colorStr;
        ctx.fillRect(0, 0, 1, 1);
        const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
        return { r, g, b, a: a / 255 };
    }

    function rgbToHex(r, g, b, a = 1) {
        const toHex = (n) => n.toString(16).padStart(2, "0");
        const hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
        if (a < 1) {
            const alphaHex = Math.round(a * 255).toString(16).padStart(2, "0");
            return `${hex}${alphaHex}`;
        }
        return hex;
    }

    function rgbToHsl(r, g, b, a = 1) {
        r /= 255;
        g /= 255;
        b /= 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h = 0, s = 0, l = (max + min) / 2;

        if (max !== min) {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        h = Math.round(h * 360);
        s = Math.round(s * 100);
        l = Math.round(l * 100);
        if (a < 1) {
            return `hsla(${h}, ${s}%, ${l}%, ${Math.round(a * 100) / 100})`;
        }
        return `hsl(${h}, ${s}%, ${l}%)`;
    }

    function formatColor(colorStr, format = colorFormat) {
        if (!colorStr || colorStr === "transparent" || colorStr === "rgba(0, 0, 0, 0)") return "transparent";
        const parsed = parseRgba(colorStr);
        if (!parsed) return colorStr;

        if (format === 'hex') return rgbToHex(parsed.r, parsed.g, parsed.b, parsed.a);
        if (format === 'hsl') return rgbToHsl(parsed.r, parsed.g, parsed.b, parsed.a);
        return parsed.a < 1 ? `rgba(${parsed.r}, ${parsed.g}, ${parsed.b}, ${parsed.a})` : `rgb(${parsed.r}, ${parsed.g}, ${parsed.b})`;
    }

    // --- CSS VARIABLE & VALUE RESOLVER (With Recursion Guard) ---
    function resolveCssValue(val, element, depth = 0) {
        if (depth > 10 || !val || typeof val !== 'string') return val;
        const varMatch = val.match(/var\(\s*(--[\w-]+)(?:\s*,\s*([^)]+))?\s*\)/);
        if (varMatch) {
            const varName = varMatch[1];
            const fallback = varMatch[2];
            const resolved = window.getComputedStyle(element).getPropertyValue(varName).trim();
            if (resolved) return resolveCssValue(resolved, element, depth + 1);
            if (fallback) return resolveCssValue(fallback.trim(), element, depth + 1);
        }
        return val;
    }

    // --- MATCHED CSS RULES & PSEUDO-CLASS EXTRACTOR ---
    function getMatchedRules(element) {
        const normalRules = [];
        const hoverRules = [];
        const activeRules = [];
        const focusRules = [];

        // 1. Inline styles
        if (element.style && element.style.length > 0) {
            const inlineProps = {};
            for (let i = 0; i < element.style.length; i++) {
                const prop = element.style[i];
                inlineProps[prop] = element.style.getPropertyValue(prop);
            }
            normalRules.push({
                selector: 'element.style',
                source: 'inline',
                properties: inlineProps
            });
        }

        // Helper for CSS rule lists
        function processRuleList(rules, sourceName) {
            if (!rules) return;
            for (let i = 0; i < rules.length; i++) {
                const rule = rules[i];
                try {
                    if (rule instanceof CSSStyleRule && rule.selectorText) {
                        const selectors = rule.selectorText.split(',');
                        let matchNormal = false;
                        let matchHover = false;
                        let matchActive = false;
                        let matchFocus = false;

                        for (let rawSel of selectors) {
                            const s = rawSel.trim();

                            // Normal match
                            try {
                                if (element.matches(s)) {
                                    matchNormal = true;
                                }
                            } catch (e) { }

                            // :hover match
                            if (s.includes(':hover')) {
                                try {
                                    const clean = s.replace(/:hover\b/g, '');
                                    if (clean && element.matches(clean)) {
                                        matchHover = true;
                                    }
                                } catch (e) { }
                            }

                            // :active match
                            if (s.includes(':active')) {
                                try {
                                    const clean = s.replace(/:active\b/g, '');
                                    if (clean && element.matches(clean)) {
                                        matchActive = true;
                                    }
                                } catch (e) { }
                            }

                            // :focus match
                            if (s.includes(':focus')) {
                                try {
                                    const clean = s.replace(/:focus(-visible)?\b/g, '');
                                    if (clean && element.matches(clean)) {
                                        matchFocus = true;
                                    }
                                } catch (e) { }
                            }
                        }

                        if (matchNormal || matchHover || matchActive || matchFocus) {
                            const properties = {};
                            const styleObj = rule.style;
                            for (let j = 0; j < styleObj.length; j++) {
                                const propName = styleObj[j];
                                properties[propName] = styleObj.getPropertyValue(propName).trim();
                            }
                            const entry = {
                                selector: rule.selectorText,
                                source: sourceName,
                                properties: properties
                            };

                            if (matchNormal) normalRules.push(entry);
                            if (matchHover) hoverRules.push(entry);
                            if (matchActive) activeRules.push(entry);
                            if (matchFocus) focusRules.push(entry);
                        }
                    } else if (rule.cssRules) {
                        let condition = '';
                        if (rule instanceof CSSMediaRule) condition = `@media ${rule.conditionText}`;
                        else if (rule instanceof CSSSupportsRule) condition = `@supports ${rule.conditionText}`;
                        processRuleList(rule.cssRules, condition || sourceName);
                    }
                } catch (e) { }
            }
        }

        // Iterate stylesheets
        for (let i = 0; i < document.styleSheets.length; i++) {
            const sheet = document.styleSheets[i];
            try {
                if (sheet.ownerNode && sheet.ownerNode.id === 'live-inspector-host') continue;
                const sourceName = sheet.href ? sheet.href.split('/').pop().split('?')[0] : 'style';
                processRuleList(sheet.cssRules, sourceName);
            } catch (securityError) { }
        }

        return { normalRules, hoverRules, activeRules, focusRules };
    }

    function getAuthoredStyles(element, pseudo = activePseudo) {
        const { normalRules, hoverRules, activeRules, focusRules } = getMatchedRules(element);

        let targetRules = normalRules;
        if (pseudo === 'hover') targetRules = [...normalRules, ...hoverRules];
        else if (pseudo === 'active') targetRules = [...normalRules, ...activeRules];
        else if (pseudo === 'focus') targetRules = [...normalRules, ...focusRules];

        const authoredMap = {};
        const rulesList = [];

        targetRules.forEach(rule => {
            let hasProps = false;
            let ruleObj = { selector: rule.selector, source: rule.source, props: {} };
            Object.entries(rule.properties).forEach(([prop, val]) => {
                if (val) {
                    authoredMap[prop] = val;
                    ruleObj.props[prop] = val;
                    hasProps = true;
                }
            });
            if (hasProps) rulesList.push(ruleObj);
        });

        return {
            authoredMap,
            rulesList,
            hasHover: hoverRules.length > 0,
            hasActive: activeRules.length > 0,
            hasFocus: focusRules.length > 0,
            hoverRules,
            activeRules,
            focusRules
        };
    }

    // --- REACT STYLE OBJECT GENERATOR ---
    function generateReactStyle(computed) {
        const props = [
            ["display", "display"], ["position", "position"],
            ["top", "top"], ["left", "left"], ["right", "right"], ["bottom", "bottom"],
            ["zIndex", "z-index"], ["width", "width"], ["height", "height"],
            ["margin", "margin"], ["padding", "padding"],
            ["border", "border"], ["borderRadius", "border-radius"],
            ["backgroundColor", "background-color"], ["color", "color"],
            ["fontFamily", "font-family"], ["fontSize", "font-size"], ["fontWeight", "font-weight"], ["lineHeight", "line-height"], ["textAlign", "text-align"],
            ["flexDirection", "flex-direction"], ["justifyContent", "justify-content"], ["alignItems", "align-items"], ["gap", "gap"],
            ["boxShadow", "box-shadow"], ["opacity", "opacity"], ["cursor", "cursor"]
        ];

        const obj = {};
        props.forEach(([camelKey, cssKey]) => {
            const val = computed.getPropertyValue(cssKey);
            if (val && val !== "none" && val !== "auto" && val !== "normal" && val !== "0px" && !val.includes("rgba(0, 0, 0, 0)")) {
                obj[camelKey] = val;
            }
        });

        return `const style = ${JSON.stringify(obj, null, 2)};`;
    }

    // --- BOX MODEL CALCULATION ---
    function getBoxModel(element) {
        const computed = window.getComputedStyle(element);
        const rect = element.getBoundingClientRect();

        const margin = {
            top: parseFloat(computed.marginTop) || 0,
            right: parseFloat(computed.marginRight) || 0,
            bottom: parseFloat(computed.marginBottom) || 0,
            left: parseFloat(computed.marginLeft) || 0
        };
        const border = {
            top: parseFloat(computed.borderTopWidth) || 0,
            right: parseFloat(computed.borderRightWidth) || 0,
            bottom: parseFloat(computed.borderBottomWidth) || 0,
            left: parseFloat(computed.borderLeftWidth) || 0
        };
        const padding = {
            top: parseFloat(computed.paddingTop) || 0,
            right: parseFloat(computed.paddingRight) || 0,
            bottom: parseFloat(computed.paddingBottom) || 0,
            left: parseFloat(computed.paddingLeft) || 0
        };

        const borderBox = {
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
            right: rect.right,
            bottom: rect.bottom
        };
        const paddingBox = {
            top: borderBox.top + border.top,
            left: borderBox.left + border.left,
            width: Math.max(0, borderBox.width - border.left - border.right),
            height: Math.max(0, borderBox.height - border.top - border.bottom)
        };
        const contentBox = {
            top: paddingBox.top + padding.top,
            left: paddingBox.left + padding.left,
            width: Math.max(0, paddingBox.width - padding.left - padding.right),
            height: Math.max(0, paddingBox.height - padding.top - padding.bottom)
        };
        const marginBox = {
            top: borderBox.top - margin.top,
            left: borderBox.left - margin.left,
            width: borderBox.width + margin.left + margin.right,
            height: borderBox.height + margin.top + margin.bottom
        };

        return {
            content: contentBox,
            padding: paddingBox,
            border: borderBox,
            margin: marginBox,
            rect: borderBox,
            values: { margin, border, padding }
        };
    }

    // --- INITIALIZE INSPECTOR SHADOW DOM ---
    function initInspector() {
        if (overlayRoot) return;

        const host = document.createElement("div");
        host.id = "live-inspector-host";
        host.style.cssText = "position: fixed; top: 0; left: 0; width: 0; height: 0; z-index: 2147483647; pointer-events: none;";

        overlayRoot = host.attachShadow({ mode: "open" });

        const style = document.createElement("style");
        style.textContent = `
            @import url('https://fonts.bunny.net/css?family=google-sans:400,600|google-sans-code:400');

            * { box-sizing: border-box; margin: 0; padding: 0; }
            
            :host {
                --hud-bg: rgba(15, 23, 42, 0.96);
                --hud-surface: rgba(30, 41, 59, 0.9);
                --hud-surface-hover: rgba(51, 65, 85, 0.95);
                --hud-border: rgba(255, 255, 255, 0.12);
                --hud-divider: rgba(255, 255, 255, 0.08);
                --hud-text-primary: #cfcfcfff;
                --hud-text-secondary: #94a3b8;
                --hud-text-muted: #64748b;
                --hud-accent: #3b82f6;
                --hud-accent-hover: #60a5fa;
                --hud-accent-subtle: rgba(59, 130, 246, 0.2);
                --hud-tag-name: #f472b6;
                --hud-tag-id: #60a5fa;
                --hud-tag-class: #fbbf24;
                --hud-font: 'Google Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                --hud-code: 'Google Sans Code', 'JetBrains Mono', monospace;

                --color-margin: rgba(249, 115, 22, 0.25);
                --color-margin-border: rgba(249, 115, 22, 0.7);
                --color-border: rgba(234, 179, 8, 0.25);
                --color-border-border: rgba(234, 179, 8, 0.7);
                --color-padding: rgba(34, 197, 94, 0.25);
                --color-padding-border: rgba(34, 197, 94, 0.7);
                --color-content: rgba(59, 130, 246, 0.25);
                --color-content-border: rgba(59, 130, 246, 0.7);
            }

            /* --- BOX MODEL OVERLAYS --- */
            .box-overlay {
                position: fixed;
                pointer-events: none;
                z-index: 9998;
                display: none;
            }
            .margin-overlay { background: var(--color-margin); outline: 1px dashed var(--color-margin-border); }
            .border-overlay { background: var(--color-border); outline: 1px solid var(--color-border-border); }
            .padding-overlay { background: var(--color-padding); outline: 1px solid var(--color-padding-border); }
            .content-overlay { background: var(--color-content); outline: 1px solid var(--color-content-border); }

            /* --- FIXED CORNER HUD PANEL --- */
            .hud-container {
                position: fixed;
                background: var(--hud-bg);
                backdrop-filter: blur(16px);
                -webkit-backdrop-filter: blur(16px);
                border: 1px solid var(--hud-border);
                color: var(--hud-text-primary);
                border-radius: 12px;
                font-family: var(--hud-font);
                font-size: 12px;
                box-shadow: 0 16px 36px -4px rgba(0, 0, 0, 0.5), 0 8px 12px -6px rgba(0, 0, 0, 0.3);
                pointer-events: auto;
                z-index: 10001;
                width: 380px;
                max-height: 84vh;
                display: flex;
                flex-direction: column;
                overflow: hidden;
                transition: top 0.2s cubic-bezier(0.16, 1, 0.3, 1), bottom 0.2s cubic-bezier(0.16, 1, 0.3, 1), left 0.2s cubic-bezier(0.16, 1, 0.3, 1), right 0.2s cubic-bezier(0.16, 1, 0.3, 1);
            }

            /* 4 Corner Positions */
            .hud-container.pos-bottom-right { top: auto; left: auto; right: 20px; bottom: 20px; }
            .hud-container.pos-bottom-left { top: auto; left: 20px; right: auto; bottom: 20px; }
            .hud-container.pos-top-left { top: 20px; left: 20px; right: auto; bottom: auto; }
            .hud-container.pos-top-right { top: 20px; left: auto; right: 20px; bottom: auto; }

            /* Locked State Indicator */
            .hud-container.is-locked {
                border-color: #000000ff;
                box-shadow: 0 0 0 1px #000000ff, 0 16px 36px -4px rgba(0, 0, 0, 0.5);
            }

            /* --- HEADER & CONTROLS --- */
            .hud-header {
                padding: 10px 14px 8px;
                background: var(--hud-surface);
                border-bottom: 1px solid var(--hud-divider);
                display: flex;
                flex-direction: column;
                gap: 6px;
            }

            .hud-top-bar {
                display: flex;
                align-items: center;
                justify-content: space-between;
            }

            .hud-title-tag {
                font-family: var(--hud-code);
                font-size: 13px;
                font-weight: 700;
                display: flex;
                align-items: center;
                gap: 6px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                max-width: 240px;
            }

            .lock-badge {
                display: none;
                background: #3b82f6;
                color: #ffffff;
                font-size: 9px;
                font-weight: 700;
                padding: 1px 5px;
                border-radius: 4px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            .hud-container.is-locked .lock-badge { display: inline-block; }

            .tag-name { color: var(--hud-tag-name); }
            .tag-id { color: var(--hud-tag-id); }
            .tag-class { color: var(--hud-tag-class); }

            /* 4-Direction Corner Navigation Controls */
            .corner-switcher {
                display: flex;
                align-items: center;
                gap: 2px;
                background: rgba(0, 0, 0, 0.25);
                border: 1px solid var(--hud-border);
                border-radius: 6px;
                padding: 2px;
            }

            .corner-btn {
                background: transparent;
                border: none;
                color: var(--hud-text-secondary);
                width: 22px;
                height: 22px;
                border-radius: 4px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.15s;
            }
            .corner-btn:hover {
                background: var(--hud-surface-hover);
                color: var(--hud-text-primary);
            }
            .corner-btn.active {
                background: var(--hud-accent);
                color: #ffffff;
            }

            /* Pseudo State Switcher (:hover / :active / :focus) */
            .pseudo-bar {
                display: flex;
                align-items: center;
                gap: 4px;
                padding: 2px 0;
            }
            .pseudo-chip {
                background: var(--hud-surface-hover);
                border: 1px solid var(--hud-border);
                color: var(--hud-text-secondary);
                font-family: var(--hud-code);
                font-size: 10px;
                padding: 2px 7px;
                border-radius: 4px;
                cursor: pointer;
                transition: all 0.15s;
                user-select: none;
                display: flex;
                align-items: center;
                gap: 3px;
            }
            .pseudo-chip:hover {
                color: var(--hud-text-primary);
                border-color: var(--hud-accent);
            }
            .pseudo-chip.active {
                background: var(--hud-accent);
                color: #ffffff;
                border-color: var(--hud-accent);
                font-weight: 700;
            }
            .pseudo-chip.has-rule::after {
                content: '';
                width: 4px;
                height: 4px;
                background: #10b981;
                border-radius: 50%;
                display: inline-block;
            }

            /* Contextual DOM Breadcrumbs */
            .hud-breadcrumbs {
                display: flex;
                align-items: center;
                gap: 4px;
                overflow-x: auto;
                padding-bottom: 2px;
                scrollbar-width: none;
            }
            .hud-breadcrumbs::-webkit-scrollbar { display: none; }

            .breadcrumb-item {
                font-family: var(--hud-code);
                font-size: 10px;
                color: var(--hud-text-secondary);
                background: var(--hud-surface-hover);
                padding: 2px 6px;
                border-radius: 4px;
                cursor: pointer;
                white-space: nowrap;
                transition: all 0.15s;
                border: 1px solid transparent;
            }
            .breadcrumb-item:hover {
                color: var(--hud-text-primary);
                border-color: var(--hud-accent);
                background: var(--hud-accent-subtle);
            }
            .breadcrumb-item.active {
                color: var(--hud-accent);
                font-weight: 700;
                background: var(--hud-accent-subtle);
            }
            .breadcrumb-separator {
                color: var(--hud-text-muted);
                font-size: 9px;
            }

            /* --- TABS --- */
            .hud-tabs {
                display: flex;
                background: var(--hud-surface);
                border-bottom: 1px solid var(--hud-divider);
                padding: 0 8px;
                gap: 4px;
            }

            .tab-btn {
                background: none;
                border: none;
                padding: 8px 12px;
                font-size: 11px;
                font-weight: 600;
                color: var(--hud-text-secondary);
                cursor: pointer;
                position: relative;
                transition: all 0.15s;
                font-family: var(--hud-font);
            }
            .tab-btn:hover { color: var(--hud-text-primary); }
            .tab-btn.active { color: var(--hud-accent); font-weight: 700; }
            .tab-btn.active::after {
                content: '';
                position: absolute;
                bottom: -1px;
                left: 8px;
                right: 8px;
                height: 2px;
                background: var(--hud-accent);
                border-radius: 2px 2px 0 0;
            }

            /* --- TAB CONTENT & BODY --- */
            .hud-body {
                padding: 0;
                overflow-y: auto;
                max-height: calc(84vh - 145px);
            }
            .hud-body::-webkit-scrollbar { width: 5px; }
            .hud-body::-webkit-scrollbar-track { background: transparent; }
            .hud-body::-webkit-scrollbar-thumb { background: var(--hud-border); border-radius: 4px; }

            .tab-pane { display: none; }
            .tab-pane.active { display: block; }

            .section {
                padding: 10px 14px;
                border-bottom: 1px solid var(--hud-divider);
            }
            .section:last-child { border-bottom: none; }

            .section-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 8px;
            }

            .section-title {
                color: var(--hud-text-muted);
                font-size: 10px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.6px;
            }

            .quick-metrics {
                display: flex;
                flex-wrap: wrap;
                gap: 6px;
            }
            .metric-pill {
                background: var(--hud-surface);
                border: 1px solid var(--hud-border);
                padding: 4px 8px;
                border-radius: 6px;
                font-size: 11px;
                color: var(--hud-text-secondary);
                display: flex;
                align-items: center;
                gap: 5px;
                cursor: pointer;
                transition: all 0.15s;
            }
            .metric-pill:hover {
                border-color: var(--hud-accent);
                color: var(--hud-text-primary);
                background: var(--hud-surface-hover);
            }
            .metric-pill strong { color: var(--hud-text-primary); }

            /* --- CONCENTRIC FIGMA-STYLE BOX MODEL --- */
            .box-diagram-wrapper {
                display: flex;
                justify-content: center;
                padding: 2px 0;
            }
            .box-diagram-margin {
                position: relative;
                width: 100%;
                background: rgba(249, 115, 22, 0.08);
                border: 1px dashed rgba(249, 115, 22, 0.45);
                border-radius: 8px;
                padding: 18px 24px;
                font-family: var(--hud-code);
                font-size: 10px;
                box-sizing: border-box;
            }
            .box-diagram-padding {
                position: relative;
                background: rgba(34, 197, 94, 0.08);
                border: 1px solid rgba(34, 197, 94, 0.45);
                border-radius: 6px;
                padding: 16px 22px;
                box-sizing: border-box;
            }
            .box-diagram-content {
                background: rgba(59, 130, 246, 0.18);
                border: 1px solid rgba(59, 130, 246, 0.5);
                border-radius: 4px;
                padding: 5px 8px;
                color: #93c5fd;
                font-weight: 700;
                font-size: 10px;
                text-align: center;
                white-space: nowrap;
            }
            .box-diagram-label {
                position: absolute;
                font-size: 8px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                top: 3px;
                left: 6px;
                user-select: none;
            }
            .label-m { color: #fb923c; }
            .label-p { color: #4ade80; }

            .b-val {
                position: absolute;
                font-weight: 600;
                color: var(--hud-text-primary);
                user-select: none;
            }
            .b-val.is-zero {
                color: var(--hud-text-muted);
                opacity: 0.6;
            }
            .b-top { top: 3px; left: 50%; transform: translateX(-50%); }
            .b-bottom { bottom: 3px; left: 50%; transform: translateX(-50%); }
            .b-left { left: 6px; top: 50%; transform: translateY(-50%); }
            .b-right { right: 6px; top: 50%; transform: translateY(-50%); }

            /* Property Grid */
            .prop-grid {
                display: flex;
                flex-direction: column;
                gap: 4px;
            }
            .prop-row {
                display: grid;
                grid-template-columns: 90px 1fr auto;
                gap: 8px;
                align-items: center;
                padding: 3px 6px;
                border-radius: 4px;
                transition: background 0.12s;
            }
            .prop-row:hover { background: var(--hud-surface-hover); }
            .prop-name {
                color: var(--hud-text-secondary);
                font-size: 11px;
                text-align: right;
                font-weight: 500;
            }
            .prop-val {
                color: var(--hud-text-primary);
                font-family: var(--hud-code);
                font-size: 11px;
                word-break: break-all;
                display: flex;
                align-items: center;
                gap: 6px;
            }
            .prop-val-editable {
                outline: none;
                border-bottom: 1px dashed transparent;
                cursor: text;
            }
            .prop-val-editable:hover { border-bottom-color: var(--hud-accent); }
            .prop-val-editable:focus {
                background: var(--hud-surface);
                border-bottom: 1px solid var(--hud-accent);
                color: var(--hud-accent-hover);
                padding: 1px 4px;
                border-radius: 2px;
            }

            .prop-copy-btn {
                background: transparent;
                border: none;
                color: var(--hud-text-muted);
                cursor: pointer;
                opacity: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 2px;
                transition: opacity 0.12s, color 0.12s;
            }
            .prop-row:hover .prop-copy-btn { opacity: 1; }
            .prop-copy-btn:hover { color: var(--hud-accent); }

            .color-chip {
                width: 14px;
                height: 14px;
                border-radius: 4px;
                border: 1px solid rgba(255,255,255,0.2);
                display: inline-block;
                cursor: pointer;
                flex-shrink: 0;
                box-shadow: 0 1px 3px rgba(0,0,0,0.2);
            }

            /* Export Tab Code Blocks */
            .export-card {
                padding: 12px 14px;
                display: flex;
                flex-direction: column;
                gap: 12px;
            }
            .code-block-wrapper {
                background: var(--hud-surface);
                border: 1px solid var(--hud-border);
                border-radius: 8px;
                overflow: hidden;
            }
            .code-block-header {
                padding: 6px 10px;
                background: rgba(0,0,0,0.15);
                display: flex;
                align-items: center;
                justify-content: space-between;
                font-size: 10px;
                font-weight: 700;
                color: var(--hud-text-muted);
                text-transform: uppercase;
            }
            .code-block {
                padding: 10px;
                font-family: var(--hud-code);
                font-size: 11px;
                line-height: 1.6;
                color: var(--hud-text-primary);
                white-space: pre-wrap;
                max-height: 220px;
                overflow-y: auto;
                user-select: text;
            }
            .btn-action {
                background: var(--hud-accent);
                border: none;
                color: #ffffff;
                font-size: 10px;
                font-weight: 600;
                padding: 4px 8px;
                border-radius: 4px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 4px;
                transition: background 0.15s;
            }
            .btn-action:hover { background: var(--hud-accent-hover); }

            /* Classes & Color Palette Tab */
            .assets-card {
                padding: 12px 14px;
                display: flex;
                flex-direction: column;
                gap: 12px;
            }
            .search-input {
                width: 100%;
                background: var(--hud-surface);
                border: 1px solid var(--hud-border);
                border-radius: 6px;
                padding: 6px 10px;
                color: var(--hud-text-primary);
                font-family: var(--hud-font);
                font-size: 11px;
                outline: none;
            }
            .search-input:focus { border-color: var(--hud-accent); }

            .tag-cloud {
                display: flex;
                flex-wrap: wrap;
                gap: 6px;
                max-height: 200px;
                overflow-y: auto;
            }
            .asset-tag {
                background: var(--hud-surface);
                border: 1px solid var(--hud-border);
                padding: 3px 8px;
                border-radius: 4px;
                font-family: var(--hud-code);
                font-size: 11px;
                color: var(--hud-tag-class);
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 4px;
                transition: all 0.15s;
            }
            .asset-tag:hover {
                border-color: var(--hud-accent);
                background: var(--hud-surface-hover);
            }
            .asset-tag .count {
                background: var(--hud-border);
                color: var(--hud-text-muted);
                padding: 1px 4px;
                border-radius: 3px;
                font-size: 9px;
            }

            .palette-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
                gap: 6px;
                max-height: 160px;
                overflow-y: auto;
            }
            .palette-item {
                background: var(--hud-surface);
                border: 1px solid var(--hud-border);
                border-radius: 6px;
                padding: 4px;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 4px;
                cursor: pointer;
                transition: all 0.15s;
            }
            .palette-item:hover {
                border-color: var(--hud-accent);
                transform: translateY(-1px);
            }
            .palette-color {
                width: 100%;
                height: 24px;
                border-radius: 4px;
                border: 1px solid rgba(0,0,0,0.1);
            }
            .palette-hex {
                font-family: var(--hud-code);
                font-size: 9px;
                color: var(--hud-text-secondary);
            }

            /* --- FOOTER SHORTCUT HINTS --- */
            .hud-footer {
                padding: 6px 14px;
                background: var(--hud-surface);
                border-top: 1px solid var(--hud-divider);
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-size: 10px;
                color: var(--hud-text-muted);
            }
            .key-chip {
                background: var(--hud-surface-hover);
                border: 1px solid var(--hud-border);
                padding: 1px 4px;
                border-radius: 3px;
                font-weight: 600;
                color: var(--hud-text-secondary);
                font-family: var(--hud-code);
            }

            /* --- TOAST NOTIFICATION --- */
            .hud-toast {
                position: fixed;
                bottom: 24px;
                left: 50%;
                transform: translate(-50%, 15px);
                background: #0f172a;
                color: #ffffff;
                border: 1px solid #334155;
                padding: 8px 16px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 500;
                opacity: 0;
                pointer-events: none;
                transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
                z-index: 10005;
                box-shadow: 0 4px 15px rgba(0,0,0,0.4);
                display: flex;
                align-items: center;
                gap: 6px;
            }
            .hud-toast.show { opacity: 1; transform: translate(-50%, 0); }
            .hud-toast-icon { display: flex; color: #10b981; }
        `;

        const html = `
            <!-- Box Model Overlays -->
            <div class="box-overlay margin-overlay" id="margin-box"></div>
            <div class="box-overlay border-overlay" id="border-box"></div>
            <div class="box-overlay padding-overlay" id="padding-box"></div>
            <div class="box-overlay content-overlay" id="content-box"></div>

            <!-- Toast Notification -->
            <div class="hud-toast" id="hud-toast">
                <span class="hud-toast-icon">${ICONS.checkCircleFill}</span>
                <span id="hud-toast-msg">Copied to clipboard!</span>
            </div>

            <!-- Fixed Corner HUD Panel -->
            <div class="hud-container pos-${hudPosition}" id="hud-container">
                <!-- Header -->
                <div class="hud-header">
                    <div class="hud-top-bar">
                        <div class="hud-title-tag">
                            <span class="lock-badge" id="hud-lock-badge">LOCKED</span>
                            <span id="hud-tag-title"></span>
                        </div>
                        <!-- 4-Corner Switcher Controls -->
                        <div class="corner-switcher" title="Move HUD Corner">
                            <button class="corner-btn" id="btn-pos-top-left" data-pos="top-left" title="Top-Left">${ICONS.caretUpDuotone}</button>
                            <button class="corner-btn" id="btn-pos-top-right" data-pos="top-right" title="Top-Right">${ICONS.caretRightDuotone}</button>
                            <button class="corner-btn" id="btn-pos-bottom-left" data-pos="bottom-left" title="Bottom-Left">${ICONS.caretLeftDuotone}</button>
                            <button class="corner-btn active" id="btn-pos-bottom-right" data-pos="bottom-right" title="Bottom-Right">${ICONS.caretDownFill}</button>
                        </div>
                    </div>

                    <!-- State Selector (:hover / :active / :focus) -->
                    <div class="pseudo-bar">
                        <span class="pseudo-chip active" data-pseudo="normal">Normal</span>
                        <span class="pseudo-chip" data-pseudo="hover" id="chip-hover">:hover</span>
                        <span class="pseudo-chip" data-pseudo="active" id="chip-active">:active</span>
                        <span class="pseudo-chip" data-pseudo="focus" id="chip-focus">:focus</span>
                    </div>

                    <!-- Contextual Breadcrumbs -->
                    <div class="hud-breadcrumbs" id="hud-breadcrumbs"></div>
                </div>

                <!-- Tabs -->
                <div class="hud-tabs">
                    <button class="tab-btn active" data-tab="inspector">Inspector</button>
                    <button class="tab-btn" data-tab="export">Export Code</button>
                    <button class="tab-btn" data-tab="assets">Classes & Palette</button>
                </div>

                <!-- Body -->
                <div class="hud-body">
                    <!-- Tab 1: Inspector -->
                    <div class="tab-pane active" id="pane-inspector">
                        <div id="inspector-content"></div>
                    </div>

                    <!-- Tab 2: Export Code -->
                    <div class="tab-pane" id="pane-export">
                        <div class="export-card">
                            <div class="code-block-wrapper">
                                <div class="code-block-header">
                                    <span>Matched Stylesheet Rules</span>
                                    <button class="btn-action" id="btn-copy-css">${ICONS.copyDuotone} Copy</button>
                                </div>
                                <div class="code-block" id="code-css"></div>
                            </div>
                            <div class="code-block-wrapper">
                                <div class="code-block-header">
                                    <span>React Style Object</span>
                                    <button class="btn-action" id="btn-copy-react">${ICONS.copyDuotone} Copy</button>
                                </div>
                                <div class="code-block" id="code-react"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Tab 3: Classes & Palette -->
                    <div class="tab-pane" id="pane-assets">
                        <div class="assets-card">
                            <div class="section-title">Page CSS Classes</div>
                            <input type="text" class="search-input" id="search-classes" placeholder="Filter classes...">
                            <div class="tag-cloud" id="classes-cloud"></div>
                            
                            <div class="section-title" style="margin-top: 10px;">Page Color Palette</div>
                            <div class="palette-grid" id="palette-grid"></div>
                        </div>
                    </div>
                </div>

                <!-- Footer Hints -->
                <div class="hud-footer">
                    <span><span class="key-chip">Ctrl+Click</span> Lock &middot; <span class="key-chip">Hover</span> Live &middot; <span class="key-chip">↑</span>/<span class="key-chip">↓</span></span>
                    <span><span class="key-chip">Esc</span> Unlock/Close</span>
                </div>
            </div>
        `;

        overlayRoot.appendChild(style);
        const container = document.createElement("div");
        container.innerHTML = html;
        while (container.firstChild) {
            overlayRoot.appendChild(container.firstChild);
        }
        document.body.appendChild(host);

        attachEventListeners();
        updateCornerButtons();
    }

    // --- EVENT LISTENERS & WIRING ---
    function attachEventListeners() {
        if (!overlayRoot) return;

        // 4-Corner Position Buttons
        ['top-left', 'top-right', 'bottom-left', 'bottom-right'].forEach(pos => {
            const btn = overlayRoot.getElementById(`btn-pos-${pos}`);
            if (btn) {
                btn.addEventListener("click", (e) => {
                    e.stopPropagation();
                    setHudPosition(pos);
                });
            }
        });

        // Pseudo-Class State Switchers
        const pseudoChips = overlayRoot.querySelectorAll(".pseudo-chip");
        pseudoChips.forEach(chip => {
            chip.addEventListener("click", (e) => {
                e.stopPropagation();
                activePseudo = chip.dataset.pseudo;
                pseudoChips.forEach(c => c.classList.toggle("active", c.dataset.pseudo === activePseudo));
                if (currentElement) {
                    renderInspectorCard(currentElement);
                    if (activeTab === 'export') updateExportTab(currentElement);
                }
            });
        });

        // Tab Switching
        const tabs = overlayRoot.querySelectorAll(".tab-btn");
        tabs.forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                switchTab(btn.dataset.tab);
            });
        });

        // Export Copy Buttons
        overlayRoot.getElementById("btn-copy-css").addEventListener("click", () => {
            const text = overlayRoot.getElementById("code-css").textContent;
            copyToClipboard(text);
            showToast("Copied CSS Rules!");
        });
        overlayRoot.getElementById("btn-copy-react").addEventListener("click", () => {
            const text = overlayRoot.getElementById("code-react").textContent;
            copyToClipboard(text);
            showToast("Copied React Style!");
        });

        // Classes Search
        const searchInput = overlayRoot.getElementById("search-classes");
        searchInput.addEventListener("input", (e) => {
            renderClassesCloud(e.target.value);
        });
    }

    function setHudPosition(pos) {
        hudPosition = pos;
        const hud = overlayRoot.getElementById("hud-container");
        hud.classList.remove("pos-top-left", "pos-top-right", "pos-bottom-left", "pos-bottom-right");
        hud.classList.add(`pos-${pos}`);
        updateCornerButtons();
    }

    function updateCornerButtons() {
        const btns = {
            'top-left': { el: overlayRoot.getElementById("btn-pos-top-left"), d: ICONS.caretUpDuotone, f: ICONS.caretUpFill },
            'top-right': { el: overlayRoot.getElementById("btn-pos-top-right"), d: ICONS.caretRightDuotone, f: ICONS.caretRightFill },
            'bottom-left': { el: overlayRoot.getElementById("btn-pos-bottom-left"), d: ICONS.caretLeftDuotone, f: ICONS.caretLeftFill },
            'bottom-right': { el: overlayRoot.getElementById("btn-pos-bottom-right"), d: ICONS.caretDownDuotone, f: ICONS.caretDownFill }
        };

        Object.entries(btns).forEach(([pos, data]) => {
            if (data.el) {
                const isActive = hudPosition === pos;
                data.el.classList.toggle("active", isActive);
                data.el.innerHTML = isActive ? data.f : data.d;
            }
        });
    }

    function switchTab(tabName) {
        if (!overlayRoot) return;
        activeTab = tabName;

        const tabs = overlayRoot.querySelectorAll(".tab-btn");
        tabs.forEach(btn => btn.classList.toggle("active", btn.dataset.tab === tabName));

        const panes = overlayRoot.querySelectorAll(".tab-pane");
        panes.forEach(pane => pane.classList.toggle("active", pane.id === `pane-${tabName}`));

        if (currentElement) {
            if (tabName === 'export') updateExportTab(currentElement);
            if (tabName === 'assets') updateAssetsTab();
        }
    }

    // --- OVERLAY RENDERING ---
    function updateOverlays(element) {
        if (!overlayRoot || !element) {
            hideOverlays();
            return;
        }

        const boxModel = getBoxModel(element);
        const setStyle = (id, box) => {
            const el = overlayRoot.getElementById(id);
            if (!el) return;
            el.style.display = "block";
            el.style.top = `${box.top}px`;
            el.style.left = `${box.left}px`;
            el.style.width = `${box.width}px`;
            el.style.height = `${box.height}px`;
        };

        setStyle("content-box", boxModel.content);
        setStyle("padding-box", boxModel.padding);
        setStyle("border-box", boxModel.border);
        setStyle("margin-box", boxModel.margin);
    }

    function hideOverlays() {
        if (!overlayRoot) return;
        ["content-box", "padding-box", "border-box", "margin-box"].forEach(id => {
            const el = overlayRoot.getElementById(id);
            if (el) el.style.display = "none";
        });
    }

    // --- HUD INSPECTOR CARD CONTENT ---
    function renderInspectorCard(element) {
        if (!overlayRoot || !element) return;

        const computed = window.getComputedStyle(element);
        const boxModel = getBoxModel(element);
        const { authoredMap, hasHover, hasActive, hasFocus } = getAuthoredStyles(element, activePseudo);

        // Header Title Tag (Escaped)
        const hudTagTitle = overlayRoot.getElementById("hud-tag-title");
        const safeTag = escapeHtml(element.tagName.toLowerCase());
        const tagName = `<span class="tag-name">${safeTag}</span>`;
        const idName = element.id ? `<span class="tag-id">#${escapeHtml(element.id)}</span>` : "";
        const classNames = element.classList.length > 0 ? `<span class="tag-class">.${Array.from(element.classList).slice(0, 2).map(escapeHtml).join(".")}</span>` : "";
        hudTagTitle.innerHTML = `&lt;${tagName}${idName}${classNames}&gt;`;

        // Update Pseudo Chip Indicators (green dot if rule exists in stylesheet)
        const chipHover = overlayRoot.getElementById("chip-hover");
        const chipActive = overlayRoot.getElementById("chip-active");
        const chipFocus = overlayRoot.getElementById("chip-focus");
        if (chipHover) chipHover.classList.toggle("has-rule", hasHover);
        if (chipActive) chipActive.classList.toggle("has-rule", hasActive);
        if (chipFocus) chipFocus.classList.toggle("has-rule", hasFocus);

        // Contextual Breadcrumbs
        renderBreadcrumbs(element);

        // Inspector Content
        const contentContainer = overlayRoot.getElementById("inspector-content");
        let html = "";

        // Active State Indicator (if inspecting hover or active)
        if (activePseudo !== 'normal') {
            html += `
                <div style="background: var(--hud-accent-subtle); padding: 4px 14px; font-size: 10px; color: var(--hud-accent-hover); font-weight: 600; border-bottom: 1px solid var(--hud-divider);">
                    Viewing :${escapeHtml(activePseudo)} state styles
                </div>
            `;
        }

        // 1. Quick Metrics Row
        const displayVal = authoredMap['display'] || computed.display;
        const posVal = authoredMap['position'] || computed.position;
        const zIndexVal = authoredMap['z-index'] || computed.zIndex;

        html += `
            <div class="section">
                <div class="quick-metrics">
                    <div class="metric-pill" data-copy="${Math.round(boxModel.rect.width)}px * ${Math.round(boxModel.rect.height)}px">
                        <strong>${Math.round(boxModel.rect.width)} &times; ${Math.round(boxModel.rect.height)}</strong>
                    </div>
                    <div class="metric-pill" data-copy="${escapeHtml(displayVal)}">
                        <span>display:</span><strong>${escapeHtml(displayVal)}</strong>
                    </div>
                    <div class="metric-pill" data-copy="${escapeHtml(posVal)}">
                        <span>pos:</span><strong>${escapeHtml(posVal)}</strong>
                    </div>
                    ${computed.zIndex !== 'auto' || authoredMap['z-index'] ? `<div class="metric-pill" data-copy="${escapeHtml(zIndexVal)}"><span>z:</span><strong>${escapeHtml(zIndexVal)}</strong></div>` : ''}
                </div>
            </div>
        `;

        // 2. Figma-Style Concentric Box Model Diagram
        const m = boxModel.values.margin;
        const p = boxModel.values.padding;
        const fmtVal = (n) => (n === 0 ? '-' : `${n}`);
        const isZero = (n) => (n === 0 ? 'is-zero' : '');

        html += `
            <div class="section">
                <div class="section-header">
                    <span class="section-title">Spacing & Geometry</span>
                </div>
                <div class="box-diagram-wrapper">
                    <div class="box-diagram-margin">
                        <span class="box-diagram-label label-m">Margin</span>
                        <span class="b-val b-top ${isZero(m.top)}">${fmtVal(m.top)}</span>
                        <span class="b-val b-right ${isZero(m.right)}">${fmtVal(m.right)}</span>
                        <span class="b-val b-bottom ${isZero(m.bottom)}">${fmtVal(m.bottom)}</span>
                        <span class="b-val b-left ${isZero(m.left)}">${fmtVal(m.left)}</span>

                        <div class="box-diagram-padding">
                            <span class="box-diagram-label label-p">Padding</span>
                            <span class="b-val b-top ${isZero(p.top)}">${fmtVal(p.top)}</span>
                            <span class="b-val b-right ${isZero(p.right)}">${fmtVal(p.right)}</span>
                            <span class="b-val b-bottom ${isZero(p.bottom)}">${fmtVal(p.bottom)}</span>
                            <span class="b-val b-left ${isZero(p.left)}">${fmtVal(p.left)}</span>

                            <div class="box-diagram-content">
                                ${Math.round(boxModel.content.width)} &times; ${Math.round(boxModel.content.height)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // 3. Typography
        const typoItems = [
            { label: 'Font', prop: 'font-family', auth: authoredMap['font-family'], comp: computed.fontFamily.split(',')[0].replace(/['"]/g, '') },
            { label: 'Size', prop: 'font-size', auth: authoredMap['font-size'], comp: computed.fontSize },
            { label: 'Line Ht', prop: 'line-height', auth: authoredMap['line-height'], comp: computed.lineHeight },
            { label: 'Weight', prop: 'font-weight', auth: authoredMap['font-weight'], comp: computed.fontWeight },
            { label: 'Color', prop: 'color', auth: authoredMap['color'], comp: computed.color, isColor: true },
            { label: 'Align', prop: 'text-align', auth: authoredMap['text-align'], comp: computed.textAlign !== 'start' ? computed.textAlign : null }
        ].filter(i => (i.auth || (i.comp && i.comp !== 'normal')));

        if (typoItems.length > 0) {
            html += `<div class="section"><div class="section-header"><span class="section-title">Typography</span></div><div class="prop-grid">`;
            typoItems.forEach(item => {
                html += renderPropRow(item.label, item.prop, item.auth, item.comp, item.isColor, element);
            });
            html += `</div></div>`;
        }

        // 4. Backgrounds & Borders & Sizing
        const decorItems = [
            { label: 'Max Width', prop: 'max-width', auth: authoredMap['max-width'], comp: computed.maxWidth !== 'none' ? computed.maxWidth : null },
            { label: 'Min Width', prop: 'min-width', auth: authoredMap['min-width'], comp: computed.minWidth !== '0px' ? computed.minWidth : null },
            { label: 'Background', prop: 'background-color', auth: authoredMap['background-color'] || authoredMap['background'], comp: computed.backgroundColor, isColor: true },
            { label: 'Radius', prop: 'border-radius', auth: authoredMap['border-radius'], comp: computed.borderRadius !== '0px' ? computed.borderRadius : null },
            { label: 'Border', prop: 'border', auth: authoredMap['border'], comp: computed.border && !computed.border.startsWith('0px') ? computed.border : null },
            { label: 'Shadow', prop: 'box-shadow', auth: authoredMap['box-shadow'], comp: computed.boxShadow !== 'none' ? computed.boxShadow : null },
            { label: 'Opacity', prop: 'opacity', auth: authoredMap['opacity'], comp: computed.opacity !== '1' ? computed.opacity : null },
            { label: 'Transform', prop: 'transform', auth: authoredMap['transform'], comp: computed.transform !== 'none' ? computed.transform : null },
            { label: 'Transition', prop: 'transition', auth: authoredMap['transition'], comp: computed.transition !== 'all 0s ease 0s' ? computed.transition : null },
            { label: 'Cursor', prop: 'cursor', auth: authoredMap['cursor'], comp: computed.cursor !== 'auto' ? computed.cursor : null }
        ].filter(i => i.auth || (i.comp && !i.comp.includes('rgba(0, 0, 0, 0)')));

        if (decorItems.length > 0) {
            html += `<div class="section"><div class="section-header"><span class="section-title">Decorations & Effects</span></div><div class="prop-grid">`;
            decorItems.forEach(item => {
                html += renderPropRow(item.label, item.prop, item.auth, item.comp, item.isColor, element);
            });
            html += `</div></div>`;
        }

        // 5. Flex / Grid
        if (computed.display.includes('flex') || computed.display.includes('grid') || authoredMap['display']?.includes('flex') || authoredMap['display']?.includes('grid')) {
            const layoutItems = [
                { label: 'Direction', prop: 'flex-direction', auth: authoredMap['flex-direction'], comp: computed.flexDirection },
                { label: 'Justify', prop: 'justify-content', auth: authoredMap['justify-content'], comp: computed.justifyContent },
                { label: 'Align', prop: 'align-items', auth: authoredMap['align-items'], comp: computed.alignItems },
                { label: 'Gap', prop: 'gap', auth: authoredMap['gap'], comp: computed.gap !== 'normal' ? computed.gap : null },
                { label: 'Template', prop: 'grid-template-columns', auth: authoredMap['grid-template-columns'], comp: computed.gridTemplateColumns !== 'none' ? computed.gridTemplateColumns : null }
            ].filter(i => i.auth || (i.comp && i.comp !== 'normal' && i.comp !== 'none'));

            if (layoutItems.length > 0) {
                html += `<div class="section"><div class="section-header"><span class="section-title">Layout (${escapeHtml(authoredMap['display'] || computed.display)})</span></div><div class="prop-grid">`;
                layoutItems.forEach(item => {
                    html += renderPropRow(item.label, item.prop, item.auth, item.comp, false, element);
                });
                html += `</div></div>`;
            }
        }

        contentContainer.innerHTML = html;
        attachPropertyInteractions(contentContainer, element);
    }

    function renderPropRow(label, propName, authoredVal, computedVal, isColor, targetElement) {
        const displayVal = authoredVal || computedVal;
        let colorChipHtml = "";
        let resolvedHintHtml = "";

        // Resolve CSS variables dynamically against targetElement
        const resolvedVal = authoredVal ? resolveCssValue(authoredVal, targetElement) : computedVal;
        const safeDisplayVal = escapeHtml(displayVal);
        const safePropName = escapeHtml(propName);
        const safeLabel = escapeHtml(label);

        if (isColor && resolvedVal && resolvedVal !== "transparent" && !resolvedVal.includes('rgba(0, 0, 0, 0)')) {
            const safeResolvedVal = escapeHtml(resolvedVal);
            colorChipHtml = `<span class="color-chip" style="background:${safeResolvedVal}" title="Click to cycle format (HEX/RGB/HSL)" data-color="${safeResolvedVal}"></span>`;
        }

        if (authoredVal && (authoredVal.startsWith("var(") || authoredVal.includes("var("))) {
            const resolvedFmt = isColor ? formatColor(resolvedVal) : resolvedVal;
            resolvedHintHtml = `<span style="color:var(--hud-text-muted); font-size:10px; margin-left:4px;">(${escapeHtml(resolvedFmt)})</span>`;
        }

        return `
            <div class="prop-row" data-prop="${safePropName}">
                <span class="prop-name">${safeLabel}</span>
                <span class="prop-val">
                    ${colorChipHtml}
                    <span class="prop-val-editable" contenteditable="true" spellcheck="false" data-prop="${safePropName}">${safeDisplayVal}</span>
                    ${resolvedHintHtml}
                </span>
                <button class="prop-copy-btn" title="Copy property" data-copy="${safePropName}: ${safeDisplayVal};">${ICONS.copyDuotone}</button>
            </div>
        `;
    }

    function attachPropertyInteractions(container, targetElement) {
        container.querySelectorAll(".prop-copy-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                copyToClipboard(btn.dataset.copy);
                showToast("Copied to clipboard!");
            });
        });

        container.querySelectorAll(".metric-pill").forEach(pill => {
            pill.addEventListener("click", (e) => {
                e.stopPropagation();
                copyToClipboard(pill.dataset.copy);
                showToast(`Copied: ${pill.dataset.copy}`);
            });
        });

        container.querySelectorAll(".color-chip").forEach(chip => {
            chip.addEventListener("click", (e) => {
                e.stopPropagation();
                const formats = ['hex', 'rgb', 'hsl'];
                colorFormat = formats[(formats.indexOf(colorFormat) + 1) % formats.length];
                renderInspectorCard(targetElement);
                showToast(`Color format: ${colorFormat.toUpperCase()}`);
            });
        });

        container.querySelectorAll(".prop-val-editable").forEach(field => {
            field.addEventListener("keydown", (e) => {
                if (e.key === "Enter") {
                    e.preventDefault();
                    field.blur();
                }
            });
            field.addEventListener("blur", () => {
                const prop = field.dataset.prop;
                const newVal = field.textContent.trim();
                if (targetElement && prop) {
                    targetElement.style.setProperty(prop, newVal);
                    updateOverlays(targetElement);
                    showToast(`Updated ${prop}`);
                }
            });
        });
    }

    // --- CONTEXTUAL BREADCRUMBS ---
    function renderBreadcrumbs(element) {
        const breadcrumbContainer = overlayRoot.getElementById("hud-breadcrumbs");
        const path = [];
        let curr = element;

        while (curr && curr !== document.body && curr !== document.documentElement) {
            let label = curr.tagName.toLowerCase();
            if (curr.id) label += `#${curr.id}`;
            else if (curr.classList.length > 0) label += `.${curr.classList[0]}`;
            path.unshift({ el: curr, label });
            curr = curr.parentElement;
        }
        if (curr) path.unshift({ el: curr, label: 'body' });

        let html = "";
        path.forEach((item, idx) => {
            const isLast = idx === path.length - 1;
            html += `<span class="breadcrumb-item ${isLast ? 'active' : ''}" data-idx="${idx}">${escapeHtml(item.label)}</span>`;
            if (!isLast) html += `<span class="breadcrumb-separator">&rsaquo;</span>`;
        });

        breadcrumbContainer.innerHTML = html;

        breadcrumbContainer.querySelectorAll(".breadcrumb-item").forEach((btn, idx) => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                const target = path[idx].el;
                if (target) {
                    currentElement = target;
                    updateOverlays(target);
                    renderInspectorCard(target);
                }
            });
        });
    }

    // --- TAB 2: EXPORT TAB ---
    function updateExportTab(element) {
        if (!overlayRoot || !element) return;

        const { rulesList, hoverRules, activeRules } = getAuthoredStyles(element, 'normal');
        const computed = window.getComputedStyle(element);

        let matchedCss = "";

        // 1. Normal Base Rules
        if (rulesList.length > 0) {
            rulesList.forEach(rule => {
                matchedCss += `/* ${rule.source} */\n${rule.selector} {\n`;
                Object.entries(rule.props).forEach(([p, v]) => {
                    matchedCss += `  ${p}: ${v};\n`;
                });
                matchedCss += `}\n\n`;
            });
        }

        // 2. Hover Rules
        if (hoverRules.length > 0) {
            hoverRules.forEach(rule => {
                matchedCss += `/* ${rule.source} (:hover) */\n${rule.selector} {\n`;
                Object.entries(rule.properties).forEach(([p, v]) => {
                    matchedCss += `  ${p}: ${v};\n`;
                });
                matchedCss += `}\n\n`;
            });
        }

        // 3. Active Rules
        if (activeRules.length > 0) {
            activeRules.forEach(rule => {
                matchedCss += `/* ${rule.source} (:active) */\n${rule.selector} {\n`;
                Object.entries(rule.properties).forEach(([p, v]) => {
                    matchedCss += `  ${p}: ${v};\n`;
                });
                matchedCss += `}\n\n`;
            });
        }

        matchedCss = matchedCss.trim();

        if (!matchedCss) {
            let selector = element.tagName.toLowerCase();
            if (element.id) selector += `#${element.id}`;
            if (element.className && typeof element.className === 'string') {
                const cls = element.className.trim().split(/\s+/).filter(Boolean).slice(0, 2).join('.');
                if (cls) selector += `.${cls}`;
            }
            matchedCss = `${selector} {\n`;
            const keyProps = ["display", "position", "width", "height", "margin", "padding", "color", "font-family", "font-size", "line-height"];
            keyProps.forEach(p => {
                const v = computed.getPropertyValue(p);
                if (v && v !== 'auto' && v !== 'normal' && v !== 'none' && !v.includes('rgba(0, 0, 0, 0)')) {
                    matchedCss += `  ${p}: ${v};\n`;
                }
            });
            matchedCss += `}`;
        }

        const reactStyle = generateReactStyle(computed);

        overlayRoot.getElementById("code-css").textContent = matchedCss;
        overlayRoot.getElementById("code-react").textContent = reactStyle;
    }

    // --- TAB 3: CLASSES & COLOR PALETTE TAB ---
    function updateAssetsTab() {
        if (!overlayRoot) return;

        const classMap = new Map();
        const colorSet = new Set();

        document.querySelectorAll('*').forEach(el => {
            if (el.id === 'live-inspector-host') return;
            if (el.className && typeof el.className === 'string') {
                el.className.trim().split(/\s+/).filter(Boolean).forEach(cls => {
                    classMap.set(cls, (classMap.get(cls) || 0) + 1);
                });
            }
            const comp = window.getComputedStyle(el);
            if (comp.color && comp.color !== 'rgba(0, 0, 0, 0)') colorSet.add(comp.color);
            if (comp.backgroundColor && comp.backgroundColor !== 'rgba(0, 0, 0, 0)') colorSet.add(comp.backgroundColor);
        });

        allClassesData = Array.from(classMap.entries()).sort((a, b) => b[1] - a[1]);
        allColorsData = Array.from(colorSet);

        renderClassesCloud("");
        renderColorPalette();
    }

    function renderClassesCloud(query) {
        const cloud = overlayRoot.getElementById("classes-cloud");
        if (!cloud) return;

        const filtered = query.trim()
            ? allClassesData.filter(([c]) => c.toLowerCase().includes(query.toLowerCase()))
            : allClassesData.slice(0, 80);

        if (filtered.length === 0) {
            cloud.innerHTML = `<span style="color:var(--hud-text-muted); font-size:11px;">No matching classes found</span>`;
            return;
        }

        let html = "";
        filtered.forEach(([cls, count]) => {
            const safeCls = escapeHtml(cls);
            html += `<span class="asset-tag" data-copy=".${safeCls}">.${safeCls}<span class="count">${count}</span></span>`;
        });
        cloud.innerHTML = html;

        cloud.querySelectorAll(".asset-tag").forEach(tag => {
            tag.addEventListener("click", () => {
                copyToClipboard(tag.dataset.copy);
                showToast(`Copied: ${tag.dataset.copy}`);
            });
        });
    }

    function renderColorPalette() {
        const grid = overlayRoot.getElementById("palette-grid");
        if (!grid) return;

        let html = "";
        allColorsData.slice(0, 24).forEach(color => {
            const hex = formatColor(color, 'hex');
            const safeHex = escapeHtml(hex);
            const safeColor = escapeHtml(color);
            html += `
                <div class="palette-item" data-copy="${safeHex}">
                    <div class="palette-color" style="background:${safeColor}"></div>
                    <span class="palette-hex">${safeHex}</span>
                </div>
            `;
        });
        grid.innerHTML = html;

        grid.querySelectorAll(".palette-item").forEach(item => {
            item.addEventListener("click", () => {
                copyToClipboard(item.dataset.copy);
                showToast(`Copied ${item.dataset.copy}`);
            });
        });
    }

    // --- LOCK / UNLOCK CONTROLLER ---
    function setLockState(locked, target) {
        isLocked = locked;
        const hud = overlayRoot?.getElementById("hud-container");
        if (hud) hud.classList.toggle("is-locked", isLocked);

        if (locked && target) {
            currentElement = target;
            updateOverlays(target);
            renderInspectorCard(target);
            if (activeTab === 'export') updateExportTab(target);
            showToast("Element locked! (Ctrl+Click anywhere to release)");
        } else if (!locked) {
            showToast("Element released");
        }
    }

    // --- MOUSE & KEYBOARD HANDLERS ---
    function handleMouseMove(e) {
        if (!isActive || !overlayRoot || isLocked) return;

        const target = e.target;
        if (!target || target.id === 'live-inspector-host' || overlayRoot.contains(target)) return;

        if (target === currentElement) return;
        currentElement = target;

        updateOverlays(target);
        renderInspectorCard(target);
        if (activeTab === 'export') updateExportTab(target);
    }

    function handleClick(e) {
        if (!isActive || !overlayRoot) return;

        // If clicked inside HUD panel, allow normal interaction
        if (e.composedPath().some(el => el.id === 'live-inspector-host')) {
            return;
        }

        e.preventDefault();
        e.stopPropagation();

        if (e.ctrlKey || e.metaKey) {
            if (isLocked) {
                setLockState(false);
            } else {
                setLockState(true, e.target);
            }
        }
    }

    function handleKeyDown(e) {
        if (!isActive) return;

        if (e.key === "Escape") {
            if (isLocked) {
                setLockState(false);
            } else {
                toggleInspector(false);
            }
            return;
        }

        if (!currentElement) return;

        if (e.key === "ArrowUp") {
            e.preventDefault();
            if (currentElement.parentElement && currentElement.parentElement !== document.documentElement) {
                currentElement = currentElement.parentElement;
                updateOverlays(currentElement);
                renderInspectorCard(currentElement);
            }
        } else if (e.key === "ArrowDown") {
            e.preventDefault();
            if (currentElement.firstElementChild) {
                currentElement = currentElement.firstElementChild;
                updateOverlays(currentElement);
                renderInspectorCard(currentElement);
            }
        } else if (e.key === "ArrowLeft") {
            e.preventDefault();
            if (currentElement.previousElementSibling) {
                currentElement = currentElement.previousElementSibling;
                updateOverlays(currentElement);
                renderInspectorCard(currentElement);
            }
        } else if (e.key === "ArrowRight") {
            e.preventDefault();
            if (currentElement.nextElementSibling) {
                currentElement = currentElement.nextElementSibling;
                updateOverlays(currentElement);
                renderInspectorCard(currentElement);
            }
        }
    }

    // --- TOAST NOTIFICATION ---
    function showToast(msg) {
        if (!overlayRoot) return;
        const toast = overlayRoot.getElementById("hud-toast");
        const msgSpan = overlayRoot.getElementById("hud-toast-msg");
        if (msgSpan) msgSpan.textContent = msg;
        toast.classList.add("show");
        clearTimeout(toast._timer);
        toast._timer = setTimeout(() => toast.classList.remove("show"), 2200);
    }

    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).catch(err => console.warn("Clipboard copy failed:", err));
    }

    // --- TOGGLE INSPECTOR CONTROLLER ---
    function toggleInspector(forcedState) {
        isActive = typeof forcedState === 'boolean' ? forcedState : !isActive;

        if (isActive) {
            initInspector();
            document.addEventListener("mousemove", handleMouseMove, true);
            document.addEventListener("click", handleClick, true);
            document.addEventListener("keydown", handleKeyDown, true);
        } else {
            document.removeEventListener("mousemove", handleMouseMove, true);
            document.removeEventListener("click", handleClick, true);
            document.removeEventListener("keydown", handleKeyDown, true);
            if (overlayRoot) {
                const host = document.getElementById("live-inspector-host");
                if (host) host.remove();
                overlayRoot = null;
            }
            currentElement = null;
            isLocked = false;
            activeTab = 'inspector';
            activePseudo = 'normal';
        }

        chrome.runtime.sendMessage({ action: "inspector_status", isActive }).catch(() => { });
        return { isActive };
    }

    // --- BACKGROUND MESSAGE LISTENER ---
    chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
        if (msg.action === "toggle_inspector") {
            const res = toggleInspector();
            sendResponse(res);
        }
        return true;
    });
})();