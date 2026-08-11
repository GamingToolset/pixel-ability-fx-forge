import {
    AbilityEffect,
    EFFECT_FAMILIES,
    ELEMENTS,
    POWER_LEVELS,
    createEffectRecipe,
    randomSeed,
    renderEffectFrames
} from './AbilityEffect.js?v=8';

const GIF_WORKER_URL = new URL('./gif.worker.js', import.meta.url).href;

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
const recipeName = document.querySelector('#recipeName');
const recipeFamily = document.querySelector('#recipeFamily');
const recipeElement = document.querySelector('#recipeElement');
const recipeDescription = document.querySelector('#recipeDescription');
const durationStat = document.querySelector('#durationStat');
const particleStat = document.querySelector('#particleStat');
const layerStat = document.querySelector('#layerStat');
const symmetryStat = document.querySelector('#symmetryStat');
const formationStat = document.querySelector('#formationStat');
const geometryStat = document.querySelector('#geometryStat');
const traceStat = document.querySelector('#traceStat');
const particleStyleStat = document.querySelector('#particleStyleStat');
const flowStat = document.querySelector('#flowStat');
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
let seedInputTimer;

const populateSelect = (select, entries, randomLabel) => {
    select.replaceChildren(new Option(randomLabel, 'random'));
    Object.entries(entries).forEach(([key, item]) => select.append(new Option(item.label, key)));
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
    fps: Number(fpsSelect.value)
});

const updateRecipeReadout = () => {
    recipeName.textContent = baseRecipe.name;
    recipeFamily.textContent = EFFECT_FAMILIES[baseRecipe.family].shortLabel;
    recipeElement.textContent = ELEMENTS[baseRecipe.element].label;
    const hybridDescription = baseRecipe.hybrid
        ? ` It blends ${baseRecipe.formationLabel.toLowerCase()} with ${baseRecipe.secondaryFormationLabel.toLowerCase()}.`
        : ` This seed uses a ${baseRecipe.formationLabel.toLowerCase()} composition.`;
    recipeDescription.textContent = `${baseRecipe.description}${hybridDescription}`;
    durationStat.textContent = `${activeEffect.duration.toFixed(1)}s`;
    particleStat.textContent = activeEffect.particleCount;
    layerStat.textContent = baseRecipe.layers;
    symmetryStat.textContent = `${baseRecipe.symmetry}-way`;
    formationStat.textContent = baseRecipe.hybrid
        ? `${baseRecipe.formationLabel} + ${baseRecipe.secondaryFormationLabel}`
        : baseRecipe.formationLabel;
    geometryStat.textContent = baseRecipe.hybrid
        ? `${baseRecipe.geometry} / ${baseRecipe.secondaryGeometry}`.replace(/-/g, ' ')
        : baseRecipe.geometry.replace(/-/g, ' ');
    traceStat.textContent = baseRecipe.hybrid
        ? `${baseRecipe.traceStyle} / ${baseRecipe.secondaryTraceStyle}`
        : baseRecipe.traceStyle;
    particleStyleStat.textContent = baseRecipe.particleKit;
    flowStat.textContent = `${baseRecipe.flow} · ${baseRecipe.temporalStyle}`.replace(/-/g, ' ');
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
};

const resetPlayback = () => {
    startedAt = performance.now();
    frozenTime = 0;
    playing = true;
    pauseButton.textContent = 'Pause';
    pauseButton.setAttribute('aria-pressed', 'false');
};

const applyRecipe = (recipe) => {
    baseRecipe = structuredClone(recipe);
    activeEffect = new AbilityEffect(baseRecipe);
    updateRecipeReadout();
    resetPlayback();
};

const generateRecipe = ({ useTypedSeed = false } = {}) => {
    const seed = useTypedSeed ? Number(seedInput.value) || randomSeed() : randomSeed();
    const recipe = createEffectRecipe({
        family: familySelect.value,
        element: elementSelect.value,
        power: powerSelect.value,
        seed
    });
    applyRecipe(recipe);
    atlasPreviewShell.hidden = true;
    setNotice(`Generated ${recipe.name} · ${recipe.formationLabel}`, 'success');
};

const playbackTime = (now) => playing ? (now - startedAt) / 1000 : frozenTime;

const getStage = (time) => {
    const progress = time / activeEffect.duration;
    if (time < 0.25) return 'Core flash';
    if (progress < 0.28) return 'Primary form';
    if (progress < 0.78) return baseRecipe.family === 'burst' ? 'Aftershock' : 'Sustain';
    return 'Release';
};

const animationLoop = (now) => {
    let time = playbackTime(now);
    if (playing && time > activeEffect.duration + 0.58) {
        startedAt = now;
        time = 0;
    }

    activeEffect.draw(context, Math.min(time, activeEffect.duration));
    const progress = Math.max(0, Math.min(1, time / activeEffect.duration));
    frameProgress.style.width = `${progress * 100}%`;
    stageLabel.textContent = `${getStage(Math.min(time, activeEffect.duration))} · ${Math.min(time, activeEffect.duration).toFixed(1)}s`;
    requestAnimationFrame(animationLoop);
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
        frameCount: settings.frameCount
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
            zip.file(`frame-${String(index).padStart(3, '0')}.png`, await canvasToBlob(frames[index]));
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
            quality: 10,
            repeat: 0,
            workerScript: GIF_WORKER_URL
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

generateButton.addEventListener('click', () => generateRecipe());
newSeedButton.addEventListener('click', () => generateRecipe());
seedInput.addEventListener('change', () => generateRecipe({ useTypedSeed: true }));
seedInput.addEventListener('input', () => {
    window.clearTimeout(seedInputTimer);
    seedInputTimer = window.setTimeout(() => generateRecipe({ useTypedSeed: true }), 240);
});
seedInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') generateRecipe({ useTypedSeed: true });
});
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

document.querySelector('#exportAtlasBtn').addEventListener('click', exportAtlas);
document.querySelector('#exportFramesBtn').addEventListener('click', exportFramesZip);
document.querySelector('#exportGifBtn').addEventListener('click', exportGif);

applyRecipe(createEffectRecipe({ family: 'burst', element: 'fire', power: 'standard', seed: 734211 }));
requestAnimationFrame(animationLoop);
