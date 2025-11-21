class DesktopManager {
    constructor() {
        this.icons = [];
        this.windows = [];
        this.activeWindow = null;
        this.zIndexCounter = 100;
        this.gridSize = { x: 75, y: 75 };
        this.selectedIcon = null;
    }

    init(desktopConfig) {
        this.renderIcons(desktopConfig);
        // Initialize Panels (Taskbar, Start Menu, Tray)
        if (window.Panels) {
            window.Panels.init(this);
        }
        this.initContextMenu();
        this.initDesktopInteractions();
    }

    initDesktopInteractions() {
        const desktop = document.getElementById('desktop');

        // Deselect on click background
        desktop.addEventListener('mousedown', (e) => {
            if (e.target === desktop || e.target.id === 'desktop-icons') {
                this.deselectAllIcons();
            }
        });
    }

    renderIcons(desktopConfig) {
        const desktopEl = document.getElementById('desktop-icons');
        desktopEl.innerHTML = '';
    };

            desktopEl.appendChild(iconEl);
            this.icons.push({ config: iconConfig, element: iconEl });
        });
    }

selectIcon(iconEl) {
    this.deselectAllIcons();
    iconEl.classList.add('selected');
    this.selectedIcon = iconEl;
}

deselectAllIcons() {
    const icons = document.querySelectorAll('.desktop-icon');
    icons.forEach(icon => icon.classList.remove('selected'));
    this.selectedIcon = null;
}

initDrag(e, iconEl, iconConfig) {
    e.preventDefault();

    let startX = e.clientX;
    let startY = e.clientY;
    let startLeft = parseInt(iconEl.style.left || 0);
    let startTop = parseInt(iconEl.style.top || 0);

    const onMouseMove = (e) => {
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        iconEl.style.left = (startLeft + dx) + 'px';
        iconEl.style.top = (startTop + dy) + 'px';
    };

    const onMouseUp = (e) => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);

        // Snap to grid
        const currentLeft = parseInt(iconEl.style.left || 0);
        const currentTop = parseInt(iconEl.style.top || 0);

        const gridX = Math.round((currentLeft - 10) / this.gridSize.x);
        const gridY = Math.round((currentTop - 10) / this.gridSize.y);

        const snappedLeft = Math.max(10, gridX * this.gridSize.x + 10);
        const snappedTop = Math.max(10, gridY * this.gridSize.y + 10);

        iconEl.style.left = snappedLeft + 'px';
        iconEl.style.top = snappedTop + 'px';

        // Update config (in memory only for now)
        iconConfig.gridPos.x = gridX;
        iconConfig.gridPos.y = gridY;
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
}

handleIconClick(icon) {
    if (icon.action === 'openWindow') {
        this.openWindow(icon.target, icon.name);
    } else if (icon.action === 'runCommand') {
        // Handle run command
    }
}

openWindow(appId, title) {
    // Check if window already open
    const existingWindow = this.windows.find(w => w.appId === appId);
    if (existingWindow) {
        this.focusWindow(existingWindow.id);
        if (existingWindow.minimized) {
            this.restoreWindow(existingWindow.id);
        }
        return;
    }

    const id = 'win_' + Date.now();
    const winEl = document.createElement('div');
    winEl.className = 'window';
    winEl.id = id;
    winEl.style.zIndex = ++this.zIndexCounter;

    // Basic Window Structure (XP style)
    winEl.innerHTML = `
            <div class="window-header">
                <img src="${this.getAppIcon(appId)}" class="window-icon" onerror="this.style.display='none'">
                <div class="window-title">${title}</div>
                <div class="window-buttons">
                    <button class="win-btn minimize" aria-label="Minimize">_</button>
                    <button class="win-btn maximize" aria-label="Maximize">□</button>
                    <button class="win-btn close" aria-label="Close">×</button>
                </div>
            </div>
            <div class="window-body" style="height: calc(100% - 28px); position: relative; background: #fff;">
                <div class="loading" style="padding: 20px;">Loading...</div>
            </div>
        `;

    // Position window (centered, but within bounds)
    const appConfig = window.System.config.apps[appId];
    const width = appConfig?.width || 600;
    const height = appConfig?.height || 400;

    // Calculate centered position
    let left = (window.innerWidth - width) / 2;
    let top = (window.innerHeight - height) / 2;

    // Ensure window stays within bounds
    left = Math.max(0, Math.min(left, window.innerWidth - width));
    top = Math.max(0, Math.min(top, window.innerHeight - height - 40)); // 40px for taskbar

    winEl.style.left = left + 'px';
    winEl.style.top = top + 'px';
    winEl.style.width = width + 'px';
    winEl.style.height = height + 'px';

    // Add Event Listeners
    winEl.querySelector('.close').onclick = (e) => { e.stopPropagation(); this.closeWindow(id); };
    winEl.querySelector('.minimize').onclick = (e) => { e.stopPropagation(); this.minimizeWindow(id); };
    winEl.querySelector('.maximize').onclick = (e) => { e.stopPropagation(); this.maximizeWindow(id); };

    // Make Draggable
    this.makeDraggable(winEl);

    // Focus on click
    winEl.onmousedown = () => this.focusWindow(id);

    document.getElementById('windows-container').appendChild(winEl);

    this.windows.push({ id, appId, element: winEl, minimized: false, maximized: false });

    // Update Taskbar via PanelsManager
    if (window.Panels) {
        window.Panels.updateTaskbar(this.windows, this.activeWindow, this.focusWindow.bind(this));
    }

    // Load Content
    this.loadAppContent(id, appId);
}

