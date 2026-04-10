/* * Lens Inspector
 * Custom Implementation by [Your Name/Handle]
 * A focused, lightweight DOM and Style explorer.
 */

(function() {
    // 1. Core Setup & Collision Prevention
    const LENS_ID = 'lens-inspector-panel';
    const HIGHLIGHT_CLASS = 'lens-target-active';
    const sidebarWidth = '380px';

    if (document.getElementById(LENS_ID)) {
        document.getElementById(LENS_ID).remove();
        document.body.style.marginRight = '0';
        cleanupHighlighter();
        return;
    }

    // -- Create Component: The Sidebar Panel --
    const panel = document.createElement('div');
    panel.id = LENS_ID;
    Object.assign(panel.style, {
        position: 'fixed', top: '0', right: '0', width: sidebarWidth, height: '100%',
        backgroundColor: '#f6f8fa', color: '#24292f', zIndex: '2147483647',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        display: 'flex', flexDirection: 'column', borderLeft: '1px solid #d0d7de',
        boxShadow: '-4px 0 12px rgba(0,0,0,0.08)', overflow: 'hidden',
        transition: 'transform 0.25s ease-out'
    });

    // Pushing the website content smoothly
    document.body.style.transition = 'margin-right 0.25s ease-out';
    document.body.style.marginRight = sidebarWidth;

    // -- Create Component: Header and Tabs --
    const header = document.createElement('div');
    header.style.cssText = `
        display: flex; background: #fff; border-bottom: 1px solid #d0d7de; 
        font-size: 13px; font-weight: 500; user-select: none;
    `;

    const createTab = (id, text, active = false) => `
        <div id="${id}" style="padding: 14px 18px; cursor: pointer; color: ${active ? '#0969da' : '#57606a'}; 
        border-bottom: 2px solid ${active ? '#0969da' : 'transparent'};">
            ${text}
        </div>`;

    header.innerHTML = `
        <div style="flex: 1; display: flex;">
            ${createTab('lens-tab-el', 'DOM Tree', true)}
            ${createTab('lens-tab-pk', 'Picker')}
        </div>
        <div id="lens-close" style="padding: 14px; color: #57606a; cursor: pointer; font-weight: bold; font-size: 16px;">
            ✕
        </div>
    `;
    panel.appendChild(header);

    // -- Create Component: Content Area (Recursive Tree) --
    const content = document.createElement('div');
    Object.assign(content.style, { flex: '1', overflowY: 'auto', padding: '16px', fontSize: '13px', lineBreak: 'anywhere' });
    panel.appendChild(content);

    // -- Create Component: Persistent Footer (Style Editor) --
    const footer = document.createElement('div');
    Object.assign(footer.style, {
        height: '220px', background: '#fff', borderTop: '1px solid #d0d7de', display: 'flex', flexDirection: 'column'
    });
    footer.innerHTML = `
        <div id="lens-tag-label" style="font-size: 11px; font-weight: 600; padding: 8px 16px; background: #f6f8fa; color: #57606a; border-bottom: 1px solid #d0d7de; text-transform: uppercase; letter-spacing: 0.5px;">
            Selector: &nbsp; <span style="font-weight: 400; color:#cf222e;">[None Selected]</span>
        </div>
        <textarea id="lens-css-editor" spellcheck="false" placeholder="/* Inline styles will appear here. Edit and press Enter. */" style="flex: 1; background: transparent; color: #1f2328; border: none; padding: 12px; resize: none; outline: none; font-family: ui-monospace, SFMono-Regular, SF Mono, Menlo, monospace; font-size: 12px;"></textarea>
    `;
    panel.appendChild(footer);

    document.body.appendChild(panel);

    // --- Core Logic ---
    let selectedElement = null;
    let isPicking = false;
    const cssEditor = panel.querySelector('#lens-css-editor');

    // -- Core Logic: Selecting an Element --
    function selectElement(el) {
        if (!el || el === document.documentElement || el.id === LENS_ID) return;
        selectedElement = el;

        // Apply new outline
        cleanupHighlighter();
        el.classList.add(HIGHLIGHT_CLASS);
        el.style.outline = '2px solid #0969da';
        el.style.outlineOffset = '-1px';

        // Update CSS Box
        const tagSpan = panel.querySelector('#lens-tag-label span');
        tagSpan.innerText = `<${el.tagName.toLowerCase()}>`;
        tagSpan.style.color = '#1f2328';
        tagSpan.style.fontWeight = '600';

        cssEditor.value = el.getAttribute('style') || '';
        cssEditor.oninput = () => el.setAttribute('style', cssEditor.value);
    }

    function cleanupHighlighter() {
        document.querySelectorAll(`.${HIGHLIGHT_CLASS}`).forEach(n => {
            n.style.outline = '';
            n.style.outlineOffset = '';
            n.classList.remove(HIGHLIGHT_CLASS);
        });
    }

    // -- Core Logic: Lazy Recursive DOM Tree --
    function createTreeNode(el, depth = 0) {
        if (el.id === LENS_ID) return document.createDocumentFragment();

        const container = document.createElement('div');
        container.style.marginLeft = `${depth ? 16 : 0}px`;

        const row = document.createElement('div');
        row.style.cssText = `display: flex; align-items: center; padding: 3px 0; font-family: ui-monospace, Menlo, monospace; font-size: 12.5px;`;

        // Arrow logic
        const hasChildren = el.children.length > 0;
        const arrow = document.createElement('span');
        arrow.innerText = hasChildren ? '▸' : ' ';
        arrow.style.cssText = `color: #8c959f; font-size: 11px; margin-right: 6px; width: 10px; text-align: center; cursor: pointer;`;

        // Tag Logic
        const tagSpan = document.createElement('span');
        tagSpan.innerHTML = `<span style="color:#cf222e">&lt;${el.tagName.toLowerCase()}</span><span style="color:#24292f">&gt;</span>`;
        tagSpan.style.cursor = 'pointer';

        row.appendChild(arrow);
        row.appendChild(tagSpan);
        container.appendChild(row);

        const childrenBox = document.createElement('div');
        childrenBox.style.display = 'none';
        container.appendChild(childrenBox);

        // Events: Toggling Children
        const toggleChildren = (e) => {
            e.stopPropagation();
            const isOpen = childrenBox.style.display === 'block';
            childrenBox.style.display = isOpen ? 'none' : 'block';
            arrow.innerText = isOpen ? '▸' : '▾';
            
            if (!isOpen && childrenBox.innerHTML === '') {
                Array.from(el.children).forEach(child => childrenBox.appendChild(createTreeNode(child, depth + 1)));
            }
        };

        arrow.onclick = toggleChildren;
        tagSpan.onclick = (e) => { e.stopPropagation(); selectElement(el); };

        return container;
    }

    const renderFullTree = () => {
        content.innerHTML = '';
        content.style.lineHeight = '1.4';
        content.appendChild(createTreeNode(document.documentElement));
    };

    // -- Core Logic: Tab & UI Events --
    const tabEl = panel.querySelector('#lens-tab-el');
    const tabPk = panel.querySelector('#lens-tab-pk');

    const activateTab = (activeTab, inactiveTab) => {
        activeTab.style.color = '#0969da'; activeTab.style.borderBottomColor = '#0969da';
        inactiveTab.style.color = '#57606a'; inactiveTab.style.borderBottomColor = 'transparent';
    };

    tabEl.onclick = () => {
        isPicking = false;
        activateTab(tabEl, tabPk);
        renderFullTree();
    };

    tabPk.onclick = () => {
        isPicking = true;
        activateTab(tabPk, tabEl);
        cleanupHighlighter();
        content.innerHTML = `<div style="color:#d29922; text-align:center; padding: 30px 10px; background: #fff8eb; border-radius: 6px; border: 1px solid #d2992222;">
            <div style="font-weight: 600; font-size: 15px;">Targeting System Active</div>
            <div style="font-size: 12px; color: #57606a; margin-top: 6px;">Move mouse and click an item on the page.</div>
        </div>`;
    };

    // Global Click Handler for Picker
    document.addEventListener('click', (e) => {
        if (isPicking) {
            if (e.target.id === LENS_ID || panel.contains(e.target)) return;
            e.preventDefault();
            e.stopPropagation();
            selectElement(e.target);
            content.innerHTML = `
                <div style="font-size:11px; color:#57606a; margin-bottom:8px;">Focused Element properties:</div>
                <div style="padding:10px; background:#fff; border: 1px solid #d0d7de; border-radius:4px;">
                    ${createTreeNode(e.target).outerHTML}
                </div>
                <p style="color:#0969da; margin-top:12px; font-size:11px;">Click 'DOM Tree' to view full document structure.</p>
            `;
        }
    }, true);

    panel.querySelector('#lens-close').onclick = () => {
        panel.remove();
        document.body.style.marginRight = '0';
        cleanupHighlighter();
    };

    // Initial Render
    renderFullTree();
})();
