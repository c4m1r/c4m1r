class UserManager {
    constructor() {
        this.currentUser = null;
        this.system = null;
    }

    init(system) {
        this.system = system;
    }

    showLoginScreen() {
        this.system.state = 'login';
        const loginScreen = document.getElementById('login-screen');
        if (loginScreen) loginScreen.classList.remove('hidden');

        // Render users
        const userList = document.getElementById('user-list');
        if (userList && this.system.config.users) {
            userList.innerHTML = '';
            this.system.config.users.forEach(user => {
                const userEl = document.createElement('div');
                userEl.className = 'login-user';
                userEl.innerHTML = `
                    <img src="${user.avatar}" alt="${user.name}">
                    <span>${user.name}</span>
                `;
                userEl.onclick = () => this.login(user);
                userList.appendChild(userEl);
            });
        }
    }

    login(user) {
        this.currentUser = user;
        this.system.state = 'desktop';

        // Play startup sound
        const theme = this.system.config.themes[this.system.config.system.defaultTheme];
        if (theme && theme.sound && theme.sound.startup) {
            new Audio(theme.sound.startup).play().catch(e => console.log('Audio play failed', e));
        }

        const loginScreen = document.getElementById('login-screen');
        if (loginScreen) loginScreen.classList.add('hidden');

        const desktop = document.getElementById('desktop');
        if (desktop) desktop.classList.remove('hidden');

        const taskbar = document.getElementById('taskbar');
        if (taskbar) taskbar.style.display = 'flex'; // Ensure taskbar is shown

        // Set wallpaper
        if (theme && theme.wallpaper) {
            // Check if desktop element exists, otherwise apply to body
            if (desktop) {
                desktop.style.backgroundImage = `url(${theme.wallpaper})`;
            } else {
                document.body.style.backgroundImage = `url(${theme.wallpaper})`;
            }
        }

        // Initialize Desktop
        if (window.Desktop) {
            window.Desktop.init(this.system.config.desktop);
        }
    }

    logout() {
        this.currentUser = null;

        const desktop = document.getElementById('desktop');
        if (desktop) desktop.classList.add('hidden');

        const taskbar = document.getElementById('taskbar');
        if (taskbar) taskbar.style.display = 'none';

        this.showLoginScreen();
    }
}

window.UserManager = new UserManager();
