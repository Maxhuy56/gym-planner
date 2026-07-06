// Definities van de twee gymzalen. Afmetingen in meters.
// Een zaal bestaat uit 1 of meer rechthoeken (rects); de blauwe zaal is
// daardoor L-vormig (10x10 + 6x5). "outline" is de buitenmuur, met de
// hoekpunten op volgorde (wordt gesloten getekend).

export const GYMS = {
  fitness: {
    id: 'fitness',
    name: 'Fitnessruimte (6 × 20 m)',
    floorColor: 0x16181b,      // zwarte vloer
    wallColor: 0xd9d4cc,
    height: 3.2,
    rects: [{ minX: -10, maxX: 10, minZ: -3, maxZ: 3 }],
    outline: [[-10, -3], [10, -3], [10, 3], [-10, 3]],
    spawn: { x: -8.5, z: 0, yaw: -Math.PI / 2 },
    wallText: 'FITNESSRUIMTE',
  },
  blauw: {
    id: 'blauw',
    name: 'Blauwe zaal (10 × 10 m + 6 × 5 m)',
    floorColor: 0x1f55a8,      // blauwe vloer
    wallColor: 0xe3e0da,
    height: 4.5,
    rects: [
      { minX: 16, maxX: 26, minZ: -5, maxZ: 5 },   // 10 x 10
      { minX: 26, maxX: 32, minZ: -5, maxZ: 0 },   // 6 x 5
    ],
    outline: [[16, -5], [32, -5], [32, 0], [26, 0], [26, 5], [16, 5]],
    spawn: { x: 18, z: 0, yaw: -Math.PI / 2 },
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
