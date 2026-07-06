// Catalogus van gymtoestellen, opgebouwd uit eenvoudige vormen.
// w = breedte (x), d = diepte (z) in meters bij rotatie 0.
// Als de foto's van de echte gyms er zijn, kunnen we deze modellen en
// de lijst verfijnen zodat ze op de echte spullen lijken.

import * as THREE from 'three';

function mat(color, roughness = 0.8, metalness = 0) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness });
}

function box(w, h, d, color, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color));
  m.position.set(x, y, z);
  return m;
}

// Cilinder met as omhoog (y). axis: 'x'|'y'|'z'
function cyl(r, len, color, x = 0, y = 0, z = 0, axis = 'y') {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 16), mat(color));
  if (axis === 'x') m.rotation.z = Math.PI / 2;
  if (axis === 'z') m.rotation.x = Math.PI / 2;
  m.position.set(x, y, z);
  return m;
}

const DARK = 0x24262a, STEEL = 0x8b909a, BLACK = 0x121316;

export const CATALOG = {
  loopband: {
    name: 'Loopband', w: 0.85, d: 1.9,
    build() {
      const g = new THREE.Group();
      g.add(box(0.75, 0.14, 1.75, BLACK, 0, 0.1, 0.05));         // loopvlak
      g.add(box(0.85, 0.06, 0.5, DARK, 0, 0.32, -0.6));           // voorplateau
      g.add(cyl(0.03, 1.05, STEEL, -0.35, 0.75, -0.75));          // staander L
      g.add(cyl(0.03, 1.05, STEEL, 0.35, 0.75, -0.75));           // staander R
      g.add(box(0.8, 0.28, 0.1, DARK, 0, 1.32, -0.78));           // console
      return g;
    },
  },
  hometrainer: {
    name: 'Hometrainer', w: 0.55, d: 1.2,
    build() {
      const g = new THREE.Group();
      g.add(box(0.5, 0.08, 1.05, DARK, 0, 0.06, 0));
      g.add(cyl(0.24, 0.12, 0x3a3d44, 0, 0.55, -0.25, 'x'));      // vliegwiel
      g.add(cyl(0.035, 0.75, STEEL, 0, 0.6, 0.3));                // zadelpen
      g.add(box(0.3, 0.07, 0.28, BLACK, 0, 1.0, 0.3));            // zadel
      g.add(cyl(0.035, 0.85, STEEL, 0, 0.65, -0.42));             // stuurpen
      g.add(box(0.45, 0.06, 0.2, BLACK, 0, 1.1, -0.45));          // stuur
      return g;
    },
  },
  roeitrainer: {
    name: 'Roeitrainer', w: 0.6, d: 2.2,
    build() {
      const g = new THREE.Group();
      g.add(box(0.16, 0.09, 1.9, STEEL, 0, 0.3, 0.1));            // rail
      g.add(box(0.55, 0.55, 0.45, DARK, 0, 0.35, -0.85));         // vliegwielkast
      g.add(box(0.32, 0.06, 0.32, BLACK, 0, 0.38, 0.35));         // zitje
      g.add(box(0.5, 0.06, 0.12, DARK, 0, 0.1, 1.0));             // voet achter
      g.add(box(0.5, 0.06, 0.12, DARK, 0, 0.1, -1.0));            // voet voor
      return g;
    },
  },
  halterbank: {
    name: 'Halterbank', w: 0.55, d: 1.35,
    build() {
      const g = new THREE.Group();
      g.add(box(0.34, 0.09, 1.25, 0x5c1f1f, 0, 0.44, 0));         // kussen
      g.add(box(0.08, 0.4, 0.08, STEEL, 0, 0.2, -0.5));
      g.add(box(0.08, 0.4, 0.08, STEEL, 0, 0.2, 0.5));
      g.add(box(0.5, 0.05, 0.1, STEEL, 0, 0.03, -0.5));
      g.add(box(0.5, 0.05, 0.1, STEEL, 0, 0.03, 0.5));
      return g;
    },
  },
  squatrack: {
    name: 'Squat rack', w: 2.0, d: 1.5,
    build() {
      const g = new THREE.Group();
      for (const sx of [-0.55, 0.55]) {
        for (const sz of [-0.55, 0.55]) g.add(box(0.08, 2.2, 0.08, DARK, sx, 1.1, sz));
        g.add(box(0.08, 0.08, 1.18, DARK, sx, 2.16, 0));          // ligger boven
      }
      g.add(cyl(0.025, 2.0, STEEL, 0, 1.55, -0.55, 'x'));         // halterstang
      g.add(cyl(0.2, 0.05, BLACK, -0.85, 1.55, -0.55, 'x'));      // schijf L
      g.add(cyl(0.2, 0.05, BLACK, 0.85, 1.55, -0.55, 'x'));       // schijf R
      return g;
    },
  },
  dumbbellrek: {
    name: 'Dumbbell rek', w: 1.8, d: 0.65,
    build() {
      const g = new THREE.Group();
      g.add(box(1.8, 0.08, 0.55, DARK, 0, 0.35, 0));
      g.add(box(1.8, 0.08, 0.55, DARK, 0, 0.75, -0.05));
      g.add(box(0.08, 0.75, 0.55, DARK, -0.86, 0.38, 0));
      g.add(box(0.08, 0.75, 0.55, DARK, 0.86, 0.38, 0));
      for (let i = 0; i < 5; i++) {
        const x = -0.65 + i * 0.32;
        g.add(cyl(0.055, 0.28, STEEL, x, 0.45, 0, 'x'));
        g.add(cyl(0.055, 0.28, STEEL, x + 0.16, 0.85, -0.05, 'x'));
      }
      return g;
    },
  },
  kabelstation: {
    name: 'Kabelstation', w: 1.3, d: 0.75,
    build() {
      const g = new THREE.Group();
      g.add(box(0.4, 2.3, 0.6, DARK, -0.42, 1.15, 0));
      g.add(box(0.4, 2.3, 0.6, DARK, 0.42, 1.15, 0));
      g.add(box(1.3, 0.12, 0.2, STEEL, 0, 2.3, 0));
      g.add(box(0.3, 1.0, 0.15, 0x3a3d44, -0.42, 0.9, 0.24));     // gewichtstapel L
      g.add(box(0.3, 1.0, 0.15, 0x3a3d44, 0.42, 0.9, 0.24));      // gewichtstapel R
      return g;
    },
  },
  mattenstapel: {
    name: 'Fitnessmatten (stapel)', w: 1.0, d: 1.8,
    build() {
      const g = new THREE.Group();
      const colors = [0x2b5f8e, 0x35708f, 0x2b5f8e, 0x35708f];
      colors.forEach((c, i) => g.add(box(0.95, 0.09, 1.75, c, (i % 2) * 0.03, 0.06 + i * 0.1, 0)));
      return g;
    },
  },
  turnmat: {
    name: 'Turnmat (2 × 3 m)', w: 2.0, d: 3.0,
    build() {
      const g = new THREE.Group();
      g.add(box(2.0, 0.25, 3.0, 0x2e7d4f, 0, 0.125, 0));
      return g;
    },
  },
  gymbank: {
    name: 'Gymnastiekbank', w: 0.3, d: 3.0,
    build() {
      const g = new THREE.Group();
      g.add(box(0.28, 0.07, 3.0, 0xa5713a, 0, 0.32, 0));          // blad
      g.add(box(0.1, 0.05, 3.0, 0xa5713a, 0, 0.06, 0));           // balk onder
      g.add(box(0.26, 0.3, 0.08, 0x7d5326, 0, 0.16, -1.3));
      g.add(box(0.26, 0.3, 0.08, 0x7d5326, 0, 0.16, 1.3));
      return g;
    },
  },
  springkast: {
    name: 'Springkast', w: 0.95, d: 1.35,
    build() {
      const g = new THREE.Group();
      const layers = [[0.95, 1.35], [0.88, 1.25], [0.81, 1.15], [0.74, 1.05]];
      layers.forEach(([w, d], i) => g.add(box(w, 0.24, d, 0xb08d57, 0, 0.12 + i * 0.25, 0)));
      g.add(box(0.72, 0.1, 1.0, 0x6b4a2a, 0, 1.1, 0));            // leren top
      return g;
    },
  },
  minitrampoline: {
    name: 'Minitrampoline', w: 1.2, d: 1.25,
    build() {
      const g = new THREE.Group();
      const frame = box(1.1, 0.08, 1.1, STEEL, 0, 0.5, 0);
      frame.rotation.x = -0.3;
      const matje = box(0.85, 0.04, 0.85, BLACK, 0, 0.52, 0);
      matje.rotation.x = -0.3;
      g.add(frame, matje);
      g.add(box(0.06, 0.45, 0.06, DARK, -0.5, 0.22, 0.45));
      g.add(box(0.06, 0.45, 0.06, DARK, 0.5, 0.22, 0.45));
      g.add(box(0.06, 0.7, 0.06, DARK, -0.5, 0.35, -0.45));
      g.add(box(0.06, 0.7, 0.06, DARK, 0.5, 0.35, -0.45));
      return g;
    },
  },
  ballenkar: {
    name: 'Ballenkar', w: 0.85, d: 1.25,
    build() {
      const g = new THREE.Group();
      g.add(box(0.8, 0.05, 1.2, STEEL, 0, 0.15, 0));              // bodem
      g.add(box(0.8, 0.6, 0.04, STEEL, 0, 0.45, -0.58));
      g.add(box(0.8, 0.6, 0.04, STEEL, 0, 0.45, 0.58));
      g.add(box(0.04, 0.6, 1.2, STEEL, -0.38, 0.45, 0));
      g.add(box(0.04, 0.6, 1.2, STEEL, 0.38, 0.45, 0));
      const ballColors = [0xd94f30, 0xe8b530, 0x3a7bd5, 0xd94f30, 0x4caf50];
      ballColors.forEach((c, i) => {
        const b = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 10), mat(c, 0.6));
        b.position.set(-0.2 + (i % 3) * 0.2, 0.3 + Math.floor(i / 3) * 0.18, -0.35 + (i % 2) * 0.45);
        g.add(b);
      });
      return g;
    },
  },
  wandrek: {
    name: 'Wandrek', w: 1.0, d: 0.35,
    build() {
      const g = new THREE.Group();
      g.add(box(0.09, 2.5, 0.3, 0xa5713a, -0.45, 1.25, 0));
      g.add(box(0.09, 2.5, 0.3, 0xa5713a, 0.45, 1.25, 0));
      for (let i = 0; i < 8; i++) g.add(cyl(0.02, 0.85, 0xc99a5f, 0, 0.35 + i * 0.28, 0.05, 'x'));
      return g;
    },
  },
  pilonnenset: {
    name: 'Pilonnen (set)', w: 0.5, d: 0.5,
    build() {
      const g = new THREE.Group();
      for (let i = 0; i < 4; i++) {
        const cone = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.28, 12), mat(0xe8762c, 0.7));
        cone.position.set(0, 0.14 + i * 0.09, 0);
        g.add(cone);
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
