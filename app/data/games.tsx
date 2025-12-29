// ═══════════════════════════════════════════════════════════════════════════
// FINA GAMES — Dice Trading, Card Trading, Sequence, Memory
// ═══════════════════════════════════════════════════════════════════════════

'use client';
import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import { Play, RefreshCw, Trophy, Clock, Zap, Target, Brain, Dices, Square, ChevronRight, Check, X } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════
// DICE TRADING GAME — SIG/Jane Street Style
// ═══════════════════════════════════════════════════════════════════════════

interface DiceGameProps {
  onExit: () => void;
}

export const DiceTrading = memo(({ onExit }: DiceGameProps) => {
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'results'>('intro');
  const [round, setRound] = useState(1);
  const [totalRounds] = useState(10);
  const [dice, setDice] = useState<number[]>([0, 0, 0]);
  const [hiddenDie, setHiddenDie] = useState(0);
  const [bid, setBid] = useState('');
  const [ask, setAsk] = useState('');
  const [pnl, setPnl] = useState(0);
  const [trades, setTrades] = useState<{round: number, action: string, price: number, fair: number, pnl: number}[]>([]);
  const [feedback, setFeedback] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const bidRef = useRef<HTMLInputElement>(null);

  const diceCount = difficulty === 'easy' ? 3 : difficulty === 'medium' ? 4 : 5;

  const rollDice = useCallback(() => {
    const newDice = Array(diceCount).fill(0).map(() => Math.floor(Math.random() * 6) + 1);
    const hidden = Math.floor(Math.random() * diceCount);
    setDice(newDice);
    setHiddenDie(hidden);
    setBid('');
    setAsk('');
    setShowResult(false);
    setFeedback('');
    setTimeLeft(difficulty === 'easy' ? 20 : difficulty === 'medium' ? 15 : 10);
  }, [diceCount, difficulty]);

  const startGame = useCallback(() => {
    setGameState('playing');
    setRound(1);
    setPnl(0);
    setTrades([]);
    rollDice();
    setTimeout(() => bidRef.current?.focus(), 100);
  }, [rollDice]);

  // Timer
  useEffect(() => {
    if (gameState === 'playing' && !showResult && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0 && !showResult) {
      handleTimeout();
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [gameState, timeLeft, showResult]);

  const handleTimeout = () => {
    setShowResult(true);
    setFeedback('⏰ Time out! No trade.');
    setTimeout(() => nextRound(), 2000);
  };

  const calculateFairValue = () => {
    const visibleSum = dice.reduce((sum, d, i) => i !== hiddenDie ? sum + d : sum, 0);
    // Fair value = visible + E[hidden] = visible + 3.5
    return visibleSum + 3.5;
  };

  const handleTrade = (action: 'buy' | 'sell') => {
    if (showResult) return;
    
    const bidNum = parseFloat(bid);
    const askNum = parseFloat(ask);
    
    if (isNaN(bidNum) || isNaN(askNum) || bidNum >= askNum) {
      setFeedback('⚠️ Invalid quote! Bid must be < Ask');
      return;
    }
    
    const fairValue = dice.reduce((s, d) => s + d, 0); // True sum with hidden
    const tradePrice = action === 'buy' ? askNum : bidNum;
    const tradePnl = action === 'buy' ? fairValue - tradePrice : tradePrice - fairValue;
    
    setPnl(p => p + tradePnl);
    setTrades(t => [...t, { round, action, price: tradePrice, fair: fairValue, pnl: tradePnl }]);
    setShowResult(true);
    setFeedback(tradePnl >= 0 
      ? `✅ ${action.toUpperCase()} @ ${tradePrice.toFixed(1)} | Fair: ${fairValue} | P&L: +${tradePnl.toFixed(1)}`
      : `❌ ${action.toUpperCase()} @ ${tradePrice.toFixed(1)} | Fair: ${fairValue} | P&L: ${tradePnl.toFixed(1)}`
    );
    
    setTimeout(() => nextRound(), 2500);
  };

  const nextRound = () => {
    if (round >= totalRounds) {
      setGameState('results');
    } else {
      setRound(r => r + 1);
      rollDice();
    }
  };

  // Render Die
  const Die = ({ value, hidden }: { value: number, hidden: boolean }) => {
    const dots: {[key: number]: string} = {
      1: 'M50,50',
      2: 'M25,25 M75,75',
      3: 'M25,25 M50,50 M75,75',
      4: 'M25,25 M75,25 M25,75 M75,75',
      5: 'M25,25 M75,25 M50,50 M25,75 M75,75',
      6: 'M25,25 M75,25 M25,50 M75,50 M25,75 M75,75'
    };
    
    const positions: {[key: number]: number[][]} = {
      1: [[50,50]],
      2: [[30,30],[70,70]],
      3: [[30,30],[50,50],[70,70]],
      4: [[30,30],[70,30],[30,70],[70,70]],
      5: [[30,30],[70,30],[50,50],[30,70],[70,70]],
      6: [[30,30],[70,30],[30,50],[70,50],[30,70],[70,70]]
    };

    return (
      <div 
        className="w-20 h-20 rounded-xl flex items-center justify-center relative"
        style={{ 
          background: hidden && !showResult ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)',
          border: '2px solid rgba(255,255,255,0.2)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }}
      >
        {hidden && !showResult ? (
          <span className="text-3xl" style={{ color: 'rgba(255,255,255,0.3)' }}>?</span>
        ) : (
          <svg viewBox="0 0 100 100" className="w-14 h-14">
            {positions[value]?.map((pos, i) => (
              <circle key={i} cx={pos[0]} cy={pos[1]} r="10" fill="rgba(255,255,255,0.9)" />
            ))}
          </svg>
        )}
      </div>
    );
  };

  if (gameState === 'intro') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="p-8 rounded-2xl mb-8" style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.1) 0%, rgba(168,85,247,0.02) 100%)', border: '1px solid rgba(168,85,247,0.2)' }}>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(168,85,247,0.2)' }}>
              <Dices size={28} style={{ color: 'rgba(168,85,247,0.9)' }} />
            </div>
            <div>
              <h2 className="text-2xl font-light" style={{ color: 'rgba(255,255,255,0.95)' }}>Dice Trading</h2>
              <p className="text-sm" style={{ color: 'rgba(136,136,136,0.6)' }}>SIG & Jane Street Interview Classic</p>
            </div>
          </div>
          
          <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.7)' }}>
            You see {diceCount - 1} dice, one is hidden. Make a market (bid/ask) on the SUM of ALL dice.
            The interviewer will either buy at your ask or sell at your bid. Profit from your edge!
          </p>
          
          <div className="p-4 rounded-xl mb-6" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <p className="text-xs font-mono mb-2" style={{ color: 'rgba(168,85,247,0.7)' }}>STRATEGY TIP</p>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
              E[die] = 3.5. If visible sum = 8, fair value = 8 + 3.5 = 11.5. Quote around 11/12 for edge.
            </p>
          </div>
          
          <div className="mb-6">
            <p className="text-xs font-mono tracking-widest mb-3" style={{ color: 'rgba(136,136,136,0.5)' }}>DIFFICULTY</p>
            <div className="flex gap-3">
              {(['easy', 'medium', 'hard'] as const).map(d => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className="flex-1 py-4 rounded-xl text-sm font-medium transition-all"
                  style={{
                    background: difficulty === d ? 'rgba(168,85,247,0.2)' : 'rgba(255,255,255,0.03)',
                    border: difficulty === d ? '1px solid rgba(168,85,247,0.5)' : '1px solid rgba(255,255,255,0.08)',
                    color: difficulty === d ? 'rgba(168,85,247,0.95)' : 'rgba(255,255,255,0.6)'
                  }}
                >
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                  <span className="block text-xs mt-1" style={{ color: 'rgba(136,136,136,0.5)' }}>
                    {d === 'easy' ? '3 dice' : d === 'medium' ? '4 dice' : '5 dice'}
                  </span>
                </button>
              ))}
            </div>
          </div>
          
          <button
            onClick={startGame}
            className="w-full py-4 rounded-xl text-base font-medium transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(90deg, rgba(168,85,247,0.9), rgba(139,92,246,0.9))', color: '#fff' }}
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
    const winRate = trades.filter(t => t.pnl > 0).length / trades.length * 100;
    
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="p-10 rounded-3xl mb-8" style={{ 
          background: pnl >= 0 
            ? 'linear-gradient(135deg, rgba(34,197,94,0.1) 0%, rgba(34,197,94,0.02) 100%)' 
            : 'linear-gradient(135deg, rgba(239,68,68,0.1) 0%, rgba(239,68,68,0.02) 100%)',
          border: pnl >= 0 ? '1px solid rgba(34,197,94,0.2)' : '1px solid rgba(239,68,68,0.2)'
        }}>
          <Trophy size={48} style={{ color: pnl >= 0 ? 'rgba(34,197,94,0.8)' : 'rgba(239,68,68,0.8)', margin: '0 auto 16px' }} />
          <h2 className="text-3xl font-light mb-2" style={{ color: 'rgba(255,255,255,0.95)' }}>Session Complete</h2>
          <div className="text-6xl font-extralight my-6" style={{ color: pnl >= 0 ? 'rgba(34,197,94,0.95)' : 'rgba(239,68,68,0.95)' }}>
            {pnl >= 0 ? '+' : ''}{pnl.toFixed(1)}
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <div className="text-2xl font-light" style={{ color: 'rgba(255,255,255,0.9)' }}>{trades.length}</div>
              <div className="text-xs" style={{ color: 'rgba(136,136,136,0.5)' }}>Trades</div>
            </div>
            <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <div className="text-2xl font-light" style={{ color: 'rgba(255,255,255,0.9)' }}>{winRate.toFixed(0)}%</div>
              <div className="text-xs" style={{ color: 'rgba(136,136,136,0.5)' }}>Win Rate</div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <button onClick={onExit} className="py-4 rounded-xl text-sm font-medium" style={{ border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.8)' }}>
            Back to Training
          </button>
          <button onClick={startGame} className="py-4 rounded-xl text-sm font-medium flex items-center justify-center gap-2" style={{ background: 'rgba(168,85,247,0.9)', color: '#fff' }}>
            <RefreshCw size={16} /> Play Again
          </button>
        </div>
      </div>
    );
  }

  // Playing state
  const fairValue = calculateFairValue();

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="text-sm font-mono" style={{ color: 'rgba(136,136,136,0.5)' }}>
          Round {round}/{totalRounds}
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full" style={{ 
          background: timeLeft < 5 ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.05)',
          border: timeLeft < 5 ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(255,255,255,0.1)'
        }}>
          <Clock size={16} style={{ color: timeLeft < 5 ? 'rgba(239,68,68,0.9)' : 'rgba(255,255,255,0.6)' }} />
          <span className="font-mono" style={{ color: timeLeft < 5 ? 'rgba(239,68,68,0.9)' : 'rgba(255,255,255,0.9)' }}>{timeLeft}s</span>
        </div>
        <div className="font-mono" style={{ color: pnl >= 0 ? 'rgba(34,197,94,0.9)' : 'rgba(239,68,68,0.9)' }}>
          P&L: {pnl >= 0 ? '+' : ''}{pnl.toFixed(1)}
        </div>
      </div>

      {/* Dice Display */}
      <div className="p-8 rounded-2xl mb-6" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <p className="text-xs font-mono tracking-widest text-center mb-6" style={{ color: 'rgba(136,136,136,0.5)' }}>
          MAKE A MARKET ON THE SUM
        </p>
        <div className="flex justify-center gap-4 mb-6">
          {dice.map((d, i) => (
            <Die key={i} value={d} hidden={i === hiddenDie} />
          ))}
        </div>
        <p className="text-center text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
          Visible sum: {dice.reduce((s, d, i) => i !== hiddenDie ? s + d : s, 0)} | Fair value hint: ~{fairValue.toFixed(1)}
        </p>
      </div>

      {/* Quote Entry */}
      <div className="p-6 rounded-xl mb-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1">
            <label className="text-xs font-mono mb-2 block" style={{ color: 'rgba(239,68,68,0.7)' }}>YOUR BID</label>
            <input
              ref={bidRef}
              type="number"
              step="0.5"
              value={bid}
              onChange={(e) => setBid(e.target.value)}
              disabled={showResult}
              className="w-full text-2xl font-mono py-3 px-4 rounded-lg outline-none"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: 'rgba(239,68,68,0.95)' }}
              placeholder="10"
            />
          </div>
          <div className="text-2xl font-light pt-6" style={{ color: 'rgba(255,255,255,0.3)' }}>/</div>
          <div className="flex-1">
            <label className="text-xs font-mono mb-2 block" style={{ color: 'rgba(34,197,94,0.7)' }}>YOUR ASK</label>
            <input
              type="number"
              step="0.5"
              value={ask}
              onChange={(e) => setAsk(e.target.value)}
              disabled={showResult}
              className="w-full text-2xl font-mono py-3 px-4 rounded-lg outline-none"
              style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: 'rgba(34,197,94,0.95)' }}
              placeholder="12"
            />
          </div>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={() => handleTrade('sell')}
            disabled={showResult || !bid || !ask}
            className="flex-1 py-3 rounded-lg font-medium transition-all disabled:opacity-40"
            style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.3)', color: 'rgba(239,68,68,0.9)' }}
          >
            They Buy (Lift Ask)
          </button>
          <button
            onClick={() => handleTrade('buy')}
            disabled={showResult || !bid || !ask}
            className="flex-1 py-3 rounded-lg font-medium transition-all disabled:opacity-40"
            style={{ background: 'rgba(34,197,94,0.2)', border: '1px solid rgba(34,197,94,0.3)', color: 'rgba(34,197,94,0.9)' }}
          >
            They Sell (Hit Bid)
          </button>
        </div>
      </div>

      {/* Feedback */}
      {feedback && (
        <div className="p-4 rounded-xl text-center text-sm" style={{ 
          background: feedback.includes('✅') ? 'rgba(34,197,94,0.1)' : feedback.includes('❌') ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.05)',
          border: feedback.includes('✅') ? '1px solid rgba(34,197,94,0.2)' : feedback.includes('❌') ? '1px solid rgba(239,68,68,0.2)' : '1px solid rgba(255,255,255,0.1)',
          color: 'rgba(255,255,255,0.9)'
        }}>
          {feedback}
        </div>
      )}
    </div>
  );
});
DiceTrading.displayName = 'DiceTrading';

