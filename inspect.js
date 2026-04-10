(function() {
    // 1. Setup - Remove old versions if they exist
    const existing = document.getElementById('gemini-v2');
    if (existing) {
        existing.remove();
        document.body.style.marginRight = '0';
        return;
    }

    // 2. Main Panel Layout
    const panel = document.createElement('div');
    panel.id = 'gemini-v2';
    Object.assign(panel.style, {
        position: 'fixed', top: '0', right: '0', width: '35%', height: '100%',
        backgroundColor: '#0d1117', color: '#c9d1d9', zIndex: '2147483647',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", monospace',
        display: 'flex', flexDirection: 'column', borderLeft: '1px solid #30363d',
        boxShadow: '-10px 0 30px rgba(0,0,0,0.5)', transition: 'all 0.2s ease'
    });

    document.body.style.marginRight = '35%';
    document.body.style.transition = 'margin-right 0.2s ease';

    // 3. UI Header
    panel.innerHTML = `
        <div style="display:flex; background:#161b22; border-bottom:1px solid #30363d; user-select:none;">
            <div id="btn-el" style="padding:12px; flex:1; text-align:center; cursor:pointer; border-bottom:2px solid #58a6ff; color:#58a6ff">Elements</div>
            <div id="btn-pk" style="padding:12px; flex:1; text-align:center; cursor:pointer; color:#8b949e">Picker</div>
            <div id="btn-cl" style="padding:12px; color:#f85149; font-weight:bold; cursor:pointer;">✕</div>
        </div>
        <div id="tree-container" style="flex:1; overflow:auto; padding:15px; font-size:13px; line-height:1.6;"></div>
        <div id="footer-editor" style="height:250px; background:#0d1117; border-top:1px solid #30363d; display:flex; flexDirection:column;">
            <div id="el-tag-name" style="font-size:11px; padding:6px 12px; background:#161b22; color:#8b949e; border-bottom:1px solid #30363d">STYLE EDITOR</div>
            <textarea id="css-box" spellcheck="false" style="flex:1; background:transparent; color:#79c0ff; border:none; padding:12px; resize:none; outline:none; font-family:monospace; font-size:12px;"></textarea>
        </div>
    `;

    document.body.appendChild(panel);

    // --- LOGIC ---
    let isPicking = false;
    const tree = panel.querySelector('#tree-container');
    const cssBox = panel.querySelector('#css-box');
    const tagLabel = panel.querySelector('#el-tag-name');

    // Element Selection Logic
    function updateSelection(el) {
        document.querySelectorAll('.v2-highlighter').forEach(n => n.style.outline = '');
        el.style.outline = '2px solid #58a6ff';
        el.classList.add('v2-highlighter');
        
        tagLabel.innerText = `STYLES: <${el.tagName.toLowerCase()}>`;
        cssBox.value = el.getAttribute('style') || '';
        cssBox.oninput = () => el.setAttribute('style', cssBox.value);
    }

    // Build Collapsible Tree
    function createNode(el, depth = 0) {
        const wrap = document.createElement('div');
        wrap.style.marginLeft = `${depth ? 15 : 0}px`;

        const line = document.createElement('div');
        line.style.whiteSpace = 'nowrap';
        
        const hasChildren = el.children.length > 0;
        const arrow = document.createElement('span');
        arrow.innerHTML = hasChildren ? '▶ ' : '&nbsp;&nbsp;';
        arrow.style.color = '#8b949e';
        arrow.style.cursor = 'pointer';
        arrow.style.fontSize = '10px';
        arrow.style.marginRight = '4px';

        const tag = document.createElement('span');
        tag.innerHTML = `<span style="color:#7ee787">&lt;${el.tagName.toLowerCase()}</span><span style="color:#8b949e">&gt;</span>`;
        tag.style.cursor = 'pointer';

        line.appendChild(arrow);
        line.appendChild(tag);
        wrap.appendChild(line);

        const childGrid = document.createElement('div');
        childGrid.style.display = 'none';
        wrap.appendChild(childGrid);

        // Arrow Toggle
        arrow.onclick = (e) => {
            e.stopPropagation();
            const isOpen = childGrid.style.display === 'block';
            childGrid.style.display = isOpen ? 'none' : 'block';
            arrow.innerHTML = isOpen ? '▶ ' : '▼ ';
            
            if (!isOpen && childGrid.innerHTML === '') {
                Array.from(el.children).forEach(c => childGrid.appendChild(createNode(c, depth + 1)));
            }
        };

        tag.onclick = (e) => {
            e.stopPropagation();
            updateSelection(el);
        };

        return wrap;
    }

    const refreshTree = () => {
        tree.innerHTML = '';
        tree.appendChild(createNode(document.documentElement));
    };

    // --- Tab Events ---
    panel.querySelector('#btn-el').onclick = () => {
        isPicking = false;
        panel.querySelector('#btn-el').style.color = '#58a6ff';
        panel.querySelector('#btn-pk').style.color = '#8b949e';
        refreshTree();
    };

    panel.querySelector('#btn-pk').onclick = () => {
        isPicking = true;
        panel.querySelector('#btn-pk').style.color = '#58a6ff';
        panel.querySelector('#btn-el').style.color = '#8b949e';
        tree.innerHTML = '<div style="color:#d29922; text-align:center; padding:40px;">Click any element on the page...</div>';
    };

    document.addEventListener('click', (e) => {
        if (isPicking) {
            e.preventDefault();
            e.stopPropagation();
            updateSelection(e.target);
            tree.innerHTML = `<div style="color:#8b949e; margin-bottom:10px;">Properties of picked element:</div>`;
            tree.appendChild(createNode(e.target));
        }
    }, true);

    panel.querySelector('#btn-cl').onclick = () => {
        panel.remove();
        document.body.style.marginRight = '0';
    };

    refreshTree();
})();
