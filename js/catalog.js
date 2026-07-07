// Catalogus van de toestellen zoals ze op de foto's van beide zalen staan,
// opgebouwd uit primitieven met PBR-materialen (metaal/rubber/kunststof).
// w = breedte (x), d = diepte (z) in meters bij rotatie 0.

import * as THREE from 'three';

// [kleur, ruwheid, metaalgehalte]
const C = {
  frame: [0x17181a, 0.45, 0.5],      // zwart gepoedercoat staal
  frame2: [0x2e3136, 0.5, 0.4],
  chroom: [0xd8dce0, 0.18, 0.95],
  rvs: [0xb8bdc2, 0.28, 0.9],
  staal: [0x9aa0a8, 0.4, 0.65],      // grijs geschilderd staal
  rubber: [0x232426, 0.92, 0],
  pad: [0x1f2022, 0.6, 0],           // zwart kunstleer
  padGrijs: [0x45484d, 0.65, 0],
  kunststof: [0x2a2c30, 0.55, 0],
  oranje: [0xe0862c, 0.72, 0],
  rood: [0xc23b2e, 0.55, 0],
  hout: [0xb08d57, 0.75, 0],
  houtDonker: [0x8a6b3f, 0.75, 0],
  creme: [0xf2f0ea, 0.8, 0],
};

function mat([color, roughness, metalness]) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness });
}

function box(w, h, d, c, x = 0, y = 0, z = 0, ry = 0, rx = 0) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(c));
  m.position.set(x, y, z);
  m.rotation.y = ry;
  m.rotation.x = rx;
  return m;
}

function cyl(r, len, c, x = 0, y = 0, z = 0, axis = 'y', seg = 16) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, seg), mat(c));
  if (axis === 'x') m.rotation.z = Math.PI / 2;
  if (axis === 'z') m.rotation.x = Math.PI / 2;
  m.position.set(x, y, z);
  return m;
}

// Buis tussen twee punten — voor realistische frames.
function tube(x1, y1, z1, x2, y2, z2, r, c) {
  const a = new THREE.Vector3(x1, y1, z1), b = new THREE.Vector3(x2, y2, z2);
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, a.distanceTo(b), 12), mat(c));
  m.position.copy(a).add(b).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
  return m;
}

function ball(r, c, x, y, z, seg = 18) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, seg, Math.max(8, seg / 2)), mat(c));
  m.position.set(x, y, z);
  return m;
}

function torus(r, t, c, x, y, z, arc = Math.PI * 2) {
  const m = new THREE.Mesh(new THREE.TorusGeometry(r, t, 10, 24, arc), mat(c));
  m.position.set(x, y, z);
  return m;
}

// Tekstlabel (transparant vlak met canvas-tekst)
function label(text, w, h, x, y, z, ry = 0, color = '#e8e8e8') {
  const cv = document.createElement('canvas');
  cv.width = 256; cv.height = Math.max(32, Math.round(256 * h / w));
  const c = cv.getContext('2d');
  c.clearRect(0, 0, cv.width, cv.height);
  c.fillStyle = color;
  c.font = `bold ${Math.round(cv.height * 0.7)}px Arial, sans-serif`;
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.fillText(text, cv.width / 2, cv.height / 2);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(w, h),
    new THREE.MeshBasicMaterial({ map: t, transparent: true })
  );
  m.position.set(x, y, z);
  m.rotation.y = ry;
  return m;
}

// Halterschijf met "gat" (donkere kern)
function plaat(r, dikte, c, x, y, z) {
  const g = new THREE.Group();
  g.add(cyl(r, dikte, c, x, y, z, 'x', 24));
  g.add(cyl(r * 0.18, dikte + 0.006, C.rvs, x, y, z, 'x', 12));
  return g;
}

function dumbbell(r, len, c, x, y, z, hex = false) {
  const g = new THREE.Group();
  const seg = hex ? 6 : 16;
  g.add(cyl(r, r * 1.1, c, x - len / 2, y, z, 'x', seg));
  g.add(cyl(r, r * 1.1, c, x + len / 2, y, z, 'x', seg));
  g.add(cyl(r * 0.32, len, C.chroom, x, y, z, 'x', 10));
  return g;
}

function kettlebell(r, c, x, y, z) {
  const g = new THREE.Group();
  g.add(ball(r, c, x, y + r * 0.9, z));
  const h = torus(r * 0.62, r * 0.22, c, x, y + r * 1.9, z, Math.PI);
  g.add(h);
  return g;
}

