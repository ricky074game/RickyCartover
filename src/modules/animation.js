import * as THREE from 'three';
import { CONFIG } from './config.js';

export class AnimationLoop {
    constructor(renderer, scene, camera, particleSystem, stateManager, interactionManager) {
        this.renderer = renderer;
        this.scene = scene;
        this.camera = camera;
        this.particleSystem = particleSystem;
        this.stateManager = stateManager;
        this.interactionManager = interactionManager;
        this.clock = new THREE.Clock();
        this.isRunning = false;
    }

    start() {
        this.isRunning = true;
        this.animate();
    }

    stop() {
        this.isRunning = false;
    }

    animate = () => {
        if (!this.isRunning) return;
        requestAnimationFrame(this.animate);

        const dt = this.clock.getDelta();
        const time = this.clock.getElapsedTime();

        const { REPULSION_RADIUS, REPULSION_STRENGTH } = CONFIG;
        const positionsArr = this.particleSystem.getPositionArray();
        const targetPositions = this.particleSystem.getTargetPositions();
        const pointer = this.interactionManager.getPointer();
        const currentState = this.stateManager.getCurrentState();

        for (let i = 0; i < CONFIG.PARTICLE_COUNT; i++) {
            const ix = i * 3;
            const iy = i * 3 + 1;
            const iz = i * 3 + 2;

            const tx = targetPositions[ix];
            const ty = targetPositions[iy];
            const tz = targetPositions[iz];

            // Lerp towards target
            const ease = 3.0 * dt;
            positionsArr[ix] += (tx - positionsArr[ix]) * ease;
            positionsArr[iy] += (ty - positionsArr[iy]) * ease;
            positionsArr[iz] += (tz - positionsArr[iz]) * ease;

            // Add natural movement based on shape
            if (currentState === 'projects') {
                const r = Math.sqrt(positionsArr[ix] ** 2 + positionsArr[iz] ** 2);
                if (r < 15) {
                    const spinSpeed = 1.0 * dt;
                    const x = positionsArr[ix];
                    const z = positionsArr[iz];
                    positionsArr[ix] = x * Math.cos(spinSpeed) - z * Math.sin(spinSpeed);
                    positionsArr[iz] = x * Math.sin(spinSpeed) + z * Math.cos(spinSpeed);
                }
            } else if (currentState === 'contact') {
                if (Math.abs(positionsArr[iy] - ty) < 1) {
                    positionsArr[iy] = ty + Math.sin(positionsArr[ix] / 5 + time) * 1.5;
                }
            }

            // Mouse repulsion
            const dx = positionsArr[ix] - (pointer.x * 35);
            const dy = positionsArr[iy] - (pointer.y * 35);
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < REPULSION_RADIUS) {
                const force = (REPULSION_RADIUS - dist) * REPULSION_STRENGTH;
                const angle = Math.atan2(dy, dx);
                positionsArr[ix] += Math.cos(angle) * force * dt * 10;
                positionsArr[iy] += Math.sin(angle) * force * dt * 10;
            }
        }

        // Gentle global rotation
        if (currentState !== 'contact') {
            const targetRotX = -(pointer.y * 0.1);
            const targetRotY = pointer.x * 0.1;

            const ps = this.particleSystem.getParticleSystem();
            ps.rotation.x += (targetRotX - ps.rotation.x) * 2 * dt;
            ps.rotation.y += (targetRotY - ps.rotation.y) * 2 * dt;
        }

        this.particleSystem.updatePositions();
        this.renderer.render(this.scene, this.camera);
    }
}

export default AnimationLoop;
