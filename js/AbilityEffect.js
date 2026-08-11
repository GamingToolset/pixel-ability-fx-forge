const TAU = Math.PI * 2;
const BASE_SIZE = 160;
const FRAME_INSET = 1;

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
const uniqueChoices = (random, values, count) => {
    const pool = [...values];
    const result = [];
    while (pool.length && result.length < count) {
        result.push(pool.splice(Math.floor(random() * pool.length), 1)[0]);
    }
    return result;
};

export const EFFECT_FAMILIES = {
    burst: {
        label: 'Impact · AoE',
        shortLabel: 'Impact',
        description: 'A short staged cast built from impact light, a readable silhouette and secondary debris.',
        suffixes: ['Detonation', 'Rupture', 'Nova', 'Cataclysm', 'Pulse', 'Break', 'Surge']
    },
    barrier: {
        label: 'Ward · Barrier',
        shortLabel: 'Barrier',
        description: 'A cast impact settles into a persistent defensive structure with anchors and moving layers.',
        suffixes: ['Bulwark', 'Ward', 'Bastion', 'Aegis', 'Seal', 'Rampart', 'Shell']
    },
    aura: {
        label: 'Aura · Restore',
        shortLabel: 'Aura',
        description: 'A broad sustained field with a distinct flow pattern, ambient motes and a soft release.',
        suffixes: ['Renewal', 'Bloom', 'Ascension', 'Grace', 'Resonance', 'Tide', 'Awakening']
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

export const FORMATIONS = {
    burst: {
        radial: { label: 'Radial bloom', geometries: ['circle', 'ellipse', 'clover'], flows: ['outward'] },
        cone: { label: 'Directional fan', geometries: ['fan', 'split-fan'], flows: ['forward'] },
        axes: { label: 'Axis rupture', geometries: ['star', 'crosswave'], flows: ['spoked'] },
        spiral: { label: 'Spiral break', geometries: ['spiral', 'clover'], flows: ['swirl'] },
        collapse: { label: 'Implosion', geometries: ['circle', 'diamond', 'star'], flows: ['inward'] },
        eruption: { label: 'Ground eruption', geometries: ['fan', 'wave'], flows: ['upward'] },
        twin: { label: 'Twin detonation', geometries: ['twin', 'ellipse'], flows: ['split'] },
        spokes: { label: 'Spoke burst', geometries: ['star', 'polygon'], flows: ['spoked'] },
        meteor: { label: 'Meteor shower', geometries: ['diagonal', 'split-fan'], flows: ['diagonal-fall'] },
        fissure: { label: 'Fissure break', geometries: ['bolt', 'zigzag', 'line'], flows: ['crack-out'] },
        cascade: { label: 'Cascade blast', geometries: ['staircase', 'fan'], flows: ['sequential'] },
        orbitBreak: { label: 'Orbit break', geometries: ['orbitals', 'spiral'], flows: ['orbit-release'] },
        crescent: { label: 'Crescent wave', geometries: ['crescent', 'bow'], flows: ['sweeping-arc'] },
        ricochet: { label: 'Ricochet burst', geometries: ['zigzag', 'polygon'], flows: ['bouncing'] },
        beam: { label: 'Focused beam', geometries: ['fan', 'diagonal'], flows: ['piercing'] },
        scatter: { label: 'Scatter field', geometries: ['lattice', 'square', 'star'], flows: ['fragmented'] }
    },
    barrier: {
        orbit: { label: 'Orbital ward', geometries: ['circle', 'ellipse'], flows: ['counter-orbit'] },
        polygon: { label: 'Polygon shell', geometries: ['polygon', 'diamond', 'square'], flows: ['stepped-orbit'] },
        broken: { label: 'Broken arcs', geometries: ['circle', 'ellipse', 'wave'], flows: ['drifting-arcs'] },
        satellites: { label: 'Satellite shield', geometries: ['circle', 'clover', 'star'], flows: ['satellite-orbit'] },
        braid: { label: 'Braided barrier', geometries: ['wave', 'clover', 'ellipse'], flows: ['counter-orbit'] },
        diamondField: { label: 'Diamond field', geometries: ['diamond', 'square'], flows: ['stepped-orbit'] },
        shell: { label: 'Layered shell', geometries: ['circle', 'polygon', 'star'], flows: ['pulse'] },
        compass: { label: 'Anchor array', geometries: ['crosswave', 'star', 'polygon'], flows: ['anchor-orbit'] },
        wall: { label: 'Energy wall', geometries: ['line', 'staircase'], flows: ['lateral-guard'] },
        cage: { label: 'Spiral cage', geometries: ['helix', 'hourglass'], flows: ['locking-spin'] },
        prism: { label: 'Prismatic shell', geometries: ['triangle', 'star'], flows: ['faceted-orbit'] },
        gates: { label: 'Rotating gates', geometries: ['square', 'diamond'], flows: ['gate-cycle'] },
        swarm: { label: 'Guardian swarm', geometries: ['orbitals', 'clover'], flows: ['swarm-orbit'] },
        hourglass: { label: 'Hourglass ward', geometries: ['hourglass', 'twin'], flows: ['counter-flow'] },
        cells: { label: 'Cellular shield', geometries: ['lattice', 'polygon'], flows: ['cell-pulse'] },
        arcArray: { label: 'Arc array', geometries: ['crescent', 'bow', 'split-fan'], flows: ['arc-cycle'] }
    },
    aura: {
        halo: { label: 'Halo field', geometries: ['circle', 'ellipse', 'clover'], flows: ['rise'] },
        fountain: { label: 'Energy fountain', geometries: ['fan', 'wave'], flows: ['fountain'] },
        spiral: { label: 'Spiral current', geometries: ['spiral', 'clover'], flows: ['swirl-rise'] },
        petals: { label: 'Petal bloom', geometries: ['star', 'clover'], flows: ['petal-rise'] },
        rain: { label: 'Falling veil', geometries: ['line', 'wave'], flows: ['fall'] },
        constellation: { label: 'Constellation field', geometries: ['star', 'circle'], flows: ['drift'] },
        helix: { label: 'Helix column', geometries: ['helix', 'ellipse'], flows: ['helix-rise'] },
        tide: { label: 'Tidal bands', geometries: ['wave', 'line', 'ellipse'], flows: ['lateral-wave'] },
        mist: { label: 'Ground mist', geometries: ['line', 'wave'], flows: ['low-drift'] },
        pillars: { label: 'Rising pillars', geometries: ['staircase', 'helix'], flows: ['column-rise'] },
        orbitLanes: { label: 'Orbit lanes', geometries: ['orbitals', 'ellipse'], flows: ['lane-orbit'] },
        wavefront: { label: 'Wavefront field', geometries: ['bow', 'wave'], flows: ['wavefront'] },
        leafVortex: { label: 'Leaf vortex', geometries: ['spiral', 'clover'], flows: ['vortex-rise'] },
        pulseGrid: { label: 'Pulse grid', geometries: ['lattice', 'square'], flows: ['grid-pulse'] },
        comets: { label: 'Comet blessing', geometries: ['diagonal', 'split-fan'], flows: ['comet-fall'] },
        swarm: { label: 'Mote swarm', geometries: ['orbitals', 'star'], flows: ['living-swarm'] }
    }
};

export const TRACE_STYLES = ['pixels', 'dashes', 'shards', 'clusters', 'sparks', 'chain', 'streaks', 'paired', 'checker', 'spray', 'beads'];
export const PARTICLE_KITS = {
    embers: ['square', 'cluster', 'spark'],
    shards: ['shard', 'diamond', 'streak'],
    motes: ['circle', 'square', 'spark'],
    facets: ['diamond', 'cross', 'chevron'],
    dust: ['cluster', 'square', 'pebble'],
    needles: ['streak', 'shard', 'spark'],
    flakes: ['cross', 'diamond', 'spark'],
    wisps: ['circle', 'streak', 'square'],
    cinders: ['square', 'spark', 'cluster'],
    crystals: ['diamond', 'shard', 'chevron'],
    droplets: ['pebble', 'streak', 'circle'],
    petals: ['chevron', 'diamond', 'circle'],
    bolts: ['streak', 'spark', 'chevron'],
    bubbles: ['circle', 'pebble', 'square']
};
const GLOW_STYLES = ['square', 'diamond', 'bands', 'soft', 'wedges', 'halo', 'none'];
export const TEMPORAL_STYLES = ['instant', 'staggered', 'double-pulse', 'slow-build', 'echo'];
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
    const formationKeys = Object.keys(FORMATIONS[familyKey]);
    const formationKey = choose(random, formationKeys);
    const formation = FORMATIONS[familyKey][formationKey];
    const geometry = choose(random, formation.geometries);
    const secondaryFormationKey = choose(random, formationKeys.filter((key) => key !== formationKey));
    const secondaryFormation = FORMATIONS[familyKey][secondaryFormationKey];
    const secondaryGeometry = choose(random, secondaryFormation.geometries);
    const particleKitKey = choose(random, Object.keys(PARTICLE_KITS));
    const particleShapes = uniqueChoices(random, PARTICLE_KITS[particleKitKey], integer(random, 2, 3));
    const palette = [...elementData.palette];

    if (random() > 0.5) [palette[1], palette[2]] = [palette[2], palette[1]];
    if (random() > 0.72) [palette[3], palette[4]] = [palette[4], palette[3]];

    const durationRanges = {
        burst: [2.2, 3.45],
        barrier: [5.2, 8.1],
        aura: [4.9, 7.8]
    };
    const radiusRanges = {
        burst: [46, 67],
        barrier: [43, 66],
        aura: [56, 77]
    };
    const ringRanges = familyKey === 'burst' ? [1, 4] : [1, 5];
    const symmetryValues = familyKey === 'burst' ? [3, 4, 5, 6, 7, 8, 10] : [3, 4, 5, 6, 8, 10, 12];
    const narrowFormation = formationKey === 'beam';
    const arcSpan = narrowFormation
        ? between(random, Math.PI * 0.12, Math.PI * 0.32)
        : formationKey === 'crescent' || formationKey === 'arcArray'
            ? between(random, Math.PI * 0.65, Math.PI * 1.08)
            : between(random, Math.PI * 0.55, Math.PI * 1.45);

    return {
        seed: normalizedSeed,
        family: familyKey,
        element: elementKey,
        power: powerKey,
        name: `${elementData.adjective} ${choose(random, familyData.suffixes)}`,
        label: familyData.label,
        description: familyData.description,
        palette,
        formation: formationKey,
        formationLabel: formation.label,
        geometry,
        hybrid: random() > 0.22,
        secondaryFormation: secondaryFormationKey,
        secondaryFormationLabel: secondaryFormation.label,
        secondaryGeometry,
        flow: choose(random, formation.flows),
        traceStyle: choose(random, TRACE_STYLES),
        secondaryTraceStyle: choose(random, TRACE_STYLES),
        particleKit: particleKitKey,
        particleShapes,
        glowStyle: choose(random, GLOW_STYLES),
        duration: between(random, ...durationRanges[familyKey]),
        density: powerData.density * between(random, 0.82, 1.18),
        scale: powerData.scale * between(random, 0.88, 1.1),
        brightness: powerData.brightness,
        gravity: elementData.gravity + between(random, -18, 18),
        layers: integer(random, ringRanges[0], ringRanges[1]),
        symmetry: choose(random, symmetryValues),
        direction: random() > 0.5 ? 1 : -1,
        rotationSpeed: between(random, 0.22, 1.08),
        radius: between(random, ...radiusRanges[familyKey]),
        fragmentation: between(random, 0.08, 0.46),
        aspectX: between(random, 0.72, 1.18),
        aspectY: between(random, 0.72, 1.18),
        tilt: between(random, -Math.PI, Math.PI),
        arcSpan,
        twist: between(random, 0.8, 3.8),
        pulseRate: between(random, 2.2, 6.2),
        temporalStyle: choose(random, TEMPORAL_STYLES),
        secondaryScale: between(random, 0.42, 0.78),
        secondaryPhase: between(random, -Math.PI, Math.PI),
        geometrySides: integer(random, 3, 10),
        gridSize: integer(random, 3, 7),
        originCount: integer(random, 1, familyKey === 'burst' ? 4 : 3),
        originSpread: between(random, 8, 28),
        originX: BASE_SIZE / 2,
        originY: BASE_SIZE / 2,
        trails: random() > 0.38,
        anchors: random() > 0.34,
        coreCloud: random() > 0.42
    };
};

const drawPixelCircle = (context, x, y, radius) => {
    const r = Math.max(1, Math.round(radius));
    for (let row = -r; row <= r; row += 1) {
        const chord = Math.floor(Math.sqrt(Math.max(0, r * r - row * row)));
        context.fillRect(Math.round(x) - chord, Math.round(y) + row, chord * 2 + 1, 1);
    }
};

const shapeExtent = (size, shape = 'square') => {
    const pixelSize = Math.max(1, Math.round(size));
    const half = Math.ceil(pixelSize / 2);
    if (shape === 'cluster') return Math.max(2, Math.ceil(pixelSize * 0.72) + 1);
    if (shape === 'streak') return half + 2;
    return half + 1;
};

const drawShape = (context, x, y, size, shape) => {
    const pixelSize = Math.max(1, Math.round(size));
    const half = Math.floor(pixelSize / 2);
    const extent = shapeExtent(pixelSize, shape);
    const minimum = FRAME_INSET + extent;
    const maximum = BASE_SIZE - 1 - FRAME_INSET - extent;
    const px = Math.round(clamp(x, minimum, maximum));
    const py = Math.round(clamp(y, minimum, maximum));

    switch (shape) {
        case 'diamond':
            for (let row = -half; row <= half; row += 1) {
                const width = Math.max(1, pixelSize - Math.abs(row) * 2);
                context.fillRect(px - Math.floor(width / 2), py + row, width, 1);
            }
            break;
        case 'cross':
            for (let offset = -half; offset <= half; offset += 1) {
                context.fillRect(px + offset, py + offset, 1, 1);
                context.fillRect(px - offset, py + offset, 1, 1);
            }
            break;
        case 'spark':
            context.fillRect(px - half, py, pixelSize, 1);
            context.fillRect(px, py - half, 1, pixelSize);
            if (pixelSize >= 5) context.fillRect(px - 1, py - 1, 3, 3);
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
        case 'pebble':
            drawPixelCircle(context, px, py, pixelSize / 2);
            break;
        case 'shard':
            for (let row = 0; row < pixelSize; row += 1) {
                const width = Math.max(1, Math.round(1 + row / Math.max(1, pixelSize - 1) * pixelSize * 0.65));
                context.fillRect(px - Math.floor(width / 2), py - half + row, width, 1);
            }
            break;
        case 'streak':
            context.fillRect(px - 1, py - half, 2, pixelSize);
            context.fillRect(px, py - half - 1, 1, Math.max(1, Math.floor(pixelSize * 0.45)));
            break;
        case 'chevron':
            for (let offset = 0; offset <= half; offset += 1) {
                context.fillRect(px - offset, py - half + offset, 1, 2);
                context.fillRect(px + offset, py - half + offset, 1, 2);
            }
            break;
        case 'square':
        default:
            context.fillRect(px - half, py - half, pixelSize, pixelSize);
            break;
    }
};

const drawGlow = (context, recipe, radius, alpha) => {
    if (recipe.glowStyle === 'none' || alpha <= 0) return;
    const color = recipe.palette[2];
    const x = recipe.originX;
    const y = recipe.originY;
    const steps = 7;
    const safeRadius = Math.min(radius, BASE_SIZE / 2 - FRAME_INSET - 5);

    for (let step = steps; step >= 1; step -= 1) {
        const amount = step / steps;
        const r = Math.max(1, Math.round(safeRadius * amount));
        context.globalAlpha = alpha * (1 - amount) * 0.68;
        context.fillStyle = color;

        if (recipe.glowStyle === 'diamond') {
            for (let row = -r; row <= r; row += 2) {
                const width = Math.max(1, (r - Math.abs(row)) * 2);
                context.fillRect(Math.round(x - width / 2), Math.round(y + row), width, 2);
            }
        } else if (recipe.glowStyle === 'bands') {
            context.fillRect(Math.round(x - r), Math.round(y - r * 0.24), r * 2, Math.max(2, Math.round(r * 0.48)));
            context.fillRect(Math.round(x - r * 0.24), Math.round(y - r), Math.max(2, Math.round(r * 0.48)), r * 2);
        } else if (recipe.glowStyle === 'soft') {
            drawPixelCircle(context, x, y, r);
        } else if (recipe.glowStyle === 'wedges') {
            const thickness = Math.max(2, Math.round(r * 0.22));
            context.fillRect(Math.round(x - r), Math.round(y - thickness / 2), Math.round(r * 0.72), thickness);
            context.fillRect(Math.round(x + r * 0.28), Math.round(y - thickness / 2), Math.round(r * 0.72), thickness);
            context.fillRect(Math.round(x - thickness / 2), Math.round(y - r), thickness, Math.round(r * 0.72));
            context.fillRect(Math.round(x - thickness / 2), Math.round(y + r * 0.28), thickness, Math.round(r * 0.72));
        } else if (recipe.glowStyle === 'halo') {
            const thickness = Math.max(2, Math.round(r * 0.16));
            context.fillRect(Math.round(x - r), Math.round(y - r), r * 2, thickness);
            context.fillRect(Math.round(x - r), Math.round(y + r - thickness), r * 2, thickness);
            context.fillRect(Math.round(x - r), Math.round(y - r), thickness, r * 2);
            context.fillRect(Math.round(x + r - thickness), Math.round(y - r), thickness, r * 2);
        } else {
            context.fillRect(Math.round(x - r), Math.round(y - r), r * 2, r * 2);
        }
    }
    context.globalAlpha = 1;
};

const fittedRadius = (recipe, radius) => {
    const maxAspect = Math.max(1, recipe.aspectX, recipe.aspectY);
    const safeDistance = BASE_SIZE / 2 - FRAME_INSET - 7;
    return Math.min(radius, safeDistance / (maxAspect * 1.16));
};

const formationPoint = (recipe, geometry, unit, radius, phase = 0, layer = 0) => {
    radius = fittedRadius(recipe, radius);
    let theta = unit * TAU + phase + recipe.tilt;
    let distance = radius;
    let x;
    let y;

    if (geometry === 'fan' || geometry === 'split-fan' || geometry === 'crescent' || geometry === 'bow') {
        const side = geometry === 'split-fan' && unit > 0.5 ? Math.PI : 0;
        const local = geometry === 'split-fan' ? (unit % 0.5) * 2 : unit;
        theta = recipe.tilt + (local - 0.5) * recipe.arcSpan + side;
        if (geometry === 'crescent') distance *= 0.72 + 0.28 * Math.sin(local * Math.PI);
        if (geometry === 'bow') distance *= 0.82 + 0.18 * Math.cos((local - 0.5) * Math.PI);
    } else if (geometry === 'diamond') {
        distance *= 1.08 / Math.max(0.72, Math.abs(Math.cos(theta)) + Math.abs(Math.sin(theta)));
    } else if (geometry === 'square') {
        distance *= 0.78 / Math.max(0.55, Math.max(Math.abs(Math.cos(theta)), Math.abs(Math.sin(theta))));
    } else if (geometry === 'polygon' || geometry === 'triangle') {
        const sides = geometry === 'triangle' ? 3 : Math.max(3, recipe.geometrySides || recipe.symmetry);
        const sector = TAU / sides;
        const local = ((theta + sector / 2) % sector + sector) % sector - sector / 2;
        distance *= Math.cos(Math.PI / sides) / Math.max(0.4, Math.cos(local));
    } else if (geometry === 'star') {
        distance *= 0.7 + 0.3 * (0.5 + 0.5 * Math.cos(theta * recipe.symmetry));
    } else if (geometry === 'clover') {
        distance *= 0.76 + 0.24 * Math.cos(theta * Math.max(2, Math.round(recipe.symmetry / 2)));
    } else if (geometry === 'crosswave') {
        distance *= 0.58 + 0.42 * Math.abs(Math.cos(theta * 2));
    } else if (geometry === 'spiral') {
        distance *= 0.16 + unit * 0.84;
        theta += unit * TAU * recipe.twist;
    } else if (geometry === 'wave') {
        distance += Math.sin(unit * TAU * recipe.twist + phase * 3) * (4 + layer * 1.5);
    } else if (geometry === 'twin') {
        distance *= 0.72 + 0.28 * Math.abs(Math.cos(theta));
    } else if (geometry === 'orbitals') {
        distance *= 0.74 + 0.18 * Math.sin(theta * 3 + phase * 2) + 0.08 * Math.sin(theta * 7);
    } else if (geometry === 'hourglass') {
        x = recipe.originX + Math.sin(theta) * radius * (0.22 + Math.abs(Math.cos(theta)) * 0.78) * recipe.aspectX;
        y = recipe.originY + Math.cos(theta) * radius * recipe.aspectY;
        return { x, y, theta };
    } else if (geometry === 'diagonal') {
        const along = lerp(-radius, radius, unit);
        const bend = Math.sin(unit * TAU * recipe.twist + phase) * radius * 0.12;
        x = recipe.originX + (along * Math.cos(recipe.tilt) - bend * Math.sin(recipe.tilt)) * recipe.aspectX;
        y = recipe.originY + (along * Math.sin(recipe.tilt) + bend * Math.cos(recipe.tilt)) * recipe.aspectY;
        return { x, y, theta: recipe.tilt };
    } else if (geometry === 'bolt' || geometry === 'zigzag') {
        const steps = Math.max(4, recipe.gridSize * 2);
        const step = Math.min(steps - 1, Math.floor(unit * steps));
        const along = lerp(-radius, radius, unit);
        const amplitude = geometry === 'bolt' ? radius * 0.18 : radius * 0.42;
        const bend = (step % 2 ? 1 : -1) * amplitude;
        x = recipe.originX + (along * Math.cos(recipe.tilt) - bend * Math.sin(recipe.tilt)) * recipe.aspectX;
        y = recipe.originY + (along * Math.sin(recipe.tilt) + bend * Math.cos(recipe.tilt)) * recipe.aspectY;
        return { x, y, theta: recipe.tilt };
    } else if (geometry === 'staircase') {
        const steps = Math.max(3, recipe.gridSize);
        const step = Math.min(steps - 1, Math.floor(unit * steps));
        const amount = step / Math.max(1, steps - 1);
        x = recipe.originX + lerp(-radius, radius, amount) * recipe.aspectX;
        y = recipe.originY + lerp(radius, -radius, amount) * recipe.aspectY + (unit * steps - step) * radius * 0.28;
        return { x, y, theta: -Math.PI / 4 };
    } else if (geometry === 'lattice') {
        const grid = Math.max(3, recipe.gridSize);
        const cell = Math.min(grid * grid - 1, Math.floor(unit * grid * grid));
        const column = cell % grid;
        const row = Math.floor(cell / grid);
        x = recipe.originX + lerp(-radius, radius, column / Math.max(1, grid - 1)) * recipe.aspectX;
        y = recipe.originY + lerp(-radius, radius, row / Math.max(1, grid - 1)) * recipe.aspectY;
        return { x, y, theta: 0 };
    } else if (geometry === 'line') {
        x = recipe.originX + lerp(-radius, radius, unit) * recipe.aspectX;
        y = recipe.originY + Math.sin(unit * TAU * recipe.twist + phase) * 6 * recipe.aspectY;
        return { x, y, theta: 0 };
    } else if (geometry === 'helix') {
        x = recipe.originX + Math.sin(unit * TAU * recipe.twist + phase) * radius * 0.45 * recipe.aspectX;
        y = recipe.originY + lerp(radius, -radius, unit) * recipe.aspectY;
        return { x, y, theta };
    }

    x = recipe.originX + Math.cos(theta) * distance * recipe.aspectX;
    y = recipe.originY + Math.sin(theta) * distance * recipe.aspectY;
    return { x, y, theta };
};

const drawTraceBlock = (context, style, point, size, color, index) => {
    const extent = Math.max(size + 2, shapeExtent(size + 3, style === 'streaks' ? 'streak' : 'square'));
    const minimum = FRAME_INSET + extent;
    const maximum = BASE_SIZE - 1 - FRAME_INSET - extent;
    const safePoint = {
        ...point,
        x: clamp(point.x, minimum, maximum),
        y: clamp(point.y, minimum, maximum)
    };
    context.fillStyle = color;
    if (style === 'dashes') {
        if (Math.abs(Math.cos(safePoint.theta)) > Math.abs(Math.sin(safePoint.theta))) {
            context.fillRect(Math.round(safePoint.x) - 1, Math.round(safePoint.y) - size, 3, size * 2 + 1);
        } else {
            context.fillRect(Math.round(safePoint.x) - size, Math.round(safePoint.y) - 1, size * 2 + 1, 3);
        }
    } else if (style === 'shards') {
        drawShape(context, safePoint.x, safePoint.y, size + 2, 'diamond');
    } else if (style === 'clusters') {
        drawShape(context, safePoint.x, safePoint.y, size + (index % 5 === 0 ? 2 : 0), 'cluster');
    } else if (style === 'sparks') {
        drawShape(context, safePoint.x, safePoint.y, size + 2, 'spark');
    } else if (style === 'chain') {
        drawShape(context, safePoint.x, safePoint.y, index % 2 === 0 ? size + 2 : size, index % 2 === 0 ? 'diamond' : 'square');
    } else if (style === 'streaks') {
        drawShape(context, safePoint.x, safePoint.y, size + 3, 'streak');
    } else if (style === 'paired') {
        drawShape(context, safePoint.x - 2, safePoint.y, size, 'square');
        drawShape(context, safePoint.x + 2, safePoint.y, size, 'square');
    } else if (style === 'checker') {
        drawShape(context, safePoint.x, safePoint.y, size + (index % 2), index % 2 ? 'diamond' : 'square');
    } else if (style === 'spray') {
        drawShape(context, safePoint.x, safePoint.y, size, 'cluster');
        if (index % 3 === 0) drawShape(context, safePoint.x + 3, safePoint.y - 2, Math.max(1, size - 1), 'square');
    } else if (style === 'beads') {
        drawShape(context, safePoint.x, safePoint.y, size + (index % 4 === 0 ? 2 : 0), 'circle');
    } else {
        drawShape(context, safePoint.x, safePoint.y, size, 'square');
    }
};

const drawFormation = (context, recipe, {
    geometry = recipe.geometry,
    radius,
    segments,
    alpha,
    size = 2,
    phase = 0,
    layer = 0,
    style = recipe.traceStyle,
    fragmentation = recipe.fragmentation
}) => {
    const pointCount = geometry === 'lattice' ? recipe.gridSize * recipe.gridSize : segments;
    for (let index = 0; index < pointCount; index += 1) {
        const unit = index / Math.max(1, pointCount);
        const noise = ((Math.imul(index + 1 + layer * 101, 2654435761) ^ recipe.seed) >>> 0) / 4294967296;
        const arcGap = style === 'dashes' && Math.floor(index / 4) % 3 === 1;
        const brokenGap = (recipe.formation === 'broken' || recipe.formation === 'arcArray') && Math.floor(index / 5) % 4 === 2;
        if (noise < fragmentation || arcGap || brokenGap) continue;
        const point = formationPoint(recipe, geometry, unit, radius, phase, layer);
        const twinkle = 0.58 + 0.42 * Math.sin(index * 0.91 + phase * 5.3 + recipe.seed * 0.001);
        const colorIndex = (index + layer * 2) % Math.max(1, recipe.palette.length - 1);
        context.globalAlpha = alpha * clamp(twinkle, 0.16, 1);
        drawTraceBlock(context, style, point, index % 13 === 0 ? size + 1 : size, recipe.palette[colorIndex], index);
    }
    context.globalAlpha = 1;
};

const temporalIntensity = (recipe, time, progress) => {
    if (recipe.temporalStyle === 'double-pulse') return 0.72 + Math.abs(Math.sin(time * recipe.pulseRate * 0.72)) * 0.28;
    if (recipe.temporalStyle === 'slow-build') return 0.52 + easeOut(progress) * 0.48;
    if (recipe.temporalStyle === 'staggered') return 0.82 + Math.sin(time * recipe.pulseRate + progress * TAU) * 0.18;
    if (recipe.temporalStyle === 'echo') return 0.78 + Math.sin(time * recipe.pulseRate * 0.5) * 0.22;
    return 1;
};

const drawHybridAccent = (context, recipe, radius, alpha, phase, layer = 0) => {
    if (!recipe.hybrid || alpha <= 0) return;
    drawFormation(context, recipe, {
        geometry: recipe.secondaryGeometry,
        radius: radius * recipe.secondaryScale,
        segments: Math.max(14, Math.round((22 + recipe.symmetry * 2) * recipe.density)),
        alpha: alpha * 0.62,
        size: 2,
        phase: phase * -0.72 + recipe.secondaryPhase,
        layer: layer + 17,
        style: recipe.secondaryTraceStyle,
        fragmentation: clamp(recipe.fragmentation + 0.08, 0, 0.62)
    });
};

const drawCoreCloud = (context, recipe, alpha, radius, phase) => {
    if (!recipe.coreCloud || alpha <= 0) return;
    const random = createRandom(recipe.seed ^ 0x71e4a3b9);
    const count = Math.round(12 + recipe.density * 12);
    for (let index = 0; index < count; index += 1) {
        const theta = between(random, 0, TAU) + phase * (index % 2 ? 1 : -1);
        const distance = between(random, 2, radius) * (0.82 + Math.sin(phase * 2 + index) * 0.18);
        const point = {
            x: recipe.originX + Math.cos(theta) * distance,
            y: recipe.originY + Math.sin(theta) * distance,
            theta
        };
        context.globalAlpha = alpha * between(random, 0.28, 0.82);
        drawTraceBlock(context, index % 4 === 0 ? 'sparks' : 'pixels', point, integer(random, 1, 3), choose(random, recipe.palette.slice(0, 3)), index);
    }
    context.globalAlpha = 1;
};

const drawAnchors = (context, recipe, radius, alpha, phase, force = false) => {
    if (!recipe.anchors && !force) return;
    for (let index = 0; index < recipe.symmetry; index += 1) {
        const point = formationPoint(recipe, recipe.geometry, index / recipe.symmetry, radius, phase);
        const block = index % 2 === 0 ? 5 : 3;
        context.globalAlpha = alpha;
        context.fillStyle = recipe.palette[4];
        drawShape(context, point.x + 1, point.y + 1, block + 2, recipe.traceStyle === 'shards' ? 'diamond' : 'square');
        context.fillStyle = index % 2 === 0 ? recipe.palette[0] : recipe.palette[1];
        drawShape(context, point.x, point.y, block, recipe.traceStyle === 'clusters' ? 'cluster' : 'diamond');
    }
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
    wave: 0,
    waveRate: 0,
    phase: 0,
    trail: false,
    ...overrides
});

