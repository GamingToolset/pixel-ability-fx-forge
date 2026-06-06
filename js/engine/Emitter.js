import Particle from './Particle.js';

const random = (min, max) => min + Math.random() * (max - min);
const degToRad = (degrees) => degrees * Math.PI / 180;

export const defaultEmitterConfig = {
    emission: {
        spawnRate: 70,
        burstAmount: 120,
        maxParticles: 450
    },
    shape: {
        type: 'circle',
        radius: 12,
        width: 80,
        height: 36
    },
    movement: {
        minVelocity: 18,
        maxVelocity: 105,
        angle: -90,
        spread: 360
    },
    physics: {
        gravity: -18,
        drag: 0.955
    },
    forces: {
        orbitalVelocity: 0,
        vortexPull: 0
    },
    visuals: {
        startColor: '#ffd166',
        endColor: '#ef476f',
        palette: ['#fff1a8', '#ffd166', '#f77f00'],
        startSize: 5,
        endSize: 1,
        life: 1.25,
        particleShape: 'square'
    }
};

const cloneConfig = (config) => structuredClone(config);

const deepMerge = (base, override) => {
    const result = cloneConfig(base);

    for (const [key, value] of Object.entries(override || {})) {
        const canMerge = value
            && typeof value === 'object'
            && !Array.isArray(value)
            && result[key]
            && typeof result[key] === 'object'
            && !Array.isArray(result[key]);

        result[key] = canMerge ? deepMerge(result[key], value) : cloneConfig(value);
    }

    return result;
};

export default class Emitter {
    constructor(config = defaultEmitterConfig, bounds = { width: 160, height: 160 }) {
        this.bounds = bounds;
        this.originX = bounds.width / 2;
        this.originY = bounds.height / 2;
        this.particles = [];
        this.accumulator = 0;
        this.setConfig(config);
    }

    setConfig(config) {
        this.config = deepMerge(defaultEmitterConfig, config);
    }

    update(deltaTime, continuous = true) {
        if (continuous) {
            this.accumulator += this.config.emission.spawnRate * deltaTime;
            const spawnCount = Math.floor(this.accumulator);
            this.accumulator -= spawnCount;
            this.spawn(spawnCount);
        }

        for (let index = this.particles.length - 1; index >= 0; index -= 1) {
            const particle = this.particles[index];
            particle.update(deltaTime);

            if (!particle.alive) {
                this.particles.splice(index, 1);
            }
        }
    }

    draw(context) {
        for (const particle of this.particles) {
            particle.draw(context);
        }
    }

    burst(amount = this.config.emission.burstAmount) {
        this.spawn(amount);
    }

    reset() {
        this.particles = [];
        this.accumulator = 0;
    }

    spawn(count) {
        const available = this.config.emission.maxParticles - this.particles.length;
        const amount = Math.max(0, Math.min(count, available));

        for (let index = 0; index < amount; index += 1) {
            this.particles.push(new Particle(this.createParticleOptions()));
        }
    }

    createParticleOptions() {
        const position = this.randomPosition();
        const movement = this.config.movement;
        const visuals = this.config.visuals;
        const physics = this.config.physics;
        const forces = this.config.forces;
        const angle = degToRad(movement.angle + random(-movement.spread / 2, movement.spread / 2));
        const velocity = random(movement.minVelocity, movement.maxVelocity);
        const paletteColor = this.pickPaletteColor();

        return {
            x: position.x,
            y: position.y,
            vx: Math.cos(angle) * velocity,
            vy: Math.sin(angle) * velocity,
            originX: this.originX,
            originY: this.originY,
            life: visuals.life,
            startSize: visuals.startSize,
            endSize: visuals.endSize,
            startColor: paletteColor || visuals.startColor,
            endColor: visuals.endColor,
            gravity: physics.gravity,
            drag: physics.drag,
            orbitalVelocity: forces.orbitalVelocity,
            vortexPull: forces.vortexPull,
            shape: visuals.particleShape || 'square',
            canvasWidth: this.bounds.width,
            canvasHeight: this.bounds.height
        };
    }

    pickPaletteColor() {
        const palette = this.config.visuals.palette;
        if (!Array.isArray(palette) || palette.length === 0) return null;
        return palette[Math.floor(Math.random() * palette.length)];
    }

    randomPosition() {
        const shape = this.config.shape;
        const center = { x: this.originX, y: this.originY };

        if (shape.type === 'box') {
            return {
                x: center.x + random(-shape.width / 2, shape.width / 2),
                y: center.y + random(-shape.height / 2, shape.height / 2)
            };
        }

        if (shape.type === 'ring') {
            const angle = random(0, Math.PI * 2);
            return {
                x: center.x + Math.cos(angle) * shape.radius,
                y: center.y + Math.sin(angle) * shape.radius
            };
        }

        if (shape.type === 'circle') {
            const angle = random(0, Math.PI * 2);
            const radius = Math.sqrt(Math.random()) * shape.radius;
            return {
                x: center.x + Math.cos(angle) * radius,
                y: center.y + Math.sin(angle) * radius
            };
        }

        return center;
    }
}
