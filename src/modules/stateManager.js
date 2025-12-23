import gsap from 'gsap';
import { CONFIG } from './config.js';

export class StateManager {
    constructor(particleSystem, camera, colors, uiManager) {
        this.particleSystem = particleSystem;
        this.camera = camera;
        this.colors = colors;
        this.uiManager = uiManager;
        this.currentState = 'home';
    }

    setTargets(type, coords, skipCameraTransition = false) {
        const { PARTICLE_COUNT } = CONFIG;
        this.currentState = type;

        const colorSet = CONFIG.COLORS[type.toUpperCase()] || CONFIG.COLORS.HOME;
        const camConfig = CONFIG.CAMERA[type.toUpperCase()] || CONFIG.CAMERA.HOME;

        this.uiManager.hideLinkNotification();
        this.uiManager.showPanel(type);
        this.uiManager.updateNavButtons(type);

        // Camera transition (skip during scroll)
        if (!skipCameraTransition) {
            gsap.to(this.camera.position, {
                z: camConfig.z,
                x: camConfig.x,
                y: camConfig.y,
                duration: 2,
                ease: 'power2.inOut'
            });

            // Special camera angles for contact
            if (type === 'contact') {
                gsap.to(this.camera.rotation, { x: -0.5, duration: 2, ease: 'power2.inOut' });
            } else {
                gsap.to(this.camera.rotation, { x: 0, duration: 2, ease: 'power2.inOut' });
            }
        }

        // Assign target positions and colors
        const targetPositions = this.particleSystem.getTargetPositions();
        const colorArray = this.particleSystem.getColorArray();

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            let tx, ty, tz;

            if (coords && coords.length > 0) {
                const index = i % coords.length;
                const c = coords[index];
                const isExtra = i >= coords.length;
                const noise = isExtra ? 50 : 0.2;

                tx = c.x + (Math.random() - 0.5) * noise;
                ty = c.y + (Math.random() - 0.5) * noise;
                tz = isExtra ? (Math.random() - 0.5) * 60 : c.z + (Math.random() - 0.5) * noise;

                if (type === 'contact' && !isExtra) tz = c.z;
            } else {
                tx = (Math.random() - 0.5) * 50;
                ty = (Math.random() - 0.5) * 50;
                tz = (Math.random() - 0.5) * 50;
            }

            targetPositions[i * 3] = tx;
            targetPositions[i * 3 + 1] = ty;
            targetPositions[i * 3 + 2] = tz;

            // Color tween
            gsap.to(colorArray, {
                [i * 3]: colorSet.r,
                [i * 3 + 1]: colorSet.g,
                [i * 3 + 2]: colorSet.b,
                duration: 1.5,
                onUpdate: () => {
                    this.particleSystem.updateColors();
                }
            });
        }
    }

    getCurrentState() {
        return this.currentState;
    }
}

export default StateManager;
