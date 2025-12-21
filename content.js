// --- STATE MANAGEMENT ---
let isActive = false;
let overlayRoot = null;
let currentElement = null;
let isPinned = false;
let activeTab = 'inspector'; // 'inspector', 'structure', 'classes'

// --- INITIALIZATION ---
function initInspector() {
    if (overlayRoot) return;

    const host = document.createElement("div");
    host.id = "live-inspector-host";
    host.style.cssText = "position: fixed; top: 0; left: 0; width: 0; height: 0; z-index: 2147483647;";

    overlayRoot = host.attachShadow({ mode: "open" });

    const style = document.createElement("style");
    style.textContent = `
        * { box-sizing: border-box; }
        
        /* --- THEME VARIABLES --- */
        :host {
            --bg-color: rgba(255, 255, 255, 0.96);
            --backdrop-filter: blur(12px);
            --text-main: #1f2937;
            --text-secondary: #6b7280;
            --text-accent: #2563eb;
            --border-color: #e5e7eb;
            --divider-color: #f3f4f6;
            --font-stack: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            
            /* Box Model Colors */
            --color-margin: #f9cc9d;
            --color-border: #fce7b2;
            --color-padding: #c3e6cb;
            --color-content: #b4dbf6;
            
            --color-margin-text: #c05621;
            --color-border-text: #b7791f;
            --color-padding-text: #2f855a;
            --color-content-text: #2b6cb0;
        }

        /* --- BOX MODEL OVERLAYS --- */
        .box-overlay {
            position: fixed;
            pointer-events: none;
            z-index: 9997;
            display: none;
        }
        
        .margin-overlay { background: rgba(246, 178, 107, 0.3); border: 1px dashed rgba(246, 178, 107, 0.8); }
        .border-overlay { background: rgba(255, 229, 153, 0.3); border: 1px solid rgba(255, 229, 153, 0.8); }
        .padding-overlay { background: rgba(147, 196, 125, 0.3); border: 1px solid rgba(147, 196, 125, 0.8); }
        .content-overlay { background: rgba(111, 168, 220, 0.3); border: 1px solid rgba(111, 168, 220, 0.8); }

        /* --- INFO CARD CONTAINER --- */
        .info-card {
            position: fixed;
            background: var(--bg-color);
            backdrop-filter: var(--backdrop-filter);
            border: 1px solid rgba(0,0,0,0.08);
            color: var(--text-main);
            padding: 0;
            border-radius: 12px;
            font-family: var(--font-stack);
            font-size: 13px;
            box-shadow: 
                0 4px 6px -1px rgba(0, 0, 0, 0.1), 
                0 2px 4px -1px rgba(0, 0, 0, 0.06),
                0 10px 15px -3px rgba(0, 0, 0, 0.1);
            pointer-events: none;
            z-index: 10000;
            width: 360px;
            max-height: 80vh;
            display: none;
            overflow-y: auto;
            overflow-x: hidden;
            transition: opacity 0.1s ease;
        }
        
        /* Custom Scrollbar */
        .info-card::-webkit-scrollbar { width: 6px; }
        .info-card::-webkit-scrollbar-track { background: transparent; }
        .info-card::-webkit-scrollbar-thumb { background-color: #cbd5e0; border-radius: 10px; }

        /* --- HEADER --- */
        .card-header {
            padding: 12px 16px;
            background: rgba(249, 250, 251, 0.8);
            border-bottom: 1px solid var(--border-color);
            position: sticky;
            top: 0;
            z-index: 10;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
        }

        .header-info { flex: 1; padding-right: 10px; max-width: 340px; }
        
        .tag-header {
            color: #111827;
            font-weight: 700;
            font-size: 15px;
            font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
            margin-bottom: 4px;
            word-break: break-all;
        }
        
        .tag-name { color: #db2777; } /* Pinkish for tag */
        .tag-id { color: #2563eb; } /* Blue for ID */
        .tag-class { color: #d97706; } /* Orange for class */

        .element-path {
            color: var(--text-secondary);
            font-size: 11px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            opacity: 0.8;
        }

        /* --- PIN BUTTON --- */
        .pin-button {
            background: white;
            border: 1px solid #d1d5db;
            color: var(--text-secondary);
            width: 24px;
            height: 24px;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            pointer-events: auto;
            transition: all 0.2s;
            font-size: 12px;
            flex-shrink: 0;
        }
        .pin-button:hover { background: #f3f4f6; color: #111; border-color: #9ca3af; }
        .pin-button.pinned {
            background: var(--text-accent);
            color: white;
            border-color: var(--text-accent);
            box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
        }

        /* --- SECTIONS --- */
        .section {
            padding: 12px 16px;
            border-bottom: 1px solid var(--divider-color);
        }
        .section:last-child { border-bottom: none; }

        .section-title {
            color: #9ca3af;
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            margin-bottom: 10px;
            letter-spacing: 0.8px;
            display: flex;
            align-items: center;
            gap: 6px;
        }
        
        /* --- PROPERTY GRIDS --- */
        .prop-grid {
            display: grid;
            grid-template-columns: 85px 1fr;
            gap: 6px 10px;
            font-size: 12px;
            align-items: baseline;
        }
        
        .prop-name { 
            color: var(--text-secondary); 
            text-align: right; 
            font-weight: 500;
        }
        .prop-value { 
            color: #111827; 
            font-family: 'Menlo', monospace; 
            word-break: break-all;
        }

        /* --- QUICK STATS (Dimensions / Display) --- */
        .quick-stats {
            display: flex;
            gap: 8px;
            margin-bottom: 0;
            flex-wrap: wrap;
        }
        
        .stat-pill {
            background: #f3f4f6;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 11px;
            color: #374151;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 6px;
            border: 1px solid #e5e7eb;
        }
        .stat-pill strong { color: #111; }

        /* --- BOX MODEL VISUALIZER --- */
        .box-model-container {
            font-family: 'Menlo', monospace;
            font-size: 10px;
        }
        .box-row {
            display: grid;
            grid-template-columns: 60px 1fr 1fr 1fr 1fr;
            gap: 4px;
            align-items: center;
            margin-bottom: 6px;
        }
        .box-row:last-child { margin-bottom: 0; }
        
        .box-type-label {
            font-weight: 600;
            text-transform: uppercase;
            font-size: 11px;
            text-align: right;
            padding-right: 4px;
        }
        
        .box-val {
            text-align: center;
            padding: 3px 0;
            border-radius: 3px;
            font-weight: 600;
        }
        
        /* Color Coding for Box Model Text */
        .t-margin { color: var(--color-margin-text); background: rgba(246, 178, 107, 0.15); border: 1px solid rgba(246, 178, 107, 0.3); }
        .t-border { color: var(--color-border-text); background: rgba(255, 229, 153, 0.15); border: 1px solid rgba(255, 229, 153, 0.3); }
        .t-padding { color: var(--color-padding-text); background: rgba(147, 196, 125, 0.15); border: 1px solid rgba(147, 196, 125, 0.3); }
        .t-content { color: var(--color-content-text); background: rgba(111, 168, 220, 0.15); border: 1px solid rgba(111, 168, 220, 0.3); }

        /* --- COLOR PREVIEW --- */
        .color-preview {
            display: inline-block;
            width: 12px; 
            height: 12px;
            border: 1px solid rgba(0,0,0,0.1);
            border-radius: 50%;
            margin-right: 6px;
            vertical-align: text-bottom;
            position: relative;
            background-image: linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%);
            background-size: 6px 6px;
            background-position: 0 0, 0 3px, 3px -3px, -3px 0px;
        }
        .color-dot {
            position: absolute;
            inset: 0;
            border-radius: 50%;
        }

        /* --- TOAST --- */
        .toast {
            position: fixed;
            bottom: 30px;
            left: 50%;
            transform: translate(-50%, 10px);
            background: #1f2937;
            color: white;
            padding: 10px 20px;
            border-radius: 30px;
            font-size: 13px;
            font-weight: 500;
            opacity: 0;
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            z-index: 10001;
            pointer-events: none;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .toast.show { opacity: 1; transform: translate(-50%, 0); }

        /* --- FOOTER HINTS --- */
        .shortcut-hint {
            display: flex;
            justify-content: space-between;
            font-size: 10px;
            color: #9ca3af;
            background: #f9fafb;
            padding: 8px 16px;
            border-top: 1px solid var(--border-color);
        }
        .key {
            background: white;
            border: 1px solid #d1d5db;
            padding: 1px 5px;
            border-radius: 3px;
            font-weight: 600;
            color: #4b5563;
            font-family: inherit;
        }
        
        .attr-list {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }
        .attr-item {
            font-family: 'Menlo', monospace;
            font-size: 11px;
            color: #4b5563;
        }
        .attr-name { color: #059669; }
        .attr-val { color: #d97706; }

        /* --- TAB NAVIGATION --- */
        .tab-nav {
            display: flex;
            background: #f9fafb;
            border-bottom: 1px solid var(--border-color);
            padding: 0 8px;
        }
        
        .tab-btn {
            background: none;
            border: none;
            padding: 10px 14px;
            font-size: 12px;
            font-weight: 600;
            color: var(--text-secondary);
            cursor: pointer;
            pointer-events: auto;
            position: relative;
            transition: all 0.2s;
            font-family: var(--font-stack);
        }
        
        .tab-btn:hover {
            color: var(--text-main);
            background: rgba(0,0,0,0.03);
        }
        
        .tab-btn.active {
            color: var(--text-accent);
        }
        
        .tab-btn.active::after {
            content: '';
            position: absolute;
            bottom: -1px;
            left: 8px;
            right: 8px;
            height: 2px;
            background: var(--text-accent);
            border-radius: 2px 2px 0 0;
        }
        
        .tab-content {
            display: none;
        }
        
        .tab-content.active {
            display: block;
        }
        
        /* --- STRUCTURE TREE --- */
        .structure-container {
            padding: 12px 8px;
            font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
            font-size: 11px;
            line-height: 1.6;
            max-height: 60vh;
            overflow-y: auto;
        }
        
        .structure-container::-webkit-scrollbar { width: 6px; }
        .structure-container::-webkit-scrollbar-track { background: transparent; }
        .structure-container::-webkit-scrollbar-thumb { background-color: #cbd5e0; border-radius: 10px; }
        
        .tree-node {
            margin-left: 16px;
            position: relative;
        }
        
        .tree-node::before {
            content: '';
            position: absolute;
            left: -10px;
            top: 0;
            bottom: 0;
            width: 1px;
            background: #e5e7eb;
        }
        
        .tree-node:last-child::before {
            height: 10px;
        }
        
        .tree-line {
            display: flex;
            align-items: center;
            padding: 2px 4px;
            margin: 1px 0;
            border-radius: 4px;
            cursor: default;
            position: relative;
        }
        
        .tree-line:hover {
            background: rgba(37, 99, 235, 0.08);
        }
        
        .tree-line::before {
            content: '';
            position: absolute;
            left: -10px;
            top: 50%;
            width: 8px;
            height: 1px;
            background: #e5e7eb;
        }
        
        .tree-tag { color: #db2777; font-weight: 600; }
        .tree-class { color: #d97706; }
        .tree-id { color: #2563eb; }
        
        .tree-root {
            margin-left: 0;
        }
        
        .tree-root::before {
            display: none;
        }
        
        .tree-root > .tree-line::before {
            display: none;
        }
        
        /* --- CSS CLASSES LIST --- */
        .classes-container {
            padding: 12px 16px;
            max-height: 60vh;
            overflow-y: auto;
        }
        
        .classes-container::-webkit-scrollbar { width: 6px; }
        .classes-container::-webkit-scrollbar-track { background: transparent; }
        .classes-container::-webkit-scrollbar-thumb { background-color: #cbd5e0; border-radius: 10px; }
        
        .classes-search {
            width: 100%;
            padding: 8px 12px;
            border: 1px solid var(--border-color);
            border-radius: 6px;
            font-size: 12px;
            font-family: var(--font-stack);
            margin-bottom: 12px;
            outline: none;
            transition: border-color 0.2s;
            pointer-events: auto;
        }
        
        .classes-search:focus {
            border-color: var(--text-accent);
            box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }
        
        .classes-stats {
            display: flex;
            gap: 12px;
            margin-bottom: 12px;
            font-size: 11px;
            color: var(--text-secondary);
        }
        
        .classes-stats span {
            background: #f3f4f6;
            padding: 4px 8px;
            border-radius: 4px;
        }
        
        .classes-list {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
        }
        
        .class-tag {
            background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
            border: 1px solid #bae6fd;
            padding: 4px 10px;
            border-radius: 4px;
            font-size: 11px;
            font-family: 'Menlo', monospace;
            color: #0369a1;
            cursor: pointer;
            pointer-events: auto;
            transition: all 0.15s;
        }
        
        .class-tag:hover {
            background: linear-gradient(135deg, #e0f2fe, #bae6fd);
            border-color: #7dd3fc;
            transform: translateY(-1px);
        }
        
        .class-tag .count {
            background: rgba(3, 105, 161, 0.15);
            color: #0c4a6e;
            padding: 1px 5px;
            border-radius: 3px;
            margin-left: 6px;
            font-size: 10px;
            font-weight: 600;
        }
        
        .no-classes {
            color: var(--text-secondary);
            font-size: 12px;
            text-align: center;
            padding: 20px;
        }
    `;

    const html = `
        <!-- Overlays -->
        <div class="box-overlay margin-overlay" id="margin-box"></div>
        <div class="box-overlay border-overlay" id="border-box"></div>
        <div class="box-overlay padding-overlay" id="padding-box"></div>
        <div class="box-overlay content-overlay" id="content-box"></div>

        <!-- Toast -->
        <div class="toast" id="toast">CSS Copied!</div>
        
        <!-- Info Card -->
        <div class="info-card" id="info-card">
            <!-- Tab Navigation -->
            <div class="tab-nav">
                <button class="tab-btn active" data-tab="inspector">Inspector</button>
                <button class="tab-btn" data-tab="structure">Structure</button>
                <button class="tab-btn" data-tab="classes">CSS Classes</button>
            </div>
            
            <!-- Inspector Tab (Default) -->
            <div class="tab-content active" id="tab-inspector">
                <div class="card-header">
                    <div class="header-info">
                        <div class="tag-header" id="tag-header"></div>
                        <div class="element-path" id="element-path"></div>
                    </div>
                    <div class="pin-button" id="pin-button" title="Pin Inspector (Alt+Click)">📌</div>
                </div>
                <div class="card-body" id="card-body"></div>
            </div>
            
            <!-- Structure Tab -->
            <div class="tab-content" id="tab-structure">
                <div class="structure-container" id="structure-tree"></div>
            </div>
            
            <!-- CSS Classes Tab -->
            <div class="tab-content" id="tab-classes">
                <div class="classes-container" id="classes-container">
                    <input type="text" class="classes-search" id="classes-search" placeholder="Search classes...">
                    <div class="classes-stats" id="classes-stats"></div>
                    <div class="classes-list" id="classes-list"></div>
                </div>
            </div>
        </div>
    `;

    overlayRoot.appendChild(style);
    overlayRoot.innerHTML += html;
    document.body.appendChild(host);

    const pinButton = overlayRoot.getElementById("pin-button");
    pinButton.addEventListener("click", togglePin);

    // Tab click handlers
    const tabButtons = overlayRoot.querySelectorAll(".tab-btn");
    tabButtons.forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            switchTab(btn.dataset.tab);
        });
    });

    // Classes search handler
    const searchInput = overlayRoot.getElementById("classes-search");
    searchInput.addEventListener("input", (e) => {
        filterClasses(e.target.value);
    });
}

