# Ricky's Quantum Portfolio

An interactive 3D particle portfolio built with THREE.js, GSAP, and modern ES6 modules. Features animated particles that form different shapes based on navigation state.

## Project Structure

```
RickyCartover/
├── package.json              # Dependencies & build scripts
├── .gitignore
├── public/
│   └── index.html           # Main HTML entry point
└── src/
    ├── js/
    │   └── main.js          # Application initialization
    ├── css/
    │   └── style.css        # Global styles
    └── modules/
        ├── config.js         # Configuration constants
        ├── scene.js          # THREE.js scene setup
        ├── particles.js      # Particle system management
        ├── coordinates.js    # Shape generators (text, sphere, helix, wave)
        ├── stateManager.js   # State & camera management
        ├── interaction.js    # User input handling (mouse/keyboard)
        ├── animation.js      # Animation loop & particle physics
        └── ui.js            # UI & loading screen management
```

## Modular Architecture

Each module handles a specific aspect of the application:

- **config.js**: Centralized configuration for particle counts, colors, camera positions, and shape parameters
- **scene.js**: THREE.js initialization (scene, camera, renderer)
- **particles.js**: Particle geometry, material, and position management
- **coordinates.js**: Text scanning and procedural shape generation (sphere, helix, wave plane)
- **stateManager.js**: Navigation state handling and camera transitions with GSAP
- **interaction.js**: Mouse/keyboard input and Easter egg code detection
- **animation.js**: Main animation loop with particle physics and interactive effects
- **ui.js**: Loading screen and UI panel management
- **main.js**: Application entry point that orchestrates module initialization

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

Runs the dev server on `http://localhost:3000` with hot module reloading via Parcel.

## Build

```bash
npm run build
```

Bundles the application for production in the `dist/` directory.

## Features

- **Particle System**: 5000 particles with physics-based animation
- **Multiple Shapes**: Text (RICKY), Sphere, DNA Helix, Wave Plane
- **Interactive**: Mouse repulsion and keyboard input
- **Easter Egg**: Type "Barisal07" to trigger secret message
- **Responsive**: Adapts to window resizing
- **Animated Transitions**: Camera movement between states with GSAP

## Technologies

- **THREE.js**: 3D graphics rendering
- **GSAP**: Animation library
- **Tailwind CSS**: Utility-first CSS styling
- **Parcel**: Module bundler
- **ES6 Modules**: Modern JavaScript module system

## Color Scheme

- **Home**: Cyan (#00f3ff)
- **About**: Pink (#ff00ff)
- **Projects**: Purple (#8000ff)
- **Contact**: Green (#00ff80)

## Author

Ricky - Full Stack Developer & Game Architect

## License

MIT
