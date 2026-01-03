// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type InterviewMode = 'technical' | 'behavioral' | 'stress' | 'case-study' | 'ultimate';

export type Language = 'fr' | 'en';

export type CareerTrack = 'trading' | 'investment-banking' | 'quant' | 'asset-management';

export type Difficulty = 'intern' | 'analyst' | 'associate' | 'vp' | 'director' | 'md';

// ═══════════════════════════════════════════════════════════════════════════
// FILLER WORDS (pour détecter les tics de langage)
// ═══════════════════════════════════════════════════════════════════════════

export const FILLER_WORDS: Record<Language, string[]> = {
  fr: [
    'euh', 'hum', 'bah', 'ben', 'genre', 'en fait', 'du coup', 'voilà',
    'quoi', 'tu vois', 'en gros', 'style', 'donc euh', 'comment dire',
    'disons', 'enfin', 'bon', 'alors', 'ouais'
  ],
  en: [
    'um', 'uh', 'like', 'basically', 'you know', 'actually', 'literally',
    'kind of', 'sort of', 'i mean', 'right', 'so yeah', 'anyway',
    'whatever', 'honestly', 'obviously'
  ]
};

// ═══════════════════════════════════════════════════════════════════════════
// MODE LABELS
// ═══════════════════════════════════════════════════════════════════════════

export const MODE_LABELS: Record<Language, Record<InterviewMode, { name: string; desc: string }>> = {
  fr: {
    technical: { name: 'Technique', desc: 'Dérivés & Trading' },
    behavioral: { name: 'Comportemental', desc: 'Méthode STAR' },
    stress: { name: 'Stress Test', desc: 'Calcul Mental' },
    'case-study': { name: 'Case Study', desc: 'Trading Réel' },
    ultimate: { name: 'Ultimate', desc: 'Superday Complet' }
  },
  en: {
    technical: { name: 'Technical', desc: 'Derivatives & Trading' },
    behavioral: { name: 'Behavioral', desc: 'STAR Method' },
    stress: { name: 'Stress Test', desc: 'Mental Math' },
    'case-study': { name: 'Case Study', desc: 'Real Trading' },
    ultimate: { name: 'Ultimate', desc: 'Full Superday' }
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// UI LABELS
// ═══════════════════════════════════════════════════════════════════════════

export const UI_LABELS: Record<Language, Record<string, string>> = {
  fr: {
    title: 'AI Interview Arena',
    subtitle: 'Choisis ton type d\'entretien',
    start: 'Commencer l\'entretien',
    exit: 'Quitter',
    restart: 'Recommencer',
    score: 'Score',
    words: 'Mots',
    fillers: 'Tics',
    duration: 'Durée',
    metrics: 'MÉTRIQUES',
    complete: 'Entretien terminé',
    avgScore: 'Score moyen',
    tapToSpeak: 'APPUIE POUR RÉPONDRE',
    tapToSend: 'APPUIE POUR ENVOYER',
    analyzing: 'ANALYSE...',
    listening: 'ÉCOUTE...',
    question: 'QUESTION',
    selectLanguage: 'Langue'
  },
  en: {
    title: 'AI Interview Arena',
    subtitle: 'Choose your interview type',
    start: 'Start Interview',
    exit: 'Exit',
    restart: 'Restart',
    score: 'Score',
    words: 'Words',
    fillers: 'Fillers',
    duration: 'Duration',
    metrics: 'METRICS',
    complete: 'Interview Complete',
    avgScore: 'Average Score',
    tapToSpeak: 'TAP TO SPEAK',
    tapToSend: 'TAP TO SEND',
    analyzing: 'ANALYZING...',
    listening: 'LISTENING...',
    question: 'QUESTION',
    selectLanguage: 'Language'
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

export function countFillerWords(text: string, language: Language): number {
  let count = 0;
  const lowerText = text.toLowerCase();
  const fillers = FILLER_WORDS[language];
  
  fillers.forEach(filler => {
    const regex = new RegExp(`\\b${filler}\\b`, 'gi');
    const matches = lowerText.match(regex);
    if (matches) count += matches.length;
  });
  
  return count;
}
