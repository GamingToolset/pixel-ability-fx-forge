const BOUNDARY_FADE_PX = 12;

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const lerp = (a, b, t) => a + (b - a) * t;

const hexToRgb = (hex) => {
    if (hex.startsWith('rgb')) {
        const channels = hex.match(/[\d.]+/g)?.map(Number) || [255, 255, 255];
        return { r: channels[0], g: channels[1], b: channels[2] };
    }

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

const shadeColor = (color, amount) => {
    const source = hexToRgb(color);
    const target = amount < 0 ? 0 : 255;
    const strength = Math.abs(amount);
    const mix = (channel) => Math.round(lerp(channel, target, strength));
    return `rgb(${mix(source.r)}, ${mix(source.g)}, ${mix(source.b)})`;
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
        case 'spark': {
            const core = Math.max(1, Math.round(size / 4));
            context.fillRect(cx - half, cy - core, size, core * 2 + 1);
            context.fillRect(cx - core, cy - half, core * 2 + 1, size);
            const diagonal = Math.max(1, Math.floor(size / 3));
            for (let i = 1; i <= diagonal; i += 1) {
                context.fillRect(cx - i, cy - i, 1, 1);
                context.fillRect(cx + i, cy - i, 1, 1);
                context.fillRect(cx - i, cy + i, 1, 1);
                context.fillRect(cx + i, cy + i, 1, 1);
            }
            break;
        }
        case 'flame': {
            const height = Math.max(2, Math.round(size));
            const top = cy - Math.floor(height / 2);
            for (let row = 0; row < height; row += 1) {
                const progress = row / Math.max(1, height - 1);
                const envelope = Math.sin(Math.PI * Math.pow(progress, 0.82));
                const width = Math.max(1, Math.round(size * (0.12 + envelope * 0.76) * (1 - progress * 0.16)));
                const lean = Math.round((0.5 - progress) * size * 0.14);
                context.fillRect(cx - Math.floor(width / 2) + lean, top + row, width, 1);
            }
            break;
        }
        case 'shard': {
            const height = Math.max(2, Math.round(size));
            const top = cy - Math.floor(height / 2);
            for (let row = 0; row < height; row += 1) {
                const progress = row / Math.max(1, height - 1);
                const width = Math.max(1, Math.round(1 + progress * size * 0.7));
                context.fillRect(cx - Math.floor(width / 2), top + row, width, 1);
            }
            break;
        }
        case 'pixel-cluster': {
            const block = Math.max(1, Math.round(size / 3));
            context.fillRect(cx - block, cy - block, block * 2, block * 2);
            context.fillRect(cx + block, cy - block * 2, block, block);
            context.fillRect(cx - block * 2, cy, block, block);
            context.fillRect(cx, cy + block, block, block);
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
        rotationSpeed,
        renderStyle,
        random,
        detailSeed
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
        this.renderStyle = renderStyle || 'luminous';
        this.random = random || Math.random;
        this.detailSeed = detailSeed || 0;
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

        this.vx += (this.random() - 0.5) * this.turbulence * deltaTime * 60;
        this.vy += (this.random() - 0.5) * this.turbulence * deltaTime * 60;

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
        const fadeIn = clamp(normalizedAge / Math.min(0.14 / this.maxLife, 0.22), 0, 1);
        const fadeOut = clamp(this.life / Math.min(this.maxLife, 0.35), 0, 1);
        const pulse = 1 + Math.sin(normalizedAge * Math.PI * 2 + this.detailSeed * 0.001) * 0.055;
        const size = Math.max(0, Math.round(lerp(this.startSize, this.endSize, normalizedAge) * pulse));

        if (size <= 0) return;

        const boundaryAlpha =
            clamp(this.x / BOUNDARY_FADE_PX, 0, 1) *
            clamp((this.canvasWidth - this.x) / BOUNDARY_FADE_PX, 0, 1) *
            clamp(this.y / BOUNDARY_FADE_PX, 0, 1) *
            clamp((this.canvasHeight - this.y) / BOUNDARY_FADE_PX, 0, 1);

        const alpha = fadeIn * fadeOut * boundaryAlpha;
        const baseColor = mixColor(this.startColor, this.endColor, normalizedAge);

        if (this.renderStyle === 'flat') {
            context.globalAlpha = alpha;
            context.fillStyle = baseColor;

            context.save();
            context.translate(this.x, this.y);
            context.rotate(this.rotation);
            drawShape(context, 0, 0, size, this.shape);
            context.restore();

            context.globalAlpha = 1;
            return;
        }

        const speed = Math.hypot(this.vx, this.vy) || 1;
        const trailX = -this.vx / speed;
        const trailY = -this.vy / speed;
        const luminous = this.renderStyle === 'luminous';

        if (luminous && size >= 3) {
            for (let step = 2; step >= 1; step -= 1) {
                context.save();
                context.translate(
                    Math.round(this.x + trailX * size * step * 0.65),
                    Math.round(this.y + trailY * size * step * 0.65)
                );
                context.rotate(this.rotation);
                context.globalAlpha = alpha * (0.08 + (2 - step) * 0.08);
                context.fillStyle = shadeColor(baseColor, 0.35);
                drawShape(context, 0, 0, Math.max(1, size - step * 2), this.shape);
                context.restore();
            }
        }

        context.save();
        context.translate(Math.round(this.x), Math.round(this.y));
        context.rotate(this.rotation);

        if (luminous) {
            context.globalAlpha = alpha * 0.14;
            context.fillStyle = shadeColor(baseColor, 0.42);
            drawShape(context, 0, 0, size + 4, this.shape);
        }

        context.globalAlpha = alpha * 0.9;
        context.fillStyle = shadeColor(baseColor, -0.62);
        drawShape(context, 1, 1, size + 2, this.shape);

        context.globalAlpha = alpha;
        context.fillStyle = shadeColor(baseColor, -0.18);
        drawShape(context, 1, 1, size, this.shape);

        context.fillStyle = baseColor;
        drawShape(context, 0, 0, size, this.shape);

        const highlightSize = Math.max(1, Math.round(size * 0.58));
        context.fillStyle = shadeColor(baseColor, luminous ? 0.72 : 0.48);
        drawShape(context, -1, -1, highlightSize, this.shape);

        if (luminous && size >= 5) {
            context.fillStyle = shadeColor(baseColor, 0.78);
            drawShape(context, -1, -1, Math.max(1, Math.round(size * 0.24)), this.shape);
        }

        context.restore();

        context.globalAlpha = 1;
    }
}