// --- TAB SWITCHING ---
function switchTab(tabName) {
    if (!overlayRoot) return;
    activeTab = tabName;

    // Update tab buttons
    const tabButtons = overlayRoot.querySelectorAll(".tab-btn");
    tabButtons.forEach(btn => {
        btn.classList.toggle("active", btn.dataset.tab === tabName);
    });

    // Update tab content
    const tabContents = overlayRoot.querySelectorAll(".tab-content");
    tabContents.forEach(content => {
        content.classList.toggle("active", content.id === `tab-${tabName}`);
    });

    // Auto-pin when switching away from inspector to allow interaction
    if (tabName !== 'inspector' && !isPinned) {
        togglePin();
    }

    // Generate content for the active tab
    if (tabName === 'structure') {
        generateStructureTree();
    } else if (tabName === 'classes') {
        generateCSSClassesList();
    }
}

// --- STRUCTURE TREE GENERATION ---
function generateStructureTree() {
    if (!overlayRoot) return;

    const container = overlayRoot.getElementById("structure-tree");
    if (!container) return;

    // Generate tree starting from body
    const tree = buildTreeHTML(document.body, 0, true);
    container.innerHTML = tree;
}

function buildTreeHTML(element, depth = 0, isRoot = false) {
    // Skip script, style, noscript, and our inspector elements
    const skipTags = ['SCRIPT', 'STYLE', 'NOSCRIPT', 'LINK', 'META'];
    if (skipTags.includes(element.tagName) || element.id === 'live-inspector-host') {
        return '';
    }

    const tagName = element.tagName.toLowerCase();
    const classes = element.className && typeof element.className === 'string'
        ? element.className.trim().split(/\s+/).filter(c => c).map(c => `.${c}`).join('')
        : '';
    const id = element.id ? `#${element.id}` : '';

    // Build the line content
    let lineContent = `<span class="tree-tag">${tagName}</span>`;
    if (id) lineContent += `<span class="tree-id">${id}</span>`;
    if (classes) lineContent += `<span class="tree-class">${classes}</span>`;

    let html = `<div class="tree-node${isRoot ? ' tree-root' : ''}">`;
    html += `<div class="tree-line">${lineContent}</div>`;

    // Get child elements (not text nodes)
    const children = Array.from(element.children);

    // Limit depth and children for performance
    if (depth < 15 && children.length > 0) {
        const visibleChildren = children.slice(0, 50); // Limit children shown
        visibleChildren.forEach(child => {
            html += buildTreeHTML(child, depth + 1, false);
        });

        if (children.length > 50) {
            html += `<div class="tree-node"><div class="tree-line" style="color: #9ca3af; font-style: italic;">... and ${children.length - 50} more elements</div></div>`;
        }
    }

    html += '</div>';
    return html;
}