// ═══════════════════════════════════════════════════════════════════════════
// CARD TRADING GAME — Flow Traders / Optiver Style
// ═══════════════════════════════════════════════════════════════════════════

interface CardGameProps {
  onExit: () => void;
}

export const CardTrading = memo(({ onExit }: CardGameProps) => {
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'results'>('intro');
  const [round, setRound] = useState(1);
  const [totalRounds] = useState(10);
  const [cards, setCards] = useState<{suit: string, value: number, symbol: string}[]>([]);
  const [hiddenCard, setHiddenCard] = useState(0);
  const [guess, setGuess] = useState('');
  const [pnl, setPnl] = useState(0);
  const [trades, setTrades] = useState<{round: number, guess: number, actual: number, diff: number}[]>([]);
  const [feedback, setFeedback] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(20);
  const [mode, setMode] = useState<'sum' | 'product' | 'average'>('sum');
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const suits = ['♠', '♥', '♦', '♣'];
  const suitColors: {[key: string]: string} = { '♠': '#fff', '♥': '#ef4444', '♦': '#ef4444', '♣': '#fff' };

  const generateCards = useCallback(() => {
    const numCards = 4;
    const newCards = Array(numCards).fill(0).map(() => {
      const suit = suits[Math.floor(Math.random() * 4)];
      const value = Math.floor(Math.random() * 13) + 1; // 1-13 (A-K)
      const symbols = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
      return { suit, value, symbol: symbols[value - 1] };
    });
    const hidden = Math.floor(Math.random() * numCards);
    setCards(newCards);
    setHiddenCard(hidden);
    setGuess('');
    setShowResult(false);
    setFeedback('');
    setTimeLeft(20);
  }, []);

  const startGame = useCallback(() => {
    setGameState('playing');
    setRound(1);
    setPnl(0);
    setTrades([]);
    generateCards();
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [generateCards]);

  // Timer
  useEffect(() => {
    if (gameState === 'playing' && !showResult && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0 && !showResult) {
      handleTimeout();
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [gameState, timeLeft, showResult]);

  const handleTimeout = () => {
    setShowResult(true);
    const actual = calculateActual();
    setFeedback(`⏰ Time out! Answer was ${actual}`);
    setPnl(p => p - 10); // Penalty
    setTimeout(() => nextRound(), 2000);
  };

  const calculateActual = () => {
    const values = cards.map(c => c.value);
    if (mode === 'sum') return values.reduce((a, b) => a + b, 0);
    if (mode === 'product') return values.reduce((a, b) => a * b, 1);
    return values.reduce((a, b) => a + b, 0) / values.length;
  };

  const calculateFairHint = () => {
    const visibleValues = cards.filter((_, i) => i !== hiddenCard).map(c => c.value);
    const visibleCalc = mode === 'sum' 
      ? visibleValues.reduce((a, b) => a + b, 0)
      : mode === 'product'
      ? visibleValues.reduce((a, b) => a * b, 1)
      : visibleValues.reduce((a, b) => a + b, 0);
    
    // Expected value of hidden card = 7 (average of 1-13)
    if (mode === 'sum') return `${visibleCalc} + E[hidden] ≈ ${visibleCalc + 7}`;
    if (mode === 'product') return `${visibleCalc} × E[hidden] ≈ ${Math.round(visibleCalc * 7)}`;
    return `(${visibleCalc} + E[hidden]) / 4 ≈ ${((visibleCalc + 7) / 4).toFixed(1)}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (showResult || !guess) return;
    
    const guessNum = parseFloat(guess);
    const actual = calculateActual();
    const diff = Math.abs(guessNum - actual);
    const points = Math.max(0, 10 - diff);
    
    setPnl(p => p + points);
    setTrades(t => [...t, { round, guess: guessNum, actual, diff }]);
    setShowResult(true);
    
    if (diff === 0) {
      setFeedback(`🎯 PERFECT! Exact answer: ${actual} (+10 pts)`);
    } else if (diff <= 2) {
      setFeedback(`✅ Close! Answer: ${actual}, You: ${guessNum} (+${points.toFixed(1)} pts)`);
    } else {
      setFeedback(`❌ Answer: ${actual}, You: ${guessNum} (+${points.toFixed(1)} pts)`);
    }
    
    setTimeout(() => nextRound(), 2500);
  };

  const nextRound = () => {
    if (round >= totalRounds) {
      setGameState('results');
    } else {
      setRound(r => r + 1);
      generateCards();
    }
  };

  // Card Component
  const Card = ({ card, hidden }: { card: {suit: string, value: number, symbol: string}, hidden: boolean }) => (
    <div 
      className="w-20 h-28 rounded-xl flex flex-col items-center justify-center relative"
      style={{ 
        background: hidden && !showResult ? 'linear-gradient(135deg, rgba(59,130,246,0.3), rgba(59,130,246,0.1))' : 'rgba(255,255,255,0.95)',
        border: '2px solid rgba(255,255,255,0.3)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
      }}
    >
      {hidden && !showResult ? (
        <div className="text-3xl" style={{ color: 'rgba(59,130,246,0.8)' }}>?</div>
      ) : (
        <>
          <div className="text-2xl font-bold" style={{ color: suitColors[card.suit] }}>{card.symbol}</div>
          <div className="text-3xl" style={{ color: suitColors[card.suit] }}>{card.suit}</div>
        </>
      )}
    </div>
  );

  if (gameState === 'intro') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="p-8 rounded-2xl mb-8" style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(59,130,246,0.02) 100%)', border: '1px solid rgba(59,130,246,0.2)' }}>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl" style={{ background: 'rgba(59,130,246,0.2)' }}>
              🃏
            </div>
            <div>
              <h2 className="text-2xl font-light" style={{ color: 'rgba(255,255,255,0.95)' }}>Card Trading</h2>
              <p className="text-sm" style={{ color: 'rgba(136,136,136,0.6)' }}>Flow Traders / Optiver Style</p>
            </div>
          </div>
          
          <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.7)' }}>
            You see 3 cards, one is hidden. Estimate the {mode} of all 4 card values (A=1, J=11, Q=12, K=13).
            The closer your guess, the more points you earn!
          </p>
          
          <div className="p-4 rounded-xl mb-6" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <p className="text-xs font-mono mb-2" style={{ color: 'rgba(59,130,246,0.7)' }}>STRATEGY TIP</p>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
              E[card] = 7. Use this to estimate the hidden card's contribution.
            </p>
          </div>
          
          <div className="mb-6">
            <p className="text-xs font-mono tracking-widest mb-3" style={{ color: 'rgba(136,136,136,0.5)' }}>GAME MODE</p>
            <div className="flex gap-3">
              {(['sum', 'product', 'average'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className="flex-1 py-4 rounded-xl text-sm font-medium transition-all"
                  style={{
                    background: mode === m ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.03)',
                    border: mode === m ? '1px solid rgba(59,130,246,0.5)' : '1px solid rgba(255,255,255,0.08)',
                    color: mode === m ? 'rgba(59,130,246,0.95)' : 'rgba(255,255,255,0.6)'
                  }}
                >
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          <button
            onClick={startGame}
            className="w-full py-4 rounded-xl text-base font-medium transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(90deg, rgba(59,130,246,0.9), rgba(37,99,235,0.9))', color: '#fff' }}
          >
            <Play size={20} /> Start Game
          </button>
        </div>
        
        <button onClick={onExit} className="text-sm hover:text-white transition-colors" style={{ color: 'rgba(255,255,255,0.4)' }}>
          ← Back to Training
        </button>
      </div>
    );
  }

  if (gameState === 'results') {
    const perfectCount = trades.filter(t => t.diff === 0).length;
    const avgDiff = trades.reduce((s, t) => s + t.diff, 0) / trades.length;
    
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="p-10 rounded-3xl mb-8" style={{ 
          background: pnl >= 50 
            ? 'linear-gradient(135deg, rgba(34,197,94,0.1) 0%, rgba(34,197,94,0.02) 100%)' 
            : 'linear-gradient(135deg, rgba(255,215,0,0.1) 0%, rgba(255,215,0,0.02) 100%)',
          border: pnl >= 50 ? '1px solid rgba(34,197,94,0.2)' : '1px solid rgba(255,215,0,0.2)'
        }}>
          <Trophy size={48} style={{ color: pnl >= 50 ? 'rgba(34,197,94,0.8)' : 'rgba(255,215,0,0.8)', margin: '0 auto 16px' }} />
          <h2 className="text-3xl font-light mb-2" style={{ color: 'rgba(255,255,255,0.95)' }}>Game Complete</h2>
          <div className="text-6xl font-extralight my-6" style={{ color: 'rgba(59,130,246,0.95)' }}>
            {pnl.toFixed(0)} pts
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <div className="text-2xl font-light" style={{ color: 'rgba(255,255,255,0.9)' }}>{perfectCount}</div>
              <div className="text-xs" style={{ color: 'rgba(136,136,136,0.5)' }}>Perfect Answers</div>
            </div>
            <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <div className="text-2xl font-light" style={{ color: 'rgba(255,255,255,0.9)' }}>{avgDiff.toFixed(1)}</div>
              <div className="text-xs" style={{ color: 'rgba(136,136,136,0.5)' }}>Avg Difference</div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <button onClick={onExit} className="py-4 rounded-xl text-sm font-medium" style={{ border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.8)' }}>
            Back to Training
          </button>
          <button onClick={startGame} className="py-4 rounded-xl text-sm font-medium flex items-center justify-center gap-2" style={{ background: 'rgba(59,130,246,0.9)', color: '#fff' }}>
            <RefreshCw size={16} /> Play Again
          </button>
        </div>
      </div>
    );
  }

  // Playing state
  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="text-sm font-mono" style={{ color: 'rgba(136,136,136,0.5)' }}>
          Round {round}/{totalRounds}
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full" style={{ 
          background: timeLeft < 5 ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.05)',
        }}>
          <Clock size={16} style={{ color: timeLeft < 5 ? 'rgba(239,68,68,0.9)' : 'rgba(255,255,255,0.6)' }} />
          <span className="font-mono" style={{ color: timeLeft < 5 ? 'rgba(239,68,68,0.9)' : 'rgba(255,255,255,0.9)' }}>{timeLeft}s</span>
        </div>
        <div className="font-mono" style={{ color: 'rgba(59,130,246,0.9)' }}>
          Score: {pnl.toFixed(0)}
        </div>
      </div>

      {/* Cards Display */}
      <div className="p-8 rounded-2xl mb-6" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <p className="text-xs font-mono tracking-widest text-center mb-6" style={{ color: 'rgba(136,136,136,0.5)' }}>
          ESTIMATE THE {mode.toUpperCase()} OF ALL CARDS
        </p>
        <div className="flex justify-center gap-4 mb-6">
          {cards.map((c, i) => (
            <Card key={i} card={c} hidden={i === hiddenCard} />
          ))}
        </div>
        <p className="text-center text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
          Hint: {calculateFairHint()}
        </p>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-6 rounded-xl mb-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-4">
          <input
            ref={inputRef}
            type="number"
            step="0.1"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            disabled={showResult}
            className="flex-1 text-2xl font-mono py-3 px-4 rounded-lg outline-none text-center"
            style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', color: '#fff' }}
            placeholder="Your guess"
          />
          <button
            type="submit"
            disabled={showResult || !guess}
            className="px-8 py-3 rounded-lg font-medium transition-all disabled:opacity-40"
            style={{ background: 'rgba(59,130,246,0.9)', color: '#fff' }}
          >
            Submit
          </button>
        </div>
      </form>

      {/* Feedback */}
      {feedback && (
        <div className="p-4 rounded-xl text-center text-sm" style={{ 
          background: feedback.includes('🎯') || feedback.includes('✅') ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
          border: feedback.includes('🎯') || feedback.includes('✅') ? '1px solid rgba(34,197,94,0.2)' : '1px solid rgba(239,68,68,0.2)',
          color: 'rgba(255,255,255,0.9)'
        }}>
          {feedback}
        </div>
      )}
    </div>
  );
});
CardTrading.displayName = 'CardTrading';

// ═══════════════════════════════════════════════════════════════════════════
// SEQUENCE TEST — Flow Traders / Optiver Style
// ═══════════════════════════════════════════════════════════════════════════

interface SequenceGameProps {
  onExit: () => void;
}

export const SequenceTest = memo(({ onExit }: SequenceGameProps) => {
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'results'>('intro');
  const [round, setRound] = useState(1);
  const [totalRounds] = useState(15);
  const [sequence, setSequence] = useState<number[]>([]);
  const [answer, setAnswer] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [patternType, setPatternType] = useState('');
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [results, setResults] = useState<{correct: boolean, pattern: string}[]>([]);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const generateSequence = useCallback(() => {
    const patterns = difficulty === 'easy' 
      ? ['arithmetic', 'geometric', 'squares']
      : difficulty === 'medium'
      ? ['arithmetic', 'geometric', 'squares', 'fibonacci', 'triangular']
      : ['arithmetic', 'geometric', 'squares', 'fibonacci', 'triangular', 'primes', 'doubleOp', 'alternating'];
    
    const pattern = patterns[Math.floor(Math.random() * patterns.length)];
    let seq: number[] = [];
    let next = 0;
    
    switch (pattern) {
      case 'arithmetic': {
        const start = Math.floor(Math.random() * 20) + 1;
        const diff = Math.floor(Math.random() * 10) + 2;
        seq = Array(5).fill(0).map((_, i) => start + i * diff);
        next = start + 5 * diff;
        setPatternType(`+${diff} each term`);
        break;
      }
      case 'geometric': {
        const start = Math.floor(Math.random() * 5) + 1;
        const ratio = Math.floor(Math.random() * 3) + 2;
        seq = Array(5).fill(0).map((_, i) => start * Math.pow(ratio, i));
        next = start * Math.pow(ratio, 5);
        setPatternType(`×${ratio} each term`);
        break;
      }
      case 'squares': {
        const offset = Math.floor(Math.random() * 5);
        seq = Array(5).fill(0).map((_, i) => Math.pow(i + 1 + offset, 2));
        next = Math.pow(6 + offset, 2);
        setPatternType('Perfect squares');
        break;
      }
      case 'fibonacci': {
        const a = Math.floor(Math.random() * 5) + 1;
        const b = Math.floor(Math.random() * 5) + 1;
        seq = [a, b];
        for (let i = 2; i < 6; i++) seq.push(seq[i-1] + seq[i-2]);
        next = seq[4] + seq[5];
        seq = seq.slice(0, 5);
        setPatternType('Fibonacci-like (sum of previous 2)');
        break;
      }
      case 'triangular': {
        const offset = Math.floor(Math.random() * 3);
        seq = Array(5).fill(0).map((_, i) => ((i + 1 + offset) * (i + 2 + offset)) / 2);
        next = ((6 + offset) * (7 + offset)) / 2;
        setPatternType('Triangular numbers');
        break;
      }
      case 'primes': {
        const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];
        const start = Math.floor(Math.random() * 5);
        seq = primes.slice(start, start + 5);
        next = primes[start + 5];
        setPatternType('Prime numbers');
        break;
      }
      case 'doubleOp': {
        const start = Math.floor(Math.random() * 10) + 1;
        const add = Math.floor(Math.random() * 5) + 1;
        const mult = 2;
        seq = [start];
        for (let i = 1; i < 5; i++) {
          seq.push(i % 2 === 1 ? seq[i-1] + add : seq[i-1] * mult);
        }
        next = 5 % 2 === 1 ? seq[4] + add : seq[4] * mult;
        setPatternType(`Alternating +${add} and ×${mult}`);
        break;
      }
      case 'alternating': {
        const a = Math.floor(Math.random() * 10) + 1;
        const b = Math.floor(Math.random() * 10) + 1;
        const diffA = Math.floor(Math.random() * 5) + 1;
        const diffB = Math.floor(Math.random() * 5) + 1;
        seq = [a, b, a + diffA, b + diffB, a + 2*diffA];
        next = b + 2*diffB;
        setPatternType('Two interleaved sequences');
        break;
      }
    }
    
    setSequence(seq);
    setCorrectAnswer(next);
    setAnswer('');
    setShowResult(false);
    setFeedback('');
    setTimeLeft(difficulty === 'easy' ? 30 : difficulty === 'medium' ? 25 : 20);
  }, [difficulty]);

  const startGame = useCallback(() => {
    setGameState('playing');
    setRound(1);
    setScore(0);
    setStreak(0);
    setResults([]);
    generateSequence();
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [generateSequence]);

  // Timer
  useEffect(() => {
    if (gameState === 'playing' && !showResult && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0 && !showResult) {
      handleTimeout();
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [gameState, timeLeft, showResult]);

  const handleTimeout = () => {
    setShowResult(true);
    setStreak(0);
    setResults(r => [...r, { correct: false, pattern: patternType }]);
    setFeedback(`⏰ Time's up! Answer: ${correctAnswer} (${patternType})`);
    setTimeout(() => nextRound(), 2500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (showResult || !answer) return;
    
    const answerNum = parseInt(answer);
    const isCorrect = answerNum === correctAnswer;
    
    if (isCorrect) {
      const points = 10 + streak * 2;
      setScore(s => s + points);
      setStreak(s => s + 1);
      setFeedback(`✅ Correct! +${points} pts (${patternType})`);
    } else {
      setStreak(0);
      setFeedback(`❌ Wrong! Answer: ${correctAnswer} (${patternType})`);
    }
    
    setResults(r => [...r, { correct: isCorrect, pattern: patternType }]);
    setShowResult(true);
    setTimeout(() => nextRound(), 2000);
  };

  const nextRound = () => {
    if (round >= totalRounds) {
      setGameState('results');
    } else {
      setRound(r => r + 1);
      generateSequence();
    }
  };

  if (gameState === 'intro') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="p-8 rounded-2xl mb-8" style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.1) 0%, rgba(34,197,94,0.02) 100%)', border: '1px solid rgba(34,197,94,0.2)' }}>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(34,197,94,0.2)' }}>
              <Target size={28} style={{ color: 'rgba(34,197,94,0.9)' }} />
            </div>
            <div>
              <h2 className="text-2xl font-light" style={{ color: 'rgba(255,255,255,0.95)' }}>Sequence Test</h2>
              <p className="text-sm" style={{ color: 'rgba(136,136,136,0.6)' }}>Flow Traders / Optiver Style</p>
            </div>
          </div>
          
          <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.7)' }}>
            Find the pattern and predict the next number in the sequence. 
            Build streaks for bonus points!
          </p>
          
          <div className="p-4 rounded-xl mb-6" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <p className="text-xs font-mono mb-2" style={{ color: 'rgba(34,197,94,0.7)' }}>PATTERN TYPES</p>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Arithmetic (+n), Geometric (×n), Squares, Fibonacci, Primes, and more...
            </p>
          </div>
          
          <div className="mb-6">
            <p className="text-xs font-mono tracking-widest mb-3" style={{ color: 'rgba(136,136,136,0.5)' }}>DIFFICULTY</p>
            <div className="flex gap-3">
              {(['easy', 'medium', 'hard'] as const).map(d => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className="flex-1 py-4 rounded-xl text-sm font-medium transition-all"
                  style={{
                    background: difficulty === d ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.03)',
                    border: difficulty === d ? '1px solid rgba(34,197,94,0.5)' : '1px solid rgba(255,255,255,0.08)',
                    color: difficulty === d ? 'rgba(34,197,94,0.95)' : 'rgba(255,255,255,0.6)'
                  }}
                >
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          <button
            onClick={startGame}
            className="w-full py-4 rounded-xl text-base font-medium transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(90deg, rgba(34,197,94,0.9), rgba(22,163,74,0.9))', color: '#000' }}
          >
            <Play size={20} /> Start Test
          </button>
        </div>
        
        <button onClick={onExit} className="text-sm hover:text-white transition-colors" style={{ color: 'rgba(255,255,255,0.4)' }}>
          ← Back to Training
        </button>
      </div>
    );
  }

  if (gameState === 'results') {
    const correctCount = results.filter(r => r.correct).length;
    const accuracy = (correctCount / results.length * 100).toFixed(0);
    
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="p-10 rounded-3xl mb-8" style={{ 
          background: parseInt(accuracy) >= 70 
            ? 'linear-gradient(135deg, rgba(34,197,94,0.1) 0%, rgba(34,197,94,0.02) 100%)' 
            : 'linear-gradient(135deg, rgba(255,215,0,0.1) 0%, rgba(255,215,0,0.02) 100%)',
          border: parseInt(accuracy) >= 70 ? '1px solid rgba(34,197,94,0.2)' : '1px solid rgba(255,215,0,0.2)'
        }}>
          <Trophy size={48} style={{ color: parseInt(accuracy) >= 70 ? 'rgba(34,197,94,0.8)' : 'rgba(255,215,0,0.8)', margin: '0 auto 16px' }} />
          <h2 className="text-3xl font-light mb-2" style={{ color: 'rgba(255,255,255,0.95)' }}>Test Complete</h2>
          <div className="text-6xl font-extralight my-6" style={{ color: 'rgba(34,197,94,0.95)' }}>
            {score} pts
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <div className="text-2xl font-light" style={{ color: 'rgba(255,255,255,0.9)' }}>{correctCount}/{totalRounds}</div>
              <div className="text-xs" style={{ color: 'rgba(136,136,136,0.5)' }}>Correct</div>
            </div>
            <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <div className="text-2xl font-light" style={{ color: 'rgba(255,255,255,0.9)' }}>{accuracy}%</div>
              <div className="text-xs" style={{ color: 'rgba(136,136,136,0.5)' }}>Accuracy</div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <button onClick={onExit} className="py-4 rounded-xl text-sm font-medium" style={{ border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.8)' }}>
            Back to Training
          </button>
          <button onClick={startGame} className="py-4 rounded-xl text-sm font-medium flex items-center justify-center gap-2" style={{ background: 'rgba(34,197,94,0.9)', color: '#000' }}>
            <RefreshCw size={16} /> Try Again
          </button>
        </div>
      </div>
    );
  }

  // Playing state
  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="text-sm font-mono" style={{ color: 'rgba(136,136,136,0.5)' }}>
          {round}/{totalRounds}
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full" style={{ 
          background: timeLeft < 10 ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.05)',
        }}>
          <Clock size={16} style={{ color: timeLeft < 10 ? 'rgba(239,68,68,0.9)' : 'rgba(255,255,255,0.6)' }} />
          <span className="font-mono" style={{ color: timeLeft < 10 ? 'rgba(239,68,68,0.9)' : 'rgba(255,255,255,0.9)' }}>{timeLeft}s</span>
        </div>
        <div className="flex items-center gap-4">
          {streak > 0 && <span className="text-sm" style={{ color: 'rgba(255,215,0,0.9)' }}>🔥 {streak}</span>}
          <span className="font-mono" style={{ color: 'rgba(34,197,94,0.9)' }}>{score} pts</span>
        </div>
      </div>

      {/* Sequence Display */}
      <div className="p-8 rounded-2xl mb-6" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <p className="text-xs font-mono tracking-widest text-center mb-8" style={{ color: 'rgba(136,136,136,0.5)' }}>
          FIND THE NEXT NUMBER
        </p>
        <div className="flex justify-center items-center gap-4 flex-wrap">
          {sequence.map((n, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-mono" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: 'rgba(34,197,94,0.95)' }}>
                {n}
              </div>
              {i < sequence.length - 1 && <ChevronRight size={20} style={{ color: 'rgba(255,255,255,0.3)' }} />}
            </div>
          ))}
          <ChevronRight size={20} style={{ color: 'rgba(255,255,255,0.3)' }} />
          <div className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl" style={{ background: 'rgba(255,255,255,0.05)', border: '2px dashed rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.4)' }}>
            ?
          </div>
        </div>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex items-center gap-4 mb-4">
        <input
          ref={inputRef}
          type="number"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          disabled={showResult}
          className="flex-1 text-2xl font-mono py-4 px-6 rounded-xl outline-none text-center"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
          placeholder="Next number"
        />
        <button
          type="submit"
          disabled={showResult || !answer}
          className="px-8 py-4 rounded-xl font-medium transition-all disabled:opacity-40"
          style={{ background: 'rgba(34,197,94,0.9)', color: '#000' }}
        >
          Submit
        </button>
      </form>

      {/* Feedback */}
      {feedback && (
        <div className="p-4 rounded-xl text-center text-sm" style={{ 
          background: feedback.includes('✅') ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
          border: feedback.includes('✅') ? '1px solid rgba(34,197,94,0.2)' : '1px solid rgba(239,68,68,0.2)',
          color: 'rgba(255,255,255,0.9)'
        }}>
          {feedback}
        </div>
      )}
    </div>
  );
});
SequenceTest.displayName = 'SequenceTest';

