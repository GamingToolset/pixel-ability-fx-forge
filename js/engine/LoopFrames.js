import Emitter, { createSeededRandom, mergeEmitterConfig } from './Emitter.js';
import Particle from './Particle.js';

const SIMULATION_STEP = 1 / 60;

const hashString = (value) => {
    let hash = 0x811c9dc5;
    for (let index = 0; index < value.length; index += 1) {
        hash ^= value.charCodeAt(index);
        hash = Math.imul(hash, 0x01000193);
    }
    return hash >>> 0;
};

const positiveModulo = (value, divisor) => ((value % divisor) + divisor) % divisor;

const colorToRgb = (color) => {
    const normalized = color.replace('#', '').trim();
    const value = normalized.length === 3
        ? normalized.split('').map((character) => character + character).join('')
        : normalized;
    return {
        r: parseInt(value.slice(0, 2), 16),
        g: parseInt(value.slice(2, 4), 16),
        b: parseInt(value.slice(4, 6), 16)
    };
};

const shadeColor = (color, amount) => {
    const source = colorToRgb(color);
    const target = amount < 0 ? 0 : 255;
    const strength = Math.abs(amount);
    const channel = (value) => Math.round(value + (target - value) * strength);
    return `rgb(${channel(source.r)}, ${channel(source.g)}, ${channel(source.b)})`;
};

const drawPixelCircle = (context, centerX, centerY, radius, color) => {
    const r = Math.max(1, Math.round(radius));
    context.fillStyle = color;
    for (let row = -r; row <= r; row += 1) {
        const halfChord = Math.floor(Math.sqrt(Math.max(0, r * r - row * row)));
        context.fillRect(centerX - halfChord, centerY + row, halfChord * 2 + 1, 1);
    }
};

const drawOrbCore = (context, model, phase) => {
    const { config, bounds } = model;
    const palette = config.visuals.palette?.length
        ? config.visuals.palette
        : [config.visuals.startColor, config.visuals.endColor];
    const bright = palette[0] || config.visuals.startColor;
    const middle = palette[Math.min(1, palette.length - 1)] || bright;
    const warm = palette[Math.min(2, palette.length - 1)] || middle;
    const centerX = Math.round(bounds.width / 2);
    const centerY = Math.round(bounds.height / 2);
    const pulse = Math.sin(phase * Math.PI * 2);
    const radius = Math.max(4, config.visuals.startSize * 1.6 + Math.round(pulse));

    for (let ray = 0; ray < 10; ray += 1) {
        const angle = ray / 10 * Math.PI * 2 + Math.sin(phase * Math.PI * 2 + ray) * 0.14;
        const rayLength = radius + 3 + ((ray * 7) % 6) + Math.round(pulse * 2);
        const x = Math.round(centerX + Math.cos(angle) * rayLength);
        const y = Math.round(centerY + Math.sin(angle) * rayLength);
        const block = ray % 3 === 0 ? 3 : 2;
        context.fillStyle = shadeColor(warm, -0.38);
        context.fillRect(x, y + 1, block, block);
        context.fillStyle = warm;
        context.fillRect(x, y, block, Math.max(1, block - 1));
    }

    drawPixelCircle(context, centerX + 1, centerY + 1, radius + 2, shadeColor(warm, -0.62));
    drawPixelCircle(context, centerX, centerY, radius + 1, warm);
    drawPixelCircle(context, centerX - 1, centerY - 1, radius * 0.72, middle);
    drawPixelCircle(context, centerX - 3, centerY - 3, radius * 0.36, shadeColor(bright, 0.58));

    context.fillStyle = shadeColor(bright, 0.88);
    context.fillRect(centerX - Math.round(radius * 0.36), centerY - Math.round(radius * 0.45), 2, 2);
};

