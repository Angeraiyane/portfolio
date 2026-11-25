/* ==========================================================================
   content.config.ts — la "base de données" de nos projets
   --------------------------------------------------------------------------
   Chaque projet est un fichier Markdown (.md) dans src/content/projects/fr/
   ou src/content/projects/en/. En haut de chaque fichier, entre des "---",
   il y a des champs (titre, badge, tags...) : c'est le "frontmatter".
   Le "schema" ci-dessous vérifie ces champs au moment du build : si tu oublies
   un titre ou tapes un mauvais type, Astro t'arrête avec un message clair.
   ========================================================================== */
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const projects = defineCollection({
  // On lit tous les fichiers .md du dossier, sous-dossiers fr/ et en/ compris
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    // l'adresse : /projets/<page>. (Le nom "slug" est réservé par Astro : il servirait
    // d'identifiant unique, et le français écraserait l'anglais. D'où "page".)
    page: z.string(),
    lang: z.enum(['fr', 'en']),
    title: z.string(),
    summary: z.string(),                    // 2 lignes pour la carte
    badge: z.string(),                      // le chiffre ou mot-clé doré
    kicker: z.string(),                     // la petite ligne au-dessus du titre
    tags: z.array(z.string()),
    github: z.string().url().optional(),    // pas de lien = pas de bouton GitHub
    featured: z.boolean().default(false),   // projet vedette = grande carte + page dédiée
    order: z.number(),                      // ordre d'affichage
    plane: z.boolean().default(false),      // le petit avion (SkyNet uniquement)
    // la gemme du projet : sa couleur sert d'accent (chiffre, titre au survol, petite pierre)
    gem: z.enum(['lapis', 'sapphire', 'emerald', 'ruby', 'amethyst', 'citrine']).default('lapis'),
  }),
});

export const collections = { projects };
