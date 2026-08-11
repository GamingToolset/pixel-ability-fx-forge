import {
    AbilityEffect,
    EFFECT_FAMILIES,
    ELEMENTS,
    POWER_LEVELS,
    createEffectRecipe,
    randomSeed,
    renderEffectFrames
} from './AbilityEffect.js?v=3';

const canvas = document.querySelector('#fxCanvas');
const context = canvas.getContext('2d');
context.imageSmoothingEnabled = false;

const familySelect = document.querySelector('#familySelect');
const elementSelect = document.querySelector('#elementSelect');
const powerSelect = document.querySelector('#powerSelect');
const seedInput = document.querySelector('#seedInput');
const generateButton = document.querySelector('#generateBtn');
const newSeedButton = document.querySelector('#newSeedBtn');
const replayButton = document.querySelector('#replayBtn');
const pauseButton = document.querySelector('#pauseBtn');
const showTargetToggle = document.querySelector('#showTargetToggle');
const showOriginToggle = document.querySelector('#showOriginToggle');
const autoReplayToggle = document.querySelector('#autoReplayToggle');
const exportTargetToggle = document.querySelector('#exportTargetToggle');
const recipeName = document.querySelector('#recipeName');
const recipeFamily = document.querySelector('#recipeFamily');
const recipeElement = document.querySelector('#recipeElement');
const recipeDescription = document.querySelector('#recipeDescription');
const durationStat = document.querySelector('#durationStat');
const particleStat = document.querySelector('#particleStat');
const ringStat = document.querySelector('#ringStat');
const symmetryStat = document.querySelector('#symmetryStat');
const motifStat = document.querySelector('#motifStat');
const paletteSwatches = document.querySelector('#paletteSwatches');
const frameProgress = document.querySelector('#frameProgress');
const stageLabel = document.querySelector('#stageLabel');
const canvasSizeSelect = document.querySelector('#canvasSizeSelect');
const frameCountSelect = document.querySelector('#frameCountSelect');
const fpsSelect = document.querySelector('#fpsSelect');
const atlasPreview = document.querySelector('#atlasPreview');
const atlasPreviewShell = document.querySelector('#atlasPreviewShell');
const notice = document.querySelector('#notice');

let baseRecipe;
let activeEffect;
let startedAt = performance.now();
let frozenTime = 0;
let playing = true;
let noticeTimer;

const populateSelect = (select, entries, randomLabel) => {
    select.replaceChildren();
    const randomOption = new Option(randomLabel, 'random');
    select.append(randomOption);
    Object.entries(entries).forEach(([key, item]) => {
        select.append(new Option(item.label, key));
    });
};

populateSelect(familySelect, EFFECT_FAMILIES, 'Surprise me');
populateSelect(elementSelect, ELEMENTS, 'Any element');
Object.entries(POWER_LEVELS).forEach(([key, item]) => powerSelect.append(new Option(item.label, key)));
powerSelect.value = 'standard';

const setNotice = (message, tone = 'default') => {
    notice.textContent = message;
    notice.dataset.tone = tone;
    notice.classList.add('visible');
    window.clearTimeout(noticeTimer);
    noticeTimer = window.setTimeout(() => notice.classList.remove('visible'), 2800);
};

const sanitizeFilename = (value) => value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'ability-fx';

const timestamp = () => new Date().toISOString().replace(/[:.]/g, '-');

const downloadUrl = (url, filename) => {
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
};

const canvasToBlob = (sourceCanvas) => new Promise((resolve, reject) => {
    sourceCanvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas export failed.'));
    }, 'image/png');
});

const currentExportOptions = () => ({
    size: Number(canvasSizeSelect.value),
    frameCount: Number(frameCountSelect.value),
    fps: Number(fpsSelect.value),
    options: {
        showTarget: exportTargetToggle.checked,
        showOrigin: false
    }
});

const updateFamilyCards = () => {
    document.querySelectorAll('[data-family-card]').forEach((card) => {
        const selected = card.dataset.familyCard === familySelect.value
            || (familySelect.value === 'random' && card.dataset.familyCard === baseRecipe.family);
        card.classList.toggle('selected', selected);
        card.setAttribute('aria-pressed', selected ? 'true' : 'false');
    });
};