const drawRingCore = (context, model, phase) => {
    const { config, bounds } = model;
    const palette = config.visuals.palette?.length
        ? config.visuals.palette
        : [config.visuals.startColor, config.visuals.endColor];
    const centerX = Math.round(bounds.width / 2);
    const centerY = Math.round(bounds.height / 2);
    const baseRadius = config.shape.radius || config.visuals.startSize * 4;
    const radius = Math.max(5, baseRadius + Math.sin(phase * Math.PI * 2) * 1.25);
    const block = Math.max(1, Math.round(config.visuals.startSize / 3));
    const segments = Math.max(40, Math.round(radius * 5));

    for (let index = 0; index < segments; index += 1) {
        const unit = index / segments;
        const angle = unit * Math.PI * 2 + phase * Math.PI * 2;
        const ripple = Math.sin(unit * Math.PI * 12 + phase * Math.PI * 4) * 1.3;
        const distance = radius + ripple;
        const x = Math.round(centerX + Math.cos(angle) * distance);
        const y = Math.round(centerY + Math.sin(angle) * distance);
        const colorIndex = Math.floor(positiveModulo(unit + phase, 1) * palette.length) % palette.length;
        const color = palette[colorIndex] || config.visuals.startColor;

        context.fillStyle = shadeColor(color, -0.64);
        context.fillRect(x, y + 1, block + 1, block + 1);
        context.fillStyle = color;
        context.fillRect(x, y, block, block);

        if (index % 9 === 0) {
            context.fillStyle = shadeColor(color, 0.72);
            context.fillRect(x, y, 1, 1);
        }
    }
};

const drawEffectCore = (context, model, phase) => {
    const style = model.config.visuals.coreStyle;
    if (style === 'orb') drawOrbCore(context, model, phase);
    if (style === 'ring') drawRingCore(context, model, phase);
};

const getLoopParticleCount = (config, duration) => {
    const continuousCount = Math.ceil(config.emission.spawnRate * duration);
    const burstContribution = config.emission.spawnRate > 0
        ? Math.round(config.emission.burstAmount * 0.12)
        : config.emission.burstAmount;

    return Math.min(
        config.emission.maxParticles,
        Math.max(0, continuousCount + burstContribution)
    );
};

export const createLoopModel = (sourceConfig, bounds) => {
    const config = mergeEmitterConfig(sourceConfig);
    const duration = Math.max(0.1, config.visuals.life);
    const seed = hashString(JSON.stringify({ config, bounds }));
    const emitterRandom = createSeededRandom(seed);
    const templateEmitter = new Emitter(config, bounds, { random: emitterRandom });
    const particleCount = getLoopParticleCount(config, duration);
    const particles = [];

    for (let index = 0; index < particleCount; index += 1) {
        const options = templateEmitter.createParticleOptions();
        const phaseJitter = (emitterRandom() - 0.5) * 0.36;
        particles.push({
            options: {
                ...options,
                life: duration,
                random: null
            },
            birthPhase: positiveModulo((index + phaseJitter) / Math.max(1, particleCount), 1),
            simulationSeed: (seed ^ Math.imul(index + 1, 0x9e3779b1)) >>> 0
        });
    }

    return {
        config,
        duration,
        particles,
        bounds,
        blendMode: config.visuals.blendMode || config.blendMode || 'source-over'
    };
};

const advanceParticle = (particle, targetAge) => {
    let elapsed = 0;
    while (elapsed + SIMULATION_STEP <= targetAge) {
        particle.update(SIMULATION_STEP);
        elapsed += SIMULATION_STEP;
    }

    const remainder = targetAge - elapsed;
    if (remainder > 1e-7) particle.update(remainder);
};

export const drawLoopPhase = (context, model, phase) => {
    const normalizedPhase = positiveModulo(phase, 1);
    context.clearRect(0, 0, model.bounds.width, model.bounds.height);
    context.imageSmoothingEnabled = false;
    context.globalCompositeOperation = 'source-over';
    drawEffectCore(context, model, normalizedPhase);
    context.globalCompositeOperation = model.blendMode;

    for (const template of model.particles) {
        const agePhase = positiveModulo(normalizedPhase - template.birthPhase, 1);
        const age = agePhase * model.duration;
        const particle = new Particle({
            ...template.options,
            random: createSeededRandom(template.simulationSeed)
        });
        advanceParticle(particle, age);
        particle.draw(context);
    }

    context.globalAlpha = 1;
    context.globalCompositeOperation = 'source-over';
};

export const renderSeamlessLoopFrames = async ({ config, width, height, frameCount }) => {
    const bounds = { width, height };
    const model = createLoopModel(config, bounds);
    const frames = [];

    for (let index = 0; index < frameCount; index += 1) {
        const frameCanvas = document.createElement('canvas');
        frameCanvas.width = width;
        frameCanvas.height = height;
        const context = frameCanvas.getContext('2d');
        drawLoopPhase(context, model, index / frameCount);
        frames.push(frameCanvas);

        if (index % 2 === 1) await new Promise((resolve) => setTimeout(resolve, 0));
    }

    return { frames, model };
};
