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
        
        // Camera rotation on drag
        this.isDragging = false;
        this.dragStart = { x: 0, y: 0 };
        this.cameraRotation = { x: 0, y: 0 };
        
        // Dynamic particle movement
        this.particleVelocities = new Float32Array(CONFIG.PARTICLE_COUNT * 3);
    }

    initializeInteractions() {
        document.addEventListener('mousedown', (e) => {
            if (e.button === 0 && e.target === this.renderer.domElement) {
                this.isDragging = true;
                this.dragStart = { x: e.clientX, y: e.clientY };
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                const deltaX = e.clientX - this.dragStart.x;
                const deltaY = e.clientY - this.dragStart.y;
                
                this.cameraRotation.y += deltaX * 0.005;
                this.cameraRotation.x += deltaY * 0.005;
                
                // Clamp x rotation
                this.cameraRotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.cameraRotation.x));
                
                this.dragStart = { x: e.clientX, y: e.clientY };
            }
        });

        document.addEventListener('mouseup', () => {
            this.isDragging = false;
        });
    }

    start() {
        this.isRunning = true;
        this.initializeInteractions();
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

        // Convert pointer from normalized device coordinates to world space
        const raycaster = this.interactionManager.raycaster;
        raycaster.setFromCamera(pointer, this.camera);
        
        // Get a point along the raycaster direction (at z=0 plane for 2D repulsion)
        const direction = raycaster.ray.direction;
        const origin = raycaster.ray.origin;
        const t = -origin.z / direction.z; // Find where ray intersects z=0 plane
        const mouseWorldPos = new THREE.Vector3(
            origin.x + direction.x * t,
            origin.y + direction.y * t,
            0
        );

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

            // Dynamic particle movement (living space effect)
            const distToTarget = Math.sqrt(
                (positionsArr[ix] - tx) ** 2 +
                (positionsArr[iy] - ty) ** 2 +
                (positionsArr[iz] - tz) ** 2
            );
            
            if (distToTarget > 0.5) {
                // Particle is far from target, add subtle wandering
                const noise = Math.sin(time * 0.5 + i) * 0.02;
                const noise2 = Math.cos(time * 0.3 + i * 0.5) * 0.02;
                const noise3 = Math.sin(time * 0.4 + i * 0.7) * 0.02;
                
                positionsArr[ix] += noise;
                positionsArr[iy] += noise2;
                positionsArr[iz] += noise3;
            }

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
                // Add subtle wave effect without completely replacing position
                if (Math.abs(positionsArr[iy] - ty) < 2) {
                    const waveOffset = Math.sin(positionsArr[ix] / 8 + time * 0.5) * 0.5;
                    positionsArr[iy] += waveOffset * dt;
                }
            }

            // Mouse repulsion using world space coordinates
            const dx = positionsArr[ix] - mouseWorldPos.x;
            const dy = positionsArr[iy] - mouseWorldPos.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < REPULSION_RADIUS && dist > 0.01) {
                const force = (REPULSION_RADIUS - dist) * REPULSION_STRENGTH;
                const angle = Math.atan2(dy, dx);
                positionsArr[ix] += Math.cos(angle) * force * dt * 10;
                positionsArr[iy] += Math.sin(angle) * force * dt * 10;
            }
        }

        // Update camera rotation with drag
        if (this.isDragging || (this.cameraRotation.x !== 0 || this.cameraRotation.y !== 0)) {
            const euler = new THREE.Euler(this.cameraRotation.x, this.cameraRotation.y, 0, 'YXZ');
            const radius = this.camera.position.length();
            const direction = new THREE.Vector3(0, 0, 1).applyEuler(euler);
            this.camera.position.copy(direction.multiplyScalar(radius));
            this.camera.lookAt(0, 0, 0);
        }

        this.particleSystem.updatePositions();
        this.renderer.render(this.scene, this.camera);
    }
}

export default AnimationLoop;