// ═══════════════════════════════════════════════════════════════════════════
// MEMORY TEST — IMC / Optiver Style
// ═══════════════════════════════════════════════════════════════════════════

interface MemoryGameProps {
  onExit: () => void;
}

export const MemoryTest = memo(({ onExit }: MemoryGameProps) => {
  const [gameState, setGameState] = useState<'intro' | 'showing' | 'input' | 'results'>('intro');
  const [level, setLevel] = useState(3);
  const [sequence, setSequence] = useState<number[]>([]);
  const [userInput, setUserInput] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [feedback, setFeedback] = useState('');
  const [showingIndex, setShowingIndex] = useState(0);
  const [mode, setMode] = useState<'numbers' | 'colors' | 'mixed'>('numbers');
  const [highScore, setHighScore] = useState(0);
  
  const colors = ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#a855f7', '#ec4899', '#14b8a6', '#f97316', '#6366f1'];

  const generateSequence = useCallback((length: number) => {
    const max = mode === 'colors' ? 9 : 10;
    return Array(length).fill(0).map(() => Math.floor(Math.random() * max));
  }, [mode]);

  const startGame = useCallback(() => {
    setLevel(3);
    setScore(0);
    setLives(3);
    setFeedback('');
    startRound(3);
  }, []);

  const startRound = (len: number) => {
    const seq = generateSequence(len);
    setSequence(seq);
    setUserInput([]);
    setGameState('showing');
    setShowingIndex(0);
    
    // Show sequence one by one
    let i = 0;
    const interval = setInterval(() => {
      setShowingIndex(i + 1);
      i++;
      if (i >= seq.length) {
        clearInterval(interval);
        setTimeout(() => {
          setGameState('input');
          setShowingIndex(0);
        }, 500);
      }
    }, mode === 'numbers' ? 800 : 600);
  };

  const handleInput = (num: number) => {
    if (gameState !== 'input') return;
    
    const newInput = [...userInput, num];
    setUserInput(newInput);
    
    // Check if wrong
    if (num !== sequence[newInput.length - 1]) {
      const newLives = lives - 1;
      setLives(newLives);
      setFeedback(`❌ Wrong! Correct was: ${sequence.join(' → ')}`);
      
      if (newLives <= 0) {
        setHighScore(hs => Math.max(hs, score));
        setTimeout(() => setGameState('results'), 1500);
      } else {
        setTimeout(() => startRound(level), 1500);
      }
      return;
    }
    
    // Check if complete
    if (newInput.length === sequence.length) {
      const points = level * 10;
      setScore(s => s + points);
      setFeedback(`✅ Correct! +${points} pts`);
      setLevel(l => l + 1);
      setTimeout(() => startRound(level + 1), 1000);
    }
  };

  if (gameState === 'intro') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="p-8 rounded-2xl mb-8" style={{ background: 'linear-gradient(135deg, rgba(236,72,153,0.1) 0%, rgba(236,72,153,0.02) 100%)', border: '1px solid rgba(236,72,153,0.2)' }}>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(236,72,153,0.2)' }}>
              <Brain size={28} style={{ color: 'rgba(236,72,153,0.9)' }} />
            </div>
            <div>
              <h2 className="text-2xl font-light" style={{ color: 'rgba(255,255,255,0.95)' }}>Memory Test</h2>
              <p className="text-sm" style={{ color: 'rgba(136,136,136,0.6)' }}>IMC / Optiver Cognitive Test</p>
            </div>
          </div>
          
          <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.7)' }}>
            Memorize the sequence and repeat it back. The sequence gets longer each round.
            You have 3 lives!
          </p>
          
          <div className="mb-6">
            <p className="text-xs font-mono tracking-widest mb-3" style={{ color: 'rgba(136,136,136,0.5)' }}>MODE</p>
            <div className="flex gap-3">
              {(['numbers', 'colors', 'mixed'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className="flex-1 py-4 rounded-xl text-sm font-medium transition-all"
                  style={{
                    background: mode === m ? 'rgba(236,72,153,0.2)' : 'rgba(255,255,255,0.03)',
                    border: mode === m ? '1px solid rgba(236,72,153,0.5)' : '1px solid rgba(255,255,255,0.08)',
                    color: mode === m ? 'rgba(236,72,153,0.95)' : 'rgba(255,255,255,0.6)'
                  }}
                >
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          <button
            onClick={startGame}
            className="w-full py-4 rounded-xl text-base font-medium transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(90deg, rgba(236,72,153,0.9), rgba(219,39,119,0.9))', color: '#fff' }}
          >
            <Play size={20} /> Start Test
          </button>
        </div>
        
        <button onClick={onExit} className="text-sm hover:text-white transition-colors" style={{ color: 'rgba(255,255,255,0.4)' }}>
          ← Back to Training
        </button>
      </div>
    );
  }

  if (gameState === 'results') {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="p-10 rounded-3xl mb-8" style={{ 
          background: 'linear-gradient(135deg, rgba(236,72,153,0.1) 0%, rgba(236,72,153,0.02) 100%)',
          border: '1px solid rgba(236,72,153,0.2)'
        }}>
          <Brain size={48} style={{ color: 'rgba(236,72,153,0.8)', margin: '0 auto 16px' }} />
          <h2 className="text-3xl font-light mb-2" style={{ color: 'rgba(255,255,255,0.95)' }}>Game Over</h2>
          <div className="text-6xl font-extralight my-6" style={{ color: 'rgba(236,72,153,0.95)' }}>
            {score} pts
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <div className="text-2xl font-light" style={{ color: 'rgba(255,255,255,0.9)' }}>{level - 1}</div>
              <div className="text-xs" style={{ color: 'rgba(136,136,136,0.5)' }}>Max Level</div>
            </div>
            <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <div className="text-2xl font-light" style={{ color: 'rgba(255,255,255,0.9)' }}>{highScore}</div>
              <div className="text-xs" style={{ color: 'rgba(136,136,136,0.5)' }}>High Score</div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <button onClick={onExit} className="py-4 rounded-xl text-sm font-medium" style={{ border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.8)' }}>
            Back to Training
          </button>
          <button onClick={startGame} className="py-4 rounded-xl text-sm font-medium flex items-center justify-center gap-2" style={{ background: 'rgba(236,72,153,0.9)', color: '#fff' }}>
            <RefreshCw size={16} /> Try Again
          </button>
        </div>
      </div>
    );
  }

  // Showing / Input states
  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="text-sm font-mono" style={{ color: 'rgba(136,136,136,0.5)' }}>
          Level {level} ({sequence.length} items)
        </div>
        <div className="flex items-center gap-2">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="text-xl">{i < lives ? '❤️' : '🖤'}</div>
          ))}
        </div>
        <div className="font-mono" style={{ color: 'rgba(236,72,153,0.9)' }}>
          {score} pts
        </div>
      </div>

      {/* Display Area */}
      <div className="p-12 rounded-2xl mb-6 min-h-[200px] flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
        {gameState === 'showing' && (
          <div className="text-center">
            <p className="text-xs font-mono tracking-widest mb-6" style={{ color: 'rgba(136,136,136,0.5)' }}>MEMORIZE</p>
            {mode === 'numbers' || mode === 'mixed' ? (
              <div className="text-7xl font-mono" style={{ color: 'rgba(236,72,153,0.95)' }}>
                {showingIndex > 0 ? sequence[showingIndex - 1] : ''}
              </div>
            ) : (
              <div className="w-24 h-24 rounded-2xl mx-auto" style={{ background: showingIndex > 0 ? colors[sequence[showingIndex - 1]] : 'transparent' }} />
            )}
            <div className="flex justify-center gap-1 mt-6">
              {sequence.map((_, i) => (
                <div key={i} className="w-2 h-2 rounded-full" style={{ background: i < showingIndex ? 'rgba(236,72,153,0.9)' : 'rgba(255,255,255,0.2)' }} />
              ))}
            </div>
          </div>
        )}
        
        {gameState === 'input' && (
          <div className="text-center w-full">
            <p className="text-xs font-mono tracking-widest mb-4" style={{ color: 'rgba(136,136,136,0.5)' }}>YOUR TURN</p>
            <div className="flex justify-center gap-2 mb-6 min-h-[40px]">
              {userInput.map((n, i) => (
                <div key={i} className="w-10 h-10 rounded-lg flex items-center justify-center text-lg font-mono" style={{ background: 'rgba(236,72,153,0.2)', color: 'rgba(236,72,153,0.95)' }}>
                  {mode === 'colors' ? '' : n}
                </div>
              ))}
              {userInput.length < sequence.length && (
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ border: '2px dashed rgba(255,255,255,0.2)' }} />
              )}
            </div>
            <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {userInput.length}/{sequence.length}
            </p>
          </div>
        )}
      </div>

      {/* Input Buttons */}
      {gameState === 'input' && (
        <div className="grid grid-cols-5 gap-2 mb-4">
          {(mode === 'colors' ? colors.slice(0, 9) : [0,1,2,3,4,5,6,7,8,9]).map((item, i) => (
            <button
              key={i}
              onClick={() => handleInput(typeof item === 'number' ? item : i)}
              className="py-4 rounded-xl text-xl font-mono transition-all hover:scale-105"
              style={{ 
                background: mode === 'colors' ? item as string : 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: mode === 'colors' ? '#fff' : 'rgba(255,255,255,0.9)'
              }}
            >
              {mode === 'colors' ? '' : item}
            </button>
          ))}
        </div>
      )}

      {/* Feedback */}
      {feedback && (
        <div className="p-4 rounded-xl text-center text-sm" style={{ 
          background: feedback.includes('✅') ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
          border: feedback.includes('✅') ? '1px solid rgba(34,197,94,0.2)' : '1px solid rgba(239,68,68,0.2)',
          color: 'rgba(255,255,255,0.9)'
        }}>
          {feedback}
        </div>
      )}
    </div>
  );
});
MemoryTest.displayName = 'MemoryTest';
