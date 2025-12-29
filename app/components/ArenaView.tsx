'use client';

import React, { useState, useRef, useEffect, memo } from 'react';
import { Mic, Square, Brain, Zap, Target, Play, RefreshCw, BarChart3 } from 'lucide-react';
import { InterviewMode, FILLER_WORDS } from '../data/arena';

const FIRST_QUESTIONS: Record<string, string[]> = {
  technical: [
    "Let's start. What is delta in options and how do traders use it?",
    "Explain implied volatility to me.",
    "How does put-call parity work?",
    "Walk me through Black-Scholes assumptions.",
    "What is gamma and why does it matter?"
  ],
  behavioral: [
    "Tell me about yourself.",
    "Why do you want to work in finance?",
    "What's your biggest strength?",
    "Describe your ideal work environment.",
    "What motivates you?"
  ],
  stress: [
    "What's 17 times 23?",
    "What's 15% of 840?",
    "I flip a coin - heads you win $150, tails lose $100. Play?",
    "What's the square root of 289?",
    "Two dice - probability sum is 7?"
  ],
  'case-study': [
    "Stock at $100, you expect 20% move but unsure direction. How do you trade?",
    "How would you value a high-growth company with negative earnings?",
    "Implied vol looks too high. How do you trade it?",
    "Walk me through a DCF valuation.",
    "When would you use a pairs trade?"
  ]
};

