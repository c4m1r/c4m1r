// Windows XP Desktop Simulation
class Desktop {
    constructor() {
        this.windows = [];
        this.nextZIndex = 100;
        this.nextWindowId = 1;
        this.activeWindow = null;
        this.isSelecting = false;
        this.selectionStart = null;
        this.selectionRect = document.getElementById('selection-rect');
        this.config = null;
        this.apps = {};

        this.init();
    }

    async init() {
        await this.loadConfig();
        this.setupDesktopIcons();
        this.setupStartMenu();
        this.setupEventListeners();
        this.updateClock();
        setInterval(() => this.updateClock(), 1000);
    }

    setupEventListeners() {
        const desktop = document.getElementById('desktop');
        const startButton = document.getElementById('start-button');
        const startMenu = document.getElementById('start-menu');

        // Desktop click events
        desktop.addEventListener('mousedown', (e) => this.handleDesktopMouseDown(e));
        desktop.addEventListener('mousemove', (e) => this.handleDesktopMouseMove(e));
        desktop.addEventListener('mouseup', () => this.handleDesktopMouseUp());

        // Start button events
        startButton.addEventListener('click', () => this.toggleStartMenu());

        // Start menu items are now handled in setupStartMenu()

        // Desktop icons
        document.querySelectorAll('.desktop-icon').forEach(icon => {
            icon.addEventListener('dblclick', (e) => {
                const app = e.currentTarget.dataset.app;
                this.openApp(app);
            });
        });

        // System tray events
        const clock = document.getElementById('clock');
        const volumeIcon = document.getElementById('volume-icon');

        clock.addEventListener('click', () => this.toggleCalendar());
        volumeIcon.addEventListener('click', () => this.toggleVolume());

        // Close popups when clicking elsewhere
        document.addEventListener('click', (e) => {
            if (!clock.contains(e.target) && !document.getElementById('calendar-popup').contains(e.target)) {
                this.hideCalendar();
            }
            if (!volumeIcon.contains(e.target) && !document.getElementById('volume-popup').contains(e.target)) {
                this.hideVolume();
            }
        });

        // Power modal
        document.getElementById('power-yes').addEventListener('click', () => {
            this.powerOff();
        });
        document.getElementById('power-no').addEventListener('click', () => {
            this.hidePowerModal();
        });

        // Hide menus when clicking elsewhere
        document.addEventListener('click', (e) => {
            if (!startButton.contains(e.target) && !startMenu.contains(e.target)) {
                this.hideStartMenu();
            }
        });
    }

    handleDesktopMouseDown(e) {
        if (e.target === document.getElementById('desktop') ||
            e.target === document.getElementById('desktop-icons')) {
            this.clearSelection();
            this.startSelection(e);
        }
    }

    handleDesktopMouseMove(e) {
        if (this.isSelecting) {
            this.updateSelection(e);
        }
    }

    handleDesktopMouseUp() {
        if (this.isSelecting) {
            this.endSelection();
        }
    }

    startSelection(e) {
        this.isSelecting = true;
        this.selectionStart = { x: e.clientX, y: e.clientY };
        this.selectionRect.style.display = 'block';
        this.selectionRect.style.left = e.clientX + 'px';
        this.selectionRect.style.top = e.clientY + 'px';
        this.selectionRect.style.width = '0px';
        this.selectionRect.style.height = '0px';
    }

    updateSelection(e) {
        const currentX = e.clientX;
        const currentY = e.clientY;
        const startX = this.selectionStart.x;
        const startY = this.selectionStart.y;

        const left = Math.min(startX, currentX);
        const top = Math.min(startY, currentY);
        const width = Math.abs(currentX - startX);
        const height = Math.abs(currentY - startY);

        this.selectionRect.style.left = left + 'px';
        this.selectionRect.style.top = top + 'px';
        this.selectionRect.style.width = width + 'px';
        this.selectionRect.style.height = height + 'px';
    }

    endSelection() {
        this.isSelecting = false;
        this.selectionRect.style.display = 'none';
    }

