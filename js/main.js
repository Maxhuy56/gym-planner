import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { GYMS, pointInGym, gymAt, clampToGym, rotatedHalfExtents } from './rooms.js';
import { CATALOG, createObject } from './catalog.js';
import { downloadFloorplan } from './floorplan.js';
import { brickTex, tileTex, rubberTex, klinkerTex, linoTex, ceilTex, blindsTex, clockTex } from './textures.js';

const EYE = 1.65;          // ooghoogte in meters
const WALL_T = 0.2;        // muurdikte
const OBJ_INSET = 0.12;    // marge tussen object en muur
const STORAGE_KEY = 'gymPlannerLayoutV2';

// ---------- Scene ----------
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xb9cfe4);

// Omgevingsreflecties zodat chroom/staal er metaalachtig uitziet
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.05, 200);
camera.rotation.order = 'YXZ';

scene.add(new THREE.HemisphereLight(0xffffff, 0x51606e, 0.85));
const sun = new THREE.DirectionalLight(0xfff4e0, 1.5);
sun.position.set(11, 20, 8);
sun.target.position.set(11, 0, 0);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -24;
sun.shadow.camera.right = 24;
sun.shadow.camera.top = 12;
sun.shadow.camera.bottom = -12;
sun.shadow.camera.near = 1;
sun.shadow.camera.far = 45;
sun.shadow.bias = -0.0004;
scene.add(sun, sun.target);
scene.add(new THREE.AmbientLight(0xffffff, 0.35));

// terrein buiten de zalen
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(300, 300),
  new THREE.MeshStandardMaterial({ color: 0x86909a, roughness: 1 })
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.03;
ground.receiveShadow = true;
scene.add(ground);

