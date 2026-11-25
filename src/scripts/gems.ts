/* ==========================================================================
   gems.ts — le catalogue des pierres et leurs tailles (formes 3D)
   ========================================================================== */
import * as THREE from 'three';

/* --------------------------------------------------------------------------
   1. LES TAILLES
   On dessine le profil d'une pierre (une demi-silhouette) puis on le fait
   tourner autour de l'axe vertical, comme un potier : c'est la LatheGeometry.
   Le nombre de segments donne le nombre de côtés, donc les facettes.
   toNonIndexed() + computeVertexNormals() : chaque facette garde sa propre
   orientation, d'où des facettes bien nettes.
   -------------------------------------------------------------------------- */
type Profile = [number, number][];   // liste de points [rayon, hauteur]

function lathe(points: Profile, segments: number, opts: { phi?: number; sx?: number; sz?: number } = {}) {
  const { phi = 0, sx = 1, sz = 1 } = opts;
  let g: THREE.BufferGeometry = new THREE.LatheGeometry(points.map(([r, y]) => new THREE.Vector2(r, y)), segments, phi);
  g.scale(sx, 1, sz);
  g = g.toNonIndexed();
  g.computeVertexNormals();
  return g;
}

const brilliant: Profile = [[0, -1], [1, -0.08], [1, 0.04], [0.82, 0.28], [0.55, 0.42], [0, 0.42]];

// On crée chaque forme une seule fois ("lazy") et on la réutilise pour toutes les pierres.
const cache = new Map<string, THREE.BufferGeometry>();
const builders: Record<string, () => THREE.BufferGeometry> = {
  brilliant: () => lathe(brilliant, 16),                                   // diamant
  oval: () => lathe(brilliant, 16, { sx: 1.35, sz: 0.95 }),                // rubis, saphir
  emerald: () => lathe([[0, -0.62], [0.4, -0.55], [0.75, -0.36], [1, -0.1], [1, 0.02], [0.9, 0.16], [0.78, 0.28], [0, 0.28]], 8, { phi: Math.PI / 8, sx: 1.5 }),
  crystal: () => lathe([[0, -1.05], [0.5, -1.05], [0.5, 0.45], [0, 1.15]], 6),   // pointe de quartz
  bipyramid: () => lathe([[0, -1], [0.6, -0.45], [0.6, 0.45], [0, 1]], 6),        // cristal de corindon
  prism: () => lathe([[0, -1], [0.55, -1], [0.55, 1], [0, 1]], 6),                // prisme de béryl
  cushion: () => lathe(brilliant, 8, { phi: Math.PI / 8 }),                // coussin
  trillion: () => lathe(brilliant, 3, { phi: Math.PI / 6, sx: 1.15, sz: 1.15 }), // triangle
  pear: () => {                                                             // poire : on resserre une extrémité
    const g = lathe(brilliant, 16, { sx: 1.4 });
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i);
      if (x > 0) p.setZ(i, p.getZ(i) * (1 - 0.6 * (x / 1.4)));
    }
    g.computeVertexNormals();
    return g;
  },
  tumbled: () => {                                                          // galet poli
    const g = new THREE.IcosahedronGeometry(1, 3);
    const p = g.attributes.position, v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i);
      v.multiplyScalar(1 + 0.08 * Math.sin(v.x * 3.1) * Math.cos(v.y * 2.7 + v.z * 1.9));
      p.setXYZ(i, v.x * 1.15, v.y * 0.78, v.z);
    }
    g.computeVertexNormals();
    return g;
  },
};

export function getShape(name: string) {
  if (!cache.has(name)) cache.set(name, builders[name]());
  return cache.get(name)!;
}

/* --------------------------------------------------------------------------
   2. LE CATALOGUE
   tint = couleur, ior = indice de réfraction réel, spread = dispersion,
   cloudy = aspect laiteux, brightness/contrast = réglages de rendu.
   -------------------------------------------------------------------------- */
export interface Gem {
  id: string;
  name: { fr: string; en: string };
  formula: string;
  shape: string;
  tint: string;
  ior: number;
  spread: number;
  cloudy?: number;
  brightness?: number;
  contrast?: number;
}