// --- CSS CLASSES LIST GENERATION ---
let allClassesData = []; // Store for filtering

function generateCSSClassesList() {
    if (!overlayRoot) return;

    const statsContainer = overlayRoot.getElementById("classes-stats");
    const listContainer = overlayRoot.getElementById("classes-list");
    const searchInput = overlayRoot.getElementById("classes-search");

    if (!listContainer) return;

    // Collect all classes from the page
    const classMap = new Map();
    const allElements = document.querySelectorAll('*');

    allElements.forEach(el => {
        if (el.id === 'live-inspector-host') return;
        if (el.className && typeof el.className === 'string') {
            const classes = el.className.trim().split(/\s+/).filter(c => c);
            classes.forEach(cls => {
                classMap.set(cls, (classMap.get(cls) || 0) + 1);
            });
        }
    });

    // Convert to array and sort by count (descending)
    allClassesData = Array.from(classMap.entries())
        .sort((a, b) => b[1] - a[1]);

    // Update stats
    statsContainer.innerHTML = `
        <span>📦 ${allClassesData.length} unique classes</span>
        <span>🏷️ ${Array.from(classMap.values()).reduce((a, b) => a + b, 0)} total usages</span>
    `;

    // Clear search
    if (searchInput) searchInput.value = '';

    // Render the list
    renderClassesList(allClassesData);
}

