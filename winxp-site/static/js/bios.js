class Bios {
    constructor() {
        this.system = null;
        this.selectedIndex = 0;
        this.countdown = 3;
        this.timer = null;
        this.booting = false;
    }

    init(system) {
        this.system = system;
        this.initListeners();
        this.startCountdown();
    }

    initListeners() {
        document.addEventListener('keydown', (e) => {
            if (this.booting) return;

            const menuItems = document.querySelectorAll('#bios-menu li');
            if (!menuItems.length) return;

            if (e.key === 'ArrowUp') {
                this.selectedIndex = (this.selectedIndex - 1 + menuItems.length) % menuItems.length;
                this.updateSelection();
                this.resetCountdown();
            } else if (e.key === 'ArrowDown') {
                this.selectedIndex = (this.selectedIndex + 1) % menuItems.length;
                this.updateSelection();
                this.resetCountdown();
            } else if (e.key === 'Enter') {
                this.boot();
            }
        });
    }

    updateSelection() {
        const menuItems = document.querySelectorAll('#bios-menu li');
        menuItems.forEach((item, index) => {
            if (index === this.selectedIndex) {
                item.classList.add('selected');
            } else {
                item.classList.remove('selected');
            }
        });
    }

    startCountdown() {
        const countdownEl = document.getElementById('bios-countdown');
        if (!countdownEl) return;

        this.timer = setInterval(() => {
            this.countdown--;
            countdownEl.innerText = this.countdown;
            if (this.countdown <= 0) {
                this.boot();
            }
        }, 1000);
    }

    resetCountdown() {
        clearInterval(this.timer);
        this.countdown = 3;
        const countdownEl = document.getElementById('bios-countdown');
        if (countdownEl) countdownEl.innerText = this.countdown;
        // Don't restart auto-boot if user is interacting
    }

    boot() {
        if (this.booting) return;
        this.booting = true;
        clearInterval(this.timer);

        const menuItems = document.querySelectorAll('#bios-menu li');
        const selectedItem = menuItems[this.selectedIndex];
        const bootOption = selectedItem ? selectedItem.dataset.boot : 'windows';

        if (bootOption === 'windows') {
            this.bootWindows();
        } else {
            alert('Terminal boot not implemented yet. Booting Windows...');
            this.bootWindows();
        }
    }

    bootWindows() {
        const biosScreen = document.getElementById('bios-screen');
        if (biosScreen) biosScreen.style.display = 'none';

        if (window.LoadingScreen) {
            window.LoadingScreen.show();
        } else {
            console.error('LoadingScreen not found');
        }
    }
}

window.Bios = new Bios();
