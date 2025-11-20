// Window Management Class
class Window {
    constructor(id, appName, appConfig, desktop) {
        this.id = id;
        this.appName = appName;
        this.appConfig = appConfig;
        this.desktop = desktop;
        this.minimized = false;
        this.maximized = false;
        this.element = null;
        this.isDragging = false;
        this.isResizing = false;
        this.dragOffset = { x: 0, y: 0 };
        this.resizeStart = { x: 0, y: 0 };
        this.resizeDirection = null;
        this.originalSize = { width: 0, height: 0 };
        this.originalPosition = { x: 0, y: 0 };

        this.createWindow();
        this.setupEventListeners();
    }


    createWindow() {
        const defaultSize = this.appConfig.defaultSize || { width: 400, height: 300 };
        const defaultPosition = this.appConfig.defaultPosition || { x: 100, y: 100 };

        const windowDiv = document.createElement('div');
        windowDiv.className = 'window';
        windowDiv.id = `window-${this.id}`;
        windowDiv.style.left = defaultPosition.x + 'px';
        windowDiv.style.top = defaultPosition.y + 'px';
        windowDiv.style.width = defaultSize.width + 'px';
        windowDiv.style.height = defaultSize.height + 'px';

        const isResizable = this.appConfig.resizable !== false;
        const hasMinimize = this.appConfig.minimizable !== false;
        const hasMaximize = this.appConfig.maximizable !== false;

        windowDiv.innerHTML = `
            <div class="window-header">
                <img src="${this.appConfig.icon}" alt="" class="window-icon">
                <div class="window-title">${this.appConfig.name}</div>
                <div class="window-buttons">
                    ${hasMinimize ? '<div class="window-button minimize" title="Minimize"></div>' : ''}
                    ${hasMaximize ? '<div class="window-button maximize" title="Maximize"></div>' : ''}
                    <div class="window-button close" title="Close"></div>
                </div>
            </div>
            <div class="window-content">
                <div class="app-content" id="app-content-${this.id}"></div>
            </div>
            ${isResizable ? `
                <div class="resize-handle n"></div>
                <div class="resize-handle s"></div>
                <div class="resize-handle e"></div>
                <div class="resize-handle w"></div>
                <div class="resize-handle ne"></div>
                <div class="resize-handle nw"></div>
                <div class="resize-handle se"></div>
                <div class="resize-handle sw"></div>
            ` : ''}
        `;

        document.getElementById('windows-container').appendChild(windowDiv);
        this.element = windowDiv;
        this.title = this.appConfig.title;
        this.icon = this.appConfig.icon;

        // Load app content
        this.loadAppContent();
    }

