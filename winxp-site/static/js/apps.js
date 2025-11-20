// Application implementations

// Minesweeper - Original implementation from OnlineWinXP-master
Window.prototype.loadMinesweeper = function(contentDiv) {
    contentDiv.innerHTML = `
        <div class="minesweeper-controls">
            <div class="minesweeper-mine-count" id="minesweeper-mine-count-${this.id}">010</div>
            <div class="minesweeper-smile" id="minesweeper-smile-${this.id}">🙂</div>
            <div class="minesweeper-timer">000</div>
        </div>
        <div class="minesweeper-board" id="minesweeper-board-${this.id}"></div>
    `;

    // Load original Minesweeper implementation
    this.minesweeper = new OriginalMinesweeper(this.id);
};


// Notepad - Original implementation from OnlineWinXP-master
Window.prototype.loadNotepad = function(contentDiv) {
    contentDiv.innerHTML = `
        <div class="notepad-toolbar">
            <div class="notepad-menu">
                <div class="notepad-menu-item">File</div>
                <div class="notepad-menu-item">Edit</div>
                <div class="notepad-menu-item">View</div>
                <div class="notepad-menu-item">Help</div>
            </div>
        </div>
        <textarea class="notepad-textarea" placeholder="Type here..."></textarea>
    `;

    const textarea = contentDiv.querySelector('.notepad-textarea');
    textarea.focus();

    // Add menu functionality
    const menuItems = contentDiv.querySelectorAll('.notepad-menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            this.handleNotepadMenu(e.target.textContent, textarea);
        });
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
                    <img src="/static/apps/internet-explorer/back.png" alt="Back">
                </button>
                <button class="ie-button" title="Forward">
                    <img src="/static/apps/internet-explorer/forward.png" alt="Forward">
                </button>
                <button class="ie-button ie-stop" title="Stop">
                    <img src="/static/apps/internet-explorer/stop.png" alt="Stop">
                </button>
                <button class="ie-button ie-refresh" title="Refresh">
                    <img src="/static/apps/internet-explorer/refresh.png" alt="Refresh">
                </button>
                <button class="ie-button ie-home" title="Home">
                    <img src="/static/apps/internet-explorer/home.png" alt="Home">
                </button>
            </div>
            <div class="ie-toolbar-section">
                <button class="ie-button" title="Search">
                    <img src="/static/apps/internet-explorer/search.png" alt="Search">
                </button>
                <button class="ie-button" title="Favorites">
                    <img src="/static/apps/internet-explorer/favorite.png" alt="Favorites">
                </button>
                <button class="ie-button" title="History">
                    <img src="/static/apps/internet-explorer/history.png" alt="History">
                </button>
                <button class="ie-button" title="Mail">
                    <img src="/static/apps/internet-explorer/mail.png" alt="Mail">
                </button>
                <button class="ie-button" title="Print">
                    <img src="/static/apps/internet-explorer/printer.png" alt="Print">
                </button>
                <button class="ie-button" title="Edit">
                    <img src="/static/apps/internet-explorer/edit.png" alt="Edit">
                </button>
            </div>
        </div>
        <div class="ie-address-bar-container">
            <span class="ie-address-label">Address:</span>
            <div class="ie-address-input-container">
                <input type="text" class="ie-address-bar" value="https://www.google.com" readonly>
                <button class="ie-go-button" title="Go">
                    <img src="/static/apps/internet-explorer/go.png" alt="Go">
                </button>
            </div>
        </div>
        <div class="ie-content-area">
            <div class="ie-main-page">
                <div class="ie-logo">
                    <img src="/static/apps/internet-explorer/windows.png" alt="Windows">
                    <div class="ie-title">Windows</div>
                </div>
                <div class="ie-search-container">
                    <div class="ie-search-box">
                        <input type="text" class="ie-search-input" placeholder="Search the Web">
                        <button class="ie-search-button">Search</button>
                    </div>
                    <div class="ie-links">
                        <a href="#" class="ie-link">
                            <img src="/static/apps/internet-explorer/search.png" alt="">
                            <span>Search the Web</span>
                        </a>
                        <a href="#" class="ie-link">
                            <img src="/static/apps/internet-explorer/links.png" alt="">
                            <span>Best of the Web</span>
                        </a>
                        <a href="#" class="ie-link">
                            <img src="/static/apps/internet-explorer/earth.png" alt="">
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

// Winamp - Original implementation from OnlineWinXP-master (Webamp library)
Window.prototype.loadWinamp = function(contentDiv) {
    // Since Webamp is a complex library, we'll create a simple interface
    // that looks like Winamp but doesn't actually play music
    contentDiv.innerHTML = `
        <div style="position: fixed; left: 0; top: 0; right: 0; bottom: 0; background: #c0c0c0; font-family: 'MS Sans Serif', sans-serif;">
            <div style="position: absolute; left: 10px; top: 10px; width: 275px; height: 116px; background: linear-gradient(135deg, #d0d0d0 0%, #c0c0c0 50%, #a0a0a0 100%); border: 2px outset #c0c0c0; padding: 2px;">
                <!-- Winamp Title Bar -->
                <div style="background: linear-gradient(90deg, #0054e3 0%, #0033a0 100%); color: white; font-size: 11px; font-weight: bold; padding: 1px 4px; margin-bottom: 2px; text-align: center;">
                    Winamp
                </div>

                <!-- Main Display -->
                <div style="background: black; color: #00ff00; font-family: monospace; font-size: 9px; padding: 2px; margin-bottom: 2px; height: 24px; display: flex; align-items: center;">
                    <span>1. Song Title - Artist</span>
                </div>

                <!-- Control Buttons -->
                <div style="display: flex; gap: 1px; margin-bottom: 2px;">
                    <button style="width: 23px; height: 18px; background: #c0c0c0; border: 1px outset #c0c0c0; font-size: 8px;">⏮</button>
                    <button style="width: 28px; height: 18px; background: #c0c0c0; border: 1px outset #c0c0c0; font-size: 8px;">▶</button>
                    <button style="width: 28px; height: 18px; background: #c0c0c0; border: 1px outset #c0c0c0; font-size: 8px;">⏸</button>
                    <button style="width: 23px; height: 18px; background: #c0c0c0; border: 1px outset #c0c0c0; font-size: 8px;">⏹</button>
                    <button style="width: 23px; height: 18px; background: #c0c0c0; border: 1px outset #c0c0c0; font-size: 8px;">⏭</button>
                </div>

                <!-- Progress Bar -->
                <div style="background: #c0c0c0; border: 1px inset #c0c0c0; height: 8px; margin-bottom: 2px;">
                    <div style="background: #0054e3; height: 100%; width: 30%;"></div>
                </div>

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
        <div class="my-computer-content">
            <div class="my-computer-header">
                <img src="/static/images/windowsIcons/676(16x16).png" alt="" style="margin-right: 10px;">
                Abstract Computer
            </div>
            <div class="my-computer-folders">
                <div class="folder-item">
                    <img src="/static/images/windowsIcons/folder.png" alt="">
                    <span>My Documents</span>
                </div>
                <div class="folder-item">
                    <img src="/static/images/windowsIcons/folder.png" alt="">
                    <span>Program Files</span>
                </div>
                <div class="folder-item">
                    <img src="/static/images/windowsIcons/folder.png" alt="">
                    <span>Windows</span>
                </div>
                <div class="folder-item">
                    <img src="/static/images/windowsIcons/hard-drive.png" alt="">
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