// ---------- Zalen bouwen ----------
function buildGym(gym) {
  const g = new THREE.Group();
  // Basic-materiaal: plafond krijgt geen direct licht van bovenaf, dus
  // standaard-materiaal zou onnatuurlijk donker ogen.
  const ceilMat = new THREE.MeshBasicMaterial({ color: 0xcfcdc8 });

  for (const r of gym.rects) {
    const w = r.maxX - r.minX, d = r.maxZ - r.minZ;
    const cx = (r.minX + r.maxX) / 2, cz = (r.minZ + r.maxZ) / 2;
    const floorMat = gym.id === 'fitness'
      ? new THREE.MeshStandardMaterial({ map: rubberTex(w / 2, d / 2), roughness: 0.92 })
      : new THREE.MeshStandardMaterial({ map: linoTex(w / 2.5, d / 2.5), roughness: 0.5, envMapIntensity: 0.35 });
    if (gym.floorBorder) {
      // rand van witte klinkers met daarbinnen de rubbervloer
      const b = gym.floorBorder.width;
      const rand = new THREE.Mesh(
        new THREE.BoxGeometry(w, 0.1, d),
        new THREE.MeshStandardMaterial({ map: klinkerTex(w / 1.4, d / 1.4), roughness: 0.95 })
      );
      rand.position.set(cx, -0.05, cz);
      rand.receiveShadow = true;
      g.add(rand);
      const binnen = new THREE.Mesh(new THREE.BoxGeometry(w - 2 * b, 0.1, d - 2 * b), floorMat);
      binnen.position.set(cx, -0.048, cz);
      binnen.receiveShadow = true;
      g.add(binnen);
    } else {
      const floor = new THREE.Mesh(new THREE.BoxGeometry(w, 0.1, d), floorMat);
      floor.position.set(cx, -0.05, cz);
      floor.receiveShadow = true;
      g.add(floor);
    }
    const ceil = new THREE.Mesh(
      new THREE.BoxGeometry(w, 0.1, d),
      new THREE.MeshBasicMaterial({ map: ceilTex(w / 1.2, d / 1.2) })
    );
    ceil.position.set(cx, gym.height + 0.05, cz);
    g.add(ceil);
  }

  const pts = gym.outline;
  for (let i = 0; i < pts.length; i++) {
    const [x1, z1] = pts[i];
    const [x2, z2] = pts[(i + 1) % pts.length];
    const len = Math.hypot(x2 - x1, z2 - z1) + WALL_T;
    const alongX = Math.abs(x2 - x1) > Math.abs(z2 - z1);
    const cx = (x1 + x2) / 2, cz = (z1 + z2) / 2;
    const lowH = gym.wallLower ? gym.wallLower.height : 0;
    if (lowH > 0) {
      // onderste deel: witte baksteen
      const lowGeo = alongX ? new THREE.BoxGeometry(len, lowH, WALL_T) : new THREE.BoxGeometry(WALL_T, lowH, len);
      const low = new THREE.Mesh(lowGeo, new THREE.MeshStandardMaterial({
        map: brickTex(len / 1.8, lowH / 0.55), roughness: 0.95,
      }));
      low.position.set(cx, lowH / 2, cz);
      low.receiveShadow = true;
      g.add(low);
    }
    // bovenste deel: tegelpanelen (fitness) of glad stucwerk (blauw)
    const upH = gym.height - lowH;
    const upGeo = alongX ? new THREE.BoxGeometry(len, upH, WALL_T) : new THREE.BoxGeometry(WALL_T, upH, len);
    const upMat = gym.id === 'fitness'
      ? new THREE.MeshStandardMaterial({ map: tileTex(len / 1.2, upH / 1.2), roughness: 0.9 })
      : new THREE.MeshStandardMaterial({ color: gym.wallColor, roughness: 0.95 });
    const up = new THREE.Mesh(upGeo, upMat);
    up.position.set(cx, lowH + upH / 2, cz);
    up.receiveShadow = true;
    g.add(up);
  }

  // hoge ramen met lamellen + donker kozijn
  for (const win of gym.windows || []) {
    const raam = new THREE.Mesh(
      new THREE.PlaneGeometry(win.w, win.h),
      new THREE.MeshBasicMaterial({ map: blindsTex() })
    );
    raam.position.set(win.x, win.y, win.z);
    raam.rotation.y = win.ry || 0;
    g.add(raam);
    const kozijn = new THREE.Mesh(
      new THREE.BoxGeometry(win.w + 0.12, win.h + 0.12, 0.04),
      new THREE.MeshStandardMaterial({ color: 0x70747a, roughness: 0.6, metalness: 0.4 })
    );
    kozijn.position.set(win.x, win.y, win.z);
    kozijn.rotation.y = win.ry || 0;
    kozijn.translateZ(-0.025);
    g.add(kozijn);
  }

  // plafondarmaturen (zelfverlichtend)
  for (const li of gym.lights || []) {
    const paneel = new THREE.Mesh(
      new THREE.BoxGeometry(li.w, 0.06, li.d),
      new THREE.MeshBasicMaterial({ color: 0xfff8ea })
    );
    paneel.position.set(li.x, gym.height - 0.04, li.z);
    g.add(paneel);
  }

  // muurdecoraties: teksten en klokken (transparante canvas-textuur)
  for (const decal of gym.decals || []) {
    let tex;
    if (decal.type === 'clock') {
      tex = clockTex();
    } else {
      const cv = document.createElement('canvas');
      cv.width = 1024;
      cv.height = Math.max(64, Math.round(1024 * (decal.h / decal.w)));
      const c = cv.getContext('2d');
      c.clearRect(0, 0, cv.width, cv.height);
      c.fillStyle = decal.color;
      c.font = `bold ${Math.round(cv.height * 0.6)}px Georgia, serif`;
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.fillText(decal.text, cv.width / 2, cv.height * 0.54);
      tex = new THREE.CanvasTexture(cv);
      tex.colorSpace = THREE.SRGBColorSpace;
    }
    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(decal.w, decal.h),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true })
    );
    plane.position.set(decal.x, decal.y, decal.z);
    plane.rotation.y = decal.ry || 0;
    g.add(plane);
  }

  // vaste decoratie (deuren, radiator, vloerbelijning, kolommen)
  for (const d of gym.deco || []) {
    const m = new THREE.Mesh(
      new THREE.BoxGeometry(d.w, d.h, d.d),
      d.basic
        ? new THREE.MeshBasicMaterial({ color: d.color })
        : new THREE.MeshStandardMaterial({ color: d.color, roughness: 0.9 })
    );
    m.position.set(d.x, d.y, d.z);
    m.rotation.y = d.ry || 0;
    m.receiveShadow = true;
    g.add(m);
  }
  scene.add(g);
}
Object.values(GYMS).forEach(buildGym);

