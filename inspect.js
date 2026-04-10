(function() {
    // 1. Create the Container
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
        zIndex: '1000000',
        fontFamily: 'monospace',
        display: 'flex',
        flexDirection: 'column',
        borderLeft: '2px solid #444',
        boxShadow: '-5px 0 15px rgba(0,0,0,0.5)',
        overflow: 'hidden'
    });

    // Push the website content to the left
    document.body.style.transition = 'margin-right 0.3s';
    document.body.style.marginRight = '40%';

    // 2. Navigation Tabs
    const tabs = document.createElement('div');
    tabs.innerHTML = `
        <div style="display:flex; background:#333; cursor:pointer;">
            <div id="tab-el" style="padding:10px; flex:1; text-align:center; border-bottom:2px solid blue">Elements</div>
            <div id="tab-pick" style="padding:10px; flex:1; text-align:center;">Picker</div>
            <div id="tab-con" style="padding:10px; flex:1; text-align:center;">Console</div>
            <div id="close-insp" style="padding:10px; color:red;">X</div>
        </div>
    `;
    panel.appendChild(tabs);

    // 3. Content Areas
    const content = document.createElement('div');
    content.style.flex = '1';
    content.style.overflowY = 'auto';
    content.style.padding = '10px';
    panel.appendChild(content);

    // 4. Bottom Style/JS Editor
    const bottomEditor = document.createElement('div');
    Object.assign(bottomEditor.style, {
        height: '200px',
        borderTop: '2px solid #444',
        background: '#252526',
        display: 'none', // Hidden until element selected
        flexDirection: 'column'
    });
    bottomEditor.innerHTML = `
        <div style="font-size:10px; padding:2px; background:#333">CSS Styles / JS Properties</div>
        <textarea id="css-editor" style="flex:1; background:transparent; color:#9cdcfe; border:none; padding:5px; resize:none; outline:none;"></textarea>
    `;
    panel.appendChild(bottomEditor);

    document.body.appendChild(panel);

    // --- LOGIC ---
    let selectedElement = null;
    let isPicking = false;

    const renderElements = () => {
        content.innerHTML = '';
        const tree = document.createElement('div');
        
        function buildTree(el, margin = 0) {
            const line = document.createElement('div');
            line.style.marginLeft = margin + 'px';
            line.style.cursor = 'pointer';
            line.innerHTML = `&lt;<span style="color:#569cd6" contenteditable="true">${el.tagName.toLowerCase()}</span>&gt;`;
            
            line.onclick = (e) => {
                e.stopPropagation();
                selectElement(el);
            };

            line.oninput = (e) => {
                const newTag = e.target.innerText;
                // Complex tag swapping logic would go here
            };

            tree.appendChild(line);
            Array.from(el.children).forEach(child => buildTree(child, margin + 15));
        }

        buildTree(document.body);
        content.appendChild(tree);
    };

    const selectElement = (el) => {
        selectedElement = el;
        bottomEditor.style.display = 'flex';
        const cssArea = document.getElementById('css-editor');
        cssArea.value = el.getAttribute('style') || '/* No inline styles */';
        
        // Outline effect on site
        document.querySelectorAll('.insp-highlight').forEach(n => n.classList.remove('insp-highlight'));
        el.classList.add('insp-highlight');
        
        cssArea.oninput = () => {
            el.setAttribute('style', cssArea.value);
        };
    };

    // Tab Switching
    document.getElementById('tab-el').onclick = () => {
        isPicking = false;
        renderElements();
    };

    document.getElementById('tab-pick').onclick = () => {
        isPicking = true;
        content.innerHTML = '<p style="color:yellow">Click any element on the page to inspect it.</p>';
    };

    document.getElementById('tab-con').onclick = () => {
        isPicking = false;
        content.innerHTML = '<div id="console-out"></div><input id="console-in" style="width:100%; background:#000; color:white; border:1px solid #444;" placeholder="Run JS...">';
        const input = document.getElementById('console-in');
        input.onkeydown = (e) => {
            if(e.key === 'Enter') {
                try {
                    const res = eval(input.value);
                    document.getElementById('console-out').innerHTML += `<div>> ${res}</div>`;
                } catch(err) {
                    document.getElementById('console-out').innerHTML += `<div style="color:red">> ${err}</div>`;
                }
                input.value = '';
            }
        };
    };

    // Global Picker Logic
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
    };

    renderElements();
})();