const updateRecipeReadout = () => {
    recipeName.textContent = baseRecipe.name;
    recipeFamily.textContent = EFFECT_FAMILIES[baseRecipe.family].shortLabel;
    recipeElement.textContent = ELEMENTS[baseRecipe.element].label;
    recipeDescription.textContent = baseRecipe.description;
    durationStat.textContent = `${activeEffect.duration.toFixed(1)}s`;
    particleStat.textContent = activeEffect.particleCount;
    ringStat.textContent = baseRecipe.rings;
    symmetryStat.textContent = `${baseRecipe.symmetry}-way`;
    motifStat.textContent = baseRecipe.motif.replace(/-/g, ' ');
    paletteSwatches.replaceChildren();
    baseRecipe.palette.forEach((color, index) => {
        const swatch = document.createElement('span');
        swatch.className = 'palette-swatch';
        swatch.style.background = color;
        swatch.title = `${index + 1}: ${color}`;
        paletteSwatches.append(swatch);
    });
    document.documentElement.style.setProperty('--effect-accent', baseRecipe.palette[1]);
    document.documentElement.style.setProperty('--effect-deep', baseRecipe.palette[3]);
    seedInput.value = baseRecipe.seed;
    updateFamilyCards();
};

const resetPlayback = () => {
    startedAt = performance.now();
    frozenTime = 0;
    playing = true;
    pauseButton.textContent = 'Pause';
    pauseButton.setAttribute('aria-pressed', 'false');
};

const applyRecipe = (recipe, { restart = true } = {}) => {
    baseRecipe = structuredClone(recipe);
    activeEffect = new AbilityEffect(baseRecipe);
    updateRecipeReadout();
    if (restart) resetPlayback();
};

const generateRecipe = ({ freshSeed = false } = {}) => {
    const seed = freshSeed ? randomSeed() : Number(seedInput.value) || randomSeed();
    const recipe = createEffectRecipe({
        family: familySelect.value,
        element: elementSelect.value,
        power: powerSelect.value,
        seed
    });
    applyRecipe(recipe);
    atlasPreviewShell.hidden = true;
    setNotice(`Generated ${recipe.name}`, 'success');
};

const playbackTime = (now) => playing ? (now - startedAt) / 1000 : frozenTime;

const getStage = (time) => {
    const progress = time / activeEffect.duration;
    if (time < 0.25) return 'Core flash';
    if (progress < 0.26) return 'Primary form';
    if (progress < 0.78) return baseRecipe.family === 'burst' ? 'Aftershock' : 'Sustain';
    return 'Release';
};

const animationLoop = (now) => {
    let time = playbackTime(now);
    const hold = 0.72;

    if (playing && time > activeEffect.duration + hold) {
        if (autoReplayToggle.checked) {
            startedAt = now;
            time = 0;
        } else {
            frozenTime = activeEffect.duration;
            playing = false;
            pauseButton.textContent = 'Play';
        }
    }

    activeEffect.draw(context, Math.min(time, activeEffect.duration), {
        showTarget: showTargetToggle.checked,
        showOrigin: showOriginToggle.checked
    });

    const progress = clamp(time / activeEffect.duration, 0, 1);
    frameProgress.style.width = `${progress * 100}%`;
    stageLabel.textContent = `${getStage(Math.min(time, activeEffect.duration))} · ${Math.min(time, activeEffect.duration).toFixed(1)}s`;
    requestAnimationFrame(animationLoop);
};

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const updateTuning = (input) => {
    const key = input.dataset.tuning;
    const value = Number(input.value);
    baseRecipe.tuning[key] = value;
    input.closest('.tuning-row').querySelector('output').value = `${value.toFixed(2)}×`;
    applyRecipe(baseRecipe);
};

const createAtlas = (frames, size) => {
    const columns = Math.min(8, frames.length);
    const rows = Math.ceil(frames.length / columns);
    const atlas = document.createElement('canvas');
    atlas.width = size * columns;
    atlas.height = size * rows;
    const atlasContext = atlas.getContext('2d');
    atlasContext.imageSmoothingEnabled = false;
    frames.forEach((frame, index) => {
        atlasContext.drawImage(frame, index % columns * size, Math.floor(index / columns) * size);
    });
    return atlas;
};

