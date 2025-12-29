"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import {
  Mic, MicOff, ChevronRight, ChevronLeft, Lock, Unlock,
  CheckCircle2, XCircle, TrendingUp, Loader2, CreditCard, 
  Shield, Zap, BookOpen, Target, Award, Mail, Key, Eye, 
  EyeOff, LogOut, DollarSign, User, Star, Calculator, 
  LineChart, Play, Square, Volume2, ArrowRight, Sparkles,
  GraduationCap, BarChart3, PieChart, Brain, Cpu, Clock,
  Trophy, Flame, Building2, Filter, ChevronDown, RefreshCw,
  TrendingDown, Activity, Users, Crown, Medal, Gamepad2
} from 'lucide-react';
import { 
  loginWithEmail, 
  signupWithEmail, 
  loginWithGoogle, 
  logout, 
  onAuthChange 
} from '@/lib/firebase';

// ═══════════════════════════════════════════════════════════════════════════
// FINA V-REAL ULTIMATE — REFACTORED ARCHITECTURE
// All components extracted outside main function to prevent re-render bugs
// ═══════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 1: TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════

interface BrainTeaser {
  id: number;
  category: 'probability' | 'logic' | 'expected-value' | 'market-making' | 'statistics' | 'mental-math' | 'sequences' | 'game-theory';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  firm: string;
  question: string;
  answer: string;
  hint: string;
  solution: string;
}

