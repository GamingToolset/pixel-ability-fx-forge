import Emitter from './engine/Emitter.js';
import Renderer from './engine/Renderer.js';
import { presets } from './presets.js';

const canvas = document.querySelector('#fxCanvas');
const presetSelect = document.querySelector('#presetSelect');
const particleCount = document.querySelector('#particleCount');
const showTargetToggle = document.querySelector('#showTarget');
const showOriginDotToggle = document.querySelector('#showOriginDot');
const autoPlayToggle = document.querySelector('#autoPlay');
const canvasSizeSelect = document.querySelector('#canvasSizeSelect');
const frameCountInput = document.querySelector('#frameCountInput');
const recordFramesBtn = document.querySelector('#recordFramesBtn');
const atlasPreview = document.querySelector('#atlasPreview');
const atlasPreviewLabel = document.querySelector('#atlasPreviewLabel');
const internalResolution = document.querySelector('#internalResolution');
const cssScaleLabel = document.querySelector('#cssScaleLabel');
const hierarchyResolution = document.querySelector('#hierarchyResolution');
const exportHelp = document.querySelector('#exportHelp');
const loopModeToggle = document.querySelector('#loopModeToggle');
const exportAtlasBtn = document.querySelector('#exportAtlasBtn');
const downloadBtn = document.querySelector('#downloadBtn');
const exportGifBtn = document.querySelector('#exportGifBtn');
const copyConfigBtn = document.querySelector('#copyConfigBtn');
const presetSearch = document.querySelector('#presetSearch');
const blendModeSelect = document.querySelector('#blendModeSelect');
const playbackSpeedRange = document.querySelector('#playbackSpeedRange');
const playbackSpeedNumber = document.querySelector('#playbackSpeedNumber');

const VIEWPORT_SIZE = 480;
const CAPTURE_STEP = 1 / 60;

const PARTICLE_SHAPES = ['square', 'circle', 'diamond', 'cross', 'plus', 'star', 'pixel-cluster'];

const clone = (value) => structuredClone(value);
const pathParts = (path) => path.split('.');

let activePresetKey = 'fireball';
let activeConfig = clone(presets[activePresetKey]);
let emitter = new Emitter(activeConfig, { width: canvas.width, height: canvas.height });

const renderer = new Renderer(canvas, emitter, {
    showTarget: showTargetToggle.checked,
    showOriginDot: showOriginDotToggle.checked,
    continuous: autoPlayToggle.checked,
    onFrame: (count) => {
        particleCount.textContent = `${count} particle${count === 1 ? '' : 's'}`;
    }
});

showOriginDotToggle.addEventListener('change', () => renderer.setShowOriginDot(showOriginDotToggle.checked));

const getByPath = (object, path) => pathParts(path).reduce((target, key) => target[key], object);

const setByPath = (object, path, value) => {
    const keys = pathParts(path);
    const lastKey = keys.pop();
    const target = keys.reduce((current, key) => current[key], object);
    target[lastKey] = value;
};

const normalizePalette = (value) => value
    .split(',')
    .map((color) => color.trim())
    .filter(Boolean);

const sanitizeFilenamePart = (value) => value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'effect';

const formatTimestamp = () => new Date()
    .toISOString()
    .replace(/[:.]/g, '-')
    .replace('T', '_')
    .replace('Z', '');

const downloadUrl = (url, filename) => {
    const link = document.createElement('a');
    link.download = filename;
    link.href = url;
    link.click();
};

const canvasToBlob = (targetCanvas) => new Promise((resolve) => {
    targetCanvas.toBlob((blob) => resolve(blob), 'image/png');
});

const updateRecordButtonLabel = () => {
    recordFramesBtn.textContent = `Record ${getFrameCount()} Frames`;
};

const getFrameCount = () => {
    const min = Number(frameCountInput.min);
    const max = Number(frameCountInput.max);
    const value = Math.round(Number(frameCountInput.value) || 8);
    const clamped = Math.min(max, Math.max(min, value));
    frameCountInput.value = clamped;
    return clamped;
};

const getCanvasSize = () => canvas.width;

renderer.setFramePreviewMode(true, getFrameCount(), activeConfig.visuals.life);

const flashButton = (button, message, duration = 1800) => {
    const original = button.textContent;
    button.textContent = message;
    button.disabled = true;
    setTimeout(() => {
        button.textContent = original;
        button.disabled = false;
    }, duration);
};