const captureFrames = async () => {
    const settings = currentExportOptions();
    setNotice('Rendering full cast…');
    const result = await renderEffectFrames({
        recipe: baseRecipe,
        size: settings.size,
        frameCount: settings.frameCount,
        options: settings.options
    });
    return { ...result, ...settings };
};

const exportAtlas = async () => {
    try {
        const { frames, size } = await captureFrames();
        const atlas = createAtlas(frames, size);
        const dataUrl = atlas.toDataURL('image/png');
        const image = new Image();
        image.src = dataUrl;
        image.alt = `${baseRecipe.name} sprite atlas`;
        atlasPreview.replaceChildren(image);
        atlasPreviewShell.hidden = false;
        downloadUrl(dataUrl, `atlas-${sanitizeFilename(baseRecipe.name)}-${timestamp()}.png`);
        setNotice('Sprite atlas exported', 'success');
    } catch (error) {
        console.error(error);
        setNotice(error.message, 'danger');
    }
};

const exportFramesZip = async () => {
    if (!globalThis.JSZip) {
        setNotice('ZIP exporter is still loading.', 'danger');
        return;
    }
    try {
        const { frames } = await captureFrames();
        const zip = new JSZip();
        for (let index = 0; index < frames.length; index += 1) {
            const blob = await canvasToBlob(frames[index]);
            zip.file(`frame-${String(index).padStart(3, '0')}.png`, blob);
        }
        zip.file('recipe.json', JSON.stringify(baseRecipe, null, 2));
        const blob = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(blob);
        downloadUrl(url, `frames-${sanitizeFilename(baseRecipe.name)}-${timestamp()}.zip`);
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
        setNotice('PNG sequence exported', 'success');
    } catch (error) {
        console.error(error);
        setNotice(error.message, 'danger');
    }
};

const exportGif = async () => {
    if (!globalThis.GIF) {
        setNotice('GIF exporter is still loading.', 'danger');
        return;
    }
    try {
        const { frames, fps } = await captureFrames();
        setNotice('Encoding GIF…');
        const gif = new GIF({
            workers: 2,
            quality: 1,
            repeat: 0,
            workerScript: 'https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.worker.js'
        });
        frames.forEach((frame) => gif.addFrame(frame, { copy: true, delay: Math.round(1000 / fps) }));
        gif.on('finished', (blob) => {
            const url = URL.createObjectURL(blob);
            downloadUrl(url, `cast-${sanitizeFilename(baseRecipe.name)}-${timestamp()}.gif`);
            window.setTimeout(() => URL.revokeObjectURL(url), 1000);
            setNotice('Animated GIF exported', 'success');
        });
        gif.on('abort', () => setNotice('GIF export was cancelled.', 'danger'));
        gif.render();
    } catch (error) {
        console.error(error);
        setNotice(error.message, 'danger');
    }
};

document.querySelectorAll('[data-family-card]').forEach((card) => {
    card.addEventListener('click', () => {
        familySelect.value = card.dataset.familyCard;
        generateRecipe({ freshSeed: true });
    });
});

generateButton.addEventListener('click', () => generateRecipe());
newSeedButton.addEventListener('click', () => generateRecipe({ freshSeed: true }));
replayButton.addEventListener('click', resetPlayback);
pauseButton.addEventListener('click', () => {
    if (playing) {
        frozenTime = Math.min((performance.now() - startedAt) / 1000, activeEffect.duration);
        playing = false;
        pauseButton.textContent = 'Play';
        pauseButton.setAttribute('aria-pressed', 'true');
    } else {
        startedAt = performance.now() - frozenTime * 1000;
        playing = true;
        pauseButton.textContent = 'Pause';
        pauseButton.setAttribute('aria-pressed', 'false');
    }
});

seedInput.addEventListener('change', () => generateRecipe());
document.querySelectorAll('[data-tuning]').forEach((input) => input.addEventListener('input', () => updateTuning(input)));
document.querySelector('#exportAtlasBtn').addEventListener('click', exportAtlas);
document.querySelector('#exportFramesBtn').addEventListener('click', exportFramesZip);
document.querySelector('#exportGifBtn').addEventListener('click', exportGif);

const initialRecipe = createEffectRecipe({ family: 'burst', element: 'fire', power: 'standard', seed: 734211 });
applyRecipe(initialRecipe);
requestAnimationFrame(animationLoop);
