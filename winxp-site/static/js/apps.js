// Application implementations

// Minesweeper - Enhanced with dropdown menu
Window.prototype.loadMinesweeper = function(contentDiv) {
    // Create dropdown menu data
    const menuData = {
        Game: [
            { type: 'item', text: 'New', hotkey: 'F2' },
            { type: 'separator' },
            { type: 'item', text: 'Beginner' },
            { type: 'item', text: 'Intermediate' },
            { type: 'item', text: 'Expert' },
            { type: 'item', text: 'Custom...', disabled: true },
            { type: 'separator' },
            { type: 'item', text: 'Marks (?)', checked: true },
            { type: 'item', text: 'Color', checked: true },
            { type: 'item', text: 'Sound', disabled: true },
            { type: 'separator' },
            { type: 'item', text: 'Best Times...', disabled: true },
            { type: 'separator' },
            { type: 'item', text: 'Exit' }
        ],
        Help: [
            { type: 'item', text: 'Contents', disabled: true, hotkey: 'F1' },
            { type: 'item', text: 'Search for Help on...', disabled: true },
            { type: 'item', text: 'Using Help', disabled: true },
            { type: 'separator' },
            { type: 'item', text: 'About Minesweeper', disabled: true }
        ]
    };

    contentDiv.innerHTML = `
        <div class="minesweeper-toolbar">
            <div class="minesweeper-menu-bar">
                <div class="minesweeper-menu-item" data-menu="Game">Game</div>
                <div class="minesweeper-menu-item" data-menu="Help">Help</div>
            </div>
        </div>
        <div class="minesweeper-dropdown-container"></div>
        <div class="minesweeper-controls">
            <div class="minesweeper-mine-count" id="minesweeper-mine-count-${this.id}">010</div>
            <div class="minesweeper-smile" id="minesweeper-smile-${this.id}">🙂</div>
            <div class="minesweeper-timer">000</div>
        </div>
        <div class="minesweeper-board" id="minesweeper-board-${this.id}"></div>
    `;

    const menuBar = contentDiv.querySelector('.minesweeper-menu-bar');
    const dropdownContainer = contentDiv.querySelector('.minesweeper-dropdown-container');

    let currentDropdown = null;

    // Handle menu clicks
    menuBar.addEventListener('click', (e) => {
        if (e.target.classList.contains('minesweeper-menu-item')) {
            const menuName = e.target.dataset.menu;
            this.showMinesweeperDropdown(menuName, menuData[menuName], e.target, dropdownContainer);
        }
    });

    // Close dropdown when clicking elsewhere
    document.addEventListener('click', (e) => {
        if (!menuBar.contains(e.target) && !dropdownContainer.contains(e.target)) {
            dropdownContainer.innerHTML = '';
            currentDropdown = null;
        }
    });

    // Load original Minesweeper implementation
    this.minesweeper = new OriginalMinesweeper(this.id);
};

// Show dropdown menu for Minesweeper
Window.prototype.showMinesweeperDropdown = function(menuName, items, menuItem, container) {
    // Close existing dropdown
    container.innerHTML = '';

    if (this.currentMinesweeperDropdown === menuName) {
        this.currentMinesweeperDropdown = null;
        return;
    }

    this.currentMinesweeperDropdown = menuName;

    const rect = menuItem.getBoundingClientRect();
    const windowRect = this.element.getBoundingClientRect();

    const dropdown = document.createElement('div');
    dropdown.className = 'minesweeper-dropdown';
    dropdown.style.position = 'absolute';
    dropdown.style.left = (rect.left - windowRect.left) + 'px';
    dropdown.style.top = (rect.bottom - windowRect.top) + 'px';
    dropdown.style.zIndex = '1000';

    items.forEach(item => {
        if (item.type === 'separator') {
            const separator = document.createElement('div');
            separator.className = 'minesweeper-dropdown-separator';
            dropdown.appendChild(separator);
        } else {
            const menuItemEl = document.createElement('div');
            menuItemEl.className = 'minesweeper-dropdown-item' + (item.disabled ? ' disabled' : '');

            // Add checkbox for checked items
            if (item.checked) {
                menuItemEl.innerHTML = `<span class="checkmark">✓</span>${item.text}`;
            } else {
                menuItemEl.textContent = item.text;
            }

            // Add hotkey if present
            if (item.hotkey) {
                const hotkeySpan = document.createElement('span');
                hotkeySpan.className = 'hotkey';
                hotkeySpan.textContent = item.hotkey;
                menuItemEl.appendChild(hotkeySpan);
            }

            if (!item.disabled) {
                menuItemEl.addEventListener('click', () => {
                    this.handleMinesweeperMenuItem(item.text);
                    container.innerHTML = '';
                    this.currentMinesweeperDropdown = null;
                });
            }

            dropdown.appendChild(menuItemEl);
        }
    });

    container.appendChild(dropdown);
};

// Handle Minesweeper menu item clicks
Window.prototype.handleMinesweeperMenuItem = function(itemText) {
    switch (itemText) {
        case 'Exit':
            this.desktop.closeWindow(this.id);
            break;
        case 'New':
            if (this.minesweeper && this.minesweeper.restart) {
                this.minesweeper.restart();
            }
            break;
        case 'Beginner':
            if (this.minesweeper && this.minesweeper.setDifficulty) {
                this.minesweeper.setDifficulty('beginner');
            }
            break;
        case 'Intermediate':
            if (this.minesweeper && this.minesweeper.setDifficulty) {
                this.minesweeper.setDifficulty('intermediate');
            }
            break;
        case 'Expert':
            if (this.minesweeper && this.minesweeper.setDifficulty) {
                this.minesweeper.setDifficulty('expert');
            }
            break;
    }
};

