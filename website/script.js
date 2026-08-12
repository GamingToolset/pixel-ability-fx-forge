(() => {
    const TAU = Math.PI * 2;
    const impactCanvas = document.querySelector('#impactFx');
    const wardCanvas = document.querySelector('#wardFx');
    const impact = impactCanvas.getContext('2d');
    const ward = wardCanvas.getContext('2d');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    impact.imageSmoothingEnabled = false;
    ward.imageSmoothingEnabled = false;

    const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
    const easeOut = (value) => 1 - Math.pow(1 - clamp(value), 3);

    const pixelDiamond = (context, x, y, size) => {
        const radius = Math.max(1, Math.round(size));
        for (let row = -radius; row <= radius; row += 1) {
            const width = (radius - Math.abs(row)) * 2 + 1;
            context.fillRect(Math.round(x - width / 2), Math.round(y + row), width, 1);
        }
    };

    const pixelStar = (context, x, y, size) => {
        const radius = Math.max(2, Math.round(size));
        context.fillRect(Math.round(x - radius), Math.round(y), radius * 2 + 1, 1);
        context.fillRect(Math.round(x), Math.round(y - radius), 1, radius * 2 + 1);
        for (let offset = 1; offset < radius; offset += 1) {
            context.fillRect(Math.round(x + offset), Math.round(y + offset), 1, 1);
            context.fillRect(Math.round(x - offset), Math.round(y + offset), 1, 1);
            context.fillRect(Math.round(x + offset), Math.round(y - offset), 1, 1);
            context.fillRect(Math.round(x - offset), Math.round(y - offset), 1, 1);
        }
    };

    const drawImpact = (time) => {
        const local = (time % 2.8) / 2.8;
        const expansion = easeOut(local / 0.72);
        const fade = 1 - clamp((local - 0.42) / 0.58);
        const radius = 8 + expansion * 59;
        impact.clearRect(0, 0, 160, 160);
        impact.save();
        impact.globalCompositeOperation = 'lighter';

        for (let glow = 5; glow >= 1; glow -= 1) {
            impact.globalAlpha = fade * 0.025 * glow;
            impact.fillStyle = glow % 2 ? '#a855f7' : '#ef8dff';
            pixelDiamond(impact, 80, 80, 8 + glow * 3);
        }

        for (let ring = 0; ring < 3; ring += 1) {
            const ringRadius = Math.max(4, radius - ring * 11);
            const points = 24 + ring * 8;
            impact.fillStyle = ring === 0 ? '#fff1ff' : ring === 1 ? '#ef8dff' : '#a855f7';
            impact.globalAlpha = fade * (0.9 - ring * 0.2);
            for (let index = 0; index < points; index += 1) {
                if ((index + ring) % 7 === 0 && local > 0.56) continue;
                const angle = index / points * TAU + time * (ring % 2 ? -0.5 : 0.42);
                const wobble = Math.sin(index * 7.31 + time * 5) * 2.5;
                const x = 80 + Math.cos(angle) * (ringRadius + wobble);
                const y = 80 + Math.sin(angle) * (ringRadius * 0.82 + wobble);
                if (ring === 0 && index % 4 === 0) pixelDiamond(impact, x, y, 2);
                else impact.fillRect(Math.round(x) - 1, Math.round(y) - 1, ring === 2 ? 2 : 3, ring === 2 ? 2 : 3);
            }
        }

        impact.fillStyle = '#ffffff';
        impact.globalAlpha = Math.max(0, 1 - local * 5);
        pixelStar(impact, 80, 80, 10 - local * 6);

        for (let particle = 0; particle < 20; particle += 1) {
            const life = clamp(local * 1.5 - (particle % 5) * 0.035);
            const angle = particle * 2.399 + Math.sin(particle * 13.1) * 0.16;
            const travel = life * (34 + (particle % 7) * 6);
            impact.globalAlpha = (1 - life) * fade;
            impact.fillStyle = particle % 3 ? '#ef8dff' : '#69e8ff';
            const x = 80 + Math.cos(angle) * travel;
            const y = 80 + Math.sin(angle) * travel;
            pixelDiamond(impact, x, y, particle % 4 === 0 ? 2 : 1);
        }
        impact.restore();
    };

    const polygonPoint = (sides, unit, radius, rotation) => {
        const scaled = unit * sides;
        const side = Math.floor(scaled);
        const amount = scaled - side;
        const a = side / sides * TAU + rotation;
        const b = (side + 1) / sides * TAU + rotation;
        return {
            x: 80 + (Math.cos(a) + (Math.cos(b) - Math.cos(a)) * amount) * radius,
            y: 80 + (Math.sin(a) + (Math.sin(b) - Math.sin(a)) * amount) * radius
        };
    };

    const drawWard = (time) => {
        const local = (time % 5.2) / 5.2;
        const intro = easeOut(local / 0.18);
        const fade = 1 - clamp((local - 0.83) / 0.17);
        const pulse = 0.83 + Math.sin(time * 3.2) * 0.17;
        ward.clearRect(0, 0, 160, 160);
        ward.save();
        ward.globalCompositeOperation = 'lighter';

        for (let layer = 0; layer < 3; layer += 1) {
            const radius = (56 - layer * 13) * intro;
            const points = layer === 1 ? 32 : 40;
            ward.fillStyle = layer === 0 ? '#c8f7ff' : layer === 1 ? '#5edcff' : '#3478e5';
            ward.globalAlpha = fade * pulse * (0.9 - layer * 0.17);
            for (let index = 0; index < points; index += 1) {
                if ((index + layer * 2) % 9 === 0) continue;
                const point = polygonPoint(layer === 2 ? 4 : 6, index / points, radius, time * (layer % 2 ? -0.36 : 0.27));
                if (index % 6 === 0) pixelDiamond(ward, point.x, point.y, 2);
                else ward.fillRect(Math.round(point.x), Math.round(point.y), 2, 2);
            }
        }

        for (let anchor = 0; anchor < 6; anchor += 1) {
            const angle = anchor / 6 * TAU - time * 0.18;
            const radius = 61 * intro;
            const x = 80 + Math.cos(angle) * radius;
            const y = 80 + Math.sin(angle) * radius;
            ward.globalAlpha = fade * 0.8;
            ward.fillStyle = anchor % 2 ? '#5edcff' : '#ffffff';
            pixelStar(ward, x, y, anchor % 2 ? 2 : 3);
        }

        ward.globalAlpha = fade * 0.55;
        ward.fillStyle = '#3478e5';
        pixelDiamond(ward, 80, 80, 10 + Math.sin(time * 3) * 2);
        ward.globalAlpha = fade;
        ward.fillStyle = '#ffffff';
        pixelDiamond(ward, 80, 80, 4);

        for (let mote = 0; mote < 14; mote += 1) {
            const angle = mote * 2.7 + time * (mote % 2 ? 0.22 : -0.16);
            const radius = 18 + (mote * 13 % 48);
            ward.globalAlpha = fade * (0.2 + (mote % 4) * 0.12);
            ward.fillStyle = mote % 3 ? '#5edcff' : '#c8f7ff';
            ward.fillRect(Math.round(80 + Math.cos(angle) * radius), Math.round(80 + Math.sin(angle) * radius * 0.86), 2, 2);
        }
        ward.restore();
    };

    const start = performance.now();
    const render = (now) => {
        const time = reducedMotion ? 1.05 : (now - start) / 1000;
        drawImpact(time);
        drawWard(time);
        if (!reducedMotion) requestAnimationFrame(render);
    };

    requestAnimationFrame(render);
})();