    clearSelection() {
        document.querySelectorAll('.desktop-icon.selected').forEach(icon => {
            icon.classList.remove('selected');
        });
    }

    toggleStartMenu() {
        const startMenu = document.getElementById('start-menu');
        startMenu.classList.toggle('hidden');
    }

    hideStartMenu() {
        document.getElementById('start-menu').classList.add('hidden');
    }

    showPowerModal(type) {
        const modal = document.getElementById('power-modal');
        const title = document.getElementById('power-modal-title');
        const message = document.getElementById('power-modal-message');

        if (type === 'turn-off') {
            title.textContent = 'Turn off computer';
            message.textContent = 'Are you sure you want to turn off your computer?';
        } else {
            title.textContent = 'Log off Windows';
            message.textContent = 'Are you sure you want to log off?';
        }

        modal.classList.remove('hidden');
    }

    hidePowerModal() {
        document.getElementById('power-modal').classList.add('hidden');
    }

    powerOff() {
        // Simulate power off animation
        document.body.style.animation = 'powerOff 3s forwards';
        setTimeout(() => {
            // For demo purposes, just hide everything
            document.body.innerHTML = '<div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white; font-size: 24px;">Good Bye!</div>';
        }, 3000);
    }

    openApp(appName) {
        // Get app config
        const appConfig = this.config.apps[appName];
        if (!appConfig) {
            console.error(`App '${appName}' not found in config`);
            return;
        }

        // Check if app is already open and doesn't support multiple instances
        if (!appConfig.multiInstance) {
            const existingWindow = this.windows.find(w => w.appName === appName && !w.minimized);
            if (existingWindow) {
                this.focusWindow(existingWindow.id);
                return;
            }
        }

        const windowId = this.nextWindowId++;
        const window = new Window(windowId, appName, appConfig, this);
        this.windows.push(window);
        this.focusWindow(windowId);
    }

    closeWindow(windowId) {
        const index = this.windows.findIndex(w => w.id === windowId);
        if (index !== -1) {
            this.windows[index].destroy();
            this.windows.splice(index, 1);
            this.updateTaskbar();
        }
    }

    focusWindow(windowId) {
        const window = this.windows.find(w => w.id === windowId);
        if (window) {
            this.activeWindow = window;
            this.nextZIndex++;
            window.element.style.zIndex = this.nextZIndex;
            window.element.classList.add('active');

            // Remove active class from other windows
            this.windows.forEach(w => {
                if (w.id !== windowId) {
                    w.element.classList.remove('active');
                }
            });

            this.updateTaskbar();
        }
    }

    minimizeWindow(windowId) {
        const window = this.windows.find(w => w.id === windowId);
        if (window) {
            window.minimized = true;
            window.element.classList.add('minimized');
            this.updateTaskbar();
        }
    }

    updateTaskbar() {
        const taskbarApps = document.getElementById('taskbar-apps');
        taskbarApps.innerHTML = '';

        this.windows.forEach(window => {
            const taskbarApp = document.createElement('div');
            taskbarApp.className = 'taskbar-app';
            if (this.activeWindow && this.activeWindow.id === window.id) {
                taskbarApp.classList.add('active');
            }

            taskbarApp.innerHTML = `
                <img src="${window.icon}" alt="">
                <span>${window.title}</span>
            `;

            taskbarApp.addEventListener('click', () => {
                if (this.activeWindow && this.activeWindow.id === window.id) {
                    this.minimizeWindow(window.id);
                } else {
                    this.focusWindow(window.id);
                }
            });

            taskbarApps.appendChild(taskbarApp);
        });
    }