function renderClassesList(classesArray) {
    if (!overlayRoot) return;
    const listContainer = overlayRoot.getElementById("classes-list");
    if (!listContainer) return;

    if (classesArray.length === 0) {
        listContainer.innerHTML = '<div class="no-classes">No classes found</div>';
        return;
    }

    let html = '';
    classesArray.forEach(([className, count]) => {
        html += `<div class="class-tag" data-class="${className}">${className}<span class="count">×${count}</span></div>`;
    });

    listContainer.innerHTML = html;

    // Add click-to-copy functionality
    const classTags = listContainer.querySelectorAll('.class-tag');
    classTags.forEach(tag => {
        tag.addEventListener('click', () => {
            copyToClipboard(`.${tag.dataset.class}`);
            showToast(`Copied: .${tag.dataset.class}`);
        });
    });
}

function filterClasses(query) {
    if (!allClassesData.length) return;

    const filtered = query.trim()
        ? allClassesData.filter(([className]) =>
            className.toLowerCase().includes(query.toLowerCase()))
        : allClassesData;

    renderClassesList(filtered);
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
        height: rect.height
    };
    const paddingBox = {
        top: borderBox.top + border.top,
        left: borderBox.left + border.left,
        width: borderBox.width - border.left - border.right,
        height: borderBox.height - border.top - border.bottom
    };
    const contentBox = {
        top: paddingBox.top + padding.top,
        left: paddingBox.left + padding.left,
        width: paddingBox.width - padding.left - padding.right,
        height: paddingBox.height - padding.top - padding.bottom
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
        values: { margin, border, padding }
    };
}

