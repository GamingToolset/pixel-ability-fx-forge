const TAU = Math.PI * 2;
const BASE_SIZE = 160;

const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
const lerp = (from, to, amount) => from + (to - from) * amount;
const easeOut = (value) => 1 - Math.pow(1 - clamp(value), 3);
const smoothstep = (from, to, value) => {
    const amount = clamp((value - from) / Math.max(0.0001, to - from));
    return amount * amount * (3 - 2 * amount);
};

const hash = (value) => {
    let state = 0x811c9dc5;
    const source = String(value);
    for (let index = 0; index < source.length; index += 1) {
        state ^= source.charCodeAt(index);
        state = Math.imul(state, 0x01000193);
    }
    return state >>> 0;
};

const createRandom = (seed) => {
    let state = seed >>> 0;
    return () => {
        state += 0x6d2b79f5;
        let value = state;
        value = Math.imul(value ^ value >>> 15, value | 1);
        value ^= value + Math.imul(value ^ value >>> 7, value | 61);
        return ((value ^ value >>> 14) >>> 0) / 4294967296;
    };
};

const between = (random, min, max) => min + random() * (max - min);
const integer = (random, min, max) => Math.floor(between(random, min, max + 1));
const choose = (random, values) => values[Math.floor(random() * values.length)];

export const EFFECT_FAMILIES = {
    burst: {
        label: 'Impact · AoE',
        shortLabel: 'Impact',
        description: 'A fast core flash, expanding shock rings, heavy fragments and a trail of fading motes.',
        suffixes: ['Detonation', 'Rupture', 'Nova', 'Cataclysm', 'Pulse']
    },
    barrier: {
        label: 'Ward · Barrier',
        shortLabel: 'Barrier',
        description: 'A cast impact settles into rotating pixel rings, runes and bright anchor stones.',
        suffixes: ['Bulwark', 'Ward', 'Bastion', 'Aegis', 'Seal']
    },
    aura: {
        label: 'Aura · Restore',
        shortLabel: 'Aura',
        description: 'A soft bloom forms a wide aura while sparks rise around a pulsing central glyph.',
        suffixes: ['Renewal', 'Bloom', 'Ascension', 'Grace', 'Resonance']
    }
};

export const ELEMENTS = {
    fire: {
        label: 'Fire',
        adjective: 'Ember',
        palette: ['#fff4a3', '#ffd21f', '#ff7a00', '#e83212', '#4a0904'],
        gravity: -14
    },
    frost: {
        label: 'Frost',
        adjective: 'Glacial',
        palette: ['#ffffff', '#c8f7ff', '#5edcff', '#3478e5', '#102457'],
        gravity: 8
    },
    nature: {
        label: 'Nature',
        adjective: 'Verdant',
        palette: ['#efffd0', '#adff2f', '#39d353', '#16833a', '#062b17'],
        gravity: -24
    },
    earth: {
        label: 'Earth',
        adjective: 'Runic',
        palette: ['#fff0a3', '#d9bd55', '#a4772d', '#684216', '#24170b'],
        gravity: 72
    },
    storm: {
        label: 'Storm',
        adjective: 'Volt',
        palette: ['#ffffff', '#dff8ff', '#58dcff', '#6370ff', '#18205c'],
        gravity: 4
    },
    arcane: {
        label: 'Arcane',
        adjective: 'Astral',
        palette: ['#fff1ff', '#ef8dff', '#a855f7', '#6422b8', '#20083d'],
        gravity: -8
    },
    shadow: {
        label: 'Shadow',
        adjective: 'Umbral',
        palette: ['#e8d9ff', '#9c74e8', '#58358f', '#241442', '#080610'],
        gravity: -3
    },
    holy: {
        label: 'Radiance',
        adjective: 'Solar',
        palette: ['#ffffff', '#fff3a6', '#ffd45b', '#d98d21', '#4a2907'],
        gravity: -18
    },
    blood: {
        label: 'Blood',
        adjective: 'Crimson',
        palette: ['#ffd7d0', '#ff5b4d', '#c91f37', '#721027', '#27050b'],
        gravity: 42
    },
    tide: {
        label: 'Tide',
        adjective: 'Tidal',
        palette: ['#e8ffff', '#74f4e8', '#23bfc8', '#176b8d', '#082c43'],
        gravity: 20
    }
};