    async loadConfig() {
        // Use embedded config for static hosting
            this.config = {
            "system": {
                "iconSize": 32,
                "iconTextSize": 11,
                "desktopGridSize": 80,
                "defaultWallpaper": "./images/wallpaper.jpg"
            },
            "apps": {
                "minesweeper": {
                    "name": "Minesweeper",
                    "icon": "./apps/minesweeper/mine-icon.png",
                    "type": "local",
                    "category": "game",
                    "description": "Classic Minesweeper game",
                    "defaultSize": {
                        "width": 170,
                        "height": 280
                    },
                    "defaultPosition": {
                        "x": 180,
                        "y": 170
                    },
                    "resizable": false,
                    "minimizable": true,
                    "maximizable": false,
                    "multiInstance": true,
                    "hasMenu": true,
                    "menuData": "minesweeper-menu.js",
                    "jsFiles": ["minesweeper.js"],
                    "cssFiles": ["minesweeper.css"],
                    "author": "Original from OnlineWinXP project"
                },
                "notepad": {
                    "name": "Notepad",
                    "icon": "./apps/notepad/327(16x16).png",
                    "type": "local",
                    "category": "utility",
                    "description": "Simple text editor",
                    "defaultSize": {
                        "width": 660,
                        "height": 500
                    },
                    "defaultPosition": {
                        "x": 270,
                        "y": 60
                    },
                    "resizable": true,
                    "minimizable": true,
                    "maximizable": true,
                    "multiInstance": true,
                    "hasMenu": true,
                    "menuData": "notepad-menu.js",
                    "jsFiles": ["notepad.js"],
                    "cssFiles": ["notepad.css"],
                    "author": "Original from OnlineWinXP project"
                },
                "internet-explorer": {
                    "name": "Internet Explorer",
                    "icon": "./apps/internet-explorer/ie-paper.png",
                    "type": "iframe",
                    "url": "https://www.google.com",
                    "category": "browser",
                    "description": "Web browser",
                    "defaultSize": {
                        "width": 800,
                        "height": 600
                    },
                    "defaultPosition": {
                        "x": 130,
                        "y": 20
                    },
                    "resizable": true,
                    "minimizable": true,
                    "maximizable": true,
                    "multiInstance": true,
                    "author": "Microsoft Internet Explorer"
                },
                "paint": {
                    "name": "Paint",
                    "icon": "./apps/paint/680(16x16).png",
                    "type": "local",
                    "category": "graphics",
                    "description": "Simple drawing application",
                    "defaultSize": {
                        "width": 800,
                        "height": 600
                    },
                    "defaultPosition": {
                        "x": 280,
                        "y": 70
                    },
                    "resizable": true,
                    "minimizable": true,
                    "maximizable": true,
                    "multiInstance": true,
                    "hasMenu": true,
                    "menuData": "paint-menu.js",
                    "jsFiles": ["paint.js"],
                    "cssFiles": ["paint.css"],
                    "author": "Original from OnlineWinXP project"
                },
                "winamp": {
                    "name": "Winamp",
                    "icon": "./images/windowsIcons/winamp.png",
                    "type": "local",
                    "category": "media",
                    "description": "Classic Winamp media player",
                    "defaultSize": {
                        "width": 320,
                        "height": 200
                    },
                    "defaultPosition": {
                        "x": 10,
                        "y": 10
                    },
                    "resizable": false,
                    "minimizable": true,
                    "maximizable": false,
                    "multiInstance": false,
                    "author": "Webamp.org"
                },
                "my-computer": {
                    "name": "My Computer",
                    "icon": "./apps/my-computer/676(16x16).png",
                    "type": "local",
                    "category": "system",
                    "description": "Computer explorer",
                    "defaultSize": {
                        "width": 660,
                        "height": 500
                    },
                    "defaultPosition": {
                        "x": 250,
                        "y": 40
                    },
                    "resizable": true,
                    "minimizable": true,
                    "maximizable": true,
                    "multiInstance": false,
                    "hasMenu": true,
                    "menuData": "mycomputer-menu.js",
                    "jsFiles": ["my-computer.js"],
                    "cssFiles": ["my-computer.css"],
                    "author": "Microsoft Windows"
                },
                "gamedev": {
                    "name": "GameDev",
                    "icon": "./images/windowsIcons/folder-gamedev.png",
                    "type": "folder",
                    "category": "folder",
                    "description": "Game Development projects",
                    "defaultSize": {
                        "width": 700,
                        "height": 500
                    },
                    "defaultPosition": {
                        "x": 350,
                        "y": 100
                    },
                    "resizable": true,
                    "minimizable": true,
                    "maximizable": true,
                    "multiInstance": false,
                    "hasMenu": false,
                    "contents": [
                        {"name": "Prototypes", "type": "folder", "icon": "./images/windowsIcons/folder.png"}
                    ],
                    "author": "Windows XP"
                },
                "prototypes": {
                    "name": "Prototypes",
                    "icon": "./images/windowsIcons/folder.png",
                    "type": "folder",
                    "category": "folder",
                    "description": "Game prototypes and demos",
                    "path": "C:\\GameDev\\Prototypes",
                    "defaultSize": {
                        "width": 700,
                        "height": 500
                    },
                    "defaultPosition": {
                        "x": 400,
                        "y": 150
                    },
                    "resizable": true,
                    "minimizable": true,
                    "maximizable": true,
                    "multiInstance": false,
                    "hasMenu": false,
                    "contents": [
                        {"name": "ASCII Antihero.exe", "type": "exe", "icon": "./images/windowsIcons/application.png"},
                        {"name": "ASCII Antihero readme.txt", "type": "txt", "icon": "./images/windowsIcons/text-file.png"},
                        {"name": "Emoji Survivor.exe", "type": "exe", "icon": "./images/windowsIcons/application.png"},
                        {"name": "Emoji Survivor.txt", "type": "txt", "icon": "./images/windowsIcons/text-file.png"}
                    ],
                    "author": "GameDev Projects"
                },
                "calculator": {
                    "name": "Calculator",
                    "icon": "./images/windowsIcons/300(16x16).png",
                    "type": "local",
                    "category": "utility",
                    "description": "Windows Calculator",
                    "defaultSize": {
                        "width": 220,
                        "height": 280
                    },
                    "defaultPosition": {
                        "x": 50,
                        "y": 50
                    },
                    "resizable": false,
                    "minimizable": true,
                    "maximizable": false,
                    "multiInstance": true,
                    "hasMenu": true,
                    "menuData": "calculator-menu.js",
                    "jsFiles": ["calculator.js"],
                    "cssFiles": ["calculator.css"],
                    "author": "Microsoft"
                }
            },
            "desktopIcons": [
                {
                    "id": "internet-explorer",
                    "app": "internet-explorer",
                    "title": "Internet Explorer",
                    "icon": "./apps/internet-explorer/ie-paper.png",
                    "onDesktop": true,
                    "position": {"x": 20, "y": 20}
                },
                {
                    "id": "minesweeper",
                    "app": "minesweeper",
                    "title": "Minesweeper",
                    "icon": "./apps/minesweeper/mine-icon.png",
                    "onDesktop": true,
                    "position": {"x": 20, "y": 120}
                },
                {
                    "id": "my-computer",
                    "app": "my-computer",
                    "title": "My Computer",
                    "icon": "./apps/my-computer/676(16x16).png",
                    "onDesktop": true,
                    "position": {"x": 20, "y": 220}
                },
                {
                    "id": "notepad",
                    "app": "notepad",
                    "title": "Notepad",
                    "icon": "./apps/notepad/327(16x16).png",
                    "onDesktop": true,
                    "position": {"x": 120, "y": 20}
                },
                {
                    "id": "winamp",
                    "app": "winamp",
                    "title": "Winamp",
                    "icon": "./apps/winamp/winamp.png",
                    "onDesktop": true,
                    "position": {"x": 120, "y": 120}
                },
                {
                    "id": "paint",
                    "app": "paint",
                    "title": "Paint",
                    "icon": "./apps/paint/680(16x16).png",
                    "onDesktop": true,
                    "position": {"x": 120, "y": 220}
                },
                {
                    "id": "gamedev",
                    "app": "gamedev",
                    "title": "GameDev",
                    "icon": "./images/windowsIcons/folder-gamedev.png",
                    "onDesktop": true,
                    "position": {"x": 220, "y": 20}
                },
                {
                    "id": "calculator",
                    "app": "calculator",
                    "title": "Calculator",
                    "icon": "./images/windowsIcons/300(16x16).png",
                    "onDesktop": true,
                    "position": {"x": 220, "y": 120}
                }
            ],
            "startMenuItems": [
                {
                    "name": "Programs",
                    "icon": "./images/windowsIcons/all-programs.ico",
                    "type": "menu",
                    "items": [
                        {
                            "name": "Internet",
                            "app": "internet-explorer"
                        },
                        {
                            "name": "Minesweeper",
                            "app": "minesweeper"
                        },
                        {
                            "name": "Notepad",
                            "app": "notepad"
                        },
                        {
                            "name": "Paint",
                            "app": "paint"
                        },
                        {
                            "name": "GameDev",
                            "app": "gamedev"
                        }
                    ]
                },
                {
                    "name": "My Computer",
                    "app": "my-computer"
                },
                {
                    "name": "Control Panel",
                    "folder": "control-panel"
                },
                {
                    "name": "My Network Places",
                    "folder": "network-places"
                },
                {
                    "type": "separator"
                },
                {
                    "name": "Log Off",
                    "action": "log-off"
                },
                {
                    "name": "Turn Off Computer",
                    "action": "turn-off"
                }
            ]
        };
        console.log('Config loaded (static):', this.config);
    }

