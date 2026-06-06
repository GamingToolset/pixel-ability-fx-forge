import Emitter from './engine/Emitter.js';
import Renderer from './engine/Renderer.js';
import { presets } from './presets.js';

const canvas = document.querySelector('#fxCanvas');
const presetSelect = document.querySelector('#presetSelect');
const particleCount = document.querySelector('#particleCount');
const showTargetToggle = document.querySelector('#showTarget');
const autoPlayToggle = document.querySelector('#autoPlay');

const clone = (value) => structuredClone(value);
const pathParts = (path) => path.split('.');

let activePresetKey = 'fireball';
let activeConfig = clone(presets[activePresetKey]);
let emitter = new Emitter(activeConfig, { width: canvas.width, height: canvas.height });

const renderer = new Renderer(canvas, emitter, {
    showTarget: showTargetToggle.checked,
    continuous: autoPlayToggle.checked,
    onFrame: (count) => {
        particleCount.textContent = `${count} particle${count === 1 ? '' : 's'}`;
    }
});

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

const applyEmitterConfig = ({ reset = false } = {}) => {
    emitter.setConfig(activeConfig);
    if (reset) {
        emitter.reset();
        emitter.burst(activeConfig.emission.burstAmount);
    }
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
    activePresetKey = key;
    activeConfig = clone(presets[key]);
    syncUiFromConfig();
    applyEmitterConfig({ reset: true });
};

const bindActions = () => {
    document.querySelector('#loadPresetBtn').addEventListener('click', () => loadPreset(presetSelect.value));
    presetSelect.addEventListener('change', () => loadPreset(presetSelect.value));
    document.querySelector('#burstBtn').addEventListener('click', () => emitter.burst(activeConfig.emission.burstAmount));
    document.querySelector('#resetBtn').addEventListener('click', () => {
        emitter.reset();
        emitter.burst(activeConfig.emission.burstAmount);
    });
    document.querySelector('#downloadBtn').addEventListener('click', () => {
        renderer.exportPng(`pixel-fx-${activePresetKey}-${Date.now()}.png`);
    });
    showTargetToggle.addEventListener('change', () => renderer.setShowTarget(showTargetToggle.checked));
    autoPlayToggle.addEventListener('change', () => renderer.setContinuous(autoPlayToggle.checked));
};

populatePresets();
bindControlRows();
bindSimpleInputs();
bindActions();
syncUiFromConfig();
emitter.burst(activeConfig.emission.burstAmount);
renderer.start();
