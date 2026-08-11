import {
    AbilityEffect,
    EFFECT_FAMILIES,
    ELEMENTS,
    FORMATIONS,
    PARTICLE_KITS,
    POWER_LEVELS,
    TEMPORAL_STYLES,
    TRACE_STYLES,
    createEffectRecipe,
    randomSeed,
    renderEffectFrames
} from './AbilityEffect.js?v=9';

const GIF_WORKER_URL = new URL('./gif.worker.js', import.meta.url).href;
const GIF_TRANSPARENT_COLOR = 0x010203;
const GIF_MATTE_COLOR = '#010203';

const canvas = document.querySelector('#fxCanvas');
const context = canvas.getContext('2d');
context.imageSmoothingEnabled = false;

const controls = {
    family: document.querySelector('#familySelect'),
    element: document.querySelector('#elementSelect'),
    power: document.querySelector('#powerSelect'),
    formation: document.querySelector('#formationSelect'),
    secondaryFormation: document.querySelector('#secondaryFormationSelect'),
    geometry: document.querySelector('#geometrySelect'),
    secondaryGeometry: document.querySelector('#secondaryGeometrySelect'),
    trace: document.querySelector('#traceSelect'),
    secondaryTrace: document.querySelector('#secondaryTraceSelect'),
    particleKit: document.querySelector('#particleKitSelect'),
    flow: document.querySelector('#flowSelect'),
    temporal: document.querySelector('#temporalSelect')
};

const seedInput = document.querySelector('#seedInput');
const generateButton = document.querySelector('#generateBtn');
const newSeedButton = document.querySelector('#newSeedBtn');
const replayButton = document.querySelector('#replayBtn');
const pauseButton = document.querySelector('#pauseBtn');
const recipeFamily = document.querySelector('#recipeFamily');
const recipeElement = document.querySelector('#recipeElement');
const durationStat = document.querySelector('#durationStat');
const particleStat = document.querySelector('#particleStat');
const layerStat = document.querySelector('#layerStat');
const symmetryStat = document.querySelector('#symmetryStat');
const paletteSwatches = document.querySelector('#paletteSwatches');
const frameProgress = document.querySelector('#frameProgress');
const stageLabel = document.querySelector('#stageLabel');
const canvasSizeSelect = document.querySelector('#canvasSizeSelect');
const frameCountSelect = document.querySelector('#frameCountSelect');
const fpsSelect = document.querySelector('#fpsSelect');
const atlasPreview = document.querySelector('#atlasPreview');
const atlasPreviewShell = document.querySelector('#atlasPreviewShell');
const notice = document.querySelector('#notice');

const allGeometries = [...new Set(Object.values(FORMATIONS)
    .flatMap((family) => Object.values(family))
    .flatMap((formation) => formation.geometries))];
const allFlows = [...new Set(Object.values(FORMATIONS)
    .flatMap((family) => Object.values(family))
    .flatMap((formation) => formation.flows))];

let baseRecipe;
let activeEffect;
let startedAt = performance.now();
let frozenTime = 0;
let playing = true;
let noticeTimer;
let seedInputTimer;

const prettyLabel = (value) => String(value)
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/-/g, ' ')
    .replace(/^./, (letter) => letter.toUpperCase());

const setSelectOptions = (select, entries, value, firstOption) => {
    select.replaceChildren();
    if (firstOption) select.append(new Option(firstOption.label, firstOption.value));
    entries.forEach(([key, label]) => select.append(new Option(label, key)));
    select.value = value;
};

