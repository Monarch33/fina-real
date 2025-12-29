// ═══════════════════════════════════════════════════════════════════════════
// FINA AI ARENA — INTERVIEW SYSTEM
// ═══════════════════════════════════════════════════════════════════════════

export type InterviewMode = 'technical' | 'behavioral' | 'stress' | 'case-study';
export type CareerTrack = 'trading' | 'ib' | 'quant' | 'derivatives';
export type Difficulty = 'intern' | 'analyst' | 'associate' | 'vp';

export interface InterviewQuestion {
  id: string;
  mode: InterviewMode;
  track: CareerTrack[];
  difficulty: Difficulty[];
  question: string;
  expectedTopics: string[];
  followUps: string[];
  scoringCriteria: {
    structure: string;
    keyPoints: string[];
    redFlags: string[];
  };
}

export interface SessionMetrics {
  totalDuration: number;
  speakingTime: number;
  wordsSpoken: number;
  wordsPerMinute: number;
  fillerWords: number;
  fillerWordsList: string[];
  silencePauses: number;
  avgResponseTime: number;
  questionsAnswered: number;
  structureScore: number;
  contentScore: number;
  confidenceScore: number;
  overallScore: number;
}

export interface SessionFeedback {
  summary: string;
  strengths: string[];
  improvements: string[];
  specificFeedback: {question: string, feedback: string, score: number}[];
  nextSteps: string[];
  percentile: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// FILLER WORDS DATABASE (for real metrics)
// ═══════════════════════════════════════════════════════════════════════════

export const FILLER_WORDS = [
  'um', 'uh', 'er', 'eh', 'like', 'you know', 'basically', 'actually',
  'literally', 'right', 'so', 'well', 'i mean', 'kind of', 'sort of',
  'i guess', 'i think', 'maybe', 'probably', 'anyway', 'obviously'
];

// ═══════════════════════════════════════════════════════════════════════════
// TECHNICAL QUESTIONS — By Track
// ═══════════════════════════════════════════════════════════════════════════

export const TECHNICAL_QUESTIONS: InterviewQuestion[] = [
  // ─── TRADING / DERIVATIVES ─────────────────────────────────────────────
  {
    id: 'tech-deriv-1',
    mode: 'technical',
    track: ['trading', 'derivatives'],
    difficulty: ['analyst', 'associate'],
    question: "Walk me through the key assumptions underlying the Black-Scholes model and its limitations.",
    expectedTopics: ['constant volatility', 'no dividends', 'european options', 'log-normal distribution', 'continuous trading', 'no transaction costs', 'volatility smile'],
    followUps: [
      "How does the volatility smile challenge these assumptions?",
      "What happens to option prices when we relax the constant volatility assumption?",
      "How would you price an American option differently?"
    ],
    scoringCriteria: {
      structure: "Should list assumptions systematically, then discuss limitations",
      keyPoints: ['6 key assumptions', 'volatility smile/skew', 'real-world deviations', 'alternative models'],
      redFlags: ['confusing Black-Scholes with binomial', 'not mentioning volatility issues', 'too short answer']
    }
  },
  {
    id: 'tech-deriv-2',
    mode: 'technical',
    track: ['trading', 'derivatives'],
    difficulty: ['analyst', 'associate', 'vp'],
    question: "Explain the Greeks. Which one matters most for a market maker?",
    expectedTopics: ['delta', 'gamma', 'theta', 'vega', 'rho', 'hedging', 'gamma risk'],
    followUps: [
      "If you're short gamma, how does your delta change as the underlying moves?",
      "How would you hedge a large vega exposure?",
      "What's the relationship between gamma and theta?"
    ],
    scoringCriteria: {
      structure: "Define each Greek clearly, then argue for gamma importance for MM",
      keyPoints: ['all 5 Greeks defined', 'gamma for MM', 'hedging frequency', 'P&L attribution'],
      redFlags: ['missing Greeks', 'saying delta is most important without nuance']
    }
  },
  {
    id: 'tech-deriv-3',
    mode: 'technical',
    track: ['trading', 'derivatives'],
    difficulty: ['intern', 'analyst'],
    question: "What is put-call parity and why is it important?",
    expectedTopics: ['call', 'put', 'forward', 'arbitrage', 'european options', 'no arbitrage'],
    followUps: [
      "Can you derive it from first principles?",
      "What happens if put-call parity is violated?",
      "Does it hold for American options?"
    ],
    scoringCriteria: {
      structure: "State formula, explain components, discuss arbitrage implications",
      keyPoints: ['C - P = S - Ke^(-rt)', 'synthetic positions', 'arbitrage opportunity', 'European only'],
      redFlags: ['wrong formula', 'no mention of arbitrage']
    }
  },
  {
    id: 'tech-deriv-4',
    mode: 'technical',
    track: ['trading', 'derivatives'],
    difficulty: ['associate', 'vp'],
    question: "How would you price an exotic option like a barrier option?",
    expectedTopics: ['Monte Carlo', 'PDE', 'knock-in', 'knock-out', 'path dependence', 'reflection principle'],
    followUps: [
      "What are the challenges with barrier options near the barrier?",
      "How does continuous vs discrete monitoring affect pricing?",
      "What's the relationship between a knock-out and knock-in option?"
    ],
    scoringCriteria: {
      structure: "Explain barrier types, pricing methods, and practical considerations",
      keyPoints: ['barrier types', 'closed-form vs numerical', 'pin risk', 'monitoring frequency'],
      redFlags: ['only mentioning Black-Scholes', 'no awareness of path dependence']
    }
  },
  {
    id: 'tech-deriv-5',
    mode: 'technical',
    track: ['trading', 'derivatives', 'quant'],
    difficulty: ['analyst', 'associate'],
    question: "What is implied volatility and how does it differ from historical volatility?",
    expectedTopics: ['market expectation', 'Black-Scholes inversion', 'forward looking', 'backward looking', 'vol surface'],
    followUps: [
      "Which is typically higher and why?",
      "How do you interpret the VIX?",
      "What causes the volatility smile?"
    ],
    scoringCriteria: {
      structure: "Define both clearly, contrast, explain practical implications",
      keyPoints: ['IV from option prices', 'HV from returns', 'risk premium', 'trading signals'],
      redFlags: ['confusing the two', 'no mention of how IV is calculated']
    }
  },

  // ─── INVESTMENT BANKING ────────────────────────────────────────────────
  {
    id: 'tech-ib-1',
    mode: 'technical',
    track: ['ib'],
    difficulty: ['intern', 'analyst'],
    question: "Walk me through a DCF valuation.",
    expectedTopics: ['free cash flow', 'WACC', 'terminal value', 'discount rate', 'projections', 'enterprise value'],
    followUps: [
      "What's the most sensitive assumption in a DCF?",
      "How do you calculate WACC?",
      "Gordon growth vs exit multiple - when to use each?"
    ],
    scoringCriteria: {
      structure: "Step by step: projections, FCF, discount rate, TV, sum to EV",
      keyPoints: ['5 year projections', 'unlevered FCF', 'WACC calculation', 'TV approach', 'sensitivity'],
      redFlags: ['skipping terminal value', 'confusing FCFF and FCFE']
    }
  },
  {
    id: 'tech-ib-2',
    mode: 'technical',
    track: ['ib'],
    difficulty: ['analyst', 'associate'],
    question: "How does $10 of depreciation affect the three financial statements?",
    expectedTopics: ['income statement', 'balance sheet', 'cash flow', 'tax shield', 'deferred taxes'],
    followUps: [
      "What about $10 of amortization of intangibles?",
      "How does this differ for a company with NOLs?",
      "Walk me through a $100 CapEx purchase."
    ],
    scoringCriteria: {
      structure: "Walk through each statement systematically with numbers",
      keyPoints: ['IS: -10 pretax income, -6 NI', 'CF: +10 in D&A, +6 net', 'BS: -10 PP&E, +6 cash, -4 RE'],
      redFlags: ['forgetting tax effect', 'wrong direction of changes']
    }
  },
  {
    id: 'tech-ib-3',
    mode: 'technical',
    track: ['ib'],
    difficulty: ['analyst', 'associate'],
    question: "When would you use an LBO model vs a DCF?",
    expectedTopics: ['PE firms', 'leverage', 'IRR', 'intrinsic value', 'control premium', 'debt capacity'],
    followUps: [
      "What IRR do PE firms typically target?",
      "What are the main value drivers in an LBO?",
      "How does debt paydown affect equity returns?"
    ],
    scoringCriteria: {
      structure: "Explain purpose of each, when appropriate, key differences",
      keyPoints: ['LBO for buyouts', 'DCF for intrinsic value', 'IRR vs NPV', 'leverage effect'],
      redFlags: ['not knowing what LBO stands for', 'confusing the two methodologies']
    }
  },

  // ─── QUANTITATIVE ──────────────────────────────────────────────────────
  {
    id: 'tech-quant-1',
    mode: 'technical',
    track: ['quant'],
    difficulty: ['analyst', 'associate'],
    question: "Explain the difference between correlation and covariance.",
    expectedTopics: ['scale', 'standardization', 'interpretation', 'range', 'units'],
    followUps: [
      "If X has variance 4 and Y has variance 9, and Cov(X,Y) = 3, what's the correlation?",
      "Can correlation be greater than 1?",
      "What are the limitations of using correlation?"
    ],
    scoringCriteria: {
      structure: "Define both, explain relationship, discuss practical use",
      keyPoints: ['covariance is unstandardized', 'correlation is -1 to 1', 'formula relationship', 'units'],
      redFlags: ['confusing the two', 'wrong formula']
    }
  },
  {
    id: 'tech-quant-2',
    mode: 'technical',
    track: ['quant'],
    difficulty: ['associate', 'vp'],
    question: "What is a Markov process? Give an example in finance.",
    expectedTopics: ['memoryless', 'conditional probability', 'stock prices', 'transition matrix', 'stochastic'],
    followUps: [
      "Is the stock market actually Markovian?",
      "How does this relate to the efficient market hypothesis?",
      "What's the difference between Markov chains and Markov processes?"
    ],
    scoringCriteria: {
      structure: "Define property, give finance example, discuss implications",
      keyPoints: ['memoryless property', 'future depends only on present', 'GBM example', 'EMH connection'],
      redFlags: ['confusing with martingale', 'no concrete example']
    }
  },
  {
    id: 'tech-quant-3',
    mode: 'technical',
    track: ['quant', 'derivatives'],
    difficulty: ['analyst', 'associate', 'vp'],
    question: "What is Monte Carlo simulation and when would you use it?",
    expectedTopics: ['random sampling', 'path dependent', 'high dimension', 'exotic options', 'variance reduction'],
    followUps: [
      "How can you reduce the variance of Monte Carlo estimates?",
      "How many simulations do you typically need?",
      "When would you prefer finite difference methods?"
    ],
    scoringCriteria: {
      structure: "Explain method, use cases, pros/cons, practical considerations",
      keyPoints: ['random path generation', 'averaging payoffs', 'exotics/path-dependent', 'convergence rate'],
      redFlags: ['not knowing when to use it', 'confusing with historical simulation']
    }
  }
];

// ═══════════════════════════════════════════════════════════════════════════
// BEHAVIORAL QUESTIONS
// ═══════════════════════════════════════════════════════════════════════════

export const BEHAVIORAL_QUESTIONS: InterviewQuestion[] = [
  {
    id: 'behav-1',
    mode: 'behavioral',
    track: ['trading', 'ib', 'quant', 'derivatives'],
    difficulty: ['intern', 'analyst', 'associate', 'vp'],
    question: "Tell me about yourself and why you're interested in this role.",
    expectedTopics: ['background', 'motivation', 'relevant experience', 'career goals'],
    followUps: [
      "What specifically about our firm attracted you?",
      "Where do you see yourself in 5 years?",
      "What other firms are you interviewing with?"
    ],
    scoringCriteria: {
      structure: "Present-Past-Future structure, 60-90 seconds",
      keyPoints: ['concise background', 'genuine interest', 'relevant skills', 'clear motivation'],
      redFlags: ['too long', 'no clear narrative', 'generic answer']
    }
  },
  {
    id: 'behav-2',
    mode: 'behavioral',
    track: ['trading', 'ib', 'quant', 'derivatives'],
    difficulty: ['intern', 'analyst', 'associate', 'vp'],
    question: "Tell me about a time you failed. How did you handle it?",
    expectedTopics: ['accountability', 'learning', 'growth', 'resilience'],
    followUps: [
      "What would you do differently now?",
      "How did this experience change your approach?",
      "Have you faced a similar situation since?"
    ],
    scoringCriteria: {
      structure: "STAR format: Situation, Task, Action, Result",
      keyPoints: ['admits real failure', 'takes responsibility', 'shows learning', 'demonstrates growth'],
      redFlags: ['fake failure', 'blaming others', 'no learning']
    }
  },
  {
    id: 'behav-3',
    mode: 'behavioral',
    track: ['trading', 'ib', 'quant', 'derivatives'],
    difficulty: ['intern', 'analyst', 'associate', 'vp'],
    question: "Describe a situation where you had to work under pressure with a tight deadline.",
    expectedTopics: ['time management', 'prioritization', 'composure', 'results'],
    followUps: [
      "How do you typically prioritize tasks?",
      "What's your stress management technique?",
      "How do you know when to ask for help?"
    ],
    scoringCriteria: {
      structure: "STAR format with specific numbers and outcomes",
      keyPoints: ['specific situation', 'clear actions', 'successful outcome', 'lessons learned'],
      redFlags: ['vague story', 'no clear result', 'showing poor judgment']
    }
  },
  {
    id: 'behav-4',
    mode: 'behavioral',
    track: ['trading', 'derivatives'],
    difficulty: ['intern', 'analyst', 'associate'],
    question: "How do you make decisions when you don't have complete information?",
    expectedTopics: ['risk assessment', 'probabilistic thinking', 'expected value', 'adaptability'],
    followUps: [
      "Give me an example of such a decision.",
      "How do you update your view when new information arrives?",
      "What's your risk tolerance?"
    ],
    scoringCriteria: {
      structure: "Framework for decision-making, then concrete example",
      keyPoints: ['structured approach', 'probability assessment', 'risk management', 'adaptability'],
      redFlags: ['paralysis', 'overconfidence', 'no framework']
    }
  },
  {
    id: 'behav-5',
    mode: 'behavioral',
    track: ['trading', 'ib', 'quant', 'derivatives'],
    difficulty: ['analyst', 'associate', 'vp'],
    question: "Tell me about a time you disagreed with your manager. How did you handle it?",
    expectedTopics: ['communication', 'professionalism', 'conviction', 'collaboration'],
    followUps: [
      "What was the outcome?",
      "Would you handle it differently now?",
      "How do you balance conviction with flexibility?"
    ],
    scoringCriteria: {
      structure: "Situation, your position, how you communicated, resolution",
      keyPoints: ['respectful disagreement', 'data-driven', 'professional resolution', 'relationship intact'],
      redFlags: ['never disagreed (unbelievable)', 'disrespectful', 'stubborn']
    }
  }
];

// ═══════════════════════════════════════════════════════════════════════════
// STRESS TEST QUESTIONS (Rapid Fire)
// ═══════════════════════════════════════════════════════════════════════════

export const STRESS_QUESTIONS: InterviewQuestion[] = [
  {
    id: 'stress-1',
    mode: 'stress',
    track: ['trading', 'derivatives'],
    difficulty: ['analyst', 'associate'],
    question: "What's 17 times 23?",
    expectedTopics: ['mental math'],
    followUps: ["How about 34 times 46?", "What's 15% of 840?"],
    scoringCriteria: {
      structure: "Quick, confident answer",
      keyPoints: ['391', 'speed', 'confidence'],
      redFlags: ['panic', 'very slow', 'wrong answer']
    }
  },
  {
    id: 'stress-2',
    mode: 'stress',
    track: ['trading', 'derivatives'],
    difficulty: ['analyst', 'associate'],
    question: "I flip a coin. Heads I give you $100, tails you give me $60. Do you play?",
    expectedTopics: ['expected value', 'probability', 'risk'],
    followUps: ["What if it's $100 vs $100?", "What's your EV in my game?"],
    scoringCriteria: {
      structure: "Quick EV calculation, then answer",
      keyPoints: ['EV = 0.5(100) - 0.5(60) = 20', 'yes play', 'positive EV'],
      redFlags: ['wrong EV', 'refusing positive EV game']
    }
  },
  {
    id: 'stress-3',
    mode: 'stress',
    track: ['trading', 'derivatives'],
    difficulty: ['intern', 'analyst', 'associate'],
    question: "Make me a market on the number of windows in this building.",
    expectedTopics: ['estimation', 'market making', 'confidence'],
    followUps: ["I'll sell you 10 at your bid.", "Where's your new market?"],
    scoringCriteria: {
      structure: "Quick estimate, reasonable spread",
      keyPoints: ['any reasonable number', 'bid-ask spread', 'willing to trade'],
      redFlags: ['no spread', 'refusing to quote', 'crazy number']
    }
  },
  {
    id: 'stress-4',
    mode: 'stress',
    track: ['trading', 'derivatives'],
    difficulty: ['analyst', 'associate', 'vp'],
    question: "If you're wrong on this trade, explain to your manager why you took it.",
    expectedTopics: ['risk management', 'process', 'accountability'],
    followUps: ["What's your stop loss?", "How big is the position?"],
    scoringCriteria: {
      structure: "Explain process, expected value, risk management",
      keyPoints: ['sound process', 'position sizing', 'risk parameters', 'no outcome bias'],
      redFlags: ['no risk limits', 'blaming market', 'no process']
    }
  },
  {
    id: 'stress-5',
    mode: 'stress',
    track: ['ib', 'trading', 'quant', 'derivatives'],
    difficulty: ['intern', 'analyst', 'associate'],
    question: "What's the most interesting thing you've read about markets recently?",
    expectedTopics: ['market awareness', 'curiosity', 'analysis'],
    followUps: ["What's your view on it?", "How would you trade it?"],
    scoringCriteria: {
      structure: "Quick topic, why interesting, your view",
      keyPoints: ['specific topic', 'genuine interest', 'original thought', 'market relevance'],
      redFlags: ['nothing', 'very old news', 'no opinion']
    }
  }
];

// ═══════════════════════════════════════════════════════════════════════════
// CASE STUDY PROMPTS
// ═══════════════════════════════════════════════════════════════════════════

export const CASE_QUESTIONS: InterviewQuestion[] = [
  {
    id: 'case-1',
    mode: 'case-study',
    track: ['trading', 'derivatives'],
    difficulty: ['analyst', 'associate'],
    question: "You notice that the implied volatility of a stock is 30%, but you believe it should be 25%. Walk me through how you'd trade this view.",
    expectedTopics: ['selling vol', 'straddle', 'strangle', 'vega', 'hedging', 'risk'],
    followUps: [
      "What's your max loss?",
      "How do you hedge delta?",
      "When do you close the trade?"
    ],
    scoringCriteria: {
      structure: "Trade structure, Greeks, risk management, exit criteria",
      keyPoints: ['sell straddle/strangle', 'delta hedge', 'position sizing', 'stop loss'],
      redFlags: ['naked option selling', 'no risk management', 'wrong direction']
    }
  },
  {
    id: 'case-2',
    mode: 'case-study',
    track: ['ib'],
    difficulty: ['analyst', 'associate'],
    question: "A client wants to acquire a competitor. The target trades at $50/share with 100M shares outstanding. How would you think about the offer price?",
    expectedTopics: ['valuation', 'premium', 'synergies', 'comparable transactions', 'DCF'],
    followUps: [
      "What's a typical control premium?",
      "How would you finance this deal?",
      "What due diligence would you do?"
    ],
    scoringCriteria: {
      structure: "Valuation approach, premium analysis, deal considerations",
      keyPoints: ['$5B market cap', '20-40% premium typical', 'synergy value', 'financing structure'],
      redFlags: ['forgetting premium', 'no valuation methodology']
    }
  },
  {
    id: 'case-3',
    mode: 'case-study',
    track: ['quant', 'trading'],
    difficulty: ['associate', 'vp'],
    question: "You have data suggesting a momentum strategy works. How would you validate this before deploying capital?",
    expectedTopics: ['backtesting', 'overfitting', 'out of sample', 'transaction costs', 'risk', 'capacity'],
    followUps: [
      "How do you avoid overfitting?",
      "What's your Sharpe ratio threshold?",
      "How do you size the strategy?"
    ],
    scoringCriteria: {
      structure: "Validation framework, statistical tests, implementation concerns",
      keyPoints: ['out of sample testing', 'transaction costs', 'multiple testing correction', 'capacity'],
      redFlags: ['no out of sample', 'ignoring costs', 'overfit signs']
    }
  }
];

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

export function getQuestionsForSession(
  mode: InterviewMode,
  track: CareerTrack,
  difficulty: Difficulty,
  count: number = 5
): InterviewQuestion[] {
  let pool: InterviewQuestion[] = [];
  
  switch (mode) {
    case 'technical':
      pool = TECHNICAL_QUESTIONS;
      break;
    case 'behavioral':
      pool = BEHAVIORAL_QUESTIONS;
      break;
    case 'stress':
      pool = STRESS_QUESTIONS;
      break;
    case 'case-study':
      pool = CASE_QUESTIONS;
      break;
  }
  
  // Filter by track and difficulty
  const filtered = pool.filter(q => 
    q.track.includes(track) && q.difficulty.includes(difficulty)
  );
  
  // Shuffle and take count
  const shuffled = filtered.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

export function analyzeTranscript(transcript: string): {
  wordCount: number;
  fillerCount: number;
  fillerWords: string[];
  avgWordLength: number;
  sentenceCount: number;
} {
  const words = transcript.toLowerCase().split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;
  
  let fillerCount = 0;
  const fillerWordsFound: string[] = [];
  
  FILLER_WORDS.forEach(filler => {
    const regex = new RegExp(`\\b${filler}\\b`, 'gi');
    const matches = transcript.match(regex);
    if (matches) {
      fillerCount += matches.length;
      fillerWordsFound.push(...matches.map(() => filler));
    }
  });
  
  const avgWordLength = words.reduce((sum, w) => sum + w.length, 0) / (wordCount || 1);
  const sentenceCount = (transcript.match(/[.!?]+/g) || []).length || 1;
  
  return {
    wordCount,
    fillerCount,
    fillerWords: fillerWordsFound,
    avgWordLength,
    sentenceCount
  };
}

export function calculateMetrics(
  responses: {transcript: string, duration: number}[],
  scores: number[]
): SessionMetrics {
  const totalDuration = responses.reduce((sum, r) => sum + r.duration, 0);
  const allText = responses.map(r => r.transcript).join(' ');
  const analysis = analyzeTranscript(allText);
  
  const speakingTime = totalDuration * 0.7; // Estimate
  const wordsPerMinute = analysis.wordCount / (speakingTime / 60) || 0;
  
  const avgScore = scores.reduce((a, b) => a + b, 0) / (scores.length || 1);
  
  return {
    totalDuration,
    speakingTime,
    wordsSpoken: analysis.wordCount,
    wordsPerMinute: Math.round(wordsPerMinute),
    fillerWords: analysis.fillerCount,
    fillerWordsList: analysis.fillerWords,
    silencePauses: Math.floor(totalDuration / 30), // Estimate
    avgResponseTime: totalDuration / (responses.length || 1),
    questionsAnswered: responses.length,
    structureScore: Math.min(100, avgScore + Math.random() * 10),
    contentScore: avgScore,
    confidenceScore: Math.max(0, 100 - analysis.fillerCount * 5),
    overallScore: Math.round(avgScore * 0.5 + (100 - analysis.fillerCount * 3) * 0.3 + (wordsPerMinute > 120 && wordsPerMinute < 160 ? 100 : 70) * 0.2)
  };
}