const particleShape = (recipe, random) => choose(random, recipe.particleShapes);

const buildBurstParticles = (recipe, random) => {
    const particles = [];
    const count = Math.round(between(random, 70, 132) * recipe.density);
    const secondaryCount = Math.round(between(random, 22, 58) * recipe.density);
    const collapse = recipe.formation === 'collapse';
    const eruption = recipe.formation === 'eruption';
    const cone = recipe.formation === 'cone' || recipe.formation === 'beam' || recipe.formation === 'crescent';
    const meteor = recipe.formation === 'meteor';
    const fissure = recipe.formation === 'fissure';
    const scatter = recipe.formation === 'scatter';
    const orbitBreak = recipe.formation === 'orbitBreak';

    for (let index = 0; index < count; index += 1) {
        let theta = between(random, 0, TAU);
        let originX = recipe.originX + between(random, -4, 4);
        let originY = recipe.originY + between(random, -4, 4);

        if (recipe.originCount > 1 && !collapse) {
            const originIndex = index % recipe.originCount;
            const offset = (originIndex - (recipe.originCount - 1) / 2) * recipe.originSpread;
            originX += Math.cos(recipe.tilt + Math.PI / 2) * offset;
            originY += Math.sin(recipe.tilt + Math.PI / 2) * offset;
        }

        if (cone) theta = recipe.tilt + between(random, -recipe.arcSpan / 2, recipe.arcSpan / 2);
        if (eruption) theta = -Math.PI / 2 + between(random, -0.82, 0.82);
        if (meteor) {
            originX = recipe.originX + between(random, -recipe.radius, recipe.radius);
            originY = recipe.originY + between(random, -16, 8);
            theta = Math.PI / 2 + between(random, -0.42, 0.42);
        }
        if (fissure || scatter) {
            const point = formationPoint(recipe, recipe.geometry, index / count, recipe.radius * between(random, 0.42, 0.92), 0);
            originX = point.x;
            originY = point.y;
            theta = Math.atan2(originY - recipe.originY, originX - recipe.originX) + between(random, -0.35, 0.35);
        }
        if (recipe.formation === 'axes' || recipe.formation === 'spokes' || recipe.formation === 'ricochet') {
            theta = Math.round(theta / (TAU / recipe.symmetry)) * (TAU / recipe.symmetry) + between(random, -0.09, 0.09);
        }
        if (recipe.formation === 'twin') {
            const side = index % 2 ? -1 : 1;
            originX += side * between(random, 8, 16);
            theta += side > 0 ? 0 : Math.PI;
        }

        const speedMultiplier = recipe.formation === 'beam' ? 1.55 : meteor ? 1.18 : fissure ? 0.82 : 1;
        const speed = between(random, 30, 132) * recipe.scale * speedMultiplier;
        const spawnRadius = collapse ? between(random, recipe.radius * 0.7, recipe.radius * 1.15) : 0;
        if (collapse) {
            originX = recipe.originX + Math.cos(theta) * spawnRadius * recipe.aspectX;
            originY = recipe.originY + Math.sin(theta) * spawnRadius * recipe.aspectY;
            theta += Math.PI + between(random, -0.14, 0.14);
        }
        if (recipe.formation === 'spiral' || orbitBreak) theta += recipe.direction * Math.PI / 2 * between(random, 0.45, 0.9);

        let spawn = between(random, collapse ? 0 : 0.01, collapse ? 0.42 : 0.2);
        if (recipe.temporalStyle === 'staggered') spawn += index / count * 0.48;
        if (recipe.temporalStyle === 'double-pulse' && index % 3 === 0) spawn += 0.44;
        if (recipe.temporalStyle === 'echo' && index % 4 === 0) spawn += 0.68;

        particles.push(makeParticle({
            spawn,
            life: between(random, 0.38, 1.55),
            x: originX,
            y: originY,
            vx: Math.cos(theta) * speed,
            vy: Math.sin(theta) * speed,
            gravity: eruption ? Math.abs(recipe.gravity) + 52 : meteor ? Math.abs(recipe.gravity) + 28 : recipe.gravity,
            drag: between(random, 0.28, 0.82),
            sizeStart: integer(random, 2, 7) * recipe.scale,
            sizeEnd: between(random, 0.4, 1.6),
            color: choose(random, recipe.palette.slice(0, 4)),
            shape: particleShape(recipe, random),
            orbit: recipe.formation === 'spiral' || orbitBreak ? between(random, -20, 20) : 0,
            wave: cone || recipe.formation === 'ricochet' ? between(random, 0, 9) : 0,
            waveRate: between(random, 3, 8),
            phase: between(random, 0, TAU),
            trail: recipe.trails && random() > 0.35
        }));
    }

    for (let index = 0; index < secondaryCount; index += 1) {
        const theta = between(random, 0, TAU);
        const radius = between(random, 6, recipe.radius * 0.72);
        const rising = !eruption && recipe.flow !== 'forward';
        particles.push(makeParticle({
            spawn: between(random, 0.08, 1.45),
            life: between(random, 0.55, 1.55),
            x: recipe.originX + Math.cos(theta) * radius,
            y: recipe.originY + Math.sin(theta) * radius,
            vx: between(random, -18, 18),
            vy: rising ? between(random, -68, -20) : between(random, -18, 20),
            gravity: rising ? -recipe.gravity * 0.22 : Math.abs(recipe.gravity),
            drag: 0.18,
            sizeStart: integer(random, 1, 4) * recipe.scale,
            sizeEnd: 1,
            color: choose(random, recipe.palette.slice(0, 3)),
            shape: particleShape(recipe, random),
            orbit: recipe.formation === 'spiral' || orbitBreak ? between(random, -14, 14) : 0,
            phase: theta,
            trail: recipe.trails && random() > 0.6
        }));
    }
    return particles;
};