export const ArenaView = memo(({ onExit }: { onExit: () => void }) => {
  const [phase, setPhase] = useState<'select'|'interview'|'results'>('select');
  const [mode, setMode] = useState<InterviewMode|null>(null);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [questionsAsked, setQuestionsAsked] = useState<string[]>([]);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [displayText, setDisplayText] = useState('');
  
  const [orbState, setOrbState] = useState('idle');
  const [audioLevel, setAudioLevel] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [interim, setInterim] = useState('');
  const [micError, setMicError] = useState<string|null>(null);
  
  const [totalWords, setTotalWords] = useState(0);
  const [totalFillers, setTotalFillers] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const [startTime, setStartTime] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  
  const recRef = useRef<any>(null);
  const audioCtxRef = useRef<AudioContext|null>(null);
  const streamRef = useRef<MediaStream|null>(null);
  const animRef = useRef<number|null>(null);

  useEffect(() => {
    if (phase !== 'interview' || !startTime) return;
    const i = setInterval(() => setElapsed(Math.floor((Date.now()-startTime)/1000)), 1000);
    return () => clearInterval(i);
  }, [phase, startTime]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { setMicError('Use Chrome'); return; }
    
    const r = new SR();
    r.continuous = true;
    r.interimResults = true;
    r.lang = 'en-US';
    
    r.onresult = (e: any) => {
      let f = '', i = '';
      for (let x = e.resultIndex; x < e.results.length; x++) {
        if (e.results[x].isFinal) f += e.results[x][0].transcript + ' ';
        else i = e.results[x][0].transcript;
      }
      if (f) setTranscript(p => p + f);
      setInterim(i);
    };
    
    r.onerror = (e: any) => {
      if (e.error === 'not-allowed') setMicError('Allow mic');
      setOrbState('idle');
    };
    
    recRef.current = r;
  }, []);

  const countFillers = (t: string) => {
    let c = 0;
    FILLER_WORDS.forEach(f => { 
      const m = t.toLowerCase().match(new RegExp(`\\b${f}\\b`,'g')); 
      if (m) c += m.length; 
    });
    return c;
  };

  const startAudio = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = s;
      audioCtxRef.current = new AudioContext();
      const a = audioCtxRef.current.createAnalyser();
      audioCtxRef.current.createMediaStreamSource(s).connect(a);
      a.fftSize = 128;
      const d = new Uint8Array(a.frequencyBinCount);
      const upd = () => { 
        a.getByteFrequencyData(d); 
        setAudioLevel(d.reduce((x,y)=>x+y,0)/d.length/255); 
        animRef.current = requestAnimationFrame(upd); 
      };
      upd();
    } catch { setMicError('Mic error'); }
  };

  const stopAudio = () => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    if (audioCtxRef.current) audioCtxRef.current.close();
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    audioCtxRef.current = null; streamRef.current = null; setAudioLevel(0);
  };

  const speak = async (text: string): Promise<void> => {
    return new Promise(async (resolve) => {
      setOrbState('speaking');
      try {
        const res = await fetch('/api/voice', { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify({ text }) 
        });
        if (res.ok) {
          const audio = new Audio(URL.createObjectURL(await res.blob()));
          audio.onended = () => { setOrbState('idle'); resolve(); };
          await audio.play();
          return;
        }
      } catch {}
      if ('speechSynthesis' in window) {
        const u = new SpeechSynthesisUtterance(text);
        u.rate = 0.95;
        u.onend = () => { setOrbState('idle'); resolve(); };
        speechSynthesis.speak(u);
      } else { 
        setOrbState('idle'); 
        resolve(); 
      }
    });
  };

  const startInterview = () => {
    if (!mode) return;
    
    const firstQs = FIRST_QUESTIONS[mode];
    const firstQ = firstQs[Math.floor(Math.random() * firstQs.length)];
    
    setCurrentQuestion(firstQ);
    setQuestionsAsked([firstQ]);
    setQuestionNumber(1);
    setDisplayText(firstQ);
    setPhase('interview');
    setStartTime(Date.now());
    setTotalWords(0);
    setTotalFillers(0);
    setScores([]);
    speak(firstQ);
  };

  const startRec = () => {
    if (!recRef.current || orbState !== 'idle') return;
    setTranscript(''); setInterim(''); setMicError(null);
    try { 
      recRef.current.start(); 
      setOrbState('listening'); 
      startAudio(); 
    } catch { 
      setTimeout(() => { 
        try { recRef.current.start(); setOrbState('listening'); startAudio(); } catch {} 
      }, 100); 
    }
  };

  const stopRec = async () => {
    try { recRef.current?.stop(); } catch {}
    stopAudio();
    
    const userText = (transcript + interim).trim();
    if (userText.length < 3) { setOrbState('idle'); return; }
    
    setOrbState('processing');
    
    const words = userText.split(/\s+/).filter(w => w.length > 0).length;
    setTotalWords(p => p + words);
    setTotalFillers(p => p + countFillers(userText));
    
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAnswer: userText,
          questionAsked: currentQuestion,
          questionsAlreadyAsked: questionsAsked,
          mode,
          questionNumber
        })
      });
      
      const data = await res.json();
      
      if (data.success) {
        setScores(p => [...p, data.score || 60]);
        
        if (data.isEnding) {
          const endText = `${data.feedback} ${data.nextQuestion}`;
          setDisplayText(endText);
          await speak(endText);
          setTimeout(() => setPhase('results'), 1000);
        } else {
          // Afficher feedback puis question
          const fullResponse = `${data.feedback} ${data.nextQuestion}`;
          setDisplayText(fullResponse);
          setCurrentQuestion(data.nextQuestion);
          setQuestionsAsked(prev => [...prev, data.nextQuestion]);
          setQuestionNumber(prev => prev + 1);
          await speak(fullResponse);
        }
      } else {
        throw new Error('API failed');
      }
    } catch (err) {
      setDisplayText("Good point. Let's move on - tell me about a challenge you faced.");
      setOrbState('idle');
    }
  };

  const restart = () => { 
    setPhase('select'); 
    setMode(null); 
    setQuestionsAsked([]);
    setQuestionNumber(0);
    setCurrentQuestion('');
    setDisplayText('');
    setOrbState('idle'); 
  };

  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a,b)=>a+b,0)/scores.length) : 0;
  const wpm = elapsed > 10 ? Math.round((totalWords/elapsed)*60) : 0;

  const Orb = () => {
    const colors: any = {
      idle: { m: 'rgba(255,255,255,0.6)', g: 'rgba(255,255,255,0.15)' },
      listening: { m: 'rgba(239,68,68,0.9)', g: 'rgba(239,68,68,0.3)' },
      processing: { m: 'rgba(255,215,0,0.9)', g: 'rgba(255,215,0,0.3)' },
      speaking: { m: 'rgba(59,130,246,0.9)', g: 'rgba(59,130,246,0.3)' }
    };
    const c = colors[orbState] || colors.idle;
    
    return (
      <div className="relative flex items-center justify-center" style={{ width: 140, height: 140 }}>
        {[1,2,3].map(r => (
          <div key={r} className="absolute rounded-full" style={{ width: 35+r*25, height: 35+r*25, border: `1px solid ${c.g}`, opacity: orbState !== 'idle' ? 0.4/r : 0.1/r }} />
        ))}
        {orbState === 'listening' && (
          <div className="absolute flex gap-0.5">
            {[...Array(5)].map((_,i) => <div key={i} className="w-1 rounded bg-red-500" style={{ height: 6 + audioLevel*25 + Math.random()*8 }} />)}
          </div>
        )}
        {orbState === 'speaking' && (
          <div className="absolute flex gap-0.5">
            {[...Array(5)].map((_,i) => <div key={i} className="w-1 rounded bg-blue-500" style={{ height: 8 + Math.sin(Date.now()/150+i)*12 }} />)}
          </div>
        )}
        {orbState === 'processing' && (
          <div className="absolute w-10 h-10 rounded-full border-2 border-transparent border-t-yellow-500 animate-spin" />
        )}
        <div className="rounded-full" style={{ width: 50, height: 50, background: `radial-gradient(circle at 30% 30%, ${c.m}, rgba(0,0,0,0.9))`, boxShadow: `0 0 25px ${c.g}` }} />
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <div className="px-5 py-3 flex justify-between items-center border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: phase === 'interview' ? '#22c55e' : '#444' }} />
          <span className="text-xs font-mono text-gray-500">
            {phase === 'interview' ? `Q${questionNumber} • ${Math.floor(elapsed/60)}:${String(elapsed%60).padStart(2,'0')}` : phase.toUpperCase()}
          </span>
        </div>
        <button onClick={onExit} className="text-xs px-3 py-1.5 rounded-full border border-white/10 text-gray-500">Exit</button>
      </div>

      {phase === 'select' && (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md mx-auto">
            <h2 className="text-xl font-light text-white text-center mb-6">Interview Mode</h2>
            <div className="grid grid-cols-2 gap-3 mb-5">
              {[
                { id: 'technical', name: 'Technical', icon: <Brain size={18}/>, color: '#3b82f6' },
                { id: 'behavioral', name: 'Behavioral', icon: <Target size={18}/>, color: '#22c55e' },
                { id: 'stress', name: 'Stress', icon: <Zap size={18}/>, color: '#ef4444' },
                { id: 'case-study', name: 'Case', icon: <BarChart3 size={18}/>, color: '#a855f7' },
              ].map(m => (
                <button key={m.id} onClick={() => setMode(m.id as InterviewMode)} className="p-4 rounded-xl text-left" style={{ background: mode === m.id ? `${m.color}20` : 'rgba(255,255,255,0.02)', border: mode === m.id ? `2px solid ${m.color}` : '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded flex items-center justify-center" style={{ background: `${m.color}30`, color: m.color }}>{m.icon}</div>
                    <span style={{ color: mode === m.id ? m.color : '#aaa' }}>{m.name}</span>
                  </div>
                </button>
              ))}
            </div>
            <button onClick={startInterview} disabled={!mode} className="w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 bg-white text-black disabled:opacity-40">
              <Play size={16}/> Start
            </button>
          </div>
        </div>
      )}

      {phase === 'interview' && (
        <div className="flex-1 flex">
          <div className="w-36 p-4 border-r border-white/5 space-y-2">
            <div className="text-[10px] text-gray-600 mb-2">METRICS</div>
            <div className="p-2 rounded bg-white/5">
              <div className="text-[10px] text-gray-500">Score</div>
              <div className="text-lg font-light" style={{ color: avgScore >= 70 ? '#22c55e' : '#fff' }}>{avgScore || '--'}%</div>
            </div>
            <div className="p-2 rounded bg-white/5">
              <div className="text-[10px] text-gray-500">Words</div>
              <div className="text-base font-mono text-white">{totalWords}</div>
            </div>
            <div className="p-2 rounded" style={{ background: totalFillers > 5 ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.03)' }}>
              <div className="text-[10px] text-gray-500">Fillers</div>
              <div className="text-base font-mono" style={{ color: totalFillers > 5 ? '#ef4444' : '#22c55e' }}>{totalFillers}</div>
            </div>
            <div className="p-2 rounded bg-white/5">
              <div className="text-[10px] text-gray-500">WPM</div>
              <div className="text-base font-mono text-white">{wpm || '--'}</div>
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center px-6 relative">
            <div className="absolute top-6 max-w-lg text-center px-4">
              <p className="text-[10px] font-mono text-gray-600 mb-2">{mode?.toUpperCase()}</p>
              <p className="text-base font-light text-white leading-relaxed">{displayText}</p>
            </div>

            <Orb />

            {micError && <div className="absolute bottom-32 px-3 py-1.5 rounded bg-red-500/10 text-red-400 text-xs">{micError}</div>}

            {(transcript || interim) && orbState === 'listening' && (
              <div className="absolute bottom-28 max-w-sm p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                <p className="text-[10px] text-red-500 mb-1">● REC</p>
                <p className="text-sm text-white">{transcript}<span className="text-gray-500">{interim}</span></p>
              </div>
            )}

            <div className="absolute bottom-6 flex flex-col items-center gap-2">
              {orbState === 'idle' && (
                <button onClick={startRec} className="w-12 h-12 rounded-full flex items-center justify-center bg-white/5 border-2 border-white/20 hover:scale-110 transition">
                  <Mic size={18} className="text-white/70" />
                </button>
              )}
              {orbState === 'listening' && (
                <button onClick={stopRec} className="w-12 h-12 rounded-full flex items-center justify-center bg-red-500/15 border-2 border-red-500">
                  <Square size={14} fill="#ef4444" className="text-red-500" />
                </button>
              )}
              {(orbState === 'processing' || orbState === 'speaking') && (
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-white/5 border border-white/10">
                  <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white/60 animate-spin" />
                </div>
              )}
              <span className="text-[10px] font-mono text-gray-500">
                {orbState === 'idle' ? 'TAP TO SPEAK' : orbState === 'listening' ? 'TAP TO SEND' : orbState === 'processing' ? 'THINKING...' : 'SPEAKING'}
              </span>
            </div>
          </div>
        </div>
      )}

      {phase === 'results' && (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-xs mx-auto text-center">
            <h2 className="text-xl font-light text-white mb-5">Done!</h2>
            <div className="p-5 rounded-2xl mb-5" style={{ background: avgScore >= 70 ? 'rgba(34,197,94,0.1)' : 'rgba(255,215,0,0.1)' }}>
              <div className="text-4xl font-light mb-1" style={{ color: avgScore >= 70 ? '#22c55e' : '#eab308' }}>{avgScore}%</div>
              <div className="text-gray-400 text-sm">Score</div>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-5">
              <div className="p-2 rounded bg-white/5"><div className="text-base font-mono text-white">{totalWords}</div><div className="text-[10px] text-gray-500">Words</div></div>
              <div className="p-2 rounded bg-white/5"><div className="text-base font-mono" style={{ color: totalFillers <= 5 ? '#22c55e' : '#ef4444' }}>{totalFillers}</div><div className="text-[10px] text-gray-500">Fillers</div></div>
              <div className="p-2 rounded bg-white/5"><div className="text-base font-mono text-white">{Math.floor(elapsed/60)}m</div><div className="text-[10px] text-gray-500">Time</div></div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={onExit} className="py-2.5 rounded-lg border border-white/15 text-gray-400 text-sm">Exit</button>
              <button onClick={restart} className="py-2.5 rounded-lg bg-white text-black text-sm flex items-center justify-center gap-1"><RefreshCw size={12}/> Again</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

ArenaView.displayName = 'ArenaView';
export default ArenaView;
