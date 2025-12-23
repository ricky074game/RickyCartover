import SceneSetup from '../modules/scene.js';
import ParticleSystem from '../modules/particles.js';
import CoordinateGenerator from '../modules/coordinates.js';
import StateManager from '../modules/stateManager.js';
import InteractionManager from '../modules/interaction.js';
import AnimationLoop from '../modules/animation.js';
import UIManager from '../modules/ui.js';
import emailjs from '@emailjs/browser';

class PortfolioApp {
    constructor() {
        this.sceneSetup = null;
        this.particleSystem = null;
        this.coordinateGenerator = null;
        this.stateManager = null;
        this.interactionManager = null;
        this.animationLoop = null;
        this.uiManager = null;
    }

    async initialize() {
        // Initialize UI
        this.uiManager = new UIManager();
        this.uiManager.initialize();

        // Start loading animation
        const loadingInterval = this.uiManager.startLoadingAnimation();

        // Setup scene
        const container = document.getElementById('canvas-container');
        this.sceneSetup = new SceneSetup();
        const { scene, camera, renderer } = this.sceneSetup.initialize(container);

        // Setup particles
        this.particleSystem = new ParticleSystem(scene);
        this.particleSystem.initialize();

        // Generate coordinates
        this.coordinateGenerator = new CoordinateGenerator();
        await this.coordinateGenerator.generate();

        // Setup state manager
        this.stateManager = new StateManager(this.particleSystem, camera, {}, this.uiManager);

        // Setup interaction
        this.interactionManager = new InteractionManager(this.stateManager, this.coordinateGenerator);
        this.interactionManager.initialize();

        // Setup animation loop
        this.animationLoop = new AnimationLoop(
            renderer,
            scene,
            camera,
            this.particleSystem,
            this.stateManager,
            this.interactionManager
        );

        // Complete loading
        clearInterval(loadingInterval);
        await this.uiManager.completeLoading();

        // Initialize home state
        const homeCoords = this.coordinateGenerator.getCoords('home');
        this.stateManager.setTargets('home', homeCoords);

        // Start animation
        this.animationLoop.start();

        // Handle window resize
        window.addEventListener('resize', () => {
            this.sceneSetup.handleResize();
        });

        // Expose changeState globally for HTML onclick
        window.changeState = (state) => {
            const coords = this.coordinateGenerator.getCoords(state);
            this.stateManager.setTargets(state, coords);
        };

        // Handle projects carousel navigation
        let currentProjectIndex = 0;
        window.navigateProjects = (direction) => {
            currentProjectIndex += direction;
            currentProjectIndex = (currentProjectIndex + 6) % 6; // Wrap around
            
            const coords = this.coordinateGenerator.getLanguageLogo(currentProjectIndex);
            if (coords && coords.length > 0) {
                this.stateManager.setTargets('projects', coords, true);
            }

            // Update display
            const items = document.querySelectorAll('.timeline-item');
            items.forEach((item, idx) => {
                item.style.display = idx === currentProjectIndex ? 'block' : 'none';
            });

            // Update counter
            const counter = document.getElementById('projects-counter');
            if (counter) {
                counter.textContent = `${currentProjectIndex + 1} / 6`;
            }
        };
    }

    setupProjectsScrollDetection() {
        const scrollContainer = document.getElementById('projects-scroll-container');
        if (!scrollContainer) return;

        scrollContainer.addEventListener('scroll', () => {
            if (this.stateManager.getCurrentState() !== 'projects') return;

            const scrollTop = scrollContainer.scrollTop;
            const itemHeight = 150; // Approximate height of each timeline item
            const projectIndex = Math.floor(scrollTop / itemHeight);

            const coords = this.coordinateGenerator.getLanguageLogo(projectIndex);
            if (coords && coords.length > 0) {
                this.stateManager.setTargets('projects', coords, true);
            }
        });
    }
}

// Contact form setup (EmailJS) using env-injected values via Parcel
function setupContactForm() {
    const form = document.getElementById('contact-form');
    const statusDiv = document.getElementById('form-status');
    if (!form || !statusDiv) return;

    // Parcel replaces these at build time from .env
    const PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY || '';
    const SERVICE_ID = process.env.EMAILJS_SERVICE_ID || '';
    const TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_ID || '';
    const CONTACT_TO_EMAIL = process.env.CONTACT_TO_EMAIL || 'ricky.sambataro@gmail.com';

    if (PUBLIC_KEY) {
        try { emailjs.init(PUBLIC_KEY); } catch (e) { console.warn('EmailJS init failed', e); }
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault(); // stop page refresh

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const message = document.getElementById('message').value;

        if (!PUBLIC_KEY || !SERVICE_ID || !TEMPLATE_ID) {
            statusDiv.textContent = 'Configure EmailJS keys in .env to send.';
            statusDiv.classList.remove('hidden');
            return;
        }

        statusDiv.textContent = 'Sending...';
        statusDiv.classList.remove('hidden');

        emailjs.send(SERVICE_ID, TEMPLATE_ID, {
            to_email: CONTACT_TO_EMAIL,
            from_name: name,
            from_email: email,
            message: message
        }).then(() => {
            statusDiv.textContent = '✓ Message sent successfully!';
            form.reset();
            setTimeout(() => statusDiv.classList.add('hidden'), 5000);
        }).catch((error) => {
            console.log('Failed to send email:', error);
            statusDiv.textContent = '✗ Failed to send. Please try again.';
        });
    });
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const app = new PortfolioApp();
    app.initialize();
    setupContactForm();
});
