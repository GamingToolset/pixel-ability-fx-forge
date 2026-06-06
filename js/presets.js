export const presets = {
    fireball: {
        name: 'Fireball',
        emission: { spawnRate: 35, burstAmount: 220, maxParticles: 520 },
        shape: { type: 'point', radius: 8, width: 32, height: 32 },
        movement: { minVelocity: 40, maxVelocity: 165, angle: -90, spread: 360 },
        physics: { gravity: -25, drag: 0.91 },
        forces: { orbitalVelocity: 24, vortexPull: -8 },
        visuals: {
            startColor: '#fff7b1',
            endColor: '#b31212',
            palette: ['#ffffff', '#ffe66d', '#ff9f1c', '#ff4d00'],
            startSize: 7,
            endSize: 1,
            life: 1.15
        }
    },
    frostNova: {
        name: 'Frost Nova',
        emission: { spawnRate: 24, burstAmount: 180, maxParticles: 480 },
        shape: { type: 'ring', radius: 18, width: 80, height: 80 },
        movement: { minVelocity: 28, maxVelocity: 118, angle: 0, spread: 360 },
        physics: { gravity: -8, drag: 0.955 },
        forces: { orbitalVelocity: -34, vortexPull: -26 },
        visuals: {
            startColor: '#dff9ff',
            endColor: '#2a6fdb',
            palette: ['#ffffff', '#b8f7ff', '#79d7ff', '#72a4ff'],
            startSize: 5,
            endSize: 1,
            life: 1.8
        }
    },
    voidImplosion: {
        name: 'Void Implosion',
        emission: { spawnRate: 115, burstAmount: 260, maxParticles: 700 },
        shape: { type: 'ring', radius: 64, width: 120, height: 120 },
        movement: { minVelocity: 5, maxVelocity: 45, angle: 0, spread: 360 },
        physics: { gravity: 0, drag: 0.975 },
        forces: { orbitalVelocity: 145, vortexPull: 150 },
        visuals: {
            startColor: '#b388ff',
            endColor: '#05000f',
            palette: ['#e7d7ff', '#8f5cff', '#4d1d95', '#130024'],
            startSize: 6,
            endSize: 0,
            life: 2.25
        }
    },
    acidPool: {
        name: 'Acid Pool',
        emission: { spawnRate: 95, burstAmount: 110, maxParticles: 520 },
        shape: { type: 'box', radius: 22, width: 92, height: 26 },
        movement: { minVelocity: 4, maxVelocity: 42, angle: -90, spread: 85 },
        physics: { gravity: -18, drag: 0.945 },
        forces: { orbitalVelocity: 8, vortexPull: -4 },
        visuals: {
            startColor: '#d6ff33',
            endColor: '#0b4d1c',
            palette: ['#eaff4f', '#a6ff00', '#39ff14', '#18a84b'],
            startSize: 4,
            endSize: 1,
            life: 1.55
        }
    },
    magicAura: {
        name: 'Magic Aura',
        emission: { spawnRate: 130, burstAmount: 90, maxParticles: 650 },
        shape: { type: 'circle', radius: 46, width: 90, height: 90 },
        movement: { minVelocity: 3, maxVelocity: 34, angle: -90, spread: 360 },
        physics: { gravity: -42, drag: 0.982 },
        forces: { orbitalVelocity: 88, vortexPull: 18 },
        visuals: {
            startColor: '#9bf6ff',
            endColor: '#ff70d9',
            palette: ['#9bf6ff', '#bdb2ff', '#ffc6ff', '#fdffb6'],
            startSize: 4,
            endSize: 1,
            life: 2.8
        }
    }
};