const buildBarrierParticles = (recipe, random) => {
    const particles = [];
    const impactCount = Math.round(between(random, 24, 62) * recipe.density);
    const ambientCount = Math.round(between(random, 18, 48) * recipe.density);

    for (let index = 0; index < impactCount; index += 1) {
        let theta = between(random, 0, TAU);
        const speed = between(random, 28, 102) * recipe.scale;
        const originOffset = recipe.originCount > 1
            ? (index % recipe.originCount - (recipe.originCount - 1) / 2) * recipe.originSpread
            : 0;
        if (recipe.formation === 'wall') theta = index % 2 ? 0 : Math.PI;
        let spawn = between(random, 0, 0.18);
        if (recipe.temporalStyle === 'staggered') spawn += index / impactCount * 0.42;
        if (recipe.temporalStyle === 'double-pulse' && index % 3 === 0) spawn += 0.46;
        particles.push(makeParticle({
            spawn,
            life: between(random, 0.3, 0.95),
            x: recipe.originX + between(random, -5, 5) + originOffset,
            y: recipe.originY + between(random, -5, 5),
            vx: Math.cos(theta) * speed,
            vy: Math.sin(theta) * speed,
            gravity: Math.abs(recipe.gravity) + 18,
            drag: 0.68,
            sizeStart: integer(random, 2, 5) * recipe.scale,
            sizeEnd: 1,
            color: choose(random, recipe.palette.slice(0, 4)),
            shape: particleShape(recipe, random),
            phase: theta,
            trail: recipe.trails && random() > 0.52
        }));
    }

    for (let index = 0; index < ambientCount; index += 1) {
        const unit = index / ambientCount;
        const geometry = recipe.hybrid && index % 3 === 0 ? recipe.secondaryGeometry : recipe.geometry;
        const point = formationPoint(recipe, geometry, unit, recipe.radius * between(random, 0.72, 1.08), 0);
        const life = between(random, 0.75, 1.65);
        const spawn = between(random, 0.08, Math.max(0.2, recipe.duration - life - 0.1));
        let vx = between(random, -9, 9);
        let vy = between(random, -28, -7);
        let gravity = 12;
        let orbit = recipe.flow.includes('orbit') ? between(random, -11, 11) : 0;
        if (recipe.formation === 'cells') {
            vx = between(random, -2, 2);
            vy = between(random, -3, 3);
            gravity = 0;
        } else if (recipe.formation === 'wall') {
            vx = index % 2 ? between(random, 8, 22) : between(random, -22, -8);
            vy = between(random, -6, 6);
            gravity = 0;
        } else if (recipe.formation === 'cage' || recipe.formation === 'swarm') {
            orbit = between(random, -24, 24);
            gravity = 0;
        } else if (recipe.formation === 'hourglass') {
            vy = index % 2 ? between(random, -24, -8) : between(random, 8, 24);
            gravity = 0;
        }
        particles.push(makeParticle({
            spawn,
            life,
            x: point.x,
            y: point.y,
            vx,
            vy,
            gravity,
            drag: 0.26,
            sizeStart: integer(random, 1, 4) * recipe.scale,
            sizeEnd: 1,
            color: choose(random, recipe.palette.slice(0, 4)),
            shape: particleShape(recipe, random),
            orbit,
            phase: between(random, 0, TAU)
        }));
    }
    return particles;
};