    setupDesktopIcons() {
        const desktopIconsContainer = document.getElementById('desktop-icons');
        desktopIconsContainer.innerHTML = '';

        // Применяем системные настройки иконок
        const iconSize = this.config.system?.iconSize || 32;
        const iconTextSize = this.config.system?.iconTextSize || 11;
        const desktopGridSize = this.config.system?.desktopGridSize || 80;

        // Применяем стили для иконок
        const style = document.createElement('style');
        style.textContent = `
            .desktop-icon-img-container {
                width: ${iconSize}px !important;
                height: ${iconSize}px !important;
            }
            .desktop-icon img {
                width: ${iconSize}px !important;
                height: ${iconSize}px !important;
            }
            .desktop-icon span {
                font-size: ${iconTextSize}px !important;
            }
            .desktop-icon {
                width: ${desktopGridSize}px !important;
                margin-bottom: ${desktopGridSize * 0.25}px !important;
            }
        `;
        document.head.appendChild(style);

        if (this.config.desktopIcons) {
            this.config.desktopIcons.forEach(iconConfig => {
                // Пропускаем иконки, которые не должны быть на рабочем столе
                if (!iconConfig.onDesktop) return;

                const iconDiv = document.createElement('div');
                iconDiv.className = 'desktop-icon';
                iconDiv.dataset.app = iconConfig.app;

                // Устанавливаем позицию если указана
                if (iconConfig.position) {
                    iconDiv.style.position = 'absolute';
                    iconDiv.style.left = iconConfig.position.x + 'px';
                    iconDiv.style.top = iconConfig.position.y + 'px';
                }

                iconDiv.innerHTML = `
                    <div class="desktop-icon-img-container">
                        <img src="${iconConfig.icon}" alt="${iconConfig.title}">
                    </div>
                    <div class="desktop-icon-text-container">
                        <span>${iconConfig.title}</span>
                    </div>
                `;

                iconDiv.addEventListener('dblclick', () => {
                    this.openApp(iconConfig.app);
                });

                desktopIconsContainer.appendChild(iconDiv);
            });
        }
    }

