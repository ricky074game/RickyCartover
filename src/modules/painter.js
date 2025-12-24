import * as THREE from 'three';
import { CONFIG } from './config.js';

export class Painter {
    constructor(stateManager, coordinateGenerator, scene, camera, particleSystem) {
        this.stateManager = stateManager;
        this.coordinateGenerator = coordinateGenerator;
        this.scene = scene;
        this.camera = camera;
        this.particleSystem = particleSystem;
        this.isActive = false;
        this.isPainting = false; // Track if mouse is held down
        this.currentColor = '#00f3ff';
        this.currentStrength = 50; // Distance from camera
        this.raycaster = new THREE.Raycaster();
        this.pointer = new THREE.Vector2();
        
        // Track which particles have been placed
        this.nextParticleIndex = 0;
        this.placedParticles = []; // Store positions and colors for exit
        
        // Bind methods
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
    }

    enter() {
        this.isActive = true;
        this.isPainting = false;
        this.nextParticleIndex = 0;
        this.placedParticles = [];
        
        // Show UI
        const ui = document.getElementById('paint-ui');
        if (ui) {
            ui.classList.add('visible');
            ui.classList.remove('hidden');
        }
        
        // Hide Nav
        const nav = document.querySelector('nav');
        if (nav) nav.style.display = 'none';
        
        // Hide content panels
        document.querySelectorAll('.content-panel').forEach(p => p.classList.remove('visible'));
        
        // Wipe effect
        const overlay = document.getElementById('wipe-overlay');
        if (overlay) {
            overlay.classList.add('active');
            setTimeout(() => overlay.classList.remove('active'), 500);
        }

        // CLEAR THE CANVAS: Move all particles far away (off-screen)
        const positions = this.particleSystem.getPositionArray();
        const targets = this.particleSystem.getTargetPositions();
        const colors = this.particleSystem.getColorArray();
        
        for (let i = 0; i < CONFIG.PARTICLE_COUNT; i++) {
            // Move particles far away
            const farAway = 9999;
            positions[i * 3] = farAway;
            positions[i * 3 + 1] = farAway;
            positions[i * 3 + 2] = farAway;
            targets[i * 3] = farAway;
            targets[i * 3 + 1] = farAway;
            targets[i * 3 + 2] = farAway;
            
            // Set all to transparent/dark initially
            colors[i * 3] = 0;
            colors[i * 3 + 1] = 0;
            colors[i * 3 + 2] = 0;
        }
        this.particleSystem.updatePositions();
        this.particleSystem.updateColors();
        
        // Reset counter UI
        const counter = document.getElementById('paint-counter');
        if (counter) {
            counter.textContent = `0 / ${CONFIG.PARTICLE_COUNT}`;
        }

        // Add event listeners
        document.addEventListener('mousedown', this.handleMouseDown);
        document.addEventListener('mouseup', this.handleMouseUp);
        document.addEventListener('mousemove', this.handleMouseMove);
        
        // Force cursor to reticle
        document.body.classList.add('paint-mode');
    }

    exit() {
        this.isActive = false;
        this.isPainting = false;
        
        // Hide UI
        const ui = document.getElementById('paint-ui');
        if (ui) {
            ui.classList.remove('visible');
            ui.classList.add('hidden');
        }
        
        // Show Nav
        const nav = document.querySelector('nav');
        if (nav) nav.style.display = 'flex';
        
        // Remove event listeners
        document.removeEventListener('mousedown', this.handleMouseDown);
        document.removeEventListener('mouseup', this.handleMouseUp);
        document.removeEventListener('mousemove', this.handleMouseMove);
        
        document.body.classList.remove('paint-mode');

        // Convert placed particles to coords format for home state
        if (this.placedParticles.length > 0) {
            const newHomeCoords = this.placedParticles.map(p => ({
                x: p.x,
                y: p.y,
                z: p.z,
                color: p.color
            }));
            
            // Override home coords
            this.coordinateGenerator.homeCoords = newHomeCoords;
            
            // Set as current state with custom colors
            this.setCustomTargets(newHomeCoords);
        } else {
            // If nothing was painted, restore original RICKY
            const homeCoords = this.coordinateGenerator.getCoords('home');
            this.stateManager.setTargets('home', homeCoords);
        }
    }
    
