/* ==========================================================================
   profile.ts — le contenu des sections À propos, Expérience, Compétences
   --------------------------------------------------------------------------
   Des données structurées (pas du HTML) : les composants les mettent en page.
   Pour mettre à jour ton parcours, c'est ici, en français ET en anglais.
   ========================================================================== */
import type { Lang } from '../i18n/ui';

type T = Record<Lang, string>;   // un texte dans les deux langues

/* ---------------- À PROPOS ---------------- */
export const about: { intro: T; paragraphs: T[] } = {
  intro: {
    fr: "J'aime les systèmes qui transforment un flux de données brutes en décision claire.",
    en: 'I like systems that turn a stream of raw data into a clear decision.',
  },
  paragraphs: [
    {
      fr: "Je suis en deuxième année de Master AI & Data Computing à la FST de Béni Mellal, après une Licence en informatique terminée major de promotion. Mon terrain de jeu : les pipelines temps réel, l'apprentissage fédéré, l'apprentissage par renforcement et les agents IA.",
      en: "I'm in the second year of a Master's in AI & Data Computing at FST Béni Mellal, after a Bachelor's in Computer Science that I finished top of my class. My playground: real-time pipelines, federated learning, reinforcement learning and AI agents.",
    },
    {
      fr: "Chez Kilimax, j'ai appris que la donnée ne vaut que si quelqu'un peut agir dessus. Depuis, je cherche toujours la question précise derrière un tableau de bord, et je mesure honnêtement, y compris ce que je ne sais pas.",
      en: "At Kilimax, I learned that data only matters if someone can act on it. Since then, I always look for the precise question behind a dashboard, and I measure honestly, including what I don't know.",
    },
  ],
};

export const education: { period: string; title: T; place: T; note?: T }[] = [
  {
    period: '2025 — 2027',
    title: { fr: 'Master AI & Data Computing', en: "Master's in AI & Data Computing" },
    place: { fr: 'FST Béni Mellal, Maroc', en: 'FST Béni Mellal, Morocco' },
    note: { fr: 'Deep learning, architectures Big Data, calcul distribué, ML statistique', en: 'Deep learning, Big Data architectures, distributed computing, statistical ML' },
  },
  {
    period: '2022 — 2025',
    title: { fr: 'Licence en informatique', en: "Bachelor's in Computer Science" },
    place: { fr: 'FST Béni Mellal, Maroc', en: 'FST Béni Mellal, Morocco' },
    note: { fr: 'Major de promotion', en: 'Ranked 1st in class' },
  },
  {
    period: '2022',
    title: { fr: 'Baccalauréat scientifique', en: 'Scientific Baccalaureate' },
    place: { fr: 'LYSMAS, Togo', en: 'LYSMAS, Togo' },
    note: { fr: 'Major du centre d’examen', en: 'Ranked 1st in exam centre' },
  },
];

export const distinctions: T[] = [
  { fr: 'Diplômé de l’Aspire Leaders Program', en: 'Aspire Leaders Program graduate' },
  { fr: '3ᵉ place au concours CréAfrica, avec Kadeland : protéger le foncier des communautés africaines grâce à la blockchain', en: '3rd place at the CréAfrica contest, with Kadeland: protecting African communities’ land assets with blockchain' },
  { fr: 'Hackathon Nazahathon : la blockchain au service de la transparence', en: 'Nazahathon hackathon: blockchain for transparency' },
];

export const languages: { name: T; level: T }[] = [
  { name: { fr: 'Français', en: 'French' }, level: { fr: 'Langue maternelle', en: 'Native' } },
  { name: { fr: 'Anglais', en: 'English' }, level: { fr: 'C2', en: 'C2' } },
  { name: { fr: 'Italien', en: 'Italian' }, level: { fr: 'A2', en: 'A2' } },
];

/* ---------------- EXPÉRIENCE ---------------- */
export const experience: { period: T; role: T; company: string; context?: T; points: T[] }[] = [
  {
    period: { fr: 'Juil. — Oct. 2026', en: 'Jul. — Oct. 2026' },
    role: { fr: 'AI Community Agent', en: 'AI Community Agent' },
    company: 'Kilimax',
    context: { fr: 'Soutenue par Transsion', en: 'Backed by Transsion' },
    points: [
      { fr: 'Conception d’un funnel de monitoring, du clic publicitaire à la conversion payée : coût par étape, points de perte et actions correctives.', en: 'Designed a monitoring funnel from ad click to paid conversion: cost per step, drop-off points and corrective actions.' },
      { fr: 'Modèle d’adéquation produit-marché (PMF) et étude de marché pour le Maroc.', en: 'Product-market fit (PMF) model and market research for Morocco.' },
      { fr: 'Stratégie de mise sur le marché (go-to-market) et partenariats avec des influenceurs.', en: 'Go-to-market strategy and influencer partnerships.' },
      { fr: 'Analyse des données produit et utilisateurs, suivi des fonctionnalités IA, rapports et tableaux de bord pour les équipes.', en: 'Analysed user and product data, tracked AI features, built reports and dashboards for the teams.' },
    ],
  },
  {
    period: { fr: 'Juin 2025', en: 'Jun. 2025' },
    role: { fr: 'Stage Data Science (projet de fin de Licence)', en: "Data Science internship (Bachelor's final project)" },
    company: 'FST Béni Mellal',
    points: [
      { fr: 'Pipeline ML de bout en bout pour détecter la fraude financière sur des données déséquilibrées (Isolation Forest, SVM, Random Forest).', en: 'End-to-end ML pipeline to detect financial fraud on imbalanced data (Isolation Forest, SVM, Random Forest).' },
      { fr: 'Feature engineering, SMOTE, validation croisée : meilleur F1-score de 0,93. Noté 18/20, meilleure note de la promotion.', en: 'Feature engineering, SMOTE, cross-validation: best F1-score of 0.93. Graded 18/20, top of the class.' },
    ],
  },
];

/* ---------------- COMPÉTENCES ---------------- */
// Un élément est soit un nom propre (identique dans les deux langues), soit un texte traduit.
export const skills: { group: T; items: (string | T)[] }[] = [
  { group: { fr: 'IA & Machine Learning', en: 'AI & Machine Learning' }, items: ['PyTorch', 'scikit-learn', 'TensorFlow Lite', 'HuggingFace', 'CNN · LSTM · Attention', { fr: 'Apprentissage fédéré', en: 'Federated learning' }] },
  { group: { fr: 'Agents & RL', en: 'Agents & RL' }, items: ['LangGraph', 'LangChain', 'RAG', 'FAISS · ChromaDB', 'DQN · Q-Learning · SARSA', 'Gymnasium'] },
  { group: { fr: 'Data & Big Data', en: 'Data & Big Data' }, items: ['Kafka', 'Hadoop', 'SQL', 'MongoDB', 'Neo4j', 'MariaDB', 'Streamlit'] },
  { group: { fr: 'Développement', en: 'Development' }, items: ['Python', 'Java', 'JavaScript', 'FastAPI', 'Spring Boot', 'Next.js · Astro', 'Git', 'Docker', 'Linux'] },
  { group: { fr: 'Produit & Business', en: 'Product & Business' }, items: [{ fr: 'Analyse de funnel', en: 'Funnel analysis' }, 'Product-market fit', { fr: 'Étude de marché', en: 'Market research' }, 'Go-to-market'] },
];