const buildAuraParticles = (recipe, random) => {
    const particles = [];
    const bloomCount = Math.round(between(random, 28, 66) * recipe.density);
    const moteCount = Math.round(between(random, 64, 124) * recipe.density);

    for (let index = 0; index < bloomCount; index += 1) {
        const theta = between(random, 0, TAU);
        const speed = between(random, 12, 62) * recipe.scale;
        particles.push(makeParticle({
            spawn: between(random, 0, 0.28),
            life: between(random, 0.48, 1.65),
            x: recipe.originX + between(random, -7, 7),
            y: recipe.originY + between(random, -7, 7),
            vx: Math.cos(theta) * speed * 0.72,
            vy: Math.sin(theta) * speed * 0.72 - between(random, 2, 18),
            gravity: -8,
            drag: 0.32,
            sizeStart: integer(random, 2, 5) * recipe.scale,
            sizeEnd: 1,
            color: choose(random, recipe.palette.slice(0, 4)),
            shape: particleShape(recipe, random),
            phase: theta,
            trail: recipe.trails && random() > 0.55
        }));
    }

    for (let index = 0; index < moteCount; index += 1) {
        const theta = between(random, 0, TAU);
        const radius = between(random, 8, recipe.radius + 5) * recipe.scale;
        const life = between(random, 0.62, 1.62);
        const spawn = between(random, 0.3, Math.max(0.5, recipe.duration - life - 0.08));
        let x = recipe.originX + Math.cos(theta) * radius * recipe.aspectX;
        let y = recipe.originY + Math.sin(theta) * radius * recipe.aspectY;
        let vx = between(random, -7, 7);
        let vy = between(random, -50, -22);
        let gravity = -5;
        let orbit = 0;
        let wave = 0;

        if (recipe.formation === 'fountain') {
            x = recipe.originX + between(random, -16, 16);
            y = recipe.originY + between(random, 10, 25);
            vx = between(random, -34, 34);
            vy = between(random, -92, -42);
            gravity = between(random, 32, 78);
        } else if (recipe.formation === 'rain') {
            x = recipe.originX + between(random, -recipe.radius, recipe.radius);
            y = recipe.originY - recipe.radius + between(random, -18, 8);
            vx = between(random, -7, 7);
            vy = between(random, 32, 74);
            gravity = 16;
        } else if (recipe.formation === 'spiral' || recipe.formation === 'helix' || recipe.formation === 'leafVortex') {
            orbit = between(random, -20, 20);
            wave = between(random, 4, 14);
        } else if (recipe.formation === 'constellation') {
            vx = between(random, -3, 3);
            vy = between(random, -6, 2);
            gravity = 0;
        } else if (recipe.formation === 'tide') {
            vx = between(random, -22, 22);
            vy = between(random, -18, 4);
            wave = between(random, 8, 18);
        } else if (recipe.formation === 'petals') {
            const snapped = Math.round(theta / (TAU / recipe.symmetry)) * (TAU / recipe.symmetry);
            vx = Math.cos(snapped) * between(random, 8, 28);
            vy = Math.sin(snapped) * between(random, 8, 28) - 24;
        } else if (recipe.formation === 'mist') {
            x = recipe.originX + between(random, -recipe.radius, recipe.radius);
            y = recipe.originY + between(random, -8, 14);
            vx = between(random, -24, 24);
            vy = between(random, -16, -3);
            gravity = 0;
            wave = between(random, 5, 16);
        } else if (recipe.formation === 'pillars') {
            const lane = index % Math.max(2, recipe.originCount + 1);
            x = recipe.originX + (lane - recipe.originCount / 2) * recipe.originSpread;
            y = recipe.originY + between(random, 8, 24);
            vx = between(random, -3, 3);
            vy = between(random, -84, -38);
            gravity = -4;
        } else if (recipe.formation === 'orbitLanes' || recipe.formation === 'swarm') {
            orbit = between(random, -28, 28);
            vx = between(random, -4, 4);
            vy = between(random, -18, -4);
            gravity = 0;
        } else if (recipe.formation === 'wavefront') {
            vx = Math.cos(recipe.tilt) * between(random, 18, 42);
            vy = Math.sin(recipe.tilt) * between(random, 18, 42) - 8;
            wave = between(random, 10, 22);
            gravity = 0;
        } else if (recipe.formation === 'pulseGrid') {
            const point = formationPoint(recipe, 'lattice', index / moteCount, recipe.radius * 0.76, 0);
            x = point.x;
            y = point.y;
            vx = between(random, -2, 2);
            vy = between(random, -3, 3);
            gravity = 0;
        } else if (recipe.formation === 'comets') {
            x = recipe.originX + between(random, -recipe.radius, recipe.radius);
            y = recipe.originY - recipe.radius + between(random, -12, 10);
            vx = Math.cos(recipe.tilt) * between(random, 28, 66);
            vy = Math.abs(Math.sin(recipe.tilt) * between(random, 28, 66)) + 22;
            gravity = 8;
        }

        particles.push(makeParticle({
            spawn,
            life,
            x,
            y,
            vx,
            vy,
            gravity,
            drag: 0.12,
            sizeStart: integer(random, 1, 4) * recipe.scale,
            sizeEnd: 1,
            color: choose(random, recipe.palette.slice(0, 4)),
            shape: particleShape(recipe, random),
            orbit,
            wave,
            waveRate: between(random, 2, 6),
            phase: theta,
            trail: recipe.trails && random() > 0.7
        }));
    }
    return particles;
};