// Launch real Webamp player
Window.prototype.launchRealWinamp = function() {
    if (typeof Webamp === 'undefined') {
        alert('Webamp library not loaded. Please check your internet connection.');
        return;
    }

    // Check if Webamp is already running
    if (window.currentWebamp) {
        window.currentWebamp.focus();
        return;
    }

    try {
        // Create Webamp instance
        window.currentWebamp = new Webamp({
            initialTracks: winampTracks,
            initialSkin: {
                url: "./images/skins/default.wsz" // You might want to add a skin
            }
        });

        // Render Webamp
        window.currentWebamp.renderWhenReady(document.body).then(() => {
            // Webamp renders as an overlay, so we don't need to do anything special
            console.log('Webamp launched successfully');
        });

        // Handle close event
        window.currentWebamp.onClose(() => {
            window.currentWebamp = null;
        });

        // Handle minimize event
        window.currentWebamp.onMinimize(() => {
            // Webamp handles its own minimize
        });

    } catch (error) {
        console.error('Failed to launch Webamp:', error);
        alert('Failed to launch Webamp. Please try again.');
    }
};

// Calculator - Windows XP style calculator
Window.prototype.loadCalculator = function(contentDiv) {
    const calcId = `calc-${this.id}`;

    contentDiv.innerHTML = `
        <div class="calculator-container" style="padding: 10px; background: #f0f0f0;">
            <!-- Menu bar -->
            <div class="calc-menu-bar" style="height: 21px; border-bottom: 1px solid #ffffff; background: linear-gradient(to right, #ede8cd 0%, #edede5 100%); margin-bottom: 5px;">
                <div class="calc-menu-item" data-menu="View" style="padding: 0 7px; cursor: pointer; user-select: none; line-height: 20px;">View</div>
            </div>

            <!-- Display -->
            <div class="calc-display" style="background: white; border: 1px inset #c0c0c0; padding: 5px; margin-bottom: 10px; text-align: right; font-family: 'Courier New', monospace; font-size: 16px; height: 30px; overflow: hidden;">
                <span id="${calcId}-display">0</span>
            </div>

            <!-- Button grid -->
            <div class="calc-buttons" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 3px;">
                <!-- Memory buttons -->
                <button class="calc-btn calc-memory" data-action="MC">MC</button>
                <button class="calc-btn calc-memory" data-action="MR">MR</button>
                <button class="calc-btn calc-memory" data-action="MS">MS</button>
                <button class="calc-btn calc-memory" data-action="M+">M+</button>

                <!-- Row 1 -->
                <button class="calc-btn" data-action="clear">C</button>
                <button class="calc-btn" data-action="clear-entry">CE</button>
                <button class="calc-btn" data-action="backspace">⌫</button>
                <button class="calc-btn calc-operator" data-action="divide">÷</button>

                <!-- Row 2 -->
                <button class="calc-btn calc-number" data-action="7">7</button>
                <button class="calc-btn calc-number" data-action="8">8</button>
                <button class="calc-btn calc-number" data-action="9">9</button>
                <button class="calc-btn calc-operator" data-action="multiply">×</button>

                <!-- Row 3 -->
                <button class="calc-btn calc-number" data-action="4">4</button>
                <button class="calc-btn calc-number" data-action="5">5</button>
                <button class="calc-btn calc-number" data-action="6">6</button>
                <button class="calc-btn calc-operator" data-action="subtract">-</button>

                <!-- Row 4 -->
                <button class="calc-btn calc-number" data-action="1">1</button>
                <button class="calc-btn calc-number" data-action="2">2</button>
                <button class="calc-btn calc-number" data-action="3">3</button>
                <button class="calc-btn calc-operator" data-action="add">+</button>

                <!-- Row 5 -->
                <button class="calc-btn calc-number" data-action="0" style="grid-column: span 2;">0</button>
                <button class="calc-btn" data-action="decimal">.</button>
                <button class="calc-btn calc-equals" data-action="equals">=</button>
            </div>
        </div>
    `;

    // Initialize calculator
    this.initCalculator(calcId);
};