const populateStaticControls = () => {
    setSelectOptions(
        controls.family,
        Object.entries(EFFECT_FAMILIES).map(([key, item]) => [key, item.shortLabel]),
        'burst'
    );
    setSelectOptions(
        controls.element,
        Object.entries(ELEMENTS).map(([key, item]) => [key, item.label]),
        'arcane'
    );
    setSelectOptions(
        controls.power,
        Object.entries(POWER_LEVELS).map(([key, item]) => [key, item.label]),
        'standard'
    );
    setSelectOptions(controls.geometry, allGeometries.map((key) => [key, prettyLabel(key)]), 'circle');
    setSelectOptions(controls.secondaryGeometry, allGeometries.map((key) => [key, prettyLabel(key)]), 'ellipse');
    setSelectOptions(controls.trace, TRACE_STYLES.map((key) => [key, prettyLabel(key)]), 'pixels');
    setSelectOptions(controls.secondaryTrace, TRACE_STYLES.map((key) => [key, prettyLabel(key)]), 'dashes');
    setSelectOptions(
        controls.particleKit,
        Object.keys(PARTICLE_KITS).map((key) => [key, prettyLabel(key)]),
        'motes'
    );
    setSelectOptions(controls.flow, allFlows.map((key) => [key, prettyLabel(key)]), 'outward');
    setSelectOptions(
        controls.temporal,
        TEMPORAL_STYLES.map((key) => [key, prettyLabel(key)]),
        'instant'
    );
};

const syncFormationControls = () => {
    const formationEntries = Object.entries(FORMATIONS[baseRecipe.family])
        .map(([key, item]) => [key, item.label]);
    setSelectOptions(controls.formation, formationEntries, baseRecipe.formation);
    setSelectOptions(
        controls.secondaryFormation,
        formationEntries,
        baseRecipe.hybrid ? baseRecipe.secondaryFormation : 'none',
        { value: 'none', label: 'None' }
    );
};

const syncControls = () => {
    controls.family.value = baseRecipe.family;
    controls.element.value = baseRecipe.element;
    controls.power.value = baseRecipe.power;
    syncFormationControls();
    controls.geometry.value = baseRecipe.geometry;
    controls.secondaryGeometry.value = baseRecipe.secondaryGeometry;
    controls.trace.value = baseRecipe.traceStyle;
    controls.secondaryTrace.value = baseRecipe.secondaryTraceStyle;
    controls.particleKit.value = baseRecipe.particleKit;
    controls.flow.value = baseRecipe.flow;
    controls.temporal.value = baseRecipe.temporalStyle;
    controls.secondaryGeometry.disabled = !baseRecipe.hybrid;
    controls.secondaryTrace.disabled = !baseRecipe.hybrid;
};

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
    recipeFamily.textContent = EFFECT_FAMILIES[baseRecipe.family].shortLabel;
    recipeElement.textContent = ELEMENTS[baseRecipe.element].label;
    durationStat.textContent = `${activeEffect.duration.toFixed(1)}s`;
    particleStat.textContent = activeEffect.particleCount;
    layerStat.textContent = baseRecipe.layers;
    symmetryStat.textContent = `${baseRecipe.symmetry}-way`;
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

const applyRecipe = (recipe, { showNotice = false } = {}) => {
    baseRecipe = structuredClone(recipe);
    activeEffect = new AbilityEffect(baseRecipe);
    syncControls();
    updateRecipeReadout();
    resetPlayback();
    atlasPreviewShell.hidden = true;
    if (showNotice) setNotice('Effect updated', 'success');
};

const rebuildRecipe = (patch, { showNotice = true } = {}) => {
    applyRecipe({ ...baseRecipe, ...patch }, { showNotice });
};

const generateFromControls = ({ freshSeed = false } = {}) => {
    const seed = freshSeed ? randomSeed() : Number(seedInput.value) || randomSeed();
    const recipe = createEffectRecipe({
        family: controls.family.value,
        element: controls.element.value,
        power: controls.power.value,
        seed
    });
    applyRecipe(recipe);
    setNotice(`Variation ${recipe.seed} generated`, 'success');
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

const prepareGifFrame = (frame) => {
    const prepared = document.createElement('canvas');
    prepared.width = frame.width;
    prepared.height = frame.height;
    const preparedContext = prepared.getContext('2d');
    preparedContext.fillStyle = GIF_MATTE_COLOR;
    preparedContext.fillRect(0, 0, prepared.width, prepared.height);
    preparedContext.drawImage(frame, 0, 0);
    return prepared;
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
        setNotice('Encoding transparent GIF…');
        const gif = new GIF({
            workers: 2,
            quality: 10,
            repeat: 0,
            transparent: GIF_TRANSPARENT_COLOR,
            workerScript: GIF_WORKER_URL
        });
        frames.forEach((frame) => {
            gif.addFrame(prepareGifFrame(frame), {
                copy: true,
                delay: Math.round(1000 / fps)
            });
        });
        gif.on('finished', (blob) => {
            const url = URL.createObjectURL(blob);
            downloadUrl(url, `cast-${sanitizeFilename(baseRecipe.name)}-${timestamp()}.gif`);
            window.setTimeout(() => URL.revokeObjectURL(url), 1000);
            setNotice('Transparent GIF exported', 'success');
        });
        gif.on('abort', () => setNotice('GIF export was cancelled.', 'danger'));
        gif.render();
    } catch (error) {
        console.error(error);
        setNotice(error.message, 'danger');
    }
};

