class System {
    constructor() {
        this.config = null;
        this.state = 'boot'; // boot, login, desktop
        this.theme = null;
    }

    async init() {
        try {
            const response = await fetch('config.json');
            this.config = await response.json();

            // Initialize modules
            if (window.Bios) window.Bios.init(this);
            if (window.UserManager) window.UserManager.init(this);

            this.initTheme();

            if (window.Bios) {
                window.Bios.startBootSequence();
            } else {
                console.error('Bios module not loaded');
            }
        } catch (error) {
            console.error('Failed to load system config:', error);
        }
    }

    initTheme() {
        const defaultTheme = this.config.system.defaultTheme;
        this.setTheme(defaultTheme);
    }

    setTheme(themeName) {
        const theme = this.config.themes[themeName];
        if (!theme) return;

        this.theme = themeName;

        // Update CSS
        let themeLink = document.getElementById('theme-css');
        if (!themeLink) {
            themeLink = document.createElement('link');
            themeLink.id = 'theme-css';
            themeLink.rel = 'stylesheet';
            document.head.appendChild(themeLink);
        }
        themeLink.href = theme.css;

        // Update Wallpaper
        if (this.state === 'desktop') {
            document.body.style.backgroundImage = `url(${theme.wallpaper})`;
        }
    }

    // Delegated methods for backward compatibility or ease of access
    logout() {
        if (window.UserManager) window.UserManager.logout();
    }

    shutdown() {
        // Implement shutdown logic (e.g., show power off modal)
        const modal = document.getElementById('power-modal');
        if (modal) {
            modal.style.display = 'flex';
            // Add handlers for yes/no
            document.getElementById('power-yes').onclick = () => {
                document.body.innerHTML = '<div style="background:black;width:100vw;height:100vh;display:flex;align-items:center;justify-content:center;color:white;">It is now safe to turn off your computer.</div>';
            };
            document.getElementById('power-no').onclick = () => {
                modal.style.display = 'none';
            };
        }
    }
}


window.System = new System();
document.addEventListener('DOMContentLoaded', () => window.System.init());
