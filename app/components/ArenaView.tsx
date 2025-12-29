'use client';

import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import { Mic, Square, Brain, Zap, Target, Play, RefreshCw, BarChart3 } from 'lucide-react';
import { InterviewMode, FILLER_WORDS } from '../data/arena';

interface ArenaProps { onExit: () => void; }

const Orb = memo(({ state, level }: { state: string, level: number }) => {
  const colors: any = {
    idle: { m: 'rgba(255,255,255,0.6)', g: 'rgba(255,255,255,0.15)' },
    listening: { m: 'rgba(239,68,68,0.9)', g: 'rgba(239,68,68,0.3)' },
    processing: { m: 'rgba(255,215,0,0.9)', g: 'rgba(255,215,0,0.3)' },
    speaking: { m: 'rgba(59,130,246,0.9)', g: 'rgba(59,130,246,0.3)' }
  };
  const c = colors[state] || colors.idle;
  
  return (
    <div className="relative flex items-center justify-center" style={{ width: 160, height: 160 }}>
      {[1,2,3].map(r => (
        <div key={r} className="absolute rounded-full" style={{ width: 40+r*30, height: 40+r*30, border: `1px solid ${c.g}`, opacity: state !== 'idle' ? 0.4/r : 0.1/r }} />
      ))}
      {state === 'listening' && (
        <div className="absolute flex gap-0.5">
          {[...Array(6)].map((_,i) => <div key={i} className="w-1 rounded bg-red-500" style={{ height: 8 + level*30 + Math.random()*10 }} />)}
        </div>
      )}
      {state === 'speaking' && (
        <div className="absolute flex gap-0.5">
          {[...Array(6)].map((_,i) => <div key={i} className="w-1 rounded bg-blue-500" style={{ height: 10 + Math.sin(Date.now()/150+i)*15 }} />)}
        </div>
      )}
      {state === 'processing' && <div className="absolute w-12 h-12 rounded-full border-2 border-transparent border-t-yellow-500 animate-spin" />}
      <div className="rounded-full" style={{ width: 60, height: 60, background: `radial-gradient(circle at 30% 30%, ${c.m}, rgba(0,0,0,0.9))`, boxShadow: `0 0 30px ${c.g}` }} />
    </div>
  );
});
Orb.displayName = 'Orb';