export const CATALOG = {
  // ---------- Fitnessruimte (zwarte vloer) ----------
  halfrack: {
    name: 'Half rack (Matrix)', w: 2.2, d: 1.6,
    build() {
      const g = new THREE.Group();
      for (const sz of [-0.62, 0.62]) {
        g.add(box(0.12, 2.42, 0.12, C.frame, -0.55, 1.21, sz));
        g.add(box(0.12, 2.42, 0.12, C.frame, 0.55, 1.21, sz));
        g.add(box(1.2, 0.1, 0.1, C.frame, 0, 2.42, sz));
        g.add(box(0.14, 0.03, 0.14, C.rvs, -0.55, 2.48, sz));   // dopjes
        g.add(box(0.14, 0.03, 0.14, C.rvs, 0.55, 2.48, sz));
      }
      g.add(box(0.1, 0.1, 1.3, C.frame, -0.55, 2.42, 0));
      g.add(box(0.1, 0.1, 1.3, C.frame, 0.55, 2.42, 0));
      g.add(box(1.2, 0.06, 0.06, C.frame2, 0, 0.25, -0.62));     // onderligger
      // zilveren opberg-vinnen (dumbbell/stang-houders, zoals op de foto)
      for (let i = 0; i < 5; i++) {
        g.add(box(0.05, 0.18, 0.4, C.staal, -0.35 + i * 0.18, 0.62, -0.62, 0, 0.15));
      }
      // J-hooks
      g.add(box(0.1, 0.14, 0.16, C.frame2, -0.55, 1.5, 0.68));
      g.add(box(0.1, 0.14, 0.16, C.frame2, 0.55, 1.5, 0.68));
      // RVS-halterstang met donkere knurling en schijven
      g.add(cyl(0.016, 2.2, C.rvs, 0, 1.58, 0.68, 'x', 12));
      g.add(cyl(0.018, 0.35, C.frame2, -0.45, 1.58, 0.68, 'x', 12));
      g.add(cyl(0.018, 0.35, C.frame2, 0.45, 1.58, 0.68, 'x', 12));
      g.add(cyl(0.03, 0.05, C.rvs, -0.78, 1.58, 0.68, 'x', 12));
      g.add(cyl(0.03, 0.05, C.rvs, 0.78, 1.58, 0.68, 'x', 12));
      g.add(plaat(0.22, 0.045, C.rubber, -0.88, 1.58, 0.68));
      g.add(plaat(0.22, 0.045, C.rubber, 0.88, 1.58, 0.68));
      return g;
    },
  },
  hipthrust: {
    name: 'Hip thrust machine', w: 0.95, d: 1.7,
    build() {
      const g = new THREE.Group();
      g.add(box(0.55, 0.08, 1.5, C.frame, 0, 0.08, 0));
      g.add(box(0.7, 0.05, 0.3, C.frame, 0, 0.05, -0.68));
      g.add(box(0.7, 0.05, 0.3, C.frame, 0, 0.05, 0.68));
      // groot rugkussen
      g.add(box(0.85, 0.16, 0.55, C.pad, 0, 0.58, -0.5));
      g.add(box(0.8, 0.05, 0.5, C.padGrijs, 0, 0.68, -0.5));
      g.add(tube(-0.35, 0.1, -0.75, -0.35, 0.52, -0.55, 0.03, C.frame));
      g.add(tube(0.35, 0.1, -0.75, 0.35, 0.52, -0.55, 0.03, C.frame));
      // heupgordel-rol en voetplaat met ribbels
      g.add(cyl(0.09, 0.6, C.kunststof, 0, 0.72, -0.05, 'x'));
      const voet = box(0.7, 0.04, 0.55, C.frame2, 0, 0.28, 0.5, 0, -0.25);
      g.add(voet);
      for (let i = 0; i < 4; i++) g.add(box(0.7, 0.015, 0.03, C.rvs, 0, 0.24 + i * 0.045, 0.62 - i * 0.11));
      return g;
    },
  },
  legpress: {
    name: 'Leg press', w: 1.1, d: 2.2,
    build() {
      const g = new THREE.Group();
      g.add(box(0.9, 0.08, 2.0, C.staal, 0, 0.06, 0));
      // 45°-rails
      g.add(tube(-0.4, 0.15, 0.9, -0.4, 1.35, -0.75, 0.045, C.staal));
      g.add(tube(0.4, 0.15, 0.9, 0.4, 1.35, -0.75, 0.045, C.staal));
      // zitting (twee zwarte kussens)
      g.add(box(0.55, 0.12, 0.55, C.pad, 0, 0.42, 0.62, 0, 0.15));
      const rug = box(0.55, 0.85, 0.14, C.pad, 0, 0.85, 0.95);
      rug.rotation.x = -0.45;
      g.add(rug);
      // slee met voetenplaat
      const plaatVoet = box(0.85, 0.95, 0.08, C.frame2, 0, 1.05, -0.55);
      plaatVoet.rotation.x = 0.35;
      g.add(plaatVoet);
      g.add(cyl(0.03, 0.6, C.rvs, 0, 1.5, -0.72, 'x'));
      // schijfhouders + schijven
      g.add(plaat(0.2, 0.04, C.rubber, -0.5, 0.75, -0.15));
      g.add(plaat(0.2, 0.04, C.rood, 0.5, 0.75, -0.15));
      g.add(box(0.35, 0.05, 0.4, C.staal, 0, 0.03, -0.95));
      return g;
    },
  },
  buikspierbank: {
    name: 'Buikspierbank', w: 0.65, d: 1.6,
    build() {
      const g = new THREE.Group();
      g.add(tube(-0.28, 0.04, 0.6, 0.28, 0.04, 0.6, 0.03, C.staal));
      g.add(tube(-0.28, 0.04, -0.65, 0.28, 0.04, -0.65, 0.03, C.staal));
      g.add(tube(0, 0.06, 0.6, 0, 0.75, -0.35, 0.035, C.staal));
      g.add(tube(0, 0.06, -0.65, 0, 0.85, -0.55, 0.035, C.staal));
      const zit = box(0.42, 0.09, 1.15, C.pad, 0, 0.68, 0.05);
      zit.rotation.x = -0.3;
      g.add(zit);
      g.add(cyl(0.07, 0.45, C.padGrijs, 0, 0.9, -0.52, 'x'));
      g.add(cyl(0.07, 0.45, C.padGrijs, 0, 0.58, -0.72, 'x'));
      return g;
    },
  },
  verstelbank: {
    name: 'Verstelbare halterbank', w: 0.55, d: 1.4,
    build() {
      const g = new THREE.Group();
      g.add(box(0.5, 0.06, 0.14, C.staal, 0, 0.06, 0.58));
      g.add(box(0.5, 0.06, 0.14, C.staal, 0, 0.06, -0.55));
      g.add(box(0.12, 0.08, 1.15, C.staal, 0, 0.1, 0));
      g.add(tube(0, 0.12, 0.35, 0, 0.42, 0.35, 0.03, C.staal));
      g.add(tube(0, 0.12, -0.3, 0, 0.42, -0.3, 0.03, C.staal));
      g.add(box(0.35, 0.09, 0.62, C.pad, 0, 0.47, 0.3));
      const rug = box(0.35, 0.09, 0.72, C.pad, 0, 0.62, -0.32);
      rug.rotation.x = 0.55;
      g.add(rug);
      g.add(cyl(0.045, 0.06, C.kunststof, -0.28, 0.09, -0.62, 'x')); // wieltjes
      g.add(cyl(0.045, 0.06, C.kunststof, 0.28, 0.09, -0.62, 'x'));
      return g;
    },
  },
  dumbbellrek_chroom: {
    name: 'Dumbbellrek chroom (klein)', w: 1.1, d: 0.65,
    build() {
      const g = new THREE.Group();
      g.add(tube(-0.52, 0.1, 0.25, -0.52, 0.85, -0.2, 0.03, C.chroom));
      g.add(tube(0.52, 0.1, 0.25, 0.52, 0.85, -0.2, 0.03, C.chroom));
      g.add(box(0.58, 0.05, 0.1, C.chroom, 0, 0.02, 0.25));
      g.add(box(0.58, 0.05, 0.1, C.chroom, 0, 0.02, -0.25, 0, 0));
      g.add(box(1.04, 0.05, 0.34, C.staal, 0, 0.42, 0.1, 0, 0.12));
      g.add(box(1.04, 0.05, 0.34, C.staal, 0, 0.78, -0.14, 0, 0.12));
      for (let i = 0; i < 5; i++) {
        g.add(dumbbell(0.05, 0.16, C.chroom, 0, 0, 0).translateX(-0.4 + i * 0.2).translateY(0.5).translateZ(0.08));
        g.add(dumbbell(0.055, 0.16, C.chroom, 0, 0, 0).translateX(-0.4 + i * 0.2).translateY(0.86).translateZ(-0.16));
      }
      return g;
    },
  },
  dumbbellrek_zwart: {
    name: 'Dumbbellrek zwart (groot)', w: 1.7, d: 0.7,
    build() {
      const g = new THREE.Group();
      g.add(box(0.1, 0.75, 0.62, C.frame, -0.8, 0.4, 0));
      g.add(box(0.1, 0.75, 0.62, C.frame, 0.8, 0.4, 0));
      g.add(box(1.62, 0.06, 0.4, C.frame2, 0, 0.38, 0.1, 0, 0.15));
      g.add(box(1.62, 0.06, 0.4, C.frame2, 0, 0.76, -0.12, 0, 0.15));
      for (let i = 0; i < 6; i++) {
        g.add(dumbbell(0.07, 0.2, C.rubber, 0, 0, 0, true).translateX(-0.62 + i * 0.25).translateY(0.5).translateZ(0.12));
        g.add(dumbbell(0.075, 0.2, C.rubber, 0, 0, 0, true).translateX(-0.5 + i * 0.25).translateY(0.88).translateZ(-0.1));
      }
      return g;
    },
  },
  kettlebellrek: {
    name: 'Kettlebellrek', w: 1.5, d: 0.55,
    build() {
      const g = new THREE.Group();
      g.add(box(1.5, 0.07, 0.5, C.frame, 0, 0.32, 0));
      g.add(box(1.5, 0.05, 0.5, C.frame2, 0, 0.06, 0));
      g.add(box(0.09, 0.32, 0.45, C.frame, -0.7, 0.18, 0));
      g.add(box(0.09, 0.32, 0.45, C.frame, 0.7, 0.18, 0));
      const kleuren = [C.oranje, [0x3f8f4f, 0.7, 0], C.rubber, C.frame2, C.rubber];
      kleuren.forEach((c, i) => g.add(kettlebell(0.1, c, -0.55 + i * 0.27, 0.36, 0)));
      return g;
    },
  },
  plyobox60: {
    name: 'Plyobox 60 cm (soft)', w: 0.75, d: 0.6,
    build() {
      const g = new THREE.Group();
      g.add(box(0.75, 0.56, 0.6, [0x232323, 0.85, 0], 0, 0.28, 0));
      g.add(box(0.76, 0.06, 0.61, [0x3a3a3a, 0.85, 0], 0, 0.56, 0));
      g.add(label('60', 0.25, 0.2, 0, 0.32, 0.302));
      g.add(label('CROSSMAXX', 0.5, 0.09, 0, 0.12, 0.302));
      return g;
    },
  },
  plyobox30_oranje: {
    name: 'Plyobox 30 cm oranje (soft)', w: 1.0, d: 0.75,
    build() {
      const g = new THREE.Group();
      g.add(box(1.0, 0.26, 0.75, C.oranje, 0, 0.14, 0));
      g.add(box(1.01, 0.05, 0.76, [0x2a2a2a, 0.85, 0], 0, 0.29, 0));
      g.add(label('30 CM', 0.32, 0.1, 0, 0.15, 0.377, 0, '#3a3a3a'));
      return g;
    },
  },
  houten_plyobox: {
    name: 'Houten plyobox', w: 0.7, d: 0.6,
    build() {
      const g = new THREE.Group();
      g.add(box(0.7, 0.6, 0.6, C.hout, 0, 0.3, 0));
      g.add(box(0.72, 0.02, 0.62, C.houtDonker, 0, 0.6, 0));
      g.add(cyl(0.09, 0.72, C.houtDonker, 0, 0.3, 0, 'x', 14)); // handgat-suggestie
      return g;
    },
  },
  minitrampoline: {
    name: 'Minitrampoline', w: 1.2, d: 1.25,
    build() {
      const g = new THREE.Group();
      const rand = torus(0.52, 0.045, C.staal, 0, 0.55, 0);
      rand.rotation.x = Math.PI / 2 - 0.3;
      g.add(rand);
      const doek = cyl(0.45, 0.03, [0x141414, 0.9, 0], 0, 0.55, 0, 'y', 28);
      doek.rotation.x = -0.3;
      g.add(doek);
      g.add(tube(-0.45, 0, 0.45, -0.5, 0.42, 0.5, 0.028, C.frame));
      g.add(tube(0.45, 0, 0.45, 0.5, 0.42, 0.5, 0.028, C.frame));
      g.add(tube(-0.45, 0, -0.45, -0.5, 0.68, -0.5, 0.028, C.frame));
      g.add(tube(0.45, 0, -0.45, 0.5, 0.68, -0.5, 0.028, C.frame));
      return g;
    },
  },
  trxframe: {
    name: 'TRX-frame', w: 3.0, d: 1.0,
    build() {
      const g = new THREE.Group();
      g.add(cyl(0.045, 3.0, C.staal, 0, 2.5, 0, 'x'));
      for (const sx of [-1.42, 0, 1.42]) {
        g.add(tube(sx, 0, 0.42, sx, 2.5, 0.06, 0.04, C.staal));
        g.add(tube(sx, 0, -0.42, sx, 2.5, -0.06, 0.04, C.staal));
        g.add(box(0.22, 0.04, 0.14, C.staal, sx, 0.02, 0.42));
        g.add(box(0.22, 0.04, 0.14, C.staal, sx, 0.02, -0.42));
      }
      g.add(tube(-1.42, 1.6, 0.22, 0, 1.6, 0.22, 0.025, C.staal));
      g.add(tube(0, 1.6, 0.22, 1.42, 1.6, 0.22, 0.025, C.staal));
      // hangende TRX-banden (geel/zwart) met handvatten
      for (const sx of [-0.6, 0.7]) {
        g.add(box(0.035, 0.9, 0.035, [0x2c2c2c, 0.8, 0], sx, 2.0, 0));
        g.add(box(0.05, 0.35, 0.05, [0xd8b93a, 0.7, 0], sx, 1.4, 0));
        g.add(cyl(0.02, 0.16, C.kunststof, sx, 1.2, 0, 'x'));
      }
      return g;
    },
  },
  halterrek_schijven: {
    name: 'Halterschijvenrek', w: 1.2, d: 0.55,
    build() {
      const g = new THREE.Group();
      g.add(box(1.1, 0.07, 0.45, C.frame, 0, 0.08, 0));
      g.add(tube(-0.5, 0.1, 0, -0.35, 0.95, 0, 0.04, C.frame));
      g.add(tube(0.5, 0.1, 0, 0.35, 0.95, 0, 0.04, C.frame));
      g.add(cyl(0.025, 0.5, C.rvs, -0.42, 0.55, 0.15, 'z', 10));
      g.add(cyl(0.025, 0.5, C.rvs, 0.42, 0.55, 0.15, 'z', 10));
      for (let i = 0; i < 4; i++) g.add(plaat(0.22, 0.05, C.rubber, -0.42, 0.55, -0.05 + i * 0.07));
      for (let i = 0; i < 4; i++) g.add(plaat(0.22, 0.05, C.rood, 0.42, 0.55, -0.05 + i * 0.07));
      return g;
    },
  },
  stangenrek: {
    name: 'Stangenrek (hexbar/curlbar)', w: 0.7, d: 0.5,
    build() {
      const g = new THREE.Group();
      g.add(box(0.7, 0.05, 0.5, C.creme, 0, 0.025, 0));
      for (const sx of [-0.22, 0, 0.22]) g.add(cyl(0.032, 1.35, C.staal, sx, 0.72, -0.08));
      g.add(cyl(0.02, 1.7, C.rvs, -0.22, 1.0, -0.08));
      // hexbar: zeshoekige ring van buizen
      const hexGroep = new THREE.Group();
      for (let i = 0; i < 6; i++) {
        const a1 = (i / 6) * Math.PI * 2, a2 = ((i + 1) / 6) * Math.PI * 2;
        hexGroep.add(tube(Math.cos(a1) * 0.28, 0, Math.sin(a1) * 0.28, Math.cos(a2) * 0.28, 0, Math.sin(a2) * 0.28, 0.018, C.rvs));
      }
      hexGroep.rotation.z = Math.PI / 2 - 0.15;
      hexGroep.position.set(0.15, 0.9, -0.08);
      g.add(hexGroep);
      // curlstang (golvend gesuggereerd met segmenten)
      g.add(tube(0.3, 0.35, -0.08, 0.34, 1.5, -0.08, 0.014, C.chroom));
      return g;
    },
  },
  valmatten: {
    name: 'Valmatten (stapel)', w: 2.0, d: 1.5,
    build() {
      const g = new THREE.Group();
      const kleuren = [[0x2b4f8e, 0.8, 0], [0x33598f, 0.8, 0], [0x2b4f8e, 0.8, 0]];
      kleuren.forEach((c, i) => {
        const m = box(1.95, 0.19, 1.45, c, (i % 2) * 0.05 - 0.02, 0.12 + i * 0.21, 0, (i % 2) * 0.05);
        g.add(m);
        g.add(box(1.96, 0.02, 1.46, [0x1e3a6b, 0.8, 0], (i % 2) * 0.05 - 0.02, 0.215 + i * 0.21, 0, (i % 2) * 0.05));
      });
      return g;
    },
  },
  stellingkast: {
    name: 'Stellingkast (bosu/TRX)', w: 1.2, d: 0.55,
    build() {
      const g = new THREE.Group();
      for (const y of [0.32, 0.72, 1.12]) g.add(box(1.2, 0.04, 0.5, C.creme, 0, y, 0));
      g.add(box(0.05, 1.16, 0.5, C.creme, -0.58, 0.58, 0));
      g.add(box(0.05, 1.16, 0.5, C.creme, 0.58, 0.58, 0));
      const bosu1 = ball(0.19, [0x3a6fb5, 0.5, 0], -0.3, 0.36, 0); bosu1.scale.y = 0.55;
      const bosu2 = ball(0.19, [0x4a7fc5, 0.5, 0], 0.15, 0.36, 0); bosu2.scale.y = 0.55;
      g.add(bosu1, bosu2);
      g.add(cyl(0.02, 0.4, C.creme, -0.3, 0.34, 0, 'x'));   // bosu-platformen
      g.add(cyl(0.02, 0.4, C.creme, 0.15, 0.34, 0, 'x'));
      g.add(box(0.45, 0.22, 0.32, [0x2f2f2f, 0.8, 0], -0.25, 0.86, 0));
      g.add(box(0.3, 0.18, 0.3, [0x50565e, 0.8, 0], 0.3, 0.84, 0));
      g.add(ball(0.12, [0x35608f, 0.6, 0], 0.4, 1.26, 0));
      return g;
    },
  },
  medicijnballen: {
    name: 'Medicijnballen', w: 0.9, d: 0.4,
    build() {
      const g = new THREE.Group();
      const b1 = ball(0.14, [0x2f4f8f, 0.75, 0], -0.3, 0.14, 0);
      const b2 = ball(0.12, [0x3d4045, 0.75, 0], 0.02, 0.12, 0.05);
      const b3 = ball(0.16, [0x4a4e54, 0.75, 0], 0.34, 0.16, -0.02);
      g.add(b1, b2, b3);
      const naad = torus(0.14, 0.008, [0x1e355f, 0.7, 0], -0.3, 0.14, 0);
      naad.rotation.x = 0.6;
      g.add(naad);
      return g;
    },
  },
  sandbag: {
    name: 'Sandbag', w: 0.45, d: 0.95,
    build() {
      const g = new THREE.Group();
      g.add(cyl(0.16, 0.8, [0x22335c, 0.85, 0], 0, 0.17, 0, 'z', 18));
      g.add(ball(0.16, [0x22335c, 0.85, 0], 0, 0.17, -0.4));
      g.add(ball(0.16, [0x22335c, 0.85, 0], 0, 0.17, 0.4));
      g.add(torus(0.1, 0.02, [0x14151a, 0.7, 0], 0, 0.3, -0.2, Math.PI));
      g.add(torus(0.1, 0.02, [0x14151a, 0.7, 0], 0, 0.3, 0.2, Math.PI));
      return g;
    },
  },
  tvstandaard: {
    name: 'TV op standaard', w: 1.2, d: 0.55,
    build() {
      const g = new THREE.Group();
      g.add(box(1.15, 0.66, 0.05, [0x0a0a0c, 0.25, 0.2], 0, 1.35, 0));
      g.add(box(1.05, 0.56, 0.055, [0x101820, 0.15, 0.3], 0, 1.35, 0.004));
      g.add(cyl(0.035, 1.05, C.frame, -0.12, 0.5, 0.06));
      g.add(cyl(0.035, 1.05, C.frame, 0.12, 0.5, 0.06));
      g.add(box(0.85, 0.04, 0.45, C.frame, 0, 0.02, 0.06));
      g.add(cyl(0.04, 0.05, C.kunststof, -0.35, 0.03, 0.28, 'y')); // wieltjes
      g.add(cyl(0.04, 0.05, C.kunststof, 0.35, 0.03, 0.28, 'y'));
      return g;
    },
  },
  spiegel: {
    name: 'Spiegel (wand)', w: 1.8, d: 0.1,
    build() {
      const g = new THREE.Group();
      const glas = new THREE.Mesh(
        new THREE.BoxGeometry(1.8, 1.9, 0.02),
        new THREE.MeshStandardMaterial({ color: 0xcfd9de, roughness: 0.04, metalness: 1.0 })
      );
      glas.position.set(0, 1.15, 0.02);
      g.add(glas);
      g.add(box(1.86, 1.96, 0.03, [0x8a8f94, 0.4, 0.6], 0, 1.15, 0));
      return g;
    },
  },

  ghd: {
    name: 'GHD (glute-ham)', w: 0.75, d: 1.7,
    build() {
      const g = new THREE.Group();
      g.add(box(0.6, 0.07, 1.4, C.frame, 0, 0.09, 0));
      g.add(box(0.7, 0.05, 0.3, C.frame, 0, 0.05, -0.72));
      g.add(box(0.7, 0.05, 0.3, C.frame, 0, 0.05, 0.72));
      // twee grote ronde heupkussens naast elkaar
      const k1 = cyl(0.19, 0.26, C.pad, -0.15, 0.98, -0.25, 'z', 20);
      const k2 = cyl(0.19, 0.26, C.pad, 0.15, 0.98, -0.25, 'z', 20);
      k1.rotation.x = Math.PI / 2 + 0.15;
      k2.rotation.x = Math.PI / 2 + 0.15;
      g.add(k1, k2);
      g.add(tube(0, 0.12, -0.35, 0, 0.9, -0.28, 0.04, C.frame));
      // voetenplaat met rollen
      g.add(box(0.5, 0.4, 0.05, C.frame2, 0, 0.6, 0.72));
      g.add(cyl(0.06, 0.45, C.padGrijs, 0, 0.78, 0.6, 'x'));
      g.add(cyl(0.06, 0.45, C.padGrijs, 0, 0.5, 0.6, 'x'));
      g.add(tube(0, 0.12, 0.6, 0, 0.55, 0.66, 0.04, C.frame));
      return g;
    },
  },
  legextension: {
    name: 'Leg extension', w: 1.0, d: 1.5,
    build() {
      const g = new THREE.Group();
      g.add(box(0.85, 0.08, 1.3, C.staal, 0, 0.06, 0));
      g.add(box(0.55, 0.12, 0.5, C.pad, 0, 0.52, 0.15));            // zitting
      const rug = box(0.55, 0.6, 0.12, C.pad, 0, 0.85, 0.55);
      rug.rotation.x = -0.15;
      g.add(rug);
      g.add(tube(0, 0.15, 0.5, 0, 0.55, 0.55, 0.04, C.frame));
      // rol vóór de schenen
      g.add(cyl(0.075, 0.55, C.padGrijs, 0, 0.3, -0.42, 'x'));
      g.add(tube(-0.2, 0.5, -0.15, -0.2, 0.32, -0.42, 0.025, C.staal));
      g.add(tube(0.2, 0.5, -0.15, 0.2, 0.32, -0.42, 0.025, C.staal));
      // gewichtstapel-toren
      g.add(box(0.35, 1.3, 0.35, C.frame, 0, 0.65, -0.55));
      for (let i = 0; i < 8; i++) g.add(box(0.3, 0.05, 0.3, [0x3a3d44, 0.4, 0.6], 0, 0.15 + i * 0.09, -0.55));
      return g;
    },
  },
  legcurl: {
    name: 'Leg curl (liggend)', w: 1.0, d: 1.7,
    build() {
      const g = new THREE.Group();
      g.add(box(0.85, 0.08, 1.5, C.staal, 0, 0.06, 0));
      // geknikte ligbank
      const b1 = box(0.45, 0.09, 0.75, C.pad, 0, 0.72, 0.32);
      b1.rotation.x = 0.12;
      const b2 = box(0.45, 0.09, 0.6, C.pad, 0, 0.68, -0.32);
      b2.rotation.x = -0.18;
      g.add(b1, b2);
      g.add(tube(0, 0.1, 0.55, 0, 0.68, 0.5, 0.04, C.frame));
      g.add(tube(0, 0.1, -0.45, 0, 0.62, -0.4, 0.04, C.frame));
      // enkelrol boven het bed
      g.add(cyl(0.07, 0.5, C.padGrijs, 0, 0.95, -0.72, 'x'));
      g.add(tube(-0.18, 0.65, -0.5, -0.18, 0.93, -0.72, 0.025, C.staal));
      g.add(tube(0.18, 0.65, -0.5, 0.18, 0.93, -0.72, 0.025, C.staal));
      // gewichtstapel-toren
      g.add(box(0.32, 1.1, 0.32, C.frame, -0.35, 0.55, -0.68));
      for (let i = 0; i < 7; i++) g.add(box(0.27, 0.05, 0.27, [0x3a3d44, 0.4, 0.6], -0.35, 0.14 + i * 0.085, -0.68));
      return g;
    },
  },
  tv_wand: {
    name: 'TV (wandmontage)', w: 1.4, d: 0.14,
    build() {
      const g = new THREE.Group();
      g.add(box(0.25, 0.35, 0.06, C.frame2, 0, 1.75, -0.03));        // muurbeugel
      g.add(box(1.4, 0.8, 0.06, [0x0a0a0c, 0.25, 0.2], 0, 1.75, 0.04));
      g.add(box(1.3, 0.7, 0.065, [0x101820, 0.15, 0.3], 0, 1.75, 0.045));
      return g;
    },
  },
  schijvenrek_grond: {
    name: 'Schijvenrek (vloer)', w: 1.2, d: 0.55,
    build() {
      const g = new THREE.Group();
      // laag stalen rek met sleuven, schijven rechtop naast elkaar
      g.add(box(1.2, 0.07, 0.5, C.frame, 0, 0.05, 0));
      g.add(box(1.2, 0.05, 0.06, C.frame2, 0, 0.11, -0.18));
      g.add(box(1.2, 0.05, 0.06, C.frame2, 0, 0.11, 0.18));
      const kleuren = [C.rubber, C.rubber, C.rood, C.rood, [0x2f4f8f, 0.55, 0], C.rubber, [0xd8b93a, 0.6, 0], C.rubber];
      kleuren.forEach((c, i) => g.add(plaat(0.22, 0.05, c, -0.49 + i * 0.14, 0.3, 0)));
      return g;
    },
  },

  // ---------- Blauwe zaal (cardio) ----------
  roeimachine: {
    name: 'Roeimachine', w: 0.6, d: 2.4,
    build() {
      const g = new THREE.Group();
      // monorail met zitje
      const rail = box(0.12, 0.07, 1.75, C.staal, 0, 0.32, 0.25, 0, -0.04);
      g.add(rail);
      g.add(box(0.32, 0.06, 0.3, C.kunststof, 0, 0.42, 0.35));       // zitje
      g.add(tube(0, 0.02, 1.1, 0, 0.3, 1.05, 0.03, C.staal));
      g.add(tube(-0.22, 0.02, -0.3, -0.22, 0.28, -0.35, 0.025, C.staal));
      g.add(tube(0.22, 0.02, -0.3, 0.22, 0.28, -0.35, 0.025, C.staal));
      // vliegwielkooi (rond, verticaal) + display
      g.add(cyl(0.3, 0.22, [0x33363b, 0.6, 0.3], 0, 0.55, -0.85, 'z', 24));
      g.add(torus(0.3, 0.025, C.frame2, 0, 0.55, -0.85));
      g.add(tube(0, 0.55, -0.85, 0, 1.05, -0.75, 0.025, C.frame2));
      g.add(box(0.22, 0.15, 0.05, C.frame, 0, 1.1, -0.73, 0, -0.3)); // monitor
      // voetsteunen + handvat
      g.add(box(0.14, 0.3, 0.06, C.frame2, -0.22, 0.35, -0.5, 0, 0.4));
      g.add(box(0.14, 0.3, 0.06, C.frame2, 0.22, 0.35, -0.5, 0, 0.4));
      g.add(cyl(0.02, 0.4, C.kunststof, 0, 0.6, -0.55, 'x'));        // handvat
      return g;
    },
  },
  romanchair: {
    name: 'Roman chair (rugextensie)', w: 0.7, d: 1.3,
    build() {
      const g = new THREE.Group();
      g.add(box(0.6, 0.06, 0.35, C.frame, 0, 0.04, -0.45));
      g.add(box(0.6, 0.06, 0.35, C.frame, 0, 0.04, 0.45));
      g.add(box(0.1, 0.06, 1.1, C.frame, 0, 0.04, 0));
      // schuin omhoog naar de heupkussens (45 graden)
      g.add(tube(0, 0.07, 0.45, 0, 0.85, -0.05, 0.04, C.frame));
      const k1 = cyl(0.13, 0.24, C.pad, -0.14, 0.88, -0.1, 'z', 18);
      const k2 = cyl(0.13, 0.24, C.pad, 0.14, 0.88, -0.1, 'z', 18);
      k1.rotation.x = Math.PI / 2 - 0.3;
      k2.rotation.x = Math.PI / 2 - 0.3;
      g.add(k1, k2);
      // voetplaat met enkelrollen
      g.add(box(0.5, 0.3, 0.05, C.frame2, 0, 0.3, 0.55));
      g.add(cyl(0.055, 0.45, C.padGrijs, 0, 0.45, 0.48, 'x'));
      g.add(cyl(0.055, 0.45, C.padGrijs, 0, 0.18, 0.48, 'x'));
      return g;
    },
  },
  mattenrek: {
    name: 'Mattenrek (rijdend)', w: 1.3, d: 0.75,
    build() {
      const g = new THREE.Group();
      // rijdend frame met bovenbuis waar matjes aan hangen
      g.add(box(1.25, 0.06, 0.65, C.staal, 0, 0.09, 0));
      for (const [sx, sz] of [[-0.55, -0.25], [0.55, -0.25], [-0.55, 0.25], [0.55, 0.25]]) {
        g.add(cyl(0.05, 0.07, C.kunststof, sx, 0.035, sz, 'y', 12)); // zwenkwielen
      }
      g.add(tube(-0.58, 0.12, 0, -0.58, 1.7, 0, 0.035, C.staal));
      g.add(tube(0.58, 0.12, 0, 0.58, 1.7, 0, 0.035, C.staal));
      g.add(cyl(0.03, 1.2, C.staal, 0, 1.7, 0, 'x'));                // hangbuis
      // hangende sportmatjes
      const matKleuren = [[0x3a6fb5, 0.8, 0], [0xc23b2e, 0.8, 0], [0x3f8f4f, 0.8, 0], [0x3a6fb5, 0.8, 0], [0xd8b93a, 0.8, 0]];
      matKleuren.forEach((c, i) => {
        g.add(box(0.025, 0.9, 0.5, c, -0.4 + i * 0.2, 1.2, 0));
      });
      return g;
    },
  },

  loopband_matrix: {
    name: 'Loopband (Matrix)', w: 0.95, d: 2.2,
    build() {
      const g = new THREE.Group();
      g.add(box(0.85, 0.14, 1.85, C.frame, 0, 0.13, 0.12));            // frame
      g.add(box(0.62, 0.02, 1.6, [0x0f0f11, 0.95, 0], 0, 0.21, 0.15)); // band
      g.add(box(0.1, 0.03, 1.6, C.staal, -0.36, 0.21, 0.15));          // ribbels
      g.add(box(0.1, 0.03, 1.6, C.staal, 0.36, 0.21, 0.15));
      // motorkap (afgerond met cilinder)
      g.add(box(0.85, 0.18, 0.45, C.kunststof, 0, 0.3, -0.75));
      g.add(cyl(0.09, 0.85, C.kunststof, 0, 0.39, -0.55, 'x'));
      g.add(tube(-0.4, 0.35, -0.85, -0.4, 1.35, -1.0, 0.045, C.kunststof));
      g.add(tube(0.4, 0.35, -0.85, 0.4, 1.35, -1.0, 0.045, C.kunststof));
      g.add(box(0.88, 0.5, 0.1, C.frame, 0, 1.55, -1.02, 0, -0.15));   // console
      g.add(box(0.55, 0.3, 0.105, [0x11202e, 0.2, 0.2], 0, 1.58, -1.0, 0, -0.15)); // scherm
      g.add(tube(-0.42, 1.25, -0.95, -0.42, 1.18, -0.4, 0.03, C.staal)); // leuningen
      g.add(tube(0.42, 1.25, -0.95, 0.42, 1.18, -0.4, 0.03, C.staal));
      g.add(cyl(0.02, 0.05, C.rood, 0, 1.32, -0.93, 'z'));             // noodstop
      return g;
    },
  },
  crosstrainer: {
    name: 'Crosstrainer (Matrix)', w: 0.75, d: 2.0,
    build() {
      const g = new THREE.Group();
      g.add(box(0.55, 0.1, 1.75, C.staal, 0, 0.09, 0));
      g.add(cyl(0.33, 0.4, [0x8f949a, 0.35, 0.7], 0, 0.48, -0.62, 'x', 24)); // aandrijfhuis
      g.add(cyl(0.35, 0.06, C.frame, 0, 0.48, -0.62, 'x', 24));
      // pedalen op rails
      g.add(box(0.16, 0.04, 0.42, C.kunststof, -0.24, 0.32, 0.25));
      g.add(box(0.16, 0.04, 0.42, C.kunststof, 0.24, 0.32, 0.05));
      g.add(tube(-0.24, 0.3, 0.5, -0.24, 0.44, -0.5, 0.025, C.staal));
      g.add(tube(0.24, 0.3, 0.5, 0.24, 0.44, -0.5, 0.025, C.staal));
      // zwaaiende armen met handgrepen
      g.add(tube(-0.28, 0.5, -0.35, -0.3, 1.55, -0.15, 0.03, C.staal));
      g.add(tube(0.28, 0.5, -0.35, 0.3, 1.55, -0.15, 0.03, C.staal));
      g.add(tube(-0.3, 1.55, -0.15, -0.32, 1.6, 0.15, 0.028, C.kunststof));
      g.add(tube(0.3, 1.55, -0.15, 0.32, 1.6, 0.15, 0.028, C.kunststof));
      g.add(tube(0, 0.55, -0.55, 0, 1.5, -0.35, 0.035, C.staal));      // middenmast
      g.add(box(0.45, 0.3, 0.08, C.frame, 0, 1.62, -0.35, 0, -0.2));   // console
      return g;
    },
  },
  hometrainer: {
    name: 'Hometrainer (Matrix)', w: 0.6, d: 1.25,
    build() {
      const g = new THREE.Group();
      g.add(box(0.5, 0.07, 0.16, C.staal, 0, 0.05, -0.45));
      g.add(box(0.5, 0.07, 0.16, C.staal, 0, 0.05, 0.45));
      g.add(box(0.1, 0.08, 1.0, C.staal, 0, 0.07, 0));
      // behuizing (afgerond)
      g.add(cyl(0.3, 0.22, C.kunststof, 0, 0.5, -0.12, 'x', 24));
      g.add(box(0.2, 0.55, 0.6, C.kunststof, 0, 0.45, -0.1));
      g.add(cyl(0.05, 0.3, C.chroom, 0, 0.42, 0.12, 'x'));             // cranks
      g.add(box(0.12, 0.03, 0.2, C.kunststof, -0.18, 0.35, 0.12));
      g.add(box(0.12, 0.03, 0.2, C.kunststof, 0.18, 0.49, 0.12));
      g.add(tube(0, 0.6, 0.4, 0, 0.95, 0.45, 0.035, C.staal));
      g.add(box(0.32, 0.08, 0.3, C.pad, 0, 1.0, 0.45));                // zadel
      g.add(tube(0, 0.65, -0.35, 0, 1.25, -0.42, 0.035, C.staal));
      g.add(box(0.42, 0.26, 0.08, C.frame, 0, 1.35, -0.45, 0, -0.2));  // console
      g.add(tube(-0.2, 1.2, -0.42, 0.2, 1.2, -0.42, 0.025, C.kunststof)); // stuur
      return g;
    },
  },
  spinningfiets: {
    name: 'Spinningfiets (Tomahawk)', w: 0.55, d: 1.35,
    build() {
      const g = new THREE.Group();
      g.add(box(0.5, 0.07, 0.12, C.frame, 0, 0.05, -0.58));
      g.add(box(0.5, 0.07, 0.12, C.frame, 0, 0.05, 0.58));
      g.add(box(0.08, 0.06, 1.25, C.frame, 0, 0.05, 0));
      // dik hoofdframe (diagonaal)
      g.add(tube(0, 0.15, 0.45, 0, 0.85, -0.3, 0.05, C.frame));
      g.add(tube(0, 0.15, -0.45, 0, 0.75, -0.38, 0.04, C.frame));
      // vliegwiel met rand
      g.add(cyl(0.26, 0.035, [0x33363b, 0.3, 0.7], 0, 0.4, -0.38, 'x', 28));
      const rim = torus(0.26, 0.018, C.chroom, 0, 0.4, -0.38);
      g.add(rim);
      // cranks + pedalen
      g.add(cyl(0.03, 0.22, C.chroom, 0, 0.38, 0.05, 'x'));
      g.add(box(0.1, 0.025, 0.16, C.kunststof, -0.14, 0.28, 0.05));
      g.add(box(0.1, 0.025, 0.16, C.kunststof, 0.14, 0.48, 0.05));
      // zadel + stuur (triatlon-stijl)
      g.add(tube(0, 0.7, 0.45, 0, 1.02, 0.5, 0.03, C.frame));
      g.add(box(0.28, 0.06, 0.26, C.pad, 0, 1.06, 0.5));
      g.add(tube(0, 0.8, -0.35, 0, 1.1, -0.45, 0.03, C.frame));
      g.add(tube(-0.16, 1.12, -0.45, 0.16, 1.12, -0.45, 0.025, C.kunststof));
      g.add(tube(-0.16, 1.12, -0.45, -0.16, 1.05, -0.62, 0.022, C.kunststof));
      g.add(tube(0.16, 1.12, -0.45, 0.16, 1.05, -0.62, 0.022, C.kunststof));
      g.add(label('TOMAHAWK', 0.4, 0.06, 0.0, 0.62, 0.1, 0, '#c8ccd2'));
      return g;
    },
  },
  fietstrainer_zilver: {
    name: 'Fietstrainer (zilver)', w: 0.5, d: 1.35,
    build() {
      const g = new THREE.Group();
      g.add(box(0.45, 0.05, 0.1, C.rvs, 0, 0.03, -0.62));
      g.add(box(0.45, 0.05, 0.1, C.rvs, 0, 0.03, 0.55));
      // voorwiel met spaken-schijf
      const wiel = torus(0.3, 0.02, C.chroom, 0, 0.33, -0.42);
      g.add(wiel);
      g.add(cyl(0.28, 0.008, [0xb8bdc2, 0.3, 0.6], 0, 0.33, -0.42, 'x', 24));
      // frame-buizen
      g.add(tube(0, 0.33, -0.42, 0, 1.0, 0.3, 0.025, C.chroom));       // schuine buis
      g.add(tube(0, 0.15, 0.45, 0, 1.0, 0.3, 0.025, C.chroom));        // zadelbuis
      g.add(tube(0, 0.33, -0.42, 0, 1.02, -0.35, 0.025, C.chroom));    // balhoofd
      g.add(tube(0, 0.1, 0.5, 0, 0.35, 0.62, 0.02, C.rvs));            // achtersteun
      g.add(cyl(0.028, 0.2, C.chroom, 0, 0.38, 0.15, 'x'));            // crank
      g.add(box(0.09, 0.02, 0.15, C.kunststof, -0.13, 0.3, 0.15));
      g.add(box(0.09, 0.02, 0.15, C.kunststof, 0.13, 0.46, 0.15));
      g.add(box(0.26, 0.05, 0.22, C.pad, 0, 1.04, 0.32));              // zadel
      g.add(tube(-0.15, 1.06, -0.38, 0.15, 1.06, -0.38, 0.02, C.frame)); // stuur
      return g;
    },
  },
  flowin: {
    name: 'FLOWIN-mat', w: 0.75, d: 1.7,
    build() {
      const g = new THREE.Group();
      g.add(box(0.75, 0.018, 1.7, [0x141414, 0.4, 0], 0, 0.009, 0));
      const voet = label('FOOT', 0.14, 0.05, -0.15, 0.02, -0.45, 0);
      voet.rotation.x = -Math.PI / 2;
      const hand = label('HAND', 0.14, 0.05, 0.18, 0.02, -0.3, 0);
      hand.rotation.x = -Math.PI / 2;
      const logo = label('FLOWIN', 0.5, 0.12, 0, 0.02, 0.55, 0);
      logo.rotation.x = -Math.PI / 2;
      g.add(voet, hand, logo);
      return g;
    },
  },
  aerobicstep: {
    name: 'Aerobic step', w: 0.9, d: 0.4,
    build() {
      const g = new THREE.Group();
      g.add(box(0.9, 0.06, 0.4, [0x24262a, 0.8, 0], 0, 0.15, 0));
      for (let i = 0; i < 6; i++) g.add(box(0.02, 0.065, 0.36, [0x3a3d42, 0.8, 0], -0.35 + i * 0.14, 0.15, 0));
      g.add(box(0.2, 0.12, 0.36, C.rood, -0.33, 0.06, 0));
      g.add(box(0.2, 0.12, 0.36, C.rood, 0.33, 0.06, 0));
      return g;
    },
  },
  behandelbank: {
    name: 'Behandelbank', w: 0.68, d: 1.95,
    build() {
      const g = new THREE.Group();
      g.add(box(0.62, 0.11, 1.85, [0x6b4a2a, 0.6, 0], 0, 0.72, 0));
      g.add(cyl(0.055, 0.62, [0x6b4a2a, 0.6, 0], 0, 0.72, -0.925, 'x'));
      g.add(cyl(0.055, 0.62, [0x6b4a2a, 0.6, 0], 0, 0.72, 0.925, 'x'));
      g.add(torus(0.07, 0.02, [0x593d22, 0.6, 0], 0, 0.783, -0.7));    // gezichtsopening
      for (const [sx, sz] of [[-0.24, -0.82], [0.24, -0.82], [-0.24, 0.82], [0.24, 0.82]]) {
        g.add(tube(sx, 0, sz, sx, 0.66, sz, 0.028, C.chroom));
      }
      g.add(tube(-0.24, 0.33, -0.82, -0.24, 0.33, 0.82, 0.02, C.chroom));
      g.add(tube(0.24, 0.33, -0.82, 0.24, 0.33, 0.82, 0.02, C.chroom));
      return g;
    },
  },
};

