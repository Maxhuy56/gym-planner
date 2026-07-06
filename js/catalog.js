// Catalogus van de toestellen zoals ze op de foto's van beide zalen staan
// (juli 2026), opgebouwd uit eenvoudige vormen.
// w = breedte (x), d = diepte (z) in meters bij rotatie 0.

import * as THREE from 'three';

function mat(color, roughness = 0.8, metalness = 0) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness });
}

function box(w, h, d, color, x = 0, y = 0, z = 0, ry = 0) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color));
  m.position.set(x, y, z);
  m.rotation.y = ry;
  return m;
}

// Cilinder; axis: 'x' | 'y' | 'z'
function cyl(r, len, color, x = 0, y = 0, z = 0, axis = 'y') {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 16), mat(color));
  if (axis === 'x') m.rotation.z = Math.PI / 2;
  if (axis === 'z') m.rotation.x = Math.PI / 2;
  m.position.set(x, y, z);
  return m;
}

function ball(r, color, x, y, z) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 10), mat(color, 0.6));
  m.position.set(x, y, z);
  return m;
}

const ZWART = 0x1b1c1e, DONKER = 0x2c2e33, STAAL = 0x9aa0a8, CHROOM = 0xc4c9cf,
  ORANJE = 0xe0862c, ROOD = 0xc23b2e, HOUT = 0xb08d57, CREME = 0xf2f0ea;