export const ArenaView = memo(({ onExit }: ArenaProps) => {
  const [phase, setPhase] = useState<'select'|'interview'|'results'>('select');
  const [mode, setMode] = useState<InterviewMode|null>(null);
  
  // Conversation in OpenAI format: [{role: 'assistant', content: '...'}, {role: 'user', content: '...'}]
  const [messages, setMessages] = useState<{role: string, content: string}[]>([]);
  const [currentAI, setCurrentAI] = useState('');
  
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

  // Timer
  useEffect(() => {
    if (phase !== 'interview' || !startTime) return;
    const i = setInterval(() => setElapsed(Math.floor((Date.now()-startTime)/1000)), 1000);
    return () => clearInterval(i);
  }, [phase, startTime]);

  // Speech recognition setup
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
      if (e.error === 'not-allowed') setMicError('Allow mic access');
      setOrbState('idle');
    };
    
    recRef.current = r;
    return () => { try { r.stop(); } catch {} };
  }, []);

  const countFillers = (t: string) => {
    let c = 0;
    FILLER_WORDS.forEach(f => { const m = t.toLowerCase().match(new RegExp(`\\b${f}\\b`,'g')); if (m) c += m.length; });
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
      const upd = () => { a.getByteFrequencyData(d); setAudioLevel(d.reduce((x,y)=>x+y,0)/d.length/255); animRef.current = requestAnimationFrame(upd); };
      upd();
    } catch { setMicError('Mic error'); }
  };

  const stopAudio = () => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    if (audioCtxRef.current) audioCtxRef.current.close();
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    audioCtxRef.current = null; streamRef.current = null; setAudioLevel(0);
  };

  const speak = async (text: string) => {
    setOrbState('speaking');
    try {
      const res = await fetch('/api/voice', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) });
      if (res.ok) {
        const audio = new Audio(URL.createObjectURL(await res.blob()));
        audio.onended = () => setOrbState('idle');
        await audio.play();
        return;
      }
    } catch {}
    if ('speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.95;
      u.onend = () => setOrbState('idle');
      speechSynthesis.speak(u);
    } else setOrbState('idle');
  };

  const startInterview = () => {
    if (!mode) return;
    
    const firstQuestions: Record<string, string> = {
      technical: "Let's get started. Can you walk me through how you would price a European call option?",
      behavioral: "Thanks for coming in. Tell me a bit about yourself and why you're interested in this role.",
      stress: "Alright, let's see how you think on your feet. What's 18 times 17?",
      'case-study': "Here's a scenario: A stock trades at $50. You think it'll move 20% but aren't sure which direction. How do you trade this?"
    };
    
    const firstQ = firstQuestions[mode];
    setMessages([{ role: 'assistant', content: firstQ }]);
    setCurrentAI(firstQ);
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
    try { recRef.current.start(); setOrbState('listening'); startAudio(); }
    catch { setTimeout(() => { try { recRef.current.start(); setOrbState('listening'); startAudio(); } catch {} }, 100); }
  };

  const stopRec = async () => {
    try { recRef.current?.stop(); } catch {}
    stopAudio();
    
    const userText = (transcript + interim).trim();
    if (userText.length < 3) { setOrbState('idle'); setCurrentAI("I didn't catch that. Try again."); return; }
    
    setOrbState('processing');
    
    // Update metrics
    const words = userText.split(/\s+/).filter(w => w.length > 0).length;
    setTotalWords(p => p + words);
    setTotalFillers(p => p + countFillers(userText));
    
    // Add user message to conversation
    const newMessages = [...messages, { role: 'user', content: userText }];
    setMessages(newMessages);
    
    // Call API with FULL conversation history
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: userText,
          messages: messages, // Send all previous messages
          mode
        })
      });
      
      const data = await res.json();
      
      if (data.success) {
        const aiReply = data.message;
        setScores(p => [...p, data.score || 60]);
        
        // Add AI response to conversation
        setMessages([...newMessages, { role: 'assistant', content: aiReply }]);
        setCurrentAI(aiReply);
        
        if (data.isEnding) {
          speak(aiReply);
          setTimeout(() => setPhase('results'), 4000);
        } else {
          speak(aiReply);
        }
      } else {
        throw new Error('API failed');
      }
    } catch (err) {
      const fallback = "That's interesting. Tell me more about your experience.";
      setMessages([...newMessages, { role: 'assistant', content: fallback }]);
      setCurrentAI(fallback);
      speak(fallback);
    }
  };

  const restart = () => { setPhase('select'); setMode(null); setMessages([]); setCurrentAI(''); setOrbState('idle'); };

  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a,b)=>a+b,0)/scores.length) : 0;
  const wpm = elapsed > 10 ? Math.round((totalWords/elapsed)*60) : 0;

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <div className="px-6 py-4 flex justify-between items-center border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full" style={{ background: phase === 'interview' ? '#22c55e' : '#555' }} />
          <span className="text-xs font-mono text-gray-500">
            {phase === 'interview' ? `${Math.floor(elapsed/60)}:${String(elapsed%60).padStart(2,'0')}` : phase.toUpperCase()}
          </span>
        </div>
        <button onClick={onExit} className="text-xs px-4 py-2 rounded-full border border-white/10 text-gray-500 hover:bg-white/5">Exit</button>
      </div>

      {phase === 'select' && (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-lg mx-auto">
            <h2 className="text-2xl font-light text-white text-center mb-8">Choose Interview Type</h2>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { id: 'technical', name: 'Technical', icon: <Brain size={20}/>, color: '#3b82f6' },
                { id: 'behavioral', name: 'Behavioral', icon: <Target size={20}/>, color: '#22c55e' },
                { id: 'stress', name: 'Stress Test', icon: <Zap size={20}/>, color: '#ef4444' },
                { id: 'case-study', name: 'Case Study', icon: <BarChart3 size={20}/>, color: '#a855f7' },
              ].map(m => (
                <button key={m.id} onClick={() => setMode(m.id as InterviewMode)} className="p-4 rounded-xl text-left transition-all" style={{ background: mode === m.id ? `${m.color}20` : 'rgba(255,255,255,0.02)', border: mode === m.id ? `2px solid ${m.color}` : '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${m.color}30`, color: m.color }}>{m.icon}</div>
                    <span style={{ color: mode === m.id ? m.color : '#ccc' }}>{m.name}</span>
                  </div>
                </button>
              ))}
            </div>
            <button onClick={startInterview} disabled={!mode} className="w-full py-4 rounded-xl font-medium flex items-center justify-center gap-2 bg-white text-black disabled:opacity-40">
              <Play size={18}/> Start
            </button>
          </div>
        </div>
      )}

      {phase === 'interview' && (
        <div className="flex-1 flex">
          <div className="w-40 p-4 border-r border-white/5 space-y-3">
            <div className="text-xs text-gray-600 mb-2">METRICS</div>
            <div className="p-3 rounded-lg bg-white/5">
              <div className="text-xs text-gray-500">Score</div>
              <div className="text-xl font-light" style={{ color: avgScore >= 70 ? '#22c55e' : '#fff' }}>{avgScore || '--'}%</div>
            </div>
            <div className="p-3 rounded-lg bg-white/5">
              <div className="text-xs text-gray-500">Words</div>
              <div className="text-lg font-mono text-white">{totalWords}</div>
            </div>
            <div className="p-3 rounded-lg" style={{ background: totalFillers > 5 ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.03)' }}>
              <div className="text-xs text-gray-500">Fillers</div>
              <div className="text-lg font-mono" style={{ color: totalFillers > 5 ? '#ef4444' : '#22c55e' }}>{totalFillers}</div>
            </div>
            <div className="p-3 rounded-lg bg-white/5">
              <div className="text-xs text-gray-500">WPM</div>
              <div className="text-lg font-mono text-white">{wpm || '--'}</div>
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center px-8 relative">
            <div className="absolute top-6 max-w-lg text-center">
              <p className="text-xs font-mono text-gray-600 mb-2">{mode?.toUpperCase()}</p>
              <p className="text-lg font-light text-white leading-relaxed">{currentAI}</p>
            </div>

            <Orb state={orbState} level={audioLevel} />

            {micError && <div className="absolute bottom-36 px-4 py-2 rounded-lg bg-red-500/10 text-red-400 text-sm">{micError}</div>}

            {(transcript || interim) && orbState === 'listening' && (
              <div className="absolute bottom-28 max-w-md p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                <p className="text-xs text-red-500 mb-1">● REC</p>
                <p className="text-sm text-white">{transcript}<span className="text-gray-500">{interim}</span></p>
              </div>
            )}

            <div className="absolute bottom-8 flex flex-col items-center gap-2">
              {orbState === 'idle' && (
                <button onClick={startRec} className="w-14 h-14 rounded-full flex items-center justify-center bg-white/5 border-2 border-white/20 hover:scale-110 transition-transform">
                  <Mic size={20} className="text-white/70" />
                </button>
              )}
              {orbState === 'listening' && (
                <button onClick={stopRec} className="w-14 h-14 rounded-full flex items-center justify-center bg-red-500/15 border-2 border-red-500">
                  <Square size={16} fill="#ef4444" className="text-red-500" />
                </button>
              )}
              {(orbState === 'processing' || orbState === 'speaking') && (
                <div className="w-14 h-14 rounded-full flex items-center justify-center bg-white/5 border border-white/10">
                  <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white/60 animate-spin" />
                </div>
              )}
              <span className="text-xs font-mono text-gray-500">
                {orbState === 'idle' ? 'TAP TO SPEAK' : orbState === 'listening' ? 'TAP TO SEND' : orbState === 'processing' ? 'THINKING...' : 'SPEAKING'}
              </span>
            </div>
          </div>
        </div>
      )}

      {phase === 'results' && (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-sm mx-auto text-center">
            <h2 className="text-2xl font-light text-white mb-6">Interview Complete</h2>
            <div className="p-6 rounded-2xl mb-6" style={{ background: avgScore >= 70 ? 'rgba(34,197,94,0.1)' : 'rgba(255,215,0,0.1)', border: `1px solid ${avgScore >= 70 ? 'rgba(34,197,94,0.3)' : 'rgba(255,215,0,0.3)'}` }}>
              <div className="text-5xl font-light mb-1" style={{ color: avgScore >= 70 ? '#22c55e' : '#eab308' }}>{avgScore}%</div>
              <div className="text-gray-400">Overall Score</div>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-6">
              <div className="p-3 rounded-lg bg-white/5"><div className="text-lg font-mono text-white">{totalWords}</div><div className="text-xs text-gray-500">Words</div></div>
              <div className="p-3 rounded-lg bg-white/5"><div className="text-lg font-mono" style={{ color: totalFillers <= 5 ? '#22c55e' : '#ef4444' }}>{totalFillers}</div><div className="text-xs text-gray-500">Fillers</div></div>
              <div className="p-3 rounded-lg bg-white/5"><div className="text-lg font-mono text-white">{Math.floor(elapsed/60)}m</div><div className="text-xs text-gray-500">Time</div></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={onExit} className="py-3 rounded-lg border border-white/15 text-gray-400">Exit</button>
              <button onClick={restart} className="py-3 rounded-lg bg-white text-black flex items-center justify-center gap-2"><RefreshCw size={14}/> Again</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

ArenaView.displayName = 'ArenaView';
export default ArenaView;
