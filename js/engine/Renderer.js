import Emitter from './Emitter.js';

export default class Renderer {
    constructor(canvas, emitter, options = {}) {
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        this.context.imageSmoothingEnabled = false;
        this.emitter = emitter;
        this.showTarget = options.showTarget ?? true;
        this.showOriginDot = options.showOriginDot ?? true;
        this.continuous = options.continuous ?? true;
        this.lastTime = 0;
        this.running = false;
        this.onFrame = options.onFrame || (() => {});
        this.blendMode = 'source-over';
        this.timeScale = 1.0;

        this.framePreviewMode = false;
        this.frameCount = 8;
        this.frameDuration = 1.25;
        this.previewTime = 0;
        this._previewFrames = null;
        this._previewDirty = true;
        this._rebuilding = false;
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

        if (this.framePreviewMode) {
            this.clear();

            if (this._previewDirty && !this._rebuilding) {
                this._rebuildPreviewFrames();
            }

            if (this._previewFrames && this._previewFrames.length === this.frameCount) {
                this.previewTime += deltaTime;
                if (this.previewTime >= this.frameDuration) {
                    this.previewTime -= this.frameDuration;
                }
                let frameIndex = Math.floor((this.previewTime / this.frameDuration) * this.frameCount);
                frameIndex = Math.min(this.frameCount - 1, Math.max(0, frameIndex));
                this.context.putImageData(this._previewFrames[frameIndex], 0, 0);
                this.onFrame(this.emitter.particles.length);
            }

            this.drawTargetDummy();
            this.drawViewportGuides();

            if (this._rebuilding) {
                this._drawPreviewBuildingOverlay();
            }
        } else {
            this.clear();
            this.drawTargetDummy();
            this.drawViewportGuides();
            this.emitter.update(deltaTime, this.continuous);

            this.context.globalCompositeOperation = this.blendMode;
            this.emitter.draw(this.context);
            this.context.globalCompositeOperation = 'source-over';

            this.onFrame(this.emitter.particles.length);
        }

        requestAnimationFrame((nextTime) => this.loop(nextTime));
    }

    _drawPreviewBuildingOverlay() {
        const context = this.context;
        const w = this.canvas.width;
        const h = this.canvas.height;
        const muted = getComputedStyle(this.canvas).getPropertyValue('--text-muted').trim() || '#9aa3b2';

        context.save();
        context.fillStyle = muted;
        context.font = '10px sans-serif';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText('⟳ Building preview…', w / 2, h / 2);
        context.restore();
    }

    async _rebuildPreviewFrames() {
        this._rebuilding = true;
        this._previewDirty = false;

        const { frameCount, frameDuration: T } = this;
        const size = this.canvas.width;
        const STEP = 1 / 60;

        const canvasA = document.createElement('canvas');
        const canvasB = document.createElement('canvas');
        const compositeCanvas = document.createElement('canvas');
        for (const c of [canvasA, canvasB, compositeCanvas]) {
            c.width = size;
            c.height = size;
        }
        const ctxA = canvasA.getContext('2d');
        const ctxB = canvasB.getContext('2d');
        const ctxC = compositeCanvas.getContext('2d');
        for (const ctx of [ctxA, ctxB, ctxC]) {
            ctx.imageSmoothingEnabled = false;
        }

        // Two emitters offset by T/2 so cross-fade weights (sin²/cos² of phase)
        // always sum to 1, making the wrap from the last frame to frame 0 seamless.
        const emitterA = new Emitter(this.emitter.config, { width: size, height: size });
        const emitterB = new Emitter(this.emitter.config, { width: size, height: size });
        emitterA.reset();
        emitterB.reset();

        const warmup = 2 * T;
        let t = 0;
        while (t < warmup) {
            emitterA.update(STEP, true);
            t += STEP;
        }
        t = 0;
        while (t < warmup + T / 2) {
            emitterB.update(STEP, true);
            t += STEP;
        }

        const advanceTo = (emitterInstance, state, targetOffset) => {
            while (state.elapsed + STEP <= targetOffset) {
                emitterInstance.update(STEP, true);
                state.elapsed += STEP;
            }
            const rem = targetOffset - state.elapsed;
            if (rem > 1e-6) {
                emitterInstance.update(rem, true);
                state.elapsed = targetOffset;
            }
        };

        const stateA = { elapsed: 0 };
        const stateB = { elapsed: T / 2 };
        const frames = [];

        for (let i = 0; i < frameCount; i++) {
            const targetOffset = (i * T) / frameCount;

            advanceTo(emitterA, stateA, targetOffset);
            advanceTo(emitterB, stateB, targetOffset + T / 2);

            ctxA.clearRect(0, 0, size, size);
            emitterA.draw(ctxA);

            ctxB.clearRect(0, 0, size, size);
            emitterB.draw(ctxB);

            const phase = i / frameCount;
            const weightA = Math.sin(Math.PI * phase) ** 2;
            const weightB = Math.cos(Math.PI * phase) ** 2; // weightA + weightB = 1.0 always

            ctxC.clearRect(0, 0, size, size);
            ctxC.globalAlpha = weightB;
            ctxC.drawImage(canvasB, 0, 0);
            ctxC.globalAlpha = weightA;
            ctxC.drawImage(canvasA, 0, 0);
            ctxC.globalAlpha = 1.0;

            frames.push(ctxC.getImageData(0, 0, size, size));
        }

        this._previewFrames = frames;
        this._rebuilding = false;
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

    setShowOriginDot(value) {
        this.showOriginDot = value;
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

    setFramePreviewMode(enabled, frameCount, frameDuration) {
        this.framePreviewMode = enabled;
        if (frameCount !== undefined) this.frameCount = frameCount;
        if (frameDuration !== undefined) this.frameDuration = frameDuration;
        this.markPreviewDirty();
    }

    markPreviewDirty() {
        this._previewDirty = true;
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

        if (this.showOriginDot) {
            const accent = getComputedStyle(this.canvas).getPropertyValue('--accent').trim() || '#32d7ff';
            const ox = Math.round(this.emitter.originX);
            const oy = Math.round(this.emitter.originY);
            context.fillStyle = accent;
            context.fillRect(ox - 1, oy - 1, 3, 3);
        }
    }
}
