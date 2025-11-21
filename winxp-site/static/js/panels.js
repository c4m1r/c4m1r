class PanelsManager {
    constructor() {
        this.desktop = null; // Reference to DesktopManager
    }

    init(desktopManager) {
        this.desktop = desktopManager;
        this.initTaskbar();
        this.initClock();
    }

    initTaskbar() {
        const startBtn = document.getElementById('start-button');
        if (startBtn) {
            // Remove existing listeners to prevent duplicates if re-initialized
            const newStartBtn = startBtn.cloneNode(true);
            startBtn.parentNode.replaceChild(newStartBtn, startBtn);

            newStartBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleStartMenu();
            });
        }

        // System Tray
        const tray = document.getElementById('system-tray');
        if (tray) {
            tray.innerHTML = `
                <div class="tray-icons">
                    <div class="tray-icon language-icon" style="color: white; font-size: 11px; margin-right: 8px; font-weight: bold;">EN</div>
                    <img src="./images/windowsIcons/volume.svg" id="tray-volume" class="tray-icon" title="Volume" style="width: 16px; height: 16px; cursor: pointer; margin-right: 5px;">
                </div>
                <div id="clock" class="tray-clock" style="font-size: 11px; color: white; margin-left: 5px;"></div>
            `;

            // Add listeners
            const volIcon = document.getElementById('tray-volume');
            if (volIcon) {
                volIcon.onclick = () => this.toggleVolume();
            }
        }
    }

    initClock() {
        this.updateClock();
        setInterval(() => this.updateClock(), 1000);
    }

    updateClock() {
        const now = new Date();
        const clock = document.getElementById('clock');
        if (clock) {
            clock.innerText = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
    }

    toggleVolume() {
        const volIcon = document.getElementById('tray-volume');
        if (!volIcon) return;

        const volumePopup = document.getElementById('volume-popup');
        if (volumePopup) {
            volumePopup.classList.toggle('hidden');
            // Position it above the tray
            const rect = volIcon.getBoundingClientRect();
            volumePopup.style.left = (rect.left - 50) + 'px';
            volumePopup.style.bottom = '30px';
            volumePopup.style.position = 'absolute';
            volumePopup.style.zIndex = 10000;
        }
    }

    toggleStartMenu(show) {
        const menu = document.getElementById('start-menu');
        if (!menu) return;

        if (show === undefined) {
            show = menu.style.display !== 'flex';
        }

        if (show) {
            this.renderStartMenu();
            menu.style.display = 'flex';
            menu.classList.remove('hidden');
        } else {
            menu.style.display = 'none';
            menu.classList.add('hidden');
        }
    }

    renderStartMenu() {
        const startMenu = document.getElementById('start-menu');
        const config = window.System?.config?.startMenu;
        const user = window.System?.config?.users?.[0];

        if (!config || !config.left || !config.right || !user) return;

        startMenu.innerHTML = `
            <div class="start-menu-header">
                <div class="start-menu-logo">
                    <img src="${user.avatar}" class="start-user-icon" style="width: 40px; height: 40px; border-radius: 3px; border: 2px solid white;">
                </div>
                <span class="start-username" style="font-weight: bold; font-size: 14px; margin-left: 10px;">${user.name}</span>
            </div>
            <div class="start-menu-content">
                <div class="start-menu-left">
                    ${this.renderStartItems(config.left)}
                </div>
                <div class="start-menu-right">
                    ${this.renderStartItems(config.right)}
                </div>
            </div>
            <div class="start-menu-bottom">
                <div class="start-menu-bottom-buttons">
                    ${this.renderStartFooter(config.bottom)}
                </div>
            </div>
        `;
    }

    renderStartItems(items) {
        return items.map(item => {
            if (item.separator) {
                return '<div class="start-menu-separator"></div>';
            }

            const boldClass = item.bold ? 'font-bold' : '';
            const subtitleHtml = item.subtitle ? `<div class="start-subtitle" style="font-size: 9px; color: #666;">${item.subtitle}</div>` : '';

            return `
                <div class="start-menu-item ${boldClass}" onclick="window.Panels.handleStartItemClick('${item.id}')">
                    <img src="${item.icon}" alt="${item.name}">
                    <div class="start-item-text">
                        <div class="start-item-title">${item.name}</div>
                        ${subtitleHtml}
                    </div>
                </div>
            `;
        }).join('');
    }

    renderStartFooter(items) {
        if (!items) return '';
        return items.map(item => `
            <div class="start-menu-item" onclick="window.System.${item.action}('${item.target || ''}')">
                <img src="${item.icon}" alt="${item.name}">
                <span>${item.name}</span>
            </div>
        `).join('');
    }

    handleStartItemClick(id) {
        const config = window.System.config.startMenu;
        const allItems = [...config.left, ...config.right, ...(config.bottom || [])];
        const item = allItems.find(i => i.id === id);

        if (item) {
            if (item.action === 'openWindow') {
                this.desktop.openWindow(item.target, item.name);
            } else if (item.action === 'runCommand') {
                console.log('Run command clicked');
            } else if (item.action === 'logoff') {
                window.UserManager.logout();
            } else if (item.action === 'shutdown') {
                // Implement shutdown
                alert('Shutdown not implemented yet');
            }
            this.toggleStartMenu(false);
        }
    }

    updateTaskbar(windows, activeWindowId, focusWindowCallback) {
        const taskList = document.getElementById('taskbar-apps');
        if (!taskList) return;

        taskList.innerHTML = '';
        windows.forEach(win => {
            // Skip if minimized and hidden? No, taskbar should always show it.

            const btn = document.createElement('div');
            btn.className = 'taskbar-app';
            if (win.id === activeWindowId && !win.minimized) {
                btn.classList.add('active');
            }

            // Try to find app name from config or use ID
            const appConfig = window.System?.config?.apps?.[win.appId];
            const appName = appConfig ? appConfig.title : win.appId;
            const appIcon = appConfig ? appConfig.icon : ''; // Need to ensure icons are in app config

            // Add icon if available
            if (appIcon) {
                const img = document.createElement('img');
                img.src = appIcon;
                btn.appendChild(img);
            } else {
                // Fallback icon or try to find from desktop config?
                // Ideally app config should have icon.
                // For now, let's just use a generic one if missing or try to find it.
            }

            const span = document.createElement('span');
            span.innerText = appName;
            btn.appendChild(span);

            btn.onclick = () => {
                if (win.id === activeWindowId && !win.minimized) {
                    this.desktop.minimizeWindow(win.id);
                } else {
                    focusWindowCallback(win.id);
                }
            };
            taskList.appendChild(btn);
        });
    }
}

window.Panels = new PanelsManager();