const bindStructureControls = () => {
    controls.family.addEventListener('change', () => generateFromControls());
    controls.element.addEventListener('change', () => generateFromControls());
    controls.power.addEventListener('change', () => generateFromControls());

    controls.formation.addEventListener('change', () => {
        const key = controls.formation.value;
        const formation = FORMATIONS[baseRecipe.family][key];
        rebuildRecipe({
            formation: key,
            formationLabel: formation.label,
            geometry: formation.geometries[0],
            flow: formation.flows[0]
        });
    });

    controls.secondaryFormation.addEventListener('change', () => {
        const key = controls.secondaryFormation.value;
        if (key === 'none') {
            rebuildRecipe({ hybrid: false });
            return;
        }
        const formation = FORMATIONS[baseRecipe.family][key];
        rebuildRecipe({
            hybrid: true,
            secondaryFormation: key,
            secondaryFormationLabel: formation.label,
            secondaryGeometry: formation.geometries[0]
        });
    });

    controls.geometry.addEventListener('change', () => rebuildRecipe({ geometry: controls.geometry.value }));
    controls.secondaryGeometry.addEventListener('change', () => rebuildRecipe({
        secondaryGeometry: controls.secondaryGeometry.value
    }));
    controls.trace.addEventListener('change', () => rebuildRecipe({ traceStyle: controls.trace.value }));
    controls.secondaryTrace.addEventListener('change', () => rebuildRecipe({
        secondaryTraceStyle: controls.secondaryTrace.value
    }));
    controls.particleKit.addEventListener('change', () => {
        const particleKit = controls.particleKit.value;
        rebuildRecipe({
            particleKit,
            particleShapes: [...PARTICLE_KITS[particleKit]]
        });
    });
    controls.flow.addEventListener('change', () => rebuildRecipe({ flow: controls.flow.value }));
    controls.temporal.addEventListener('change', () => rebuildRecipe({ temporalStyle: controls.temporal.value }));
};

populateStaticControls();
bindStructureControls();

generateButton.addEventListener('click', () => generateFromControls());
newSeedButton.addEventListener('click', () => generateFromControls({ freshSeed: true }));
seedInput.addEventListener('change', () => generateFromControls());
seedInput.addEventListener('input', () => {
    window.clearTimeout(seedInputTimer);
    seedInputTimer = window.setTimeout(() => generateFromControls(), 260);
});
seedInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') generateFromControls();
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

const initialRecipe = createEffectRecipe({ family: 'burst', element: 'arcane', power: 'standard', seed: 734211 });
applyRecipe({
    ...initialRecipe,
    formation: 'radial',
    formationLabel: FORMATIONS.burst.radial.label,
    geometry: 'ellipse',
    hybrid: true,
    secondaryFormation: 'crescent',
    secondaryFormationLabel: FORMATIONS.burst.crescent.label,
    secondaryGeometry: 'bow',
    traceStyle: 'shards',
    secondaryTraceStyle: 'spray',
    particleKit: 'crystals',
    particleShapes: [...PARTICLE_KITS.crystals],
    flow: 'outward',
    temporalStyle: 'instant'
});
requestAnimationFrame(animationLoop);