const objectsRoot = new THREE.Group();
scene.add(objectsRoot);

// ---------- State ----------
let objects = [];        // { type, root }
let inventory = [];      // catalogus-types in opslag
let selected = null;
let dragging = null;     // { entry, offX, offZ, gym }
let placing = null;      // { type, root, fromInventory }
let currentGymId = 'fitness';

const player = { x: GYMS.fitness.spawn.x, z: GYMS.fitness.spawn.z, yaw: GYMS.fitness.spawn.yaw, pitch: 0 };
const keys = {};

// Beginopstelling: zo staat het er nu ongeveer bij, op basis van de foto's.
const DEFAULT_LAYOUT = [
  // Fitnessruimte — westkant (bij het "Fitnessruimte"-logo)
  { type: 'valmatten', x: -8.8, z: -1.8, rot: 0 },
  { type: 'minitrampoline', x: -8.9, z: 0.8, rot: Math.PI / 2 },
  { type: 'hipthrust', x: -7.4, z: -1.9, rot: 0 },
  { type: 'tvstandaard', x: -6.5, z: 2.55, rot: Math.PI },
  { type: 'stellingkast', x: -4.5, z: 2.55, rot: Math.PI },
  { type: 'trxframe', x: -4.5, z: -2.35, rot: 0 },
  // midden
  { type: 'kettlebellrek', x: -1.8, z: -2.6, rot: 0 },
  { type: 'dumbbellrek_chroom', x: -0.4, z: -2.6, rot: 0 },
  { type: 'plyobox60', x: 0.8, z: -2.5, rot: 0 },
  { type: 'plyobox30_oranje', x: 2.0, z: -2.5, rot: 0 },
  { type: 'medicijnballen', x: -1.0, z: 2.6, rot: Math.PI },
  { type: 'sandbag', x: 0.2, z: 2.4, rot: 0 },
  { type: 'buikspierbank', x: 1.8, z: 2.2, rot: Math.PI },
  { type: 'verstelbank', x: 3.6, z: 1.2, rot: 0.4 },
  // oostkant — racks en gewichten
  { type: 'spiegel', x: 5.5, z: -2.83, rot: 0 },
  { type: 'halfrack', x: 5.5, z: -1.9, rot: 0 },
  { type: 'halterrek_schijven', x: 7.3, z: -2.6, rot: 0 },
  { type: 'halfrack', x: 8.7, z: -1.9, rot: 0 },
  { type: 'stangenrek', x: 9.5, z: 0.5, rot: -Math.PI / 2 },
  { type: 'dumbbellrek_zwart', x: 6.5, z: 2.55, rot: Math.PI },
  { type: 'legpress', x: 8.8, z: 1.8, rot: Math.PI },
  { type: 'ghd', x: -2.8, z: 1.9, rot: Math.PI },
  { type: 'legextension', x: 4.8, z: 2.35, rot: Math.PI },
  { type: 'legcurl', x: 3.2, z: 2.35, rot: Math.PI },
  { type: 'tv_wand', x: 9.8, z: 1.4, rot: -Math.PI / 2 },
  { type: 'schijvenrek_grond', x: 4.2, z: -2.65, rot: 0 },

  // Blauwe zaal — cardiohoek (grote vierkant, westkant)
  { type: 'loopband_matrix', x: 17.3, z: -3.3, rot: Math.PI / 2 },
  { type: 'crosstrainer', x: 17.3, z: -1.4, rot: Math.PI / 2 },
  { type: 'hometrainer', x: 17.3, z: 0.3, rot: Math.PI / 2 },
  { type: 'spinningfiets', x: 19.8, z: -4.2, rot: 0 },
  { type: 'spinningfiets', x: 21.0, z: -4.2, rot: 0 },
  { type: 'spinningfiets', x: 22.2, z: -4.2, rot: 0 },
  // zuidkant en midden
  { type: 'flowin', x: 21.0, z: 1.6, rot: 0 },
  { type: 'buikspierbank', x: 18.6, z: 3.9, rot: 0 },
  { type: 'aerobicstep', x: 23.8, z: 4.4, rot: 0 },
  { type: 'aerobicstep', x: 23.8, z: 3.8, rot: 0 },
  { type: 'houten_plyobox', x: 24.9, z: 4.2, rot: 0 },
  { type: 'plyobox60', x: 25.4, z: 3.1, rot: 0 },
  // aanbouw (6 × 5)
  { type: 'fietstrainer_zilver', x: 27.6, z: -3.9, rot: 0 },
  { type: 'fietstrainer_zilver', x: 28.8, z: -3.9, rot: 0 },
  { type: 'fietstrainer_zilver', x: 30.0, z: -3.9, rot: 0 },
  { type: 'behandelbank', x: 31.6, z: -2.3, rot: Math.PI / 2 },
  { type: 'roeimachine', x: 22.8, z: 0.4, rot: Math.PI / 2 },
  { type: 'romanchair', x: 20.4, z: 4.1, rot: 0 },
  { type: 'mattenrek', x: 27.3, z: -1.7, rot: Math.PI },
  { type: 'plyobox45_grijs', x: 24.6, z: 2.6, rot: 0 },
  { type: 'keiser', x: 25.3, z: -4.45, rot: 0 },
];