getAppIcon(appId) {
    const appConfig = window.System?.config?.apps?.[appId];
    return appConfig ? appConfig.icon : '';
}

closeWindow(id) {
    const win = this.windows.find(w => w.id === id);
    if (win) {
        win.element.remove();
        this.windows = this.windows.filter(w => w.id !== id);
        // Update Taskbar via PanelsManager
        if (window.Panels) {
            window.Panels.updateTaskbar(this.windows, this.activeWindow, this.focusWindow.bind(this));
        }
    }
}

minimizeWindow(id) {
    const win = this.windows.find(w => w.id === id);
    if (win) {
        win.minimized = true;
        win.element.classList.add('hidden'); // Or use a minimize animation class
        // Update Taskbar via PanelsManager
        if (window.Panels) {
            window.Panels.updateTaskbar(this.windows, this.activeWindow, this.focusWindow.bind(this));
        }
    }
}

restoreWindow(id) {
    const win = this.windows.find(w => w.id === id);
    if (win) {
        win.minimized = false;
        win.element.classList.remove('hidden');
        this.focusWindow(id);
    }
}

maximizeWindow(id) {
    const win = this.windows.find(w => w.id === id);
    if (win) {
        if (win.maximized) {
            win.element.classList.remove('maximized');
            win.maximized = false;
        } else {
            win.element.classList.add('maximized');
            win.maximized = true;
        }
    }
}

focusWindow(id) {
    const win = this.windows.find(w => w.id === id);
    if (win) {
        if (win.minimized) {
            this.restoreWindow(id);
            return;
        }
        win.element.style.zIndex = ++this.zIndexCounter;
        this.activeWindow = id;

        // Update active state in taskbar
        if (window.Panels) {
            window.Panels.updateTaskbar(this.windows, this.activeWindow, this.focusWindow.bind(this));
        }

        // Update visual active state of window
        document.querySelectorAll('.window').forEach(w => w.classList.remove('active'));
        win.element.classList.add('active');
    }
}

makeDraggable(element) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    const header = element.querySelector('.window-header');

    header.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        e = e || window.event;
        // Don't drag if clicking buttons
        if (e.target.closest('button')) return;

        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        element.style.top = (element.offsetTop - pos2) + "px";
        element.style.left = (element.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

initContextMenu() {
    const desktop = document.getElementById('desktop');
    const contextMenu = document.getElementById('context-menu'); // Ensure this exists in HTML or create it
    const startMenu = document.getElementById('start-menu');

    // Right-click context menu
    desktop.addEventListener('contextmenu', (e) => {
        // Only show on desktop, not on icons or windows
        if (e.target === desktop || e.target.id === 'desktop-icons') {
            e.preventDefault();
            if (contextMenu) {
                contextMenu.style.display = 'block';
                contextMenu.style.left = e.pageX + 'px';
                contextMenu.style.top = e.pageY + 'px';
            }
        }
    });

    // Close menus on click
    document.addEventListener('click', (e) => {
        if (e.target.closest('#start-button')) return;
        if (e.target.closest('#start-menu')) return;

        if (contextMenu) contextMenu.style.display = 'none';
        if (startMenu) startMenu.style.display = 'none';
    });
}
}

window.Desktop = new DesktopManager();
