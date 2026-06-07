export default class Renderer {
    constructor(canvas, emitter, options = {}) {
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        this.context.imageSmoothingEnabled = false;
        this.emitter = emitter;
        this.showTarget = options.showTarget ?? true;
        this.continuous = options.continuous ?? true;
        this.lastTime = 0;
        this.running = false;
        this.onFrame = options.onFrame || (() => {});
        this.blendMode = 'source-over';
        this.timeScale = 1.0;
    }

    start() {
        if (this.running) return;
        this.running = true;
        requestAnimationFrame((time) => this.loop(time));
    }

    loop(time) {
        if (!this.running) return;

        const deltaTime = (Math.min((time - this.lastTime) / 1000 || 0, 1 / 30)) * this.timeScale;
        this.lastTime = time;

        this.clear();
        this.drawTargetDummy();
        this.drawViewportGuides();
        this.emitter.update(deltaTime, this.continuous);

        this.context.globalCompositeOperation = this.blendMode;
        this.emitter.draw(this.context);
        this.context.globalCompositeOperation = 'source-over';

        this.onFrame(this.emitter.particles.length);

        requestAnimationFrame((nextTime) => this.loop(nextTime));
    }

    clear() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    setEmitter(emitter) {
        this.emitter = emitter;
    }

    setShowTarget(value) {
        this.showTarget = value;
    }

    setContinuous(value) {
        this.continuous = value;
    }

    setBlendMode(mode) {
        this.blendMode = mode;
    }

    setTimeScale(value) {
        this.timeScale = value;
    }

    exportPng(filename = `pixel-fx-${Date.now()}.png`) {
        const link = document.createElement('a');
        link.download = filename;
        link.href = this.canvas.toDataURL('image/png');
        link.click();
    }

    drawTargetDummy() {
        if (!this.showTarget) return;

        const context = this.context;
        const w = this.canvas.width;
        const h = this.canvas.height;
        const cx = w / 2;
        const cy = h / 2;

        const scale = w / 160;
        const headRadius = 10 * scale;
        const bodyWidth = 18 * scale;
        const bodyHeight = 38 * scale;
        const legHeight = 26 * scale;

        const bodyTop = cy - bodyHeight / 2;
        const bodyBottom = bodyTop + bodyHeight;
        const headCenterY = bodyTop - headRadius;

        context.fillStyle = 'rgba(255,255,255,0.07)';

        context.beginPath();
        context.arc(cx, headCenterY, headRadius, 0, Math.PI * 2);
        context.fill();

        context.fillRect(cx - bodyWidth / 2, bodyTop, bodyWidth, bodyHeight);

        const legWidth = bodyWidth / 2.6;
        context.fillRect(cx - bodyWidth / 2, bodyBottom, legWidth, legHeight);
        context.fillRect(cx + bodyWidth / 2 - legWidth, bodyBottom, legWidth, legHeight);
    }

    drawViewportGuides() {
        const context = this.context;
        const w = this.canvas.width;
        const h = this.canvas.height;
        const cx = w / 2;
        const cy = h / 2;

        context.save();
        context.strokeStyle = 'rgba(255,255,255,0.04)';
        context.setLineDash([2, 4]);

        context.beginPath();
        context.moveTo(0, cy);
        context.lineTo(w, cy);
        context.stroke();

        context.beginPath();
        context.moveTo(cx, 0);
        context.lineTo(cx, h);
        context.stroke();

        context.setLineDash([]);
        context.restore();

        const accent = getComputedStyle(this.canvas).getPropertyValue('--accent').trim() || '#32d7ff';
        const ox = Math.round(this.emitter.originX);
        const oy = Math.round(this.emitter.originY);
        context.fillStyle = accent;
        context.fillRect(ox - 1, oy - 1, 3, 3);
    }
}
