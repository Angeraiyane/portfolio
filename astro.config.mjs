// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // Le bilingue : le français est la langue par défaut (adresse "/"),
  // l'anglais vit sous "/en/". Astro s'en sert pour construire les bonnes adresses.
  i18n: {
    defaultLocale: 'fr',
    locales: ['fr', 'en'],
    routing: { prefixDefaultLocale: false },   // pas de "/fr/" : le français reste à la racine
  },
});