// Zachte contactschaduw onder elk object (radiale gradient).
let schaduwTex = null;
function contactShadow(w, d) {
  if (!schaduwTex) {
    const cv = document.createElement('canvas');
    cv.width = cv.height = 128;
    const c = cv.getContext('2d');
    const grad = c.createRadialGradient(64, 64, 8, 64, 64, 62);
    grad.addColorStop(0, 'rgba(0,0,0,0.42)');
    grad.addColorStop(0.7, 'rgba(0,0,0,0.18)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = grad;
    c.fillRect(0, 0, 128, 128);
    schaduwTex = new THREE.CanvasTexture(cv);
  }
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(w * 1.25, d * 1.25),
    new THREE.MeshBasicMaterial({ map: schaduwTex, transparent: true, depthWrite: false })
  );
  m.rotation.x = -Math.PI / 2;
  m.position.y = 0.012;
  m.userData.isShadow = true;
  return m;
}

// Maak een plaatsbaar 3D-object van een catalogustype.
export function createObject(type) {
  const def = CATALOG[type];
  const root = new THREE.Group();
  const model = def.build();
  model.traverse(m => {
    if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; }
  });
  root.add(model);
  root.add(contactShadow(def.w, def.d));
  root.userData = { isGymObject: true, type };
  return root;
}