const advanceEmitterTo = (emitterInstance, state, targetOffset) => {
    while (state.elapsed + CAPTURE_STEP <= targetOffset) {
        emitterInstance.update(CAPTURE_STEP, true);
        state.elapsed += CAPTURE_STEP;
    }
    const remainder = targetOffset - state.elapsed;
    if (remainder > 1e-6) {
        emitterInstance.update(remainder, true);
        state.elapsed = targetOffset;
    }
};

const captureFrameSequenceLoop = async () => {
    const frameCount = getFrameCount();
    const size = getCanvasSize();
    const T = Math.max(0.1, activeConfig.visuals.life);

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

    // Emitter B is seeded T/2 ahead of emitter A so their cross-fade weights
    // (sin² and cos² of the same phase) always sum to 1, giving a seamless wrap.
    const emitterA = new Emitter(activeConfig, { width: size, height: size });
    const emitterB = new Emitter(activeConfig, { width: size, height: size });
    emitterA.reset();
    emitterB.reset();

    const warmupTime = 2 * T;
    let t = 0;
    while (t < warmupTime) {
        emitterA.update(CAPTURE_STEP, true);
        t += CAPTURE_STEP;
    }
    t = 0;
    while (t < warmupTime + T / 2) {
        emitterB.update(CAPTURE_STEP, true);
        t += CAPTURE_STEP;
    }

    const stateA = { elapsed: 0 };
    const stateB = { elapsed: T / 2 };
    const frames = [];

    for (let i = 0; i < frameCount; i++) {
        const targetOffset = (i * T) / frameCount;

        advanceEmitterTo(emitterA, stateA, targetOffset);
        advanceEmitterTo(emitterB, stateB, targetOffset + T / 2);

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

        frames.push(await canvasToBlob(compositeCanvas));
    }

    return { frames, frameCount, size, loopMode: 'loop' };
};

const captureFrameSequenceOneShot = async () => {
    const frameCount = getFrameCount();
    const size = getCanvasSize();
    const lifetime = Math.max(0.1, activeConfig.visuals.life);

    const captureCanvas = document.createElement('canvas');
    captureCanvas.width = size;
    captureCanvas.height = size;
    const captureContext = captureCanvas.getContext('2d');
    captureContext.imageSmoothingEnabled = false;

    const captureEmitter = new Emitter(activeConfig, { width: size, height: size });
    captureEmitter.reset();
    captureEmitter.burst(activeConfig.emission.burstAmount);

    const frames = [];
    let elapsed = 0;
    const startT = lifetime * 0.05;
    const endT = lifetime * 0.92;

    for (let index = 0; index < frameCount; index += 1) {
        const targetTime = frameCount === 1
            ? startT
            : startT + ((endT - startT) * index) / (frameCount - 1);

        while (elapsed + CAPTURE_STEP < targetTime) {
            captureEmitter.update(CAPTURE_STEP, false);
            elapsed += CAPTURE_STEP;
        }

        const remainder = targetTime - elapsed;
        if (remainder > 0) {
            captureEmitter.update(remainder, false);
            elapsed = targetTime;
        }

        captureContext.clearRect(0, 0, size, size);
        captureEmitter.draw(captureContext);
        frames.push(await canvasToBlob(captureCanvas));
    }

    return { frames, frameCount, size, loopMode: 'oneshot' };
};

const captureFrameSequence = async () => {
    const useLoop = loopModeToggle ? loopModeToggle.checked : true;
    return useLoop ? captureFrameSequenceLoop() : captureFrameSequenceOneShot();
};

const createAtlasFromFrames = async (frames, frameCount, size) => {
    const atlasCanvas = document.createElement('canvas');
    atlasCanvas.width = frameCount * size;
    atlasCanvas.height = size;
    const atlasContext = atlasCanvas.getContext('2d');
    atlasContext.imageSmoothingEnabled = false;

    for (let index = 0; index < frames.length; index += 1) {
        const bitmap = await createImageBitmap(frames[index]);
        atlasContext.drawImage(bitmap, index * size, 0);
        bitmap.close();
    }

    return atlasCanvas;
};

const updateAtlasPreview = (dataUrl, loopMode) => {
    atlasPreview.classList.remove('empty');
    atlasPreview.textContent = '';
    const image = document.createElement('img');
    image.src = dataUrl;
    image.alt = 'Latest exported sprite atlas preview';
    atlasPreview.append(image);

    if (atlasPreviewLabel) {
        atlasPreviewLabel.textContent = loopMode === 'loop'
            ? 'Atlas Preview · Seamless Loop'
            : 'Atlas Preview · One-Shot';
    }
};

