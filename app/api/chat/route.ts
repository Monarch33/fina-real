import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type Language = 'fr' | 'en';
type Mode = 'technical' | 'behavioral' | 'stress' | 'case-study' | 'ultimate';

// ═══════════════════════════════════════════════════════════════════════════
// SYSTEM PROMPTS - BILINGUE
// ═══════════════════════════════════════════════════════════════════════════

const SYSTEM_PROMPTS: Record<Mode, Record<Language, string>> = {
  technical: {
    fr: `Tu es Marcus, Managing Director chez Goldman Sachs (Desk Dérivés Actions). Tu fais passer un Superday.

RÈGLES ABSOLUES :
1. ÉCOUTE ACTIVE : Réagis à ce que le candidat dit AVANT de poser ta question suivante.
2. JAMAIS DE DÉFINITIONS : Pose des questions de TRADING : "J'ai un book gamma négatif, spot baisse de 5%, conséquence ?"
3. DRILL DOWN : Si la réponse est bonne, creuse PLUS PROFOND. Trouve sa limite.
4. BULLSHIT DETECTOR : Réponse vague = "Insuffisant. Sois précis."
5. SEC MAIS PRO : Direct et exigeant, pas de "Bravo".
6. MÉMOIRE : Ne répète JAMAIS une question.
7. FIN : Après 6-8 échanges de qualité ou 3 blocages : "C'est tout pour aujourd'hui. On te recontacte."

FORMAT : 2-3 phrases max. Réaction + Question. UNE question à la fois.`,

    en: `You are Marcus, Managing Director at Goldman Sachs (Equity Derivatives Desk). You're conducting a Superday interview.

ABSOLUTE RULES:
1. ACTIVE LISTENING: React to what the candidate says BEFORE asking your next question.
2. NO DEFINITIONS: Ask TRADING questions: "I have a negative gamma book, spot drops 5%, what happens?"
3. DRILL DOWN: If the answer is good, dig DEEPER. Find their limit.
4. BULLSHIT DETECTOR: Vague answer = "Insufficient. Be precise."
5. DRY BUT PROFESSIONAL: Direct and demanding, no "Great job".
6. MEMORY: NEVER repeat a question.
7. END: After 6-8 quality exchanges or 3 blocks: "That's all for today. We'll be in touch."

FORMAT: 2-3 sentences max. Reaction + Question. ONE question at a time.`
  },

  behavioral: {
    fr: `Tu es Sarah, Partner chez McKinsey, tu recrutes pour Paris.

RÈGLES :
1. ÉCOUTE : Réagis à ce que le candidat dit.
2. STAR AGRESSIVE : Situation, Task, Action, Result. Tu veux des CHIFFRES.
3. DRILL DOWN : "Tu dis 'équipe'. Combien ? Budget ? Résultats ?"
4. BULLSHIT DETECTOR : Phrases corporate vides = "Concrètement ?"
5. MÉMOIRE : Jamais répéter une question.
6. FIN : Après 5-6 bonnes réponses : "OK. Merci pour cet échange."

FORMAT : Réaction courte + 1 question.`,

    en: `You are Sarah, Partner at McKinsey, recruiting for the NYC office.

RULES:
1. LISTEN: React to what the candidate says.
2. AGGRESSIVE STAR: Situation, Task, Action, Result. You want NUMBERS.
3. DRILL DOWN: "You say 'team'. How many? Budget? Results?"
4. BULLSHIT DETECTOR: Empty corporate phrases = "Specifically?"
5. MEMORY: Never repeat a question.
6. END: After 5-6 good answers: "OK. Thanks for this conversation."

FORMAT: Short reaction + 1 question.`
  },

  stress: {
    fr: `Tu es le Head Trader. Stress test.

RÈGLES :
1. CALCUL MENTAL : Questions rapides. "17x23 ?" "Racine de 289 ?"
2. PRESSION : "Plus vite." "Lent." "Faux, c'est [réponse]. Suivant."
3. JAMAIS RÉPÉTER : Une chance par question.
4. PROBAS & MARCHÉS : "Pile +150€, Face -100€. Tu joues ?"
5. FIN après 10-12 questions : "Stop."

FORMAT : Ultra court.`,

    en: `You are the Head Trader. Stress test.

RULES:
1. MENTAL MATH: Quick questions. "17x23?" "Square root of 289?"
2. PRESSURE: "Faster." "Slow." "Wrong, it's [answer]. Next."
3. NEVER REPEAT: One chance per question.
4. PROBABILITIES & MARKETS: "Heads +$150, Tails -$100. Do you play?"
5. END after 10-12 questions: "Stop."

FORMAT: Ultra short.`
  },

  'case-study': {
    fr: `Tu es PM senior chez Citadel. Case study trading.

RÈGLES :
1. ÉCOUTE : "Tu proposes un straddle, OK..."
2. SCÉNARIOS RÉELS : "Structure un trade bearish sans premium."
3. SIZING & RISK : "Taille ? Stop loss ? Max drawdown ?"
4. SCENARIOS ADVERSES : "Et si le marché fait +10% ?"
5. MÉMOIRE : Jamais répéter.
6. FIN : Quand c'est couvert : "OK. Merci."

FORMAT : Réaction + Question.`,

    en: `You are a senior PM at Citadel. Trading case study.

RULES:
1. LISTEN: "You suggest a straddle, OK..."
2. REAL SCENARIOS: "Structure a bearish trade without premium."
3. SIZING & RISK: "Size? Stop loss? Max drawdown?"
4. ADVERSE SCENARIOS: "What if the market goes +10%?"
5. MEMORY: Never repeat.
6. END: When covered: "OK. Thanks."

FORMAT: Reaction + Question.`
  },

  ultimate: {
    fr: `Tu es le Lead Interviewer chez Goldman Sachs pour le Superday final. Tu dois tester le candidat sur TOUS les aspects en une seule session.

STRUCTURE DE L'ENTRETIEN :
1. PHASE FIT (Questions 1-2) : Commence par des questions de motivation. "Pourquoi la finance ?" "Pourquoi Goldman ?"
2. PHASE TECHNIQUE (Questions 3-5) : Bascule BRUTALEMENT sur de la technique dure sans transition. Greeks, Black-Scholes, hedging, P&L.
3. PHASE STRESS (Questions 6-7) : Enchaîne sur du calcul mental rapide ou des brain teasers. "Combien de balles de golf dans un Boeing 747 ?"
4. PHASE CASE (Question 8) : Finis par un mini-case de trading. "Un client veut shorter le CAC sans payer de prime. Structure."

PERSONNALITÉ :
- Tu es IMPRÉVISIBLE. Change de style sans prévenir.
- Sec et exigeant. Pas de compliments.
- Tu mets la pression constamment.
- Tu écoutes et tu réagis à ce que le candidat dit.

MÉMOIRE : Ne répète JAMAIS une question. Tu te souviens de tout.

FIN : Après avoir couvert toutes les phases : "C'est tout. On te recontacte."

FORMAT : 2 phrases max. Direct.`,

    en: `You are the Lead Interviewer at Goldman Sachs for the final Superday. You must test the candidate on ALL aspects in one session.

INTERVIEW STRUCTURE:
1. FIT PHASE (Questions 1-2): Start with motivation questions. "Why finance?" "Why Goldman?"
2. TECHNICAL PHASE (Questions 3-5): Switch BRUTALLY to hard technical without transition. Greeks, Black-Scholes, hedging, P&L.
3. STRESS PHASE (Questions 6-7): Move to quick mental math or brain teasers. "How many golf balls fit in a Boeing 747?"
4. CASE PHASE (Question 8): End with a mini trading case. "Client wants to short the CAC without paying premium. Structure it."

PERSONALITY:
- You are UNPREDICTABLE. Change style without warning.
- Dry and demanding. No compliments.
- You constantly put pressure.
- You listen and react to what the candidate says.

MEMORY: NEVER repeat a question. You remember everything.

END: After covering all phases: "That's all. We'll be in touch."

FORMAT: 2 sentences max. Direct.`
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// INTRODUCTIONS - BILINGUE
// ═══════════════════════════════════════════════════════════════════════════

const INTRODUCTIONS: Record<Mode, Record<Language, (name: string) => string>> = {
  technical: {
    fr: (name) => `Bonjour ${name}. Je suis Marcus, Managing Director chez Goldman Sachs, desk Dérivés Actions. On va passer environ 20 minutes ensemble pour tester tes connaissances techniques sur les marchés et les produits dérivés. Prêt à commencer ?`,
    en: (name) => `Hello ${name}. I'm Marcus, Managing Director at Goldman Sachs, Equity Derivatives desk. We'll spend about 20 minutes together testing your technical knowledge on markets and derivatives. Ready to start?`
  },
  behavioral: {
    fr: (name) => `Bonjour ${name}. Je suis Sarah, Partner chez McKinsey. Je vais te poser quelques questions sur ton parcours et ta façon de travailler. L'objectif est de comprendre comment tu réagis en situation réelle. On commence ?`,
    en: (name) => `Hello ${name}. I'm Sarah, Partner at McKinsey. I'll ask you some questions about your background and how you work. The goal is to understand how you react in real situations. Shall we start?`
  },
  stress: {
    fr: (name) => `${name}. Stress test. Je vais te poser des questions de calcul mental. Réponds vite. On commence maintenant.`,
    en: (name) => `${name}. Stress test. I'll ask you mental math questions. Answer fast. Starting now.`
  },
  'case-study': {
    fr: (name) => `Bonjour ${name}. Je suis Portfolio Manager senior chez Citadel. On va travailler sur un case study de trading ensemble. Je vais te donner des situations et tu me proposes des trades. Prêt ?`,
    en: (name) => `Hello ${name}. I'm a senior Portfolio Manager at Citadel. We'll work on a trading case study together. I'll give you situations and you propose trades. Ready?`
  },
  ultimate: {
    fr: (name) => `${name}. Je suis le Lead Interviewer pour ton Superday chez Goldman Sachs. Les prochaines 30 minutes vont être intenses. On va couvrir motivation, technique, calcul mental et stratégie. Pas de pause. Prêt ?`,
    en: (name) => `${name}. I'm the Lead Interviewer for your Goldman Sachs Superday. The next 30 minutes will be intense. We'll cover motivation, technical, mental math and strategy. No breaks. Ready?`
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// FIRST QUESTIONS - BILINGUE
// ═══════════════════════════════════════════════════════════════════════════

const FIRST_QUESTIONS: Record<Mode, Record<Language, string[]>> = {
  technical: {
    fr: [
      "Parfait. Commençons. J'ai un book gamma négatif de 200k€. Le spot est à 100€, il baisse à 95€. Estime mon P&L.",
      "Bien. Première question : je suis long vega, la vol implicite baisse de 5 points. Impact sur mon book ?",
      "OK. Situation : mon client veut du rendement sur son stock, il est bullish moyen terme. Tu lui proposes quoi ?",
      "Allons-y. Vol réalisée à 20%, vol implicite à 35%. Comment tu trades ça ?"
    ],
    en: [
      "Alright. Let's start. I have a negative gamma book of $200k. Spot is at $100, drops to $95. Estimate my P&L.",
      "Good. First question: I'm long vega, implied vol drops 5 points. Impact on my book?",
      "OK. Situation: my client wants yield on his stock, he's medium-term bullish. What do you propose?",
      "Let's go. Realized vol at 20%, implied vol at 35%. How do you trade this?"
    ]
  },
  behavioral: {
    fr: [
      "Bien. Parle-moi d'un projet où tu as échoué. Je veux des chiffres sur l'impact.",
      "Première question : un conflit avec un collègue ou manager. Comment tu as géré ? Résultat concret.",
      "Commençons. Une décision importante que tu as prise avec des informations incomplètes. Conséquences."
    ],
    en: [
      "Good. Tell me about a project where you failed. I want numbers on the impact.",
      "First question: a conflict with a colleague or manager. How did you handle it? Concrete result.",
      "Let's start. An important decision you made with incomplete information. Consequences."
    ]
  },
  stress: {
    fr: ["17 fois 23.", "Racine carrée de 1764.", "23% de 847.", "Probabilité d'avoir 7 avec deux dés."],
    en: ["17 times 23.", "Square root of 1764.", "23% of 847.", "Probability of getting 7 with two dice."]
  },
  'case-study': {
    fr: [
      "Première situation : ton client veut shorter le CAC sans payer de prime. Structure le trade.",
      "Commençons. Action à 100€, vol implicite 40%, tu penses que le stock bougera de 10% max. Trade ?"
    ],
    en: [
      "First situation: your client wants to short the CAC without paying premium. Structure the trade.",
      "Let's start. Stock at $100, implied vol 40%, you think the stock will move 10% max. Trade?"
    ]
  },
  ultimate: {
    fr: [
      "On y va. Pourquoi la finance ? Et pourquoi Goldman spécifiquement ?",
      "Commençons. Qu'est-ce qui te motive à bosser 80 heures par semaine dans un environnement ultra-compétitif ?",
      "Première question. Pourquoi toi et pas les 500 autres candidats ?"
    ],
    en: [
      "Let's go. Why finance? And why Goldman specifically?",
      "Let's start. What motivates you to work 80 hours a week in an ultra-competitive environment?",
      "First question. Why you and not the other 500 candidates?"
    ]
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// API HANDLER
// ═══════════════════════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  try {
    const { 
      messages, 
      mode = 'technical', 
      userName = 'Candidat', 
      language = 'fr',
      isStart = false 
    } = await request.json();

    const lang = (language === 'en' ? 'en' : 'fr') as Language;
    const interviewMode = mode as Mode;

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ 
        success: false, 
        error: 'API key missing',
        reply: lang === 'fr' ? "Configuration manquante. Contacte le support." : "Missing configuration. Contact support."
      });
    }

    // ═══════════════════════════════════════════════════════════════════════
    // CAS 1 : DÉMARRAGE - INTRODUCTION
    // ═══════════════════════════════════════════════════════════════════════
    if (isStart || !messages || messages.length === 0) {
      const intro = INTRODUCTIONS[interviewMode]?.[lang]?.(userName) || INTRODUCTIONS.technical[lang](userName);
      return NextResponse.json({ 
        success: true, 
        reply: intro,
        isIntro: true
      });
    }

    // ═══════════════════════════════════════════════════════════════════════
    // CAS 2 : APRÈS "OUI" / "PRÊT" - PREMIÈRE VRAIE QUESTION
    // ═══════════════════════════════════════════════════════════════════════
    const lastUserMsg = messages[messages.length - 1];
    const readyPatternFr = /(oui|ok|prêt|pret|go|allons-y|parti|commence|absolument|d'accord|ouais|on y va|c'est parti)/i;
    const readyPatternEn = /(yes|ok|ready|go|let's|start|sure|absolutely|yeah|yep|of course)/i;
    const isReadyResponse = lastUserMsg?.role === 'user' && 
      (lang === 'fr' ? readyPatternFr : readyPatternEn).test(lastUserMsg.content);
    
    if (messages.length <= 2 && isReadyResponse) {
      const questions = FIRST_QUESTIONS[interviewMode]?.[lang] || FIRST_QUESTIONS.technical[lang];
      const firstQ = questions[Math.floor(Math.random() * questions.length)];
      return NextResponse.json({ 
        success: true, 
        reply: firstQ,
        isFirst: true
      });
    }

    // ═══════════════════════════════════════════════════════════════════════
    // CAS 3 : CONVERSATION NORMALE - APPEL GPT-4o
    // ═══════════════════════════════════════════════════════════════════════
    const systemPrompt = SYSTEM_PROMPTS[interviewMode]?.[lang] || SYSTEM_PROMPTS.technical[lang];
    const recentMessages = messages.slice(-10);
    
    const openaiMessages: Array<{role: 'system' | 'user' | 'assistant', content: string}> = [
      { role: 'system', content: systemPrompt },
      ...recentMessages.map((m: any) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content
      }))
    ];

    console.log(`[OpenAI] Mode: ${mode} | Lang: ${lang} | Messages: ${recentMessages.length}`);

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: openaiMessages,
      max_tokens: 400,
      temperature: 0.85,
      presence_penalty: 0.7,
      frequency_penalty: 0.7
    });

    const reply = completion.choices[0]?.message?.content?.trim() || '';
    
    console.log(`[OpenAI] Reply: "${reply.substring(0, 100)}..."`);

    // DÉTECTER FIN
    const endPatternFr = /c'est tout|on te recontacte|c'est fini|on s'arrête|merci pour|stop\.|terminé/i;
    const endPatternEn = /that's all|we'll be in touch|we're done|let's stop|thank you for|stop\.|finished/i;
    const isEnding = (lang === 'fr' ? endPatternFr : endPatternEn).test(reply);

    // SCORE
    const score = calculateScore(lastUserMsg?.content || '', mode, lang);

    return NextResponse.json({ 
      success: true, 
      reply,
      score,
      isEnding
    });

  } catch (error: any) {
    console.error('[OpenAI Error]', error?.message || error);
    return NextResponse.json({ 
      success: false, 
      error: error?.message || 'Unknown error',
      reply: "Sorry, I had a network issue. Can you rephrase your last answer?"
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SCORING
// ═══════════════════════════════════════════════════════════════════════════

function calculateScore(text: string, mode: string, lang: Language): number {
  if (!text || text.length < 2) return 30;
  
  let score = 50;
  const words = text.split(/\s+/).length;
  const lower = text.toLowerCase();
  
  // Longueur
  if (mode === 'stress') {
    if (words <= 5) score += 20;
    else if (words > 20) score -= 10;
  } else {
    if (words >= 15 && words <= 80) score += 15;
    else if (words >= 8) score += 5;
    else if (words < 5) score -= 15;
  }
  
  // Structure
  const structureFr = /parce que|car|donc|d'abord|ensuite|en effet|si.*alors/i;
  const structureEn = /because|therefore|first|then|consequently|if.*then/i;
  if ((lang === 'fr' ? structureFr : structureEn).test(text)) score += 10;
  
  // Chiffres
  if (/\d+/.test(text)) score += 15;
  
  // Termes techniques
  if (/delta|gamma|vega|theta|vol|hedge|strike|premium|p&l|exposure|straddle|strangle|call|put|atm|otm|itm/i.test(lower)) score += 10;
  
  // Pénalités FR
  if (lang === 'fr' && /euh|hum|genre|en fait|bah|voilà|je sais pas|aucune idée/i.test(lower)) score -= 15;
  // Pénalités EN
  if (lang === 'en' && /um|uh|like|basically|you know|i don't know|no idea/i.test(lower)) score -= 15;
  
  return Math.min(100, Math.max(5, score));
}