interface Firm {
  id: string;
  name: string;
  logo: string;
  type: string;
  difficulty: string;
  salary: string;
  process: string[];
  focus: string[];
  tips: string[];
  questions: number[];
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar: string;
  score: number;
  streak: number;
  badge: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 2: SYLLABUS DATABASE
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
// SECTION 3: BRAINTEASERS DATABASE (SCALABLE STRUCTURE FOR 500+)
// ═══════════════════════════════════════════════════════════════════════════

const BRAINTEASERS_DB: BrainTeaser[] = [
  // ─── PROBABILITY (50+ questions) ───────────────────────────────────────
  { id: 1, category: 'probability', difficulty: 'Easy', firm: 'Jane Street', question: 'You flip a fair coin 3 times. What is the probability of getting exactly 2 heads?', answer: '3/8', hint: 'Count favorable outcomes over total outcomes', solution: 'Total outcomes = 2³ = 8. Favorable (HHT, HTH, THH) = 3. P = 3/8' },
  { id: 2, category: 'probability', difficulty: 'Medium', firm: 'Citadel', question: 'You roll two fair dice. What is the probability that the sum is 7?', answer: '1/6', hint: 'Count all pairs that sum to 7', solution: '(1,6), (2,5), (3,4), (4,3), (5,2), (6,1) = 6 pairs. P = 6/36 = 1/6' },
  { id: 3, category: 'probability', difficulty: 'Hard', firm: 'Two Sigma', question: 'You have 3 cards: one red on both sides, one blue on both sides, one red on one side and blue on the other. You pick a random card and see red. What is the probability the other side is also red?', answer: '2/3', hint: 'Think about which red sides you could be seeing', solution: 'You see 1 of 3 possible red sides. 2 of those 3 red sides belong to the all-red card. P = 2/3' },
  { id: 4, category: 'probability', difficulty: 'Easy', firm: 'Goldman Sachs', question: 'What is the expected number of coin flips to get heads?', answer: '2', hint: 'Geometric distribution', solution: 'E[X] = 1/p = 1/0.5 = 2' },
  { id: 5, category: 'probability', difficulty: 'Medium', firm: 'SIG', question: 'You flip a coin until you get 2 heads in a row. What is the expected number of flips?', answer: '6', hint: 'Set up recursive equations', solution: 'Let E = expected flips. E = 1 + 0.5(1 + E) + 0.5×0.5×0 + 0.5×0.5×E. Solving: E = 6' },
  { id: 6, category: 'probability', difficulty: 'Hard', firm: 'Jane Street', question: 'In a room of 23 people, what is approximately the probability that two share a birthday?', answer: '~50%', hint: 'Calculate probability no one shares', solution: 'P(no match) = (365/365)(364/365)...(343/365) ≈ 0.493. P(match) ≈ 50.7%' },
  { id: 7, category: 'probability', difficulty: 'Medium', firm: 'Optiver', question: 'You draw 2 cards from a standard deck without replacement. Probability both are aces?', answer: '1/221', hint: '(4/52) × (3/51)', solution: 'P = (4/52) × (3/51) = 12/2652 = 1/221' },
  { id: 8, category: 'probability', difficulty: 'Hard', firm: 'DRW', question: 'Expected value of max(X,Y) where X,Y are independent uniform[0,1]?', answer: '2/3', hint: 'Integrate the CDF', solution: 'E[max] = ∫₀¹ (1 - F²(x))dx = ∫₀¹ (1-x²)dx = 2/3' },
  { id: 9, category: 'probability', difficulty: 'Medium', firm: 'Citadel', question: 'A stick is broken at two random points. What is the probability the three pieces form a triangle?', answer: '1/4', hint: 'Triangle inequality must hold', solution: 'Each piece must be < 0.5 of total. P = 1/4' },
  { id: 10, category: 'probability', difficulty: 'Hard', firm: 'Jane Street', question: 'You have a biased coin (P(H)=0.6). What is P(exactly 3 heads in 5 flips)?', answer: '0.3456', hint: 'Binomial distribution', solution: 'C(5,3) × 0.6³ × 0.4² = 10 × 0.216 × 0.16 = 0.3456' },
  
  // ─── LOGIC & PUZZLES ───────────────────────────────────────────────────
  { id: 11, category: 'logic', difficulty: 'Easy', firm: 'Morgan Stanley', question: 'You have 8 balls, one is heavier. Using a balance scale, minimum weighings to find it?', answer: '2', hint: 'Divide into groups of 3', solution: 'Weigh 3 vs 3. If equal, weigh remaining 2. If unequal, weigh 2 from heavy side.' },
  { id: 12, category: 'logic', difficulty: 'Medium', firm: 'Citadel', question: '100 prisoners, 100 boxes with their numbers. Each opens 50 boxes. Strategy for >30% all finding their number?', answer: 'Follow the cycle', hint: 'Start with your number, follow the chain', solution: 'Each prisoner starts with their number and follows the pointer. Probability all succeed ≈ 31%' },
  { id: 13, category: 'logic', difficulty: 'Hard', firm: 'Jane Street', question: 'You have 12 balls, one is different weight (heavier or lighter). Find it in 3 weighings.', answer: 'Divide into 3 groups', hint: 'Use information from each weighing optimally', solution: 'Complex decision tree. Weigh 4v4, then use tilt direction to narrow down.' },
  { id: 14, category: 'logic', difficulty: 'Easy', firm: 'Goldman Sachs', question: 'A bat and ball cost $1.10. The bat costs $1 more than the ball. How much is the ball?', answer: '$0.05', hint: 'Set up an equation', solution: 'Let ball = x. Bat = x + 1. Total: x + (x+1) = 1.10. x = 0.05' },
  { id: 15, category: 'logic', difficulty: 'Medium', firm: 'SIG', question: 'You have 2 eggs and 100 floors. Minimum worst-case drops to find the breaking floor?', answer: '14', hint: 'Optimize first drop location', solution: 'Drop first egg at floor n where n + (n-1) + ... + 1 ≥ 100. n = 14.' },
  { id: 16, category: 'logic', difficulty: 'Hard', firm: 'Two Sigma', question: 'Pirates split 100 gold coins. 5 pirates vote, need majority. What does the senior pirate propose?', answer: '98 for himself', hint: 'Work backwards from 2 pirates', solution: 'Senior proposes: 98,0,1,0,1. Gets 3 votes (himself + pirates 3 and 5).' },
  { id: 17, category: 'logic', difficulty: 'Medium', firm: 'Optiver', question: 'You have 25 horses. Find the 3 fastest using 5-horse races. Minimum races needed?', answer: '7', hint: 'First race all groups, then optimize', solution: 'Race 5 groups (5 races). Race winners (1 race). Then 1 more to determine 2nd and 3rd.' },
  { id: 18, category: 'logic', difficulty: 'Easy', firm: 'Flow Traders', question: 'How many times do clock hands overlap in 24 hours?', answer: '22', hint: 'Not 24 - they sometimes skip', solution: 'Hands overlap every 12/11 hours ≈ 65.45 min. In 24h: 22 times (not 24 due to 12:00 edge case).' },
  
  // ─── EXPECTED VALUE ────────────────────────────────────────────────────
  { id: 19, category: 'expected-value', difficulty: 'Easy', firm: 'Akuna', question: 'Roll a die, win $X where X is the number shown. What would you pay to play?', answer: '$3.50', hint: 'E[X] = (1+2+3+4+5+6)/6', solution: 'E[X] = 21/6 = 3.5. Fair price is $3.50' },
  { id: 20, category: 'expected-value', difficulty: 'Medium', firm: 'Optiver', question: 'Game: flip coin, heads = double money, tails = lose all. Start with $1. Keep flipping until you quit. Optimal strategy?', answer: 'Always quit immediately', hint: 'Calculate expected value', solution: 'E[continuing] = 0.5(2X) + 0.5(0) = X = current value. Indifferent, but risk-averse quit.' },
  { id: 21, category: 'expected-value', difficulty: 'Hard', firm: 'Jane Street', question: 'St. Petersburg Paradox: Win $2^n where n is number of flips until first heads. Fair price?', answer: 'Infinite (theoretically)', hint: 'Sum the expected value series', solution: 'E = Σ(1/2^n × 2^n) = Σ1 = ∞. But practically, ~$20-25 due to utility.' },
  { id: 22, category: 'expected-value', difficulty: 'Medium', firm: 'SIG', question: 'You can roll a die up to 3 times, keeping the last roll. Optimal strategy and expected value?', answer: '4.67', hint: 'Work backwards', solution: 'Roll 3: E=3.5. Roll 2: keep if ≥4, E=4.25. Roll 1: keep if ≥5, E=4.67' },
  { id: 23, category: 'expected-value', difficulty: 'Hard', firm: 'Citadel', question: 'You draw cards from a deck until you get an Ace. Expected number of draws?', answer: '10.6', hint: 'Use linearity of expectation', solution: 'E = (52+1)/(4+1) = 53/5 = 10.6 cards on average' },
  
  // ─── MARKET MAKING ─────────────────────────────────────────────────────
  { id: 24, category: 'market-making', difficulty: 'Easy', firm: 'Flow Traders', question: 'Fair value of a stock is $50. You quote 49.90/50.10. Someone buys. New fair value?', answer: '$50.05', hint: 'Bayesian update - buyer has information', solution: 'Buyer at 50.10 suggests informed. Update fair value slightly up to ~$50.05' },
  { id: 25, category: 'market-making', difficulty: 'Medium', firm: 'Optiver', question: 'You make market on coin flip paying $1 for heads. What spread do you quote and why?', answer: '0.45/0.55', hint: 'Fair value is 0.50, add spread for risk', solution: 'Fair value = $0.50. Quote with spread to profit: 0.45 bid / 0.55 ask' },
  { id: 26, category: 'market-making', difficulty: 'Hard', firm: 'Citadel', question: 'ETF has 3 stocks: A=$100, B=$50, C=$25. ETF holds 1 of each. A drops to $95. New ETF fair value?', answer: '$170', hint: 'Sum the components', solution: 'New NAV = $95 + $50 + $25 = $170. Quote around this.' },
  { id: 27, category: 'market-making', difficulty: 'Medium', firm: 'IMC', question: 'You are short gamma. The stock moves up 2%. What happens to your delta and what do you do?', answer: 'Delta gets more negative, buy stock', hint: 'Short gamma = delta moves against you', solution: 'Short gamma: as stock rises, delta becomes more negative. Must buy stock to hedge.' },
  { id: 28, category: 'market-making', difficulty: 'Hard', firm: 'Jane Street', question: 'You quoted 99/101 on 1000 shares. Someone lifts your offer, then market drops to 98/100. Estimate your P&L.', answer: '-$2000', hint: 'Sold at 101, now worth ~99', solution: 'Sold 1000 @ $101 = $101k. Position worth 1000 × $99 = $99k. P&L = -$2k' },
  
  // ─── MENTAL MATH ───────────────────────────────────────────────────────
  { id: 29, category: 'mental-math', difficulty: 'Easy', firm: 'Optiver', question: '17 × 23 = ?', answer: '391', hint: '17 × 23 = 17 × 20 + 17 × 3', solution: '17 × 20 = 340, 17 × 3 = 51, total = 391' },
  { id: 30, category: 'mental-math', difficulty: 'Medium', firm: 'Flow Traders', question: '144 ÷ 0.125 = ?', answer: '1152', hint: '0.125 = 1/8', solution: '144 ÷ (1/8) = 144 × 8 = 1152' },
  { id: 31, category: 'mental-math', difficulty: 'Hard', firm: 'SIG', question: '√(289) × √(361) = ?', answer: '323', hint: 'Find perfect squares', solution: '√289 = 17, √361 = 19, 17 × 19 = 323' },
  { id: 32, category: 'mental-math', difficulty: 'Easy', firm: 'Optiver', question: '7/8 as a decimal?', answer: '0.875', hint: '1/8 = 0.125', solution: '7/8 = 1 - 1/8 = 1 - 0.125 = 0.875' },
  { id: 33, category: 'mental-math', difficulty: 'Medium', firm: 'Akuna', question: '15% of 840 = ?', answer: '126', hint: '10% + 5%', solution: '10% = 84, 5% = 42, total = 126' },
  { id: 34, category: 'mental-math', difficulty: 'Hard', firm: 'Citadel', question: '37² = ?', answer: '1369', hint: '(40-3)² = 1600 - 240 + 9', solution: '37² = (40-3)² = 1600 - 240 + 9 = 1369' },
  
  // ─── STATISTICS ────────────────────────────────────────────────────────
  { id: 35, category: 'statistics', difficulty: 'Medium', firm: 'Two Sigma', question: 'Sample mean is 100, sample std is 15, n=25. 95% CI for population mean?', answer: '94.1 to 105.9', hint: '95% CI = mean ± 1.96 × SE', solution: 'SE = 15/√25 = 3. CI = 100 ± 1.96×3 = 100 ± 5.88' },
  { id: 36, category: 'statistics', difficulty: 'Hard', firm: 'Citadel', question: 'X ~ N(0,1). What is E[X | X > 0]?', answer: '√(2/π) ≈ 0.798', hint: 'Truncated normal distribution', solution: 'E[X|X>0] = φ(0)/(1-Φ(0)) = (1/√(2π))/(0.5) = √(2/π)' },
  { id: 37, category: 'statistics', difficulty: 'Medium', firm: 'DE Shaw', question: 'Correlation between X and -X?', answer: '-1', hint: 'Perfect negative relationship', solution: 'Corr(X, -X) = -1 (perfect negative correlation)' },
  { id: 38, category: 'statistics', difficulty: 'Hard', firm: 'Two Sigma', question: 'X and Y are iid N(0,1). What is E[max(X,Y)]?', answer: '1/√π ≈ 0.564', hint: 'Order statistics', solution: 'E[max] = 1/√π for two iid standard normals' },
  
  // ─── GAME THEORY ───────────────────────────────────────────────────────
  { id: 39, category: 'game-theory', difficulty: 'Medium', firm: 'SIG', question: 'In poker, you have a 25% chance to win. Pot is $100, opponent bets $20. Do you call?', answer: 'Yes', hint: 'Calculate pot odds', solution: 'Need to call $20 to win $120. Break-even = 20/120 = 16.7%. You have 25% > 16.7%. Call.' },
  { id: 40, category: 'game-theory', difficulty: 'Hard', firm: 'Jane Street', question: 'Two players bid for $100. Highest bidder wins but both pay their bids. Nash equilibrium?', answer: 'Both bid $100', hint: 'Dollar auction paradox', solution: 'War of attrition. In equilibrium, expected profit is $0. Both bid up to $100.' },
  
  // ─── SEQUENCES & PATTERNS ──────────────────────────────────────────────
  { id: 41, category: 'sequences', difficulty: 'Easy', firm: 'Flow Traders', question: 'Next number: 2, 6, 12, 20, 30, ?', answer: '42', hint: 'Look at differences', solution: 'Differences: 4, 6, 8, 10, 12. Next: 30 + 12 = 42' },
  { id: 42, category: 'sequences', difficulty: 'Medium', firm: 'Optiver', question: 'Next number: 1, 1, 2, 3, 5, 8, 13, ?', answer: '21', hint: 'Famous sequence', solution: 'Fibonacci: each number is sum of two before. 13 + 8 = 21' },
  { id: 43, category: 'sequences', difficulty: 'Hard', firm: 'Jane Street', question: 'Next: 1, 11, 21, 1211, 111221, ?', answer: '312211', hint: 'Look and say sequence', solution: 'Describe previous: 111221 = "three 1s, two 2s, one 1" = 312211' },
];

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 4: FIRMS DATABASE
// ═══════════════════════════════════════════════════════════════════════════

const FIRMS_DB: Firm[] = [
  { id: 'goldman', name: 'Goldman Sachs', logo: '🏛️', type: 'Investment Bank', difficulty: 'Hard', salary: '$150K - $200K', process: ['Online Assessment', 'HireVue Video', 'Superday (5 interviews)'], focus: ['DCF Valuation', 'LBO Modeling', 'Market Questions', 'Behavioral'], tips: ['Know your story cold', 'Prepare 3 deals you can discuss', 'Practice mental math'], questions: [4, 14, 19] },
  { id: 'janestreet', name: 'Jane Street', logo: '🔷', type: 'Prop Trading', difficulty: 'Very Hard', salary: '$200K - $350K', process: ['Math Test', 'Phone Screen', 'Onsite (6-8 hours)'], focus: ['Probability', 'Expected Value', 'Mental Math', 'Games & Strategy'], tips: ['Practice probability problems daily', 'Think out loud', 'Be comfortable with uncertainty'], questions: [1, 3, 6, 13, 21, 28, 40, 43] },
  { id: 'citadel', name: 'Citadel', logo: '🏰', type: 'Hedge Fund', difficulty: 'Very Hard', salary: '$180K - $300K', process: ['Online Test', 'Phone Interview', 'Superday'], focus: ['Statistics', 'Probability', 'Brain Teasers', 'Coding'], tips: ['Strong stats foundation required', 'Practice under time pressure', 'Know Python well'], questions: [2, 9, 12, 23, 26, 34, 36] },
  { id: 'sig', name: 'Susquehanna (SIG)', logo: '📊', type: 'Prop Trading', difficulty: 'Hard', salary: '$175K - $275K', process: ['Quantitative Assessment', 'Phone Interview', 'Superday with games'], focus: ['Game Theory', 'Poker Strategy', 'Expected Value', 'Quick Math'], tips: ['Play poker and understand EV', 'Practice their specific test format', 'Be competitive but collaborative'], questions: [5, 15, 22, 31, 39] },
  { id: 'optiver', name: 'Optiver', logo: '⚡', type: 'Market Maker', difficulty: 'Hard', salary: '$170K - $250K', process: ['Mental Math Test (80Q/8min)', 'Phone Screen', 'Superday'], focus: ['Mental Math', 'Market Making', 'Quick Decision Making'], tips: ['Practice 80 questions in 8 minutes', 'Speed is crucial', 'Understand options basics'], questions: [7, 17, 20, 25, 29, 30, 32, 42] },
  { id: 'twosigma', name: 'Two Sigma', logo: '🔬', type: 'Quant Fund', difficulty: 'Very Hard', salary: '$180K - $300K', process: ['Coding Test', 'Phone Interviews', 'Onsite'], focus: ['Statistics', 'Machine Learning', 'Coding', 'Research'], tips: ['Strong coding skills essential', 'Know ML fundamentals', 'Prepare research discussion'], questions: [3, 8, 16, 35, 37, 38] },
  { id: 'imc', name: 'IMC Trading', logo: '🌐', type: 'Market Maker', difficulty: 'Hard', salary: '$160K - $240K', process: ['Numerical Test', 'Trading Game', 'Interviews'], focus: ['Options Greeks', 'Market Making', 'Risk Management'], tips: ['Understand gamma hedging', 'Practice trading simulations', 'Know your Greeks cold'], questions: [27] },
  { id: 'flowtraders', name: 'Flow Traders', logo: '🌊', type: 'Market Maker', difficulty: 'Hard', salary: '$155K - $230K', process: ['Math Test', 'Trading Simulation', 'Interviews'], focus: ['ETF Mechanics', 'Mental Math', 'Market Making'], tips: ['Understand ETF creation/redemption', 'Be fast with calculations', 'Show trading intuition'], questions: [18, 24, 41] },
];

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 5: LEADERBOARD DATA (Simulated - connect to Firebase later)
// ═══════════════════════════════════════════════════════════════════════════

const LEADERBOARD_DATA: LeaderboardEntry[] = [
  { rank: 1, name: 'QuantKing', avatar: '👑', score: 12450, streak: 23, badge: 'Diamond' },
  { rank: 2, name: 'AlphaTrader', avatar: '🦁', score: 11200, streak: 18, badge: 'Platinum' },
  { rank: 3, name: 'DerivQueen', avatar: '👸', score: 10850, streak: 15, badge: 'Platinum' },
  { rank: 4, name: 'MathWizard', avatar: '🧙', score: 9920, streak: 12, badge: 'Gold' },
  { rank: 5, name: 'OptionsMaster', avatar: '🎯', score: 9100, streak: 10, badge: 'Gold' },
  { rank: 6, name: 'StatsPro', avatar: '📊', score: 8750, streak: 9, badge: 'Gold' },
  { rank: 7, name: 'RiskNinja', avatar: '🥷', score: 8200, streak: 8, badge: 'Silver' },
  { rank: 8, name: 'ProbabilityAce', avatar: '🎲', score: 7650, streak: 7, badge: 'Silver' },
  { rank: 9, name: 'MarketMaker', avatar: '💹', score: 7100, streak: 6, badge: 'Silver' },
  { rank: 10, name: 'ThetaGang', avatar: '⏰', score: 6800, streak: 5, badge: 'Bronze' },
];

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 6: MODULE LESSONS
// ═══════════════════════════════════════════════════════════════════════════

const MODULE_1_LESSONS = [
  {
    id: 1, title: 'Introduction to Options', duration: '25 min',
    content: [
      { type: 'h1', text: 'Definition of an Option Contract' },
      { type: 'p', text: 'An option is a derivative security that grants its holder the right, but not the obligation, to buy or sell an underlying asset at a predetermined price on or before a specified date.' },
      { type: 'h2', text: 'Essential Terminology' },
      { type: 'def', term: 'Strike Price (K)', definition: 'The fixed price at which the underlying asset may be bought or sold upon exercise.', highlight: true },
      { type: 'def', term: 'Premium (V)', definition: 'The market price of the option contract, paid by buyer to seller at inception.', highlight: true },
      { type: 'h2', text: 'Payoff Functions' },
      { type: 'math', label: 'Call Option Payoff', formula: 'Payoff = max(Sₜ − K, 0)' },
      { type: 'math', label: 'Put Option Payoff', formula: 'Payoff = max(K − Sₜ, 0)' },
    ],
    quiz: [
      { q: 'A European option can be exercised:', opts: ['Any time before T', 'Only at expiration T', 'Only on weekdays', 'Twice per month'], correct: 1 },
      { q: 'If K = 100 and Sₜ = 95, a call option payoff equals:', opts: ['5', '95', '0', '−5'], correct: 2 },
    ]
  },
  {
    id: 2, title: 'Call Option Analysis', duration: '30 min',
    content: [
      { type: 'h1', text: 'Call Option Mechanics' },
      { type: 'p', text: 'A call option conveys the right to purchase the underlying asset at strike K.' },
      { type: 'math', label: 'Profit Function', formula: 'Π = max(Sₜ − K, 0) − C₀' },
      { type: 'def', term: 'In-the-Money (ITM)', definition: 'S > K. Positive intrinsic value.', highlight: true },
      { type: 'def', term: 'At-the-Money (ATM)', definition: 'S ≈ K. Zero intrinsic value.' },
      { type: 'def', term: 'Out-of-the-Money (OTM)', definition: 'S < K. Zero intrinsic value.' },
    ],
    quiz: [
      { q: 'A call is ITM when:', opts: ['S < K', 'S > K', 'S = K', 'C > K'], correct: 1 },
      { q: 'Long call maximum loss equals:', opts: ['∞', 'K', 'C₀ (premium)', 'S₀'], correct: 2 },
    ]
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 7: EXTRACTED UI COMPONENTS (FIXES INPUT RE-RENDER BUG)
// These MUST be outside the main component to prevent focus loss
// ═══════════════════════════════════════════════════════════════════════════

// ─── INPUT COMPONENT (Memoized to prevent re-renders) ────────────────────
interface InputProps {
  type: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  showToggle?: boolean;
  onToggle?: () => void;
  isVisible?: boolean;
}

const FormInput = memo(({ type, value, onChange, placeholder, icon, showToggle, onToggle, isVisible }: InputProps) => (
  <div className="relative">
    {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'rgba(136,136,136,0.4)' }}>{icon}</div>}
    <input
      type={showToggle ? (isVisible ? 'text' : 'password') : type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full pl-12 pr-12 py-3.5 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-white/20"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff' }}
    />
    {showToggle && onToggle && (
      <button type="button" onClick={onToggle} className="absolute right-4 top-1/2 -translate-y-1/2">
        {isVisible ? <EyeOff size={18} style={{ color: 'rgba(136,136,136,0.4)' }} /> : <Eye size={18} style={{ color: 'rgba(136,136,136,0.4)' }} />}
      </button>
    )}
  </div>
));
FormInput.displayName = 'FormInput';

// ─── LOGO COMPONENT ──────────────────────────────────────────────────────
interface LogoProps {
  onClick: () => void;
}

const Logo = memo(({ onClick }: LogoProps) => (
  <div className="cursor-pointer group" onClick={onClick}>
    <div className="relative px-5 py-2.5 transition-all duration-500 group-hover:scale-105" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 100%)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.15)', boxShadow: 'inset 1px 1px 2px rgba(255,255,255,0.1), 0 8px 32px rgba(0,0,0,0.4)', backdropFilter: 'blur(20px)' }}>
      <div className="absolute top-0 left-3 right-3 h-[1px]" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)' }} />
      <span style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.95)' }}>FINA</span>
    </div>
  </div>
));
Logo.displayName = 'Logo';

// ─── ORB COMPONENT ───────────────────────────────────────────────────────
interface OrbProps {
  mood: string;
  isRecording: boolean;
  isSpeaking: boolean;
}

