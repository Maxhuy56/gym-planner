// Definities van de twee gymzalen, gebaseerd op de foto's (juli 2026).
// Afmetingen in meters. Een zaal bestaat uit 1 of meer rechthoeken (rects);
// de blauwe zaal is daardoor L-vormig (10x10 + 6x5).

export const GYMS = {
  fitness: {
    id: 'fitness',
    name: 'Fitnessruimte (6 × 20 m)',
    floorColor: 0x2b2c2e,        // donkere rubbervloer
    floorBorder: { width: 0.9, color: 0xe9e5dc },  // witte klinkerrand langs de muren
    wallColor: 0xf1f0ed,         // tegelpanelen boven
    wallLower: { height: 2.2, color: 0xe7e3da },   // witte baksteen onder
    height: 4.0,
    rects: [{ minX: -10, maxX: 10, minZ: -3, maxZ: 3 }],
    outline: [[-10, -3], [10, -3], [10, 3], [-10, 3]],
    spawn: { x: -6.0, z: 0.6, yaw: -Math.PI / 2 },
    decals: [
      // gouden tekst op de zuidmuur, helemaal in de (oost)hoek
      { text: 'Fitnessruimte', color: '#a8863c', x: 7.3, y: 2.9, z: 2.86, ry: Math.PI, w: 5, h: 0.9 },
      { type: 'clock', x: 9.87, y: 3.1, z: 0, ry: -Math.PI / 2, w: 0.55, h: 0.55 },
    ],
    // tl-armaturen in twee rijen
    lights: [-8, -4.8, -1.6, 1.6, 4.8, 8].flatMap(x => [
      { x, z: -1.5, w: 1.8, d: 0.3 },
      { x, z: 1.5, w: 1.8, d: 0.3 },
    ]),
    deco: [
      // witte belijning op de rubbervloer
      { w: 0.05, h: 0.012, d: 5.0, color: 0xdddddd, x: 0, y: 0.006, z: 0 },
      { w: 0.05, h: 0.012, d: 2.6, color: 0xdddddd, x: -0.9, y: 0.006, z: -1.4, ry: 0.6 },
      { w: 0.05, h: 0.012, d: 2.6, color: 0xdddddd, x: 0.9, y: 0.006, z: -1.4, ry: -0.6 },
      // witte stalen kolommen + draagbalk over het plafond
      { w: 0.28, h: 4.0, d: 0.3, color: 0xf3f2ee, x: -5.25, y: 2.0, z: 2.78 },
      { w: 0.28, h: 4.0, d: 0.3, color: 0xf3f2ee, x: -1.75, y: 2.0, z: 2.78 },
      { w: 0.28, h: 4.0, d: 0.3, color: 0xf3f2ee, x: 1.75, y: 2.0, z: 2.78 },
      { w: 0.28, h: 4.0, d: 0.3, color: 0xf3f2ee, x: 5.25, y: 2.0, z: 2.78 },
      { w: 0.45, h: 0.5, d: 6.0, color: 0xf0efeb, x: -1.3, y: 3.72, z: 0 },
      // deur op de noordmuur, tegenover de tekst
      { w: 1.0, h: 2.1, d: 0.06, color: 0xf7f6f2, x: 7.3, y: 1.05, z: -2.86 },
    ],
  },
  blauw: {
    id: 'blauw',
    name: 'Blauwe zaal (10 × 10 m + 4 × 7 m)',
    floorColor: 0x8fa9b6,        // lichtblauw linoleum
    wallColor: 0xf0ede5,         // crèmewitte wanden
    height: 3.1,
    // Het grote vierkant is gesplitst in twee rechthoeken zodat de
    // inbouw (1 m diep x 1,5 m breed, helemaal in de hoek aan de
    // westmuur) écht ruimte inneemt: je kunt er niet doorheen lopen en
    // er geen objecten plaatsen.
    rects: [
      { minX: 17, maxX: 26, minZ: -5, maxZ: 5, label: '10 × 10 m' },
      { minX: 16, maxX: 17, minZ: -3.5, maxZ: 5, noLabel: true },
      { minX: 26, maxX: 30, minZ: -5, maxZ: 2, label: '4 × 7 m' },   // aanbouw: 4 breed x 7 diep
    ],
    outline: [
      [17, -5], [30, -5], [30, 2], [26, 2], [26, 5], [16, 5],
      [16, -3.5], [17, -3.5],
    ],
    // plafond doorlopend over de hele zaal, ook boven de inbouw
    ceilRects: [
      { minX: 16, maxX: 26, minZ: -5, maxZ: 5 },
      { minX: 26, maxX: 30, minZ: -5, maxZ: 2 },
    ],
    spawn: { x: 21.5, z: 3.2, yaw: Math.PI / 4 },
    decals: [
      { text: '“One day or day one. You decide.”', color: '#2c2c2c', x: 21, y: 2.45, z: -4.88, ry: 0, w: 6, h: 0.55 },
      // klok in de aanbouw, oostmuur, rechts van het midden
      { type: 'clock', x: 29.87, y: 2.35, z: 0.3, ry: -Math.PI / 2, w: 0.5, h: 0.5 },
    ],
    // vierkante plafondpanelen (verlichting)
    lights: [
      { x: 18.5, z: -2.5, w: 0.95, d: 0.95 }, { x: 18.5, z: 2.5, w: 0.95, d: 0.95 },
      { x: 21.5, z: -2.5, w: 0.95, d: 0.95 }, { x: 21.5, z: 2.5, w: 0.95, d: 0.95 },
      { x: 24.5, z: -2.5, w: 0.95, d: 0.95 }, { x: 24.5, z: 2.5, w: 0.95, d: 0.95 },
      { x: 28, z: -3, w: 0.95, d: 0.95 }, { x: 28, z: 0, w: 0.95, d: 0.95 },
    ],
    deco: [
      // westmuur (binnenvlak x=16,10): raam - glazen deur - raam, 1 m naar
      // rechts opgeschoven (richting de inbouw in de hoek)
      { w: 0.05, h: 1.5, d: 1.4, color: 0xf7f6f2, x: 16.12, y: 1.55, z: 3.0 },             // kozijn raam links
      { w: 0.06, h: 1.36, d: 1.26, color: 0xd6e6f0, x: 16.13, y: 1.55, z: 3.0, basic: true }, // ruit
      { w: 0.05, h: 2.1, d: 1.0, color: 0xf7f6f2, x: 16.12, y: 1.05, z: 1.6 },             // kozijn glazen deur
      { w: 0.06, h: 1.95, d: 0.85, color: 0xc9dfec, x: 16.13, y: 1.02, z: 1.6, basic: true }, // glas
      { w: 0.05, h: 1.5, d: 1.4, color: 0xf7f6f2, x: 16.12, y: 1.55, z: 0.2 },             // kozijn raam rechts
      { w: 0.06, h: 1.36, d: 1.26, color: 0xd6e6f0, x: 16.13, y: 1.55, z: 0.2, basic: true }, // ruit
      // aanbouw: deur in het midden van de oostmuur (naast de klok)
      { w: 0.06, h: 2.1, d: 1.0, color: 0xf7f6f2, x: 29.88, y: 1.05, z: -1.5 },
      // nooduitgang-bordje (de deur eronder is weggehaald)
      { w: 0.38, h: 0.16, d: 0.06, color: 0x2e9e4f, x: 28, y: 2.32, z: -4.85, basic: true },
      // radiator
      { w: 2.6, h: 0.55, d: 0.12, color: 0xf3f2ee, x: 21, y: 0.35, z: -4.82 },
    ],
  },
};

