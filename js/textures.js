// Procedureel gegenereerde texturen (canvas), zodat de zalen er echt
// uitzien zonder externe afbeeldingen: baksteen, rubbervloer met
// spikkels, witte klinkers, tegelpanelen, plafondplaten en lamellen.

import * as THREE from 'three';

function canvasTex(w, h, draw, repeatX = 1, repeatY = 1) {
  const cv = document.createElement('canvas');
  cv.width = w;
  cv.height = h;
  draw(cv.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(cv);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeatX, repeatY);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

// Kleine deterministische "random" zodat texturen niet elke keer wisselen.
function rng(seed) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
}

function shade(hex, f) {
  const r = Math.min(255, Math.round(((hex >> 16) & 255) * f));
  const g = Math.min(255, Math.round(((hex >> 8) & 255) * f));
  const b = Math.min(255, Math.round((hex & 255) * f));
  return `rgb(${r},${g},${b})`;
}

// Witte baksteen (muren onderzijde)
export function brickTex(repeatX, repeatY) {
  return canvasTex(256, 256, (c) => {
    const rand = rng(7);
    c.fillStyle = '#cfc9bf';
    c.fillRect(0, 0, 256, 256);
    const bh = 32, bw = 96;
    for (let row = 0; row < 8; row++) {
      const off = row % 2 ? -bw / 2 : 0;
      for (let col = -1; col < 4; col++) {
        c.fillStyle = shade(0xe9e5dc, 0.96 + rand() * 0.08);
        c.fillRect(col * bw + off + 2, row * bh + 2, bw - 4, bh - 4);
      }
    }
  }, repeatX, repeatY);
}

// Grote witte tegelpanelen (muren bovenzijde)
export function tileTex(repeatX, repeatY) {
  return canvasTex(256, 256, (c) => {
    c.fillStyle = '#f1f0ed';
    c.fillRect(0, 0, 256, 256);
    c.strokeStyle = '#d8d5cf';
    c.lineWidth = 3;
    for (let i = 0; i <= 2; i++) {
      c.beginPath(); c.moveTo(i * 128, 0); c.lineTo(i * 128, 256); c.stroke();
      c.beginPath(); c.moveTo(0, i * 128); c.lineTo(256, i * 128); c.stroke();
    }
  }, repeatX, repeatY);
}

// Donkere rubbervloer met gekleurde spikkels
export function rubberTex(repeatX, repeatY) {
  return canvasTex(256, 256, (c) => {
    const rand = rng(13);
    c.fillStyle = '#2a2b2d';
    c.fillRect(0, 0, 256, 256);
    const kleuren = ['#4a4c50', '#6a6d72', '#8a8d92', '#5c5347', '#3d3f43'];
    for (let i = 0; i < 1400; i++) {
      c.fillStyle = kleuren[Math.floor(rand() * kleuren.length)];
      c.globalAlpha = 0.5 + rand() * 0.5;
      c.fillRect(rand() * 256, rand() * 256, 1.6, 1.6);
    }
    c.globalAlpha = 1;
  }, repeatX, repeatY);
}

// Witte klinkers (rand langs de rubbervloer)
export function klinkerTex(repeatX, repeatY) {
  return canvasTex(256, 256, (c) => {
    const rand = rng(21);
    c.fillStyle = '#cfcabf';
    c.fillRect(0, 0, 256, 256);
    const bh = 42, bw = 86;
    for (let row = 0; row < 7; row++) {
      const off = (row % 3) * -bw / 3;
      for (let col = -1; col < 5; col++) {
        c.fillStyle = shade(0xe7e2d8, 0.94 + rand() * 0.1);
        c.fillRect(col * bw + off + 1.5, row * bh + 1.5, bw - 3, bh - 3);
      }
    }
  }, repeatX, repeatY);
}

// Blauw linoleum met lichte vlekken/glans
export function linoTex(repeatX, repeatY) {
  return canvasTex(256, 256, (c) => {
    const rand = rng(31);
    c.fillStyle = '#5b7c91';
    c.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 300; i++) {
      c.fillStyle = rand() > 0.5 ? '#68899c' : '#527386';
      c.globalAlpha = 0.25;
      const r = 4 + rand() * 14;
      c.beginPath();
      c.arc(rand() * 256, rand() * 256, r, 0, Math.PI * 2);
      c.fill();
    }
    c.globalAlpha = 1;
  }, repeatX, repeatY);
}

// Systeemplafond (platen met randprofiel)
export function ceilTex(repeatX, repeatY) {
  return canvasTex(256, 256, (c) => {
    c.fillStyle = '#e3e1dc';
    c.fillRect(0, 0, 256, 256);
    c.strokeStyle = '#c4c1ba';
    c.lineWidth = 4;
    for (let i = 0; i <= 2; i++) {
      c.beginPath(); c.moveTo(i * 128, 0); c.lineTo(i * 128, 256); c.stroke();
      c.beginPath(); c.moveTo(0, i * 128); c.lineTo(256, i * 128); c.stroke();
    }
  }, repeatX, repeatY);
}

// Raam met lamellen (jaloezieën)
export function blindsTex() {
  return canvasTex(128, 256, (c) => {
    const grad = c.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, '#dfeaf4');
    grad.addColorStop(1, '#c7d8e8');
    c.fillStyle = grad;
    c.fillRect(0, 0, 128, 256);
    c.strokeStyle = 'rgba(120,130,140,0.55)';
    c.lineWidth = 2;
    for (let y = 4; y < 256; y += 9) {
      c.beginPath(); c.moveTo(0, y); c.lineTo(128, y); c.stroke();
    }
  });
}

// Warme lichtgloed (voor onder de plafondarmaturen)
export function glowTex() {
  const cv = document.createElement('canvas');
  cv.width = cv.height = 128;
  const c = cv.getContext('2d');
  const grad = c.createRadialGradient(64, 64, 6, 64, 64, 62);
  grad.addColorStop(0, 'rgba(255,244,214,0.85)');
  grad.addColorStop(0.5, 'rgba(255,240,200,0.28)');
  grad.addColorStop(1, 'rgba(255,240,200,0)');
  c.fillStyle = grad;
  c.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// Klokgezicht (voor aan de muur)
export function clockTex() {
  const cv = document.createElement('canvas');
  cv.width = 128;
  cv.height = 128;
  const c = cv.getContext('2d');
  c.clearRect(0, 0, 128, 128);
  c.fillStyle = '#f5f4f0';
  c.beginPath(); c.arc(64, 64, 60, 0, Math.PI * 2); c.fill();
  c.strokeStyle = '#3a3c40';
  c.lineWidth = 6;
  c.beginPath(); c.arc(64, 64, 58, 0, Math.PI * 2); c.stroke();
  c.lineWidth = 3;
  for (let i = 0; i < 12; i++) {
    const a = i * Math.PI / 6;
    c.beginPath();
    c.moveTo(64 + Math.cos(a) * 48, 64 + Math.sin(a) * 48);
    c.lineTo(64 + Math.cos(a) * 54, 64 + Math.sin(a) * 54);
    c.stroke();
  }
  c.lineWidth = 5;
  c.beginPath(); c.moveTo(64, 64); c.lineTo(64, 30); c.stroke();       // grote wijzer
  c.beginPath(); c.moveTo(64, 64); c.lineTo(88, 74); c.stroke();       // kleine wijzer
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
