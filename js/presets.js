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
            life: 1.15,
            particleShape: 'circle',
            blendMode: 'lighter'
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
            life: 1.8,
            particleShape: 'diamond',
            blendMode: 'lighter'
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
            life: 2.25,
            particleShape: 'square',
            blendMode: 'lighter'
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
            life: 1.55,
            particleShape: 'circle',
            blendMode: 'lighter'
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
            life: 2.8,
            particleShape: 'star',
            blendMode: 'lighter'
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
            life: 0.35,
            particleShape: 'cross',
            blendMode: 'lighter'
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
            life: 3.2,
            particleShape: 'plus',
            blendMode: 'lighter'
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
            life: 0.95,
            particleShape: 'pixel-cluster',
            blendMode: 'lighter'
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
            life: 2.4,
            particleShape: 'circle',
            blendMode: 'source-over'
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
            life: 1.9,
            particleShape: 'diamond',
            blendMode: 'lighter'
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
            life: 3.8,
            particleShape: 'star',
            blendMode: 'lighter'
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
            life: 1.05,
            particleShape: 'square',
            blendMode: 'lighter'
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
            life: 1.65,
            particleShape: 'plus',
            blendMode: 'lighter'
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
            life: 4.4,
            particleShape: 'circle',
            blendMode: 'source-over'
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
            life: 3.4,
            particleShape: 'star',
            blendMode: 'lighter'
        }
    },
    blizzard: {
        name: 'Blizzard',
        emission: { spawnRate: 80, burstAmount: 160, maxParticles: 500 },
        shape: { type: 'box', radius: 10, width: 140, height: 12 },
        movement: { minVelocity: 18, maxVelocity: 55, angle: 175, spread: 22 },
        physics: { gravity: 8, drag: 0.978 },
        forces: { orbitalVelocity: 0, vortexPull: 0 },
        visuals: {
            startColor: '#ffffff',
            endColor: '#a8d8f0',
            palette: ['#ffffff', '#e8f4ff', '#c0e0ff', '#9fcae8'],
            startSize: 3,
            endSize: 1,
            life: 3.5,
            particleShape: 'circle',
            blendMode: 'source-over'
        }
    },
    lavaBurst: {
        name: 'Lava Burst',
        emission: { spawnRate: 55, burstAmount: 200, maxParticles: 520 },
        shape: { type: 'ring', radius: 20, width: 60, height: 60 },
        movement: { minVelocity: 30, maxVelocity: 120, angle: 0, spread: 360 },
        physics: { gravity: 140, drag: 0.945 },
        forces: { orbitalVelocity: 0, vortexPull: 0 },
        visuals: {
            startColor: '#ff6a00',
            endColor: '#1a0000',
            palette: ['#ff9500', '#ff4500', '#cc1100', '#660000', '#111111'],
            startSize: 6,
            endSize: 1,
            life: 1.2,
            particleShape: 'circle',
            blendMode: 'lighter'
        }
    },
    shadowTendrils: {
        name: 'Shadow Tendrils',
        emission: { spawnRate: 40, burstAmount: 100, maxParticles: 400 },
        shape: { type: 'circle', radius: 22, width: 70, height: 70 },
        movement: { minVelocity: 4, maxVelocity: 22, angle: 0, spread: 360 },
        physics: { gravity: -6, drag: 0.992 },
        forces: { orbitalVelocity: 18, vortexPull: -55 },
        visuals: {
            startColor: '#2a003f',
            endColor: '#0a000f',
            palette: ['#3d0059', '#1e0030', '#0f0018', '#5c007a', '#08000d'],
            startSize: 5,
            endSize: 1,
            life: 5.0,
            particleShape: 'cross',
            blendMode: 'source-over'
        }
    },
    fairyDust: {
        name: 'Fairy Dust',
        emission: { spawnRate: 55, burstAmount: 90, maxParticles: 420 },
        shape: { type: 'circle', radius: 28, width: 70, height: 70 },
        movement: { minVelocity: 2, maxVelocity: 20, angle: 0, spread: 360 },
        physics: { gravity: -28, drag: 0.985 },
        forces: { orbitalVelocity: 12, vortexPull: 0 },
        visuals: {
            startColor: '#ffb3e6',
            endColor: '#c8f7c5',
            palette: ['#ffb3e6', '#fffacd', '#b3f0ff', '#d4b8ff', '#b3f5d0'],
            startSize: 4,
            endSize: 1,
            life: 4.0,
            particleShape: 'star',
            blendMode: 'lighter'
        }
    },
    shockwaveRing: {
        name: 'Shockwave Ring',
        emission: { spawnRate: 0, burstAmount: 280, maxParticles: 560 },
        shape: { type: 'ring', radius: 48, width: 110, height: 110 },
        movement: { minVelocity: 180, maxVelocity: 280, angle: 0, spread: 360 },
        physics: { gravity: 2, drag: 0.96 },
        forces: { orbitalVelocity: 0, vortexPull: 0 },
        visuals: {
            startColor: '#ffffff',
            endColor: '#888888',
            palette: ['#ffffff', '#eeeeee', '#cccccc', '#aaaaaa'],
            startSize: 4,
            endSize: 0,
            life: 0.45,
            particleShape: 'diamond',
            blendMode: 'lighter'
        }
    },
    dragonBreath: {
        name: 'Dragon Breath',
        emission: { spawnRate: 65, burstAmount: 150, maxParticles: 480 },
        shape: { type: 'point', radius: 4, width: 20, height: 20 },
        movement: { minVelocity: 55, maxVelocity: 145, angle: 0, spread: 55 },
        physics: { gravity: -10, drag: 0.958 },
        forces: { orbitalVelocity: 0, vortexPull: 0 },
        visuals: {
            startColor: '#fff0a0',
            endColor: '#6b0000',
            palette: ['#ffee88', '#ff8800', '#ff3300', '#cc0000', '#880000'],
            startSize: 6,
            endSize: 1,
            life: 1.8,
            particleShape: 'circle',
            blendMode: 'lighter'
        }
    },
    portalSwirl: {
        name: 'Portal Swirl',
        emission: { spawnRate: 85, burstAmount: 120, maxParticles: 550 },
        shape: { type: 'ring', radius: 36, width: 90, height: 90 },
        movement: { minVelocity: 8, maxVelocity: 42, angle: 0, spread: 360 },
        physics: { gravity: 0, drag: 0.985 },
        forces: { orbitalVelocity: 180, vortexPull: 60 },
        visuals: {
            startColor: '#a020f0',
            endColor: '#00e5ff',
            palette: ['#cc44ff', '#7700ff', '#00ccff', '#00ffcc', '#ff00aa'],
            startSize: 4,
            endSize: 1,
            life: 3.0,
            particleShape: 'plus',
            blendMode: 'lighter'
        }
    },
    rainDrops: {
        name: 'Rain Drops',
        emission: { spawnRate: 120, burstAmount: 200, maxParticles: 600 },
        shape: { type: 'box', radius: 8, width: 140, height: 8 },
        movement: { minVelocity: 160, maxVelocity: 220, angle: 90, spread: 8 },
        physics: { gravity: 180, drag: 0.99 },
        forces: { orbitalVelocity: 0, vortexPull: 0 },
        visuals: {
            startColor: '#c8dff5',
            endColor: '#ffffff',
            palette: ['#b0cce8', '#c8dff5', '#ddeeff', '#ffffff'],
            startSize: 2,
            endSize: 1,
            life: 0.7,
            particleShape: 'square',
            blendMode: 'source-over'
        }
    },
    toxicGeyser: {
        name: 'Toxic Geyser',
        emission: { spawnRate: 75, burstAmount: 160, maxParticles: 480 },
        shape: { type: 'point', radius: 4, width: 18, height: 18 },
        movement: { minVelocity: 120, maxVelocity: 220, angle: -90, spread: 28 },
        physics: { gravity: -85, drag: 0.965 },
        forces: { orbitalVelocity: 0, vortexPull: 0 },
        visuals: {
            startColor: '#ccff00',
            endColor: '#004400',
            palette: ['#eeff00', '#aaff00', '#55ff00', '#00ff44', '#ffffff'],
            startSize: 5,
            endSize: 1,
            life: 2.2,
            particleShape: 'circle',
            blendMode: 'lighter'
        }
    },
    crystalShatter: {
        name: 'Crystal Shatter',
        emission: { spawnRate: 0, burstAmount: 240, maxParticles: 500 },
        shape: { type: 'ring', radius: 16, width: 50, height: 50 },
        movement: { minVelocity: 160, maxVelocity: 300, angle: 0, spread: 360 },
        physics: { gravity: 0, drag: 0.955 },
        forces: { orbitalVelocity: 0, vortexPull: 0 },
        visuals: {
            startColor: '#e8f8ff',
            endColor: '#0088cc',
            palette: ['#ffffff', '#d0f0ff', '#88ddff', '#44aaff', '#aaeeff'],
            startSize: 5,
            endSize: 0,
            life: 0.55,
            particleShape: 'diamond',
            blendMode: 'lighter'
        }
    }
};
