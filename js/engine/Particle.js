const BOUNDARY_FADE_PX = 12;

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

const drawShape = (context, x, y, size, shape) => {
    const r = size / 2;
    const cx = Math.round(x);
    const cy = Math.round(y);
    const half = Math.round(r);

    switch (shape) {
        case 'circle': {
            for (let row = -half; row <= half; row++) {
                const chord = Math.round(Math.sqrt(Math.max(0, r * r - row * row)) * 2);
                if (chord <= 0) continue;
                context.fillRect(Math.round(cx - chord / 2), cy + row, chord, 1);
            }
            break;
        }
        case 'diamond': {
            for (let row = -half; row <= half; row++) {
                const chord = Math.max(1, size - Math.abs(row) * 2);
                context.fillRect(Math.round(cx - chord / 2), cy + row, chord, 1);
            }
            break;
        }
        case 'cross': {
            for (let i = -half; i <= half; i++) {
                context.fillRect(cx + i, cy + i, 1, 1);
                context.fillRect(cx - i, cy + i, 1, 1);
            }
            break;
        }
        case 'plus': {
            const thickness = Math.max(1, Math.floor(size / 3));
            const halfThick = Math.floor(thickness / 2);
            context.fillRect(cx - half, cy - halfThick, size, thickness);
            context.fillRect(cx - halfThick, cy - half, thickness, size);
            break;
        }
        case 'star': {
            const arm = Math.max(1, Math.floor(size / 3));
            context.fillRect(cx - half, cy - arm, size, arm * 2);
            context.fillRect(cx - arm, cy - half, arm * 2, size);
            context.fillRect(cx - half + 1, cy - half + 1, 1, 1);
            context.fillRect(cx + half - 1, cy - half + 1, 1, 1);
            context.fillRect(cx - half + 1, cy + half - 1, 1, 1);
            context.fillRect(cx + half - 1, cy + half - 1, 1, 1);
            break;
        }
        case 'pixel-cluster': {
            context.fillRect(cx - 1, cy - 1, 1, 1);
            context.fillRect(cx,     cy - 1, 1, 1);
            context.fillRect(cx - 1, cy,     1, 1);
            context.fillRect(cx,     cy,     1, 1);
            break;
        }
        case 'square':
        default: {
            context.fillRect(cx - half, cy - half, size, size);
            break;
        }
    }
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
        vortexPull,
        shape,
        canvasWidth,
        canvasHeight,
        turbulence,
        rotation,
        rotationSpeed
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
        this.shape = shape || 'square';
        this.canvasWidth = canvasWidth || 160;
        this.canvasHeight = canvasHeight || 160;
        this.turbulence = turbulence || 0;
        this.rotation = rotation || 0;
        this.rotationSpeed = rotationSpeed || 0;
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

        this.vx += (Math.random() - 0.5) * this.turbulence * deltaTime * 60;
        this.vy += (Math.random() - 0.5) * this.turbulence * deltaTime * 60;

        const dragFactor = Math.pow(this.drag, frameScale);
        this.vx *= dragFactor;
        this.vy *= dragFactor;

        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
        this.rotation += this.rotationSpeed * deltaTime;
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

        const boundaryAlpha =
            clamp(this.x / BOUNDARY_FADE_PX, 0, 1) *
            clamp((this.canvasWidth - this.x) / BOUNDARY_FADE_PX, 0, 1) *
            clamp(this.y / BOUNDARY_FADE_PX, 0, 1) *
            clamp((this.canvasHeight - this.y) / BOUNDARY_FADE_PX, 0, 1);

        context.globalAlpha = fadeOut * boundaryAlpha;
        context.fillStyle = mixColor(this.startColor, this.endColor, normalizedAge);

        context.save();
        context.translate(this.x, this.y);
        context.rotate(this.rotation);
        drawShape(context, 0, 0, size, this.shape);
        context.restore();

        context.globalAlpha = 1;
    }
}
