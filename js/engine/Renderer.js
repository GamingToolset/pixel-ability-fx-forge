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
    }

    start() {
        if (this.running) return;
        this.running = true;
        requestAnimationFrame((time) => this.loop(time));
    }

    loop(time) {
        if (!this.running) return;

        const deltaTime = Math.min((time - this.lastTime) / 1000 || 0, 1 / 30);
        this.lastTime = time;

        this.clear();
        this.drawTargetDummy();
        this.emitter.update(deltaTime, this.continuous);
        this.emitter.draw(this.context);
        this.drawViewportGuides();
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

    exportPng(filename = `pixel-fx-${Date.now()}.png`) {
        const link = document.createElement('a');
        link.download = filename;
        link.href = this.canvas.toDataURL('image/png');
        link.click();
    }

    drawTargetDummy() {
    }

    drawViewportGuides() {
    }
}
