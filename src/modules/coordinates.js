import { CONFIG } from './config.js';

export class CoordinateGenerator {
    constructor() {
        this.homeCoords = [];
        this.aboutCoords = [];
        this.projectCoords = [];
        this.contactCoords = [];
    }

    getCanvasCoordinates(text, font, scale = 0.15) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 800;
        canvas.height = 200;

        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = 'white';
        ctx.font = font;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, canvas.width / 2, canvas.height / 2);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const coords = [];
        const step = 3;

        for (let y = 0; y < canvas.height; y += step) {
            for (let x = 0; x < canvas.width; x += step) {
                const index = (y * canvas.width + x) * 4;
                if (data[index] > 50) {
                    coords.push({
                        x: (x - canvas.width / 2) * scale,
                        y: -(y - canvas.height / 2) * scale,
                        z: 0
                    });
                }
            }
        }
        return coords;
    }

    async generate() {
        const { PARTICLE_COUNT, SPHERE_RADIUS, HELIX_RADIUS, HELIX_HEIGHT, HELIX_TURNS, GRID_SIZE, GRID_STEP } = CONFIG;

        // 1. Home: Text "RICKY"
        this.homeCoords = this.getCanvasCoordinates("RICKY", 'bold 80px "Rajdhani"', 0.25);

        // 2. About: Sphere
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos((Math.random() * 2) - 1);
            this.aboutCoords.push({
                x: SPHERE_RADIUS * Math.sin(phi) * Math.cos(theta),
                y: SPHERE_RADIUS * Math.sin(phi) * Math.sin(theta),
                z: SPHERE_RADIUS * Math.cos(phi)
            });
        }

        // 3. Projects: Helix (DNA)
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const angle = (i / PARTICLE_COUNT) * Math.PI * 2 * HELIX_TURNS;
            const y = ((i / PARTICLE_COUNT) - 0.5) * HELIX_HEIGHT;
            const isStrand2 = i % 2 === 0 ? 1 : -1;

            this.projectCoords.push({
                x: Math.cos(angle) * HELIX_RADIUS * isStrand2,
                y: y,
                z: Math.sin(angle) * HELIX_RADIUS * isStrand2
            });
        }

        // 4. Contact: Wave plane
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            if (i > GRID_SIZE * GRID_SIZE) {
                this.contactCoords.push({
                    x: (Math.random() - 0.5) * 50,
                    y: -20,
                    z: (Math.random() - 0.5) * 50
                });
                continue;
            }
            const x = (i % GRID_SIZE) - (GRID_SIZE / 2);
            const z = Math.floor(i / GRID_SIZE) - (GRID_SIZE / 2);
            this.contactCoords.push({
                x: x * GRID_STEP,
                y: Math.sin(x / 5) * Math.cos(z / 5) * 4 - 5,
                z: z * GRID_STEP
            });
        }

        return true;
    }

    getCoords(type) {
        switch (type) {
            case 'home':
                return this.homeCoords;
            case 'about':
                return this.aboutCoords;
            case 'projects':
                return this.projectCoords;
            case 'contact':
                return this.contactCoords;
            default:
                return [];
        }
    }

    updateHomeText(newText) {
        this.homeCoords = this.getCanvasCoordinates(newText, 'bold 60px "Rajdhani"', 0.25);
        return this.homeCoords;
    }
}

export default CoordinateGenerator;
