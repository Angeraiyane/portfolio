/* ==========================================================================
   gem-scene.ts — la scène 3D de l'accueil et le jeu de fusion
   --------------------------------------------------------------------------
   Un <canvas> fixe derrière toute la page. On y dessine :
     - des gemmes et des minéraux bruts en 3D (notre shader), qui flottent ;
     - des pastilles dorées : éléments chimiques (Cr, Fe, Ti, C) et
       conditions physiques (chaleur, pression) ;
     - de la poussière scintillante.
   À la souris, on peut tout déplacer. Lâcher un ingrédient sur un minéral
   compatible le transforme en gemme (ex. corindon + chrome = rubis).
   La scène s'efface quand on fait défiler la page vers le bas.
   ========================================================================== */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { GEMS, ELEMENTS, getShape, recipeFor } from './gems';
import { createGemMaterial } from './gem-material';

type Lang = 'fr' | 'en';

/* --------------------------------------------------------------------------
   1. LA DISPOSITION
   x et y vont de -1 (gauche / bas) à 1 (droite / haut) de l'écran.
   kind 'gem' = pierre 3D, kind 'element' = pastille dorée.
   dim < 1 : pierre atténuée, placée derrière le texte.
   -------------------------------------------------------------------------- */
interface Slot { kind: 'gem' | 'element'; id: string; x: number; y: number; size: number; dim?: number }

const DESKTOP: Slot[] = [
  // Minéraux bruts : la matière première du jeu (à droite, là où il n'y a pas de texte)
  { kind: 'gem', id: 'corundum', x: 0.42, y: 0.40, size: 0.28 },
  { kind: 'gem', id: 'beryl',    x: 0.84, y: 0.08, size: 0.26 },
  { kind: 'gem', id: 'quartz',   x: 0.50, y: -0.44, size: 0.26 },
  // Quelques gemmes déjà formées, pour l'ambiance
  { kind: 'gem', id: 'diamond',  x: 0.90, y: 0.66, size: 0.18 },
  { kind: 'gem', id: 'emerald',  x: 0.88, y: -0.66, size: 0.18 },
  { kind: 'gem', id: 'citrine',  x: 0.64, y: 0.80, size: 0.14 },
  // Pierres discrètes derrière le texte (on ne peut pas les déplacer)
  { kind: 'gem', id: 'roseQuartz', x: -0.80, y: 0.60, size: 0.20, dim: 0.3 },
  { kind: 'gem', id: 'peridot',  x: -0.44, y: -0.72, size: 0.16, dim: 0.3 },
  { kind: 'gem', id: 'sapphire', x: -0.92, y: -0.20, size: 0.14, dim: 0.3 },
  // Les ingrédients
  { kind: 'element', id: 'Cr',       x: 0.64, y: 0.24,  size: 0.14 },
  { kind: 'element', id: 'Fe',       x: 0.68, y: -0.18, size: 0.14 },
  { kind: 'element', id: 'Ti',       x: 0.30, y: 0.04,  size: 0.14 },
  { kind: 'element', id: 'heat',     x: 0.94, y: 0.36,  size: 0.14 },
  { kind: 'element', id: 'C',        x: 0.30, y: -0.78, size: 0.14 },
  { kind: 'element', id: 'pressure', x: 0.46, y: 0.74,  size: 0.14 },
];

// Sur téléphone : le texte occupe tout l'écran, donc peu de pierres, discrètes, et pas de jeu.
const MOBILE: Slot[] = [
  { kind: 'gem', id: 'ruby',     x: 0.62, y: 0.72,  size: 0.26, dim: 0.5 },
  { kind: 'gem', id: 'emerald',  x: -0.60, y: -0.70, size: 0.24, dim: 0.4 },
  { kind: 'gem', id: 'sapphire', x: 0.70, y: -0.40, size: 0.22, dim: 0.4 },
  { kind: 'gem', id: 'amethyst', x: -0.70, y: 0.62, size: 0.20, dim: 0.35 },
  { kind: 'gem', id: 'diamond',  x: 0.10, y: -0.88, size: 0.18, dim: 0.4 },
];

// Un seul bouton pour la taille de TOUS les objets : 1 = tailles du tableau, 0.75 = 25 % plus petit.
const SIZE_SCALE = 0.75;