export const GEMS: Record<string, Gem> = {
  ruby:       { id: 'ruby',       name: { fr: 'Rubis', en: 'Ruby' },               formula: 'Al₂O₃ : Cr³⁺',       shape: 'oval',      tint: '#ff1a3c', ior: 1.77, spread: 0.02 },
  sapphire:   { id: 'sapphire',   name: { fr: 'Saphir', en: 'Sapphire' },          formula: 'Al₂O₃ : Fe, Ti',     shape: 'oval',      tint: '#2a5cff', ior: 1.77, spread: 0.02 },
  emerald:    { id: 'emerald',    name: { fr: 'Émeraude', en: 'Emerald' },         formula: 'Be₃Al₂Si₆O₁₈ : Cr',  shape: 'emerald',   tint: '#14c47a', ior: 1.58, spread: 0.012 },
  amethyst:   { id: 'amethyst',   name: { fr: 'Améthyste', en: 'Amethyst' },       formula: 'SiO₂ : Fe',          shape: 'crystal',   tint: '#9a4dff', ior: 1.54, spread: 0.012 },
  roseQuartz: { id: 'roseQuartz', name: { fr: 'Quartz rose', en: 'Rose quartz' },  formula: 'SiO₂',               shape: 'tumbled',   tint: '#ffb3c6', ior: 1.54, spread: 0.006, cloudy: 0.45, brightness: 1.3 },
  diamond:    { id: 'diamond',    name: { fr: 'Diamant', en: 'Diamond' },          formula: 'C',                  shape: 'brilliant', tint: '#eef3ff', ior: 2.42, spread: 0.06, brightness: 1.25, contrast: 2.6 },
  aquamarine: { id: 'aquamarine', name: { fr: 'Aigue-marine', en: 'Aquamarine' },  formula: 'Be₃Al₂Si₆O₁₈ : Fe²⁺', shape: 'pear',      tint: '#7fdcf0', ior: 1.58, spread: 0.012, brightness: 1.4, contrast: 1.6 },
  citrine:    { id: 'citrine',    name: { fr: 'Citrine', en: 'Citrine' },          formula: 'SiO₂ : Fe³⁺',        shape: 'cushion',   tint: '#ffb02e', ior: 1.54, spread: 0.012, brightness: 1.5 },
  // Minéraux BRUTS : incolores et laiteux, ils attendent leur impureté colorante.
  corundum:   { id: 'corundum',   name: { fr: 'Corindon', en: 'Corundum' },        formula: 'Al₂O₃',              shape: 'bipyramid', tint: '#c3c9d4', ior: 1.77, spread: 0.01, cloudy: 0.5, brightness: 1.2 },
  beryl:      { id: 'beryl',      name: { fr: 'Béryl', en: 'Beryl' },              formula: 'Be₃Al₂Si₆O₁₈',       shape: 'prism',     tint: '#d6e6da', ior: 1.58, spread: 0.008, cloudy: 0.5, brightness: 1.2 },
  quartz:     { id: 'quartz',     name: { fr: 'Quartz', en: 'Quartz' },            formula: 'SiO₂',               shape: 'crystal',   tint: '#e6eaf2', ior: 1.54, spread: 0.008, cloudy: 0.3, brightness: 1.3 },
  peridot:    { id: 'peridot',    name: { fr: 'Péridot', en: 'Peridot' },          formula: '(Mg,Fe)₂SiO₄',       shape: 'trillion',  tint: '#b4e03c', ior: 1.67, spread: 0.016, brightness: 1.5 },
};

/* --------------------------------------------------------------------------
   3. LES "INGRÉDIENTS" : éléments chimiques et conditions physiques
   Ce sont eux qu'on glisse sur un minéral brut pour le colorer ou le transformer.
   -------------------------------------------------------------------------- */
export interface Element {
  id: string;
  symbol: string;                       // ce qui est écrit sur la pastille
  name: { fr: string; en: string };
  detail: { fr: string; en: string };   // affiché au survol
}

export const ELEMENTS: Record<string, Element> = {
  Cr:   { id: 'Cr',   symbol: 'Cr', name: { fr: 'Chrome', en: 'Chromium' }, detail: { fr: 'Métal de transition', en: 'Transition metal' } },
  Fe:   { id: 'Fe',   symbol: 'Fe', name: { fr: 'Fer', en: 'Iron' },        detail: { fr: 'Métal de transition', en: 'Transition metal' } },
  Ti:   { id: 'Ti',   symbol: 'Ti', name: { fr: 'Titane', en: 'Titanium' }, detail: { fr: 'Métal de transition', en: 'Transition metal' } },
  C:    { id: 'C',    symbol: 'C',  name: { fr: 'Carbone', en: 'Carbon' },  detail: { fr: 'Non-métal', en: 'Non-metal' } },
  heat: { id: 'heat', symbol: 'Δ',  name: { fr: 'Chaleur', en: 'Heat' },    detail: { fr: '≈ 450 °C', en: '≈ 450 °C' } },
  pressure: { id: 'pressure', symbol: 'P', name: { fr: 'Pression', en: 'Pressure' }, detail: { fr: '≈ 5 GPa, comme à 150 km de profondeur', en: '≈ 5 GPa, as deep as 150 km' } },
};

/* --------------------------------------------------------------------------
   4. LES RECETTES (de la vraie chimie)
   La plupart des gemmes colorées sont un minéral incolore + quelques atomes
   "intrus" qui absorbent certaines couleurs de la lumière.
   L'ordre ne compte pas : on trie les deux ingrédients pour former la clé.
   -------------------------------------------------------------------------- */
const RECIPES: Record<string, string> = {
  'Cr+corundum': 'ruby',        // corindon + chrome  -> rubis
  'Fe+corundum': 'sapphire',    // corindon + fer     -> saphir
  'Ti+corundum': 'sapphire',    // corindon + titane  -> saphir
  'Cr+beryl': 'emerald',        // béryl + chrome     -> émeraude
  'Fe+beryl': 'aquamarine',     // béryl + fer        -> aigue-marine
  'Fe+quartz': 'amethyst',      // quartz + fer       -> améthyste
  'amethyst+heat': 'citrine',   // améthyste chauffée -> citrine
  'C+pressure': 'diamond',      // carbone + pression -> diamant
};

/** Renvoie l'identifiant de la gemme obtenue en combinant a et b, ou null. */
export function recipeFor(a: string, b: string): string | null {
  const key = [a, b].sort().join('+');
  return RECIPES[key] ?? null;
}
