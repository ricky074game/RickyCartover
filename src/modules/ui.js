export class UIManager {
    constructor() {
        this.loader = null;
        this.progressBar = null;
        this.linkNotification = null;
        this.currentState = 'home';
    }

    initialize() {
        this.progressBar = document.getElementById('progress-bar');
        this.loader = document.getElementById('loader');
        this.linkNotification = document.getElementById('link-notification');
    }

    startLoadingAnimation() {
        let progress = 0;
        return setInterval(() => {
            progress += 5;
            if (progress > 90) return;
            this.progressBar.style.width = `${progress}%`;
        }, 50);
    }

    completeLoading() {
        return new Promise((resolve) => {
            this.progressBar.style.width = '100%';
            setTimeout(() => {
                this.loader.style.opacity = '0';
                setTimeout(() => {
                    this.loader.remove();
                    resolve();
                }, 1000);
            }, 500);
        });
    }

    showPanel(panelType) {
        document.querySelectorAll('.content-panel').forEach(p => p.classList.remove('visible'));
        document.getElementById(`panel-${panelType}`)?.classList.add('visible');
    }

    updateNavButtons(state) {
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        const buttons = document.querySelectorAll('.nav-btn');
        buttons.forEach(b => {
            if (b.innerText.toLowerCase().includes(state)) b.classList.add('active');
        });
    }

    hideLinkNotification() {
        this.linkNotification.style.opacity = '0';
    }

    showLinkNotification() {
        this.linkNotification.style.opacity = '1';
    }

    setCurrentState(state) {
        this.currentState = state;
    }

    getCurrentState() {
        return this.currentState;
    }
}

export default UIManager;
