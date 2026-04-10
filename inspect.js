(function() {
    // 1. Prevent Multi-loading
    if (document.getElementById('gemini-inspector')) {
        document.getElementById('gemini-inspector').remove();
        document.body.style.marginRight = '0';
        return;
    }

    // 2. Create the Container
    const panel = document.createElement('div');
    panel.id = 'gemini-inspector';
    Object.assign(panel.style, {
        position: 'fixed',
        top: '0',
        right: '0',
        width: '40%',
        height: '100%',
        backgroundColor: '#1e1e1e',
        color: '#d4d4d4',
        zIndex: '2147483647', // Maximum possible z-index
        fontFamily: 'monospace',
        display: 'flex',
        flexDirection: 'column',
        borderLeft: '2px solid #444',
        boxShadow: '-5px 0 15px rgba(0,0,0,0.5)',
        overflow: 'hidden',
        textAlign: 'left'
    });

    document.body.style.transition = 'margin-right 0.3s';
    document.body.style.marginRight = '40%';

    // 3. Navigation Tabs
    const tabs = document.createElement('div');
    tabs.innerHTML = `
        <div style="display:flex; background:#333; cursor:pointer; font-size:12px; border-bottom:1px solid #444">
            <div id="tab-el" style="padding:10px; flex:1; text-align:center; border-bottom:2px solid #007acc">Elements</div>
            <div id="tab-pick" style="padding:10px; flex:1; text-align:center;">Picker</div>
            <div id="tab-con" style="padding:10px; flex:1; text-align:center;">Console</div>
            <div id="close-insp" style="padding:10px; color:#ff5f56; font-weight:bold;">✕</div>
        </div>
    `;
    panel.appendChild(tabs);

    const content = document.createElement('div');
    Object.assign(content.style, { flex: '1', overflowY: 'auto', padding: '10px', fontSize: '12px' });
    panel.appendChild(content);

    const bottomEditor = document.createElement('div');
    Object.assign(bottomEditor.style, {
        height: '200px',
        borderTop: '2px solid #444',
        background: '#252526',
        display: 'none',
        flexDirection: 'column'
    });
    bottomEditor.innerHTML = `
        <div style="font-size:10px; padding:5px; background:#333; color:#aaa">INLINE STYLES</div>
        <textarea id="css-editor" spellcheck="false" style="flex:1; background:transparent; color:#9cdcfe; border:none; padding:8px; resize:none; outline:none; font-family:monospace;"></textarea>
    `;
    panel.appendChild(bottomEditor);
    document.body.appendChild(panel);

    // --- LOGIC ---
    let isPicking = false;

    const renderElements = () => {
        content.innerHTML = '';
        const tree = document.createDocumentFragment(); // Faster rendering
        
        function buildTree(el, margin = 0) {
            if (el.id === 'gemini-inspector') return; // Don't inspect yourself
            
            const line = document.createElement('div');
            line.style.padding = '2px 0';
            line.style.marginLeft = margin + 'px';
            line.style.whiteSpace = 'nowrap';
            line.innerHTML = `<span style="color:#808080">&lt;</span><span style="color:#569cd6; cursor:pointer;">${el.tagName.toLowerCase()}</span><span style="color:#808080">&gt;</span>`;
            
            line.onclick = (e) => {
                e.stopPropagation();
                selectElement(el);
            };
            tree.appendChild(line);
            
            // Limit depth or child count to prevent Safari crashing
            if (el.children.length < 50) { 
                Array.from(el.children).forEach(child => buildTree(child, margin + 12));
            }
        }

        buildTree(document.body);
        content.appendChild(tree);
    };

    const selectElement = (el) => {
        bottomEditor.style.display = 'flex';
        const cssArea = document.getElementById('css-editor');
        cssArea.value = el.getAttribute('style') || '';
        
        // Visual feedback
        document.querySelectorAll('.insp-target').forEach(n => n.style.outline = '');
        el.style.outline = '2px solid #007acc';
        el.classList.add('insp-target');
        
        cssArea.oninput = () => { el.setAttribute('style', cssArea.value); };
    };

    // Tab Events
    document.getElementById('tab-el').onclick = () => { isPicking = false; renderElements(); };
    document.getElementById('tab-pick').onclick = () => { 
        isPicking = true; 
        content.innerHTML = '<div style="color:#ce9178; text-align:center; margin-top:20px;">Targeting Mode: Click an element on the page</div>'; 
    };
    
    document.getElementById('tab-con').onclick = () => {
        isPicking = false;
        content.innerHTML = '<div id="console-out" style="margin-bottom:10px"></div><input id="console-in" style="width:100%; background:#000; color:#bcda7d; border:1px solid #444; padding:5px; outline:none;" placeholder="> Execute JS...">';
        const input = document.getElementById('console-in');
        input.onkeydown = (e) => {
            if(e.key === 'Enter') {
                try {
                    const res = eval(input.value);
                    document.getElementById('console-out').innerHTML += `<div style="border-bottom:1px solid #333; padding:2px;">> ${res}</div>`;
                } catch(err) {
                    document.getElementById('console-out').innerHTML += `<div style="color:#f44747">> ${err}</div>`;
                }
                input.value = '';
            }
        };
    };

    // Global Click Handler
    document.addEventListener('click', (e) => {
        if (isPicking) {
            e.preventDefault();
            e.stopPropagation();
            selectElement(e.target);
            isPicking = false;
            document.getElementById('tab-el').click();
        }
    }, true);

    document.getElementById('close-insp').onclick = () => {
        panel.remove();
        document.body.style.marginRight = '0';
        document.querySelectorAll('.insp-target').forEach(n => n.style.outline = '');
    };

    renderElements();
})();