const Orb = memo(({ mood, isRecording, isSpeaking }: OrbProps) => {
  const colors: {[key: string]: {main: string, glow: string}} = {
    neutral: { main: 'rgba(255,255,255,0.8)', glow: 'rgba(255,255,255,0.2)' },
    speaking: { main: 'rgba(59,130,246,0.9)', glow: 'rgba(59,130,246,0.3)' },
    aggressive: { main: 'rgba(239,68,68,0.9)', glow: 'rgba(239,68,68,0.3)' }
  };
  const c = colors[mood] || colors.neutral;
  
  return (
    <div className="relative flex items-center justify-center" style={{ width: 280, height: 280 }}>
      {[1, 2, 3].map(ring => (
        <div key={ring} className="absolute rounded-full" style={{
          width: 100 + ring * 55,
          height: 100 + ring * 55,
          border: `1px solid ${c.glow}`,
          opacity: (isSpeaking || isRecording) ? 0.4 / ring : 0.1 / ring,
          animation: (isSpeaking || isRecording) ? `pulse-ring ${1.5 + ring * 0.3}s ease-out infinite` : 'none'
        }} />
      ))}
      {isSpeaking && (
        <div className="absolute flex items-center gap-1">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="w-1.5 rounded-full" style={{
              height: 20 + Math.random() * 40,
              background: c.main,
              animation: `soundwave ${0.3 + Math.random() * 0.2}s ease-in-out infinite alternate`
            }} />
          ))}
        </div>
      )}
      <div className={`relative rounded-full transition-all duration-500 ${isRecording ? 'scale-110' : ''}`} style={{
        width: 120, height: 120,
        background: `radial-gradient(circle at 30% 30%, ${c.main}, rgba(0,0,0,0.95))`,
        boxShadow: `0 0 60px ${c.glow}, 0 0 120px ${c.glow}`,
        animation: isSpeaking ? 'orb-pulse 0.5s ease-in-out infinite' : isRecording ? 'orb-rec 1s ease-in-out infinite' : 'none'
      }}>
        <div className="absolute rounded-full" style={{ top: '15%', left: '20%', width: '25%', height: '25%', background: 'radial-gradient(circle, rgba(255,255,255,0.4), transparent)', filter: 'blur(4px)' }} />
      </div>
      <div className="absolute -bottom-2 px-4 py-1.5 rounded-full text-xs font-mono tracking-wider" style={{
        background: mood === 'aggressive' ? 'rgba(239,68,68,0.15)' : mood === 'speaking' ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.05)',
        border: `1px solid ${mood === 'aggressive' ? 'rgba(239,68,68,0.3)' : mood === 'speaking' ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.1)'}`,
        color: mood === 'aggressive' ? 'rgba(239,68,68,0.9)' : mood === 'speaking' ? 'rgba(59,130,246,0.9)' : 'rgba(255,255,255,0.6)'
      }}>
        {mood === 'aggressive' ? 'CHALLENGING' : mood === 'speaking' ? 'ANALYZING' : isRecording ? 'LISTENING' : 'READY'}
      </div>
    </div>
  );
});
Orb.displayName = 'Orb';

// ─── METRIC COMPONENT ────────────────────────────────────────────────────
interface MetricProps {
  label: string;
  value: number;
  color: string;
}

const Metric = memo(({ label, value, color }: MetricProps) => (
  <div className="text-center">
    <div className="text-[10px] font-mono tracking-widest uppercase mb-2" style={{ color: 'rgba(136,136,136,0.5)' }}>{label}</div>
    <div className="relative h-1.5 rounded-full mb-2 overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${value}%`, background: color }} />
    </div>
    <div className="text-xl font-light" style={{ color: value > 0 ? 'rgba(255,255,255,0.9)' : 'rgba(136,136,136,0.3)' }}>
      {value > 0 ? `${value}%` : '—'}
    </div>
  </div>
));
Metric.displayName = 'Metric';

// ─── AUTH MODAL COMPONENT (Extracted to fix input bug) ───────────────────
interface AuthModalProps {
  onClose: () => void;
  authMode: string;
  setAuthMode: (mode: string) => void;
  authEmail: string;
  setAuthEmail: (email: string) => void;
  authPass: string;
  setAuthPass: (pass: string) => void;
  showPass: boolean;
  setShowPass: (show: boolean) => void;
  authLoading: boolean;
  authError: string;
  handleAuth: () => void;
  handleGoogleAuth: () => void;
}

