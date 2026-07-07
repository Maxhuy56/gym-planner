// Tekent een 2D-plattegrond van beide zalen op een canvas en downloadt
// die als PNG. Objecten krijgen een nummer; de legenda eronder koppelt
// nummers aan namen.

import { pointInGym } from './rooms.js';

const SCALE = 32;   // pixels per meter
const M = 60;       // canvasmarge

function lighten(hex, f = 0.82) {
  const r = (hex >> 16) & 255, g = (hex >> 8) & 255, b = hex & 255;
  const mix = c => Math.round(c + (255 - c) * f);
  return `rgb(${mix(r)},${mix(g)},${mix(b)})`;
}

export function downloadFloorplan(gyms, objects, inventory, catalog) {
  const gymList = Object.values(gyms);

  // Per zaal: begrenzing en teken-hoogte bepalen
  const blocks = gymList.map(gym => {
    const minX = Math.min(...gym.rects.map(r => r.minX));
    const maxX = Math.max(...gym.rects.map(r => r.maxX));
    const minZ = Math.min(...gym.rects.map(r => r.minZ));
    const maxZ = Math.max(...gym.rects.map(r => r.maxZ));
    return { gym, minX, maxX, minZ, maxZ, w: maxX - minX, d: maxZ - minZ };
  });

  // Objecten nummeren en per zaal groeperen
  const numbered = objects.map((o, i) => ({ ...o, nr: i + 1 }));
  const perGym = blocks.map(b => numbered.filter(o => pointInGym(b.gym, o.x, o.z)));

  const legendLines = [];
  blocks.forEach((b, i) => {
    legendLines.push({ text: b.gym.name, bold: true });
    if (perGym[i].length === 0) legendLines.push({ text: '   (leeg)' });
    perGym[i].forEach(o => legendLines.push({ text: `   ${o.nr}. ${catalog[o.type].name}` }));
  });
  legendLines.push({ text: 'In opslag', bold: true });
  if (inventory.length === 0) {
    legendLines.push({ text: '   (niets)' });
  } else {
    const counts = {};
    inventory.forEach(t => { counts[t] = (counts[t] || 0) + 1; });
    Object.entries(counts).forEach(([t, n]) =>
      legendLines.push({ text: `   ${catalog[t].name}${n > 1 ? ` × ${n}` : ''}` }));
  }

  const width = M * 2 + Math.max(...blocks.map(b => b.w)) * SCALE;
  const blocksH = blocks.reduce((h, b) => h + 34 + b.d * SCALE + 26, 0);
  const legendH = legendLines.length * 19 + 30;
  const height = 64 + blocksH + legendH + M / 2;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = '#111';
  ctx.font = 'bold 22px Segoe UI, sans-serif';
  ctx.fillText('Plattegrond gym-indeling', M, 36);
  ctx.font = '13px Segoe UI, sans-serif';
  ctx.fillStyle = '#666';
  ctx.fillText(new Date().toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' }), M, 56);

  let yOff = 72;
  blocks.forEach((b, bi) => {
    const { gym } = b;
    ctx.fillStyle = '#222';
    ctx.font = 'bold 16px Segoe UI, sans-serif';
    ctx.fillText(gym.name, M, yOff + 16);
    const top = yOff + 28;
    const px = wx => M + (wx - b.minX) * SCALE;
    const py = wz => top + (wz - b.minZ) * SCALE;

    // vloer + grid per rechthoek
    for (const r of gym.rects) {
      ctx.fillStyle = lighten(gym.floorColor);
      ctx.fillRect(px(r.minX), py(r.minZ), (r.maxX - r.minX) * SCALE, (r.maxZ - r.minZ) * SCALE);
      ctx.strokeStyle = 'rgba(0,0,0,0.07)';
      ctx.lineWidth = 1;
      for (let x = r.minX + 1; x < r.maxX; x++) {
        ctx.beginPath(); ctx.moveTo(px(x), py(r.minZ)); ctx.lineTo(px(x), py(r.maxZ)); ctx.stroke();
      }
      for (let z = r.minZ + 1; z < r.maxZ; z++) {
        ctx.beginPath(); ctx.moveTo(px(r.minX), py(z)); ctx.lineTo(px(r.maxX), py(z)); ctx.stroke();
      }
      if (!r.noLabel) {
        ctx.fillStyle = '#8a8a8a';
        ctx.font = '11px Segoe UI, sans-serif';
        ctx.fillText(r.label || `${r.maxX - r.minX} × ${r.maxZ - r.minZ} m`, px(r.minX) + 5, py(r.minZ) + 14);
      }
    }

    // buitenmuur
    ctx.beginPath();
    gym.outline.forEach(([x, z], i) => i === 0 ? ctx.moveTo(px(x), py(z)) : ctx.lineTo(px(x), py(z)));
    ctx.closePath();
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 3;
    ctx.stroke();

    // objecten
    for (const o of perGym[bi]) {
      const def = catalog[o.type];
      ctx.save();
      ctx.translate(px(o.x), py(o.z));
      ctx.rotate(-o.rot);
      ctx.fillStyle = 'rgba(47,111,175,0.28)';
      ctx.strokeStyle = '#2b5d8f';
      ctx.lineWidth = 1.5;
      ctx.fillRect(-def.w * SCALE / 2, -def.d * SCALE / 2, def.w * SCALE, def.d * SCALE);
      ctx.strokeRect(-def.w * SCALE / 2, -def.d * SCALE / 2, def.w * SCALE, def.d * SCALE);
      ctx.restore();
      ctx.beginPath();
      ctx.arc(px(o.x), py(o.z), 9, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();
      ctx.strokeStyle = '#2b5d8f';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = '#1a1a1a';
      ctx.font = 'bold 11px Segoe UI, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(o.nr), px(o.x), py(o.z));
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
    }

    yOff = top + b.d * SCALE + 26;
  });

  // legenda
  let ly = yOff + 18;
  legendLines.forEach(line => {
    ctx.fillStyle = line.bold ? '#222' : '#444';
    ctx.font = line.bold ? 'bold 13px Segoe UI, sans-serif' : '12px Segoe UI, sans-serif';
    ctx.fillText(line.text, M, ly);
    ly += 19;
  });

  const a = document.createElement('a');
  a.download = 'gym-plattegrond.png';
  a.href = canvas.toDataURL('image/png');
  a.click();
}
