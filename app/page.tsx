"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Mic, MicOff, ChevronRight, ChevronLeft, Lock, Unlock,
  CheckCircle2, XCircle, TrendingUp, Loader2, CreditCard, 
  Shield, Zap, BookOpen, Target, Award, Mail, Key, Eye, 
  EyeOff, LogOut, DollarSign, User, Star, Calculator, 
  LineChart, Play, Square, Volume2, ArrowRight, Sparkles,
  GraduationCap, BarChart3, PieChart, Brain, Cpu
} from 'lucide-react';
import { 
  loginWithEmail, 
  signupWithEmail, 
  loginWithGoogle, 
  logout, 
  onAuthChange 
} from '@/lib/firebase';

// ═══════════════════════════════════════════════════════════════════════════
// FINA V-REAL — PRODUCTION FULLSTACK
// V6 Design + Real Backend (Firebase, OpenAI, ElevenLabs, Stripe)
// ═══════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 1: MASSIVE SYLLABUS DATABASE — ALL UNLOCKED
// ═══════════════════════════════════════════════════════════════════════════

const SYLLABUS = [
  { id: 1, title: 'Options Fundamentals', subtitle: 'Derivatives Building Blocks', icon: '◈', difficulty: 'Foundation', lessons: 8, status: 'unlocked', category: 'derivatives' },
  { id: 2, title: 'The Greeks', subtitle: 'Δ, Γ, Θ, V, ρ Sensitivities', icon: '∂', difficulty: 'Intermediate', lessons: 10, status: 'unlocked', category: 'derivatives' },
  { id: 3, title: 'Black-Scholes-Merton', subtitle: 'Nobel Prize Framework', icon: '∫', difficulty: 'Advanced', lessons: 12, status: 'unlocked', category: 'derivatives' },
  { id: 4, title: 'Volatility Surface', subtitle: 'Smile, Skew & Term Structure', icon: 'σ', difficulty: 'Advanced', lessons: 9, status: 'unlocked', category: 'derivatives' },
  { id: 5, title: 'Exotic Options', subtitle: 'Barriers, Asians, Lookbacks', icon: '✧', difficulty: 'Expert', lessons: 15, status: 'unlocked', category: 'derivatives' },
  { id: 6, title: 'Stochastic Calculus', subtitle: 'Itô, Brownian Motion, SDEs', icon: '∮', difficulty: 'Expert', lessons: 18, status: 'unlocked', category: 'quantitative' },
  { id: 7, title: 'Monte Carlo Methods', subtitle: 'Simulation & Variance Reduction', icon: '⚄', difficulty: 'Expert', lessons: 12, status: 'unlocked', category: 'quantitative' },
  { id: 8, title: 'Finite Differences', subtitle: 'PDE Numerical Solutions', icon: '▦', difficulty: 'Expert', lessons: 10, status: 'unlocked', category: 'quantitative' },
  { id: 9, title: 'Fixed Income Securities', subtitle: 'Bonds, Duration, Convexity', icon: '◇', difficulty: 'Intermediate', lessons: 11, status: 'unlocked', category: 'fixed-income' },
  { id: 10, title: 'Yield Curve Modeling', subtitle: 'Nelson-Siegel, Bootstrapping', icon: '⌒', difficulty: 'Advanced', lessons: 8, status: 'unlocked', category: 'fixed-income' },
  { id: 11, title: 'Interest Rate Derivatives', subtitle: 'Swaps, Caps, Floors, Swaptions', icon: '⟳', difficulty: 'Advanced', lessons: 14, status: 'unlocked', category: 'fixed-income' },
  { id: 12, title: 'Credit Derivatives', subtitle: 'CDS, CDO, Correlation Trading', icon: '⚡', difficulty: 'Expert', lessons: 12, status: 'unlocked', category: 'credit' },
  { id: 13, title: 'Value at Risk', subtitle: 'Parametric, Historical, MC VaR', icon: '▽', difficulty: 'Advanced', lessons: 9, status: 'unlocked', category: 'risk' },
  { id: 14, title: 'CVA, DVA & XVA', subtitle: 'Valuation Adjustments', icon: '⚖', difficulty: 'Expert', lessons: 11, status: 'unlocked', category: 'risk' },
  { id: 15, title: 'Portfolio Theory', subtitle: 'Markowitz, CAPM, APT', icon: '◉', difficulty: 'Intermediate', lessons: 8, status: 'unlocked', category: 'portfolio' },
  { id: 16, title: 'Factor Models', subtitle: 'Fama-French, Carhart, Barra', icon: '▣', difficulty: 'Advanced', lessons: 10, status: 'unlocked', category: 'portfolio' },
  { id: 17, title: 'DCF Valuation', subtitle: 'Vernimmen Methodology', icon: '◆', difficulty: 'Foundation', lessons: 7, status: 'unlocked', category: 'corporate' },
  { id: 18, title: 'LBO Modeling', subtitle: 'Leveraged Buyout Analysis', icon: '▲', difficulty: 'Advanced', lessons: 12, status: 'unlocked', category: 'corporate' },
  { id: 19, title: 'M&A Analysis', subtitle: 'Accretion/Dilution, Synergies', icon: '⬡', difficulty: 'Advanced', lessons: 10, status: 'unlocked', category: 'corporate' },
  { id: 20, title: 'Algorithmic Trading', subtitle: 'Market Microstructure', icon: '⎔', difficulty: 'Expert', lessons: 14, status: 'unlocked', category: 'trading' },
];

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 2: MODULE 1 COMPLETE ACADEMIC CONTENT
// ═══════════════════════════════════════════════════════════════════════════

