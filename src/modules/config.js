// Application Configuration
export const CONFIG = {
    PARTICLE_COUNT: 5000,
    PARTICLE_SIZE: 0.55,
    REPULSION_RADIUS: 5,
    REPULSION_STRENGTH: 3,
    SECRET_CODE: 'Barisal07',
    
    // Colors
    COLORS: {
        HOME: { r: 0, g: 0.95, b: 1 },
        ABOUT: { r: 1, g: 0, b: 0.5 },
        PROJECTS: { r: 0.5, g: 0, b: 1 },
        CONTACT: { r: 0, g: 1, b: 0.5 }
    },
    
    // Camera positions
    CAMERA: {
        HOME: { z: 75, x: 0, y: 0 },
        ABOUT: { z: 60, x: 0, y: 0 },
        PROJECTS: { z: 60, x: 0, y: 0 },
        CONTACT: { z: 50, x: 0, y: 20 }
    },
    
    // Shape configurations
    SPHERE_RADIUS: 12,
    HELIX_RADIUS: 8,
    HELIX_HEIGHT: 40,
    HELIX_TURNS: 3,
    
    GRID_SIZE: 60,
    GRID_STEP: 0.8
};

export default CONFIG;
