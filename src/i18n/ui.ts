/* ==========================================================================
   ui.ts — tous les textes du site, en français et en anglais
   --------------------------------------------------------------------------
   Les composants n'écrivent JAMAIS de texte en dur : ils demandent
   t('hero.lead') et reçoivent la bonne langue. Pour corriger une phrase,
   on vient ici, et les deux versions sont côte à côte.
   ========================================================================== */

export const languages = { fr: 'Français', en: 'English' } as const;
export type Lang = keyof typeof languages;   // le type 'fr' | 'en'
export const defaultLang: Lang = 'fr';

export const ui = {
  fr: {
    'meta.title': 'Ange Raïyane ESSOAZINA — Ingénieur IA & Data',
    'meta.description':
      "Portfolio d'Ange Raïyane ESSOAZINA, étudiant en Master AI & Data Computing : pipelines de données temps réel, apprentissage fédéré, agents IA.",

    'nav.about': 'À propos',
    'nav.projects': 'Projets',
    'nav.experience': 'Expérience',
    'nav.skills': 'Compétences',
    'nav.contact': 'Contact',
    'nav.home': 'Accueil',
    'nav.main': 'Navigation principale',
    'lang.switch': 'Langue',

    'hero.kicker': 'AI & DATA ENGINEER',
    'hero.lead':
      "Étudiant en Master AI & Data Computing. Je conçois des pipelines de données temps réel, des modèles d'apprentissage et des agents IA, de la donnée brute jusqu'à la décision.",
    'hero.cta.projects': 'Voir mes projets',
    'hero.cta.cv': 'Télécharger le CV',
    'hero.availability': 'Stage PFE recherché · 6 mois · dès janvier 2027',
    'hero.hint': 'Astuce : glisse une pastille dorée sur une pierre brute. Le chrome sur le corindon, par exemple.',

    'delphi.title': 'Parle à mon double IA',
    'delphi.text':
      "Il a ma voix et connaît tous mes projets. Pose-lui tes questions, à l'écrit ou à l'oral, comme si tu me parlais.",
    'delphi.chat': 'Discuter',
    'delphi.call': 'Appeler',
    'delphi.leaving': 'Tu vas quitter ce site : la conversation se passe sur Delphi, dans un nouvel onglet.',
    'delphi.newtab': '(ouvre Delphi dans un nouvel onglet)',

    'section.wip': 'Section en construction.',

    'suggest.text': 'Ce site existe aussi en français.',
    'suggest.action': 'Passer en français',
    'suggest.close': 'Fermer',
  },
  en: {
    'meta.title': 'Ange Raïyane ESSOAZINA — AI & Data Engineer',
    'meta.description':
      "Portfolio of Ange Raïyane ESSOAZINA, Master's student in AI & Data Computing: real-time data pipelines, federated learning, AI agents.",

    'nav.about': 'About',
    'nav.projects': 'Projects',
    'nav.experience': 'Experience',
    'nav.skills': 'Skills',
    'nav.contact': 'Contact',
    'nav.home': 'Home',
    'nav.main': 'Main navigation',
    'lang.switch': 'Language',

    'hero.kicker': 'AI & DATA ENGINEER',
    'hero.lead':
      "Master's student in AI & Data Computing. I build real-time data pipelines, learning models and AI agents, from raw data all the way to decisions.",
    'hero.cta.projects': 'See my projects',
    'hero.cta.cv': 'Download my CV',
    'hero.availability': 'Looking for a 6-month end-of-studies internship · from January 2027',
    'hero.hint': 'Tip: drag a golden token onto a raw stone. Try chromium on corundum.',

    'delphi.title': 'Talk to my AI twin',
    'delphi.text':
      'It has my voice and knows all my projects. Ask it anything, by text or by voice, as if you were talking to me.',
    'delphi.chat': 'Chat',
    'delphi.call': 'Call',
    'delphi.leaving': "You'll leave this site: the conversation happens on Delphi, in a new tab.",
    'delphi.newtab': '(opens Delphi in a new tab)',

    'section.wip': 'Section under construction.',

    'suggest.text': 'This site is also available in English.',
    'suggest.action': 'Switch to English',
    'suggest.close': 'Close',
  },
} as const;

export type UIKey = keyof (typeof ui)['fr'];

/** Renvoie une fonction t() qui traduit une clé dans la langue demandée. */
export function useTranslations(lang: Lang) {
  return (key: UIKey) => ui[lang][key] ?? ui[defaultLang][key];
}

/** L'adresse d'une page dans une langue donnée : '/' en français, '/en/' en anglais. */
export function localePath(lang: Lang, path = '/') {
  return lang === defaultLang ? path : `/${lang}${path}`;
}
