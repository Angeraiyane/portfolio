/* ==========================================================================
   gem-material.ts — notre shader de gemme (le cœur du réalisme)
   --------------------------------------------------------------------------
   Un shader est un petit programme exécuté par la carte graphique pour
   CHAQUE pixel. Pour chaque pixel d'une pierre, on calcule :
     a) le reflet : le regard rebondit comme sur un miroir et lit le "studio" ;
     b) la réfraction : le regard entre dans la pierre et se tord (refract()).
        On le fait 3 fois avec un indice un peu différent pour le rouge,
        le vert et le bleu : les couleurs se séparent = la dispersion ;
     c) un rebond interne, qui crée les éclats ;
     d) la teinte : la lumière qui traverse prend la couleur de la pierre ;
     e) Fresnel : vue de biais, une surface reflète davantage.
   ========================================================================== */
import * as THREE from 'three';
import type { Gem } from './gems';

const vertexShader = /* glsl */ `
  varying vec3 vWorldPos;
  varying vec3 vNormal;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorldPos = world.xyz;
    vNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * world;
  }`;

const fragmentShader = /* glsl */ `
  uniform samplerCube envMap;
  uniform vec3 tint;
  uniform float ior;
  uniform float spread;
  uniform float cloudy;
  uniform float brightness;
  uniform float contrast;
  uniform float dim;       // 1 = pleine lumière, 0.3 = pierre discrète (derrière le texte)
  varying vec3 vWorldPos;
  varying vec3 vNormal;

  vec3 through(vec3 V, vec3 N, float n) {
    vec3 inDir = refract(V, N, 1.0 / n);
    vec3 bounce = reflect(inDir, -N);
    return mix(textureCube(envMap, inDir).rgb, textureCube(envMap, bounce).rgb, 0.55);
  }

  void main() {
    vec3 V = normalize(vWorldPos - cameraPosition);
    vec3 N = normalize(vNormal);
    if (dot(V, N) > 0.0) N = -N;

    vec3 inside = vec3(
      through(V, N, ior - spread).r,
      through(V, N, ior).g,
      through(V, N, ior + spread).b
    );
    inside = pow(inside, vec3(contrast)) * brightness * tint;
    inside = mix(inside, tint * 0.55, cloudy);

    vec3 refl = textureCube(envMap, reflect(V, N)).rgb;
    float f0 = pow((ior - 1.0) / (ior + 1.0), 2.0);
    float fresnel = f0 + (1.0 - f0) * pow(1.0 - max(dot(-V, N), 0.0), 5.0);

    gl_FragColor = vec4(mix(inside, refl, fresnel) * dim, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }`;

export function createGemMaterial(gem: Gem, envMap: THREE.Texture, dim = 1) {
  return new THREE.ShaderMaterial({
    uniforms: {
      envMap: { value: envMap },
      tint: { value: new THREE.Color(gem.tint) },
      ior: { value: gem.ior },
      spread: { value: gem.spread },
      cloudy: { value: gem.cloudy ?? 0 },
      brightness: { value: gem.brightness ?? 1.6 },
      contrast: { value: gem.contrast ?? 1.4 },
      dim: { value: dim },
    },
    vertexShader,
    fragmentShader,
  });
}