// Initialize Calculator functionality
Window.prototype.initCalculator = function(calcId) {
    const display = document.getElementById(`${calcId}-display`);
    const buttons = document.querySelectorAll('.calc-btn');

    let currentValue = '0';
    let previousValue = '';
    let operation = null;
    let memory = 0;
    let waitingForNewValue = false;

    // Update display
    function updateDisplay() {
        display.textContent = currentValue;
    }

    // Handle button clicks
    buttons.forEach(button => {
        button.addEventListener('click', (e) => {
            const action = e.target.dataset.action;
            this.handleCalculatorAction(action, calcId);
        });

        // Add button styling
        button.style.cssText = `
            height: 35px;
            border: 1px outset #c0c0c0;
            background: linear-gradient(to bottom, #f0f0f0, #d0d0d0);
            font-family: Arial, sans-serif;
            font-size: 12px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        button.addEventListener('mousedown', () => {
            button.style.border = '1px inset #c0c0c0';
            button.style.background = 'linear-gradient(to bottom, #c0c0c0, #f0f0f0)';
        });

        button.addEventListener('mouseup', () => {
            button.style.border = '1px outset #c0c0c0';
            button.style.background = 'linear-gradient(to bottom, #f0f0f0, #d0d0d0)';
        });

        button.addEventListener('mouseleave', () => {
            button.style.border = '1px outset #c0c0c0';
            button.style.background = 'linear-gradient(to bottom, #f0f0f0, #d0d0d0)';
        });
    });

    // Store calculator state
    this.calculatorState = {
        display,
        currentValue,
        previousValue,
        operation,
        memory,
        waitingForNewValue,
        updateDisplay: () => updateDisplay()
    };

    updateDisplay();
};

// Handle Calculator actions
Window.prototype.handleCalculatorAction = function(action, calcId) {
    const state = this.calculatorState;

    switch (action) {
        case '0':
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
            if (state.waitingForNewValue) {
                state.currentValue = action;
                state.waitingForNewValue = false;
            } else {
                state.currentValue = state.currentValue === '0' ? action : state.currentValue + action;
            }
            break;

        case 'decimal':
            if (state.waitingForNewValue) {
                state.currentValue = '0.';
                state.waitingForNewValue = false;
            } else if (!state.currentValue.includes('.')) {
                state.currentValue += '.';
            }
            break;

        case 'clear':
            state.currentValue = '0';
            state.previousValue = '';
            state.operation = null;
            state.waitingForNewValue = false;
            break;

        case 'clear-entry':
            state.currentValue = '0';
            break;

        case 'backspace':
            if (state.currentValue.length > 1) {
                state.currentValue = state.currentValue.slice(0, -1);
            } else {
                state.currentValue = '0';
            }
            break;

        case 'add':
        case 'subtract':
        case 'multiply':
        case 'divide':
            if (state.operation && !state.waitingForNewValue) {
                this.calculate(calcId);
            }
            state.previousValue = state.currentValue;
            state.operation = action;
            state.waitingForNewValue = true;
            break;

        case 'equals':
            if (state.operation) {
                this.calculate(calcId);
                state.operation = null;
            }
            break;

        case 'MC':
            state.memory = 0;
            break;

        case 'MR':
            state.currentValue = state.memory.toString();
            state.waitingForNewValue = true;
            break;

        case 'MS':
            state.memory = parseFloat(state.currentValue);
            state.waitingForNewValue = true;
            break;

        case 'M+':
            state.memory += parseFloat(state.currentValue);
            state.waitingForNewValue = true;
            break;
    }

    state.updateDisplay();
};

// Calculate result
Window.prototype.calculate = function(calcId) {
    const state = this.calculatorState;
    const prev = parseFloat(state.previousValue);
    const current = parseFloat(state.currentValue);
    let result;

    switch (state.operation) {
        case 'add':
            result = prev + current;
            break;
        case 'subtract':
            result = prev - current;
            break;
        case 'multiply':
            result = prev * current;
            break;
        case 'divide':
            result = current !== 0 ? prev / current : 0;
            break;
        default:
            return;
    }

    state.currentValue = result.toString();
    state.waitingForNewValue = true;
};


// Notepad - Enhanced with dropdown menus like Windows XP
Window.prototype.loadNotepad = function(contentDiv) {
    // Create dropdown menu data
    const menuData = {
        File: [
            { type: 'item', text: 'New', disabled: true },
            { type: 'item', text: 'Open...', disabled: true },
            { type: 'item', text: 'Save', disabled: true },
            { type: 'item', text: 'Save As...', disabled: true },
            { type: 'separator' },
            { type: 'item', text: 'Page Setup...', disabled: true },
            { type: 'item', text: 'Print...', disabled: true },
            { type: 'separator' },
            { type: 'item', text: 'Exit' }
        ],
        Edit: [
            { type: 'item', text: 'Undo', disabled: true },
            { type: 'separator' },
            { type: 'item', text: 'Cut', disabled: true },
            { type: 'item', text: 'Copy', disabled: true },
            { type: 'item', text: 'Paste', disabled: true },
            { type: 'item', text: 'Delete', disabled: true },
            { type: 'separator' },
            { type: 'item', text: 'Find...', disabled: true },
            { type: 'item', text: 'Find Next', disabled: true },
            { type: 'item', text: 'Replace...', disabled: true },
            { type: 'item', text: 'Go To...', disabled: true },
            { type: 'separator' },
            { type: 'item', text: 'Select All', disabled: true },
            { type: 'item', text: 'Time/Date' }
        ],
        Format: [
            { type: 'item', text: 'Word Wrap' },
            { type: 'item', text: 'Font...', disabled: true }
        ],
        View: [
            { type: 'item', text: 'Status Bar', disabled: true }
        ],
        Help: [
            { type: 'item', text: 'Help Topics', disabled: true },
            { type: 'item', text: 'About Notepad', disabled: true }
        ]
    };

    contentDiv.innerHTML = `
        <div class="notepad-toolbar">
            <div class="notepad-menu-bar">
                <div class="notepad-menu-item" data-menu="File">File</div>
                <div class="notepad-menu-item" data-menu="Edit">Edit</div>
                <div class="notepad-menu-item" data-menu="Format">Format</div>
                <div class="notepad-menu-item" data-menu="View">View</div>
                <div class="notepad-menu-item" data-menu="Help">Help</div>
            </div>
        </div>
        <div class="notepad-dropdown-container"></div>
        <textarea class="notepad-textarea" placeholder="Type here..." spellcheck="false"></textarea>
    `;

    const textarea = contentDiv.querySelector('.notepad-textarea');
    const menuBar = contentDiv.querySelector('.notepad-menu-bar');
    const dropdownContainer = contentDiv.querySelector('.notepad-dropdown-container');

    textarea.focus();

    let wordWrap = false;
    let currentDropdown = null;

    // Handle menu clicks
    menuBar.addEventListener('click', (e) => {
        if (e.target.classList.contains('notepad-menu-item')) {
            const menuName = e.target.dataset.menu;
            this.showNotepadDropdown(menuName, menuData[menuName], e.target, dropdownContainer, textarea);
        }
    });

    // Close dropdown when clicking elsewhere
    document.addEventListener('click', (e) => {
        if (!menuBar.contains(e.target) && !dropdownContainer.contains(e.target)) {
            dropdownContainer.innerHTML = '';
            currentDropdown = null;
        }
    });

    // Handle tab key
    textarea.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const text = textarea.value;
            textarea.value = text.substring(0, start) + '\t' + text.substring(end);
            textarea.selectionStart = textarea.selectionEnd = start + 1;
        }
    });

    // Store menu data for later use
    this.notepadMenuData = menuData;
    this.notepadWordWrap = wordWrap;
    this.notepadTextarea = textarea;
    this.notepadDropdownContainer = dropdownContainer;
};

// Show dropdown menu for Notepad
Window.prototype.showNotepadDropdown = function(menuName, items, menuItem, container, textarea) {
    // Close existing dropdown
    container.innerHTML = '';

    if (this.currentNotepadDropdown === menuName) {
        this.currentNotepadDropdown = null;
        return;
    }

    this.currentNotepadDropdown = menuName;

    const rect = menuItem.getBoundingClientRect();
    const windowRect = this.element.getBoundingClientRect();

    const dropdown = document.createElement('div');
    dropdown.className = 'notepad-dropdown';
    dropdown.style.position = 'absolute';
    dropdown.style.left = (rect.left - windowRect.left) + 'px';
    dropdown.style.top = (rect.bottom - windowRect.top) + 'px';
    dropdown.style.zIndex = '1000';

    items.forEach(item => {
        if (item.type === 'separator') {
            const separator = document.createElement('div');
            separator.className = 'notepad-dropdown-separator';
            dropdown.appendChild(separator);
        } else {
            const menuItemEl = document.createElement('div');
            menuItemEl.className = 'notepad-dropdown-item' + (item.disabled ? ' disabled' : '');
            menuItemEl.textContent = item.text;

            if (!item.disabled) {
                menuItemEl.addEventListener('click', () => {
                    this.handleNotepadMenuItem(item.text, textarea);
                    container.innerHTML = '';
                    this.currentNotepadDropdown = null;
                });
            }

            dropdown.appendChild(menuItemEl);
        }
    });

    container.appendChild(dropdown);
};

// Handle Notepad menu item clicks
Window.prototype.handleNotepadMenuItem = function(itemText, textarea) {
    switch (itemText) {
        case 'Exit':
            this.desktop.closeWindow(this.id);
            break;
        case 'Word Wrap':
            this.notepadWordWrap = !this.notepadWordWrap;
            textarea.style.whiteSpace = this.notepadWordWrap ? 'normal' : 'nowrap';
            textarea.style.overflowWrap = this.notepadWordWrap ? 'break-word' : 'normal';
            break;
        case 'Time/Date':
            const now = new Date();
            const timeString = now.toLocaleTimeString() + ' ' + now.toLocaleDateString();
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const text = textarea.value;
            textarea.value = text.substring(0, start) + timeString + text.substring(end);
            textarea.selectionStart = textarea.selectionEnd = start + timeString.length;
            break;
    }
};

Window.prototype.handleNotepadMenu = function(menuItem, textarea) {
    switch (menuItem) {
        case 'File':
            // Could show file menu options
            break;
        case 'Edit':
            // Could show edit menu options
            break;
        case 'View':
            // Toggle word wrap
            textarea.style.whiteSpace = textarea.style.whiteSpace === 'pre' ? 'pre-wrap' : 'pre';
            break;
        case 'Help':
            // Could show help
            break;
    }
};

// Internet Explorer - Original implementation from OnlineWinXP-master
Window.prototype.loadInternetExplorer = function(contentDiv) {
    contentDiv.innerHTML = `
        <div class="ie-toolbar">
            <div class="ie-toolbar-section">
                <button class="ie-button" title="Back">
                    <img src=".//apps/internet-explorer/back.png" alt="Back">
                </button>
                <button class="ie-button" title="Forward">
                    <img src=".//apps/internet-explorer/forward.png" alt="Forward">
                </button>
                <button class="ie-button ie-stop" title="Stop">
                    <img src=".//apps/internet-explorer/stop.png" alt="Stop">
                </button>
                <button class="ie-button ie-refresh" title="Refresh">
                    <img src=".//apps/internet-explorer/refresh.png" alt="Refresh">
                </button>
                <button class="ie-button ie-home" title="Home">
                    <img src=".//apps/internet-explorer/home.png" alt="Home">
                </button>
            </div>
            <div class="ie-toolbar-section">
                <button class="ie-button" title="Search">
                    <img src=".//apps/internet-explorer/search.png" alt="Search">
                </button>
                <button class="ie-button" title="Favorites">
                    <img src=".//apps/internet-explorer/favorite.png" alt="Favorites">
                </button>
                <button class="ie-button" title="History">
                    <img src=".//apps/internet-explorer/history.png" alt="History">
                </button>
                <button class="ie-button" title="Mail">
                    <img src=".//apps/internet-explorer/mail.png" alt="Mail">
                </button>
                <button class="ie-button" title="Print">
                    <img src=".//apps/internet-explorer/printer.png" alt="Print">
                </button>
                <button class="ie-button" title="Edit">
                    <img src=".//apps/internet-explorer/edit.png" alt="Edit">
                </button>
            </div>
        </div>
        <div class="ie-address-bar-container">
            <span class="ie-address-label">Address:</span>
            <div class="ie-address-input-container">
                <input type="text" class="ie-address-bar" value="https://www.google.com" readonly>
                <button class="ie-go-button" title="Go">
                    <img src=".//apps/internet-explorer/go.png" alt="Go">
                </button>
            </div>
        </div>
        <div class="ie-content-area">
            <div class="ie-main-page">
                <div class="ie-logo">
                    <img src=".//apps/internet-explorer/windows.png" alt="Windows">
                    <div class="ie-title">Windows</div>
                </div>
                <div class="ie-search-container">
                    <div class="ie-search-box">
                        <input type="text" class="ie-search-input" placeholder="Search the Web">
                        <button class="ie-search-button">Search</button>
                    </div>
                    <div class="ie-links">
                        <a href="#" class="ie-link">
                            <img src=".//apps/internet-explorer/search.png" alt="">
                            <span>Search the Web</span>
                        </a>
                        <a href="#" class="ie-link">
                            <img src=".//apps/internet-explorer/links.png" alt="">
                            <span>Best of the Web</span>
                        </a>
                        <a href="#" class="ie-link">
                            <img src=".//apps/internet-explorer/earth.png" alt="">
                            <span>Go to a Website</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Add event listeners
    const searchInput = contentDiv.querySelector('.ie-search-input');
    const searchButton = contentDiv.querySelector('.ie-search-button');

    if (searchInput && searchButton) {
        searchButton.addEventListener('click', () => {
            const query = searchInput.value.trim();
            if (query) {
                this.searchInternet(query);
            }
        });

        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = searchInput.value.trim();
                if (query) {
                    this.searchInternet(query);
                }
            }
        });
    }
};