const drawParticle = (context, particle, time, brightness) => {
    const age = time - particle.spawn;
    if (age < 0 || age >= particle.life) return;
    const progress = age / particle.life;
    const fadeIn = smoothstep(0, 0.08, progress);
    const fadeOut = 1 - smoothstep(0.58, 1, progress);
    const drag = Math.exp(-particle.drag * age);
    const speed = Math.hypot(particle.vx, particle.vy) || 1;
    const perpendicularX = -particle.vy / speed;
    const perpendicularY = particle.vx / speed;
    const wave = Math.sin(particle.phase + age * particle.waveRate) * particle.wave;
    const orbitX = particle.orbit ? Math.cos(particle.phase + age * 3) * particle.orbit * age : 0;
    const orbitY = particle.orbit ? Math.sin(particle.phase + age * 3) * particle.orbit * age : 0;
    const x = particle.x + particle.vx * age * drag + orbitX + perpendicularX * wave;
    const y = particle.y + particle.vy * age * drag + particle.gravity * age * age * 0.5 + orbitY + perpendicularY * wave;
    const pulse = 0.9 + 0.1 * Math.sin(particle.phase + progress * TAU * 2);
    const size = Math.max(1, Math.round(lerp(particle.sizeStart, particle.sizeEnd, progress) * pulse));
    const bodyExtent = shapeExtent(size + 3, particle.shape);
    const trailExtent = particle.trail && size >= 2 ? Math.ceil(size * 1.7) : 0;
    const extent = bodyExtent + trailExtent;
    const minimum = FRAME_INSET + extent;
    const maximum = BASE_SIZE - 1 - FRAME_INSET - extent;
    const edgeDistance = Math.min(x - minimum, maximum - x, y - minimum, maximum - y);
    if (edgeDistance <= 0) return;
    const boundaryFade = clamp(edgeDistance / 6, 0, 1);
    const alpha = fadeIn * fadeOut * brightness * boundaryFade;

    if (particle.trail && size >= 2) {
        for (let step = 2; step >= 1; step -= 1) {
            context.globalAlpha = alpha * (0.1 + (2 - step) * 0.09);
            context.fillStyle = particle.color;
            drawShape(
                context,
                x - particle.vx / speed * size * step * 0.85,
                y - particle.vy / speed * size * step * 0.85,
                Math.max(1, size - step),
                particle.shape
            );
        }
    }

    context.globalAlpha = alpha * 0.16;
    context.fillStyle = particle.color;
    if (size >= 3) drawShape(context, x, y, size + 3, particle.shape);
    context.globalAlpha = alpha;
    drawShape(context, x, y, size, particle.shape);
    context.globalAlpha = 1;
};

