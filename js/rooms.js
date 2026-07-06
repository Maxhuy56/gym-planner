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
    // hoge ramen met lamellen aan de zuidkant (lange muur)
    windows: [-7, -3.5, 0, 3.5, 7].map(x => ({ x, z: 2.88, y: 2.85, w: 2.6, h: 1.1, ry: Math.PI })),
    decals: [
      { text: 'Fitnessruimte', color: '#a8863c', bg: '#e7e3da', x: -9.88, y: 2.9, z: 0, ry: Math.PI / 2, w: 5, h: 0.9 },
    ],
    // witte belijning op de rubbervloer (decoratief)
    deco: [
      { w: 0.05, h: 0.012, d: 5.0, color: 0xdddddd, x: 0, y: 0.006, z: 0 },
      { w: 0.05, h: 0.012, d: 2.6, color: 0xdddddd, x: -0.9, y: 0.006, z: -1.4, ry: 0.6 },
      { w: 0.05, h: 0.012, d: 2.6, color: 0xdddddd, x: 0.9, y: 0.006, z: -1.4, ry: -0.6 },
    ],
  },
  blauw: {
    id: 'blauw',
    name: 'Blauwe zaal (10 × 10 m + 6 × 5 m)',
    floorColor: 0x8fa9b6,        // lichtblauw linoleum
    wallColor: 0xf0ede5,         // crèmewitte wanden
    height: 3.1,
    rects: [
      { minX: 16, maxX: 26, minZ: -5, maxZ: 5 },   // 10 x 10
      { minX: 26, maxX: 32, minZ: -5, maxZ: 0 },   // 6 x 5
    ],
    outline: [[16, -5], [32, -5], [32, 0], [26, 0], [26, 5], [16, 5]],
    spawn: { x: 21.5, z: 3.2, yaw: Math.PI / 4 },
    decals: [
      { text: '“One day or day one. You decide.”', color: '#2c2c2c', bg: '#f0ede5', x: 21, y: 2.45, z: -4.88, ry: 0, w: 6, h: 0.55 },
    ],
    // witte deuren met matglas (Willem II-logo) + radiator langs de muur
    deco: [
      { w: 0.06, h: 2.1, d: 1.0, color: 0xf7f6f2, x: 16.04, y: 1.05, z: 3.2 },   // deur west
      { w: 0.06, h: 2.1, d: 1.0, color: 0xf7f6f2, x: 16.04, y: 1.05, z: -3.4 },  // deur west 2
      { w: 1.0, h: 2.1, d: 0.06, color: 0xf7f6f2, x: 30.8, y: 1.05, z: -4.94 },  // deur zuid (nooduitgang)
      { w: 2.6, h: 0.55, d: 0.12, color: 0xf3f2ee, x: 21, y: 0.35, z: -4.9 },    // radiator
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
// Alle vier hoeken moeten binnen de unie van rechthoeken vallen; bij een
// L-vorm mag een object dus over de "naad" tussen de twee delen staan.
export function footprintInGym(gym, x, z, hx, hz, inset = 0) {
  const corners = [
    [x - hx, z - hz], [x + hx, z - hz],
    [x - hx, z + hz], [x + hx, z + hz],
    [x, z],
  ];
  return corners.every(([cx, cz]) => pointInGym(gym, cx, cz, inset));
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