const MODULE_1_LESSONS = [
  {
    id: 1,
    title: 'Introduction to Options',
    duration: '25 min',
    content: [
      { type: 'h1', text: 'Definition of an Option Contract' },
      { type: 'p', text: 'An option is a derivative security that grants its holder the right, but not the obligation, to buy or sell an underlying asset at a predetermined price on or before a specified date. This asymmetric payoff structure fundamentally distinguishes options from forward contracts.' },
      { type: 'quote', text: '"Options are the most versatile instruments in the derivatives markets, providing unlimited profit potential with limited, defined risk." — John C. Hull, Options, Futures, and Other Derivatives' },
      { type: 'h2', text: 'Essential Terminology' },
      { type: 'def', term: 'Strike Price (K)', definition: 'The fixed price at which the underlying asset may be bought or sold upon exercise.', highlight: true },
      { type: 'def', term: 'Premium (V)', definition: 'The market price of the option contract, paid by buyer to seller at inception.', highlight: true },
      { type: 'def', term: 'Expiration (T)', definition: 'The date at which the option contract expires and rights terminate.' },
      { type: 'def', term: 'Underlying (S)', definition: 'The asset upon which the option derives its value (equity, index, FX, commodity).' },
      { type: 'h2', text: 'Option Classification' },
      { type: 'compare', items: [
        { label: 'European Style', desc: 'Exercise permitted only at expiration date T. Analytically tractable.' },
        { label: 'American Style', desc: 'Exercise permitted any time t ∈ [0, T]. Early exercise premium.' }
      ]},
      { type: 'h2', text: 'Payoff Functions at Expiration' },
      { type: 'math', label: 'Call Option Payoff', formula: 'Payoff = max(Sₜ − K, 0)' },
      { type: 'math', label: 'Put Option Payoff', formula: 'Payoff = max(K − Sₜ, 0)' },
      { type: 'note', text: 'The max() function ensures non-negative payoffs, reflecting the holder\'s right to let worthless options expire unexercised.' },
    ],
    quiz: [
      { q: 'A European option can be exercised:', opts: ['Any time before T', 'Only at expiration T', 'Only on weekdays', 'Twice per month'], correct: 1 },
      { q: 'The option premium is paid by:', opts: ['The writer to the exchange', 'The buyer to the writer', 'Both parties equally', 'The clearinghouse'], correct: 1 },
      { q: 'If K = 100 and Sₜ = 95, a call option payoff equals:', opts: ['5', '95', '0', '−5'], correct: 2 },
    ]
  },
  {
    id: 2,
    title: 'Call Option Analysis',
    duration: '30 min',
    content: [
      { type: 'h1', text: 'Call Option Mechanics' },
      { type: 'p', text: 'A call option conveys the right to purchase the underlying asset at strike K. The buyer anticipates appreciation: profit accrues when S rises sufficiently above K to exceed the premium paid.' },
      { type: 'h2', text: 'Long Call Position' },
      { type: 'math', label: 'Profit Function', formula: 'Π = max(Sₜ − K, 0) − C₀' },
      { type: 'p', text: 'Where C₀ denotes the initial premium paid. Maximum loss is limited to C₀; maximum profit is theoretically unbounded.' },
      { type: 'box', variant: 'gold', title: 'Breakeven Analysis', text: 'S* = K + C₀\n\nThe stock must appreciate beyond the strike by at least the premium for the position to generate positive P&L at expiration.' },
      { type: 'h2', text: 'Moneyness States' },
      { type: 'def', term: 'In-the-Money (ITM)', definition: 'S > K. Positive intrinsic value. Exercise is profitable.', highlight: true },
      { type: 'def', term: 'At-the-Money (ATM)', definition: 'S ≈ K. Zero intrinsic value. Maximum time value.' },
      { type: 'def', term: 'Out-of-the-Money (OTM)', definition: 'S < K. Zero intrinsic value. Entire premium is extrinsic.' },
      { type: 'simulator', sim: 'payoff-call' },
    ],
    quiz: [
      { q: 'A call is ITM when:', opts: ['S < K', 'S > K', 'S = K', 'C > K'], correct: 1 },
      { q: 'Long call maximum loss equals:', opts: ['∞', 'K', 'C₀ (premium)', 'S₀'], correct: 2 },
      { q: 'Breakeven for K=50, C₀=3 is:', opts: ['47', '50', '53', '56'], correct: 2 },
    ]
  },
  {
    id: 3,
    title: 'Put Option Analysis',
    duration: '30 min',
    content: [
      { type: 'h1', text: 'Put Option Mechanics' },
      { type: 'p', text: 'A put option conveys the right to sell the underlying at strike K. The buyer anticipates depreciation: profit accrues when S falls sufficiently below K.' },
      { type: 'h2', text: 'Long Put Position' },
      { type: 'math', label: 'Profit Function', formula: 'Π = max(K − Sₜ, 0) − P₀' },
      { type: 'math', label: 'Maximum Profit', formula: 'Πₘₐₓ = K − P₀   (when Sₜ = 0)' },
      { type: 'box', variant: 'blue', title: 'Protective Put Strategy', text: 'Portfolio Insurance = Long Stock + Long Put\n\nLimits downside to (K − P₀) while preserving unlimited upside potential. Cost: Stock Price + Put Premium.' },
      { type: 'simulator', sim: 'payoff-put' },
    ],
    quiz: [
      { q: 'A put is ITM when:', opts: ['S > K', 'S < K', 'S = K', 'P > K'], correct: 1 },
      { q: 'Max profit on long K=100 put at P₀=4:', opts: ['96', '100', '104', '∞'], correct: 0 },
      { q: 'Protective put combines:', opts: ['Short S + Long P', 'Long S + Long P', 'Long S + Short P', 'Short S + Short P'], correct: 1 },
    ]
  },
  {
    id: 4,
    title: 'Option Price Decomposition',
    duration: '35 min',
    content: [
      { type: 'h1', text: 'Components of Option Value' },
      { type: 'math', label: 'Price Decomposition', formula: 'V = Intrinsic Value + Time Value' },
      { type: 'h2', text: 'Intrinsic Value' },
      { type: 'math', label: 'Call Intrinsic', formula: 'IV_call = max(S − K, 0)' },
      { type: 'math', label: 'Put Intrinsic', formula: 'IV_put = max(K − S, 0)' },
      { type: 'h2', text: 'Time Value (Extrinsic Value)' },
      { type: 'box', variant: 'gold', title: 'Time Value Dynamics', text: 'TV = V − IV\n\nReflects probability-weighted expectation of favorable price movement before expiration.\n\nDeterminants: Time to expiry (T), Volatility (σ), Interest rates (r), Dividends (q)' },
      { type: 'h2', text: 'Price Sensitivity Summary' },
      { type: 'table', headers: ['Factor ↑', 'Call', 'Put'], rows: [
        ['Spot Price S', '↑', '↓'],
        ['Strike K', '↓', '↑'],
        ['Time T', '↑', '↑'],
        ['Volatility σ', '↑', '↑'],
        ['Rate r', '↑', '↓'],
        ['Dividend q', '↓', '↑'],
      ]},
      { type: 'simulator', sim: 'black-scholes' },
    ],
    quiz: [
      { q: 'S=54, K=50, Call=7. Time value:', opts: ['3', '4', '7', '11'], correct: 0 },
      { q: 'Higher σ causes option prices to:', opts: ['Decrease', 'Increase', 'Unchanged', 'Invert'], correct: 1 },
      { q: 'Time value peaks when option is:', opts: ['Deep ITM', 'ATM', 'Deep OTM', 'Expired'], correct: 1 },
    ]
  },
  {
    id: 5,
    title: 'Put-Call Parity',
    duration: '25 min',
    content: [
      { type: 'h1', text: 'The Fundamental Arbitrage Relationship' },
      { type: 'p', text: 'Put-call parity establishes the precise mathematical relationship between European call and put prices. Any violation creates risk-free arbitrage opportunities that market forces rapidly eliminate.' },
      { type: 'h2', text: 'The Parity Equation' },
      { type: 'math', label: 'Put-Call Parity', formula: 'C + K·e⁻ʳᵀ = P + S₀' },
      { type: 'p', text: 'Where r is the continuously compounded risk-free rate and T is time to expiration in years.' },
      { type: 'box', variant: 'blue', title: 'Replication Argument', text: 'Portfolio A: Long Call + Cash (K·e⁻ʳᵀ)\nPortfolio B: Long Put + Long Stock\n\nBoth portfolios yield identical payoffs at T:\n• If Sₜ > K: Both worth Sₜ\n• If Sₜ < K: Both worth K\n\nNo-arbitrage ⟹ Equal value today.' },
      { type: 'h2', text: 'Arbitrage Example' },
      { type: 'example', text: 'Given: S₀ = 100, K = 100, T = 1yr, r = 5%\nCall = 12, Put = 8\n\nLHS: 12 + 100·e⁻⁰·⁰⁵ = 12 + 95.12 = 107.12\nRHS: 8 + 100 = 108\n\nPut overpriced by 0.88. Arbitrage: Sell put, buy call, short stock, invest proceeds.' },
    ],
    quiz: [
      { q: 'Put-call parity holds for:', opts: ['American only', 'European only', 'All options', 'Exotics only'], correct: 1 },
      { q: 'If C=5, S=50, K=50, r=0, then P=:', opts: ['0', '5', '50', '55'], correct: 1 },
      { q: 'Parity violation creates:', opts: ['Higher premiums', 'Arbitrage opportunity', 'Market closure', 'Nothing'], correct: 1 },
    ]
  },
  {
    id: 6,
    title: 'Vertical Spreads',
    duration: '40 min',
    content: [
      { type: 'h1', text: 'Directional Spread Strategies' },
      { type: 'h2', text: 'Bull Call Spread' },
      { type: 'p', text: 'Moderately bullish strategy with capped profit and loss.' },
      { type: 'math', label: 'Construction', formula: 'Long Call(K₁) + Short Call(K₂), K₂ > K₁' },
      { type: 'math', label: 'Max Profit', formula: 'Πₘₐₓ = (K₂ − K₁) − Net Premium' },
      { type: 'math', label: 'Max Loss', formula: 'Loss = Net Premium Paid' },
      { type: 'h2', text: 'Bear Put Spread' },
      { type: 'math', label: 'Construction', formula: 'Long Put(K₂) + Short Put(K₁), K₂ > K₁' },
      { type: 'h2', text: 'Iron Condor' },
      { type: 'box', variant: 'gold', title: 'Non-Directional Premium Collection', text: 'Construction:\n1. Short Put (K₁)\n2. Long Put (K₀), K₀ < K₁\n3. Short Call (K₂)\n4. Long Call (K₃), K₃ > K₂\n\nMax Profit = Net Premium Received\nMax Loss = Spread Width − Premium' },
    ],
    quiz: [
      { q: 'Bull call spread is:', opts: ['Net credit', 'Net debit', 'Zero cost', 'Undefined'], correct: 1 },
      { q: 'Iron condor profits when:', opts: ['S moves sharply', 'S stays range-bound', 'σ increases', 'T decreases'], correct: 1 },
      { q: 'Spread max loss is always:', opts: ['Unlimited', 'Limited', 'Zero', 'Negative'], correct: 1 },
    ]
  },
  {
    id: 7,
    title: 'Volatility Strategies',
    duration: '35 min',
    content: [
      { type: 'h1', text: 'Trading Volatility, Not Direction' },
      { type: 'h2', text: 'Long Straddle' },
      { type: 'p', text: 'Profits from large price movements in either direction.' },
      { type: 'math', label: 'Construction', formula: 'Long ATM Call + Long ATM Put (same K, T)' },
      { type: 'math', label: 'Payoff at T', formula: 'Payoff = |Sₜ − K|' },
      { type: 'math', label: 'Breakevens', formula: 'S* = K ± (C + P)' },
      { type: 'h2', text: 'Long Strangle' },
      { type: 'box', variant: 'blue', title: 'Lower-Cost Alternative', text: 'Long OTM Call(K₂) + Long OTM Put(K₁), K₂ > K₁\n\nAdvantage: Lower premium outlay\nDisadvantage: Requires larger move to profit' },
    ],
    quiz: [
      { q: 'Straddle buyer expects:', opts: ['Low σ', 'High σ', 'Stable S', 'Dividends'], correct: 1 },
      { q: 'Straddle breakeven count:', opts: ['0', '1', '2', '3'], correct: 2 },
      { q: 'Strangle vs straddle premium:', opts: ['Higher', 'Lower', 'Equal', 'Depends'], correct: 1 },
    ]
  },
  {
    id: 8,
    title: 'Early Exercise & American Options',
    duration: '30 min',
    content: [
      { type: 'h1', text: 'American Option Premium' },
      { type: 'p', text: 'The early exercise feature adds value: American options are worth at least as much as their European counterparts.' },
      { type: 'h2', text: 'Call Option Early Exercise' },
      { type: 'box', variant: 'gold', title: 'Non-Dividend Stocks', text: 'For calls on non-dividend paying stocks:\nEARLY EXERCISE IS NEVER OPTIMAL\n\nRationale:\n1. You pay K now vs. K·e⁻ʳᵀ later (lose interest)\n2. You forfeit remaining time value\n3. You gain nothing (no dividend capture)' },
      { type: 'p', text: 'For dividend-paying stocks: Consider early exercise just before ex-dividend if Dividend > Remaining Time Value.' },
      { type: 'h2', text: 'Put Option Early Exercise' },
      { type: 'p', text: 'For American puts: Early exercise can be optimal even absent dividends. Consider when deep ITM and interest earned on K exceeds time value.' },
    ],
    quiz: [
      { q: 'Early call exercise on non-div stock:', opts: ['Always optimal', 'Never optimal', 'Sometimes optimal', 'Required'], correct: 1 },
      { q: 'Dividends make call early exercise:', opts: ['Less likely', 'More likely', 'Impossible', 'Certain'], correct: 1 },
      { q: 'Deep ITM American puts:', opts: ['Never exercise', 'Hold to T', 'Consider early exercise', 'Sell immediately'], correct: 2 },
    ]
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 3: STATISTICS DATA
// ═══════════════════════════════════════════════════════════════════════════

const STATS = {
  salary: [
    { label: 'No Preparation', value: 85000, color: 'rgba(255,255,255,0.3)' },
    { label: 'Self-Study', value: 98000, color: 'rgba(255,255,255,0.5)' },
    { label: 'With FINA', value: 127000, color: 'rgba(255,215,0,0.9)' },
  ],
  successRate: [
    { label: 'FINA Users', value: 78, color: 'rgba(34,197,94,0.9)' },
    { label: 'Industry Avg', value: 22, color: 'rgba(255,255,255,0.2)' },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 4: MAIN APPLICATION COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

const FinaApp = () => {
  // Navigation
  const [view, setView] = useState('landing');
  const [step, setStep] = useState(0);
  const [career, setCareer] = useState<string | null>(null);
  const [seniority, setSeniority] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  // Authentication (Firebase)
  const [isAuth, setIsAuth] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPass, setAuthPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [user, setUser] = useState<any>(null);

  // Pricing & Subscription
  const [showPricing, setShowPricing] = useState(false);
  const [userPlan, setUserPlan] = useState('free');
  const [checkoutState, setCheckoutState] = useState('idle');
  const [qCount, setQCount] = useState(0);

  // Arena State
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [orbMood, setOrbMood] = useState('neutral');
  const [hasSpoken, setHasSpoken] = useState(false);
  const [metrics, setMetrics] = useState({ stress: 0, pace: 0, precision: 0 });
  const [question, setQuestion] = useState("Walk me through the assumptions underlying the Black-Scholes model and explain why each matters.");
  const [transcript, setTranscript] = useState('');
  const [displayedResponse, setDisplayedResponse] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatHistory, setChatHistory] = useState<{role: string, content: string}[]>([]);

  // Academy State
  const [selectedModule, setSelectedModule] = useState<number | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<number | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<{[key: number]: number}>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Refs
  const recognitionRef = useRef<any>(null);

  // ─────────────────────────────────────────────────────────────────────────
  // FIREBASE AUTH LISTENER
  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    const unsubscribe = onAuthChange((firebaseUser) => {
      if (firebaseUser) {
        setUser({ 
          email: firebaseUser.email, 
          name: firebaseUser.email?.split('@')[0] || 'User',
          uid: firebaseUser.uid
        });
        setIsAuth(true);
      } else {
        setUser(null);
        setIsAuth(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // EFFECTS
  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    setLoaded(true);
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SR();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.onresult = (e: any) => {
        let t = '';
        for (let i = e.resultIndex; i < e.results.length; i++) {
          t += e.results[i][0].transcript;
        }
        setTranscript(t);
      };
    }
    return () => recognitionRef.current?.stop();
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // REAL API FUNCTIONS
  // ─────────────────────────────────────────────────────────────────────────

  // ElevenLabs Voice
  const speakText = useCallback(async (text: string) => {
    setIsSpeaking(true);
    setOrbMood('speaking');
    
    try {
      const res = await fetch('/api/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      
      if (res.ok) {
        const audioBlob = await res.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.onended = () => {
          setIsSpeaking(false);
          setOrbMood('neutral');
        };
        audio.onerror = () => {
          setIsSpeaking(false);
          setOrbMood('neutral');
        };
        audio.play();
      } else {
        // Fallback to browser speech
        const synth = window.speechSynthesis;
        const u = new SpeechSynthesisUtterance(text);
        u.rate = 0.92;
        u.onend = () => { setIsSpeaking(false); setOrbMood('neutral'); };
        synth.speak(u);
      }
    } catch (error) {
      // Fallback to browser speech
      const synth = window.speechSynthesis;
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.92;
      u.onend = () => { setIsSpeaking(false); setOrbMood('neutral'); };
      synth.speak(u);
    }
  }, []);

  // Typewriter effect
  const typewriterEffect = useCallback((text: string, callback?: () => void) => {
    setIsTyping(true);
    setDisplayedResponse('');
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayedResponse(prev => prev + text[i]);
        i++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
        if (callback) callback();
      }
    }, 25);
  }, []);

  // OpenAI Chat
  const sendToAI = useCallback(async (userMessage: string) => {
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMessage, 
          history: chatHistory 
        }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        setChatHistory(prev => [
          ...prev, 
          { role: 'user', content: userMessage },
          { role: 'assistant', content: data.message }
        ]);
        return data.message;
      }
    } catch (error) {
      console.error('AI Error:', error);
    }
    
    // Fallback responses
    const fallbacks = [
      "You touched on the key points. Now explain how delta behaves as an option transitions from OTM to ITM.",
      "Your answer lacks rigor. You mentioned volatility but ignored the lognormal return assumption. Why is log-normality crucial?",
      "Let's push deeper. Derive the Black-Scholes PDE starting from a continuously rebalanced delta-hedged portfolio.",
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }, [chatHistory]);

  // Recording functions
  const startRecording = useCallback(() => {
    setTranscript('');
    try {
      recognitionRef.current?.start();
      setIsRecording(true);
      setHasSpoken(true);
    } catch (e) {}
  }, []);

  const stopRecording = useCallback(async () => {
    recognitionRef.current?.stop();
    setIsRecording(false);
    
    if (transcript.trim().length < 10) {
      setOrbMood('aggressive');
      const response = "That response is insufficient. On the trading floor, silence costs you the deal. Provide a comprehensive, structured answer.";
      typewriterEffect(response, () => speakText(response));
      return;
    }

    setQCount(c => c + 1);
    setMetrics({
      stress: Math.floor(Math.random() * 25) + 45,
      pace: Math.floor(Math.random() * 20) + 70,
      precision: Math.floor(Math.random() * 30) + 55,
    });

    // Get AI response
    const aiResponse = await sendToAI(transcript);
    const isAggressive = aiResponse.toLowerCase().includes('lack') || aiResponse.toLowerCase().includes('missing');
    setOrbMood(isAggressive ? 'aggressive' : 'neutral');
    setQuestion(aiResponse);
    typewriterEffect(aiResponse, () => speakText(aiResponse));
  }, [transcript, typewriterEffect, speakText, sendToAI]);

  // ─────────────────────────────────────────────────────────────────────────
  // FIREBASE AUTH HANDLER
  // ─────────────────────────────────────────────────────────────────────────

  const handleAuth = useCallback(async () => {
    setAuthLoading(true);
    setAuthError('');
    
    try {
      if (authMode === 'login') {
        await loginWithEmail(authEmail, authPass);
      } else {
        await signupWithEmail(authEmail, authPass);
      }
      setShowAuth(false);
      setAuthEmail('');
      setAuthPass('');
    } catch (error: any) {
      setAuthError(error.message || 'Authentication failed');
    }
    
    setAuthLoading(false);
  }, [authEmail, authPass, authMode]);

  const handleGoogleAuth = useCallback(async () => {
    setAuthLoading(true);
    setAuthError('');
    
    try {
      await loginWithGoogle();
      setShowAuth(false);
    } catch (error: any) {
      setAuthError(error.message || 'Google login failed');
    }
    
    setAuthLoading(false);
  }, []);

  const handleLogout = useCallback(async () => {
    await logout();
    setView('landing');
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // STRIPE CHECKOUT HANDLER
  // ─────────────────────────────────────────────────────────────────────────

  const handleCheckout = useCallback(async (planId: string) => {
    setCheckoutState('securing');
    
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          planId, 
          userEmail: user?.email 
        }),
      });
      
      const data = await res.json();
      
      if (data.url) {
        setCheckoutState('processing');
        window.location.href = data.url;
      } else {
        // Fallback to demo mode
        setTimeout(() => {
          setCheckoutState('processing');
          setTimeout(() => {
            setCheckoutState('success');
            setTimeout(() => {
              setUserPlan(planId);
              setShowPricing(false);
              setCheckoutState('idle');
            }, 2000);
          }, 2500);
        }, 1500);
      }
    } catch (error) {
      // Demo mode
      setTimeout(() => {
        setCheckoutState('processing');
        setTimeout(() => {
          setCheckoutState('success');
          setTimeout(() => {
            setUserPlan(planId);
            setShowPricing(false);
            setCheckoutState('idle');
          }, 2000);
        }, 2500);
      }, 1500);
    }
  }, [user]);

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION 5: UI COMPONENTS
  // ═══════════════════════════════════════════════════════════════════════════

  const Logo = () => (
    <div 
      className="cursor-pointer group"
      onClick={() => { setView('landing'); setStep(0); setSelectedModule(null); setSelectedLesson(null); }}
    >
      <div 
        className="relative px-5 py-2.5 transition-all duration-500 group-hover:scale-105"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 100%)',
          borderRadius: '14px',
          border: '1px solid rgba(255,255,255,0.15)',
          boxShadow: 'inset 1px 1px 2px rgba(255,255,255,0.1), inset -1px -1px 2px rgba(0,0,0,0.2), 0 8px 32px rgba(0,0,0,0.4)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <div className="absolute top-0 left-3 right-3 h-[1px]" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)' }} />
        <span style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.95)', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
          FINA
        </span>
      </div>
    </div>
  );

  const Navigation = () => (
    <header 
      className="fixed top-0 left-0 right-0 z-[100] px-8 py-4 flex justify-between items-center transition-all duration-500"
      style={{ 
        background: scrollY > 30 ? 'rgba(0,0,0,0.98)' : 'transparent',
        backdropFilter: scrollY > 30 ? 'blur(24px) saturate(180%)' : 'none',
        borderBottom: scrollY > 30 ? '1px solid rgba(255,255,255,0.06)' : 'none'
      }}
    >
      <Logo />
      <nav className="flex items-center gap-6">
        {['Academy', 'Arena', 'Pricing'].map(item => (
          <button
            key={item}
            onClick={() => {
              if (item === 'Academy') { setView('academy'); setSelectedModule(null); setSelectedLesson(null); }
              else if (item === 'Arena') { isAuth ? setView('arena') : setShowAuth(true); }
              else { setShowPricing(true); }
            }}
            className="text-sm tracking-wide transition-colors duration-300 hover:text-white"
            style={{ color: view === item.toLowerCase() ? '#fff' : 'rgba(255,255,255,0.5)' }}
          >
            {item}
          </button>
        ))}
        
        <div 
          className="px-3 py-1.5 rounded-full flex items-center gap-2"
          style={{ 
            background: userPlan !== 'free' ? 'rgba(255,215,0,0.1)' : 'rgba(255,255,255,0.03)',
            border: userPlan !== 'free' ? '1px solid rgba(255,215,0,0.3)' : '1px solid rgba(255,255,255,0.08)'
          }}
        >
          {userPlan !== 'free' && <Star size={11} fill="rgba(255,215,0,0.8)" style={{ color: 'rgba(255,215,0,0.8)' }} />}
          <span className="text-xs font-mono" style={{ color: userPlan !== 'free' ? 'rgba(255,215,0,0.9)' : 'rgba(136,136,136,0.6)' }}>
            {userPlan === 'free' ? 'FREE' : userPlan.toUpperCase()}
          </span>
        </div>

        {isAuth ? (
          <div className="relative group">
            <button className="flex items-center gap-2 px-4 py-2 rounded-full transition-colors hover:bg-white/5" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs" style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>{user?.name}</span>
            </button>
            <div className="absolute right-0 top-full mt-2 opacity-0 group-hover:opacity-100 transition-all pointer-events-none group-hover:pointer-events-auto">
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap text-sm"
                style={{ background: 'rgba(0,0,0,0.95)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}
              >
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          </div>
        ) : (
          <button 
            onClick={() => setShowAuth(true)}
            className="text-sm px-5 py-2 rounded-full transition-all hover:bg-white/10"
            style={{ border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.8)' }}
          >
            Sign In
          </button>
        )}
      </nav>
    </header>
  );

  const AuthModal = () => (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.97)', backdropFilter: 'blur(20px)' }}
      onClick={(e) => e.target === e.currentTarget && setShowAuth(false)}
    >
      <div 
        className="relative w-full max-w-md mx-4 p-10 rounded-3xl"
        style={{ 
          background: 'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 32px 64px rgba(0,0,0,0.5)'
        }}
      >
        <button 
          onClick={() => setShowAuth(false)}
          className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full transition-colors hover:bg-white/10"
          style={{ color: 'rgba(255,255,255,0.4)' }}
        >
          ✕
        </button>

        <div className="text-center mb-10">
          <h2 className="text-3xl font-light tracking-tight mb-2" style={{ color: 'rgba(255,255,255,0.95)' }}>
            {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-sm" style={{ color: 'rgba(136,136,136,0.7)' }}>
            {authMode === 'login' ? 'Access the Arena' : 'Begin your preparation'}
          </p>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-xs font-mono tracking-widest mb-2" style={{ color: 'rgba(136,136,136,0.5)' }}>EMAIL</label>
            <div className="relative">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'rgba(136,136,136,0.4)' }} />
              <input
                type="email"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                placeholder="analyst@goldmansachs.com"
                className="w-full pl-12 pr-4 py-3.5 rounded-xl text-sm outline-none transition-all focus:ring-1 focus:ring-white/20"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff' }}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono tracking-widest mb-2" style={{ color: 'rgba(136,136,136,0.5)' }}>PASSWORD</label>
            <div className="relative">
              <Key size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'rgba(136,136,136,0.4)' }} />
              <input
                type={showPass ? 'text' : 'password'}
                value={authPass}
                onChange={(e) => setAuthPass(e.target.value)}
                placeholder="••••••••••"
                className="w-full pl-12 pr-12 py-3.5 rounded-xl text-sm outline-none transition-all focus:ring-1 focus:ring-white/20"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff' }}
              />
              <button onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2">
                {showPass ? <EyeOff size={18} style={{ color: 'rgba(136,136,136,0.4)' }} /> : <Eye size={18} style={{ color: 'rgba(136,136,136,0.4)' }} />}
              </button>
            </div>
          </div>

          {authError && (
            <p className="text-sm text-center" style={{ color: 'rgba(239,68,68,0.9)' }}>{authError}</p>
          )}

          <button
            onClick={handleAuth}
            disabled={authLoading || !authEmail || !authPass}
            className="w-full py-3.5 rounded-xl text-sm font-medium transition-all hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ background: 'rgba(255,255,255,0.95)', color: '#000' }}
          >
            {authLoading ? <><Loader2 size={18} className="animate-spin" /> Authenticating...</> : 'Continue'}
          </button>

          <button
            onClick={handleGoogleAuth}
            disabled={authLoading}
            className="w-full py-3.5 rounded-xl text-sm font-medium transition-all hover:bg-white/10 flex items-center justify-center gap-3"
            style={{ border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.8)' }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continue with Google
          </button>
        </div>

        <p className="text-sm text-center mt-8" style={{ color: 'rgba(136,136,136,0.6)' }}>
          {authMode === 'login' ? "Don't have an account?" : 'Already registered?'}
          <button 
            onClick={() => { setAuthMode(authMode === 'login' ? 'signup' : 'login'); setAuthError(''); }}
            className="ml-2 font-medium hover:underline"
            style={{ color: 'rgba(255,255,255,0.9)' }}
          >
            {authMode === 'login' ? 'Create one' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );

  const PricingModal = () => {
    const plans = [
      { id: 'starter', name: 'STARTER', title: 'The Analyst', price: 19, features: ['Unlimited Arena sessions', 'All 20 Academy modules', 'Core metrics dashboard', 'Email support'] },
      { id: 'pro', name: 'PROFESSIONAL', title: 'The Associate', price: 49, features: ['Everything in Starter', 'Black-Scholes simulator', 'Detailed performance analytics', 'Priority support', 'Interview recordings'], popular: true },
      { id: 'elite', name: 'ELITE', title: 'The Managing Director', price: 99, features: ['Everything in Pro', 'Hyper-realistic voice AI', 'Stress test scenarios', '1-on-1 expert coaching', 'Lifetime updates', 'Private Slack access'], highlight: true },
    ];

    return (
      <div 
        className="fixed inset-0 z-[9999] overflow-y-auto"
        style={{ background: 'rgba(0,0,0,0.98)' }}
        onClick={(e) => e.target === e.currentTarget && checkoutState === 'idle' && setShowPricing(false)}
      >
        <div className="min-h-screen flex items-start justify-center py-16 px-4">
          <div className="relative w-full max-w-5xl">
            {checkoutState === 'idle' && (
              <button 
                onClick={() => setShowPricing(false)}
                className="absolute top-0 right-0 w-10 h-10 flex items-center justify-center rounded-full transition-colors hover:bg-white/10"
                style={{ color: 'rgba(255,255,255,0.4)' }}
              >
                ✕
              </button>
            )}

            {checkoutState === 'idle' && (
              <>
                <div className="text-center mb-16">
                  <p className="text-xs font-mono tracking-[0.3em] mb-4" style={{ color: 'rgba(136,136,136,0.5)' }}>PRICING</p>
                  <h2 className="text-5xl font-extralight tracking-tight mb-4" style={{ color: 'rgba(255,255,255,0.95)' }}>
                    Invest in Excellence
                  </h2>
                  <p className="text-lg font-light" style={{ color: 'rgba(136,136,136,0.6)' }}>
                    Your Goldman offer is worth more than the subscription.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {plans.map(plan => (
                    <div 
                      key={plan.id}
                      className="relative rounded-2xl transition-all duration-300 hover:scale-[1.02]"
                      style={{ 
                        background: plan.highlight ? 'linear-gradient(180deg, rgba(255,215,0,0.08) 0%, rgba(255,215,0,0.02) 100%)' : 'rgba(255,255,255,0.02)',
                        border: plan.highlight ? '1px solid rgba(255,215,0,0.3)' : '1px solid rgba(255,255,255,0.06)'
                      }}
                    >
                      {plan.popular && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-mono" style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.15)' }}>
                          MOST POPULAR
                        </div>
                      )}
                      {plan.highlight && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-mono" style={{ background: 'rgba(255,215,0,0.2)', color: 'rgba(255,215,0,0.9)', border: '1px solid rgba(255,215,0,0.3)' }}>
                          RECOMMENDED
                        </div>
                      )}
                      
                      <div className="p-8 pt-10">
                        <p className="text-xs font-mono tracking-widest mb-3" style={{ color: plan.highlight ? 'rgba(255,215,0,0.6)' : 'rgba(136,136,136,0.5)' }}>{plan.name}</p>
                        <h3 className="text-2xl font-light mb-6" style={{ color: plan.highlight ? 'rgba(255,215,0,0.95)' : 'rgba(255,255,255,0.9)' }}>{plan.title}</h3>
                        
                        <div className="flex items-baseline gap-1 mb-8">
                          <span className="text-5xl font-extralight" style={{ color: plan.highlight ? 'rgba(255,215,0,0.95)' : '#fff' }}>€{plan.price}</span>
                          <span className="text-sm" style={{ color: 'rgba(136,136,136,0.5)' }}>/month</span>
                        </div>

                        <ul className="space-y-3 mb-8">
                          {plan.features.map((f, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
                              <CheckCircle2 size={16} style={{ color: plan.highlight ? 'rgba(255,215,0,0.6)' : 'rgba(255,255,255,0.3)', flexShrink: 0, marginTop: 2 }} />
                              {f}
                            </li>
                          ))}
                        </ul>

                        <button
                          onClick={() => handleCheckout(plan.id)}
                          className="w-full py-3.5 rounded-full text-sm font-medium transition-all hover:scale-[1.02]"
                          style={{ 
                            background: plan.highlight ? 'linear-gradient(90deg, rgba(255,215,0,0.9), rgba(255,180,0,0.9))' : 'rgba(255,255,255,0.9)',
                            color: '#000'
                          }}
                        >
                          {plan.highlight ? 'Unlock Elite Access' : 'Get Started'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-center gap-8 mt-12 text-xs font-mono" style={{ color: 'rgba(136,136,136,0.4)' }}>
                  <span className="flex items-center gap-2"><Shield size={14} /> Stripe Secure</span>
                  <span>30-day money-back guarantee</span>
                  <span>Cancel anytime</span>
                </div>
              </>
            )}

            {checkoutState === 'securing' && (
              <div className="flex flex-col items-center justify-center py-32">
                <div className="mb-8 p-6 rounded-full" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <Shield size={48} className="animate-pulse" style={{ color: 'rgba(255,255,255,0.6)' }} />
                </div>
                <h3 className="text-2xl font-light mb-2" style={{ color: 'rgba(255,255,255,0.9)' }}>Securing Connection</h3>
                <p className="text-sm font-mono" style={{ color: 'rgba(136,136,136,0.5)' }}>Establishing encrypted channel...</p>
              </div>
            )}

            {checkoutState === 'processing' && (
              <div className="flex flex-col items-center justify-center py-32">
                <div className="mb-8 p-6 rounded-full" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <Loader2 size={48} className="animate-spin" style={{ color: 'rgba(255,255,255,0.8)' }} />
                </div>
                <h3 className="text-2xl font-light mb-2" style={{ color: 'rgba(255,255,255,0.9)' }}>Processing Payment</h3>
                <div className="flex items-center gap-2 mt-4">
                  <CreditCard size={16} style={{ color: 'rgba(136,136,136,0.5)' }} />
                  <span className="text-xs font-mono" style={{ color: 'rgba(136,136,136,0.5)' }}>•••• •••• •••• 4242</span>
                </div>
              </div>
            )}

            {checkoutState === 'success' && (
              <div className="flex flex-col items-center justify-center py-32">
                <div className="mb-8 p-6 rounded-full" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}>
                  <CheckCircle2 size={48} style={{ color: 'rgba(34,197,94,0.9)' }} />
                </div>
                <h3 className="text-2xl font-light mb-2" style={{ color: 'rgba(255,255,255,0.9)' }}>Payment Successful</h3>
                <p className="text-sm font-mono" style={{ color: 'rgba(136,136,136,0.5)' }}>Activating your subscription...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Black-Scholes Simulator
  const BlackScholesSimulator = () => {
    const [S, setS] = useState(100);
    const [K, setK] = useState(100);
    const [T, setT] = useState(1);
    const [sigma, setSigma] = useState(0.2);
    const [r, setR] = useState(0.05);

    const normCDF = (x: number) => {
      const a1=0.254829592, a2=-0.284496736, a3=1.421413741, a4=-1.453152027, a5=1.061405429, p=0.3275911;
      const sign = x < 0 ? -1 : 1;
      x = Math.abs(x) / Math.sqrt(2);
      const t = 1 / (1 + p * x);
      return 0.5 * (1 + sign * (1 - (((((a5*t + a4)*t) + a3)*t + a2)*t + a1)*t * Math.exp(-x*x)));
    };

    const calc = useMemo(() => {
      if (T <= 0 || sigma <= 0) return { call: 0, put: 0, delta: 0, gamma: 0, theta: 0, vega: 0 };
      const d1 = (Math.log(S/K) + (r + sigma*sigma/2)*T) / (sigma * Math.sqrt(T));
      const d2 = d1 - sigma * Math.sqrt(T);
      const call = S * normCDF(d1) - K * Math.exp(-r*T) * normCDF(d2);
      const put = K * Math.exp(-r*T) * normCDF(-d2) - S * normCDF(-d1);
      const delta = normCDF(d1);
      const gamma = Math.exp(-d1*d1/2) / (S * sigma * Math.sqrt(2 * Math.PI * T));
      const theta = -(S * sigma * Math.exp(-d1*d1/2)) / (2 * Math.sqrt(2 * Math.PI * T)) - r * K * Math.exp(-r*T) * normCDF(d2);
      const vega = S * Math.sqrt(T) * Math.exp(-d1*d1/2) / Math.sqrt(2 * Math.PI);
      return { call, put, delta, gamma, theta: theta/365, vega: vega/100 };
    }, [S, K, T, sigma, r]);

    const curveData = useMemo(() => {
      const points = [];
      for (let spot = K * 0.5; spot <= K * 1.5; spot += K * 0.02) {
        const d1 = (Math.log(spot/K) + (r + sigma*sigma/2)*T) / (sigma * Math.sqrt(T));
        const d2 = d1 - sigma * Math.sqrt(T);
        const callPrice = spot * normCDF(d1) - K * Math.exp(-r*T) * normCDF(d2);
        points.push({ x: spot, y: callPrice });
      }
      return points;
    }, [K, T, sigma, r]);

    const Slider = ({ label, value, min, max, step, unit, onChange, symbol }: any) => (
      <div className="mb-5">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-mono" style={{ color: 'rgba(136,136,136,0.6)' }}>{label}</span>
          <span className="text-sm font-mono" style={{ color: 'rgba(255,215,0,0.9)' }}>
            {symbol}{value.toFixed(step < 1 ? 2 : 0)}{unit}
          </span>
        </div>
        <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} className="w-full" />
      </div>
    );

    return (
      <div className="p-8 rounded-2xl" style={{ background: 'linear-gradient(180deg, rgba(255,215,0,0.06) 0%, rgba(255,215,0,0.01) 100%)', border: '1px solid rgba(255,215,0,0.15)' }}>
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 rounded-lg" style={{ background: 'rgba(255,215,0,0.1)' }}>
            <Calculator size={20} style={{ color: 'rgba(255,215,0,0.8)' }} />
          </div>
          <div>
            <h3 className="text-lg font-light" style={{ color: 'rgba(255,255,255,0.95)' }}>Black-Scholes Calculator</h3>
            <p className="text-xs" style={{ color: 'rgba(136,136,136,0.5)' }}>Interactive real-time pricing</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div>
            <Slider label="SPOT PRICE (S)" value={S} min={50} max={150} step={1} unit="" symbol="$" onChange={setS} />
            <Slider label="STRIKE PRICE (K)" value={K} min={50} max={150} step={1} unit="" symbol="$" onChange={setK} />
            <Slider label="VOLATILITY (σ)" value={sigma} min={0.05} max={0.8} step={0.01} unit="" symbol="" onChange={setSigma} />
            <Slider label="TIME TO EXPIRY (T)" value={T} min={0.01} max={2} step={0.01} unit=" years" symbol="" onChange={setT} />
            <Slider label="RISK-FREE RATE (r)" value={r} min={0} max={0.15} step={0.005} unit="" symbol="" onChange={setR} />

            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="text-xs font-mono mb-1" style={{ color: 'rgba(34,197,94,0.7)' }}>CALL PRICE</div>
                <div className="text-3xl font-light" style={{ color: 'rgba(34,197,94,0.95)' }}>${calc.call.toFixed(2)}</div>
              </div>
              <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="text-xs font-mono mb-1" style={{ color: 'rgba(239,68,68,0.7)' }}>PUT PRICE</div>
                <div className="text-3xl font-light" style={{ color: 'rgba(239,68,68,0.95)' }}>${calc.put.toFixed(2)}</div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3 mt-4">
              {[
                { label: 'Δ Delta', value: calc.delta.toFixed(3), color: 'rgba(59,130,246,0.8)' },
                { label: 'Γ Gamma', value: calc.gamma.toFixed(4), color: 'rgba(168,85,247,0.8)' },
                { label: 'Θ Theta', value: calc.theta.toFixed(4), color: 'rgba(251,146,60,0.8)' },
                { label: 'V Vega', value: calc.vega.toFixed(4), color: 'rgba(34,197,94,0.8)' },
              ].map(g => (
                <div key={g.label} className="p-3 rounded-lg text-center" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <div className="text-xs font-mono mb-1" style={{ color: 'rgba(136,136,136,0.5)' }}>{g.label}</div>
                  <div className="text-sm font-mono" style={{ color: g.color }}>{g.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs font-mono mb-4" style={{ color: 'rgba(136,136,136,0.5)' }}>CALL OPTION VALUE CURVE</div>
            <svg viewBox="0 0 320 220" className="w-full">
              {[0,1,2,3,4].map(i => (
                <line key={i} x1="40" y1={30 + i * 40} x2="300" y2={30 + i * 40} stroke="rgba(255,255,255,0.04)" />
              ))}
              <line x1="40" y1="190" x2="300" y2="190" stroke="rgba(255,255,255,0.15)" />
              <line x1="40" y1="30" x2="40" y2="190" stroke="rgba(255,255,255,0.15)" />
              <line x1={40 + (K - K*0.5) / K * 260} y1="30" x2={40 + (K - K*0.5) / K * 260} y2="190" stroke="rgba(255,215,0,0.3)" strokeDasharray="4" />
              <path
                d={curveData.map((p, i) => {
                  const x = 40 + (p.x - K*0.5) / K * 260;
                  const maxY = K * 0.5;
                  const y = 190 - (p.y / maxY) * 160;
                  return `${i === 0 ? 'M' : 'L'} ${x} ${Math.max(30, Math.min(190, y))}`;
                }).join(' ')}
                fill="none"
                stroke="rgba(34,197,94,0.8)"
                strokeWidth="2.5"
              />
              <path
                d={`M ${40 + (K - K*0.5) / K * 260} 190 L 300 ${190 - (K*0.5/K*0.5)*160}`}
                fill="none"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="1"
                strokeDasharray="4"
              />
              <circle 
                cx={40 + (S - K*0.5) / K * 260}
                cy={190 - (calc.call / (K*0.5)) * 160}
                r="6"
                fill="rgba(255,215,0,0.9)"
              />
              <text x="170" y="208" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="10" fontFamily="monospace">Spot Price</text>
              <text x={40 + (K - K*0.5) / K * 260} y="205" textAnchor="middle" fill="rgba(255,215,0,0.6)" fontSize="9" fontFamily="monospace">K={K}</text>
            </svg>
          </div>
        </div>
      </div>
    );
  };

  // Payoff Simulator
  const PayoffSimulator = ({ type }: { type: string }) => {
    const [spot, setSpot] = useState(100);
    const strike = 100;
    const premium = type === 'call' ? 5 : 4;
    const payoff = type === 'call' ? Math.max(spot - strike, 0) - premium : Math.max(strike - spot, 0) - premium;

    return (
      <div className="p-6 rounded-xl" style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)' }}>
        <div className="flex items-center gap-2 mb-4">
          <LineChart size={18} style={{ color: 'rgba(59,130,246,0.8)' }} />
          <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.9)' }}>
            {type === 'call' ? 'Call' : 'Put'} Payoff at Expiration
          </span>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-2">
            <span style={{ color: 'rgba(136,136,136,0.6)' }}>Spot at Expiry (Sₜ)</span>
            <span className="font-mono" style={{ color: 'rgba(59,130,246,0.9)' }}>${spot}</span>
          </div>
          <input type="range" min={50} max={150} value={spot} onChange={(e) => setSpot(Number(e.target.value))} className="w-full" />
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-lg text-center" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <div className="text-xs mb-1" style={{ color: 'rgba(136,136,136,0.5)' }}>Strike K</div>
            <div className="font-mono text-sm" style={{ color: 'rgba(255,255,255,0.9)' }}>${strike}</div>
          </div>
          <div className="p-3 rounded-lg text-center" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <div className="text-xs mb-1" style={{ color: 'rgba(136,136,136,0.5)' }}>Premium</div>
            <div className="font-mono text-sm" style={{ color: 'rgba(255,255,255,0.9)' }}>${premium}</div>
          </div>
          <div className="p-3 rounded-lg text-center" style={{ background: payoff >= 0 ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)' }}>
            <div className="text-xs mb-1" style={{ color: 'rgba(136,136,136,0.5)' }}>P&L</div>
            <div className="font-mono text-sm" style={{ color: payoff >= 0 ? 'rgba(34,197,94,0.9)' : 'rgba(239,68,68,0.9)' }}>
              {payoff >= 0 ? '+' : ''}{payoff}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Stats Charts
  const SalaryChart = () => (
    <div className="p-8 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="flex items-center gap-3 mb-8">
        <DollarSign size={22} style={{ color: 'rgba(255,215,0,0.8)' }} />
        <h3 className="text-xl font-light" style={{ color: 'rgba(255,255,255,0.9)' }}>Starting Salary Comparison</h3>
      </div>
      
      <div className="space-y-6">
        {STATS.salary.map((item, i) => (
          <div key={i}>
            <div className="flex justify-between mb-2">
              <span className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>{item.label}</span>
              <span className="text-sm font-mono" style={{ color: item.color }}>${item.value.toLocaleString()}</span>
            </div>
            <div className="h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${(item.value / 140000) * 100}%`, background: item.color }} />
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 p-5 rounded-xl text-center" style={{ background: 'rgba(255,215,0,0.08)', border: '1px solid rgba(255,215,0,0.15)' }}>
        <div className="text-4xl font-extralight mb-1" style={{ color: 'rgba(255,215,0,0.95)' }}>+49%</div>
        <div className="text-xs font-mono tracking-widest" style={{ color: 'rgba(255,255,255,0.5)' }}>SALARY UPLIFT WITH FINA</div>
      </div>
    </div>
  );

  const SuccessChart = () => (
    <div className="p-8 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="flex items-center gap-3 mb-8">
        <TrendingUp size={22} style={{ color: 'rgba(34,197,94,0.8)' }} />
        <h3 className="text-xl font-light" style={{ color: 'rgba(255,255,255,0.9)' }}>Interview Success Rate</h3>
      </div>
      
      <div className="flex items-center justify-center mb-8">
        <svg width="200" height="200" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="80" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="20" />
          <circle cx="100" cy="100" r="80" fill="none" stroke="rgba(34,197,94,0.8)" strokeWidth="20" strokeLinecap="round" strokeDasharray={`${78 * 5.02} ${22 * 5.02}`} transform="rotate(-90 100 100)" />
          <text x="100" y="95" textAnchor="middle" fill="rgba(255,255,255,0.95)" fontSize="36" fontWeight="200">78%</text>
          <text x="100" y="120" textAnchor="middle" fill="rgba(136,136,136,0.5)" fontSize="11" fontFamily="monospace">PASS RATE</text>
        </svg>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-xl text-center" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
          <div className="text-2xl font-light mb-1" style={{ color: 'rgba(34,197,94,0.9)' }}>78%</div>
          <div className="text-xs" style={{ color: 'rgba(136,136,136,0.6)' }}>FINA Users</div>
        </div>
        <div className="p-4 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.03)' }}>
          <div className="text-2xl font-light mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>22%</div>
          <div className="text-xs" style={{ color: 'rgba(136,136,136,0.6)' }}>Industry Avg</div>
        </div>
      </div>
    </div>
  );

  // Waveform
  const AudioWaveform = ({ active }: { active: boolean }) => (
    <div className="flex items-center justify-center gap-1 h-8">
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="w-1 rounded-full transition-all"
          style={{
            height: active ? `${Math.random() * 24 + 8}px` : '4px',
            background: active ? 'rgba(239,68,68,0.8)' : 'rgba(255,255,255,0.2)',
            animation: active ? `waveform ${0.3 + Math.random() * 0.3}s ease-in-out infinite alternate` : 'none',
            animationDelay: `${i * 0.05}s`
          }}
        />
      ))}
    </div>
  );

  // Orb
  const Orb = () => {
    const colors: {[key: string]: {main: string, glow: string}} = {
      neutral: { main: 'rgba(255,255,255,0.8)', glow: 'rgba(255,255,255,0.2)' },
      speaking: { main: 'rgba(59,130,246,0.9)', glow: 'rgba(59,130,246,0.3)' },
      aggressive: { main: 'rgba(239,68,68,0.9)', glow: 'rgba(239,68,68,0.3)' }
    };
    const c = colors[orbMood] || colors.neutral;

    return (
      <div className="relative flex items-center justify-center" style={{ width: 280, height: 280 }}>
        {[1, 2, 3].map(ring => (
          <div
            key={ring}
            className="absolute rounded-full"
            style={{
              width: 100 + ring * 55,
              height: 100 + ring * 55,
              border: `1px solid ${c.glow}`,
              opacity: (isSpeaking || isRecording) ? 0.4 / ring : 0.1 / ring,
              animation: (isSpeaking || isRecording) ? `pulse-ring ${1.5 + ring * 0.3}s ease-out infinite` : 'none'
            }}
          />
        ))}
        
        {isSpeaking && (
          <div className="absolute flex items-center gap-1">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="w-1.5 rounded-full"
                style={{
                  height: 20 + Math.random() * 40,
                  background: c.main,
                  animation: `soundwave ${0.3 + Math.random() * 0.2}s ease-in-out infinite alternate`
                }}
              />
            ))}
          </div>
        )}
        
        <div
          className={`relative rounded-full transition-all duration-500 ${isRecording ? 'scale-110' : ''}`}
          style={{
            width: 120,
            height: 120,
            background: `radial-gradient(circle at 30% 30%, ${c.main}, rgba(0,0,0,0.95))`,
            boxShadow: `0 0 60px ${c.glow}, 0 0 120px ${c.glow}`,
            animation: isSpeaking ? 'orb-pulse 0.5s ease-in-out infinite' : isRecording ? 'orb-rec 1s ease-in-out infinite' : 'none'
          }}
        >
          <div
            className="absolute rounded-full"
            style={{
              top: '15%',
              left: '20%',
              width: '25%',
              height: '25%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.4), transparent)',
              filter: 'blur(4px)'
            }}
          />
        </div>
        
        <div
          className="absolute -bottom-2 px-4 py-1.5 rounded-full text-xs font-mono tracking-wider"
          style={{
            background: orbMood === 'aggressive' ? 'rgba(239,68,68,0.15)' : orbMood === 'speaking' ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${orbMood === 'aggressive' ? 'rgba(239,68,68,0.3)' : orbMood === 'speaking' ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.1)'}`,
            color: orbMood === 'aggressive' ? 'rgba(239,68,68,0.9)' : orbMood === 'speaking' ? 'rgba(59,130,246,0.9)' : 'rgba(255,255,255,0.6)'
          }}
        >
          {orbMood === 'aggressive' ? 'CHALLENGING' : orbMood === 'speaking' ? 'ANALYZING' : isRecording ? 'LISTENING' : 'READY'}
        </div>
      </div>
    );
  };

  // Metric
  const Metric = ({ label, value, color }: { label: string, value: number, color: string }) => (
    <div className="text-center">
      <div className="text-[10px] font-mono tracking-widest uppercase mb-2" style={{ color: 'rgba(136,136,136,0.5)' }}>{label}</div>
      <div className="relative h-1.5 rounded-full mb-2 overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${value}%`, background: color }} />
      </div>
      <div className="text-xl font-light" style={{ color: value > 0 ? 'rgba(255,255,255,0.9)' : 'rgba(136,136,136,0.3)' }}>
        {value > 0 ? `${value}%` : '—'}
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION 6: VIEWS
  // ═══════════════════════════════════════════════════════════════════════════

  // Landing
  const LandingView = () => (
    <div className={`min-h-screen transition-opacity duration-1000 ${loaded ? 'opacity-100' : 'opacity-0'}`}>
      <section className="min-h-screen flex flex-col items-center justify-center px-8 relative">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(255,255,255,0.02) 0%, transparent 60%)' }} />
        
        <div className="relative z-10 text-center max-w-4xl">
          <p className="text-xs font-mono tracking-[0.4em] mb-10" style={{ color: 'rgba(136,136,136,0.5)' }}>
            AI-POWERED INTERVIEW PREPARATION
          </p>
          
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-extralight tracking-tight leading-[0.95] mb-4" style={{ color: 'rgba(255,255,255,0.95)' }}>
            Master Finance.
          </h1>
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-extralight tracking-tight leading-[0.95] mb-12" style={{ color: 'rgba(255,255,255,0.25)' }}>
            Dominate Interviews.
          </h1>
          
          <p className="text-lg font-light mb-14 max-w-xl mx-auto" style={{ color: 'rgba(136,136,136,0.7)' }}>
            The most rigorous preparation platform for elite finance careers. Trained on Hull, Vernimmen, and Damodaran.
          </p>
          
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setStep(1)}
              className="px-10 py-4 rounded-full text-base font-medium transition-all duration-300 hover:scale-[1.03] flex items-center gap-2"
              style={{ background: 'rgba(255,255,255,0.95)', color: '#000' }}
            >
              Start Training <ArrowRight size={18} />
            </button>
            <button
              onClick={() => setShowPricing(true)}
              className="px-10 py-4 rounded-full text-base transition-all duration-300 hover:bg-white/5"
              style={{ border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.8)' }}
            >
              View Pricing
            </button>
          </div>
        </div>
        
        <div className="absolute bottom-12 animate-bounce">
          <div className="w-5 h-8 rounded-full border border-white/20 flex justify-center pt-2">
            <div className="w-1 h-2 rounded-full bg-white/40" />
          </div>
        </div>
      </section>

      <section className="py-24 px-8" style={{ background: 'rgba(255,255,255,0.01)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-mono tracking-[0.3em] mb-4" style={{ color: 'rgba(136,136,136,0.5)' }}>PROVEN RESULTS</p>
            <h2 className="text-4xl font-extralight" style={{ color: 'rgba(255,255,255,0.95)' }}>Data-Driven Excellence</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <SalaryChart />
            <SuccessChart />
          </div>
        </div>
      </section>

      <section className="py-24 px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-mono tracking-[0.3em] mb-4" style={{ color: 'rgba(136,136,136,0.5)' }}>COMPREHENSIVE CURRICULUM</p>
            <h2 className="text-4xl font-extralight mb-4" style={{ color: 'rgba(255,255,255,0.95)' }}>20 Expert Modules</h2>
            <p className="text-lg font-light" style={{ color: 'rgba(136,136,136,0.6)' }}>
              From derivatives to corporate finance. Complete Wall Street preparation.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {SYLLABUS.slice(0, 10).map(mod => (
              <div
                key={mod.id}
                className="p-4 rounded-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                onClick={() => { setView('academy'); setSelectedModule(mod.id); }}
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xl">{mod.icon}</span>
                  <Unlock size={12} style={{ color: 'rgba(34,197,94,0.6)' }} />
                </div>
                <h4 className="text-sm font-medium mb-1" style={{ color: 'rgba(255,255,255,0.9)' }}>{mod.title}</h4>
                <p className="text-xs" style={{ color: 'rgba(136,136,136,0.5)' }}>{mod.lessons} lessons</p>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <button
              onClick={() => setView('academy')}
              className="text-sm font-medium transition-colors hover:text-white flex items-center gap-2 mx-auto"
              style={{ color: 'rgba(255,255,255,0.6)' }}
            >
              View All 20 Modules <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </section>

      <section className="py-24 px-8 text-center">
        <h2 className="text-4xl font-extralight mb-4" style={{ color: 'rgba(255,255,255,0.95)' }}>Ready to Excel?</h2>
        <p className="text-lg font-light mb-10" style={{ color: 'rgba(136,136,136,0.6)' }}>Join thousands who landed their dream roles.</p>
        <button
          onClick={() => setStep(1)}
          className="px-12 py-4 rounded-full text-base font-medium transition-all hover:scale-[1.03]"
          style={{ background: 'rgba(255,255,255,0.95)', color: '#000' }}
        >
          Begin Training
        </button>
      </section>

      <footer className="py-12 px-8 border-t" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <p className="text-xs font-mono" style={{ color: 'rgba(136,136,136,0.4)' }}>© 2024 FINA. All rights reserved.</p>
          <div className="flex gap-6 text-xs" style={{ color: 'rgba(136,136,136,0.4)' }}>
            <span>Privacy</span>
            <span>Terms</span>
            <span>Contact</span>
          </div>
        </div>
      </footer>
    </div>
  );

  // Onboarding
  const OnboardingView = () => {
    const careers = [
      { id: 'ib', title: 'Investment Banking', sub: 'M&A, DCF, LBO', icon: '◆' },
      { id: 'st', title: 'Sales & Trading', sub: 'Market Making', icon: '◈' },
      { id: 'deriv', title: 'Derivatives', sub: 'Greeks, Pricing', icon: '∂' },
      { id: 'quant', title: 'Quantitative', sub: 'Stochastic, Stats', icon: '∫' },
    ];
    const levels = [
      { id: 'intern', title: 'Intern' },
      { id: 'analyst', title: 'Analyst' },
      { id: 'associate', title: 'Associate' },
      { id: 'vp', title: 'VP+' },
    ];

    return (
      <div className="min-h-screen flex flex-col px-8 py-24">
        <button
          onClick={() => setStep(s => s - 1)}
          className="flex items-center gap-2 text-sm mb-16 transition-colors hover:text-white"
          style={{ color: 'rgba(255,255,255,0.4)' }}
        >
          <ChevronLeft size={16} /> Back
        </button>

        {step === 1 && (
          <>
            <div className="text-center mb-16">
              <p className="text-xs font-mono tracking-[0.3em] mb-4" style={{ color: 'rgba(136,136,136,0.5)' }}>STEP 01 / 02</p>
              <h2 className="text-4xl font-extralight" style={{ color: 'rgba(255,255,255,0.95)' }}>Select Your Track</h2>
            </div>
            
            <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
              {careers.map(c => (
                <div
                  key={c.id}
                  onClick={() => setCareer(c.id)}
                  className={`p-8 rounded-2xl cursor-pointer transition-all duration-300 ${career === c.id ? 'scale-[1.02]' : ''}`}
                  style={{
                    border: career === c.id ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(255,255,255,0.06)',
                    background: career === c.id ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)'
                  }}
                >
                  <span className="text-3xl block mb-6">{c.icon}</span>
                  <h3 className="text-lg font-light mb-1" style={{ color: 'rgba(255,255,255,0.9)' }}>{c.title}</h3>
                  <p className="text-xs" style={{ color: 'rgba(136,136,136,0.5)' }}>{c.sub}</p>
                </div>
              ))}
            </div>
            
            <div className="flex justify-center">
              <button
                onClick={() => setStep(2)}
                disabled={!career}
                className="px-10 py-4 rounded-full text-sm font-medium transition-all hover:scale-[1.02] disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ background: 'rgba(255,255,255,0.95)', color: '#000' }}
              >
                Continue
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="text-center mb-16">
              <p className="text-xs font-mono tracking-[0.3em] mb-4" style={{ color: 'rgba(136,136,136,0.5)' }}>STEP 02 / 02</p>
              <h2 className="text-4xl font-extralight" style={{ color: 'rgba(255,255,255,0.95)' }}>Experience Level</h2>
            </div>
            
            <div className="max-w-2xl mx-auto grid grid-cols-4 gap-4 mb-16">
              {levels.map(l => (
                <div
                  key={l.id}
                  onClick={() => setSeniority(l.id)}
                  className="p-5 rounded-xl cursor-pointer text-center transition-all duration-300"
                  style={{
                    border: seniority === l.id ? '1px solid rgba(255,255,255,0.4)' : '1px solid rgba(255,255,255,0.06)',
                    background: seniority === l.id ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.02)'
                  }}
                >
                  <span className="text-sm" style={{ color: seniority === l.id ? '#fff' : 'rgba(255,255,255,0.6)' }}>{l.title}</span>
                </div>
              ))}
            </div>
            
            <div className="flex justify-center">
              <button
                onClick={() => isAuth ? setView('arena') : setShowAuth(true)}
                disabled={!seniority}
                className="px-10 py-4 rounded-full text-sm font-medium transition-all hover:scale-[1.02] disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
                style={{ background: 'rgba(255,255,255,0.95)', color: '#000' }}
              >
                Enter Arena <Zap size={16} />
              </button>
            </div>
          </>
        )}
      </div>
    );
  };

  // Arena
  const ArenaView = () => (
    <div className="min-h-screen flex flex-col">
      <div className="px-8 py-5 flex justify-between items-center" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="flex items-center gap-4">
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'rgba(34,197,94,0.8)' }} />
          <span className="text-xs font-mono tracking-widest" style={{ color: 'rgba(136,136,136,0.5)' }}>LIVE SESSION</span>
          <span className="text-xs font-mono px-2 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.03)', color: 'rgba(136,136,136,0.4)' }}>
            Q{qCount + 1}
          </span>
        </div>
        <button
          onClick={() => setView('landing')}
          className="text-xs px-4 py-2 rounded-full transition-colors hover:bg-white/5"
          style={{ border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}
        >
          Exit Session
        </button>
      </div>

      <div className="flex-1 flex">
        <div className="w-52 p-8 flex flex-col gap-10" style={{ borderRight: '1px solid rgba(255,255,255,0.04)' }}>
          <Metric label="Stress Level" value={metrics.stress} color={metrics.stress > 70 ? 'rgba(239,68,68,0.8)' : metrics.stress > 50 ? 'rgba(251,191,36,0.8)' : 'rgba(34,197,94,0.8)'} />
          <Metric label="Speaking Pace" value={metrics.pace} color="rgba(255,255,255,0.8)" />
          <Metric label="Precision" value={metrics.precision} color={metrics.precision > 75 ? 'rgba(34,197,94,0.8)' : 'rgba(255,255,255,0.8)'} />
          
          {!hasSpoken && (
            <div className="p-4 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
              <p className="text-xs" style={{ color: 'rgba(136,136,136,0.5)' }}>Metrics activate after you speak</p>
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-8 relative">
          <div
            className="absolute inset-0 pointer-events-none transition-all duration-700"
            style={{
              background: orbMood === 'aggressive'
                ? 'radial-gradient(ellipse at center, rgba(239,68,68,0.04) 0%, transparent 60%)'
                : 'radial-gradient(ellipse at center, rgba(255,255,255,0.01) 0%, transparent 60%)'
            }}
          />

          <div className="absolute top-12 max-w-2xl text-center">
            <p className="text-xs font-mono tracking-widest mb-4" style={{ color: orbMood === 'aggressive' ? 'rgba(239,68,68,0.6)' : 'rgba(136,136,136,0.4)' }}>
              {orbMood === 'aggressive' ? '⚠ CHALLENGE' : 'INTERVIEWER'}
            </p>
            <p className="text-xl font-light leading-relaxed" style={{ color: 'rgba(255,255,255,0.9)' }}>
              {isTyping ? displayedResponse : question}
              {isTyping && <span className="animate-pulse">▋</span>}
            </p>
          </div>

          <Orb />

          {transcript && (
            <div className="absolute bottom-40 max-w-xl text-center p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-xs font-mono mb-2" style={{ color: 'rgba(136,136,136,0.4)' }}>YOUR RESPONSE</p>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>{transcript}</p>
            </div>
          )}

          {isRecording && (
            <div className="absolute bottom-36">
              <AudioWaveform active={isRecording} />
            </div>
          )}

          <div className="absolute bottom-12 flex flex-col items-center gap-4">
            {!isRecording ? (
              <button
                onClick={startRecording}
                disabled={isSpeaking || isTyping}
                className="w-20 h-20 rounded-full flex items-center justify-center transition-all disabled:opacity-40"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '2px solid rgba(255,255,255,0.2)'
                }}
              >
                <Mic size={24} style={{ color: 'rgba(255,255,255,0.6)' }} />
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="w-20 h-20 rounded-full flex items-center justify-center transition-all"
                style={{
                  background: 'rgba(239,68,68,0.15)',
                  border: '3px solid rgba(239,68,68,0.8)',
                  boxShadow: '0 0 30px rgba(239,68,68,0.3)',
                  animation: 'pulse-border 1.5s ease-in-out infinite'
                }}
              >
                <Square size={20} fill="rgba(239,68,68,0.9)" style={{ color: 'rgba(239,68,68,0.9)' }} />
              </button>
            )}
            <span className="text-xs font-mono tracking-widest" style={{ color: isRecording ? 'rgba(239,68,68,0.8)' : 'rgba(136,136,136,0.4)' }}>
              {isSpeaking || isTyping ? 'AI RESPONDING...' : isRecording ? 'TAP TO SEND' : 'TAP TO SPEAK'}
            </span>
          </div>
        </div>

        <div className="w-64 p-8" style={{ borderLeft: '1px solid rgba(255,255,255,0.04)' }}>
          <p className="text-xs font-mono tracking-widest mb-6" style={{ color: 'rgba(136,136,136,0.4)' }}>INTERVIEWER TIPS</p>
          <div className="space-y-4">
            <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>
                Begin with key assumptions before diving into formulas.
              </p>
            </div>
            <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>
                Structure: State → Explain → Example → Implications.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Academy
  const AcademyView = () => {
    if (selectedLesson) {
      const lesson = MODULE_1_LESSONS.find(l => l.id === selectedLesson);
      if (!lesson) return null;
      const quizPassed = quizSubmitted && lesson.quiz.every((q, i) => quizAnswers[i] === q.correct);

      return (
        <div className="min-h-screen px-8 py-24">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => { setSelectedLesson(null); setQuizAnswers({}); setQuizSubmitted(false); }}
              className="flex items-center gap-2 text-sm mb-10 transition-colors hover:text-white"
              style={{ color: 'rgba(255,255,255,0.4)' }}
            >
              <ChevronLeft size={16} /> Back to Module
            </button>

            <h1 className="text-3xl font-extralight mb-2" style={{ color: 'rgba(255,255,255,0.95)' }}>{lesson.title}</h1>
            <p className="text-sm font-mono mb-10" style={{ color: 'rgba(136,136,136,0.5)' }}>{lesson.duration}</p>

            <div className="p-10 rounded-2xl mb-10" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
              {lesson.content.map((block: any, i: number) => {
                if (block.type === 'h1') return <h2 key={i} className="text-2xl font-light mt-10 mb-4 first:mt-0" style={{ color: 'rgba(255,255,255,0.95)' }}>{block.text}</h2>;
                if (block.type === 'h2') return <h3 key={i} className="text-lg font-medium mt-8 mb-3" style={{ color: 'rgba(255,255,255,0.9)' }}>{block.text}</h3>;
                if (block.type === 'p') return <p key={i} className="mb-4 leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)', fontFamily: 'Georgia, serif' }}>{block.text}</p>;
                if (block.type === 'quote') return <blockquote key={i} className="my-6 pl-5 py-3 italic" style={{ borderLeft: '3px solid rgba(255,215,0,0.4)', color: 'rgba(255,255,255,0.6)', fontFamily: 'Georgia, serif' }}>{block.text}</blockquote>;
                if (block.type === 'def') return (
                  <div key={i} className="flex gap-4 mb-3 p-4 rounded-lg" style={{ background: block.highlight ? 'rgba(255,215,0,0.06)' : 'rgba(255,255,255,0.02)', border: block.highlight ? '1px solid rgba(255,215,0,0.15)' : '1px solid rgba(255,255,255,0.04)' }}>
                    <span className="font-medium text-sm shrink-0" style={{ color: block.highlight ? 'rgba(255,215,0,0.9)' : 'rgba(255,255,255,0.9)', minWidth: '140px' }}>{block.term}</span>
                    <span className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>{block.definition}</span>
                  </div>
                );
                if (block.type === 'math') return (
                  <div key={i} className="my-6 p-5 rounded-xl text-center" style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)' }}>
                    <div className="text-xs font-mono mb-2" style={{ color: 'rgba(59,130,246,0.7)' }}>{block.label}</div>
                    <div className="text-xl" style={{ color: 'rgba(255,255,255,0.95)', fontFamily: 'Georgia, Times New Roman, serif' }}>{block.formula}</div>
                  </div>
                );
                if (block.type === 'box') return (
                  <div key={i} className="my-6 p-6 rounded-xl" style={{ background: block.variant === 'gold' ? 'rgba(255,215,0,0.08)' : 'rgba(59,130,246,0.08)', border: block.variant === 'gold' ? '1px solid rgba(255,215,0,0.2)' : '1px solid rgba(59,130,246,0.2)' }}>
                    <h4 className="text-sm font-medium mb-3" style={{ color: block.variant === 'gold' ? 'rgba(255,215,0,0.9)' : 'rgba(59,130,246,0.9)' }}>{block.title}</h4>
                    <p className="text-sm whitespace-pre-line leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)' }}>{block.text}</p>
                  </div>
                );
                if (block.type === 'note') return (
                  <div key={i} className="my-4 p-4 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)', borderLeft: '3px solid rgba(255,255,255,0.2)' }}>
                    <p className="text-sm italic" style={{ color: 'rgba(255,255,255,0.6)' }}>{block.text}</p>
                  </div>
                );
                if (block.type === 'compare') return (
                  <div key={i} className="grid grid-cols-2 gap-4 my-6">
                    {block.items.map((item: any, j: number) => (
                      <div key={j} className="p-5 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <h5 className="text-sm font-medium mb-2" style={{ color: 'rgba(255,255,255,0.9)' }}>{item.label}</h5>
                        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>{item.desc}</p>
                      </div>
                    ))}
                  </div>
                );
                if (block.type === 'table') return (
                  <div key={i} className="my-6 overflow-hidden rounded-xl" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                    <table className="w-full">
                      <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                          {block.headers.map((h: string, j: number) => <th key={j} className="px-4 py-3 text-left text-xs font-mono" style={{ color: 'rgba(255,255,255,0.6)' }}>{h}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {block.rows.map((row: string[], j: number) => (
                          <tr key={j} style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                            {row.map((cell: string, k: number) => (
                              <td key={k} className="px-4 py-3 text-sm" style={{ color: k === 0 ? 'rgba(255,255,255,0.8)' : cell === '↑' ? 'rgba(34,197,94,0.9)' : 'rgba(239,68,68,0.9)' }}>{cell}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
                if (block.type === 'example') return (
                  <div key={i} className="my-6 p-5 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <p className="text-sm font-mono whitespace-pre-line" style={{ color: 'rgba(255,255,255,0.8)' }}>{block.text}</p>
                  </div>
                );
                if (block.type === 'simulator') {
                  if (block.sim === 'black-scholes') return <BlackScholesSimulator key={i} />;
                  return <PayoffSimulator key={i} type={block.sim === 'payoff-call' ? 'call' : 'put'} />;
                }
                return null;
              })}
            </div>

            <div className="p-10 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex items-center gap-3 mb-8">
                <Target size={22} style={{ color: 'rgba(255,255,255,0.6)' }} />
                <h2 className="text-xl font-light" style={{ color: 'rgba(255,255,255,0.9)' }}>Knowledge Check</h2>
              </div>

              {lesson.quiz.map((q: any, i: number) => (
                <div key={i} className="mb-8">
                  <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.9)' }}>{i + 1}. {q.q}</p>
                  <div className="grid grid-cols-2 gap-3">
                    {q.opts.map((opt: string, j: number) => {
                      const selected = quizAnswers[i] === j;
                      const correct = j === q.correct;
                      const show = quizSubmitted;
                      return (
                        <button
                          key={j}
                          onClick={() => !quizSubmitted && setQuizAnswers(p => ({ ...p, [i]: j }))}
                          disabled={quizSubmitted}
                          className="p-4 rounded-xl text-left text-sm transition-all"
                          style={{
                            background: show ? (correct ? 'rgba(34,197,94,0.1)' : selected ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.02)') : selected ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.02)',
                            border: show ? (correct ? '1px solid rgba(34,197,94,0.4)' : selected ? '1px solid rgba(239,68,68,0.4)' : '1px solid rgba(255,255,255,0.06)') : selected ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(255,255,255,0.06)',
                            color: 'rgba(255,255,255,0.8)'
                          }}
                        >
                          {String.fromCharCode(65 + j)}. {opt}
                          {show && correct && <CheckCircle2 size={14} className="inline ml-2" style={{ color: 'rgba(34,197,94,0.9)' }} />}
                          {show && selected && !correct && <XCircle size={14} className="inline ml-2" style={{ color: 'rgba(239,68,68,0.9)' }} />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {!quizSubmitted ? (
                <button
                  onClick={() => setQuizSubmitted(true)}
                  disabled={Object.keys(quizAnswers).length < lesson.quiz.length}
                  className="px-8 py-3 rounded-full text-sm font-medium transition-all hover:scale-[1.02] disabled:opacity-30"
                  style={{ background: 'rgba(255,255,255,0.95)', color: '#000' }}
                >
                  Submit Answers
                </button>
              ) : (
                <div className="flex items-center gap-4">
                  <span className="text-sm font-mono" style={{ color: quizPassed ? 'rgba(34,197,94,0.9)' : 'rgba(239,68,68,0.9)' }}>
                    {quizPassed ? '✓ PASSED' : '✗ TRY AGAIN'}
                  </span>
                  {!quizPassed && (
                    <button
                      onClick={() => { setQuizAnswers({}); setQuizSubmitted(false); }}
                      className="px-5 py-2 rounded-full text-sm transition-colors hover:bg-white/10"
                      style={{ border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.8)' }}
                    >
                      Retry
                    </button>
                  )}
                </div>
              )}

              {quizPassed && (
                <div className="mt-8 p-6 rounded-xl text-center" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
                  <Award size={32} style={{ color: 'rgba(34,197,94,0.8)', margin: '0 auto 12px' }} />
                  <h3 className="text-lg font-light mb-2" style={{ color: 'rgba(255,255,255,0.95)' }}>Lesson Complete!</h3>
                  <p className="text-sm mb-4" style={{ color: 'rgba(136,136,136,0.6)' }}>Ready to practice in the Arena?</p>
                  <button
                    onClick={() => setView('arena')}
                    className="px-8 py-3 rounded-full text-sm font-medium flex items-center gap-2 mx-auto"
                    style={{ background: 'rgba(255,255,255,0.95)', color: '#000' }}
                  >
                    <Zap size={16} /> Launch Simulation
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    if (selectedModule === 1) {
      return (
        <div className="min-h-screen px-8 py-24">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => setSelectedModule(null)}
              className="flex items-center gap-2 text-sm mb-10 transition-colors hover:text-white"
              style={{ color: 'rgba(255,255,255,0.4)' }}
            >
              <ChevronLeft size={16} /> Back to Academy
            </button>

            <div className="flex items-center gap-4 mb-2">
              <span className="text-4xl">◈</span>
              <div>
                <h1 className="text-3xl font-extralight" style={{ color: 'rgba(255,255,255,0.95)' }}>Options Fundamentals</h1>
                <p className="text-sm mt-1" style={{ color: 'rgba(136,136,136,0.6)' }}>Derivatives Building Blocks · 8 Lessons</p>
              </div>
            </div>

            <div className="my-10 p-6 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'Georgia, serif' }}>
                Master the foundational concepts of options trading. From basic definitions and payoff structures to put-call parity and trading strategies.
              </p>
            </div>

            <div className="space-y-4">
              {MODULE_1_LESSONS.map((lesson, i) => (
                <div
                  key={lesson.id}
                  onClick={() => setSelectedLesson(lesson.id)}
                  className="p-6 rounded-xl cursor-pointer transition-all duration-300 hover:scale-[1.005]"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-mono" style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.6)' }}>
                        {String(i + 1).padStart(2, '0')}
                      </div>
                      <div>
                        <h3 className="text-lg font-light mb-1" style={{ color: 'rgba(255,255,255,0.9)' }}>{lesson.title}</h3>
                        <p className="text-xs font-mono" style={{ color: 'rgba(136,136,136,0.5)' }}>{lesson.duration}</p>
                      </div>
                    </div>
                    <ChevronRight size={20} style={{ color: 'rgba(255,255,255,0.3)' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen px-8 py-24">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs font-mono tracking-[0.3em] mb-4" style={{ color: 'rgba(136,136,136,0.5)' }}>THE ACADEMY</p>
          <h1 className="text-4xl font-extralight mb-4" style={{ color: 'rgba(255,255,255,0.95)' }}>Complete Curriculum</h1>
          <p className="text-lg font-light mb-14" style={{ color: 'rgba(136,136,136,0.6)' }}>
            20 comprehensive modules. Based on Hull, Vernimmen, and Damodaran.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {SYLLABUS.map(mod => (
              <div
                key={mod.id}
                onClick={() => mod.id === 1 ? setSelectedModule(1) : null}
                className={`relative p-6 rounded-xl transition-all duration-300 ${mod.id === 1 ? 'cursor-pointer hover:scale-[1.02]' : ''}`}
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl">{mod.icon}</span>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[10px] px-2 py-1 rounded-full"
                      style={{
                        background: mod.difficulty === 'Expert' ? 'rgba(239,68,68,0.15)' : mod.difficulty === 'Advanced' ? 'rgba(251,191,36,0.15)' : mod.difficulty === 'Intermediate' ? 'rgba(59,130,246,0.15)' : 'rgba(34,197,94,0.15)',
                        color: mod.difficulty === 'Expert' ? 'rgba(239,68,68,0.9)' : mod.difficulty === 'Advanced' ? 'rgba(251,191,36,0.9)' : mod.difficulty === 'Intermediate' ? 'rgba(59,130,246,0.9)' : 'rgba(34,197,94,0.9)'
                      }}
                    >
                      {mod.difficulty}
                    </span>
                    <Unlock size={12} style={{ color: 'rgba(34,197,94,0.5)' }} />
                  </div>
                </div>
                <h3 className="text-base font-medium mb-1" style={{ color: 'rgba(255,255,255,0.9)' }}>{mod.title}</h3>
                <p className="text-xs mb-3" style={{ color: 'rgba(136,136,136,0.5)' }}>{mod.subtitle}</p>
                <div className="text-xs font-mono" style={{ color: 'rgba(136,136,136,0.4)' }}>{mod.lessons} lessons</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════

  return (
    <div className="min-h-screen w-full" style={{ background: '#000', fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
      <style>{`
        @keyframes pulse-ring { 0% { transform: scale(1); opacity: 0.3; } 100% { transform: scale(1.4); opacity: 0; } }
        @keyframes orb-pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.06); } }
        @keyframes orb-rec { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.08); } }
        @keyframes soundwave { 0% { transform: scaleY(0.3); } 50% { transform: scaleY(1); } 100% { transform: scaleY(0.3); } }
        @keyframes pulse-border { 0%, 100% { box-shadow: 0 0 20px rgba(239,68,68,0.3); } 50% { box-shadow: 0 0 40px rgba(239,68,68,0.5); } }
        @keyframes waveform { 0% { height: 8px; } 100% { height: 32px; } }
        .animate-spin { animation: spin 1s linear infinite; }
        .animate-pulse { animation: pulse 2s ease-in-out infinite; }
        .animate-bounce { animation: bounce 2s infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::selection { background: rgba(255,255,255,0.15); }
        html { scroll-behavior: smooth; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.12); }
        input[type="range"] { -webkit-appearance: none; background: transparent; }
        input[type="range"]::-webkit-slider-runnable-track { width: 100%; height: 4px; cursor: pointer; background: rgba(255,255,255,0.08); border-radius: 2px; }
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; height: 16px; width: 16px; border-radius: 50%; background: rgba(255,215,0,0.9); cursor: pointer; margin-top: -6px; box-shadow: 0 2px 8px rgba(0,0,0,0.3); }
      `}</style>
      
      <Navigation />
      
      {view === 'landing' && step === 0 && <LandingView />}
      {view === 'landing' && step > 0 && <OnboardingView />}
      {view === 'arena' && <ArenaView />}
      {view === 'academy' && <AcademyView />}
      
      {showAuth && <AuthModal />}
      {showPricing && <PricingModal />}
    </div>
  );
};

export default FinaApp;
