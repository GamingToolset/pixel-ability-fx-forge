const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const lerp = (a, b, t) => a + (b - a) * t;

const hexToRgb = (hex) => {
    const normalized = hex.replace('#', '').trim();
    const value = normalized.length === 3
        ? normalized.split('').map((char) => char + char).join('')
        : normalized;

    return {
        r: parseInt(value.slice(0, 2), 16),
        g: parseInt(value.slice(2, 4), 16),
        b: parseInt(value.slice(4, 6), 16)
    };
};

const mixColor = (from, to, amount) => {
    const a = hexToRgb(from);
    const b = hexToRgb(to);

    return `rgb(${Math.round(lerp(a.r, b.r, amount))}, ${Math.round(lerp(a.g, b.g, amount))}, ${Math.round(lerp(a.b, b.b, amount))})`;
};

export default class Particle {
    constructor({
        x,
        y,
        vx,
        vy,
        originX,
        originY,
        life,
        startSize,
        endSize,
        startColor,
        endColor,
        gravity,
        drag,
        orbitalVelocity,
        vortexPull
    }) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.originX = originX;
        this.originY = originY;
        this.life = life;
        this.maxLife = life;
        this.startSize = startSize;
        this.endSize = endSize;
        this.startColor = startColor;
        this.endColor = endColor;
        this.gravity = gravity;
        this.drag = drag;
        this.orbitalVelocity = orbitalVelocity;
        this.vortexPull = vortexPull;
        this.alive = true;
    }

    update(deltaTime) {
        const frameScale = deltaTime * 60;
        const dx = this.x - this.originX;
        const dy = this.y - this.originY;
        const distance = Math.hypot(dx, dy) || 1;
        const nx = dx / distance;
        const ny = dy / distance;

        this.vy += this.gravity * deltaTime;
        this.vx += -nx * this.vortexPull * deltaTime;
        this.vy += -ny * this.vortexPull * deltaTime;
        this.vx += -ny * this.orbitalVelocity * deltaTime;
        this.vy += nx * this.orbitalVelocity * deltaTime;

        const dragFactor = Math.pow(this.drag, frameScale);
        this.vx *= dragFactor;
        this.vy *= dragFactor;

        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
        this.life -= deltaTime;

        if (this.life <= 0) {
            this.alive = false;
        }
    }

    draw(context) {
        const normalizedAge = clamp(1 - this.life / this.maxLife, 0, 1);
        const fadeOut = clamp(this.life / Math.min(this.maxLife, 0.35), 0, 1);
        const size = Math.max(0, Math.round(lerp(this.startSize, this.endSize, normalizedAge)));

        if (size <= 0) return;

        context.globalAlpha = fadeOut;
        context.fillStyle = mixColor(this.startColor, this.endColor, normalizedAge);
        context.fillRect(
            Math.round(this.x - size / 2),
            Math.round(this.y - size / 2),
            size,
            size
        );
        context.globalAlpha = 1;
    }
}