// Punt-in-zaal test (inset > 0 = marge vanaf de muren).
export function pointInGym(gym, x, z, inset = 0) {
  return gym.rects.some(r =>
    x >= r.minX + inset && x <= r.maxX - inset &&
    z >= r.minZ + inset && z <= r.maxZ - inset
  );
}

// In welke zaal ligt dit punt?
export function gymAt(x, z) {
  for (const gym of Object.values(GYMS)) {
    if (pointInGym(gym, x, z)) return gym;
  }
  return null;
}

// Past een voetafdruk (halfbreedte hx, halfdiepte hz rond x,z) binnen de zaal?
// We bemonsteren een raster over de (met "inset" vergrote) voetafdruk en
// eisen dat elk punt binnen de unie van rechthoeken ligt — zónder inset per
// rechthoek. Zo telt de marge alleen bij echte buitenmuren en kun je gewoon
// over de naad tussen twee rechthoeken lopen (zaal <-> aanbouw).
export function footprintInGym(gym, x, z, hx, hz, inset = 0) {
  const ex = hx + inset, ez = hz + inset;
  const step = 0.35;
  const nx = Math.max(2, Math.ceil((2 * ex) / step) + 1);
  const nz = Math.max(2, Math.ceil((2 * ez) / step) + 1);
  for (let i = 0; i < nx; i++) {
    for (let j = 0; j < nz; j++) {
      const px = x - ex + (2 * ex * i) / (nx - 1);
      const pz = z - ez + (2 * ez * j) / (nz - 1);
      if (!pointInGym(gym, px, pz)) return false;
    }
  }
  return true;
}

// Klem een positie zó dat de voetafdruk binnen de zaal blijft.
// Eerst kijken of de gewenste positie al geldig is (unie-test); zo niet,
// klem naar de dichtstbijzijnde rechthoek waar het object in past.
export function clampToGym(gym, x, z, hx, hz, inset = 0) {
  if (footprintInGym(gym, x, z, hx, hz, inset)) return { x, z };
  let best = null;
  let bestDist = Infinity;
  for (const r of gym.rects) {
    const loX = r.minX + inset + hx, hiX = r.maxX - inset - hx;
    const loZ = r.minZ + inset + hz, hiZ = r.maxZ - inset - hz;
    if (loX > hiX || loZ > hiZ) continue; // object past niet in dit deel
    const cx = Math.min(Math.max(x, loX), hiX);
    const cz = Math.min(Math.max(z, loZ), hiZ);
    const d = (cx - x) ** 2 + (cz - z) ** 2;
    if (d < bestDist) { bestDist = d; best = { x: cx, z: cz }; }
  }
  return best; // null als het object nergens past
}

// Gedraaide voetafdruk -> as-uitgelijnde halfbreedtes.
export function rotatedHalfExtents(w, d, rot) {
  const c = Math.abs(Math.cos(rot)), s = Math.abs(Math.sin(rot));
  return { hx: (c * w + s * d) / 2, hz: (s * w + c * d) / 2 };
}
