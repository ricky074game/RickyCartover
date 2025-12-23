import SceneSetup from '../modules/scene.js';
import ParticleSystem from '../modules/particles.js';
import CoordinateGenerator from '../modules/coordinates.js';
import StateManager from '../modules/stateManager.js';
import InteractionManager from '../modules/interaction.js';
import AnimationLoop from '../modules/animation.js';
import UIManager from '../modules/ui.js';

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

        // Handle projects scroll to change particle logos
        this.setupProjectsScrollDetection();
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

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const app = new PortfolioApp();
    app.initialize();
});