export class AbilityEffect {
    constructor(recipe) {
        this.setRecipe(recipe);
    }

    setRecipe(recipe) {
        this.recipe = structuredClone(recipe);
        this.duration = this.recipe.duration;
        const random = createRandom(hash(`${this.recipe.seed}:${this.recipe.family}:${this.recipe.element}`));
        if (this.recipe.family === 'burst') this.particles = buildBurstParticles(this.recipe, random);
        else if (this.recipe.family === 'barrier') this.particles = buildBarrierParticles(this.recipe, random);
        else this.particles = buildAuraParticles(this.recipe, random);
    }

    get particleCount() {
        return this.particles.length;
    }

    draw(context, time) {
        const canvasWidth = context.canvas.width;
        const canvasHeight = context.canvas.height;
        const renderScale = Math.min(canvasWidth, canvasHeight) / BASE_SIZE;
        const offsetX = (canvasWidth - BASE_SIZE * renderScale) / 2;
        const offsetY = (canvasHeight - BASE_SIZE * renderScale) / 2;

        context.clearRect(0, 0, canvasWidth, canvasHeight);
        if (time >= this.duration) return;
        context.save();
        context.translate(offsetX, offsetY);
        context.scale(renderScale, renderScale);
        context.imageSmoothingEnabled = false;

        const safeTime = clamp(time, 0, this.duration);
        if (this.recipe.family === 'burst') this.drawBurst(context, safeTime);
        else if (this.recipe.family === 'barrier') this.drawBarrier(context, safeTime);
        else this.drawAura(context, safeTime);

        context.globalAlpha = 1;
        context.globalCompositeOperation = 'source-over';
        context.restore();
    }