Window.prototype.searchInternet = function(query) {
    const contentArea = this.element.querySelector('.ie-content-area');
    contentArea.innerHTML = `
        <div class="ie-search-results">
            <div class="ie-search-header">
                <h2>Search Results for: "${query}"</h2>
                <p>Displaying results from Google-like search engine</p>
            </div>
            <div class="ie-results-list">
                <div class="ie-result-item">
                    <h3><a href="#">${query} - Wikipedia</a></h3>
                    <p>The free encyclopedia that anyone can edit. Information about ${query}...</p>
                    <span class="ie-result-url">https://en.wikipedia.org/wiki/${query}</span>
                </div>
                <div class="ie-result-item">
                    <h3><a href="#">${query} - Official Website</a></h3>
                    <p>Official website and information about ${query}...</p>
                    <span class="ie-result-url">https://www.${query}.com</span>
                </div>
                <div class="ie-result-item">
                    <h3><a href="#">${query} News</a></h3>
                    <p>Latest news and updates about ${query}...</p>
                    <span class="ie-result-url">https://news.${query}.com</span>
                </div>
            </div>
        </div>
    `;
};

// Paint - Original implementation from OnlineWinXP-master (jspaint.app)
Window.prototype.loadPaint = function(contentDiv) {
    contentDiv.innerHTML = `
        <div style="width: 100%; height: 100%; position: relative; background-color: rgb(192,192,192);">
            <iframe
                src="https://jspaint.app"
                frameborder="0"
                title="Paint"
                style="display: block; width: 100%; height: 100%; background-color: rgb(192,192,192);"
            ></iframe>
        </div>
    `;
};

