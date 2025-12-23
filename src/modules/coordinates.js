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

    drawIcon(drawFunction, scale = 0.15) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 400;
        canvas.height = 400;

        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = 'white';
        ctx.fillStyle = 'white';
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        drawFunction(ctx, canvas.width / 2, canvas.height / 2, 80);

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

    drawHumanIcon(ctx, cx, cy, size) {
        // Head
        ctx.beginPath();
        ctx.arc(cx, cy - size * 0.3, size * 0.25, 0, Math.PI * 2);
        ctx.stroke();

        // Body
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx, cy + size * 0.4);
        ctx.stroke();

        // Left arm
        ctx.beginPath();
        ctx.moveTo(cx - size * 0.15, cy - size * 0.05);
        ctx.lineTo(cx - size * 0.35, cy + size * 0.1);
        ctx.stroke();

        // Right arm
        ctx.beginPath();
        ctx.moveTo(cx + size * 0.15, cy - size * 0.05);
        ctx.lineTo(cx + size * 0.35, cy + size * 0.1);
        ctx.stroke();

        // Left leg
        ctx.beginPath();
        ctx.moveTo(cx - size * 0.1, cy + size * 0.4);
        ctx.lineTo(cx - size * 0.15, cy + size * 0.7);
        ctx.stroke();

        // Right leg
        ctx.beginPath();
        ctx.moveTo(cx + size * 0.1, cy + size * 0.4);
        ctx.lineTo(cx + size * 0.15, cy + size * 0.7);
        ctx.stroke();
    }

    drawGitHubIcon(ctx, cx, cy, size) {
        // Simplified GitHub logo (Octocat-inspired)
        ctx.beginPath();
        ctx.arc(cx, cy, size * 0.5, 0, Math.PI * 2);
        ctx.stroke();

        // Left tentacle
        ctx.beginPath();
        ctx.moveTo(cx - size * 0.3, cy);
        ctx.quadraticCurveTo(cx - size * 0.5, cy - size * 0.3, cx - size * 0.4, cy - size * 0.6);
        ctx.stroke();

        // Right tentacle
        ctx.beginPath();
        ctx.moveTo(cx + size * 0.3, cy);
        ctx.quadraticCurveTo(cx + size * 0.5, cy - size * 0.3, cx + size * 0.4, cy - size * 0.6);
        ctx.stroke();

        // Eyes
        ctx.fillRect(cx - size * 0.15, cy - size * 0.15, size * 0.1, size * 0.1);
        ctx.fillRect(cx + size * 0.05, cy - size * 0.15, size * 0.1, size * 0.1);

        // Mouth
        ctx.beginPath();
        ctx.arc(cx, cy + size * 0.1, size * 0.15, 0, Math.PI);
        ctx.stroke();
    }

    drawEnvelopeIcon(ctx, cx, cy, size) {
        // Envelope rectangle
        ctx.strokeRect(cx - size * 0.4, cy - size * 0.3, size * 0.8, size * 0.6);

        // Front flap
        ctx.beginPath();
        ctx.moveTo(cx - size * 0.4, cy - size * 0.3);
        ctx.lineTo(cx, cy + size * 0.15);
        ctx.lineTo(cx + size * 0.4, cy - size * 0.3);
        ctx.stroke();

        // Inner letter hint
        ctx.beginPath();
        ctx.moveTo(cx - size * 0.3, cy - size * 0.1);
        ctx.lineTo(cx, cy + size * 0.05);
        ctx.lineTo(cx + size * 0.3, cy - size * 0.1);
        ctx.stroke();
    }


    async generate() {
        const { PARTICLE_COUNT, SPHERE_RADIUS, HELIX_RADIUS, HELIX_HEIGHT, HELIX_TURNS, GRID_SIZE, GRID_STEP } = CONFIG;

        // 1. Home: Text "RICKY"
        this.homeCoords = this.getCanvasCoordinates("RICKY", 'bold 80px "Rajdhani"', 0.25);

        // 2. About: Human icon
        this.aboutCoords = this.drawIcon((ctx, cx, cy, size) => this.drawHumanIcon(ctx, cx, cy, size), 0.08);

        // 3. Projects: GitHub logo
        this.projectCoords = this.drawIcon((ctx, cx, cy, size) => this.drawGitHubIcon(ctx, cx, cy, size), 0.08);

        // 4. Contact: Envelope icon
        this.contactCoords = this.drawIcon((ctx, cx, cy, size) => this.drawEnvelopeIcon(ctx, cx, cy, size), 0.08);

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
