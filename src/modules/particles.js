import * as THREE from 'three';
import { CONFIG } from './config.js';

export class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.particleSystem = null;
        this.geometry = null;
        this.material = null;
        this.positionsArr = null;
        this.colorsArr = null;
        this.targetPositions = null;
    }

    initialize() {
        const { PARTICLE_COUNT, PARTICLE_SIZE } = CONFIG;

        // Geometry
        this.geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(PARTICLE_COUNT * 3);
        const colors = new Float32Array(PARTICLE_COUNT * 3);
        this.targetPositions = new Float32Array(PARTICLE_COUNT * 3);

        // Initialize random positions
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 100;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 100;

            colors[i * 3] = 0;
            colors[i * 3 + 1] = 1;
            colors[i * 3 + 2] = 1;
        }

        this.positionsArr = positions.slice();
        this.colorsArr = colors.slice();

        this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positionsArr, 3));
        this.geometry.setAttribute('color', new THREE.BufferAttribute(this.colorsArr, 3));

        // Material
        this.material = new THREE.PointsMaterial({
            size: PARTICLE_SIZE,
            vertexColors: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            transparent: true,
            opacity: 1.0,
            sizeAttenuation: true
        });

        // Particle system
        this.particleSystem = new THREE.Points(this.geometry, this.material);
        this.scene.add(this.particleSystem);

        return this.particleSystem;
    }

    getPositionArray() {
        return this.geometry.attributes.position.array;
    }

    getColorArray() {
        return this.geometry.attributes.color.array;
    }

    getTargetPositions() {
        return this.targetPositions;
    }

    updatePositions() {
        this.geometry.attributes.position.needsUpdate = true;
    }

    updateColors() {
        this.geometry.attributes.color.needsUpdate = true;
    }

    getParticleSystem() {
        return this.particleSystem;
    }
}

export default ParticleSystem;
