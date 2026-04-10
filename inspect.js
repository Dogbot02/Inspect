(function() {
    // 1. Setup & Prevent Multi-loading
    if (document.getElementById('gemini-inspector')) {
        document.getElementById('gemini-inspector').remove();
        document.body.style.marginRight = '0';
        return;
    }

    const panel = document.createElement('div');
    panel.id = 'gemini-inspector';
    Object.assign(panel.style, {
        position: 'fixed', top: '0', right: '0', width: '40%', height: '100%',
        backgroundColor: '#1e1e1e', color: '#d4d4d4', zIndex: '2147483647',
        fontFamily: 'monospace', display: 'flex', flexDirection: 'column',
        borderLeft: '2px solid #444', boxShadow: '-5px 0 15px rgba(0,0,0,0.5)', overflow: 'hidden'
    });

    document.body.style.transition = 'margin-right 0.3s';
    document.body.style.marginRight = '40%';

    // 2. Tabs
    const tabs = document.createElement('div');
    tabs.innerHTML = `
        <div style="display:flex; background:#333; cursor:pointer; font-size:12px; border-bottom:1px solid #444">
            <div id="tab-el" style="padding:10px; flex:1; text-align:center; border-bottom:2px solid #007acc">Elements</div>
            <div id="tab-pick" style="padding:10px; flex:1; text-align:center;">Picker</div>
            <div id="tab-con" style="padding:10px; flex:1; text-align:center;">Console</div>
            <div id="close-insp" style="padding:10px; color:#ff5f56;">✕</div>
        </div>
    `;
    panel.appendChild(tabs);

    // 3. Elements Tree Area
    const content = document.createElement('div');
    Object.assign(content.style, { flex: '1', overflowY: 'auto', padding: '10px', fontSize: '13px' });
    panel.appendChild(content);

    // 4. Persistent Editor (Always visible at bottom)
    const bottomEditor = document.createElement('div');
    Object.assign(bottomEditor.style, {
        height: '200px', borderTop: '2px solid #444', background: '#252526', display: 'flex', flexDirection: 'column'
    });
    bottomEditor.innerHTML = `
        <div id="editor-label" style="font-size:10px; padding:5px; background:#333; color:#aaa; border-bottom:1px solid #444">STYLES (Select an element)</div>
        <textarea id="css-editor" spellcheck="false" style="flex:1; background:transparent; color:#9cdcfe; border:none; padding:10px; resize:none; outline:none; font-family:monospace;"></textarea>
    `;
    panel.appendChild(bottomEditor);
    document.body.appendChild(panel);

    // --- LOGIC ---
    let isPicking = false;

    const selectElement = (el) => {
        document.querySelectorAll('.insp-target-outline').forEach(n => n.style.outline = '');
        el.style.outline = '2px dashed #007acc';
        el.classList.add('insp-target-outline');
        
        document.getElementById('editor-label').innerText = `STYLES: <${el.tagName.toLowerCase()}>`;
        const cssArea = document.getElementById('css-editor');
        cssArea.value = el.getAttribute('style') || '';
        cssArea.oninput = () => { el.setAttribute('style', cssArea.value); };
    };

    // Recursive Tree Builder with Arrows
    const createTreeItem = (el, margin) => {
        const itemContainer = document.createElement('div');
        itemContainer.style.marginLeft = margin + 'px';

        const line = document.createElement('div');
        line.style.display = 'flex';
        line.style.alignItems = 'center';
        line.style.padding = '2px 0';

        const hasChildren = el.children.length > 0;
        const arrow = document.createElement('span');
        arrow.innerHTML = hasChildren ? '▶ ' : '&nbsp;&nbsp;';
        arrow.style.color = '#808080';
        arrow.style.cursor = 'pointer';
        arrow.style.fontSize = '10px';
        arrow.style.marginRight = '4px';

        const tag = document.createElement('span');
        tag.innerHTML = `<span style="color:#569cd6">&lt;${el.tagName.toLowerCase()}</span><span style="color:#808080">&gt;</span>`;
        tag.style.cursor = 'pointer';

        line.appendChild(arrow);
        line.appendChild(tag);
        itemContainer.appendChild(line);

        const childrenBox = document.createElement('div');
        childrenBox.style.display = 'none';
        itemContainer.appendChild(childrenBox);

        // Click Arrow to Expand
        arrow.onclick = (e) => {
            e.stopPropagation();
            if (childrenBox.style.display === 'none') {
                childrenBox.style.display = 'block';
                arrow.innerHTML = '▼ ';
                if (childrenBox.innerHTML === '') {
                    Array.from(el.children).forEach(child => {
                        childrenBox.appendChild(createTreeItem(child, 12));
                    });
                }
            } else {
                childrenBox.style.display = 'none';
                arrow.innerHTML = '▶ ';
            }
        };

        // Click Tag to Select
        tag.onclick = (e) => {
            e.stopPropagation();
            selectElement(el);
        };

        return itemContainer;
    };

    const renderElements = () => {
        content.innerHTML = '';
        content.appendChild(createTreeItem(document.documentElement, 0));
    };

    // Tab Switching
    document.getElementById('tab-el').onclick = () => {
        isPicking = false;
        renderElements();
    };

    document.getElementById('tab-pick').onclick = () => {
        isPicking = true;
        content.innerHTML = '<div style="color:yellow; text-align:center; padding:20px;">Picker Active... Click an element on the page.</div>';
    };

    // Global Click for Picker
    document.addEventListener('click', (e) => {
        if (isPicking) {
            e.preventDefault();
            e.stopPropagation();
            selectElement(e.target);
            // Render the specific HTML for what we just picked
            content.innerHTML = `<div style="color:#aaa; margin-bottom:5px;">Inspecting:</div>`;
            content.appendChild(createTreeItem(e.target, 0));
        }
    }, true);

    document.getElementById('close-insp').onclick = () => {
        panel.remove();
        document.body.style.marginRight = '0';
    };

    renderElements();
})();