// Winamp - Real Webamp integration
Window.prototype.loadWinamp = function(contentDiv) {
    const winampId = `winamp-${this.id}`;

    // Create container for Webamp
    contentDiv.innerHTML = `
        <div id="${winampId}-container" style="width: 100%; height: 100%; position: relative; overflow: hidden;">
            <div style="position: absolute; top: 10px; left: 10px; right: 10px; bottom: 10px; background: rgba(192, 192, 192, 0.9); border: 1px solid #666; display: flex; align-items: center; justify-content: center; font-family: Arial, sans-serif;">
                <div style="text-align: center;">
                    <div style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">🎵 Winamp</div>
                    <div style="font-size: 12px; color: #666;">Loading Webamp player...</div>
                    <button id="${winampId}-launch" style="margin-top: 10px; padding: 5px 15px; background: #0054e3; color: white; border: 1px outset #c0c0c0; cursor: pointer;">Launch Winamp</button>
                </div>
            </div>
        </div>
    `;

    // Initialize Webamp when button is clicked
    const launchBtn = document.getElementById(`${winampId}-launch`);
    if (launchBtn) {
        launchBtn.addEventListener('click', () => {
            this.launchRealWinamp();
        });
    }
};

// Initialize Winamp interactive features
Window.prototype.initWinamp = function(winampId) {
    const container = document.getElementById(winampId);
    if (!container) return;

    let isPlaying = false;
    let currentTrack = 0;
    let progressInterval = null;
    let progress = 0;

    const tracks = [
        "1. Heroines - Diablo Swing Orchestra",
        "2. We Are Going To Eclecfunk Your Ass - Eclectek",
        "3. Seventeen - Auto-Pilot",
        "4. Microphone - Muha",
        "5. Stumble - Just Plain Ant",
        "6. God Damn - Sleaze",
        "7. Hola Hola Bossa Nova - Juanitos",
        "8. Resolutions (Chris Summer Remix) - Entertainment for the Braindead",
        "9. Trail - Nobara Hayakawa",
        "10. Tongue Tied - Paper Navy"
    ];

    const trackDisplay = document.getElementById(`${winampId}-track`);
    const progressBar = document.getElementById(`${winampId}-progress-bar`);
    const playBtn = document.getElementById(`${winampId}-play`);
    const pauseBtn = document.getElementById(`${winampId}-pause`);
    const stopBtn = document.getElementById(`${winampId}-stop`);
    const prevBtn = document.getElementById(`${winampId}-prev`);
    const nextBtn = document.getElementById(`${winampId}-next`);

    // Button event handlers
    playBtn.addEventListener('click', () => {
        if (!isPlaying) {
            isPlaying = true;
            playBtn.style.background = '#a4a4a4';
            pauseBtn.style.background = '#c4c4c4';
            stopBtn.style.background = '#c4c4c4';
            startProgress();
        }
    });

    pauseBtn.addEventListener('click', () => {
        isPlaying = false;
        playBtn.style.background = '#c4c4c4';
        pauseBtn.style.background = '#a4a4a4';
        stopBtn.style.background = '#c4c4c4';
        stopProgress();
    });

    stopBtn.addEventListener('click', () => {
        isPlaying = false;
        progress = 0;
        progressBar.style.width = '0%';
        playBtn.style.background = '#c4c4c4';
        pauseBtn.style.background = '#c4c4c4';
        stopBtn.style.background = '#a4a4a4';
        stopProgress();
    });

    prevBtn.addEventListener('click', () => {
        currentTrack = (currentTrack - 1 + tracks.length) % tracks.length;
        trackDisplay.textContent = tracks[currentTrack];
        if (isPlaying) {
            progress = 0;
            progressBar.style.width = '0%';
        }
    });

    nextBtn.addEventListener('click', () => {
        currentTrack = (currentTrack + 1) % tracks.length;
        trackDisplay.textContent = tracks[currentTrack];
        if (isPlaying) {
            progress = 0;
            progressBar.style.width = '0%';
        }
    });

    // Progress simulation
    function startProgress() {
        if (progressInterval) clearInterval(progressInterval);
        progressInterval = setInterval(() => {
            progress += 0.5;
            if (progress >= 100) {
                progress = 0;
                currentTrack = (currentTrack + 1) % tracks.length;
                trackDisplay.textContent = tracks[currentTrack];
            }
            progressBar.style.width = progress + '%';
        }, 100);
    }

    function stopProgress() {
        if (progressInterval) {
            clearInterval(progressInterval);
            progressInterval = null;
        }
    }

    // Button hover effects
    const buttons = container.querySelectorAll('.winamp-btn');
    buttons.forEach(btn => {
        btn.addEventListener('mousedown', () => {
            btn.style.border = '1px inset #c4c4c4';
            btn.style.background = '#a4a4a4';
        });
        btn.addEventListener('mouseup', () => {
            btn.style.border = '1px outset #c4c4c4';
            btn.style.background = '#c4c4c4';
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.border = '1px outset #c4c4c4';
            btn.style.background = '#c4c4c4';
        });
    });
};

                <!-- Volume and Balance -->
                <div style="display: flex; gap: 2px;">
                    <div style="flex: 1;">
                        <div style="font-size: 8px; margin-bottom: 1px; color: #000;">VOLUME</div>
                        <div style="background: #c0c0c0; border: 1px inset #c0c0c0; height: 8px;">
                            <div style="background: #0054e3; height: 100%; width: 70%;"></div>
                        </div>
                    </div>
                    <div style="flex: 1;">
                        <div style="font-size: 8px; margin-bottom: 1px; color: #000;">BALANCE</div>
                        <div style="background: #c0c0c0; border: 1px inset #c0c0c0; height: 8px;">
                            <div style="background: #0054e3; height: 100%; width: 50%;"></div>
                        </div>
                    </div>
                </div>

                <!-- Equalizer Toggle -->
                <div style="position: absolute; top: 2px; right: 2px; font-size: 7px; color: #666;">
                    EQ
                </div>
            </div>
        </div>
    `;
};

// My Computer
Window.prototype.loadMyComputer = function(contentDiv) {
    contentDiv.innerHTML = `
        <div class="mycomputer-container">
            <!-- Toolbar -->
            <div class="com__toolbar">
                <div class="com__options">
                    <div class="com__menu-bar">
                        <div class="com__menu-item" data-menu="File">File</div>
                        <div class="com__menu-item" data-menu="Edit">Edit</div>
                        <div class="com__menu-item" data-menu="View">View</div>
                        <div class="com__menu-item" data-menu="Favorites">Favorites</div>
                        <div class="com__menu-item" data-menu="Tools">Tools</div>
                        <div class="com__menu-item" data-menu="Help">Help</div>
                    </div>
                </div>
                <img class="com__windows-logo" src="./images/windowsIcons/windows.png" alt="windows" />
            </div>

            <!-- Function bar -->
            <div class="com__function_bar">
                <div class="com__function_bar__button--disable">
                    <img class="com__function_bar__icon" src="./images/windowsIcons/back.png" alt="" />
                    <span class="com__function_bar__text">Back</span>
                    <div class="com__function_bar__arrow"></div>
                </div>
                <div class="com__function_bar__button--disable">
                    <img class="com__function_bar__icon" src="./images/windowsIcons/forward.png" alt="" />
                    <div class="com__function_bar__arrow"></div>
                </div>
                <div class="com__function_bar__button">
                    <img class="com__function_bar__icon--normalize" src="./images/windowsIcons/up.png" alt="" />
                </div>
                <div class="com__function_bar__separate"></div>
                <div class="com__function_bar__button">
                    <img class="com__function_bar__icon--normalize" src="./images/windowsIcons/search.png" alt="" />
                    <span class="com__function_bar__text">Search</span>
                </div>
                <div class="com__function_bar__button">
                    <img class="com__function_bar__icon--normalize" src="./images/windowsIcons/folder-open.png" alt="" />
                    <span class="com__function_bar__text">Folders</span>
                </div>
                <div class="com__function_bar__separate"></div>
                <div class="com__function_bar__button">
                    <img class="com__function_bar__icon--margin12" src="./images/windowsIcons/menu.png" alt="" />
                    <div class="com__function_bar__arrow"></div>
                </div>
            </div>

            <!-- Address bar -->
            <div class="com__address_bar">
                <div class="com__address_bar__title">Address</div>
                <div class="com__address_bar__content">
                    <img src="./images/windowsIcons/676(16x16).png" alt="computer" class="com__address_bar__content__img" />
                    <div class="com__address_bar__content__text">Abstract Computer</div>
                    <img src="./images/windowsIcons/dropdown.png" alt="dropdown" class="com__address_bar__content__img" />
                </div>
                <div class="com__address_bar__go">
                    <img class="com__address_bar__go__img" src="./images/windowsIcons/go.png" alt="go" />
                    <span class="com__address_bar__go__text">Go</span>
                </div>
            </div>

            <!-- Main content -->
            <div class="com__content">
                <div class="com__content__inner">
                    <!-- Left panel -->
                    <div class="com__content__left">
                        <!-- System Tasks -->
                        <div class="com__content__left__card">
                            <div class="com__content__left__card__header">
                                <div class="com__content__left__card__header__text">System Tasks</div>
                                <img src="./images/windowsIcons/pullup.png" alt="" class="com__content__left__card__header__img" />
                            </div>
                            <div class="com__content__left__card__content">
                                <div class="com__content__left__card__row">
                                    <img class="com__content__left__card__img" src="./images/windowsIcons/view-info.png" alt="view" />
                                    <div class="com__content__left__card__text link">View system information</div>
                                </div>
                                <div class="com__content__left__card__row">
                                    <img class="com__content__left__card__img" src="./images/windowsIcons/add-remove.png" alt="remove" />
                                    <div class="com__content__left__card__text link">Add or remove programs</div>
                                </div>
                                <div class="com__content__left__card__row">
                                    <img class="com__content__left__card__img" src="./images/windowsIcons/control-panel.png" alt="control" />
                                    <div class="com__content__left__card__text link">Change a setting</div>
                                </div>
                            </div>
                        </div>

                        <!-- Other Places -->
                        <div class="com__content__left__card">
                            <div class="com__content__left__card__header">
                                <div class="com__content__left__card__header__text">Other Places</div>
                                <img src="./images/windowsIcons/pullup.png" alt="" class="com__content__left__card__header__img" />
                            </div>
                            <div class="com__content__left__card__content">
                                <div class="com__content__left__card__row">
                                    <img class="com__content__left__card__img" src="./images/windowsIcons/network.png" alt="network" />
                                    <div class="com__content__left__card__text link">My Network Places</div>
                                </div>
                                <div class="com__content__left__card__row">
                                    <img class="com__content__left__card__img" src="./images/windowsIcons/documents.png" alt="document" />
                                    <div class="com__content__left__card__text link">My Documents</div>
                                </div>
                                <div class="com__content__left__card__row">
                                    <img class="com__content__left__card__img" src="./images/windowsIcons/folder.png" alt="folder" />
                                    <div class="com__content__left__card__text link">Shared Documents</div>
                                </div>
                                <div class="com__content__left__card__row">
                                    <img class="com__content__left__card__img" src="./images/windowsIcons/control-panel.png" alt="control" />
                                    <div class="com__content__left__card__text link">Control Panel</div>
                                </div>
                            </div>
                        </div>

                        <!-- Details -->
                        <div class="com__content__left__card">
                            <div class="com__content__left__card__header">
                                <div class="com__content__left__card__header__text">Details</div>
                                <img src="./images/windowsIcons/pullup.png" alt="" class="com__content__left__card__header__img" />
                            </div>
                            <div class="com__content__left__card__content">
                                <div class="com__content__left__card__row">
                                    <div class="com__content__left__card__text">Welcome to Windows XP!</div>
                                </div>
                                <div class="com__content__left__card__row">
                                    <div class="com__content__left__card__text">This is a web-based simulation</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Right panel -->
                    <div class="com__content__right">
                        <!-- Files Stored on This Computer -->
                        <div class="com__content__right__card">
                            <div class="com__content__right__card__header">Files Stored on This Computer</div>
                            <div class="com__content__right__card__content">
                                <div class="com__content__right__card__item">
                                    <img src="./images/windowsIcons/folder.png" alt="folder" class="com__content__right__card__img" />
                                    <div class="com__content__right__card__text">Shared Documents</div>
                                </div>
                                <div class="com__content__right__card__item">
                                    <img src="./images/windowsIcons/folder.png" alt="folder" class="com__content__right__card__img" />
                                    <div class="com__content__right__card__text">User's Documents</div>
                                </div>
                            </div>
                        </div>

                        <!-- Hard Disk Drives -->
                        <div class="com__content__right__card">
                            <div class="com__content__right__card__header">Hard Disk Drives</div>
                            <div class="com__content__right__card__content">
                                <div class="com__content__right__card__item">
                                    <img src="./images/windowsIcons/hard-drive.png" alt="disk" class="com__content__right__card__img" />
                                    <div class="com__content__right__card__text">Local Disk (C:)</div>
                                </div>
                            </div>
                        </div>

                        <!-- Devices with Removable Storage -->
                        <div class="com__content__right__card">
                            <div class="com__content__right__card__header">Devices with Removable Storage</div>
                            <div class="com__content__right__card__content">
                                <div class="com__content__right__card__item">
                                    <img src="./images/windowsIcons/cd-drive.png" alt="cd" class="com__content__right__card__img" />
                                    <div class="com__content__right__card__text">CD Drive (D:)</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Initialize menu functionality
    this.initMyComputerMenus(contentDiv);
};
                    <img src="./images/windowsIcons/hard-drive.png" alt="">
                    <span>Local Disk (C:)</span>
                </div>
            </div>
        </div>
    `;

    // Add click handlers for folders
    contentDiv.querySelectorAll('.folder-item').forEach(item => {
        item.addEventListener('dblclick', () => {
            alert('This folder is not accessible in the demo.');
        });
    });
};

// Initialize My Computer menu functionality
Window.prototype.initMyComputerMenus = function(contentDiv) {
    const menuBar = contentDiv.querySelector('.com__menu-bar');
    let currentDropdown = null;

    // Handle menu clicks
    menuBar.addEventListener('click', (e) => {
        if (e.target.classList.contains('com__menu-item')) {
            const menuName = e.target.dataset.menu;
            this.showMyComputerDropdown(menuName, e.target, contentDiv);
        }
    });

    // Close dropdown when clicking elsewhere
    document.addEventListener('click', (e) => {
        if (!menuBar.contains(e.target) && !contentDiv.querySelector('.com__dropdown-container')?.contains(e.target)) {
            const container = contentDiv.querySelector('.com__dropdown-container');
            if (container) container.innerHTML = '';
            currentDropdown = null;
        }
    });

    // Add click handlers for links
    const links = contentDiv.querySelectorAll('.link');
    links.forEach(link => {
        link.addEventListener('click', () => {
            // Show message for demo purposes
            this.desktop.createWindow('Error', {
                name: 'System Information',
                icon: '/images/windowsIcons/897(16x16).png',
                type: 'local',
                defaultSize: { width: 300, height: 150 },
                defaultPosition: { x: 200, y: 200 }
            }, (contentDiv) => {
                contentDiv.innerHTML = `
                    <div style="padding: 20px; text-align: center; font-family: Arial, sans-serif;">
                        <div style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">${link.textContent}</div>
                        <div style="font-size: 12px; color: #666;">This feature is not implemented in this demo.</div>
                        <button onclick="this.closest('.window').querySelector('.close').click()" style="margin-top: 15px; padding: 5px 15px;">OK</button>
                    </div>
                `;
            });
        });
    });
};

// Show dropdown menu for My Computer
Window.prototype.showMyComputerDropdown = function(menuName, menuItem, contentDiv) {
    // Create or get dropdown container
    let container = contentDiv.querySelector('.com__dropdown-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'com__dropdown-container';
        contentDiv.appendChild(container);
    }

    // Close existing dropdown
    container.innerHTML = '';

    if (this.currentMyComputerDropdown === menuName) {
        this.currentMyComputerDropdown = null;
        return;
    }

    this.currentMyComputerDropdown = menuName;

    const rect = menuItem.getBoundingClientRect();
    const windowRect = this.element.getBoundingClientRect();

    const dropdown = document.createElement('div');
    dropdown.className = 'com__dropdown';
    dropdown.style.position = 'absolute';
    dropdown.style.left = (rect.left - windowRect.left) + 'px';
    dropdown.style.top = (rect.bottom - windowRect.top) + 'px';
    dropdown.style.zIndex = '1000';

    // Define menu items based on menu name
    const menuData = {
        File: [
            { type: 'item', text: 'Create Shortcut', disabled: true },
            { type: 'item', text: 'Delete', disabled: true },
            { type: 'item', text: 'Rename', disabled: true },
            { type: 'separator' },
            { type: 'item', text: 'Properties', disabled: true },
            { type: 'separator' },
            { type: 'item', text: 'Close' }
        ],
        Edit: [
            { type: 'item', text: 'Undo', disabled: true },
            { type: 'separator' },
            { type: 'item', text: 'Cut', disabled: true },
            { type: 'item', text: 'Copy', disabled: true },
            { type: 'item', text: 'Paste', disabled: true },
            { type: 'item', text: 'Paste Shortcut', disabled: true },
            { type: 'separator' },
            { type: 'item', text: 'Select All', disabled: true },
            { type: 'item', text: 'Invert Selection', disabled: true }
        ],
        View: [
            { type: 'item', text: 'Toolbars', submenu: true },
            { type: 'item', text: 'Status Bar', disabled: true },
            { type: 'separator' },
            { type: 'item', text: 'Large Icons', disabled: true },
            { type: 'item', text: 'Small Icons', disabled: true },
            { type: 'item', text: 'List', disabled: true },
            { type: 'item', text: 'Details', disabled: true },
            { type: 'separator' },
            { type: 'item', text: 'Arrange Icons by', submenu: true },
            { type: 'item', text: 'Refresh' }
        ],
        Favorites: [
            { type: 'item', text: 'Add to Favorites', disabled: true },
            { type: 'item', text: 'Organize Favorites...', disabled: true }
        ],
        Tools: [
            { type: 'item', text: 'Map Network Drive...', disabled: true },
            { type: 'item', text: 'Disconnect Network Drive...', disabled: true },
            { type: 'item', text: 'Synchronize...', disabled: true },
            { type: 'separator' },
            { type: 'item', text: 'Folder Options...', disabled: true }
        ],
        Help: [
            { type: 'item', text: 'Help and Support Center', disabled: true },
            { type: 'separator' },
            { type: 'item', text: 'About Windows', disabled: true }
        ]
    };

    const items = menuData[menuName] || [];

    items.forEach(item => {
        if (item.type === 'separator') {
            const separator = document.createElement('div');
            separator.className = 'com__dropdown-separator';
            dropdown.appendChild(separator);
        } else {
            const menuItemEl = document.createElement('div');
            menuItemEl.className = 'com__dropdown-item' + (item.disabled ? ' disabled' : '');

            menuItemEl.innerHTML = `
                <span class="com__dropdown-text">${item.text}</span>
                ${item.hotkey ? `<span class="com__dropdown-hotkey">${item.hotkey}</span>` : ''}
                ${item.submenu ? '<span class="com__dropdown-arrow">▶</span>' : ''}
            `;

            if (!item.disabled) {
                menuItemEl.addEventListener('click', () => {
                    this.handleMyComputerMenuItem(item.text);
                    container.innerHTML = '';
                    this.currentMyComputerDropdown = null;
                });
            }

            dropdown.appendChild(menuItemEl);
        }
    });

    container.appendChild(dropdown);
};

// Handle My Computer menu item clicks
Window.prototype.handleMyComputerMenuItem = function(itemText) {
    switch (itemText) {
        case 'Close':
            this.desktop.closeWindow(this.id);
            break;
        case 'Refresh':
            // Simple refresh - could reload content
            break;
    }
};