    drawBurst(context, time) {
        const recipe = this.recipe;
        const progress = time / this.duration;
        const flash = 1 - smoothstep(0.02, 0.3, time);
        const heat = (1 - smoothstep(0.05, 0.76, progress)) * recipe.brightness;
        const motionTime = time * recipe.direction;
        const collapse = recipe.formation === 'collapse';
        const temporal = temporalIntensity(recipe, time, progress);

        drawGlow(context, recipe, 60 * recipe.scale, heat * 0.56);

        for (let layer = 0; layer < recipe.layers; layer += 1) {
            const delay = layer * 0.075;
            const layerTime = Math.max(0, time - delay);
            const maximum = recipe.radius * recipe.scale * (1 - layer * 0.095);
            const expansion = easeOut(layerTime / (0.32 + layer * 0.04));
            const radius = collapse ? maximum * (1 - expansion) : maximum * expansion;
            const fade = collapse
                ? (1 - expansion) * smoothstep(0, 0.05, layerTime)
                : (1 - smoothstep(0.35, 0.95, expansion)) * smoothstep(0, 0.05, layerTime);
            if (radius > 1 && fade > 0) {
                const useSecondary = recipe.hybrid && layer % 2 === 1;
                drawFormation(context, recipe, {
                    geometry: useSecondary ? recipe.secondaryGeometry : recipe.geometry,
                    radius,
                    segments: Math.max(18, Math.round((28 + layer * 8) * recipe.density)),
                    alpha: fade * recipe.brightness * temporal,
                    size: layer === 0 ? 3 : 2,
                    phase: motionTime * recipe.rotationSpeed * (layer % 2 ? -1 : 1),
                    layer,
                    style: useSecondary ? recipe.secondaryTraceStyle : recipe.traceStyle,
                    fragmentation: recipe.fragmentation + layer * 0.035
                });
            }
        }

        const accentExpansion = easeOut(time / 0.42);
        drawHybridAccent(
            context,
            recipe,
            recipe.radius * recipe.scale * accentExpansion,
            (1 - smoothstep(0.28, 0.95, accentExpansion)) * temporal,
            motionTime * recipe.rotationSpeed,
            recipe.layers
        );

        if (flash > 0 && !collapse) {
            const size = Math.max(2, Math.round(11 * flash * recipe.scale));
            context.globalAlpha = flash * 0.42;
            context.fillStyle = recipe.palette[2];
            drawShape(context, recipe.originX, recipe.originY, size * 3, recipe.traceStyle === 'shards' ? 'diamond' : 'square');
            context.globalAlpha = flash;
            context.fillStyle = recipe.palette[0];
            drawShape(context, recipe.originX, recipe.originY, size, recipe.traceStyle === 'sparks' ? 'spark' : 'square');
        }

        drawCoreCloud(context, recipe, heat * 0.7, 15 * recipe.scale, motionTime);
        this.particles.forEach((particle) => drawParticle(context, particle, time, recipe.brightness));
    }

