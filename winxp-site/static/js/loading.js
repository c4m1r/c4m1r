class LoadingScreen {
    constructor() {
        this.initialized = false;
    }

    init() {
        this.initialized = true;
    }

    show() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.remove('hidden');

            // Simulate loading time
            setTimeout(() => {
                this.hide();
                if (window.UserManager) {
                    window.UserManager.showLoginScreen();
                }
            }, 3000); // 3 seconds loading
        }
    }

    hide() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
        }
    }
}

window.LoadingScreen = new LoadingScreen();