    setupEventListeners() {
        const header = this.element.querySelector('.window-header');
        const minimizeBtn = this.element.querySelector('.minimize');
        const maximizeBtn = this.element.querySelector('.maximize');
        const closeBtn = this.element.querySelector('.close');

        // Header events
        header.addEventListener('mousedown', (e) => this.startDrag(e));

        // Button events
        if (minimizeBtn) {
            minimizeBtn.addEventListener('click', () => this.desktop.minimizeWindow(this.id));
        }
        if (maximizeBtn) {
            maximizeBtn.addEventListener('click', () => this.toggleMaximize());
        }
        closeBtn.addEventListener('click', () => this.desktop.closeWindow(this.id));

        // Resize handles
        if (this.appConfig.resizable) {
            const resizeHandles = this.element.querySelectorAll('.resize-handle');
            resizeHandles.forEach(handle => {
                handle.addEventListener('mousedown', (e) => this.startResize(e, handle.classList[1]));
            });
        }

        // Global mouse events for drag and resize
        document.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                this.drag(e);
            } else if (this.isResizing) {
                this.resize(e);
            }
        });

        document.addEventListener('mouseup', () => {
            this.stopDrag();
            this.stopResize();
        });

        // Focus on click
        this.element.addEventListener('mousedown', () => {
            this.desktop.focusWindow(this.id);
        });
    }

    startDrag(e) {
        if (e.target.closest('.window-button')) return;

        this.isDragging = true;
        this.dragOffset = {
            x: e.clientX - this.element.offsetLeft,
            y: e.clientY - this.element.offsetTop
        };
        this.element.style.cursor = 'move';
        e.preventDefault();
    }

    drag(e) {
        if (!this.isDragging || this.maximized) return;

        let newX = e.clientX - this.dragOffset.x;
        let newY = e.clientY - this.dragOffset.y;

        // Keep window within viewport bounds
        const maxX = window.innerWidth - this.element.offsetWidth;
        const maxY = window.innerHeight - this.element.offsetHeight - 40; // Account for taskbar

        newX = Math.max(0, Math.min(newX, maxX));
        newY = Math.max(0, Math.min(newY, maxY));

        this.element.style.left = newX + 'px';
        this.element.style.top = newY + 'px';
    }

    stopDrag() {
        this.isDragging = false;
        this.element.style.cursor = '';
    }

    startResize(e, direction) {
        this.isResizing = true;
        this.resizeDirection = direction;
        this.resizeStart = { x: e.clientX, y: e.clientY };
        this.originalSize = {
            width: this.element.offsetWidth,
            height: this.element.offsetHeight
        };
        this.originalPosition = {
            x: this.element.offsetLeft,
            y: this.element.offsetTop
        };
        e.preventDefault();
    }

    resize(e) {
        if (!this.isResizing) return;

        const deltaX = e.clientX - this.resizeStart.x;
        const deltaY = e.clientY - this.resizeStart.y;
        let newWidth = this.originalSize.width;
        let newHeight = this.originalSize.height;
        let newX = this.originalPosition.x;
        let newY = this.originalPosition.y;

        switch (this.resizeDirection) {
            case 'n':
                newHeight = Math.max(100, this.originalSize.height - deltaY);
                newY = this.originalPosition.y + deltaY;
                break;
            case 's':
                newHeight = Math.max(100, this.originalSize.height + deltaY);
                break;
            case 'e':
                newWidth = Math.max(200, this.originalSize.width + deltaX);
                break;
            case 'w':
                newWidth = Math.max(200, this.originalSize.width - deltaX);
                newX = this.originalPosition.x + deltaX;
                break;
            case 'ne':
                newWidth = Math.max(200, this.originalSize.width + deltaX);
                newHeight = Math.max(100, this.originalSize.height - deltaY);
                newY = this.originalPosition.y + deltaY;
                break;
            case 'nw':
                newWidth = Math.max(200, this.originalSize.width - deltaX);
                newHeight = Math.max(100, this.originalSize.height - deltaY);
                newX = this.originalPosition.x + deltaX;
                newY = this.originalPosition.y + deltaY;
                break;
            case 'se':
                newWidth = Math.max(200, this.originalSize.width + deltaX);
                newHeight = Math.max(100, this.originalSize.height + deltaY);
                break;
            case 'sw':
                newWidth = Math.max(200, this.originalSize.width - deltaX);
                newHeight = Math.max(100, this.originalSize.height + deltaY);
                newX = this.originalPosition.x + deltaX;
                break;
        }

        this.element.style.width = newWidth + 'px';
        this.element.style.height = newHeight + 'px';
        this.element.style.left = newX + 'px';
        this.element.style.top = newY + 'px';
    }

    stopResize() {
        this.isResizing = false;
        this.resizeDirection = null;
    }

    toggleMaximize() {
        if (this.appConfig.maximizable === false) return;

        this.maximized = !this.maximized;

        if (this.maximized) {
            this.element.classList.add('maximized');
        } else {
            this.element.classList.remove('maximized');
        }
    }

    loadAppContent() {
        const contentDiv = document.getElementById(`app-content-${this.id}`);

        // Handle different app types
        if (this.appConfig.type === 'iframe') {
            this.loadIframeApp(contentDiv);
        } else if (this.appConfig.type === 'folder') {
            this.loadFolderApp(contentDiv);
        } else {
            // Local app
            this.loadLocalApp(contentDiv);
        }
    }

    loadIframeApp(contentDiv) {
        const url = this.appConfig.url;
        if (url) {
            contentDiv.innerHTML = `<iframe src="${url}" style="width: 100%; height: 100%; border: none;"></iframe>`;
        } else {
            contentDiv.innerHTML = '<p>Invalid iframe URL</p>';
        }
    }

    loadFolderApp(contentDiv) {
        const contents = this.appConfig.contents || [];
        const folderPath = this.appConfig.path || `C:\\${this.appConfig.name}`;

        let html = `
            <div class="explorer-window">
                <!-- Toolbar -->
                <div class="explorer-toolbar">
                    <div class="toolbar-buttons">
                        <button class="toolbar-btn" id="back-btn" disabled title="Back">
                            <img src="/static/images/windowsIcons/back.png" alt="Back">
                        </button>
                        <button class="toolbar-btn" id="forward-btn" disabled title="Forward">
                            <img src="/static/images/windowsIcons/forward.png" alt="Forward">
                        </button>
                        <div class="toolbar-separator"></div>
                        <button class="toolbar-btn" id="up-btn" title="Up">
                            <img src="/static/images/windowsIcons/up.png" alt="Up">
                        </button>
                        <div class="toolbar-separator"></div>
                        <button class="toolbar-btn" id="cut-btn" disabled title="Cut">
                            <img src="/static/images/windowsIcons/cut.png" alt="Cut">
                        </button>
                        <button class="toolbar-btn" id="copy-btn" disabled title="Copy">
                            <img src="/static/images/windowsIcons/copy.png" alt="Copy">
                        </button>
                        <button class="toolbar-btn" id="paste-btn" disabled title="Paste">
                            <img src="/static/images/windowsIcons/paste.png" alt="Paste">
                        </button>
                        <div class="toolbar-separator"></div>
                        <button class="toolbar-btn" id="delete-btn" disabled title="Delete">
                            <img src="/static/images/windowsIcons/delete.png" alt="Delete">
                        </button>
                        <div class="toolbar-separator"></div>
                        <button class="toolbar-btn" id="properties-btn" title="Properties">
                            <img src="/static/images/windowsIcons/properties.png" alt="Properties">
                        </button>
                        <div class="toolbar-separator"></div>
                        <button class="toolbar-btn" id="views-btn" title="Views">
                            <img src="/static/images/windowsIcons/views.png" alt="Views">
                        </button>
                    </div>
                </div>

                <!-- Address Bar -->
                <div class="address-bar">
                    <span class="address-label">Address:</span>
                    <div class="address-input-container">
                        <input type="text" class="address-input" value="${folderPath}" readonly>
                        <button class="address-dropdown">▼</button>
                    </div>
                </div>

                <!-- Main Content Area -->
                <div class="explorer-content">
                    <!-- Sidebar -->
                    <div class="explorer-sidebar">
                        <div class="sidebar-header">
                            <span>Folders</span>
                        </div>
                        <div class="sidebar-tree">
                            <div class="tree-item expanded">
                                <img src="/static/images/windowsIcons/desktop.png" alt="Desktop" class="tree-icon">
                                <span>Desktop</span>
                            </div>
                            <div class="tree-item">
                                <img src="/static/images/windowsIcons/my-documents.png" alt="My Documents" class="tree-icon">
                                <span>My Documents</span>
                            </div>
                            <div class="tree-item">
                                <img src="/static/images/windowsIcons/my-computer.png" alt="My Computer" class="tree-icon">
                                <span>My Computer</span>
                            </div>
                            <div class="tree-item expanded">
                                <img src="/static/images/windowsIcons/hard-drive.png" alt="Local Disk (C:)" class="tree-icon">
                                <span>Local Disk (C:)</span>
                                <div class="tree-children">
                                    <div class="tree-item">
                                        <img src="/static/images/windowsIcons/folder.png" alt="${this.appConfig.name}" class="tree-icon">
                                        <span>${this.appConfig.name}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Main Content -->
                    <div class="explorer-main">
                        <div class="content-toolbar">
                            <div class="view-buttons">
                                <button class="view-btn active" data-view="large-icons">
                                    <img src="/static/images/windowsIcons/large-icons.png" alt="Large Icons">
                                </button>
                                <button class="view-btn" data-view="small-icons">
                                    <img src="/static/images/windowsIcons/small-icons.png" alt="Small Icons">
                                </button>
                                <button class="view-btn" data-view="list">
                                    <img src="/static/images/windowsIcons/list.png" alt="List">
                                </button>
                                <button class="view-btn" data-view="details">
                                    <img src="/static/images/windowsIcons/details.png" alt="Details">
                                </button>
                            </div>
                        </div>

                        <div class="content-area">
        `;

        contents.forEach(item => {
            const isFolder = item.type === 'folder';
            const iconSrc = isFolder ? '/static/images/windowsIcons/folder.png' : '/static/images/windowsIcons/file.png';

            html += `
                <div class="content-item ${isFolder ? 'folder' : 'file'}" data-type="${item.type}" data-name="${item.name}">
                    <div class="item-icon">
                        <img src="${item.icon || iconSrc}" alt="${item.name}" class="item-icon-img">
                    </div>
                    <div class="item-label">${item.name}</div>
                </div>
            `;
        });

        html += `
                        </div>
                    </div>
                </div>

                <!-- Status Bar -->
                <div class="status-bar">
                    <div class="status-left">
                        <span id="item-count">${contents.length} object(s)</span>
                    </div>
                    <div class="status-right">
                        <span id="selected-count">0 object(s) selected</span>
                    </div>
                </div>
            </div>
        `;

        contentDiv.innerHTML = html;

        // Add click handlers for folder items
        contentDiv.querySelectorAll('.content-item').forEach(item => {
            item.addEventListener('dblclick', () => {
                const itemName = item.dataset.name;
                const itemType = item.dataset.type;
                this.handleFolderItemClick(itemName, itemType);
            });
        });

        // Add toolbar button handlers
        this.setupExplorerToolbar(contentDiv);
    }

    handleFolderItemClick(itemName, itemType) {
        if (itemType === 'folder') {
            // Navigate to subfolder
            alert(`Opening folder: ${itemName}`);
        } else {
            // Open file
            alert(`Opening file: ${itemName}`);
        }
    }

    setupExplorerToolbar(contentDiv) {
        // Toolbar button handlers would go here
        const upBtn = contentDiv.querySelector('#up-btn');
        if (upBtn) {
            upBtn.addEventListener('click', () => {
                alert('Navigate Up - not implemented yet');
            });
        }
    }

    loadLocalApp(contentDiv) {
        switch (this.appName) {
            case 'minesweeper':
                this.loadMinesweeper(contentDiv);
                break;
            case 'notepad':
                this.loadNotepad(contentDiv);
                break;
            case 'internet-explorer':
                this.loadInternetExplorer(contentDiv);
                break;
            case 'paint':
                this.loadPaint(contentDiv);
                break;
            case 'winamp':
                this.loadWinamp(contentDiv);
                break;
            case 'my-computer':
                this.loadMyComputer(contentDiv);
                break;
            default:
                contentDiv.innerHTML = '<p>Application not implemented yet.</p>';
        }
    }

    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }

    // App loading methods will be implemented in apps.js
    loadMinesweeper(contentDiv) { /* Implemented in apps.js */ }
    loadNotepad(contentDiv) { /* Implemented in apps.js */ }
    loadInternetExplorer(contentDiv) { /* Implemented in apps.js */ }
    loadPaint(contentDiv) { /* Implemented in apps.js */ }
    loadWinamp(contentDiv) { /* Implemented in apps.js */ }
    loadMyComputer(contentDiv) { /* Implemented in apps.js */ }
}