    drawBarrier(context, time) {
        const recipe = this.recipe;
        const intro = easeOut(time / 0.58);
        const outro = 1 - smoothstep(this.duration - 0.95, this.duration, time);
        const temporal = temporalIntensity(recipe, time, time / this.duration);
        const alpha = intro * outro * recipe.brightness * temporal;
        const motionTime = time * recipe.direction;
        const pulse = 0.78 + Math.sin(motionTime * recipe.pulseRate) * 0.22;
        const baseRadius = recipe.radius * recipe.scale;

        drawGlow(context, recipe, baseRadius + 5, alpha * 0.24);

        for (let layer = 0; layer < recipe.layers; layer += 1) {
            const radius = Math.max(10, baseRadius - layer * between(createRandom(recipe.seed + layer * 17), 7, 12));
            const direction = layer % 2 === 0 ? 1 : -1;
            const useSecondary = recipe.hybrid && layer % 2 === 1;
            const style = recipe.formation === 'braid' && layer % 2
                ? 'chain'
                : useSecondary ? recipe.secondaryTraceStyle : recipe.traceStyle;
            drawFormation(context, recipe, {
                geometry: useSecondary ? recipe.secondaryGeometry : recipe.geometry,
                radius: radius * intro,
                segments: Math.max(18, Math.round((30 + radius * 0.24 + layer * 5) * recipe.density)),
                alpha: alpha * pulse * (1 - layer * 0.11),
                size: layer === 0 ? 3 : 2,
                phase: motionTime * recipe.rotationSpeed * direction + layer * 0.18,
                layer,
                style,
                fragmentation: recipe.fragmentation + (recipe.formation === 'shell' ? layer * 0.02 : layer * 0.055)
            });
        }

        drawHybridAccent(context, recipe, baseRadius * intro, alpha * pulse, motionTime * recipe.rotationSpeed, recipe.layers);

        if (['satellites', 'compass', 'swarm', 'gates', 'cells'].includes(recipe.formation) || recipe.anchors) {
            drawAnchors(
                context,
                recipe,
                baseRadius * intro,
                alpha,
                motionTime * recipe.rotationSpeed * 0.55,
                ['satellites', 'compass', 'swarm'].includes(recipe.formation)
            );
        }

        if (recipe.formation === 'diamondField') {
            drawFormation(context, recipe, {
                geometry: 'diamond',
                radius: baseRadius * 0.52 * intro,
                segments: recipe.symmetry * 3,
                alpha: alpha * 0.58,
                size: 2,
                phase: -motionTime * recipe.rotationSpeed,
                layer: recipe.layers + 1,
                style: 'shards',
                fragmentation: 0.12
            });
        }

        drawCoreCloud(context, recipe, alpha * 0.58, 13 * recipe.scale, motionTime * 0.55);
        this.particles.forEach((particle) => drawParticle(context, particle, time, recipe.brightness));
    }

    drawAura(context, time) {
        const recipe = this.recipe;
        const intro = easeOut(time / 0.76);
        const outro = 1 - smoothstep(this.duration - 1.05, this.duration, time);
        const temporal = temporalIntensity(recipe, time, time / this.duration);
        const alpha = intro * outro * recipe.brightness * temporal;
        const motionTime = time * recipe.direction;
        const pulse = 0.74 + Math.sin(motionTime * recipe.pulseRate) * 0.26;
        const baseRadius = recipe.radius * recipe.scale * intro;

        drawGlow(context, recipe, baseRadius + 3, alpha * pulse * 0.29);

        for (let layer = 0; layer < recipe.layers; layer += 1) {
            const radius = Math.max(12, baseRadius - layer * between(createRandom(recipe.seed + layer * 31), 8, 14));
            const useSecondary = recipe.hybrid && layer % 2 === 1;
            const geometry = recipe.formation === 'helix' && layer === 0
                ? 'helix'
                : useSecondary ? recipe.secondaryGeometry : recipe.geometry;
            drawFormation(context, recipe, {
                geometry,
                radius,
                segments: Math.max(18, Math.round((34 - layer * 3) * recipe.density)),
                alpha: alpha * pulse * (0.92 - layer * 0.13),
                size: layer === 0 ? 2 : 2,
                phase: motionTime * recipe.rotationSpeed * (layer % 2 ? -1 : 1),
                layer,
                style: useSecondary ? recipe.secondaryTraceStyle : recipe.traceStyle,
                fragmentation: recipe.fragmentation + layer * 0.04
            });
        }

        drawHybridAccent(context, recipe, baseRadius, alpha * pulse, motionTime * recipe.rotationSpeed, recipe.layers);

        if (['petals', 'constellation', 'swarm', 'orbitLanes', 'pulseGrid'].includes(recipe.formation) || recipe.anchors) {
            drawAnchors(context, recipe, baseRadius * 0.76, alpha * 0.7, motionTime * 0.16);
        }

        if (recipe.formation === 'tide' || recipe.formation === 'wavefront') {
            for (let band = 0; band < 3; band += 1) {
                drawFormation(context, recipe, {
                    geometry: 'line',
                    radius: baseRadius * (0.55 + band * 0.15),
                    segments: Math.round(24 * recipe.density),
                    alpha: alpha * (0.42 - band * 0.08),
                    size: 2,
                    phase: motionTime * (0.5 + band * 0.14),
                    layer: band + recipe.layers,
                    style: band % 2 ? 'dashes' : recipe.traceStyle,
                    fragmentation: recipe.fragmentation
                });
            }
        }

        drawCoreCloud(context, recipe, alpha * 0.62, 16 * recipe.scale, motionTime * 0.72);
        this.particles.forEach((particle) => drawParticle(context, particle, time, recipe.brightness));
    }
}

export const renderEffectFrame = (recipe, time, size = 160) => {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext('2d');
    new AbilityEffect(recipe).draw(context, time);
    return canvas;
};

export const renderEffectFrames = async ({ recipe, size = 160, frameCount = 32 }) => {
    const effect = new AbilityEffect(recipe);
    const frames = [];
    for (let index = 0; index < frameCount; index += 1) {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const context = canvas.getContext('2d');
        effect.draw(context, effect.duration * index / Math.max(1, frameCount - 1));
        frames.push(canvas);
        if (index % 4 === 3) await new Promise((resolve) => setTimeout(resolve, 0));
    }
    return { frames, effect };
};