    setupStartMenu() {
        if (!this.config.startMenuItems) return;

        const programsContainer = document.getElementById('start-menu-programs');
        const placesContainer = document.getElementById('start-menu-places');

        programsContainer.innerHTML = '';
        placesContainer.innerHTML = '';

        this.config.startMenuItems.forEach(item => {
            if (item.type === 'menu') {
                // Programs menu
                const groupDiv = document.createElement('div');
                groupDiv.className = 'start-menu-group';

                if (item.name) {
                    const titleDiv = document.createElement('div');
                    titleDiv.className = 'start-menu-group-title';
                    titleDiv.textContent = item.name;
                    groupDiv.appendChild(titleDiv);
                }

                if (item.items) {
                    item.items.forEach(subItem => {
                        const itemDiv = document.createElement('div');
                        itemDiv.className = 'start-menu-item';
                        itemDiv.dataset.app = subItem.app;

                        const appConfig = this.config.apps[subItem.app];
                        const iconPath = appConfig ? appConfig.icon : './images/windowsIcons/folder.png';

                        itemDiv.innerHTML = `
                            <img src="${iconPath}" alt="">
                            <span>${subItem.name}</span>
                        `;

                        itemDiv.addEventListener('click', () => {
                            if (subItem.app) {
                                this.openApp(subItem.app);
                            }
                            this.hideStartMenu();
                        });

                        groupDiv.appendChild(itemDiv);
                    });
                }

                programsContainer.appendChild(groupDiv);
            } else if (item.type === 'separator') {
                // Separator (just skip)
            } else {
                // Places menu
                const itemDiv = document.createElement('div');
                itemDiv.className = 'start-menu-item';

                if (item.app) {
                    itemDiv.dataset.app = item.app;
                } else if (item.folder) {
                    itemDiv.dataset.folder = item.folder;
                } else if (item.action) {
                    itemDiv.id = item.action.replace('-', '-');
                }

                let iconPath = './images/windowsIcons/folder.png';
                if (item.app && this.config.apps[item.app]) {
                    iconPath = this.config.apps[item.app].icon;
                } else if (item.folder && this.config.folders[item.folder]) {
                    iconPath = this.config.folders[item.folder].icon;
                } else if (item.action === 'log-off') {
                    iconPath = './images/windowsIcons/318(16x16).png';
                } else if (item.action === 'turn-off') {
                    iconPath = './images/windowsIcons/windows-off.png';
                }

                itemDiv.innerHTML = `
                    <img src="${iconPath}" alt="">
                    <span>${item.name}</span>
                `;

                if (item.app) {
                    itemDiv.addEventListener('click', () => {
                        this.openApp(item.app);
                        this.hideStartMenu();
                    });
                } else if (item.folder) {
                    // Handle folder click
                    itemDiv.addEventListener('click', () => {
                        // TODO: Open folder
                        this.hideStartMenu();
                    });
                } else if (item.action) {
                    itemDiv.addEventListener('click', () => {
                        if (item.action === 'log-off') {
                            this.showPowerModal('log-off');
                        } else if (item.action === 'turn-off') {
                            this.showPowerModal('turn-off');
                        }
                        this.hideStartMenu();
                    });
                }

                placesContainer.appendChild(itemDiv);
            }
        });
    }