export const CATALOG = {
  // ---------- Fitnessruimte (zwarte vloer) ----------
  halfrack: {
    name: 'Half rack (Matrix)', w: 2.2, d: 1.6,
    build() {
      const g = new THREE.Group();
      for (const sz of [-0.6, 0.6]) {
        g.add(box(0.1, 2.4, 0.1, ZWART, -0.55, 1.2, sz));
        g.add(box(0.1, 2.4, 0.1, ZWART, 0.55, 1.2, sz));
        g.add(box(1.15, 0.1, 0.1, ZWART, 0, 2.38, sz));
      }
      g.add(box(0.1, 0.1, 1.2, ZWART, -0.55, 2.38, 0));
      g.add(box(0.1, 0.1, 1.2, ZWART, 0.55, 2.38, 0));
      g.add(box(0.12, 0.4, 0.5, STAAL, -0.62, 1.0, -0.6));   // schijvenopslag
      g.add(box(0.12, 0.4, 0.5, STAAL, 0.62, 1.0, -0.6));
      g.add(cyl(0.025, 2.2, CHROOM, 0, 1.05, 0.62, 'x'));    // halterstang
      g.add(cyl(0.22, 0.06, ZWART, -0.9, 1.05, 0.62, 'x'));
      g.add(cyl(0.22, 0.06, ZWART, 0.9, 1.05, 0.62, 'x'));
      return g;
    },
  },
  hipthrust: {
    name: 'Hip thrust machine', w: 0.95, d: 1.7,
    build() {
      const g = new THREE.Group();
      g.add(box(0.7, 0.15, 1.5, ZWART, 0, 0.1, 0));
      g.add(box(0.85, 0.3, 0.5, DONKER, 0, 0.5, -0.55));      // rugkussen
      g.add(cyl(0.09, 0.7, ZWART, 0, 0.75, 0.1, 'x'));        // heupkussen-rol
      g.add(box(0.7, 0.05, 0.5, STAAL, 0, 0.25, 0.55));       // voetplaat
      g.add(cyl(0.03, 0.5, STAAL, -0.3, 0.55, -0.2));
      g.add(cyl(0.03, 0.5, STAAL, 0.3, 0.55, -0.2));
      return g;
    },
  },
  legpress: {
    name: 'Leg press', w: 1.1, d: 2.2,
    build() {
      const g = new THREE.Group();
      g.add(box(1.0, 0.15, 2.1, DONKER, 0, 0.1, 0));
      const rug = box(0.8, 0.9, 0.15, ZWART, 0, 0.65, 0.7);
      rug.rotation.x = -0.4;
      g.add(rug);
      g.add(box(0.7, 0.12, 0.5, ZWART, 0, 0.45, 0.35));       // zitting
      const slee = box(0.9, 1.0, 0.12, STAAL, 0, 0.95, -0.6);
      slee.rotation.x = 0.35;
      g.add(slee);                                            // voetenplaat
      g.add(box(0.1, 0.8, 0.1, STAAL, -0.45, 0.6, -0.9));
      g.add(box(0.1, 0.8, 0.1, STAAL, 0.45, 0.6, -0.9));
      return g;
    },
  },
  buikspierbank: {
    name: 'Buikspierbank', w: 0.65, d: 1.6,
    build() {
      const g = new THREE.Group();
      const zit = box(0.45, 0.1, 1.2, ZWART, 0, 0.62, 0.1);
      zit.rotation.x = -0.25;
      g.add(zit);
      g.add(cyl(0.07, 0.5, DONKER, 0, 0.85, -0.55, 'x'));     // beenrol
      g.add(cyl(0.07, 0.5, DONKER, 0, 0.55, -0.75, 'x'));
      g.add(box(0.08, 0.7, 0.08, STAAL, 0, 0.35, -0.55));
      g.add(box(0.08, 0.5, 0.08, STAAL, 0, 0.25, 0.55));
      g.add(box(0.55, 0.06, 0.4, STAAL, 0, 0.04, 0.5));
      g.add(box(0.55, 0.06, 0.4, STAAL, 0, 0.04, -0.6));
      return g;
    },
  },
  verstelbank: {
    name: 'Verstelbare halterbank', w: 0.55, d: 1.4,
    build() {
      const g = new THREE.Group();
      g.add(box(0.36, 0.09, 0.75, ZWART, 0, 0.46, 0.3));      // zitvlak
      const rug = box(0.36, 0.09, 0.7, ZWART, 0, 0.62, -0.35);
      rug.rotation.x = 0.5;
      g.add(rug);
      g.add(box(0.45, 0.07, 0.12, STAAL, 0, 0.05, 0.55));
      g.add(box(0.45, 0.07, 0.12, STAAL, 0, 0.05, -0.5));
      g.add(box(0.1, 0.35, 0.8, STAAL, 0, 0.25, 0));
      return g;
    },
  },
  dumbbellrek_chroom: {
    name: 'Dumbbellrek chroom (klein)', w: 1.1, d: 0.65,
    build() {
      const g = new THREE.Group();
      g.add(box(1.05, 0.06, 0.45, CHROOM, 0, 0.45, 0, 0));
      g.add(box(1.05, 0.06, 0.45, CHROOM, 0, 0.8, -0.12));
      g.add(box(0.08, 0.85, 0.5, STAAL, -0.52, 0.42, 0));
      g.add(box(0.08, 0.85, 0.5, STAAL, 0.52, 0.42, 0));
      for (let i = 0; i < 5; i++) {
        g.add(cyl(0.045, 0.24, CHROOM, -0.4 + i * 0.2, 0.53, 0.05, 'x'));
        g.add(cyl(0.045, 0.24, CHROOM, -0.4 + i * 0.2, 0.88, -0.07, 'x'));
      }
      return g;
    },
  },
  dumbbellrek_zwart: {
    name: 'Dumbbellrek zwart (groot)', w: 1.7, d: 0.7,
    build() {
      const g = new THREE.Group();
      g.add(box(1.7, 0.08, 0.55, ZWART, 0, 0.4, 0));
      g.add(box(1.7, 0.08, 0.55, ZWART, 0, 0.78, -0.1));
      g.add(box(0.09, 0.8, 0.6, ZWART, -0.82, 0.4, 0));
      g.add(box(0.09, 0.8, 0.6, ZWART, 0.82, 0.4, 0));
      for (let i = 0; i < 6; i++) {
        g.add(cyl(0.065, 0.3, DONKER, -0.65 + i * 0.26, 0.5, 0.03, 'x'));
        g.add(cyl(0.065, 0.3, DONKER, -0.52 + i * 0.26, 0.88, -0.13, 'x'));
      }
      return g;
    },
  },
  kettlebellrek: {
    name: 'Kettlebellrek', w: 1.5, d: 0.55,
    build() {
      const g = new THREE.Group();
      g.add(box(1.5, 0.08, 0.5, ZWART, 0, 0.3, 0));
      g.add(box(0.1, 0.3, 0.45, ZWART, -0.7, 0.15, 0));
      g.add(box(0.1, 0.3, 0.45, ZWART, 0.7, 0.15, 0));
      const kleuren = [ORANJE, 0x3f8f4f, ZWART, ZWART, 0x333333];
      kleuren.forEach((c, i) => {
        g.add(ball(0.11, c, -0.55 + i * 0.28, 0.45, 0));
        g.add(cyl(0.025, 0.12, c, -0.55 + i * 0.28, 0.58, 0, 'x'));
      });
      return g;
    },
  },
  plyobox60: {
    name: 'Plyobox 60 cm (soft)', w: 0.75, d: 0.6,
    build() {
      const g = new THREE.Group();
      g.add(box(0.75, 0.6, 0.6, 0x232323, 0, 0.3, 0));
      g.add(box(0.76, 0.08, 0.61, 0x3a3a3a, 0, 0.56, 0));
      return g;
    },
  },
  plyobox30_oranje: {
    name: 'Plyobox 30 cm oranje (soft)', w: 1.0, d: 0.75,
    build() {
      const g = new THREE.Group();
      g.add(box(1.0, 0.3, 0.75, ORANJE, 0, 0.15, 0));
      g.add(box(1.01, 0.05, 0.76, 0x8a5a1e, 0, 0.29, 0));
      return g;
    },
  },
  houten_plyobox: {
    name: 'Houten plyobox', w: 0.7, d: 0.6,
    build() {
      const g = new THREE.Group();
      g.add(box(0.7, 0.6, 0.6, HOUT, 0, 0.3, 0));
      g.add(box(0.55, 0.61, 0.45, 0x8a6b3f, 0, 0.3, 0));
      return g;
    },
  },
  minitrampoline: {
    name: 'Minitrampoline', w: 1.2, d: 1.25,
    build() {
      const g = new THREE.Group();
      const frame = box(1.1, 0.08, 1.1, STAAL, 0, 0.5, 0);
      frame.rotation.x = -0.3;
      const matje = box(0.85, 0.04, 0.85, ZWART, 0, 0.52, 0);
      matje.rotation.x = -0.3;
      g.add(frame, matje);
      g.add(box(0.06, 0.45, 0.06, DONKER, -0.5, 0.22, 0.45));
      g.add(box(0.06, 0.45, 0.06, DONKER, 0.5, 0.22, 0.45));
      g.add(box(0.06, 0.7, 0.06, DONKER, -0.5, 0.35, -0.45));
      g.add(box(0.06, 0.7, 0.06, DONKER, 0.5, 0.35, -0.45));
      return g;
    },
  },
  trxframe: {
    name: 'TRX-frame', w: 3.0, d: 1.0,
    build() {
      const g = new THREE.Group();
      g.add(cyl(0.045, 3.0, STAAL, 0, 2.5, 0, 'x'));          // bovenbuis
      for (const sx of [-1.4, 0, 1.4]) {
        g.add(cyl(0.04, 2.5, STAAL, sx, 1.25, 0.35).rotateX(0.28));
        g.add(cyl(0.04, 2.5, STAAL, sx, 1.25, -0.35).rotateX(-0.28));
      }
      g.add(box(0.05, 1.0, 0.05, 0x333333, -0.5, 1.9, 0));    // TRX-band
      g.add(box(0.05, 1.0, 0.05, 0x333333, 0.5, 1.9, 0));
      return g;
    },
  },
  halterrek_schijven: {
    name: 'Halterschijvenrek', w: 1.2, d: 0.55,
    build() {
      const g = new THREE.Group();
      g.add(box(1.1, 0.08, 0.45, ZWART, 0, 0.1, 0));
      g.add(box(0.08, 0.9, 0.08, ZWART, -0.5, 0.55, 0));
      g.add(box(0.08, 0.9, 0.08, ZWART, 0.5, 0.55, 0));
      for (let i = 0; i < 4; i++) g.add(cyl(0.22, 0.05, ZWART, -0.35 + i * 0.1, 0.25, 0, 'x'));
      for (let i = 0; i < 4; i++) g.add(cyl(0.22, 0.05, ROOD, 0.15 + i * 0.1, 0.25, 0, 'x'));
      return g;
    },
  },
  stangenrek: {
    name: 'Stangenrek (hexbar/curlbar)', w: 0.7, d: 0.5,
    build() {
      const g = new THREE.Group();
      g.add(box(0.7, 0.06, 0.5, CREME, 0, 0.03, 0));
      for (const [sx, sz] of [[-0.2, -0.1], [0, -0.1], [0.2, -0.1]]) {
        g.add(cyl(0.035, 1.4, STAAL, sx, 0.75, sz));
      }
      g.add(cyl(0.025, 1.8, CHROOM, -0.2, 1.0, -0.1));        // stangen
      const hex = box(0.55, 0.05, 0.4, CHROOM, 0.15, 1.2, -0.1);
      hex.rotation.z = 0.2;
      g.add(hex);                                             // hexbar (versimpeld)
      return g;
    },
  },
  valmatten: {
    name: 'Valmatten (stapel)', w: 2.0, d: 1.5,
    build() {
      const g = new THREE.Group();
      const kleuren = [0x2b4f8e, 0x33598f, 0x2b4f8e];
      kleuren.forEach((c, i) => g.add(box(1.95, 0.2, 1.45, c, (i % 2) * 0.04, 0.12 + i * 0.21, 0)));
      return g;
    },
  },
  stellingkast: {
    name: 'Stellingkast (bosu/TRX)', w: 1.2, d: 0.55,
    build() {
      const g = new THREE.Group();
      g.add(box(1.2, 0.05, 0.5, CREME, 0, 0.35, 0));
      g.add(box(1.2, 0.05, 0.5, CREME, 0, 0.75, 0));
      g.add(box(1.2, 0.05, 0.5, CREME, 0, 1.15, 0));
      g.add(box(0.05, 1.15, 0.5, CREME, -0.58, 0.58, 0));
      g.add(box(0.05, 1.15, 0.5, CREME, 0.58, 0.58, 0));
      const bosu1 = ball(0.2, 0x3a6fb5, -0.3, 0.42, 0); bosu1.scale.y = 0.5;
      const bosu2 = ball(0.2, 0x3a6fb5, 0.2, 0.42, 0); bosu2.scale.y = 0.5;
      g.add(bosu1, bosu2);
      g.add(box(0.5, 0.25, 0.35, 0x2f2f2f, 0, 0.92, 0));      // TRX-banden/gewichtsvesten
      return g;
    },
  },
  medicijnballen: {
    name: 'Medicijnballen', w: 0.9, d: 0.4,
    build() {
      const g = new THREE.Group();
      g.add(ball(0.14, 0x2f4f8f, -0.3, 0.14, 0));
      g.add(ball(0.12, 0x444444, 0.02, 0.12, 0));
      g.add(ball(0.16, 0x555555, 0.34, 0.16, 0));
      return g;
    },
  },
  sandbag: {
    name: 'Sandbag', w: 0.45, d: 0.95,
    build() {
      const g = new THREE.Group();
      const zak = cyl(0.17, 0.85, 0x22335c, 0, 0.18, 0, 'z');
      g.add(zak);
      g.add(cyl(0.18, 0.1, ZWART, 0, 0.18, -0.25, 'z'));
      g.add(cyl(0.18, 0.1, ZWART, 0, 0.18, 0.25, 'z'));
      return g;
    },
  },
  tvstandaard: {
    name: 'TV op standaard', w: 1.2, d: 0.55,
    build() {
      const g = new THREE.Group();
      g.add(box(1.15, 0.68, 0.06, 0x101010, 0, 1.35, 0));     // scherm
      g.add(box(0.08, 1.0, 0.08, DONKER, 0, 0.5, 0.05));
      g.add(box(0.9, 0.05, 0.45, DONKER, 0, 0.03, 0.05));
      return g;
    },
  },
  spiegel: {
    name: 'Spiegel (wand)', w: 1.8, d: 0.1,
    build() {
      const g = new THREE.Group();
      g.add(box(1.8, 1.9, 0.05, 0xbcd2dd, 0, 1.15, 0));
      g.add(box(1.86, 1.96, 0.03, 0x8a8f94, 0, 1.15, 0.01));
      return g;
    },
  },

  // ---------- Blauwe zaal (cardio) ----------
  loopband_matrix: {
    name: 'Loopband (Matrix)', w: 0.95, d: 2.2,
    build() {
      const g = new THREE.Group();
      g.add(box(0.85, 0.2, 1.9, ZWART, 0, 0.15, 0.15));       // loopvlak
      g.add(box(0.95, 0.1, 0.4, DONKER, 0, 0.28, -0.85));
      g.add(cyl(0.04, 1.3, DONKER, -0.42, 0.85, -0.8).rotateX(0.25));
      g.add(cyl(0.04, 1.3, DONKER, 0.42, 0.85, -0.8).rotateX(0.25));
      g.add(box(0.9, 0.45, 0.12, ZWART, 0, 1.45, -0.95));     // console
      g.add(box(0.8, 0.06, 0.5, DONKER, 0, 1.1, -0.75));      // leuningen
      return g;
    },
  },
  crosstrainer: {
    name: 'Crosstrainer (Matrix)', w: 0.75, d: 2.0,
    build() {
      const g = new THREE.Group();
      g.add(box(0.6, 0.12, 1.8, STAAL, 0, 0.1, 0));
      g.add(cyl(0.3, 0.25, CHROOM, 0, 0.55, -0.7, 'x'));      // vliegwiel
      g.add(box(0.15, 0.05, 0.35, ZWART, -0.22, 0.35, 0.2));  // pedalen
      g.add(box(0.15, 0.05, 0.35, ZWART, 0.22, 0.35, 0.2));
      g.add(cyl(0.03, 1.4, STAAL, -0.25, 1.0, -0.1).rotateX(0.15));
      g.add(cyl(0.03, 1.4, STAAL, 0.25, 1.0, -0.1).rotateX(0.15));
      g.add(box(0.5, 0.3, 0.1, ZWART, 0, 1.55, -0.55));       // console
      return g;
    },
  },
  hometrainer: {
    name: 'Hometrainer (Matrix)', w: 0.6, d: 1.25,
    build() {
      const g = new THREE.Group();
      g.add(box(0.55, 0.1, 1.1, DONKER, 0, 0.07, 0));
      g.add(box(0.4, 0.65, 0.5, ZWART, 0, 0.55, -0.15));      // behuizing
      g.add(cyl(0.035, 0.6, STAAL, 0, 0.65, 0.35));
      g.add(box(0.3, 0.07, 0.28, ZWART, 0, 1.0, 0.38));       // zadel
      g.add(box(0.45, 0.25, 0.1, ZWART, 0, 1.2, -0.42));      // console
      return g;
    },
  },
  spinningfiets: {
    name: 'Spinningfiets (Tomahawk)', w: 0.55, d: 1.35,
    build() {
      const g = new THREE.Group();
      g.add(box(0.5, 0.08, 0.1, ZWART, 0, 0.05, -0.55));
      g.add(box(0.5, 0.08, 0.1, ZWART, 0, 0.05, 0.55));
      g.add(box(0.09, 0.1, 1.15, ZWART, 0, 0.08, 0));
      g.add(cyl(0.3, 0.06, CHROOM, 0, 0.45, -0.35, 'x'));     // vliegwiel
      g.add(cyl(0.035, 0.75, ZWART, 0, 0.7, 0.35).rotateX(-0.1));
      g.add(box(0.3, 0.06, 0.25, ZWART, 0, 1.05, 0.42));      // zadel
      g.add(cyl(0.035, 0.8, ZWART, 0, 0.75, -0.38).rotateX(0.15));
      g.add(box(0.4, 0.06, 0.3, DONKER, 0, 1.12, -0.45));     // stuur
      return g;
    },
  },
  fietstrainer_zilver: {
    name: 'Fietstrainer (zilver)', w: 0.5, d: 1.35,
    build() {
      const g = new THREE.Group();
      g.add(box(0.45, 0.06, 0.12, STAAL, 0, 0.04, -0.6));
      g.add(box(0.45, 0.06, 0.12, STAAL, 0, 0.04, 0.6));
      g.add(box(0.06, 0.08, 1.25, CHROOM, 0, 0.08, 0));
      const wiel = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.025, 10, 24), mat(CHROOM, 0.4, 0.6));
      wiel.position.set(0, 0.34, -0.42);
      g.add(wiel);
      g.add(cyl(0.03, 0.7, CHROOM, 0, 0.65, 0.3).rotateX(-0.12));
      g.add(box(0.28, 0.06, 0.24, ZWART, 0, 1.0, 0.36));      // zadel
      g.add(cyl(0.03, 0.7, CHROOM, 0, 0.68, -0.3).rotateX(0.15));
      g.add(box(0.36, 0.05, 0.2, ZWART, 0, 1.02, -0.38));     // stuur
      return g;
    },
  },
  flowin: {
    name: 'FLOWIN-mat', w: 0.75, d: 1.7,
    build() {
      const g = new THREE.Group();
      g.add(box(0.75, 0.02, 1.7, 0x141414, 0, 0.01, 0));
      g.add(box(0.2, 0.022, 0.12, 0xf0f0f0, 0, 0.012, 0.6));  // logo-vlak
      return g;
    },
  },
  aerobicstep: {
    name: 'Aerobic step', w: 0.9, d: 0.4,
    build() {
      const g = new THREE.Group();
      g.add(box(0.9, 0.1, 0.4, 0x2a2a2a, 0, 0.13, 0));
      g.add(box(0.85, 0.08, 0.35, ROOD, 0, 0.05, 0));
      return g;
    },
  },
  behandelbank: {
    name: 'Behandelbank', w: 0.68, d: 1.95,
    build() {
      const g = new THREE.Group();
      g.add(box(0.65, 0.12, 1.9, 0x6b4a2a, 0, 0.72, 0));      // kussen
      for (const [sx, sz] of [[-0.25, -0.85], [0.25, -0.85], [-0.25, 0.85], [0.25, 0.85]]) {
        g.add(box(0.06, 0.66, 0.06, STAAL, sx, 0.33, sz));
      }
      return g;
    },
  },
};

// Maak een plaatsbaar 3D-object van een catalogustype.
export function createObject(type) {
  const def = CATALOG[type];
  const root = new THREE.Group();
  root.add(def.build());
  root.userData = { isGymObject: true, type };
  return root;
}
