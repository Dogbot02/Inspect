(function() {
    if (document.getElementById('gemini-inspector')) {
        document.getElementById('gemini-inspector').remove();
        document.body.style.marginRight = '0';
        return;
    }

    // 1. Main Container
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

    // 2. Tabs Header
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

    // 3. Main Content Area (HTML Tree)
    const content = document.createElement('div');
    Object.assign(content.style, { flex: '1', overflowY: 'auto', padding: '10px', fontSize: '13px', lineBreak: 'anywhere' });
    panel.appendChild(content);

    // 4. Persistent Bottom Editor (Always Visible)
    const bottomEditor = document.createElement('div');
    Object.assign(bottomEditor.style, {
        height: '250px', borderTop: '2px solid #444', background: '#252526', display: 'flex', flexDirection: 'column'
    });
    bottomEditor.innerHTML = `
        <div id="editor-label" style="font-size:10px; padding:5px; background:#333; color:#aaa; border-bottom:1px solid #444">STYLES (Select an element)</div>
        <textarea id="css-editor" spellcheck="false" style="flex:1; background:transparent; color:#9cdcfe; border:none; padding:10px; resize:none; outline:none; font-family:monospace;"></textarea>
    `;
    panel.appendChild(bottomEditor);
    document.body.appendChild(panel);

    // --- LOGIC ---
    let selectedElement = null;
    let isPicking = false;

    const selectElement = (el) => {
        selectedElement = el;
        document.querySelectorAll('.insp-target').forEach(n => n.style.outline = '');
        el.style.outline = '2px dashed #007acc';
        el.classList.add('insp-target');
        
        const label = document.getElementById('editor-label');
        label.innerText = `STYLES: <${el.tagName.toLowerCase()}>`;
        
        const cssArea = document.getElementById('css-editor');
        cssArea.value = el.getAttribute('style') || '';
        cssArea.oninput = () => { el.setAttribute('style', cssArea.value); };
    };

    const createTreeItem = (el, margin) => {
        const container = document.createElement('div');
        container.style.marginLeft = margin + 'px';
        
        const line = document.createElement('div');
        line.style.cursor = 'default';
        line.style.padding = '2px 0';
        line.style.display = 'flex';
        line.style.alignItems = 'center';

        const hasChildren = el.children.length > 0;
        const arrow = document.createElement('span');
        arrow.innerHTML = hasChildren ? '▶ ' : '&nbsp;&nbsp;';
        arrow.style.color = '#808080';
        arrow.style.fontSize = '10px';
        arrow.style.cursor = 'pointer';
        arrow.style.marginRight = '5px';

        const tagInfo = document.createElement('span');
        tagInfo.innerHTML = `<span style="color:#569cd6">&lt;${el.tagName.toLowerCase()}</span><span style="color:#808080">&gt;</span>`;
        tagInfo.style.cursor = 'pointer';

        line.appendChild(arrow);
        line.appendChild(tagInfo);
        container.appendChild(line);

        const childContainer = document.createElement('div');
        childContainer.style.display = 'none';
        container.appendChild(childContainer);

        // Toggle Expand/Collapse
        const toggle = (e) => {
            e.stopPropagation();
            if (childContainer.style.display === 'none') {
                childContainer.style.display = 'block';
                arrow.innerHTML = '▼ ';
                if (childContainer.innerHTML === '') {
                    Array.from(el.children).forEach(child => {
                        childContainer.appendChild(createTreeItem(child, 15));
                    });
                }
            } else {
                childContainer.style.display = 'none';
                arrow.innerHTML = '▶ ';
            }
        };

        arrow.onclick = toggle;
        tagInfo.onclick = (e) => {
            e.stopPropagation();
            selectElement(el);
        };

        return container;
    };

    const renderElements = () => {
        content.innerHTML = '';
        content.appendChild(createTreeItem(document.documentElement, 0));
    };

    // --- Tab Events ---
    document.getElementById('tab-el').onclick = () => {
        isPicking = false;
        document.getElementById('tab-el').style.borderBottom = '2px solid #007acc';
        document.getElementById('tab-pick').style.borderBottom = 'none';
        renderElements();
    };

    document.getElementById('tab-pick').onclick = () => {
        isPicking = true;
        document.getElementById('tab-pick').style.borderBottom = '2px solid #007acc';
        document.getElementById('tab-el').style.borderBottom = 'none';
        content.innerHTML = '<div style="color:#ce9178; text-align:center; margin-top:20px;">Picker Active: Click any item on the page.</div>';
    };

    document.addEventListener('click', (e) => {
        if (isPicking) {
            e.preventDefault();
            e.stopPropagation();
            selectElement(e.target);
            // Show the HTML for the picked item in the content area without leaving Picker tab
            content.innerHTML = `
                <div style="color:#aaa; margin-bottom:10px;">Picked Element:</div>
                <div style="background:#333; padding:10px; border-radius:4px;">
                    ${createTreeItem(e.target, 0).outerHTML}
                </div>
                <p style="color:#569cd6; margin-top:10px; font-size:10px;">Click 'Elements' tab to see full tree.</p>
            `;
        }
    }, true);

    document.getElementById('close-insp').onclick = () => {
        panel.remove();
        document.body.style.marginRight = '0';
    };

    renderElements();
})();