const applyEmitterConfig = ({ reset = false } = {}) => {
    emitter.setConfig(activeConfig);
    if (reset) {
        emitter.reset();
        emitter.burst(activeConfig.emission.burstAmount);
    }
    renderer.markPreviewDirty();
};

const updateCanvasMetadata = () => {
    const size = getCanvasSize();
    const displaySize = Math.min(VIEWPORT_SIZE, size <= VIEWPORT_SIZE ? VIEWPORT_SIZE : size);
    const scale = displaySize / size;
    canvas.style.width = `${displaySize}px`;
    canvas.style.height = `${displaySize}px`;
    internalResolution.textContent = `Internal: ${size}×${size}`;
    cssScaleLabel.textContent = `CSS Scale: ${Number.isInteger(scale) ? `${scale}×` : `${scale.toFixed(2)}×`} · image-rendering: pixelated`;
    hierarchyResolution.textContent = `Canvas Camera · ${size}×${size}`;
    exportHelp.textContent = `Exports the internal transparent ${size}×${size} canvas. The checkerboard is preview-only.`;
};

const resizeCanvas = (size) => {
    canvas.width = size;
    canvas.height = size;
    renderer.context = canvas.getContext('2d');
    renderer.context.imageSmoothingEnabled = false;
    emitter.bounds = { width: size, height: size };
    emitter.originX = size / 2;
    emitter.originY = size / 2;
    updateCanvasMetadata();
    emitter.reset();
    emitter.burst(activeConfig.emission.burstAmount);
    renderer.markPreviewDirty();
};

const syncControlRow = (row) => {
    const path = row.dataset.control;
    const range = row.querySelector('input[type="range"]');
    const number = row.querySelector('input[type="number"]');
    const value = getByPath(activeConfig, path);

    for (const input of [range, number]) {
        input.min = row.dataset.min;
        input.max = row.dataset.max;
        input.step = row.dataset.step;
        input.value = value;
    }
};

const syncUiFromConfig = () => {
    document.querySelectorAll('[data-control]').forEach(syncControlRow);

    document.querySelectorAll('[data-select]').forEach((select) => {
        select.value = getByPath(activeConfig, select.dataset.select);
    });

    document.querySelectorAll('[data-color]').forEach((input) => {
        input.value = getByPath(activeConfig, input.dataset.color);
    });

    document.querySelectorAll('[data-text]').forEach((input) => {
        const value = getByPath(activeConfig, input.dataset.text);
        input.value = Array.isArray(value) ? value.join(', ') : value;
    });

    if (blendModeSelect) {
        blendModeSelect.value = activeConfig.blendMode || 'source-over';
        renderer.setBlendMode(blendModeSelect.value);
    }
};

const randomInRange = (min, max, step) => {
    const raw = min + Math.random() * (max - min);
    if (step >= 1) return Math.round(raw / step) * step;
    const decimals = Math.max(0, String(step).split('.')[1]?.length || 0);
    return Number((Math.round(raw / step) * step).toFixed(decimals));
};

const hslToHex = (hue, saturation, lightness) => {
    const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
    const x = chroma * (1 - Math.abs((hue / 60) % 2 - 1));
    const match = lightness - chroma / 2;
    const [red, green, blue] = hue < 60 ? [chroma, x, 0]
        : hue < 120 ? [x, chroma, 0]
            : hue < 180 ? [0, chroma, x]
                : hue < 240 ? [0, x, chroma]
                    : hue < 300 ? [x, 0, chroma]
                        : [chroma, 0, x];

    return [red, green, blue]
        .map((channel) => Math.round((channel + match) * 255).toString(16).padStart(2, '0'))
        .join('')
        .replace(/^/, '#');
};

const randomHighSaturationColor = () => hslToHex(
    Math.floor(Math.random() * 360),
    randomInRange(0.72, 1, 0.01),
    randomInRange(0.48, 0.72, 0.01)
);