const MAX_CREATIONS = 6;     // au-delà, la plus ancienne gemme créée disparaît
const RESPAWN_DELAY = 8;     // secondes avant le retour d'un ingrédient consommé

export async function initGemScene(canvas: HTMLCanvasElement, tooltip: HTMLElement, lang: Lang) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  await document.fonts.ready;   // on attend la police Martian Mono pour écrire sur les pastilles

  /* ---- 2. Moteur de rendu, scène, caméra ---- */
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#06070b');

  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.z = 10;

  /* ---- 3. Le "studio photo" que les pierres reflètent (photographié à 360°) ---- */
  const cubeTarget = new THREE.WebGLCubeRenderTarget(256);
  new THREE.CubeCamera(0.1, 50, cubeTarget).update(renderer, new RoomEnvironment());
  const envMap = cubeTarget.texture;

  /* ---- 4. La poussière scintillante (un mini-shader par point) ---- */
  const DUST = 420;
  const dustPos = new Float32Array(DUST * 3);
  const dustPhase = new Float32Array(DUST);
  for (let i = 0; i < DUST; i++) {
    dustPos[i * 3] = (Math.random() - 0.5) * 24;
    dustPos[i * 3 + 1] = (Math.random() - 0.5) * 14;
    dustPos[i * 3 + 2] = -2 - Math.random() * 8;
    dustPhase[i] = Math.random() * Math.PI * 2;
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  dustGeo.setAttribute('phase', new THREE.BufferAttribute(dustPhase, 1));
  const dustMat = new THREE.ShaderMaterial({
    uniforms: { time: { value: 0 }, pixelRatio: { value: 1 } },
    vertexShader: /* glsl */ `
      attribute float phase;
      uniform float time;
      uniform float pixelRatio;
      varying float vAlpha;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vAlpha = 0.25 + 0.75 * pow(0.5 + 0.5 * sin(time * 1.3 + phase * 3.0), 6.0); // éclats brefs
        gl_PointSize = (1.2 + 2.0 * vAlpha) * pixelRatio;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      varying float vAlpha;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        if (d > 0.5) discard;                       // points ronds, pas carrés
        gl_FragColor = vec4(vec3(0.85, 0.88, 1.0), vAlpha * (1.0 - d * 2.0));
      }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  scene.add(new THREE.Points(dustGeo, dustMat));

  /* ---- 5. Les pastilles dorées des éléments ----
     On dessine le symbole sur un petit <canvas> 2D, qui devient une texture.
     Un "Sprite" est une image plate toujours tournée vers la caméra. */
  const elementTextures = new Map<string, THREE.Texture>();
  function elementTexture(symbol: string) {
    if (elementTextures.has(symbol)) return elementTextures.get(symbol)!;
    const size = 256, c = document.createElement('canvas');
    c.width = c.height = size;
    const g = c.getContext('2d')!;
    const glow = g.createRadialGradient(size / 2, size / 2, size * 0.2, size / 2, size / 2, size / 2);
    glow.addColorStop(0, 'rgba(201,165,74,0.25)');
    glow.addColorStop(1, 'rgba(201,165,74,0)');
    g.fillStyle = glow; g.fillRect(0, 0, size, size);                       // halo doré
    g.beginPath(); g.arc(size / 2, size / 2, size * 0.3, 0, Math.PI * 2);
    g.fillStyle = 'rgba(14,17,26,0.85)'; g.fill();
    g.lineWidth = 5; g.strokeStyle = '#c9a54a'; g.stroke();                 // anneau doré
    g.fillStyle = '#e6c773'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = `400 ${symbol.length > 1 ? 62 : 72}px "Martian Mono", monospace`;
    g.fillText(symbol, size / 2, size / 2 + 4);                             // le symbole
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    elementTextures.set(symbol, tex);
    return tex;
  }

  /* ---- 6. Les objets de la scène ---- */
  interface Item {
    obj: THREE.Object3D;
    kind: 'gem' | 'element';
    id: string;
    home: THREE.Vector2;          // position de repos (coordonnées -1..1)
    size: number;
    dim: number;
    phase: number; spin: number;  // pour le flottement et la rotation
    hover: number;                // 0 -> 1 : effet de survol progressif
    pop: number;                  // 0 -> 1 : animation d'apparition
    slot?: Slot;                  // l'emplacement d'origine (pour réapparaître)
    createdAt?: number;           // si c'est une gemme créée par le joueur
  }
  let items: Item[] = [];
  let layout: Slot[] | null = null;
  const respawns: { slot: Slot; at: number }[] = [];

  function spawn(slot: Slot, opts: { pop?: boolean; createdAt?: number } = {}): Item {
    let obj: THREE.Object3D;
    if (slot.kind === 'gem') {
      const gem = GEMS[slot.id];
      obj = new THREE.Mesh(getShape(gem.shape), createGemMaterial(gem, envMap, slot.dim ?? 1));
      obj.rotation.set(0.4 + Math.random() * 0.4, Math.random() * Math.PI, Math.random() * 0.3);
    } else {
      obj = new THREE.Sprite(new THREE.SpriteMaterial({
        map: elementTexture(ELEMENTS[slot.id].symbol), transparent: true, depthWrite: false, toneMapped: false,
      }));
    }
    const item: Item = {
      obj, kind: slot.kind, id: slot.id, home: new THREE.Vector2(slot.x, slot.y),
      size: slot.size, dim: slot.dim ?? 1, phase: Math.random() * Math.PI * 2,
      spin: 0.15 + Math.random() * 0.25, hover: 0, pop: opts.pop && !reduceMotion ? 0 : 1,
      slot: opts.createdAt === undefined ? slot : undefined, createdAt: opts.createdAt,
    };
    obj.position.set(slot.x * halfW, slot.y * halfH, 0);
    obj.userData.item = item;
    scene.add(obj);
    items.push(item);
    return item;
  }

  function remove(item: Item) {
    scene.remove(item.obj);
    if (item.obj instanceof THREE.Mesh) (item.obj.material as THREE.Material).dispose();
    if (item.obj instanceof THREE.Sprite) item.obj.material.dispose();
    items = items.filter((i) => i !== item);
  }

  function buildLayout(slots: Slot[]) {
    [...items].forEach(remove);
    respawns.length = 0;
    slots.forEach((s) => spawn(s));
  }

  /* ---- 7. Taille de l'écran ---- */
  let halfW = 1, halfH = 1, unit = 1, mobile = false;
  function resize() {
    const w = window.innerWidth, h = window.innerHeight;
    mobile = w / h < 0.8 || w < 640;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1 : 1.5)); // économiser la batterie
    renderer.setSize(w, h, false);
    dustMat.uniforms.pixelRatio.value = renderer.getPixelRatio();
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    // Demi-hauteur visible à la distance de la caméra : tan(angle/2) × distance
    halfH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
    halfW = halfH * camera.aspect;
    unit = halfH / 3.15;        // les objets suivent la taille de l'écran
    const wanted = mobile ? MOBILE : DESKTOP;
    if (wanted !== layout) { layout = wanted; buildLayout(wanted); }
  }
  window.addEventListener('resize', resize);
  resize();

  // Rayon de collision d'un objet, en unités 3D
  const radius = (i: Item) => i.size * SIZE_SCALE * unit * (i.kind === 'gem' ? 1.1 : 1);

  /* ---- 8. Le pointeur : survol et glisser-déposer ----
     Le "raycaster" lance un rayon depuis la caméra à travers le pointeur
     et renvoie les objets 3D qu'il traverse. */
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2(9, 9);              // hors écran au départ
  const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0); // le plan z = 0 où vivent les objets
  const dragPoint = new THREE.Vector3();
  let dragging: Item | null = null;
  let fade = 1;

  function pick(): Item | undefined {
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(items.map((i) => i.obj))[0];
    return hit?.object.userData.item;
  }
  const isInteractive = (i?: Item) => !!i && i.dim >= 1;   // les pierres atténuées ne se déplacent pas

  window.addEventListener('pointermove', (e) => {
    pointer.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
    if (dragging) {
      raycaster.setFromCamera(pointer, camera);
      raycaster.ray.intersectPlane(plane, dragPoint);    // où le pointeur touche le plan z = 0
    }
  });
  window.addEventListener('pointerleave', () => pointer.set(9, 9));

  window.addEventListener('pointerdown', (e) => {
    if (mobile || fade < 0.6 || e.button !== 0 || e.pointerType === 'touch') return;
    // On ne vole jamais le clic d'un lien, d'un bouton ou d'un champ
    if ((e.target as HTMLElement).closest('a, button, input, textarea, select, label')) return;
    const hit = pick();
    if (!isInteractive(hit)) return;
    e.preventDefault();                                   // évite de sélectionner le texte en glissant
    dragging = hit!;
    dragPoint.copy(dragging.obj.position);
    document.documentElement.style.cursor = 'grabbing';
  });

  window.addEventListener('pointerup', () => {
    if (!dragging) return;
    const item = dragging;
    dragging = null;
    document.documentElement.style.cursor = '';
    const partner = findPartner(item);
    if (partner) fuse(item, partner);
    else item.home.set(item.obj.position.x / halfW, item.obj.position.y / halfH); // reste où on l'a lâché
  });

  // Un objet compatible est-il assez proche de celui qu'on tient ?
  function findPartner(item: Item) {
    return items.find((other) =>
      other !== item && isInteractive(other) &&
      recipeFor(item.id, other.id) &&
      other.obj.position.distanceTo(item.obj.position) < (radius(item) + radius(other)) * 1.1
    );
  }

  /* ---- 9. La fusion ---- */
  let result: { item: Item; until: number; from: string } | null = null;
  const bursts: { points: THREE.Points; age: number; vel: Float32Array }[] = [];
  let now = 0;

  function fuse(a: Item, b: Item) {
    const productId = recipeFor(a.id, b.id)!;
    const where = b.kind === 'gem' ? b.obj.position.clone() : a.obj.position.clone();
    // Les ingrédients d'origine reviendront plus tard, pour pouvoir rejouer
    [a, b].forEach((i) => { if (i.slot) respawns.push({ slot: i.slot, at: now + RESPAWN_DELAY }); remove(i); });

    const product = spawn(
      { kind: 'gem', id: productId, x: where.x / halfW, y: where.y / halfH, size: 0.30 },
      { pop: true, createdAt: now }
    );
    // Trop de créations ? On retire la plus ancienne.
    const created = items.filter((i) => i.createdAt !== undefined).sort((x, y) => x.createdAt! - y.createdAt!);
    if (created.length > MAX_CREATIONS) remove(created[0]);

    const nameOf = (i: Item) => (i.kind === 'gem' ? GEMS[i.id].name[lang] : ELEMENTS[i.id].name[lang]);
    result = { item: product, until: now + 3, from: `${nameOf(b)} + ${nameOf(a)}` };
    burst(where);
  }

  // Une gerbe d'étincelles dorées qui s'écartent puis s'éteignent
  function burst(at: THREE.Vector3) {
    if (reduceMotion) return;
    const n = 40, pos = new Float32Array(n * 3), vel = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      pos.set([at.x, at.y, at.z], i * 3);
      const a = Math.random() * Math.PI * 2, s = 0.6 + Math.random() * 1.4;
      vel.set([Math.cos(a) * s, Math.sin(a) * s, (Math.random() - 0.5) * 0.5], i * 3);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const points = new THREE.Points(geo, new THREE.PointsMaterial({
      color: '#e6c773', size: 0.05, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    }));
    scene.add(points);
    bursts.push({ points, age: 0, vel });
  }

  /* ---- 10. L'étiquette (survol ou résultat d'une fusion) ---- */
  const tipName = tooltip.querySelector<HTMLElement>('[data-name]')!;
  const tipFormula = tooltip.querySelector<HTMLElement>('[data-formula]')!;
  const tipRecipe = tooltip.querySelector<HTMLElement>('[data-recipe]')!;
  const screenPos = new THREE.Vector3();

  function showTip(item: Item, recipe?: string) {
    if (item.kind === 'gem') {
      tipName.textContent = (recipe ? '✦ ' : '') + GEMS[item.id].name[lang];
      tipFormula.textContent = GEMS[item.id].formula;
    } else {
      tipName.textContent = ELEMENTS[item.id].name[lang];
      tipFormula.textContent = ELEMENTS[item.id].detail[lang];
    }
    tipRecipe.textContent = recipe ?? '';
    tipRecipe.hidden = !recipe;
    // Position 3D -> pixels à l'écran
    screenPos.copy(item.obj.position).project(camera);
    tooltip.style.left = `${((screenPos.x + 1) / 2) * window.innerWidth}px`;
    tooltip.style.top = `${((1 - screenPos.y) / 2) * window.innerHeight}px`;
    tooltip.hidden = false;
  }

  function updatePointerFeedback() {
    const hovered = fade > 0.6 && !dragging ? pick() : undefined;
    // Pendant un glisser, on met en valeur le partenaire compatible le plus proche
    const target = dragging ? findPartner(dragging) : hovered;
    items.forEach((i) => { i.hover += ((i === target || i === dragging ? 1 : 0) - i.hover) * 0.15; });

    if (!dragging) document.documentElement.style.cursor = isInteractive(hovered) && !mobile ? 'grab' : '';

    if (result && now < result.until && items.includes(result.item)) showTip(result.item, result.from);
    else if (hovered && !dragging) showTip(hovered);
    else tooltip.hidden = true;
  }

  /* ---- 11. La boucle d'animation (~60 fois par seconde) ---- */
  const timer = new THREE.Timer();   // mesure le temps entre deux images
  const target = new THREE.Vector3();
  const easeOutBack = (x: number) => 1 + 2.7 * Math.pow(x - 1, 3) + 1.7 * Math.pow(x - 1, 2); // dépasse un peu puis revient

  renderer.setAnimationLoop((timestamp) => {
    timer.update(timestamp);
    // Plus on descend dans la page, plus la scène s'efface (1 en haut, 0 après un écran)
    fade = THREE.MathUtils.clamp(1 - window.scrollY / (window.innerHeight * 0.9), 0, 1);
    canvas.style.opacity = String(fade);
    const dt = reduceMotion ? 0 : Math.min(timer.getDelta(), 0.05);
    if (fade === 0) { tooltip.hidden = true; return; }   // invisible : on ne calcule rien
    now = timer.getElapsed();
    const t = reduceMotion ? 0 : now;
    dustMat.uniforms.time.value = t;

    // Ingrédients consommés qui reviennent
    for (let i = respawns.length - 1; i >= 0; i--) {
      if (now >= respawns[i].at) { spawn(respawns[i].slot, { pop: true }); respawns.splice(i, 1); }
    }

    for (const it of items) {
      if (it === dragging) {
        it.obj.position.lerp(dragPoint, 0.5);                       // suit le pointeur
      } else {
        target.set(
          it.home.x * halfW + Math.sin(t * 0.35 + it.phase) * 0.1,
          it.home.y * halfH + Math.sin(t * 0.5 + it.phase * 1.7) * 0.14, // flottement
          0
        );
        it.obj.position.lerp(target, 0.08);                         // glisse doucement vers sa place
      }
      if (it.kind === 'gem') it.obj.rotation.y += dt * it.spin * (1 - it.hover * 0.8);
      it.pop = Math.min(1, it.pop + dt * 2.2);
      const base = it.size * SIZE_SCALE * unit * (it.kind === 'element' ? 2.2 : 1);
      it.obj.scale.setScalar(base * easeOutBack(it.pop) * (1 + it.hover * 0.18));
    }

    // Étincelles des fusions
    for (let i = bursts.length - 1; i >= 0; i--) {
      const b = bursts[i];
      b.age += dt;
      const pos = b.points.geometry.attributes.position as THREE.BufferAttribute;
      for (let k = 0; k < pos.count; k++) {
        pos.setXYZ(k, pos.getX(k) + b.vel[k * 3] * dt, pos.getY(k) + b.vel[k * 3 + 1] * dt, pos.getZ(k));
      }
      pos.needsUpdate = true;
      (b.points.material as THREE.PointsMaterial).opacity = 1 - b.age;
      if (b.age >= 1) { scene.remove(b.points); b.points.geometry.dispose(); bursts.splice(i, 1); }
    }

    updatePointerFeedback();
    renderer.render(scene, camera);
  });
}