function spawnObject(type, x, z, rot) {
  const root = createObject(type);
  root.position.set(x, 0, z);
  root.rotation.y = rot;
  objectsRoot.add(root);
  const entry = { type, root };
  objects.push(entry);
  return entry;
}

function save() {
  const data = {
    objects: objects.map(o => ({
      type: o.type,
      x: Math.round(o.root.position.x * 100) / 100,
      z: Math.round(o.root.position.z * 100) / 100,
      rot: Math.round(o.root.rotation.y * 1000) / 1000,
    })),
    inventory: [...inventory],
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function load() {
  let data = null;
  try { data = JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch (e) { /* corrupt: negeren */ }
  const list = data && Array.isArray(data.objects) ? data.objects : DEFAULT_LAYOUT;
  list.filter(o => CATALOG[o.type]).forEach(o => spawnObject(o.type, o.x, o.z, o.rot || 0));
  inventory = data && Array.isArray(data.inventory) ? data.inventory.filter(t => CATALOG[t]) : [];
}

// ---------- Selectie ----------
function setEmissive(root, hex) {
  root.traverse(m => {
    if (m.isMesh && m.material && m.material.emissive) m.material.emissive.setHex(hex);
  });
}

function select(entry) {
  if (selected === entry) return;
  if (selected) setEmissive(selected.root, 0x000000);
  selected = entry;
  if (entry) {
    setEmissive(entry.root, 0x1a3a5c);
    setStatus(`<b>${CATALOG[entry.type].name}</b> — sleep om te verplaatsen · R = draaien · Delete = naar opslag`);
  } else {
    setStatus(null);
  }
}

function setStatus(html) {
  const el = document.getElementById('status');
  if (html) { el.innerHTML = html; el.classList.add('visible'); }
  else el.classList.remove('visible');
}

// ---------- Opslag (inventory) ----------
function toInventory(entry) {
  objectsRoot.remove(entry.root);
  objects = objects.filter(o => o !== entry);
  inventory.push(entry.type);
  if (selected === entry) select(null);
  updateInventoryUI();
  save();
}

function updateInventoryUI() {
  const el = document.getElementById('inventory');
  document.getElementById('invCount').textContent = inventory.length ? `(${inventory.length})` : '';
  if (inventory.length === 0) {
    el.innerHTML = '<p class="empty">Leeg — druk op Delete bij een geselecteerd object.</p>';
    return;
  }
  const counts = {};
  inventory.forEach(t => { counts[t] = (counts[t] || 0) + 1; });
  el.innerHTML = '';
  for (const [type, n] of Object.entries(counts)) {
    const row = document.createElement('div');
    row.className = 'inv-item';
    const label = document.createElement('span');
    label.textContent = CATALOG[type].name + (n > 1 ? ` × ${n}` : '');
    const btn = document.createElement('button');
    btn.textContent = 'Plaats';
    btn.addEventListener('click', () => startPlacing(type, true));
    row.append(label, btn);
    el.appendChild(row);
  }
}

// ---------- Plaatsen ----------
function setOpacity(root, opacity) {
  root.traverse(m => {
    if (m.isMesh && m.material) {
      m.material.transparent = opacity < 1;
      m.material.opacity = opacity;
    }
  });
}

function startPlacing(type, fromInventory) {
  cancelPlacing();
  select(null);
  const gym = GYMS[currentGymId];
  const root = createObject(type);
  const def = CATALOG[type];
  const { hx, hz } = rotatedHalfExtents(def.w, def.d, 0);
  const spot = clampToGym(gym, player.x + -Math.sin(player.yaw) * 2.5, player.z + -Math.cos(player.yaw) * 2.5, hx, hz, OBJ_INSET);
  root.position.set(spot ? spot.x : gym.spawn.x, 0, spot ? spot.z : gym.spawn.z);
  setOpacity(root, 0.55);
  objectsRoot.add(root);
  placing = { type, root, fromInventory };
  setStatus(`Beweeg de muis en <b>klik</b> om <b>${def.name}</b> te plaatsen · Esc = annuleren`);
}

function cancelPlacing() {
  if (!placing) return;
  objectsRoot.remove(placing.root);
  placing = null;
  setStatus(null);
}

function finishPlacing() {
  const { type, root, fromInventory } = placing;
  setOpacity(root, 1);
  const entry = { type, root };
  objects.push(entry);
  if (fromInventory) {
    const i = inventory.indexOf(type);
    if (i >= 0) inventory.splice(i, 1);
    updateInventoryUI();
  }
  placing = null;
  setStatus(null);
  select(entry);
  save();
}

// ---------- Muis / touchpad ----------
const raycaster = new THREE.Raycaster();
const pointerNDC = new THREE.Vector2();
const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

function pointerToFloor(e) {
  pointerNDC.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
  raycaster.setFromCamera(pointerNDC, camera);
  const pt = new THREE.Vector3();
  return raycaster.ray.intersectPlane(floorPlane, pt) ? pt : null;
}

function findEntry(e) {
  pointerNDC.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
  raycaster.setFromCamera(pointerNDC, camera);
  // Raycast tegen de hele scène zodat muren en vloeren kliks blokkeren;
  // alleen als het dichtstbijzijnde raakpunt bij een gym-object hoort,
  // selecteren we dat object.
  const hits = raycaster.intersectObjects(scene.children, true);
  if (hits.length === 0) return null;
  let node = hits[0].object;
  while (node && !node.userData.isGymObject) node = node.parent;
  if (!node) return null;
  return objects.find(o => o.root === node) || null;
}

renderer.domElement.addEventListener('pointerdown', e => {
  if (e.button !== 0) return;
  if (placing) {
    finishPlacing();
    return;
  }
  const entry = findEntry(e);
  if (entry) {
    select(entry);
    const pt = pointerToFloor(e);
    if (pt) {
      const gym = gymAt(entry.root.position.x, entry.root.position.z) || GYMS[currentGymId];
      dragging = { entry, offX: entry.root.position.x - pt.x, offZ: entry.root.position.z - pt.z, gym };
      try { renderer.domElement.setPointerCapture(e.pointerId); } catch (err) { /* niet ondersteund: slepen werkt alsnog */ }
    }
  } else {
    select(null);
  }
});

renderer.domElement.addEventListener('pointermove', e => {
  const target = dragging ? dragging.entry.root : (placing ? placing.root : null);
  if (!target) return;
  const pt = pointerToFloor(e);
  if (!pt) return;
  const type = dragging ? dragging.entry.type : placing.type;
  const def = CATALOG[type];
  const { hx, hz } = rotatedHalfExtents(def.w, def.d, target.rotation.y);
  const gym = dragging ? dragging.gym : GYMS[currentGymId];
  const wantX = dragging ? pt.x + dragging.offX : pt.x;
  const wantZ = dragging ? pt.z + dragging.offZ : pt.z;
  const spot = clampToGym(gym, wantX, wantZ, hx, hz, OBJ_INSET);
  if (spot) target.position.set(spot.x, 0, spot.z);
});

renderer.domElement.addEventListener('pointerup', () => {
  if (dragging) { save(); dragging = null; }
});

// Rondkijken met twee vingers op het touchpad (wheel-events)
renderer.domElement.addEventListener('wheel', e => {
  e.preventDefault();
  player.yaw -= e.deltaX * 0.0032;
  player.pitch -= e.deltaY * 0.0032;
  player.pitch = Math.max(-1.25, Math.min(1.25, player.pitch));
}, { passive: false });

// ---------- Toetsenbord ----------
window.addEventListener('keydown', e => {
  if (e.target.tagName === 'SELECT' || e.target.tagName === 'INPUT') return;
  if (e.key.startsWith('Arrow')) e.preventDefault();
  keys[e.code] = true;

  if ((e.code === 'Delete' || e.code === 'Backspace') && selected && !placing) {
    toInventory(selected);
  } else if (e.code === 'KeyR' && (selected || placing)) {
    const root = placing ? placing.root : selected.root;
    const type = placing ? placing.type : selected.type;
    const oldRot = root.rotation.y;
    const newRot = oldRot + Math.PI / 4;
    const def = CATALOG[type];
    const { hx, hz } = rotatedHalfExtents(def.w, def.d, newRot);
    const gym = placing ? GYMS[currentGymId] : (gymAt(root.position.x, root.position.z) || GYMS[currentGymId]);
    const spot = clampToGym(gym, root.position.x, root.position.z, hx, hz, OBJ_INSET);
    if (spot) {
      root.rotation.y = newRot;
      root.position.set(spot.x, 0, spot.z);
      if (!placing) save();
    }
  } else if (e.code === 'KeyT') {
    switchGym();
  } else if (e.code === 'Escape') {
    if (placing) cancelPlacing();
    else select(null);
  }
});
window.addEventListener('keyup', e => { keys[e.code] = false; });

// ---------- Zaal wisselen ----------
function switchGym() {
  currentGymId = currentGymId === 'fitness' ? 'blauw' : 'fitness';
  const gym = GYMS[currentGymId];
  player.x = gym.spawn.x;
  player.z = gym.spawn.z;
  player.yaw = gym.spawn.yaw;
  player.pitch = 0;
  cancelPlacing();
  updateGymLabel();
}

function updateGymLabel() {
  document.getElementById('gymLabel').textContent = 'Je bent in: ' + GYMS[currentGymId].name;
}

// ---------- UI-knoppen ----------
const sel = document.getElementById('catalogSelect');
for (const [type, def] of Object.entries(CATALOG)) {
  const opt = document.createElement('option');
  opt.value = type;
  opt.textContent = def.name;
  sel.appendChild(opt);
}
document.getElementById('addBtn').addEventListener('click', () => startPlacing(sel.value, false));
document.getElementById('switchBtn').addEventListener('click', switchGym);
document.getElementById('planBtn').addEventListener('click', () => {
  const data = objects.map(o => ({
    type: o.type,
    x: o.root.position.x,
    z: o.root.position.z,
    rot: o.root.rotation.y,
  }));
  downloadFloorplan(GYMS, data, inventory, CATALOG);
});
document.getElementById('resetBtn').addEventListener('click', () => {
  if (!confirm('Weet je zeker dat je de indeling wilt terugzetten naar de beginopstelling?')) return;
  cancelPlacing();
  select(null);
  objects.forEach(o => objectsRoot.remove(o.root));
  objects = [];
  inventory = [];
  DEFAULT_LAYOUT.forEach(o => spawnObject(o.type, o.x, o.z, o.rot || 0));
  updateInventoryUI();
  save();
});

// ---------- Loop ----------
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);

  const fwd = (keys.ArrowUp || keys.KeyW ? 1 : 0) - (keys.ArrowDown || keys.KeyS ? 1 : 0);
  const strafe = (keys.ArrowRight || keys.KeyD ? 1 : 0) - (keys.ArrowLeft || keys.KeyA ? 1 : 0);
  if (fwd || strafe) {
    const speed = (keys.ShiftLeft || keys.ShiftRight ? 5.5 : 3.0) * dt;
    const fx = -Math.sin(player.yaw), fz = -Math.cos(player.yaw);
    const rx = -fz, rz = fx;
    const nx = player.x + (fx * fwd + rx * strafe) * speed;
    const nz = player.z + (fz * fwd + rz * strafe) * speed;
    const spot = clampToGym(GYMS[currentGymId], nx, nz, 0.25, 0.25, WALL_T / 2 + 0.05);
    if (spot) { player.x = spot.x; player.z = spot.z; }
  }

  camera.position.set(player.x, EYE, player.z);
  camera.rotation.y = player.yaw;
  camera.rotation.x = player.pitch;

  renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Debug-hooks voor tests
window.__shot = (w = 480) => {
  camera.position.set(player.x, EYE, player.z);
  camera.rotation.y = player.yaw;
  camera.rotation.x = player.pitch;
  renderer.render(scene, camera);
  const src = renderer.domElement;
  const cv = document.createElement('canvas');
  cv.width = w;
  cv.height = Math.round(w * src.height / src.width);
  cv.getContext('2d').drawImage(src, 0, 0, cv.width, cv.height);
  return cv.toDataURL('image/jpeg', 0.5);
};
window.__probe = (x, y) => {
  pointerNDC.set((x / window.innerWidth) * 2 - 1, -(y / window.innerHeight) * 2 + 1);
  raycaster.setFromCamera(pointerNDC, camera);
  const hits = raycaster.intersectObjects(objectsRoot.children, true);
  return {
    cam: { x: camera.position.x, y: camera.position.y, z: camera.position.z, yaw: camera.rotation.y },
    canvas: { w: renderer.domElement.clientWidth, h: renderer.domElement.clientHeight, iw: window.innerWidth, ih: window.innerHeight },
    firstHit: hits.length ? { dist: hits[0].distance, pt: hits[0].point } : null,
  };
};
window.__debug = () => ({
  selected: selected ? selected.type : null,
  placing: placing ? placing.type : null,
  objects: objects.length,
  inventory: [...inventory],
  gym: currentGymId,
});

// ---------- Start ----------
load();
updateInventoryUI();
updateGymLabel();
animate();