    setCustomTargets(coords) {
        // Custom version that preserves individual particle colors
        const targets = this.particleSystem.getTargetPositions();
        const positions = this.particleSystem.getPositionArray();
        const colors = this.particleSystem.getColorArray();
        
        for (let i = 0; i < CONFIG.PARTICLE_COUNT; i++) {
            if (i < coords.length) {
                const c = coords[i];
                targets[i * 3] = c.x;
                targets[i * 3 + 1] = c.y;
                targets[i * 3 + 2] = c.z;
                
                // Set color from the painted color
                if (c.color) {
                    colors[i * 3] = c.color.r;
                    colors[i * 3 + 1] = c.color.g;
                    colors[i * 3 + 2] = c.color.b;
                }
            } else {
                // Extra particles go far away
                targets[i * 3] = 9999;
                targets[i * 3 + 1] = 9999;
                targets[i * 3 + 2] = 9999;
            }
        }
        this.particleSystem.updateColors();
    }

    handleMouseDown(event) {
        if (!this.isActive) return;
        if (event.button !== 0) return; // Only left click for painting
        if (event.target.closest('#paint-ui')) return; // Ignore UI clicks
        
        this.isPainting = true;
        this.paint(); // Paint immediately on click
    }
    
    handleMouseUp(event) {
        if (event.button === 0) {
            this.isPainting = false;
        }
    }

    handleMouseMove(event) {
        this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        // Continuous painting while mouse is held
        if (this.isPainting && this.isActive) {
            this.paint();
        }
    }

    paint() {
        if (this.nextParticleIndex >= CONFIG.PARTICLE_COUNT) return; // No more particles
        
        // Calculate 3D position
        this.raycaster.setFromCamera(this.pointer, this.camera);
        
        const direction = this.raycaster.ray.direction.clone();
        const position = new THREE.Vector3();
        position.copy(this.camera.position).add(direction.multiplyScalar(this.currentStrength));

        // Get particle arrays
        const positions = this.particleSystem.getPositionArray();
        const targets = this.particleSystem.getTargetPositions();
        const colors = this.particleSystem.getColorArray();
        
        // Paint a cluster of particles
        const brushSize = 1.5; // Spread
        const density = 3; // Particles per paint call
        
        const colorObj = new THREE.Color(this.currentColor);
        
        for (let j = 0; j < density; j++) {
            if (this.nextParticleIndex >= CONFIG.PARTICLE_COUNT) break;
            
            const i = this.nextParticleIndex;
            const offset = new THREE.Vector3(
                (Math.random() - 0.5) * brushSize,
                (Math.random() - 0.5) * brushSize,
                (Math.random() - 0.5) * brushSize * 0.5 // Less depth spread
            );
            
            const px = position.x + offset.x;
            const py = position.y + offset.y;
            const pz = position.z + offset.z;
            
            // Set position immediately (no lerping)
            positions[i * 3] = px;
            positions[i * 3 + 1] = py;
            positions[i * 3 + 2] = pz;
            
            // Set target to same position (keep it there)
            targets[i * 3] = px;
            targets[i * 3 + 1] = py;
            targets[i * 3 + 2] = pz;
            
            // Set color
            colors[i * 3] = colorObj.r;
            colors[i * 3 + 1] = colorObj.g;
            colors[i * 3 + 2] = colorObj.b;
            
            // Store for exit
            this.placedParticles.push({
                x: px,
                y: py,
                z: pz,
                color: { r: colorObj.r, g: colorObj.g, b: colorObj.b }
            });
            
            this.nextParticleIndex++;
        }
        
        // Update GPU buffers
        this.particleSystem.updatePositions();
        this.particleSystem.updateColors();

        // Update counter UI
        const counter = document.getElementById('paint-counter');
        if (counter) {
            counter.textContent = `${Math.min(this.nextParticleIndex, CONFIG.PARTICLE_COUNT)} / ${CONFIG.PARTICLE_COUNT}`;
        }
    }

    setColor(hex) {
        this.currentColor = hex;
    }

    setStrength(val) {
        this.currentStrength = val;
    }
}
