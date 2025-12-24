import * as THREE from 'three';

export class InteractionManager {
    constructor(stateManager, coordinateGenerator, renderer) {
        this.stateManager = stateManager;
        this.coordinateGenerator = coordinateGenerator;
        this.renderer = renderer;
        this.raycaster = new THREE.Raycaster();
        this.pointer = new THREE.Vector2();
        this.keyBuffer = '';
        this.secretCode = 'Barisal07';
    }

    initialize() {
        document.addEventListener('mousemove', (event) => {
            // Use renderer canvas bounds for accurate normalization
            // even when UI changes alter layout or canvas size/position.
            if (this.renderer && this.renderer.domElement) {
                const rect = this.renderer.domElement.getBoundingClientRect();
                const x = (event.clientX - rect.left) / rect.width;
                const y = (event.clientY - rect.top) / rect.height;
                this.pointer.x = x * 2 - 1;
                this.pointer.y = -(y * 2 - 1);
            } else {
                // Fallback to window size if renderer is unavailable
                this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
                this.pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key.length === 1) {
                this.keyBuffer += e.key;
                if (this.keyBuffer.length > this.secretCode.length) {
                    this.keyBuffer = this.keyBuffer.slice(-this.secretCode.length);
                }

                if (this.keyBuffer === this.secretCode) {
                    this.handleSecretCode();
                    this.keyBuffer = '';
                }
            }
        });

        document.addEventListener('click', (event) => {
            const currentState = this.stateManager.getCurrentState();
            
            // Ignore clicks on UI elements
            if (event.target.tagName === 'BUTTON' ||
                event.target.tagName === 'A' ||
                event.target.closest('.content-panel')) {
                return;
            }

            // Don't open GitHub on projects click anymore
        });
    }

    handleSecretCode() {
        const newCoords = this.coordinateGenerator.updateHomeText('Yay Ricky!');
        if (this.stateManager.getCurrentState() === 'home') {
            this.stateManager.setTargets('home', newCoords);
        }
    }

    getRaycaster() {
        return this.raycaster;
    }

    getPointer() {
        return this.pointer;
    }
}

export default InteractionManager;