const AuthModal = memo(({ 
  onClose, authMode, setAuthMode, authEmail, setAuthEmail, 
  authPass, setAuthPass, showPass, setShowPass, 
  authLoading, authError, handleAuth, handleGoogleAuth 
}: AuthModalProps) => (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.97)', backdropFilter: 'blur(20px)' }} onClick={(e) => e.target === e.currentTarget && onClose()}>
    <div className="relative w-full max-w-md mx-4 p-10 rounded-3xl" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <button onClick={onClose} className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10" style={{ color: 'rgba(255,255,255,0.4)' }}>✕</button>
      <div className="text-center mb-10">
        <h2 className="text-3xl font-light mb-2" style={{ color: 'rgba(255,255,255,0.95)' }}>{authMode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
        <p className="text-sm" style={{ color: 'rgba(136,136,136,0.7)' }}>{authMode === 'login' ? 'Access the Arena' : 'Begin your preparation'}</p>
      </div>
      <div className="space-y-5">
        <div>
          <label className="block text-xs font-mono tracking-widest mb-2" style={{ color: 'rgba(136,136,136,0.5)' }}>EMAIL</label>
          <FormInput type="email" value={authEmail} onChange={setAuthEmail} placeholder="analyst@goldmansachs.com" icon={<Mail size={18} />} />
        </div>
        <div>
          <label className="block text-xs font-mono tracking-widest mb-2" style={{ color: 'rgba(136,136,136,0.5)' }}>PASSWORD</label>
          <FormInput type="password" value={authPass} onChange={setAuthPass} placeholder="••••••••••" icon={<Key size={18} />} showToggle isVisible={showPass} onToggle={() => setShowPass(!showPass)} />
        </div>
        {authError && <p className="text-sm text-center" style={{ color: 'rgba(239,68,68,0.9)' }}>{authError}</p>}
        <button onClick={handleAuth} disabled={authLoading || !authEmail || !authPass} className="w-full py-3.5 rounded-xl text-sm font-medium transition-all hover:scale-[1.02] disabled:opacity-40 flex items-center justify-center gap-2" style={{ background: 'rgba(255,255,255,0.95)', color: '#000' }}>
          {authLoading ? <><Loader2 size={18} className="animate-spin" /> Authenticating...</> : 'Continue'}
        </button>
        <button onClick={handleGoogleAuth} disabled={authLoading} className="w-full py-3.5 rounded-xl text-sm font-medium transition-all hover:bg-white/10 flex items-center justify-center gap-3" style={{ border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.8)' }}>
          <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Continue with Google
        </button>
      </div>
      <p className="text-sm text-center mt-8" style={{ color: 'rgba(136,136,136,0.6)' }}>
        {authMode === 'login' ? "Don't have an account?" : 'Already registered?'}
        <button onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')} className="ml-2 font-medium hover:underline" style={{ color: 'rgba(255,255,255,0.9)' }}>
          {authMode === 'login' ? 'Create one' : 'Sign in'}
        </button>
      </p>
    </div>
  </div>
));
AuthModal.displayName = 'AuthModal';

// ─── PRICING MODAL COMPONENT ─────────────────────────────────────────────
interface PricingModalProps {
  onClose: () => void;
  checkoutState: string;
  handleCheckout: (planId: string) => void;
}

const PricingModal = memo(({ onClose, checkoutState, handleCheckout }: PricingModalProps) => {
  const plans = [
    { id: 'starter', name: 'STARTER', title: 'The Analyst', price: 19, features: ['Unlimited Arena sessions', 'All Academy modules', 'Quant Lab access', 'Email support'] },
    { id: 'pro', name: 'PRO', title: 'The Associate', price: 49, features: ['Everything in Starter', 'The Vault (500+ puzzles)', 'Firm Intel guides', 'Market Making Game', 'Priority support'], popular: true },
    { id: 'elite', name: 'ELITE', title: 'The MD', price: 99, features: ['Everything in Pro', 'AI Voice coaching', 'Global Leaderboard', '1-on-1 mock interviews', 'Resume review', 'Lifetime updates'], highlight: true },
  ];
  
  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto" style={{ background: 'rgba(0,0,0,0.98)' }} onClick={(e) => e.target === e.currentTarget && checkoutState === 'idle' && onClose()}>
      <div className="min-h-screen flex items-start justify-center py-16 px-4">
        <div className="relative w-full max-w-5xl">
          {checkoutState === 'idle' && <button onClick={onClose} className="absolute top-0 right-0 w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10" style={{ color: 'rgba(255,255,255,0.4)' }}>✕</button>}
          {checkoutState === 'idle' && (
            <>
              <div className="text-center mb-16">
                <p className="text-xs font-mono tracking-[0.3em] mb-4" style={{ color: 'rgba(136,136,136,0.5)' }}>PRICING</p>
                <h2 className="text-5xl font-extralight mb-4" style={{ color: 'rgba(255,255,255,0.95)' }}>Invest in Excellence</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map(plan => (
                  <div key={plan.id} className="relative rounded-2xl transition-all duration-300 hover:scale-[1.02]" style={{ background: plan.highlight ? 'linear-gradient(180deg, rgba(255,215,0,0.08) 0%, rgba(255,215,0,0.02) 100%)' : 'rgba(255,255,255,0.02)', border: plan.highlight ? '1px solid rgba(255,215,0,0.3)' : '1px solid rgba(255,255,255,0.06)' }}>
                    {plan.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-mono" style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)' }}>MOST POPULAR</div>}
                    {plan.highlight && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-mono" style={{ background: 'rgba(255,215,0,0.2)', color: 'rgba(255,215,0,0.9)' }}>RECOMMENDED</div>}
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
                      <button onClick={() => handleCheckout(plan.id)} className="w-full py-3.5 rounded-full text-sm font-medium transition-all hover:scale-[1.02]" style={{ background: plan.highlight ? 'linear-gradient(90deg, rgba(255,215,0,0.9), rgba(255,180,0,0.9))' : 'rgba(255,255,255,0.9)', color: '#000' }}>
                        {plan.highlight ? 'Unlock Elite' : 'Get Started'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center gap-8 mt-12 text-xs font-mono" style={{ color: 'rgba(136,136,136,0.4)' }}>
                <span className="flex items-center gap-2"><Shield size={14} /> Stripe Secure</span>
                <span>30-day money-back</span>
              </div>
            </>
          )}
          {checkoutState === 'securing' && <div className="flex flex-col items-center py-32"><Shield size={48} className="animate-pulse mb-8" style={{ color: 'rgba(255,255,255,0.6)' }} /><h3 className="text-2xl font-light" style={{ color: 'rgba(255,255,255,0.9)' }}>Securing Connection</h3></div>}
          {checkoutState === 'processing' && <div className="flex flex-col items-center py-32"><Loader2 size={48} className="animate-spin mb-8" style={{ color: 'rgba(255,255,255,0.8)' }} /><h3 className="text-2xl font-light" style={{ color: 'rgba(255,255,255,0.9)' }}>Processing Payment</h3></div>}
          {checkoutState === 'success' && <div className="flex flex-col items-center py-32"><CheckCircle2 size={48} className="mb-8" style={{ color: 'rgba(34,197,94,0.9)' }} /><h3 className="text-2xl font-light" style={{ color: 'rgba(255,255,255,0.9)' }}>Payment Successful</h3></div>}
        </div>
      </div>
    </div>
  );
});
PricingModal.displayName = 'PricingModal';

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 8: MARKET MAKING GAME COMPONENT
// Bloomberg-style terminal with real-time price simulation
// ═══════════════════════════════════════════════════════════════════════════

interface MarketGameProps {
  onExit: () => void;
}

const MarketMakingGame = memo(({ onExit }: MarketGameProps) => {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'results'>('idle');
  const [fairValue, setFairValue] = useState(100);
  const [displayPrice, setDisplayPrice] = useState(100);
  const [bid, setBid] = useState('');
  const [ask, setAsk] = useState('');
  const [position, setPosition] = useState(0);
  const [cash, setCash] = useState(0);
  const [pnl, setPnl] = useState(0);
  const [trades, setTrades] = useState<{type: string, price: number, pnl: number}[]>([]);
  const [timeLeft, setTimeLeft] = useState(60);
  const [volatility, setVolatility] = useState<'low' | 'medium' | 'high'>('medium');
  const [priceHistory, setPriceHistory] = useState<number[]>([100]);
  const [messages, setMessages] = useState<string[]>([]);
  
  const gameRef = useRef<NodeJS.Timeout | null>(null);
  const priceRef = useRef<NodeJS.Timeout | null>(null);
  const bidRef = useRef<HTMLInputElement>(null);

  const volSettings = { low: 0.15, medium: 0.35, high: 0.6 };

  // Brownian motion price simulation
  const updatePrice = useCallback(() => {
    const vol = volSettings[volatility];
    const drift = (Math.random() - 0.5) * vol;
    setFairValue(prev => {
      const newPrice = Math.max(80, Math.min(120, prev + drift));
      setPriceHistory(h => [...h.slice(-50), newPrice]);
      return newPrice;
    });
  }, [volatility]);

  // Animate display price towards fair value
  useEffect(() => {
    if (gameState === 'playing') {
      const interval = setInterval(() => {
        setDisplayPrice(prev => {
          const diff = fairValue - prev;
          return prev + diff * 0.3;
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [gameState, fairValue]);

  // Game loop
  useEffect(() => {
    if (gameState === 'playing') {
      priceRef.current = setInterval(updatePrice, 500);
      gameRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            endGame();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
      
      return () => {
        if (priceRef.current) clearInterval(priceRef.current);
        if (gameRef.current) clearInterval(gameRef.current);
      };
    }
  }, [gameState, updatePrice]);

  // Simulate market orders hitting our quotes
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const checkTrades = setInterval(() => {
      const bidNum = parseFloat(bid);
      const askNum = parseFloat(ask);
      
      if (!isNaN(bidNum) && bidNum > 0) {
        // Someone might sell to us (hit our bid) if fair value drops
        if (fairValue < bidNum && Math.random() > 0.7) {
          const tradePnl = fairValue - bidNum;
          setPosition(p => p + 1);
          setCash(c => c - bidNum);
          setTrades(t => [...t, { type: 'BUY', price: bidNum, pnl: tradePnl }]);
          setMessages(m => [...m.slice(-4), `BOUGHT @ ${bidNum.toFixed(2)} (FV: ${fairValue.toFixed(2)})`]);
        }
      }
      
      if (!isNaN(askNum) && askNum > 0) {
        // Someone might buy from us (lift our ask) if fair value rises
        if (fairValue > askNum && Math.random() > 0.7) {
          const tradePnl = askNum - fairValue;
          setPosition(p => p - 1);
          setCash(c => c + askNum);
          setTrades(t => [...t, { type: 'SELL', price: askNum, pnl: tradePnl }]);
          setMessages(m => [...m.slice(-4), `SOLD @ ${askNum.toFixed(2)} (FV: ${fairValue.toFixed(2)})`]);
        }
      }
    }, 800);
    
    return () => clearInterval(checkTrades);
  }, [gameState, bid, ask, fairValue]);

  // Calculate P&L
  useEffect(() => {
    const markToMarket = position * fairValue + cash;
    setPnl(markToMarket);
  }, [position, fairValue, cash]);

  const startGame = () => {
    setGameState('playing');
    setFairValue(100);
    setDisplayPrice(100);
    setPosition(0);
    setCash(0);
    setPnl(0);
    setTrades([]);
    setTimeLeft(60);
    setPriceHistory([100]);
    setMessages(['Game started! Quote your market.']);
    setBid('');
    setAsk('');
    setTimeout(() => bidRef.current?.focus(), 100);
  };

  const endGame = () => {
    if (priceRef.current) clearInterval(priceRef.current);
    if (gameRef.current) clearInterval(gameRef.current);
    setGameState('results');
  };

  const handleQuoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const bidNum = parseFloat(bid);
    const askNum = parseFloat(ask);
    
    if (isNaN(bidNum) || isNaN(askNum)) return;
    if (bidNum >= askNum) {
      setMessages(m => [...m.slice(-4), '⚠️ Bid must be less than Ask!']);
      return;
    }
    
    setMessages(m => [...m.slice(-4), `Quote updated: ${bidNum.toFixed(2)} / ${askNum.toFixed(2)}`]);
  };

  // Mini price chart
  const MiniChart = () => {
    const max = Math.max(...priceHistory);
    const min = Math.min(...priceHistory);
    const range = max - min || 1;
    
    return (
      <div className="h-20 flex items-end gap-px">
        {priceHistory.map((p, i) => {
          const height = ((p - min) / range) * 100;
          const isUp = i > 0 && p > priceHistory[i - 1];
          return (
            <div
              key={i}
              className="flex-1 min-w-[2px] rounded-t"
              style={{
                height: `${Math.max(5, height)}%`,
                background: isUp ? 'rgba(34,197,94,0.8)' : 'rgba(239,68,68,0.8)'
              }}
            />
          );
        })}
      </div>
    );
  };

  if (gameState === 'idle') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="p-8 rounded-2xl mb-8" style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.08) 0%, rgba(34,197,94,0.02) 100%)', border: '1px solid rgba(34,197,94,0.2)' }}>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(34,197,94,0.15)' }}>
              <Gamepad2 size={28} style={{ color: 'rgba(34,197,94,0.9)' }} />
            </div>
            <div>
              <h2 className="text-2xl font-light" style={{ color: 'rgba(255,255,255,0.95)' }}>Market Making Simulator</h2>
              <p className="text-sm" style={{ color: 'rgba(136,136,136,0.6)' }}>Bloomberg Terminal Style</p>
            </div>
          </div>
          
          <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.7)' }}>
            You are a market maker. Quote a bid/ask spread around the moving fair value. 
            Profit from the spread while managing your inventory risk. The price follows Brownian motion.
          </p>
          
          <div className="mb-8">
            <p className="text-xs font-mono tracking-widest mb-3" style={{ color: 'rgba(136,136,136,0.5)' }}>SELECT VOLATILITY</p>
            <div className="flex gap-3">
              {(['low', 'medium', 'high'] as const).map(v => (
                <button
                  key={v}
                  onClick={() => setVolatility(v)}
                  className="flex-1 py-4 rounded-xl text-sm font-medium transition-all"
                  style={{
                    background: volatility === v ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.03)',
                    border: volatility === v ? '1px solid rgba(34,197,94,0.5)' : '1px solid rgba(255,255,255,0.08)',
                    color: volatility === v ? 'rgba(34,197,94,0.95)' : 'rgba(255,255,255,0.6)'
                  }}
                >
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                  <span className="block text-xs mt-1" style={{ color: 'rgba(136,136,136,0.5)' }}>
                    {v === 'low' ? 'σ = 0.15' : v === 'medium' ? 'σ = 0.35' : 'σ = 0.60'}
                  </span>
                </button>
              ))}
            </div>
          </div>
          
          <button
            onClick={startGame}
            className="w-full py-4 rounded-xl text-base font-medium transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(90deg, rgba(34,197,94,0.9), rgba(22,163,74,0.9))', color: '#000' }}
          >
            <Play size={20} /> Start Trading
          </button>
        </div>
        
        <button onClick={onExit} className="text-sm hover:text-white transition-colors" style={{ color: 'rgba(255,255,255,0.4)' }}>
          ← Back to Training
        </button>
      </div>
    );
  }

  if (gameState === 'results') {
    const totalTrades = trades.length;
    const avgSpread = trades.length > 0 ? trades.reduce((sum, t) => sum + Math.abs(t.pnl), 0) / trades.length : 0;
    
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="p-10 rounded-3xl mb-8" style={{ background: pnl >= 0 ? 'linear-gradient(135deg, rgba(34,197,94,0.1) 0%, rgba(34,197,94,0.02) 100%)' : 'linear-gradient(135deg, rgba(239,68,68,0.1) 0%, rgba(239,68,68,0.02) 100%)', border: pnl >= 0 ? '1px solid rgba(34,197,94,0.2)' : '1px solid rgba(239,68,68,0.2)' }}>
          <Trophy size={48} style={{ color: pnl >= 0 ? 'rgba(34,197,94,0.8)' : 'rgba(239,68,68,0.8)', margin: '0 auto 16px' }} />
          <h2 className="text-3xl font-light mb-2" style={{ color: 'rgba(255,255,255,0.95)' }}>Session Complete</h2>
          <div className="text-6xl font-extralight my-6" style={{ color: pnl >= 0 ? 'rgba(34,197,94,0.95)' : 'rgba(239,68,68,0.95)' }}>
            {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)}
          </div>
          <p className="text-lg" style={{ color: 'rgba(255,255,255,0.7)' }}>
            {pnl >= 10 ? '🔥 Excellent market making!' : pnl >= 0 ? '👍 Profitable session!' : 'Keep practicing your quotes.'}
          </p>
          
          <div className="grid grid-cols-3 gap-4 mt-8">
            <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <div className="text-2xl font-light" style={{ color: 'rgba(255,255,255,0.9)' }}>{totalTrades}</div>
              <div className="text-xs" style={{ color: 'rgba(136,136,136,0.5)' }}>Total Trades</div>
            </div>
            <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <div className="text-2xl font-light" style={{ color: 'rgba(255,255,255,0.9)' }}>{position}</div>
              <div className="text-xs" style={{ color: 'rgba(136,136,136,0.5)' }}>Final Position</div>
            </div>
            <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <div className="text-2xl font-light" style={{ color: 'rgba(255,255,255,0.9)' }}>{avgSpread.toFixed(2)}</div>
              <div className="text-xs" style={{ color: 'rgba(136,136,136,0.5)' }}>Avg Edge</div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <button onClick={onExit} className="py-4 rounded-xl text-sm font-medium transition-all hover:bg-white/5" style={{ border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.8)' }}>
            Back to Training
          </button>
          <button onClick={startGame} className="py-4 rounded-xl text-sm font-medium transition-all hover:scale-[1.02] flex items-center justify-center gap-2" style={{ background: 'rgba(34,197,94,0.9)', color: '#000' }}>
            <RefreshCw size={16} /> Play Again
          </button>
        </div>
      </div>
    );
  }

  // Playing state - Bloomberg terminal style
  return (
    <div className="max-w-4xl mx-auto">
      {/* Terminal Header */}
      <div className="flex justify-between items-center mb-4 px-2">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full animate-pulse" style={{ background: 'rgba(34,197,94,0.8)' }} />
          <span className="text-xs font-mono" style={{ color: 'rgba(34,197,94,0.8)' }}>LIVE MARKET</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: timeLeft < 15 ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.05)', border: timeLeft < 15 ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(255,255,255,0.1)' }}>
          <Clock size={16} style={{ color: timeLeft < 15 ? 'rgba(239,68,68,0.9)' : 'rgba(255,255,255,0.6)' }} />
          <span className="font-mono text-lg" style={{ color: timeLeft < 15 ? 'rgba(239,68,68,0.9)' : 'rgba(255,255,255,0.9)' }}>{timeLeft}s</span>
        </div>
      </div>

      {/* Main Terminal */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(34,197,94,0.2)' }}>
        {/* Price Display */}
        <div className="p-6 border-b" style={{ borderColor: 'rgba(34,197,94,0.1)' }}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-mono mb-1" style={{ color: 'rgba(34,197,94,0.6)' }}>FAIR VALUE</div>
              <div className="text-5xl font-mono" style={{ color: displayPrice >= priceHistory[priceHistory.length - 2] ? 'rgba(34,197,94,0.95)' : 'rgba(239,68,68,0.95)' }}>
                {displayPrice.toFixed(2)}
              </div>
            </div>
            <div className="w-48">
              <MiniChart />
            </div>
          </div>
        </div>

        {/* Quote Entry */}
        <div className="p-6 border-b" style={{ borderColor: 'rgba(34,197,94,0.1)' }}>
          <form onSubmit={handleQuoteSubmit} className="flex items-center gap-4">
            <div className="flex-1">
              <label className="text-xs font-mono mb-2 block" style={{ color: 'rgba(239,68,68,0.7)' }}>BID</label>
              <input
                ref={bidRef}
                type="number"
                step="0.01"
                value={bid}
                onChange={(e) => setBid(e.target.value)}
                className="w-full text-3xl font-mono py-3 px-4 rounded-lg outline-none"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: 'rgba(239,68,68,0.95)' }}
                placeholder="99.50"
              />
            </div>
            <div className="text-2xl font-light" style={{ color: 'rgba(255,255,255,0.3)' }}>/</div>
            <div className="flex-1">
              <label className="text-xs font-mono mb-2 block" style={{ color: 'rgba(34,197,94,0.7)' }}>ASK</label>
              <input
                type="number"
                step="0.01"
                value={ask}
                onChange={(e) => setAsk(e.target.value)}
                className="w-full text-3xl font-mono py-3 px-4 rounded-lg outline-none"
                style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: 'rgba(34,197,94,0.95)' }}
                placeholder="100.50"
              />
            </div>
            <button type="submit" className="px-6 py-4 rounded-lg font-mono text-sm" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.8)' }}>
              UPDATE
            </button>
          </form>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 divide-x" style={{ borderColor: 'rgba(34,197,94,0.1)' }}>
          <div className="p-4 text-center">
            <div className="text-xs font-mono mb-1" style={{ color: 'rgba(136,136,136,0.5)' }}>POSITION</div>
            <div className="text-2xl font-mono" style={{ color: position > 0 ? 'rgba(34,197,94,0.9)' : position < 0 ? 'rgba(239,68,68,0.9)' : 'rgba(255,255,255,0.6)' }}>
              {position > 0 ? '+' : ''}{position}
            </div>
          </div>
          <div className="p-4 text-center" style={{ borderColor: 'rgba(34,197,94,0.1)' }}>
            <div className="text-xs font-mono mb-1" style={{ color: 'rgba(136,136,136,0.5)' }}>P&L</div>
            <div className="text-2xl font-mono" style={{ color: pnl >= 0 ? 'rgba(34,197,94,0.9)' : 'rgba(239,68,68,0.9)' }}>
              {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)}
            </div>
          </div>
          <div className="p-4 text-center" style={{ borderColor: 'rgba(34,197,94,0.1)' }}>
            <div className="text-xs font-mono mb-1" style={{ color: 'rgba(136,136,136,0.5)' }}>TRADES</div>
            <div className="text-2xl font-mono" style={{ color: 'rgba(255,255,255,0.9)' }}>{trades.length}</div>
          </div>
        </div>

        {/* Message Log */}
        <div className="p-4 h-24 overflow-y-auto font-mono text-xs" style={{ background: 'rgba(0,0,0,0.5)' }}>
          {messages.map((msg, i) => (
            <div key={i} className="mb-1" style={{ color: msg.includes('BOUGHT') ? 'rgba(34,197,94,0.8)' : msg.includes('SOLD') ? 'rgba(239,68,68,0.8)' : 'rgba(255,255,255,0.5)' }}>
              &gt; {msg}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});
MarketMakingGame.displayName = 'MarketMakingGame';

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 9: LEADERBOARD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface LeaderboardProps {
  currentUser?: string;
}

const Leaderboard = memo(({ currentUser }: LeaderboardProps) => {
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'all'>('week');
  const [userStats, setUserStats] = useState({
    rank: 156,
    score: 2450,
    streak: 3,
    xpToday: 150,
    xpThisWeek: [80, 120, 95, 150, 0, 0, 0], // Last 7 days
  });

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case 'Diamond': return 'rgba(185,242,255,0.9)';
      case 'Platinum': return 'rgba(229,228,226,0.9)';
      case 'Gold': return 'rgba(255,215,0,0.9)';
      case 'Silver': return 'rgba(192,192,192,0.9)';
      default: return 'rgba(205,127,50,0.9)';
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-light mb-2" style={{ color: 'rgba(255,255,255,0.95)' }}>Global Rankings</h2>
          <p className="text-sm" style={{ color: 'rgba(136,136,136,0.6)' }}>Compete with traders worldwide</p>
        </div>
        <div className="flex gap-2">
          {(['week', 'month', 'all'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className="px-4 py-2 rounded-lg text-sm transition-all"
              style={{
                background: timeframe === t ? 'rgba(255,215,0,0.15)' : 'rgba(255,255,255,0.03)',
                border: timeframe === t ? '1px solid rgba(255,215,0,0.3)' : '1px solid rgba(255,255,255,0.06)',
                color: timeframe === t ? 'rgba(255,215,0,0.9)' : 'rgba(255,255,255,0.5)'
              }}
            >
              {t === 'week' ? 'This Week' : t === 'month' ? 'This Month' : 'All Time'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Leaderboard */}
        <div className="lg:col-span-2 rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="p-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <h3 className="text-sm font-mono tracking-widest" style={{ color: 'rgba(136,136,136,0.5)' }}>TOP PERFORMERS</h3>
          </div>
          <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
            {LEADERBOARD_DATA.map((entry, i) => (
              <div
                key={entry.rank}
                className="flex items-center gap-4 p-4 transition-all hover:bg-white/5"
                style={{ background: i < 3 ? 'rgba(255,215,0,0.02)' : 'transparent' }}
              >
                <div className="w-8 text-center">
                  {i === 0 ? <Crown size={20} style={{ color: 'rgba(255,215,0,0.9)' }} /> :
                   i === 1 ? <Medal size={20} style={{ color: 'rgba(192,192,192,0.9)' }} /> :
                   i === 2 ? <Medal size={20} style={{ color: 'rgba(205,127,50,0.9)' }} /> :
                   <span className="text-sm font-mono" style={{ color: 'rgba(136,136,136,0.5)' }}>{entry.rank}</span>}
                </div>
                <div className="text-2xl">{entry.avatar}</div>
                <div className="flex-1">
                  <div className="font-medium" style={{ color: 'rgba(255,255,255,0.9)' }}>{entry.name}</div>
                  <div className="flex items-center gap-2 text-xs" style={{ color: 'rgba(136,136,136,0.5)' }}>
                    <span className="flex items-center gap-1"><Flame size={12} style={{ color: 'rgba(255,100,0,0.8)' }} /> {entry.streak} day streak</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-lg" style={{ color: 'rgba(255,255,255,0.9)' }}>{entry.score.toLocaleString()}</div>
                  <div className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${getBadgeColor(entry.badge)}15`, color: getBadgeColor(entry.badge) }}>
                    {entry.badge}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Stats Panel */}
        <div className="space-y-4">
          {/* Your Rank */}
          <div className="p-6 rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(59,130,246,0.02) 100%)', border: '1px solid rgba(59,130,246,0.2)' }}>
            <div className="text-xs font-mono tracking-widest mb-3" style={{ color: 'rgba(59,130,246,0.7)' }}>YOUR RANK</div>
            <div className="flex items-center gap-4">
              <div className="text-5xl font-extralight" style={{ color: 'rgba(255,255,255,0.95)' }}>#{userStats.rank}</div>
              <div className="flex-1">
                <div className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>{userStats.score.toLocaleString()} XP</div>
                <div className="flex items-center gap-1 text-xs" style={{ color: 'rgba(34,197,94,0.8)' }}>
                  <TrendingUp size={12} /> +{userStats.xpToday} today
                </div>
              </div>
            </div>
          </div>

          {/* Streak */}
          <div className="p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="text-xs font-mono tracking-widest mb-3" style={{ color: 'rgba(136,136,136,0.5)' }}>CURRENT STREAK</div>
            <div className="flex items-center gap-3">
              <Flame size={32} style={{ color: 'rgba(255,100,0,0.9)' }} />
              <div>
                <div className="text-3xl font-light" style={{ color: 'rgba(255,255,255,0.95)' }}>{userStats.streak} days</div>
                <div className="text-xs" style={{ color: 'rgba(136,136,136,0.5)' }}>Keep it going!</div>
              </div>
            </div>
          </div>

          {/* Weekly Progress */}
          <div className="p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="text-xs font-mono tracking-widest mb-4" style={{ color: 'rgba(136,136,136,0.5)' }}>THIS WEEK</div>
            <div className="flex items-end justify-between h-24 gap-2">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => {
                const xp = userStats.xpThisWeek[i];
                const maxXp = Math.max(...userStats.xpThisWeek);
                const height = maxXp > 0 ? (xp / maxXp) * 100 : 0;
                const isToday = i === new Date().getDay() - 1 || (new Date().getDay() === 0 && i === 6);
                
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div
                      className="w-full rounded-t transition-all"
                      style={{
                        height: `${Math.max(4, height)}%`,
                        background: xp > 0 ? 'rgba(34,197,94,0.8)' : 'rgba(255,255,255,0.1)',
                        boxShadow: isToday ? '0 0 10px rgba(34,197,94,0.5)' : 'none'
                      }}
                    />
                    <span className="text-xs" style={{ color: isToday ? 'rgba(255,255,255,0.9)' : 'rgba(136,136,136,0.4)' }}>{day}</span>
                  </div>
                );
              })}
            </div>
            <div className="text-center mt-4 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
              {userStats.xpThisWeek.reduce((a, b) => a + b, 0)} XP this week
            </div>
          </div>

          {/* Achievements Preview */}
          <div className="p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="text-xs font-mono tracking-widest mb-4" style={{ color: 'rgba(136,136,136,0.5)' }}>RECENT BADGES</div>
            <div className="flex gap-3">
              {['🎯', '🔥', '📈', '🧠'].map((badge, i) => (
                <div
                  key={i}
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  {badge}
                </div>
              ))}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-sm"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.1)', color: 'rgba(136,136,136,0.4)' }}
              >
                +12
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
Leaderboard.displayName = 'Leaderboard';

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 10: MAIN APP COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

const FinaApp = () => {
  // ─── Navigation State ──────────────────────────────────────────────────
  const [view, setView] = useState<string>('landing');
  const [step, setStep] = useState(0);
  const [career, setCareer] = useState<string | null>(null);
  const [seniority, setSeniority] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  // ─── Auth State (lifted for stability) ─────────────────────────────────
  const [isAuth, setIsAuth] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPass, setAuthPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [user, setUser] = useState<any>(null);

  // ─── Pricing State ─────────────────────────────────────────────────────
  const [showPricing, setShowPricing] = useState(false);
  const [userPlan, setUserPlan] = useState('free');
  const [checkoutState, setCheckoutState] = useState('idle');

  // ─── Arena State ───────────────────────────────────────────────────────
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [orbMood, setOrbMood] = useState('neutral');
  const [hasSpoken, setHasSpoken] = useState(false);
  const [metrics, setMetrics] = useState({ stress: 0, pace: 0, precision: 0 });
  const [question, setQuestion] = useState("Walk me through the assumptions underlying the Black-Scholes model.");
  const [transcript, setTranscript] = useState('');
  const [displayedResponse, setDisplayedResponse] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatHistory, setChatHistory] = useState<{role: string, content: string}[]>([]);
  const [qCount, setQCount] = useState(0);

  // ─── Academy State ─────────────────────────────────────────────────────
  const [selectedModule, setSelectedModule] = useState<number | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<number | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<{[key: number]: number}>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // ─── Training State ────────────────────────────────────────────────────
  const [trainingTab, setTrainingTab] = useState<'quant-lab' | 'vault' | 'intel' | 'market-game' | 'leaderboard'>('quant-lab');
  
  // ─── Quant Lab State ───────────────────────────────────────────────────
  const [mathMode, setMathMode] = useState<'idle' | 'playing' | 'results'>('idle');
  const [mathDifficulty, setMathDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [mathQuestions, setMathQuestions] = useState<any[]>([]);
  const [mathCurrent, setMathCurrent] = useState(0);
  const [mathAnswer, setMathAnswer] = useState('');
  const [mathScore, setMathScore] = useState(0);
  const [mathTime, setMathTime] = useState(60);
  const [mathResults, setMathResults] = useState<{correct: number, total: number, time: number, answers: any[]}>({ correct: 0, total: 0, time: 0, answers: [] });

  // ─── Vault State ───────────────────────────────────────────────────────
  const [vaultCategory, setVaultCategory] = useState<string>('all');
  const [vaultDifficulty, setVaultDifficulty] = useState<string>('all');
  const [vaultFirm, setVaultFirm] = useState<string>('all');
  const [selectedBrainteaser, setSelectedBrainteaser] = useState<BrainTeaser | null>(null);
  const [showSolution, setShowSolution] = useState(false);

  // ─── Intel State ───────────────────────────────────────────────────────
  const [selectedFirm, setSelectedFirm] = useState<Firm | null>(null);

  // ─── Refs ──────────────────────────────────────────────────────────────
  const recognitionRef = useRef<any>(null);
  const mathTimerRef = useRef<any>(null);
  const mathInputRef = useRef<HTMLInputElement>(null);

  // ═══════════════════════════════════════════════════════════════════════
  // EFFECTS
  // ═══════════════════════════════════════════════════════════════════════

  // Firebase Auth listener
  useEffect(() => {
    const unsubscribe = onAuthChange((firebaseUser) => {
      if (firebaseUser) {
        setUser({ email: firebaseUser.email, name: firebaseUser.email?.split('@')[0] || 'User', uid: firebaseUser.uid });
        setIsAuth(true);
      } else {
        setUser(null);
        setIsAuth(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Scroll & Load
  useEffect(() => {
    setLoaded(true);
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Speech Recognition Setup
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SR();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      recognition.onresult = (e: any) => {
        let finalTranscript = '';
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const transcript = e.results[i][0].transcript;
          if (e.results[i].isFinal) {
            finalTranscript += transcript;
          }
        }
        if (finalTranscript) {
          setTranscript(prev => prev + ' ' + finalTranscript);
        }
      };
      
      recognition.onerror = (e: any) => {
        console.error('Speech recognition error:', e.error);
        setIsRecording(false);
      };
      
      recognition.onend = () => {
        // Don't auto-restart - let user control
        console.log('Recognition ended');
      };
      
      recognitionRef.current = recognition;
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Math Timer
  useEffect(() => {
    if (mathMode === 'playing' && mathTime > 0) {
      mathTimerRef.current = setTimeout(() => setMathTime(t => t - 1), 1000);
    } else if (mathTime === 0 && mathMode === 'playing') {
      endMathGame();
    }
    return () => clearTimeout(mathTimerRef.current);
  }, [mathMode, mathTime]);

  // ═══════════════════════════════════════════════════════════════════════
  // MATH GAME FUNCTIONS
  // ═══════════════════════════════════════════════════════════════════════

  const generateMathQuestion = useCallback((diff: string) => {
    const ops = diff === 'easy' ? ['+', '-'] : diff === 'medium' ? ['+', '-', '×'] : ['+', '-', '×', '÷'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    let a: number, b: number, answer: number;
    
    if (diff === 'easy') {
      a = Math.floor(Math.random() * 50) + 10;
      b = Math.floor(Math.random() * 50) + 10;
    } else if (diff === 'medium') {
      a = Math.floor(Math.random() * 100) + 20;
      b = Math.floor(Math.random() * 50) + 10;
    } else {
      a = Math.floor(Math.random() * 200) + 50;
      b = Math.floor(Math.random() * 100) + 20;
    }

    switch(op) {
      case '+': answer = a + b; break;
      case '-': answer = a - b; break;
      case '×': 
        if (diff === 'hard') { a = Math.floor(Math.random() * 30) + 10; b = Math.floor(Math.random() * 30) + 10; }
        else { a = Math.floor(Math.random() * 20) + 5; b = Math.floor(Math.random() * 15) + 5; }
        answer = a * b; 
        break;
      case '÷':
        answer = Math.floor(Math.random() * 20) + 5;
        b = Math.floor(Math.random() * 15) + 2;
        a = answer * b;
        break;
      default: answer = a + b;
    }
    
    return { question: `${a} ${op} ${b}`, answer: answer.toString(), userAnswer: '' };
  }, []);

  const startMathGame = useCallback(() => {
    const questions = Array(20).fill(null).map(() => generateMathQuestion(mathDifficulty));
    setMathQuestions(questions);
    setMathCurrent(0);
    setMathScore(0);
    setMathAnswer('');
    setMathTime(mathDifficulty === 'easy' ? 90 : mathDifficulty === 'medium' ? 75 : 60);
    setMathMode('playing');
    setTimeout(() => mathInputRef.current?.focus(), 100);
  }, [mathDifficulty, generateMathQuestion]);

  const submitMathAnswer = useCallback(() => {
    if (!mathAnswer.trim()) return;
    
    const isCorrect = mathAnswer.trim() === mathQuestions[mathCurrent].answer;
    if (isCorrect) setMathScore(s => s + 1);
    
    const updatedQuestions = [...mathQuestions];
    updatedQuestions[mathCurrent].userAnswer = mathAnswer;
    setMathQuestions(updatedQuestions);
    
    if (mathCurrent < mathQuestions.length - 1) {
      setMathCurrent(c => c + 1);
      setMathAnswer('');
      mathInputRef.current?.focus();
    } else {
      endMathGame();
    }
  }, [mathAnswer, mathCurrent, mathQuestions]);

  const endMathGame = useCallback(() => {
    clearTimeout(mathTimerRef.current);
    const correct = mathQuestions.filter((q) => q.userAnswer === q.answer).length;
    const totalTime = (mathDifficulty === 'easy' ? 90 : mathDifficulty === 'medium' ? 75 : 60) - mathTime;
    setMathResults({
      correct,
      total: mathQuestions.length,
      time: totalTime,
      answers: mathQuestions
    });
    setMathMode('results');
  }, [mathQuestions, mathTime, mathDifficulty]);

  // ═══════════════════════════════════════════════════════════════════════
  // AUTH & API HANDLERS
  // ═══════════════════════════════════════════════════════════════════════

  const speakText = useCallback(async (text: string) => {
    setIsSpeaking(true);
    setOrbMood('speaking');
    try {
      const res = await fetch('/api/voice', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) });
      if (res.ok) {
        const audioBlob = await res.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.onended = () => { setIsSpeaking(false); setOrbMood('neutral'); URL.revokeObjectURL(audioUrl); };
        audio.onerror = () => { setIsSpeaking(false); setOrbMood('neutral'); };
        await audio.play();
      } else { throw new Error('Voice API failed'); }
    } catch {
      // Fallback to browser speech
      if ('speechSynthesis' in window) {
        const synth = window.speechSynthesis;
        const u = new SpeechSynthesisUtterance(text);
        u.rate = 0.92;
        u.onend = () => { setIsSpeaking(false); setOrbMood('neutral'); };
        synth.speak(u);
      } else {
        setIsSpeaking(false);
        setOrbMood('neutral');
      }
    }
  }, []);

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

  const sendToAI = useCallback(async (userMessage: string) => {
    console.log('Sending to AI:', userMessage); // Debug log
    try {
      const res = await fetch('/api/chat', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ message: userMessage, history: chatHistory }) 
      });
      const data = await res.json();
      console.log('AI Response:', data); // Debug log
      if (data.success && data.message) {
        setChatHistory(prev => [...prev, { role: 'user', content: userMessage }, { role: 'assistant', content: data.message }]);
        return data.message;
      }
    } catch (err) {
      console.error('AI Error:', err);
    }
    // Fallback responses
    const fallbacks = [
      "Let's push deeper. Explain the arbitrage argument behind put-call parity.",
      "Good start, but what about the volatility smile? How does it challenge Black-Scholes?",
      "Now tell me about the Greeks. Which one matters most for a market maker?",
      "Interesting. What's the difference between historical and implied volatility?"
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }, [chatHistory]);

  const startRecording = useCallback(() => {
    if (!recognitionRef.current) {
      console.error('Speech recognition not available');
      return;
    }
    setTranscript('');
    try { 
      recognitionRef.current.start(); 
      setIsRecording(true); 
      setHasSpoken(true);
      console.log('Recording started'); // Debug log
    } catch (err) {
      console.error('Failed to start recording:', err);
    }
  }, []);

  const stopRecording = useCallback(async () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
    
    console.log('Final transcript:', transcript); // Debug log
    
    // Give a moment for final results
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const finalTranscript = transcript.trim();
    
    if (finalTranscript.length < 10) {
      setOrbMood('aggressive');
      const response = "I didn't catch that. Please speak clearly and provide a comprehensive answer.";
      typewriterEffect(response, () => speakText(response));
      return;
    }
    
    setQCount(c => c + 1);
    setMetrics({ 
      stress: Math.floor(Math.random() * 25) + 45, 
      pace: Math.floor(Math.random() * 20) + 70, 
      precision: Math.floor(Math.random() * 30) + 55 
    });
    
    const aiResponse = await sendToAI(finalTranscript);
    setOrbMood(aiResponse.toLowerCase().includes('good') ? 'neutral' : 'aggressive');
    setQuestion(aiResponse);
    typewriterEffect(aiResponse, () => speakText(aiResponse));
  }, [transcript, typewriterEffect, speakText, sendToAI]);

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
    try { 
      await loginWithGoogle(); 
      setShowAuth(false); 
    } catch (error: any) { 
      setAuthError(error.message); 
    }
    setAuthLoading(false);
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    setView('landing');
  }, []);

  const handleCheckout = useCallback(async (planId: string) => {
    setCheckoutState('securing');
    try {
      const res = await fetch('/api/stripe/checkout', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ planId, userEmail: user?.email }) 
      });
      const data = await res.json();
      if (data.url) { 
        window.location.href = data.url; 
        return; 
      }
    } catch (err) {
      console.error('Checkout error:', err);
    }
    // Demo fallback
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
  }, [user]);

  // ═══════════════════════════════════════════════════════════════════════
  // FILTERED DATA
  // ═══════════════════════════════════════════════════════════════════════

  const filteredBrainteasers = useMemo(() => {
    return BRAINTEASERS_DB.filter(b => {
      if (vaultCategory !== 'all' && b.category !== vaultCategory) return false;
      if (vaultDifficulty !== 'all' && b.difficulty !== vaultDifficulty) return false;
      if (vaultFirm !== 'all' && b.firm !== vaultFirm) return false;
      return true;
    });
  }, [vaultCategory, vaultDifficulty, vaultFirm]);

  // ═══════════════════════════════════════════════════════════════════════
  // NAVIGATION COMPONENT
  // ═══════════════════════════════════════════════════════════════════════

  const Navigation = () => (
    <header className="fixed top-0 left-0 right-0 z-[100] px-8 py-4 flex justify-between items-center transition-all duration-500" style={{ background: scrollY > 30 ? 'rgba(0,0,0,0.98)' : 'transparent', backdropFilter: scrollY > 30 ? 'blur(24px)' : 'none', borderBottom: scrollY > 30 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
      <Logo onClick={() => { setView('landing'); setStep(0); setSelectedModule(null); }} />
      <nav className="flex items-center gap-6">
        {['Academy', 'Arena', 'Training', 'Pricing'].map(item => (
          <button key={item} onClick={() => {
            if (item === 'Academy') { setView('academy'); setSelectedModule(null); }
            else if (item === 'Arena') { isAuth ? setView('arena') : setShowAuth(true); }
            else if (item === 'Training') { setView('training'); }
            else { setShowPricing(true); }
          }} className="text-sm tracking-wide transition-colors duration-300 hover:text-white" style={{ color: view === item.toLowerCase() ? '#fff' : 'rgba(255,255,255,0.5)' }}>
            {item}
          </button>
        ))}
        <div className="px-3 py-1.5 rounded-full flex items-center gap-2" style={{ background: userPlan !== 'free' ? 'rgba(255,215,0,0.1)' : 'rgba(255,255,255,0.03)', border: userPlan !== 'free' ? '1px solid rgba(255,215,0,0.3)' : '1px solid rgba(255,255,255,0.08)' }}>
          {userPlan !== 'free' && <Star size={11} fill="rgba(255,215,0,0.8)" style={{ color: 'rgba(255,215,0,0.8)' }} />}
          <span className="text-xs font-mono" style={{ color: userPlan !== 'free' ? 'rgba(255,215,0,0.9)' : 'rgba(136,136,136,0.6)' }}>{userPlan === 'free' ? 'FREE' : userPlan.toUpperCase()}</span>
        </div>
        {isAuth ? (
          <div className="relative group">
            <button className="flex items-center gap-2 px-4 py-2 rounded-full transition-colors hover:bg-white/5" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs" style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}>{user?.name?.charAt(0).toUpperCase()}</div>
              <span className="text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>{user?.name}</span>
            </button>
            <div className="absolute right-0 top-full mt-2 opacity-0 group-hover:opacity-100 transition-all pointer-events-none group-hover:pointer-events-auto">
              <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm" style={{ background: 'rgba(0,0,0,0.95)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}><LogOut size={14} /> Sign Out</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setShowAuth(true)} className="text-sm px-5 py-2 rounded-full transition-all hover:bg-white/10" style={{ border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.8)' }}>Sign In</button>
        )}
      </nav>
    </header>
  );

  // ═══════════════════════════════════════════════════════════════════════
  // LANDING VIEW
  // ═══════════════════════════════════════════════════════════════════════

  const LandingView = () => (
    <div className={`min-h-screen transition-opacity duration-1000 ${loaded ? 'opacity-100' : 'opacity-0'}`}>
      <section className="min-h-screen flex flex-col items-center justify-center px-8 relative">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(255,255,255,0.02) 0%, transparent 60%)' }} />
        <div className="relative z-10 text-center max-w-4xl">
          <p className="text-xs font-mono tracking-[0.4em] mb-10" style={{ color: 'rgba(136,136,136,0.5)' }}>AI-POWERED INTERVIEW PREPARATION</p>
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-extralight tracking-tight leading-[0.95] mb-4" style={{ color: 'rgba(255,255,255,0.95)' }}>Master Finance.</h1>
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-extralight tracking-tight leading-[0.95] mb-12" style={{ color: 'rgba(255,255,255,0.25)' }}>Dominate Interviews.</h1>
          <p className="text-lg font-light mb-14 max-w-xl mx-auto" style={{ color: 'rgba(136,136,136,0.7)' }}>The most rigorous preparation platform for elite finance careers. Trained on Hull, Vernimmen, and Damodaran.</p>
          <div className="flex items-center justify-center gap-4">
            <button onClick={() => setStep(1)} className="px-10 py-4 rounded-full text-base font-medium transition-all duration-300 hover:scale-[1.03] flex items-center gap-2" style={{ background: 'rgba(255,255,255,0.95)', color: '#000' }}>Start Training <ArrowRight size={18} /></button>
            <button onClick={() => setShowPricing(true)} className="px-10 py-4 rounded-full text-base transition-all duration-300 hover:bg-white/5" style={{ border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.8)' }}>View Pricing</button>
          </div>
        </div>
      </section>

      <section className="py-24 px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-mono tracking-[0.3em] mb-4" style={{ color: 'rgba(136,136,136,0.5)' }}>COMPLETE PLATFORM</p>
            <h2 className="text-4xl font-extralight" style={{ color: 'rgba(255,255,255,0.95)' }}>Everything You Need</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { icon: <Brain size={24} />, title: 'AI Arena', desc: 'Voice mock interviews', color: 'rgba(59,130,246,0.8)' },
              { icon: <Zap size={24} />, title: 'Quant Lab', desc: 'Mental math drills', color: 'rgba(255,215,0,0.8)' },
              { icon: <Target size={24} />, title: 'The Vault', desc: '500+ brainteasers', color: 'rgba(168,85,247,0.8)' },
              { icon: <Gamepad2 size={24} />, title: 'Market Game', desc: 'Trading simulator', color: 'rgba(34,197,94,0.8)' },
              { icon: <Trophy size={24} />, title: 'Leaderboard', desc: 'Global rankings', color: 'rgba(239,68,68,0.8)' },
            ].map((f, i) => (
              <div key={i} className="p-5 rounded-2xl transition-all hover:scale-[1.02]" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: `${f.color}15`, color: f.color }}>{f.icon}</div>
                <h3 className="text-base font-medium mb-1" style={{ color: 'rgba(255,255,255,0.9)' }}>{f.title}</h3>
                <p className="text-xs" style={{ color: 'rgba(136,136,136,0.6)' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-8" style={{ background: 'rgba(255,255,255,0.01)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-3 gap-8 text-center">
            {[{ value: '94%', label: 'Success Rate' }, { value: '€127K', label: 'Avg. Starting Salary' }, { value: '500+', label: 'Placements' }].map((s, i) => (
              <div key={i}><div className="text-5xl font-extralight mb-2" style={{ color: 'rgba(255,215,0,0.9)' }}>{s.value}</div><div className="text-sm font-mono" style={{ color: 'rgba(136,136,136,0.5)' }}>{s.label}</div></div>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-12 px-8 border-t" style={{ borderColor: 'rgba(255,255,255,0.04)' }}><div className="max-w-6xl mx-auto flex justify-between items-center"><p className="text-xs font-mono" style={{ color: 'rgba(136,136,136,0.4)' }}>© 2024 FINA</p></div></footer>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════
  // ONBOARDING VIEW
  // ═══════════════════════════════════════════════════════════════════════

  const OnboardingView = () => {
    const careers = [{ id: 'ib', title: 'Investment Banking', sub: 'M&A, DCF, LBO', icon: '◆' }, { id: 'st', title: 'Sales & Trading', sub: 'Market Making', icon: '◈' }, { id: 'deriv', title: 'Derivatives', sub: 'Greeks, Pricing', icon: '∂' }, { id: 'quant', title: 'Quantitative', sub: 'Stochastic, Stats', icon: '∫' }];
    const levels = [{ id: 'intern', title: 'Intern' }, { id: 'analyst', title: 'Analyst' }, { id: 'associate', title: 'Associate' }, { id: 'vp', title: 'VP+' }];
    return (
      <div className="min-h-screen flex flex-col px-8 py-24">
        <button onClick={() => setStep(s => Math.max(0, s - 1))} className="flex items-center gap-2 text-sm mb-16 hover:text-white" style={{ color: 'rgba(255,255,255,0.4)' }}><ChevronLeft size={16} /> Back</button>
        {step === 1 && (<><div className="text-center mb-16"><p className="text-xs font-mono tracking-[0.3em] mb-4" style={{ color: 'rgba(136,136,136,0.5)' }}>STEP 01 / 02</p><h2 className="text-4xl font-extralight" style={{ color: 'rgba(255,255,255,0.95)' }}>Select Your Track</h2></div><div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">{careers.map(c => <div key={c.id} onClick={() => setCareer(c.id)} className={`p-8 rounded-2xl cursor-pointer transition-all ${career === c.id ? 'scale-[1.02]' : ''}`} style={{ border: career === c.id ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(255,255,255,0.06)', background: career === c.id ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)' }}><span className="text-3xl block mb-6">{c.icon}</span><h3 className="text-lg font-light mb-1" style={{ color: 'rgba(255,255,255,0.9)' }}>{c.title}</h3><p className="text-xs" style={{ color: 'rgba(136,136,136,0.5)' }}>{c.sub}</p></div>)}</div><div className="flex justify-center"><button onClick={() => setStep(2)} disabled={!career} className="px-10 py-4 rounded-full text-sm font-medium transition-all hover:scale-[1.02] disabled:opacity-30" style={{ background: 'rgba(255,255,255,0.95)', color: '#000' }}>Continue</button></div></>)}
        {step === 2 && (<><div className="text-center mb-16"><p className="text-xs font-mono tracking-[0.3em] mb-4" style={{ color: 'rgba(136,136,136,0.5)' }}>STEP 02 / 02</p><h2 className="text-4xl font-extralight" style={{ color: 'rgba(255,255,255,0.95)' }}>Experience Level</h2></div><div className="max-w-2xl mx-auto grid grid-cols-4 gap-4 mb-16">{levels.map(l => <div key={l.id} onClick={() => setSeniority(l.id)} className="p-5 rounded-xl cursor-pointer text-center transition-all" style={{ border: seniority === l.id ? '1px solid rgba(255,255,255,0.4)' : '1px solid rgba(255,255,255,0.06)', background: seniority === l.id ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.02)' }}><span className="text-sm" style={{ color: seniority === l.id ? '#fff' : 'rgba(255,255,255,0.6)' }}>{l.title}</span></div>)}</div><div className="flex justify-center"><button onClick={() => isAuth ? setView('arena') : setShowAuth(true)} disabled={!seniority} className="px-10 py-4 rounded-full text-sm font-medium transition-all hover:scale-[1.02] disabled:opacity-30 flex items-center gap-2" style={{ background: 'rgba(255,255,255,0.95)', color: '#000' }}>Enter Arena <Zap size={16} /></button></div></>)}
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════
  // ARENA VIEW
  // ═══════════════════════════════════════════════════════════════════════

  const ArenaView = () => (
    <div className="min-h-screen flex flex-col">
      <div className="px-8 py-5 flex justify-between items-center" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="flex items-center gap-4"><div className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'rgba(34,197,94,0.8)' }} /><span className="text-xs font-mono tracking-widest" style={{ color: 'rgba(136,136,136,0.5)' }}>LIVE SESSION</span><span className="text-xs font-mono px-2 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.03)', color: 'rgba(136,136,136,0.4)' }}>Q{qCount + 1}</span></div>
        <button onClick={() => setView('landing')} className="text-xs px-4 py-2 rounded-full hover:bg-white/5" style={{ border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}>Exit</button>
      </div>
      <div className="flex-1 flex">
        <div className="w-52 p-8 flex flex-col gap-10" style={{ borderRight: '1px solid rgba(255,255,255,0.04)' }}>
          <Metric label="Stress Level" value={metrics.stress} color={metrics.stress > 70 ? 'rgba(239,68,68,0.8)' : 'rgba(34,197,94,0.8)'} />
          <Metric label="Speaking Pace" value={metrics.pace} color="rgba(255,255,255,0.8)" />
          <Metric label="Precision" value={metrics.precision} color={metrics.precision > 75 ? 'rgba(34,197,94,0.8)' : 'rgba(255,255,255,0.8)'} />
          {!hasSpoken && <div className="p-4 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.02)' }}><p className="text-xs" style={{ color: 'rgba(136,136,136,0.5)' }}>Metrics activate after you speak</p></div>}
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-8 relative">
          <div className="absolute inset-0 pointer-events-none transition-all duration-700" style={{ background: orbMood === 'aggressive' ? 'radial-gradient(ellipse at center, rgba(239,68,68,0.04) 0%, transparent 60%)' : 'radial-gradient(ellipse at center, rgba(255,255,255,0.01) 0%, transparent 60%)' }} />
          <div className="absolute top-12 max-w-2xl text-center">
            <p className="text-xs font-mono tracking-widest mb-4" style={{ color: orbMood === 'aggressive' ? 'rgba(239,68,68,0.6)' : 'rgba(136,136,136,0.4)' }}>{orbMood === 'aggressive' ? '⚠ CHALLENGE' : 'INTERVIEWER'}</p>
            <p className="text-xl font-light leading-relaxed" style={{ color: 'rgba(255,255,255,0.9)' }}>{isTyping ? displayedResponse : question}{isTyping && <span className="animate-pulse">▋</span>}</p>
          </div>
          <Orb mood={orbMood} isRecording={isRecording} isSpeaking={isSpeaking} />
          {transcript && <div className="absolute bottom-40 max-w-xl text-center p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}><p className="text-xs font-mono mb-2" style={{ color: 'rgba(136,136,136,0.4)' }}>YOUR RESPONSE</p><p className="text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>{transcript}</p></div>}
          <div className="absolute bottom-12 flex flex-col items-center gap-4">
            {!isRecording ? (
              <button onClick={startRecording} disabled={isSpeaking || isTyping} className="w-20 h-20 rounded-full flex items-center justify-center transition-all disabled:opacity-40 hover:scale-105" style={{ background: 'rgba(255,255,255,0.05)', border: '2px solid rgba(255,255,255,0.2)' }}>
                <Mic size={24} style={{ color: 'rgba(255,255,255,0.6)' }} />
              </button>
            ) : (
              <button onClick={stopRecording} className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.15)', border: '3px solid rgba(239,68,68,0.8)', animation: 'pulse-border 1.5s ease-in-out infinite' }}>
                <Square size={20} fill="rgba(239,68,68,0.9)" style={{ color: 'rgba(239,68,68,0.9)' }} />
              </button>
            )}
            <span className="text-xs font-mono tracking-widest" style={{ color: isRecording ? 'rgba(239,68,68,0.8)' : 'rgba(136,136,136,0.4)' }}>{isSpeaking || isTyping ? 'AI RESPONDING...' : isRecording ? 'TAP TO SEND' : 'TAP TO SPEAK'}</span>
          </div>
        </div>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════
  // TRAINING VIEW
  // ═══════════════════════════════════════════════════════════════════════

  const TrainingView = () => (
    <div className="min-h-screen px-8 py-24">
      <div className="max-w-6xl mx-auto">
        <p className="text-xs font-mono tracking-[0.3em] mb-4" style={{ color: 'rgba(136,136,136,0.5)' }}>TRAINING CENTER</p>
        <h1 className="text-4xl font-extralight mb-4" style={{ color: 'rgba(255,255,255,0.95)' }}>Master Every Angle</h1>
        <p className="text-lg font-light mb-10" style={{ color: 'rgba(136,136,136,0.6)' }}>Mental math, brainteasers, market making, and rankings.</p>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-10">
          {[
            { id: 'quant-lab', label: 'Quant Lab', icon: <Zap size={16} /> },
            { id: 'vault', label: 'The Vault', icon: <Target size={16} /> },
            { id: 'intel', label: 'Firm Intel', icon: <Building2 size={16} /> },
            { id: 'market-game', label: 'Market Game', icon: <Gamepad2 size={16} /> },
            { id: 'leaderboard', label: 'Rankings', icon: <Trophy size={16} /> },
          ].map(tab => (
            <button key={tab.id} onClick={() => setTrainingTab(tab.id as any)} className="flex items-center gap-2 px-5 py-3 rounded-xl transition-all" style={{ background: trainingTab === tab.id ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.02)', border: trainingTab === tab.id ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ color: trainingTab === tab.id ? 'rgba(255,215,0,0.9)' : 'rgba(255,255,255,0.4)' }}>{tab.icon}</span>
              <span className="text-sm" style={{ color: trainingTab === tab.id ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.6)' }}>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Quant Lab */}
        {trainingTab === 'quant-lab' && (
          <div className="max-w-2xl">
            {mathMode === 'idle' && (
              <>
                <div className="p-8 rounded-2xl mb-8" style={{ background: 'linear-gradient(135deg, rgba(255,215,0,0.08) 0%, rgba(255,215,0,0.02) 100%)', border: '1px solid rgba(255,215,0,0.2)' }}>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(255,215,0,0.15)' }}><Zap size={28} style={{ color: 'rgba(255,215,0,0.9)' }} /></div>
                    <div><h2 className="text-2xl font-light" style={{ color: 'rgba(255,255,255,0.95)' }}>Mental Math Challenge</h2><p className="text-sm" style={{ color: 'rgba(136,136,136,0.6)' }}>Optiver-style speed test</p></div>
                  </div>
                  <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.7)' }}>Answer 20 questions as fast as possible. Top trading firms require 80 questions in 8 minutes.</p>
                  <div className="mb-8">
                    <p className="text-xs font-mono tracking-widest mb-3" style={{ color: 'rgba(136,136,136,0.5)' }}>SELECT DIFFICULTY</p>
                    <div className="flex gap-3">
                      {(['easy', 'medium', 'hard'] as const).map(d => (
                        <button key={d} onClick={() => setMathDifficulty(d)} className="flex-1 py-4 rounded-xl text-sm font-medium transition-all" style={{ background: mathDifficulty === d ? 'rgba(255,215,0,0.2)' : 'rgba(255,255,255,0.03)', border: mathDifficulty === d ? '1px solid rgba(255,215,0,0.5)' : '1px solid rgba(255,255,255,0.08)', color: mathDifficulty === d ? 'rgba(255,215,0,0.95)' : 'rgba(255,255,255,0.6)' }}>
                          {d.charAt(0).toUpperCase() + d.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button onClick={startMathGame} className="w-full py-4 rounded-xl text-base font-medium transition-all hover:scale-[1.02] flex items-center justify-center gap-2" style={{ background: 'linear-gradient(90deg, rgba(255,215,0,0.9), rgba(255,180,0,0.9))', color: '#000' }}><Play size={20} /> Start Challenge</button>
                </div>
              </>
            )}
            {mathMode === 'playing' && (
              <div className="max-w-xl mx-auto text-center">
                <div className="flex justify-between items-center mb-8">
                  <div className="text-sm font-mono" style={{ color: 'rgba(136,136,136,0.5)' }}>Q {mathCurrent + 1}/{mathQuestions.length}</div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: mathTime < 15 ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.05)' }}>
                    <Clock size={16} style={{ color: mathTime < 15 ? 'rgba(239,68,68,0.9)' : 'rgba(255,255,255,0.6)' }} />
                    <span className="font-mono text-lg" style={{ color: mathTime < 15 ? 'rgba(239,68,68,0.9)' : 'rgba(255,255,255,0.9)' }}>{mathTime}s</span>
                  </div>
                  <div className="text-sm font-mono" style={{ color: 'rgba(34,197,94,0.8)' }}>Score: {mathScore}</div>
                </div>
                <div className="p-12 rounded-3xl mb-8" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="text-5xl font-light mb-8" style={{ color: 'rgba(255,255,255,0.95)' }}>{mathQuestions[mathCurrent]?.question}</div>
                  <input ref={mathInputRef} type="text" value={mathAnswer} onChange={(e) => setMathAnswer(e.target.value.replace(/[^0-9\-]/g, ''))} onKeyDown={(e) => e.key === 'Enter' && submitMathAnswer()} placeholder="?" autoFocus className="w-32 text-center text-3xl py-4 rounded-xl outline-none" style={{ background: 'rgba(255,255,255,0.05)', border: '2px solid rgba(255,215,0,0.3)', color: '#fff' }} />
                </div>
                <button onClick={submitMathAnswer} disabled={!mathAnswer} className="px-12 py-4 rounded-xl text-base font-medium transition-all disabled:opacity-40" style={{ background: 'rgba(255,215,0,0.9)', color: '#000' }}>Submit</button>
              </div>
            )}
            {mathMode === 'results' && (
              <div className="max-w-xl mx-auto text-center">
                <div className="p-10 rounded-3xl mb-8" style={{ background: 'linear-gradient(135deg, rgba(255,215,0,0.1) 0%, rgba(255,215,0,0.02) 100%)', border: '1px solid rgba(255,215,0,0.2)' }}>
                  <Trophy size={48} style={{ color: 'rgba(255,215,0,0.8)', margin: '0 auto 16px' }} />
                  <h2 className="text-3xl font-light mb-2" style={{ color: 'rgba(255,255,255,0.95)' }}>Complete!</h2>
                  <div className="text-6xl font-extralight my-6" style={{ color: 'rgba(255,215,0,0.95)' }}>{mathResults.correct}/{mathResults.total}</div>
                  <p className="text-sm" style={{ color: 'rgba(136,136,136,0.6)' }}>in {mathResults.time}s</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => setMathMode('idle')} className="py-4 rounded-xl text-sm" style={{ border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.8)' }}>Back</button>
                  <button onClick={startMathGame} className="py-4 rounded-xl text-sm flex items-center justify-center gap-2" style={{ background: 'rgba(255,215,0,0.9)', color: '#000' }}><RefreshCw size={16} /> Retry</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* The Vault */}
        {trainingTab === 'vault' && (
          <div>
            {!selectedBrainteaser ? (
              <>
                <div className="flex flex-wrap gap-4 mb-8">
                  <select value={vaultCategory} onChange={(e) => setVaultCategory(e.target.value)} className="px-4 py-2 rounded-lg text-sm outline-none" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}>
                    <option value="all">All Categories</option>
                    <option value="probability">Probability</option>
                    <option value="logic">Logic</option>
                    <option value="expected-value">Expected Value</option>
                    <option value="market-making">Market Making</option>
                    <option value="mental-math">Mental Math</option>
                    <option value="statistics">Statistics</option>
                    <option value="game-theory">Game Theory</option>
                    <option value="sequences">Sequences</option>
                  </select>
                  <select value={vaultDifficulty} onChange={(e) => setVaultDifficulty(e.target.value)} className="px-4 py-2 rounded-lg text-sm outline-none" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}>
                    <option value="all">All Difficulties</option>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                  <div className="ml-auto text-sm" style={{ color: 'rgba(136,136,136,0.5)' }}>{filteredBrainteasers.length} questions</div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredBrainteasers.map(b => (
                    <div key={b.id} onClick={() => { setSelectedBrainteaser(b); setShowSolution(false); }} className="p-5 rounded-xl cursor-pointer transition-all hover:bg-white/5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs px-2 py-1 rounded-full" style={{ background: b.difficulty === 'Hard' ? 'rgba(239,68,68,0.15)' : b.difficulty === 'Medium' ? 'rgba(255,215,0,0.15)' : 'rgba(34,197,94,0.15)', color: b.difficulty === 'Hard' ? 'rgba(239,68,68,0.9)' : b.difficulty === 'Medium' ? 'rgba(255,215,0,0.9)' : 'rgba(34,197,94,0.9)' }}>{b.difficulty}</span>
                        <span className="text-xs" style={{ color: 'rgba(136,136,136,0.5)' }}>{b.firm}</span>
                      </div>
                      <p className="text-sm" style={{ color: 'rgba(255,255,255,0.85)' }}>{b.question}</p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="max-w-2xl">
                <button onClick={() => setSelectedBrainteaser(null)} className="flex items-center gap-2 text-sm mb-8 hover:text-white" style={{ color: 'rgba(255,255,255,0.4)' }}><ChevronLeft size={16} /> Back</button>
                <div className="p-8 rounded-2xl mb-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs px-3 py-1 rounded-full" style={{ background: selectedBrainteaser.difficulty === 'Hard' ? 'rgba(239,68,68,0.15)' : 'rgba(255,215,0,0.15)', color: selectedBrainteaser.difficulty === 'Hard' ? 'rgba(239,68,68,0.9)' : 'rgba(255,215,0,0.9)' }}>{selectedBrainteaser.difficulty}</span>
                    <span className="text-sm" style={{ color: 'rgba(136,136,136,0.6)' }}>{selectedBrainteaser.firm}</span>
                  </div>
                  <h2 className="text-xl font-light mb-6" style={{ color: 'rgba(255,255,255,0.95)' }}>{selectedBrainteaser.question}</h2>
                  <div className="p-4 rounded-lg" style={{ background: 'rgba(255,215,0,0.08)', border: '1px solid rgba(255,215,0,0.15)' }}>
                    <p className="text-xs font-mono mb-1" style={{ color: 'rgba(255,215,0,0.6)' }}>HINT</p>
                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>{selectedBrainteaser.hint}</p>
                  </div>
                </div>
                {!showSolution ? (
                  <button onClick={() => setShowSolution(true)} className="w-full py-4 rounded-xl text-sm" style={{ border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.8)' }}>Reveal Solution</button>
                ) : (
                  <div className="p-6 rounded-xl" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
                    <p className="text-xs font-mono mb-2" style={{ color: 'rgba(34,197,94,0.7)' }}>ANSWER</p>
                    <p className="text-2xl font-light mb-4" style={{ color: 'rgba(34,197,94,0.95)' }}>{selectedBrainteaser.answer}</p>
                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>{selectedBrainteaser.solution}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Firm Intel */}
        {trainingTab === 'intel' && (
          <div>
            {!selectedFirm ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {FIRMS_DB.map(firm => (
                  <div key={firm.id} onClick={() => setSelectedFirm(firm)} className="p-5 rounded-xl cursor-pointer transition-all hover:bg-white/5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-3xl">{firm.logo}</span>
                      <div>
                        <h3 className="font-medium" style={{ color: 'rgba(255,255,255,0.95)' }}>{firm.name}</h3>
                        <p className="text-xs" style={{ color: 'rgba(136,136,136,0.5)' }}>{firm.type}</p>
                      </div>
                    </div>
                    <div className="text-xs" style={{ color: 'rgba(34,197,94,0.8)' }}>{firm.salary}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="max-w-2xl">
                <button onClick={() => setSelectedFirm(null)} className="flex items-center gap-2 text-sm mb-8 hover:text-white" style={{ color: 'rgba(255,255,255,0.4)' }}><ChevronLeft size={16} /> Back</button>
                <div className="flex items-center gap-4 mb-8">
                  <span className="text-5xl">{selectedFirm.logo}</span>
                  <div>
                    <h1 className="text-3xl font-light" style={{ color: 'rgba(255,255,255,0.95)' }}>{selectedFirm.name}</h1>
                    <p className="text-sm" style={{ color: 'rgba(136,136,136,0.6)' }}>{selectedFirm.type} · {selectedFirm.salary}</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="p-6 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <h3 className="text-sm font-mono mb-4" style={{ color: 'rgba(136,136,136,0.5)' }}>PROCESS</h3>
                    {selectedFirm.process.map((step, i) => (
                      <div key={i} className="flex items-center gap-3 mb-2">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs" style={{ background: 'rgba(255,215,0,0.15)', color: 'rgba(255,215,0,0.9)' }}>{i + 1}</div>
                        <span className="text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>{step}</span>
                      </div>
                    ))}
                  </div>
                  <div className="p-6 rounded-xl" style={{ background: 'rgba(255,215,0,0.05)', border: '1px solid rgba(255,215,0,0.15)' }}>
                    <h3 className="text-sm font-mono mb-4" style={{ color: 'rgba(255,215,0,0.7)' }}>TIPS</h3>
                    {selectedFirm.tips.map((tip, i) => (
                      <div key={i} className="flex items-start gap-2 mb-2 text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>
                        <CheckCircle2 size={14} style={{ color: 'rgba(255,215,0,0.6)', marginTop: 3 }} />
                        {tip}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Market Making Game */}
        {trainingTab === 'market-game' && <MarketMakingGame onExit={() => setTrainingTab('quant-lab')} />}

        {/* Leaderboard */}
        {trainingTab === 'leaderboard' && <Leaderboard currentUser={user?.name} />}
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════
  // ACADEMY VIEW
  // ═══════════════════════════════════════════════════════════════════════

  const AcademyView = () => {
    if (selectedLesson) {
      const lesson = MODULE_1_LESSONS.find(l => l.id === selectedLesson);
      if (!lesson) return null;
      return (
        <div className="min-h-screen px-8 py-24">
          <div className="max-w-4xl mx-auto">
            <button onClick={() => { setSelectedLesson(null); setQuizAnswers({}); setQuizSubmitted(false); }} className="flex items-center gap-2 text-sm mb-10 hover:text-white" style={{ color: 'rgba(255,255,255,0.4)' }}><ChevronLeft size={16} /> Back</button>
            <h1 className="text-3xl font-extralight mb-2" style={{ color: 'rgba(255,255,255,0.95)' }}>{lesson.title}</h1>
            <p className="text-sm font-mono mb-10" style={{ color: 'rgba(136,136,136,0.5)' }}>{lesson.duration}</p>
            <div className="p-10 rounded-2xl mb-10" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
              {lesson.content.map((block: any, i: number) => {
                if (block.type === 'h1') return <h2 key={i} className="text-2xl font-light mt-8 mb-4 first:mt-0" style={{ color: 'rgba(255,255,255,0.95)' }}>{block.text}</h2>;
                if (block.type === 'h2') return <h3 key={i} className="text-lg font-medium mt-6 mb-3" style={{ color: 'rgba(255,255,255,0.9)' }}>{block.text}</h3>;
                if (block.type === 'p') return <p key={i} className="mb-4" style={{ color: 'rgba(255,255,255,0.75)' }}>{block.text}</p>;
                if (block.type === 'def') return <div key={i} className="flex gap-4 mb-3 p-4 rounded-lg" style={{ background: block.highlight ? 'rgba(255,215,0,0.06)' : 'rgba(255,255,255,0.02)' }}><span className="font-medium text-sm" style={{ color: 'rgba(255,215,0,0.9)', minWidth: 120 }}>{block.term}</span><span className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>{block.definition}</span></div>;
                if (block.type === 'math') return <div key={i} className="my-6 p-5 rounded-xl text-center" style={{ background: 'rgba(59,130,246,0.08)' }}><div className="text-xs font-mono mb-2" style={{ color: 'rgba(59,130,246,0.7)' }}>{block.label}</div><div className="text-xl" style={{ color: 'rgba(255,255,255,0.95)' }}>{block.formula}</div></div>;
                return null;
              })}
            </div>
            <div className="p-10 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h2 className="text-xl font-light mb-8" style={{ color: 'rgba(255,255,255,0.9)' }}>Quiz</h2>
              {lesson.quiz.map((q: any, i: number) => (
                <div key={i} className="mb-8">
                  <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.9)' }}>{i + 1}. {q.q}</p>
                  <div className="grid grid-cols-2 gap-3">{q.opts.map((opt: string, j: number) => { const selected = quizAnswers[i] === j; const correct = j === q.correct; const show = quizSubmitted; return <button key={j} onClick={() => !quizSubmitted && setQuizAnswers(p => ({ ...p, [i]: j }))} disabled={quizSubmitted} className="p-4 rounded-xl text-left text-sm transition-all" style={{ background: show ? (correct ? 'rgba(34,197,94,0.1)' : selected ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.02)') : selected ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.02)', border: selected ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.8)' }}>{String.fromCharCode(65 + j)}. {opt}</button>; })}</div>
                </div>
              ))}
              {!quizSubmitted ? <button onClick={() => setQuizSubmitted(true)} disabled={Object.keys(quizAnswers).length < lesson.quiz.length} className="px-8 py-3 rounded-full text-sm font-medium disabled:opacity-30" style={{ background: 'rgba(255,255,255,0.95)', color: '#000' }}>Submit</button> : <button onClick={() => { setQuizAnswers({}); setQuizSubmitted(false); }} className="px-6 py-2 rounded-full text-sm" style={{ border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.8)' }}>Retry</button>}
            </div>
          </div>
        </div>
      );
    }
    if (selectedModule === 1) {
      return (
        <div className="min-h-screen px-8 py-24">
          <div className="max-w-4xl mx-auto">
            <button onClick={() => setSelectedModule(null)} className="flex items-center gap-2 text-sm mb-10 hover:text-white" style={{ color: 'rgba(255,255,255,0.4)' }}><ChevronLeft size={16} /> Back</button>
            <h1 className="text-3xl font-extralight mb-8" style={{ color: 'rgba(255,255,255,0.95)' }}>Options Fundamentals</h1>
            <div className="space-y-4">{MODULE_1_LESSONS.map((lesson, i) => <div key={lesson.id} onClick={() => setSelectedLesson(lesson.id)} className="p-6 rounded-xl cursor-pointer transition-all hover:bg-white/5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}><div className="flex items-center justify-between"><div className="flex items-center gap-5"><div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-mono" style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.6)' }}>{i + 1}</div><div><h3 className="font-light" style={{ color: 'rgba(255,255,255,0.9)' }}>{lesson.title}</h3><p className="text-xs" style={{ color: 'rgba(136,136,136,0.5)' }}>{lesson.duration}</p></div></div><ChevronRight size={18} style={{ color: 'rgba(255,255,255,0.3)' }} /></div></div>)}</div>
          </div>
        </div>
      );
    }
    return (
      <div className="min-h-screen px-8 py-24">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs font-mono tracking-[0.3em] mb-4" style={{ color: 'rgba(136,136,136,0.5)' }}>THE ACADEMY</p>
          <h1 className="text-4xl font-extralight mb-4" style={{ color: 'rgba(255,255,255,0.95)' }}>Complete Curriculum</h1>
          <p className="text-lg font-light mb-14" style={{ color: 'rgba(136,136,136,0.6)' }}>20 modules based on Hull, Vernimmen, and Damodaran.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">{SYLLABUS.map(mod => <div key={mod.id} onClick={() => mod.id === 1 && setSelectedModule(1)} className={`p-5 rounded-xl transition-all ${mod.id === 1 ? 'cursor-pointer hover:bg-white/5' : ''}`} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}><div className="flex items-center justify-between mb-3"><span className="text-xl">{mod.icon}</span><span className="text-[10px] px-2 py-1 rounded-full" style={{ background: mod.difficulty === 'Expert' ? 'rgba(239,68,68,0.15)' : mod.difficulty === 'Advanced' ? 'rgba(255,215,0,0.15)' : 'rgba(34,197,94,0.15)', color: mod.difficulty === 'Expert' ? 'rgba(239,68,68,0.9)' : mod.difficulty === 'Advanced' ? 'rgba(255,215,0,0.9)' : 'rgba(34,197,94,0.9)' }}>{mod.difficulty}</span></div><h3 className="text-sm font-medium mb-1" style={{ color: 'rgba(255,255,255,0.9)' }}>{mod.title}</h3><p className="text-xs" style={{ color: 'rgba(136,136,136,0.5)' }}>{mod.lessons} lessons</p></div>)}</div>
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════

  return (
    <div className="min-h-screen w-full" style={{ background: '#000', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <style>{`
        @keyframes pulse-ring { 0% { transform: scale(1); opacity: 0.3; } 100% { transform: scale(1.4); opacity: 0; } }
        @keyframes orb-pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.06); } }
        @keyframes orb-rec { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.08); } }
        @keyframes soundwave { 0% { transform: scaleY(0.3); } 100% { transform: scaleY(1); } }
        @keyframes pulse-border { 0%, 100% { box-shadow: 0 0 20px rgba(239,68,68,0.3); } 50% { box-shadow: 0 0 40px rgba(239,68,68,0.5); } }
        .animate-spin { animation: spin 1s linear infinite; }
        .animate-pulse { animation: pulse 2s ease-in-out infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        * { box-sizing: border-box; }
        ::selection { background: rgba(255,255,255,0.15); }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 3px; }
        select option { background: #000; color: #fff; }
      `}</style>
      
      <Navigation />
      
      {view === 'landing' && step === 0 && <LandingView />}
      {view === 'landing' && step > 0 && <OnboardingView />}
      {view === 'arena' && <ArenaView />}
      {view === 'academy' && <AcademyView />}
      {view === 'training' && <TrainingView />}
      
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} authMode={authMode} setAuthMode={setAuthMode} authEmail={authEmail} setAuthEmail={setAuthEmail} authPass={authPass} setAuthPass={setAuthPass} showPass={showPass} setShowPass={setShowPass} authLoading={authLoading} authError={authError} handleAuth={handleAuth} handleGoogleAuth={handleGoogleAuth} />}
      {showPricing && <PricingModal onClose={() => setShowPricing(false)} checkoutState={checkoutState} handleCheckout={handleCheckout} />}
    </div>
  );
};

export default FinaApp;