const randomizeConfig = () => {
    const randomized = clone(activeConfig);

    document.querySelectorAll('[data-control]').forEach((row) => {
        const min = Number(row.dataset.min);
        const max = Number(row.dataset.max);
        const step = Number(row.dataset.step);
        setByPath(randomized, row.dataset.control, randomInRange(min, max, step));
    });

    if (randomized.movement.minVelocity > randomized.movement.maxVelocity) {
        [randomized.movement.minVelocity, randomized.movement.maxVelocity] = [
            randomized.movement.maxVelocity,
            randomized.movement.minVelocity
        ];
    }

    document.querySelectorAll('[data-select]').forEach((select) => {
        const options = Array.from(select.options).map((option) => option.value);
        setByPath(randomized, select.dataset.select, options[Math.floor(Math.random() * options.length)]);
    });

    randomized.visuals.particleShape = PARTICLE_SHAPES[Math.floor(Math.random() * PARTICLE_SHAPES.length)];

    const paletteLength = Math.floor(randomInRange(3, 5, 1));
    const palette = Array.from({ length: paletteLength }, randomHighSaturationColor);
    randomized.visuals.palette = palette;
    randomized.visuals.startColor = palette[0];
    randomized.visuals.endColor = palette.at(-1);
    randomized.name = 'Randomized Effect';

    activeConfig = randomized;
    activePresetKey = 'randomized';
    presetSelect.value = '';
    syncUiFromConfig();
    applyEmitterConfig({ reset: true });
};

const bindControlRows = () => {
    document.querySelectorAll('[data-control]').forEach((row) => {
        const path = row.dataset.control;
        const inputs = row.querySelectorAll('input');

        inputs.forEach((input) => {
            input.addEventListener('input', () => {
                const value = Number(input.value);
                setByPath(activeConfig, path, value);
                inputs.forEach((pairedInput) => {
                    if (pairedInput !== input) pairedInput.value = value;
                });
                applyEmitterConfig();
            });
        });
    });
};

const bindSimpleInputs = () => {
    document.querySelectorAll('[data-select]').forEach((select) => {
        select.addEventListener('change', () => {
            setByPath(activeConfig, select.dataset.select, select.value);
            applyEmitterConfig();
        });
    });

    document.querySelectorAll('[data-color]').forEach((input) => {
        input.addEventListener('input', () => {
            setByPath(activeConfig, input.dataset.color, input.value);
            applyEmitterConfig();
        });
    });

    document.querySelectorAll('[data-text]').forEach((input) => {
        input.addEventListener('change', () => {
            setByPath(activeConfig, input.dataset.text, normalizePalette(input.value));
            applyEmitterConfig();
        });
    });
};

const populatePresets = () => {
    Object.entries(presets).forEach(([key, preset]) => {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = preset.name;
        presetSelect.append(option);
    });
    presetSelect.value = activePresetKey;
};

const loadPreset = (key) => {
    if (!presets[key]) return;
    activePresetKey = key;
    activeConfig = clone(presets[key]);
    syncUiFromConfig();
    applyEmitterConfig({ reset: true });
};

const recordFrames = async () => {
    recordFramesBtn.disabled = true;
    const { frames } = await captureFrameSequence();
    const zip = new JSZip();
    const presetName = sanitizeFilenamePart(activeConfig.name || activePresetKey);
    const timestamp = formatTimestamp();

    frames.forEach((frame, index) => {
        zip.file(`frame-${String(index + 1).padStart(2, '0')}.png`, frame);
    });

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    downloadUrl(url, `sprite-frames-${presetName}-${timestamp}.zip`);
    URL.revokeObjectURL(url);

    flashButton(recordFramesBtn, '✓ Saved ZIP');
};

const exportAtlas = async () => {
    exportAtlasBtn.disabled = true;
    const { frames, frameCount, size, loopMode } = await captureFrameSequence();
    const atlasCanvas = await createAtlasFromFrames(frames, frameCount, size);
    const presetName = sanitizeFilenamePart(activeConfig.name || activePresetKey);
    const timestamp = formatTimestamp();
    const dataUrl = atlasCanvas.toDataURL('image/png');

    updateAtlasPreview(dataUrl, loopMode);
    downloadUrl(dataUrl, `atlas-${presetName}-${timestamp}.png`);

    flashButton(exportAtlasBtn, '✓ Atlas Saved');
};

let draggingOrigin = false;

const updateOriginFromEvent = (event) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    emitter.originX = (event.clientX - rect.left) * scaleX;
    emitter.originY = (event.clientY - rect.top) * scaleY;
};

const bindCanvasDrag = () => {
    canvas.addEventListener('pointerdown', (event) => {
        draggingOrigin = true;
        updateOriginFromEvent(event);
    });
    canvas.addEventListener('pointermove', (event) => {
        if (!draggingOrigin) return;
        updateOriginFromEvent(event);
    });
    canvas.addEventListener('pointerup', () => {
        draggingOrigin = false;
    });
    canvas.addEventListener('pointerleave', () => {
        draggingOrigin = false;
    });
};