    updateClock() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
        document.getElementById('clock').textContent = timeString;

        // Update calendar time if it's visible
        if (!document.getElementById('calendar-popup').classList.contains('hidden')) {
            this.updateCalendarTime();
        }
    }

    // Calendar functionality
    toggleCalendar() {
        const popup = document.getElementById('calendar-popup');
        const volumePopup = document.getElementById('volume-popup');

        if (popup.classList.contains('hidden')) {
            this.hideVolume();
            this.showCalendar();
        } else {
            this.hideCalendar();
        }
    }

    showCalendar() {
        const popup = document.getElementById('calendar-popup');
        const now = new Date();

        // Update month/year
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                          'July', 'August', 'September', 'October', 'November', 'December'];
        document.querySelector('.calendar-month-year').textContent =
            `${monthNames[now.getMonth()]} ${now.getFullYear()}`;

        // Generate calendar days
        this.generateCalendar(now.getFullYear(), now.getMonth());

        // Update time
        this.updateCalendarTime();

        popup.classList.remove('hidden');

        // Setup navigation
        document.getElementById('prev-month').onclick = () => this.navigateMonth(-1);
        document.getElementById('next-month').onclick = () => this.navigateMonth(1);

        // Update time every second
        this.calendarTimeInterval = setInterval(() => this.updateCalendarTime(), 1000);
    }

    hideCalendar() {
        document.getElementById('calendar-popup').classList.add('hidden');
        if (this.calendarTimeInterval) {
            clearInterval(this.calendarTimeInterval);
            this.calendarTimeInterval = null;
        }
    }

    generateCalendar(year, month) {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const today = new Date();

        const grid = document.querySelector('.calendar-grid');
        // Clear existing days (keep headers)
        const existingDays = grid.querySelectorAll('.calendar-day');
        existingDays.forEach(day => day.remove());

        // Add empty cells for days before first day of month
        for (let i = 0; i < firstDay.getDay(); i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day';
            grid.appendChild(emptyDay);
        }

        // Add days of month
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = day;

            // Highlight today
            if (year === today.getFullYear() && month === today.getMonth() && day === today.getDate()) {
                dayElement.classList.add('today');
            }

            grid.appendChild(dayElement);
        }
    }

    navigateMonth(direction) {
        const currentText = document.querySelector('.calendar-month-year').textContent;
        const [monthName, year] = currentText.split(' ');
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                          'July', 'August', 'September', 'October', 'November', 'December'];
        const currentMonth = monthNames.indexOf(monthName);
        const currentYear = parseInt(year);

        let newMonth = currentMonth + direction;
        let newYear = currentYear;

        if (newMonth < 0) {
            newMonth = 11;
            newYear--;
        } else if (newMonth > 11) {
            newMonth = 0;
            newYear++;
        }

        document.querySelector('.calendar-month-year').textContent =
            `${monthNames[newMonth]} ${newYear}`;
        this.generateCalendar(newYear, newMonth);
    }

    updateCalendarTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', {
            hour12: true,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        document.getElementById('calendar-time-display').textContent = timeString;
    }

    // Volume functionality
    toggleVolume() {
        const popup = document.getElementById('volume-popup');
        const calendarPopup = document.getElementById('calendar-popup');

        if (popup.classList.contains('hidden')) {
            this.hideCalendar();
            this.showVolume();
        } else {
            this.hideVolume();
        }
    }

    showVolume() {
        const popup = document.getElementById('volume-popup');
        popup.classList.remove('hidden');

        // Setup volume slider
        const slider = document.getElementById('volume-slider');
        const level = document.querySelector('.volume-level');
        const muteCheckbox = document.getElementById('mute-checkbox');

        // Load saved volume
        const savedVolume = localStorage.getItem('winxp-volume') || 50;
        const savedMuted = localStorage.getItem('winxp-muted') === 'true';

        slider.value = savedVolume;
        level.textContent = savedVolume;
        muteCheckbox.checked = savedMuted;

        this.setVolume(savedVolume, savedMuted);

        // Remove previous event listeners
        const newSlider = slider.cloneNode(true);
        const newMuteCheckbox = muteCheckbox.cloneNode(true);

        slider.parentNode.replaceChild(newSlider, slider);
        muteCheckbox.parentNode.replaceChild(newMuteCheckbox, muteCheckbox);

        // Add new event listeners
        newSlider.addEventListener('input', (e) => {
            const value = e.target.value;
            level.textContent = value;
            localStorage.setItem('winxp-volume', value);
            this.setVolume(value, newMuteCheckbox.checked);
        });

        newMuteCheckbox.addEventListener('change', (e) => {
            const muted = e.target.checked;
            localStorage.setItem('winxp-muted', muted);
            this.setVolume(newSlider.value, muted);
        });
    }

    hideVolume() {
        document.getElementById('volume-popup').classList.add('hidden');
    }

    setVolume(level, muted) {
        const audioElements = document.querySelectorAll('audio, video');
        const volume = muted ? 0 : level / 100;

        audioElements.forEach(audio => {
            audio.volume = volume;
        });
    }
}

// Initialize desktop when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.desktop = new Desktop();
});
