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
    },
    lightningStrike: {
        name: 'Lightning Strike',
        emission: { spawnRate: 0, burstAmount: 180, maxParticles: 420 },
        shape: { type: 'point', radius: 2, width: 16, height: 16 },
        movement: { minVelocity: 185, maxVelocity: 350, angle: 90, spread: 155 },
        physics: { gravity: 2, drag: 0.935 },
        forces: { orbitalVelocity: 0, vortexPull: -45 },
        visuals: {
            startColor: '#ffffff',
            endColor: '#5228ff',
            palette: ['#ffffff', '#dff8ff', '#7de7ff', '#8a6cff', '#b200ff'],
            startSize: 3,
            endSize: 0,
            life: 0.35
        }
    },
    healBurst: {
        name: 'Heal Burst',
        emission: { spawnRate: 18, burstAmount: 145, maxParticles: 520 },
        shape: { type: 'circle', radius: 34, width: 86, height: 86 },
        movement: { minVelocity: 8, maxVelocity: 54, angle: -90, spread: 230 },
        physics: { gravity: -62, drag: 0.982 },
        forces: { orbitalVelocity: 28, vortexPull: -12 },
        visuals: {
            startColor: '#ffffff',
            endColor: '#55d96a',
            palette: ['#ffffff', '#d9ffe5', '#9cffb4', '#58e879', '#2aad54'],
            startSize: 5,
            endSize: 1,
            life: 3.2
        }
    },
    bloodSplatter: {
        name: 'Blood Splatter',
        emission: { spawnRate: 0, burstAmount: 210, maxParticles: 460 },
        shape: { type: 'point', radius: 4, width: 24, height: 24 },
        movement: { minVelocity: 45, maxVelocity: 210, angle: 78, spread: 135 },
        physics: { gravity: 175, drag: 0.942 },
        forces: { orbitalVelocity: 0, vortexPull: -18 },
        visuals: {
            startColor: '#ff2d2d',
            endColor: '#330006',
            palette: ['#ff4242', '#c71522', '#8f0712', '#4c0008'],
            startSize: 4,
            endSize: 1,
            life: 0.95
        }
    },
    smokePuff: {
        name: 'Smoke Puff',
        emission: { spawnRate: 16, burstAmount: 130, maxParticles: 360 },
        shape: { type: 'circle', radius: 18, width: 56, height: 56 },
        movement: { minVelocity: 2, maxVelocity: 26, angle: -90, spread: 190 },
        physics: { gravity: -24, drag: 0.86 },
        forces: { orbitalVelocity: 18, vortexPull: -34 },
        visuals: {
            startColor: '#f5f5f5',
            endColor: '#4b4f56',
            palette: ['#ffffff', '#dfe3e6', '#aeb5bd', '#737981', '#f5f5f5'],
            startSize: 14,
            endSize: 0,
            life: 2.4
        }
    },
    confettiExplosion: {
        name: 'Confetti Explosion',
        emission: { spawnRate: 0, burstAmount: 260, maxParticles: 540 },
        shape: { type: 'box', radius: 18, width: 44, height: 44 },
        movement: { minVelocity: 42, maxVelocity: 175, angle: -90, spread: 360 },
        physics: { gravity: 92, drag: 0.966 },
        forces: { orbitalVelocity: 22, vortexPull: -16 },
        visuals: {
            startColor: '#ffffff',
            endColor: '#363a45',
            palette: ['#ff3b5f', '#ff9f1c', '#ffe66d', '#39d98a', '#32d7ff', '#7b61ff', '#ff70d9'],
            startSize: 3,
            endSize: 1,
            life: 1.9
        }
    },
    soulAscend: {
        name: 'Soul Ascend',
        emission: { spawnRate: 32, burstAmount: 95, maxParticles: 480 },
        shape: { type: 'ring', radius: 24, width: 70, height: 70 },
        movement: { minVelocity: 2, maxVelocity: 22, angle: -90, spread: 36 },
        physics: { gravity: -112, drag: 0.988 },
        forces: { orbitalVelocity: 8, vortexPull: 20 },
        visuals: {
            startColor: '#ffffff',
            endColor: '#7fcaff',
            palette: ['#ffffff', '#eaf8ff', '#c8eeff', '#9fdcff', '#b7c8ff'],
            startSize: 5,
            endSize: 0,
            life: 3.8
        }
    },
    meteorImpact: {
        name: 'Meteor Impact',
        emission: { spawnRate: 0, burstAmount: 300, maxParticles: 620 },
        shape: { type: 'point', radius: 6, width: 28, height: 28 },
        movement: { minVelocity: 85, maxVelocity: 265, angle: -55, spread: 360 },
        physics: { gravity: 205, drag: 0.91 },
        forces: { orbitalVelocity: 0, vortexPull: -52 },
        visuals: {
            startColor: '#fff3a3',
            endColor: '#4b4f56',
            palette: ['#fff6bd', '#ffd166', '#ff7a00', '#c94c1f', '#8c8f96', '#4b4f56'],
            startSize: 7,
            endSize: 0,
            life: 1.05
        }
    },
    electricOrb: {
        name: 'Electric Orb',
        emission: { spawnRate: 90, burstAmount: 160, maxParticles: 560 },
        shape: { type: 'ring', radius: 34, width: 76, height: 76 },
        movement: { minVelocity: 2, maxVelocity: 28, angle: 0, spread: 48 },
        physics: { gravity: 0, drag: 0.975 },
        forces: { orbitalVelocity: 238, vortexPull: 44 },
        visuals: {
            startColor: '#ffffff',
            endColor: '#00a6d6',
            palette: ['#ffffff', '#d9fbff', '#73efff', '#32d7ff', '#008cff'],
            startSize: 4,
            endSize: 1,
            life: 1.65
        }
    },
    poisonCloud: {
        name: 'Poison Cloud',
        emission: { spawnRate: 45, burstAmount: 165, maxParticles: 460 },
        shape: { type: 'circle', radius: 36, width: 90, height: 90 },
        movement: { minVelocity: 1, maxVelocity: 20, angle: -90, spread: 360 },
        physics: { gravity: -4, drag: 0.845 },
        forces: { orbitalVelocity: 16, vortexPull: -72 },
        visuals: {
            startColor: '#9dff3f',
            endColor: '#2e104f',
            palette: ['#b8ff4a', '#65c83b', '#2f7d32', '#3a195c', '#6b2a8f'],
            startSize: 13,
            endSize: 3,
            life: 4.4
        }
    },
    holyLight: {
        name: 'Holy Light',
        emission: { spawnRate: 72, burstAmount: 135, maxParticles: 540 },
        shape: { type: 'ring', radius: 30, width: 82, height: 82 },
        movement: { minVelocity: 4, maxVelocity: 36, angle: -90, spread: 58 },
        physics: { gravity: -14, drag: 0.99 },
        forces: { orbitalVelocity: 116, vortexPull: 12 },
        visuals: {
            startColor: '#ffffff',
            endColor: '#e7a928',
            palette: ['#ffffff', '#fff6c7', '#ffe66d', '#ffc247', '#f4a900'],
            startSize: 6,
            endSize: 1,
            life: 3.4
        }
    }
};