const blobToImageData = async (blob, size) => {
    const bitmap = await createImageBitmap(blob);
    const offscreen = document.createElement('canvas');
    offscreen.width = size;
    offscreen.height = size;
    const ctx = offscreen.getContext('2d');
    ctx.drawImage(bitmap, 0, 0);
    bitmap.close();
    return ctx.getImageData(0, 0, size, size);
};

const exportGif = async () => {
    exportGifBtn.disabled = true;
    const { frames, frameCount, size } = await captureFrameSequence();

    const gif = new GIF({
        workers: 2,
        quality: 10,
        width: size,
        height: size,
        transparent: 0x00000000
    });

    const delay = Math.round(1000 / frameCount * activeConfig.visuals.life);

    for (const frame of frames) {
        const imageData = await blobToImageData(frame, size);
        gif.addFrame(imageData, { delay });
    }

    gif.on('finished', (blob) => {
        const url = URL.createObjectURL(blob);
        const presetName = sanitizeFilenamePart(activeConfig.name || activePresetKey);
        const timestamp = formatTimestamp();
        downloadUrl(url, `animated-${presetName}-${timestamp}.gif`);
        URL.revokeObjectURL(url);
        flashButton(exportGifBtn, '✓ GIF Saved');
    });

    gif.render();
};

const filterPresets = () => {
    const query = presetSearch.value.trim().toLowerCase();
    const options = Array.from(presetSelect.options);
    const visible = [];

    options.forEach((option) => {
        const matches = option.textContent.toLowerCase().includes(query);
        option.hidden = !matches;
        if (matches) visible.push(option);
    });

    if (visible.length === 1) {
        presetSelect.value = visible[0].value;
        loadPreset(visible[0].value);
    }
};

const copyConfigJson = () => {
    navigator.clipboard.writeText(JSON.stringify(activeConfig, null, 2));
    flashButton(copyConfigBtn, '✓ Copied!');
};

const bindActions = () => {
    document.querySelector('#loadPresetBtn').addEventListener('click', () => loadPreset(presetSelect.value));
    presetSelect.addEventListener('change', () => loadPreset(presetSelect.value));
    document.querySelector('#burstBtn').addEventListener('click', () => emitter.burst(activeConfig.emission.burstAmount));
    document.querySelector('#resetBtn').addEventListener('click', () => {
        emitter.reset();
        emitter.burst(activeConfig.emission.burstAmount);
    });
    downloadBtn.addEventListener('click', () => {
        renderer.exportPng(`pixel-fx-${sanitizeFilenamePart(activeConfig.name || activePresetKey)}-${formatTimestamp()}.png`);
        flashButton(downloadBtn, '✓ PNG Saved');
    });
    recordFramesBtn.addEventListener('click', recordFrames);
    exportAtlasBtn.addEventListener('click', exportAtlas);
    document.querySelector('#randomizeBtn').addEventListener('click', randomizeConfig);
    canvasSizeSelect.addEventListener('change', () => resizeCanvas(Number(canvasSizeSelect.value)));
    frameCountInput.addEventListener('input', () => {
        updateRecordButtonLabel();
        renderer.setFramePreviewMode(true, getFrameCount(), activeConfig.visuals.life);
        renderer.markPreviewDirty();
    });
    showTargetToggle.addEventListener('change', () => renderer.setShowTarget(showTargetToggle.checked));
    autoPlayToggle.addEventListener('change', () => renderer.setContinuous(autoPlayToggle.checked));

    exportGifBtn.addEventListener('click', exportGif);
    copyConfigBtn.addEventListener('click', copyConfigJson);
    presetSearch.addEventListener('input', filterPresets);

    blendModeSelect.addEventListener('change', () => {
        activeConfig.blendMode = blendModeSelect.value;
        renderer.setBlendMode(blendModeSelect.value);
    });

    const syncPlaybackSpeed = (value) => {
        const clamped = Math.min(3.0, Math.max(0.1, Number(value) || 1));
        playbackSpeedRange.value = clamped;
        playbackSpeedNumber.value = clamped;
        renderer.setTimeScale(clamped);
    };
    playbackSpeedRange.addEventListener('input', () => syncPlaybackSpeed(playbackSpeedRange.value));
    playbackSpeedNumber.addEventListener('input', () => syncPlaybackSpeed(playbackSpeedNumber.value));
};

populatePresets();
bindControlRows();
bindSimpleInputs();
bindActions();
bindCanvasDrag();
syncUiFromConfig();
updateRecordButtonLabel();
updateCanvasMetadata();
emitter.burst(activeConfig.emission.burstAmount);
renderer.start();