// --- UPDATE OVERLAYS ---
function updateBoxModelOverlays(boxModel) {
    const setStyle = (id, box) => {
        const el = overlayRoot.getElementById(id);
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

// --- GENERATE CONTENT ---
function generateCardContent(element) {
    const computed = window.getComputedStyle(element);
    const boxModel = getBoxModel(element);
    let html = "";

    // 1. QUICK STATS ROW (Layout & Dimensions)
    html += `
        <div class="section">
            <div class="quick-stats">
                <div class="stat-pill" title="Dimensions (W x H)">
                    <span style="color:#2563eb">⬚</span>
                    ${Math.round(boxModel.content.width)} × ${Math.round(boxModel.content.height)}
                </div>
                <div class="stat-pill" title="Display">
                    <span style="color:#9333ea">display:</span> ${computed.display}
                </div>
                <div class="stat-pill" title="Position">
                    <span style="color:#ea580c">pos:</span> ${computed.position}
                </div>
                <div class="stat-pill" title="Z-Index">
                    z: ${computed.zIndex === 'auto' ? 'auto' : computed.zIndex}
                </div>
            </div>
        </div>
    `;

    // 2. BOX MODEL (Custom Grid Visualization)
    const renderRow = (label, vals, type) => `
        <div class="box-row">
            <div class="box-type-label" style="color: var(--color-${type}-text)">${label}</div>
            <div class="box-val t-${type}">${vals.top}</div>
            <div class="box-val t-${type}">${vals.right}</div>
            <div class="box-val t-${type}">${vals.bottom}</div>
            <div class="box-val t-${type}">${vals.left}</div>
        </div>
    `;

    html += `
        <div class="section">
            <div class="section-title">Box Model</div>
            <div class="box-model-container">
                <div class="box-row" style="margin-bottom:4px; font-size:9px; color:#9ca3af;">
                    <div></div>
                    <div style="text-align:center">TOP</div>
                    <div style="text-align:center">RIGHT</div>
                    <div style="text-align:center">BTM</div>
                    <div style="text-align:center">LEFT</div>
                </div>
                ${renderRow('Margin', boxModel.values.margin, 'margin')}
                ${renderRow('Border', boxModel.values.border, 'border')}
                ${renderRow('Padding', boxModel.values.padding, 'padding')}
            </div>
        </div>
    `;

    // 3. TYPOGRAPHY
    const fontProps = [
        ['Font', computed.fontFamily.split(',')[0].replace(/['"]/g, '')],
        ['Size', `${computed.fontSize} / ${computed.lineHeight}`], // Grouped size/height
        ['Weight', computed.fontWeight],
        ['Color', computed.color, true],
        ['Align', computed.textAlign]
    ];

    let typoHtml = "";
    fontProps.forEach(([name, val, isColor]) => {
        if (!val || val === 'normal' || val === 'start' || val.includes('rgba(0, 0, 0, 0)')) return;
        let displayVal = val;
        if (isColor) {
            displayVal = `<span class="color-preview"><span class="color-dot" style="background:${val}"></span></span>${val}`;
        }
        typoHtml += `<div class="prop-name">${name}</div><div class="prop-value">${displayVal}</div>`;
    });

    if (typoHtml) {
        html += `<div class="section"><div class="section-title">Typography</div><div class="prop-grid">${typoHtml}</div></div>`;
    }

    // 4. DECORATIONS (Decorations + Geometry)
    // Moved Border Radius here as requested
    const decorProps = {
        'Background': computed.backgroundColor !== 'rgba(0, 0, 0, 0)' ? computed.backgroundColor : null,
        'Radius': computed.borderRadius !== '0px' ? computed.borderRadius : null,
        'Shadow': computed.boxShadow !== 'none' ? computed.boxShadow : null,
        'Opacity': computed.opacity !== '1' ? computed.opacity : null,
        'Cursor': computed.cursor !== 'auto' ? computed.cursor : null,
    };

    // Explicit Border Check
    let borderVal = computed.border;
    if ((!borderVal || borderVal === '0px none rgb(0, 0, 0)') && computed.borderTopWidth !== '0px') {
        borderVal = `${computed.borderTopWidth} ${computed.borderTopStyle} ${computed.borderTopColor}`;
    }
    if (borderVal && borderVal !== '0px none rgb(0, 0, 0)' && !borderVal.startsWith('0px none')) {
        decorProps['Border'] = borderVal;
    }

    let decorHtml = "";
    Object.entries(decorProps).forEach(([key, val]) => {
        if (!val) return;
        let displayVal = val;
        // Truncate long shadows or gradients
        if (displayVal.length > 35) displayVal = displayVal.substring(0, 32) + '...';

        if (key === 'Background' || key.includes('Color')) {
            displayVal = `<span class="color-preview"><span class="color-dot" style="background:${val}"></span></span>${displayVal}`;
        }
        decorHtml += `<div class="prop-name">${key}</div><div class="prop-value">${displayVal}</div>`;
    });

    if (decorHtml) {
        html += `<div class="section"><div class="section-title">Decorations</div><div class="prop-grid">${decorHtml}</div></div>`;
    }

    // 5. FLEX / GRID (Conditional)
    if (computed.display.includes('flex') || computed.display.includes('grid')) {
        let layoutHtml = "";
        const layoutProps = {
            'Direction': computed.flexDirection,
            'Justify': computed.justifyContent,
            'Align': computed.alignItems,
            'Gap': computed.gap,
            'Template': computed.gridTemplateColumns // specific to grid
        };

        Object.entries(layoutProps).forEach(([key, val]) => {
            if (val && val !== 'normal' && val !== 'none') {
                layoutHtml += `<div class="prop-name">${key}</div><div class="prop-value">${val}</div>`;
            }
        });

        if (layoutHtml) {
            html += `<div class="section"><div class="section-title">Flex / Grid Layout</div><div class="prop-grid">${layoutHtml}</div></div>`;
        }
    }

    // 6. ATTRIBUTES (Clean List)
    if (element.attributes.length > 0) {
        let attrsHtml = "";
        const ignore = ['style', 'class', 'id'];
        Array.from(element.attributes).forEach(attr => {
            if (!ignore.includes(attr.name)) {
                const val = attr.value.length > 30 ? attr.value.substring(0, 30) + '...' : attr.value;
                attrsHtml += `<div class="attr-item"><span class="attr-name">${attr.name}</span>=<span class="attr-val">"${val}"</span></div>`;
            }
        });
        if (attrsHtml) {
            html += `<div class="section"><div class="section-title">Attributes</div><div class="attr-list">${attrsHtml}</div></div>`;
        }
    }

    // 7. FOOTER HINTS
    html += `
        <div class="shortcut-hint">
            <span><span class="key">Alt</span> + Click to Pin</span>
            <span><span class="key">Ctrl</span>+<span class="key">Shift</span> Copy CSS</span>
        </div>
    `;

    return html;
}

// --- UTILS ---
function getElementPath(element) {
    const path = [];
    let current = element;
    while (current && current !== document.body) {
        let selector = current.tagName.toLowerCase();
        if (current.id) {
            // Stop at ID if possible for shorter paths
            path.unshift(`${selector}#${current.id}`);
            break;
        } else if (current.className && typeof current.className === 'string') {
            const classes = Array.from(current.classList).slice(0, 1).join('.');
            if (classes) selector += `.${classes}`;
        }
        path.unshift(selector);
        current = current.parentElement;
    }
    return path.join(' > ');
}

// --- EVENT HANDLERS ---
function handleMouseMove(e) {
    if (!isActive || !overlayRoot || isPinned) return;

    // If not in inspector tab, don't follow mouse or update element
    if (activeTab !== 'inspector') return;

    // Hide host briefly to check element below
    const host = document.getElementById("live-inspector-host");
    if (host) host.style.display = 'none';
    const target = document.elementFromPoint(e.clientX, e.clientY);
    if (host) host.style.display = 'block';

    if (!target || target === currentElement) return;
    currentElement = target;

    updateInspectorUI(target, e);
}

function updateInspectorUI(target, e) {
    const boxModel = getBoxModel(target);
    updateBoxModelOverlays(boxModel);

    const infoCard = overlayRoot.getElementById("info-card");
    const tagHeader = overlayRoot.getElementById("tag-header");
    const elementPath = overlayRoot.getElementById("element-path");
    const cardBody = overlayRoot.getElementById("card-body");

    // Format Header Tag
    const tagName = `<span class="tag-name">${target.tagName.toLowerCase()}</span>`;
    const id = target.id ? `<span class="tag-id">#${target.id}</span>` : "";
    let classes = "";
    if (target.classList.length > 0) {
        classes = `<span class="tag-class">.${Array.from(target.classList).slice(0, 2).join(".")}</span>`;
    }

    tagHeader.innerHTML = `&lt;${tagName}${id}${classes}&gt;`;
    elementPath.textContent = getElementPath(target);
    cardBody.innerHTML = generateCardContent(target);

    // Positioning
    infoCard.style.display = "block";
    if (!isPinned && e) {
        const cardW = 340;
        const cardH = Math.min(600, window.innerHeight * 0.8);
        let x = e.clientX + 20;
        let y = e.clientY + 20;

        // Viewport collision detection
        if (x + cardW > window.innerWidth) x = e.clientX - cardW - 20;
        if (y + cardH > window.innerHeight) y = window.innerHeight - cardH - 20;
        if (y < 20) y = 20;

        infoCard.style.top = `${y}px`;
        infoCard.style.left = `${x}px`;
    }
}

function togglePin(e) {
    if (e) e.stopPropagation();
    isPinned = !isPinned;
    const pinButton = overlayRoot.getElementById("pin-button");
    const infoCard = overlayRoot.getElementById("info-card");

    if (isPinned) {
        pinButton.classList.add("pinned");
        pinButton.textContent = "📍"; // Unpin icon
        infoCard.style.pointerEvents = "auto";
        infoCard.style.opacity = "1";
    } else {
        pinButton.classList.remove("pinned");
        pinButton.textContent = "📌";
        infoCard.style.pointerEvents = "none";
    }
}

function toggleInspector() {
    isActive = !isActive;
    if (isActive) {
        initInspector();
        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("click", handleGlobalClick, true);
        document.addEventListener("keydown", handleKeyDown);
        console.log("🔍 Inspector Active");
    } else {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("click", handleGlobalClick, true);
        document.removeEventListener("keydown", handleKeyDown);
        if (overlayRoot) {
            document.getElementById("live-inspector-host").remove();
            overlayRoot = null;
        }
        currentElement = null;
        isPinned = false;
        activeTab = 'inspector';
        allClassesData = [];
        console.log("🔍 Inspector Inactive");
    }
}

function handleKeyDown(e) {
    if (e.key === "Escape") toggleInspector();
}

function handleGlobalClick(e) {
    if (!isActive) return;

    if (e.altKey && !e.ctrlKey && !e.shiftKey) {
        e.preventDefault();
        e.stopPropagation();
        togglePin(e);
        return;
    }

    if (e.ctrlKey && e.shiftKey) {
        e.preventDefault();
        e.stopPropagation();
        if (e.target) {
            copyToClipboard(generateCSS(e.target));
            showToast("CSS Copied to Clipboard!");
        }
        return;
    }
}

function showToast(message) {
    if (!overlayRoot) return;
    const toast = overlayRoot.getElementById("toast");
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2000);
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).catch(err => console.error(err));
}

function generateCSS(element) {
    const computed = window.getComputedStyle(element);
    let selector = element.tagName.toLowerCase();
    if (element.id) selector += `#${element.id}`;
    if (element.className && typeof element.className === 'string') {
        selector += `.${element.className.split(' ').join('.')}`;
    }

    let css = `${selector} {\n`;
    const props = [
        "display", "position", "top", "left", "right", "bottom", "z-index",
        "width", "height", "margin", "padding", "border", "border-radius",
        "background", "color", "font-family", "font-size", "font-weight",
        "line-height", "text-align", "flex-direction", "justify-content",
        "align-items", "gap", "box-shadow", "opacity", "cursor"
    ];

    props.forEach(p => {
        const val = computed.getPropertyValue(p);
        if (val && val !== "none" && val !== "auto" && val !== "normal" && val !== "0px" && !val.includes("rgba(0, 0, 0, 0)")) {
            css += `  ${p}: ${val};\n`;
        }
    });
    css += "}";
    return css;
}

// Background Listener
chrome.runtime.onMessage.addListener((msg) => {
    if (msg.action === "toggle_inspector") toggleInspector();
});