export const POWER_LEVELS = {
    restrained: { label: 'Restrained', density: 0.72, scale: 0.86, brightness: 0.84 },
    standard: { label: 'Standard', density: 1, scale: 1, brightness: 1 },
    mythic: { label: 'Mythic', density: 1.34, scale: 1.12, brightness: 1.08 }
};

const FAMILY_KEYS = Object.keys(EFFECT_FAMILIES);
const ELEMENT_KEYS = Object.keys(ELEMENTS);

export const randomSeed = () => {
    if (globalThis.crypto?.getRandomValues) {
        return globalThis.crypto.getRandomValues(new Uint32Array(1))[0] || 1;
    }
    return (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0;
};

export const createEffectRecipe = ({
    family = 'random',
    element = 'random',
    power = 'standard',
    seed = randomSeed()
} = {}) => {
    const normalizedSeed = Number(seed) >>> 0 || 1;
    const random = createRandom(normalizedSeed);
    const familyKey = EFFECT_FAMILIES[family] ? family : choose(random, FAMILY_KEYS);
    const elementKey = ELEMENTS[element] ? element : choose(random, ELEMENT_KEYS);
    const powerKey = POWER_LEVELS[power] ? power : 'standard';
    const familyData = EFFECT_FAMILIES[familyKey];
    const elementData = ELEMENTS[elementKey];
    const powerData = POWER_LEVELS[powerKey];

    const familyDurations = {
        burst: [2.35, 3.15],
        barrier: [5.6, 7.4],
        aura: [5.2, 7.1]
    };
    const [durationMin, durationMax] = familyDurations[familyKey];
    const symmetryChoices = familyKey === 'burst' ? [5, 6, 7, 8] : [4, 6, 8];
    const ringRanges = familyKey === 'burst' ? [1, 3] : [2, 4];
    const motifChoices = familyKey === 'barrier'
        ? ['diamond', 'rune-x', 'crown', 'square-knot']
        : familyKey === 'aura'
            ? ['plus', 'leaf', 'star', 'spiral']
            : ['star', 'diamond', 'split-cross', 'flare'];

    const palette = [...elementData.palette];
    if (random() > 0.5) {
        [palette[1], palette[2]] = [palette[2], palette[1]];
    }

    const recipe = {
        seed: normalizedSeed,
        family: familyKey,
        element: elementKey,
        power: powerKey,
        name: `${elementData.adjective} ${choose(random, familyData.suffixes)}`,
        label: familyData.label,
        description: familyData.description,
        palette,
        duration: between(random, durationMin, durationMax),
        density: powerData.density * between(random, 0.9, 1.1),
        scale: powerData.scale * between(random, 0.92, 1.06),
        brightness: powerData.brightness,
        gravity: elementData.gravity + between(random, -12, 12),
        rings: integer(random, ringRanges[0], ringRanges[1]),
        symmetry: choose(random, symmetryChoices),
        motif: choose(random, motifChoices),
        direction: random() > 0.5 ? 1 : -1,
        rotationSpeed: between(random, 0.36, 0.86),
        radius: between(random, familyKey === 'aura' ? 62 : 48, familyKey === 'aura' ? 74 : 61),
        fragmentation: between(random, 0.16, 0.38),
        tuning: {
            density: 1,
            scale: 1,
            tempo: 1,
            duration: 1
        }
    };

    return recipe;
};

const drawPixelCircle = (context, x, y, radius) => {
    const r = Math.max(1, Math.round(radius));
    for (let row = -r; row <= r; row += 1) {
        const chord = Math.floor(Math.sqrt(Math.max(0, r * r - row * row)));
        context.fillRect(Math.round(x) - chord, Math.round(y) + row, chord * 2 + 1, 1);
    }
};

const drawShape = (context, x, y, size, shape) => {
    const pixelSize = Math.max(1, Math.round(size));
    const half = Math.floor(pixelSize / 2);
    const px = Math.round(x);
    const py = Math.round(y);

    switch (shape) {
        case 'diamond':
            for (let row = -half; row <= half; row += 1) {
                const width = Math.max(1, pixelSize - Math.abs(row) * 2);
                context.fillRect(px - Math.floor(width / 2), py + row, width, 1);
            }
            break;
        case 'plus': {
            const thick = Math.max(1, Math.floor(pixelSize / 3));
            context.fillRect(px - half, py - Math.floor(thick / 2), pixelSize, thick);
            context.fillRect(px - Math.floor(thick / 2), py - half, thick, pixelSize);
            break;
        }
        case 'spark':
            context.fillRect(px - half, py, pixelSize, 1);
            context.fillRect(px, py - half, 1, pixelSize);
            if (pixelSize >= 5) {
                context.fillRect(px - 1, py - 1, 3, 3);
            }
            break;
        case 'cluster': {
            const block = Math.max(1, Math.round(pixelSize / 3));
            context.fillRect(px - block, py - block, block * 2, block * 2);
            context.fillRect(px + block, py - block, block, block);
            context.fillRect(px - block * 2, py, block, block);
            context.fillRect(px, py + block, block, block);
            break;
        }
        case 'circle':
            drawPixelCircle(context, px, py, pixelSize / 2);
            break;
        case 'square':
        default:
            context.fillRect(px - half, py - half, pixelSize, pixelSize);
            break;
    }
};

const drawSquareGlow = (context, x, y, radius, color, alpha, steps = 7) => {
    for (let step = steps; step >= 1; step -= 1) {
        const amount = step / steps;
        const r = Math.max(1, Math.round(radius * amount));
        context.globalAlpha = alpha * (1 - amount) * 0.72;
        context.fillStyle = color;
        context.fillRect(Math.round(x - r), Math.round(y - r), r * 2, r * 2);
    }
};

const drawTarget = (context, tint) => {
    const cx = 80;
    const cy = 80;
    context.globalAlpha = 0.56;
    context.fillStyle = tint;
    context.fillRect(cx - 8, cy - 16, 16, 19);
    context.fillRect(cx - 11, cy - 6, 22, 10);
    context.fillRect(cx - 6, cy + 3, 5, 8);
    context.fillRect(cx + 1, cy + 3, 5, 8);
    context.globalAlpha = 1;
};

const drawOrigin = (context, color) => {
    context.globalAlpha = 0.9;
    context.fillStyle = color;
    context.fillRect(79, 77, 3, 7);
    context.fillRect(77, 79, 7, 3);
    context.globalAlpha = 1;
};

const drawRing = (context, {
    radius,
    segments,
    color,
    alpha,
    size,
    angle = 0,
    fragmentation = 0,
    wobble = 0,
    seed = 0
}) => {
    for (let index = 0; index < segments; index += 1) {
        const noise = ((Math.imul(index + 1, 2654435761) ^ seed) >>> 0) / 4294967296;
        if (noise < fragmentation) continue;
        const theta = index / segments * TAU + angle;
        const distance = radius + Math.sin(index * 1.73 + angle * 3 + seed * 0.0001) * wobble;
        const twinkle = 0.58 + 0.42 * Math.sin(index * 0.91 + angle * 5.3 + seed);
        context.globalAlpha = alpha * clamp(twinkle, 0.18, 1);
        context.fillStyle = color;
        const block = index % 11 === 0 ? size + 1 : size;
        context.fillRect(
            Math.round(80 + Math.cos(theta) * distance) - Math.floor(block / 2),
            Math.round(80 + Math.sin(theta) * distance) - Math.floor(block / 2),
            block,
            block
        );
    }
};

const drawGlyph = (context, motif, size, palette, alpha, pulse = 1) => {
    const cx = 80;
    const cy = 80;
    const outer = Math.max(5, Math.round(size * pulse));
    const [light, bright, mid, deep] = palette;

    context.globalAlpha = alpha * 0.35;
    context.fillStyle = deep;
    context.fillRect(cx - outer - 2, cy - 2, (outer + 2) * 2, 5);
    context.fillRect(cx - 2, cy - outer - 2, 5, (outer + 2) * 2);

    context.globalAlpha = alpha;
    context.fillStyle = mid;
    if (motif === 'plus' || motif === 'split-cross') {
        context.fillRect(cx - outer, cy - 2, outer * 2 + 1, 4);
        context.fillRect(cx - 2, cy - outer, 4, outer * 2 + 1);
    } else if (motif === 'diamond' || motif === 'leaf') {
        for (let row = -outer; row <= outer; row += 1) {
            const width = Math.max(1, outer * 2 - Math.abs(row) * 2);
            if (Math.abs(row) < outer - 2) {
                context.fillRect(cx - Math.floor(width / 2), cy + row, width, 1);
            }
        }
        context.fillStyle = deep;
        context.fillRect(cx - 1, cy - outer + 3, 2, outer * 2 - 5);
    } else if (motif === 'rune-x' || motif === 'square-knot') {
        for (let offset = -outer; offset <= outer; offset += 1) {
            context.fillRect(cx + offset, cy + offset, 2, 2);
            context.fillRect(cx - offset, cy + offset, 2, 2);
        }
        if (motif === 'square-knot') {
            context.strokeStyle = bright;
            context.lineWidth = 2;
            context.strokeRect(cx - outer + 3, cy - outer + 3, (outer - 3) * 2, (outer - 3) * 2);
        }
    } else if (motif === 'crown') {
        context.fillRect(cx - outer, cy + 2, outer * 2, 3);
        for (const offset of [-outer, 0, outer]) {
            context.fillRect(cx + offset - 1, cy - outer + Math.abs(offset) * 0.35, 3, outer + 2);
        }
    } else if (motif === 'spiral') {
        for (let index = 0; index < 20; index += 1) {
            const amount = index / 19;
            const theta = amount * TAU * 1.7;
            const radius = amount * outer;
            context.fillRect(
                Math.round(cx + Math.cos(theta) * radius) - 1,
                Math.round(cy + Math.sin(theta) * radius) - 1,
                3,
                3
            );
        }
    } else {
        context.fillRect(cx - outer, cy - 1, outer * 2 + 1, 3);
        context.fillRect(cx - 1, cy - outer, 3, outer * 2 + 1);
        for (const [x, y] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
            context.fillRect(cx + x * outer * 0.7 - 1, cy + y * outer * 0.7 - 1, 3, 3);
        }
    }

    context.globalAlpha = alpha;
    context.fillStyle = light;
    context.fillRect(cx - 1, cy - 1, 3, 3);
    context.globalAlpha = 1;
};

const makeParticle = (overrides) => ({
    spawn: 0,
    life: 1,
    x: 80,
    y: 80,
    vx: 0,
    vy: 0,
    gravity: 0,
    drag: 0,
    sizeStart: 4,
    sizeEnd: 1,
    color: '#ffffff',
    shape: 'square',
    orbit: 0,
    phase: 0,
    ...overrides
});

const buildBurstParticles = (recipe, random, density, scale, tempo) => {
    const particles = [];
    const [light, bright, mid, deep] = recipe.palette;
    const chunkCount = Math.round(between(random, 82, 118) * density);
    const emberCount = Math.round(between(random, 30, 48) * density);

    for (let index = 0; index < chunkCount; index += 1) {
        const theta = between(random, 0, TAU);
        const speed = between(random, 32, 125) * scale * tempo;
        particles.push(makeParticle({
            spawn: between(random, 0, 0.16),
            life: between(random, 0.42, 1.45) / tempo,
            x: 80 + between(random, -4, 4),
            y: 80 + between(random, -4, 4),
            vx: Math.cos(theta) * speed,
            vy: Math.sin(theta) * speed,
            gravity: recipe.gravity,
            drag: between(random, 0.3, 0.75),
            sizeStart: integer(random, 3, 7) * scale,
            sizeEnd: between(random, 0.4, 1.5),
            color: choose(random, [light, bright, bright, mid, mid, deep]),
            shape: choose(random, ['square', 'square', 'cluster', 'diamond']),
            phase: between(random, 0, TAU)
        }));
    }

    for (let index = 0; index < emberCount; index += 1) {
        const theta = between(random, 0, TAU);
        const radius = between(random, 5, 45) * scale;
        particles.push(makeParticle({
            spawn: between(random, 0.05, 1.25),
            life: between(random, 0.65, 1.55) / tempo,
            x: 80 + Math.cos(theta) * radius,
            y: 80 + Math.sin(theta) * radius,
            vx: between(random, -14, 14) * tempo,
            vy: between(random, -62, -22) * tempo,
            gravity: recipe.gravity * -0.35,
            drag: 0.18,
            sizeStart: integer(random, 2, 4) * scale,
            sizeEnd: 1,
            color: choose(random, [light, bright, mid]),
            shape: choose(random, ['square', 'spark']),
            phase: between(random, 0, TAU)
        }));
    }
    return particles;
};

const buildBarrierParticles = (recipe, random, density, scale, tempo) => {
    const particles = [];
    const [light, bright, mid, deep] = recipe.palette;
    const impactCount = Math.round(between(random, 38, 58) * density);
    const dustCount = Math.round(between(random, 22, 34) * density);

    for (let index = 0; index < impactCount; index += 1) {
        const theta = between(random, 0, TAU);
        const speed = between(random, 36, 96) * scale * tempo;
        particles.push(makeParticle({
            spawn: between(random, 0, 0.12),
            life: between(random, 0.3, 0.85) / tempo,
            x: 80 + between(random, -4, 4),
            y: 80 + between(random, -4, 4),
            vx: Math.cos(theta) * speed,
            vy: Math.sin(theta) * speed,
            gravity: Math.abs(recipe.gravity) + 28,
            drag: 0.72,
            sizeStart: integer(random, 2, 5) * scale,
            sizeEnd: 1,
            color: choose(random, [light, bright, mid, deep]),
            shape: choose(random, ['square', 'cluster', 'diamond'])
        }));
    }

    for (let index = 0; index < dustCount; index += 1) {
        const theta = index / dustCount * TAU + between(random, -0.08, 0.08);
        const radius = recipe.radius * scale + between(random, -5, 5);
        particles.push(makeParticle({
            spawn: between(random, 0.05, 0.28),
            life: between(random, 0.55, 1.15) / tempo,
            x: 80 + Math.cos(theta) * radius,
            y: 80 + Math.sin(theta) * radius,
            vx: Math.cos(theta) * between(random, 8, 24) * tempo,
            vy: between(random, -30, -8) * tempo,
            gravity: 24,
            drag: 0.3,
            sizeStart: integer(random, 2, 4) * scale,
            sizeEnd: 1,
            color: choose(random, [bright, mid, deep]),
            shape: 'square'
        }));
    }
    return particles;
};

const buildAuraParticles = (recipe, random, density, scale, tempo, duration) => {
    const particles = [];
    const [light, bright, mid, deep] = recipe.palette;
    const bloomCount = Math.round(between(random, 46, 68) * density);
    const moteCount = Math.round(between(random, 70, 108) * density);

    for (let index = 0; index < bloomCount; index += 1) {
        const theta = between(random, 0, TAU);
        const speed = between(random, 16, 66) * scale * tempo;
        particles.push(makeParticle({
            spawn: between(random, 0, 0.22),
            life: between(random, 0.55, 1.65) / tempo,
            x: 80 + between(random, -6, 6),
            y: 80 + between(random, -6, 6),
            vx: Math.cos(theta) * speed * 0.72,
            vy: Math.sin(theta) * speed * 0.72 - between(random, 5, 18),
            gravity: -10,
            drag: 0.34,
            sizeStart: integer(random, 2, 5) * scale,
            sizeEnd: 1,
            color: choose(random, [light, bright, mid]),
            shape: choose(random, ['square', 'plus', 'spark'])
        }));
    }

    for (let index = 0; index < moteCount; index += 1) {
        const theta = between(random, 0, TAU);
        const radius = between(random, 8, recipe.radius + 4) * scale;
        const spawn = between(random, 0.35, Math.max(0.5, duration - 1.65));
        const remainingLife = Math.max(0.25, duration - spawn);
        particles.push(makeParticle({
            spawn,
            life: Math.min(between(random, 0.65, 1.55) / tempo, remainingLife),
            x: 80 + Math.cos(theta) * radius,
            y: 80 + Math.sin(theta) * radius,
            vx: between(random, -7, 7) * tempo,
            vy: between(random, -48, -24) * tempo,
            gravity: -5,
            drag: 0.14,
            sizeStart: integer(random, 2, 4) * scale,
            sizeEnd: 1,
            color: choose(random, [light, bright, mid, deep]),
            shape: choose(random, ['square', 'spark', 'plus']),
            orbit: between(random, -9, 9),
            phase: theta
        }));
    }
    return particles;
};

const drawParticle = (context, particle, time, brightness) => {
    const age = time - particle.spawn;
    if (age < 0 || age > particle.life) return;
    const progress = age / particle.life;
    const fadeIn = smoothstep(0, 0.08, progress);
    const fadeOut = 1 - smoothstep(0.58, 1, progress);
    const drag = Math.exp(-particle.drag * age);
    const orbitX = particle.orbit ? Math.cos(particle.phase + age * 3) * particle.orbit * age : 0;
    const orbitY = particle.orbit ? Math.sin(particle.phase + age * 3) * particle.orbit * age : 0;
    const x = particle.x + particle.vx * age * drag + orbitX;
    const y = particle.y + particle.vy * age * drag + particle.gravity * age * age * 0.5 + orbitY;
    const pulse = 0.9 + 0.1 * Math.sin(particle.phase + progress * TAU * 2);
    const size = Math.max(1, Math.round(lerp(particle.sizeStart, particle.sizeEnd, progress) * pulse));
    const alpha = fadeIn * fadeOut * brightness;

    context.globalAlpha = alpha * 0.18;
    context.fillStyle = particle.color;
    if (size >= 3) drawShape(context, x, y, size + 3, particle.shape);
    context.globalAlpha = alpha;
    drawShape(context, x, y, size, particle.shape);
};

export class AbilityEffect {
    constructor(recipe) {
        this.setRecipe(recipe);
    }

    setRecipe(recipe) {
        this.recipe = structuredClone(recipe);
        const tuning = this.recipe.tuning || { density: 1, scale: 1, tempo: 1, duration: 1 };
        this.density = this.recipe.density * tuning.density;
        this.scale = this.recipe.scale * tuning.scale;
        this.tempo = tuning.tempo;
        this.duration = this.recipe.duration * tuning.duration;
        this.brightness = this.recipe.brightness;
        const random = createRandom(hash(`${this.recipe.seed}:${this.recipe.family}:${this.recipe.element}`));

        if (this.recipe.family === 'burst') {
            this.particles = buildBurstParticles(this.recipe, random, this.density, this.scale, this.tempo);
        } else if (this.recipe.family === 'barrier') {
            this.particles = buildBarrierParticles(this.recipe, random, this.density, this.scale, this.tempo);
        } else {
            this.particles = buildAuraParticles(this.recipe, random, this.density, this.scale, this.tempo, this.duration);
        }
    }

    get particleCount() {
        return this.particles.length;
    }

    draw(context, time, { showTarget = true, showOrigin = false } = {}) {
        const canvasWidth = context.canvas.width;
        const canvasHeight = context.canvas.height;
        const renderScale = Math.min(canvasWidth, canvasHeight) / BASE_SIZE;
        const offsetX = (canvasWidth - BASE_SIZE * renderScale) / 2;
        const offsetY = (canvasHeight - BASE_SIZE * renderScale) / 2;

        context.clearRect(0, 0, canvasWidth, canvasHeight);
        context.save();
        context.translate(offsetX, offsetY);
        context.scale(renderScale, renderScale);
        context.imageSmoothingEnabled = false;

        const safeTime = clamp(time, 0, this.duration);
        if (this.recipe.family === 'burst') {
            this.drawBurst(context, safeTime, showTarget);
        } else if (this.recipe.family === 'barrier') {
            this.drawBarrier(context, safeTime, showTarget);
        } else {
            this.drawAura(context, safeTime, showTarget);
        }

        if (showOrigin) drawOrigin(context, this.recipe.palette[0]);
        context.globalAlpha = 1;
        context.globalCompositeOperation = 'source-over';
        context.restore();
    }

    drawBurst(context, time, showTarget) {
        const recipe = this.recipe;
        const [light, bright, mid, deep, shadow] = recipe.palette;
        const progress = time / this.duration;
        const flash = 1 - smoothstep(0.02, 0.3, time);
        const heat = (1 - smoothstep(0.05, 0.72, progress)) * this.brightness;
        const motionTime = time * this.tempo;

        drawSquareGlow(context, 80, 80, 66 * this.scale, mid, heat * 0.52, 8);
        drawSquareGlow(context, 80, 80, 31 * this.scale, bright, heat * 0.38, 5);
        if (showTarget) drawTarget(context, shadow);

        for (let ringIndex = 0; ringIndex < recipe.rings; ringIndex += 1) {
            const delay = ringIndex * 0.09;
            const ringTime = Math.max(0, motionTime - delay);
            const maximum = recipe.radius * this.scale * (1 - ringIndex * 0.11);
            const radius = Math.min(maximum, ringTime * (176 - ringIndex * 22));
            const fade = (1 - clamp(radius / maximum)) * smoothstep(0, 0.06, ringTime);
            if (radius > 2 && fade > 0) {
                drawRing(context, {
                    radius,
                    segments: Math.max(18, Math.round(radius * 1.55)),
                    color: ringIndex === 0 ? bright : mid,
                    alpha: fade * this.brightness,
                    size: ringIndex === 0 && radius < maximum * 0.5 ? 3 : 2,
                    fragmentation: recipe.fragmentation + ringIndex * 0.05,
                    wobble: 0.8,
                    seed: recipe.seed + ringIndex * 97
                });
            }
        }

        if (flash > 0) {
            const size = Math.max(2, Math.round(12 * flash * this.scale));
            context.globalAlpha = flash * 0.5;
            context.fillStyle = bright;
            context.fillRect(80 - size * 2, 80 - size * 2, size * 4, size * 4);
            context.globalAlpha = flash;
            context.fillStyle = light;
            context.fillRect(80 - size, 80 - size, size * 2, size * 2);
        }

        if (time < 0.72) {
            const glyphAlpha = (1 - smoothstep(0.32, 0.72, time)) * smoothstep(0, 0.08, time);
            drawGlyph(context, recipe.motif, 9 * this.scale, recipe.palette, glyphAlpha, 0.9 + flash * 0.25);
        }

        this.particles.forEach((particle) => drawParticle(context, particle, time, this.brightness));
    }

    drawBarrier(context, time, showTarget) {
        const recipe = this.recipe;
        const [light, bright, mid, deep, shadow] = recipe.palette;
        const intro = easeOut(time / 0.55);
        const outro = 1 - smoothstep(this.duration - 0.95, this.duration, time);
        const alpha = intro * outro * this.brightness;
        const motionTime = time * this.tempo * recipe.direction;
        const pulse = 0.82 + Math.sin(motionTime * 4.2) * 0.18;
        const radius = recipe.radius * this.scale;

        drawSquareGlow(context, 80, 80, radius + 8, deep, alpha * 0.22, 6);
        if (showTarget) drawTarget(context, shadow);

        for (let ringIndex = 0; ringIndex < recipe.rings; ringIndex += 1) {
            const ringRadius = radius - ringIndex * between(createRandom(recipe.seed + ringIndex), 8, 12);
            const direction = ringIndex % 2 === 0 ? 1 : -1;
            drawRing(context, {
                radius: ringRadius * intro,
                segments: Math.max(18, Math.round(ringRadius * (0.72 + ringIndex * 0.08))),
                color: ringIndex === 0 ? bright : ringIndex % 2 ? deep : mid,
                alpha: alpha * pulse * (1 - ringIndex * 0.12),
                size: ringIndex === 0 ? 3 : 2,
                angle: motionTime * recipe.rotationSpeed * direction,
                fragmentation: ringIndex === 0 ? recipe.fragmentation * 0.4 : recipe.fragmentation,
                wobble: ringIndex === 0 ? 0.6 : 1.2,
                seed: recipe.seed + ringIndex * 131
            });
        }

        for (let index = 0; index < recipe.symmetry; index += 1) {
            const theta = index / recipe.symmetry * TAU + motionTime * recipe.rotationSpeed * 0.42;
            const x = Math.round(80 + Math.cos(theta) * radius * intro);
            const y = Math.round(80 + Math.sin(theta) * radius * intro);
            const block = index % 2 === 0 ? 6 : 4;
            context.globalAlpha = alpha;
            context.fillStyle = deep;
            context.fillRect(x - Math.floor(block / 2) + 1, y - Math.floor(block / 2) + 1, block, block);
            context.fillStyle = index % 2 === 0 ? light : bright;
            context.fillRect(x - Math.floor(block / 2), y - Math.floor(block / 2), block - 1, block - 1);
        }

        const lifeSegments = 36;
        const remaining = Math.round(lifeSegments * clamp((this.duration - time) / this.duration));
        for (let index = 0; index < remaining; index += 1) {
            const theta = index / lifeSegments * TAU - Math.PI / 2;
            context.globalAlpha = alpha * 0.62;
            context.fillStyle = light;
            context.fillRect(
                Math.round(80 + Math.cos(theta) * (radius - 6)) - 1,
                Math.round(80 + Math.sin(theta) * (radius - 6)) - 1,
                2,
                2
            );
        }

        drawGlyph(context, recipe.motif, 9 * this.scale, recipe.palette, alpha * 0.86, pulse);
        this.particles.forEach((particle) => drawParticle(context, particle, time, this.brightness));
    }

    drawAura(context, time, showTarget) {
        const recipe = this.recipe;
        const [light, bright, mid, deep, shadow] = recipe.palette;
        const intro = easeOut(time / 0.72);
        const outro = 1 - smoothstep(this.duration - 1.05, this.duration, time);
        const alpha = intro * outro * this.brightness;
        const motionTime = time * this.tempo * recipe.direction;
        const pulse = 0.78 + Math.sin(motionTime * 3.4) * 0.22;
        const radius = recipe.radius * this.scale * intro;

        drawSquareGlow(context, 80, 80, radius + 4, mid, alpha * pulse * 0.3, 8);
        drawRing(context, {
            radius,
            segments: Math.round(44 * this.density),
            color: bright,
            alpha: alpha * pulse,
            size: 2,
            angle: motionTime * 0.12,
            fragmentation: recipe.fragmentation,
            wobble: 2.4,
            seed: recipe.seed
        });

        for (let ringIndex = 1; ringIndex < recipe.rings; ringIndex += 1) {
            drawRing(context, {
                radius: radius - ringIndex * 10,
                segments: Math.max(18, Math.round(34 - ringIndex * 5)),
                color: ringIndex % 2 ? mid : deep,
                alpha: alpha * pulse * (0.55 - ringIndex * 0.08),
                size: 2,
                angle: -motionTime * recipe.rotationSpeed * ringIndex,
                fragmentation: recipe.fragmentation + 0.08,
                wobble: 1.2,
                seed: recipe.seed + ringIndex * 173
            });
        }

        if (showTarget) drawTarget(context, shadow);

        for (let index = 0; index < recipe.symmetry; index += 1) {
            const theta = index / recipe.symmetry * TAU + motionTime * 0.16;
            const anchorRadius = radius * 0.78;
            const x = 80 + Math.cos(theta) * anchorRadius;
            const y = 80 + Math.sin(theta) * anchorRadius;
            context.globalAlpha = alpha * (0.48 + 0.52 * Math.sin(motionTime * 4 + index));
            context.fillStyle = index % 3 === 0 ? light : bright;
            drawShape(context, x, y, index % 2 === 0 ? 4 : 3, index % 3 === 0 ? 'spark' : 'square');
        }

        drawGlyph(context, recipe.motif, 10 * this.scale, recipe.palette, alpha, pulse);
        this.particles.forEach((particle) => drawParticle(context, particle, time, this.brightness));
    }
}

export const renderEffectFrame = (recipe, time, size = 160, options = {}) => {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext('2d');
    const effect = new AbilityEffect(recipe);
    effect.draw(context, time, options);
    return canvas;
};

export const renderEffectFrames = async ({ recipe, size = 160, frameCount = 32, options = {} }) => {
    const effect = new AbilityEffect(recipe);
    const frames = [];
    for (let index = 0; index < frameCount; index += 1) {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const context = canvas.getContext('2d');
        const time = effect.duration * index / Math.max(1, frameCount - 1);
        effect.draw(context, time, options);
        frames.push(canvas);
        if (index % 4 === 3) await new Promise((resolve) => setTimeout(resolve, 0));
    }
    return { frames, effect };
};
