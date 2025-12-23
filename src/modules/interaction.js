import * as THREE from 'three';

export class InteractionManager {
    constructor(stateManager, coordinateGenerator) {
        this.stateManager = stateManager;
        this.coordinateGenerator = coordinateGenerator;
        this.raycaster = new THREE.Raycaster();
        this.pointer = new THREE.Vector2();
        this.keyBuffer = '';
        this.secretCode = 'Barisal07';
    }

    initialize() {
        document.addEventListener('mousemove', (event) => {
            this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
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
            if (this.stateManager.getCurrentState() === 'projects') {
                if (event.target.tagName !== 'BUTTON' &&
                    event.target.tagName !== 'A' &&
                    !event.target.closest('.content-panel')) {
                    // Can trigger action here if needed
                }
            }
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
