'use client';

import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { Mic, Square, Clock, Brain, Zap, Target, Play, RefreshCw, AlertCircle, BarChart3 } from 'lucide-react';
import { InterviewMode, CareerTrack, Difficulty, getQuestionsForSession, FILLER_WORDS } from '../data/arena';

interface ArenaProps {
  onExit: () => void;
}

// ═══════════════════════════════════════════════════════════════════════════
// ORB COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

const Orb = memo(({ state, audioLevel }: { state: string, audioLevel: number }) => {
  const colors: any = {
    idle: { main: 'rgba(255,255,255,0.6)', glow: 'rgba(255,255,255,0.15)' },
    listening: { main: 'rgba(239,68,68,0.9)', glow: 'rgba(239,68,68,0.3)' },
    processing: { main: 'rgba(255,215,0,0.9)', glow: 'rgba(255,215,0,0.3)' },
    speaking: { main: 'rgba(59,130,246,0.9)', glow: 'rgba(59,130,246,0.3)' }
  };
  const c = colors[state] || colors.idle;
  const scale = state === 'listening' ? 1 + audioLevel * 0.3 : 1;
  
  return (
    <div className="relative flex items-center justify-center" style={{ width: 180, height: 180 }}>
      {[1, 2, 3].map(ring => (
        <div key={ring} className="absolute rounded-full" style={{
          width: 50 + ring * 35, height: 50 + ring * 35,
          border: `1px solid ${c.glow}`,
          opacity: state !== 'idle' ? 0.4 / ring : 0.1 / ring,
          animation: state !== 'idle' ? `pulse-ring ${1.5 + ring * 0.3}s ease-out infinite` : 'none'
        }} />
      ))}
      {state === 'listening' && (
        <div className="absolute flex items-center gap-0.5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="w-1 rounded-full bg-red-500" style={{ height: 8 + audioLevel * 35 + Math.random() * 12 }} />
          ))}
        </div>
      )}
      {state === 'speaking' && (
        <div className="absolute flex items-center gap-0.5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="w-1 rounded-full bg-blue-500" style={{ height: 12 + Math.sin(Date.now() / 150 + i * 0.5) * 18 }} />
          ))}
        </div>
      )}
      {state === 'processing' && (
        <div className="absolute w-14 h-14 rounded-full border-2 border-transparent border-t-yellow-500 animate-spin" />
      )}
      <div className="rounded-full transition-all duration-200" style={{
        width: 70, height: 70, transform: `scale(${scale})`,
        background: `radial-gradient(circle at 30% 30%, ${c.main}, rgba(0,0,0,0.9))`,
        boxShadow: `0 0 40px ${c.glow}`
      }} />
      <div className="absolute -bottom-7 px-3 py-1 rounded-full text-xs font-mono" style={{ background: `${c.main}20`, border: `1px solid ${c.main}50`, color: c.main }}>
        {state === 'idle' ? 'READY' : state === 'listening' ? '● REC' : state === 'processing' ? 'THINKING...' : '🔊 SPEAKING'}
      </div>
    </div>
  );
});
Orb.displayName = 'Orb';

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const ArenaView = memo(({ onExit }: ArenaProps) => {
  const [phase, setPhase] = useState<'select' | 'interview' | 'results'>('select');
  const [mode, setMode] = useState<InterviewMode | null>(null);
  
  // Conversation state
  const [conversationHistory, setConversationHistory] = useState<{role: string, content: string}[]>([]);
  const [currentDisplay, setCurrentDisplay] = useState('');
  const [questionCount, setQuestionCount] = useState(0);
  
  // Recording state
  const [orbState, setOrbState] = useState('idle');
  const [audioLevel, setAudioLevel] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [micError, setMicError] = useState<string | null>(null);
  
  // Metrics
  const [totalWords, setTotalWords] = useState(0);
  const [totalFillers, setTotalFillers] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [responseCount, setResponseCount] = useState(0);
  const [sessionStart, setSessionStart] = useState(0);
  const [sessionTime, setSessionTime] = useState(0);
  
  // Refs
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);

  // Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (phase === 'interview' && sessionStart > 0) {
      interval = setInterval(() => setSessionTime(Math.floor((Date.now() - sessionStart) / 1000)), 1000);
    }
    return () => clearInterval(interval);
  }, [phase, sessionStart]);

  // Speech Recognition Setup
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { setMicError('Use Chrome for voice'); return; }
    
    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    
    recognition.onresult = (e: any) => {
      let interim = '', final = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += t + ' ';
        else interim = t;
      }
      if (final) setTranscript(prev => prev + final);
      setInterimTranscript(interim);
    };
    
    recognition.onerror = (e: any) => {
      if (e.error === 'not-allowed') setMicError('Allow microphone access');
      else if (e.error !== 'no-speech' && e.error !== 'aborted') setMicError(`Error: ${e.error}`);
      setOrbState('idle');
    };
    
    recognitionRef.current = recognition;
    return () => { try { recognition.stop(); } catch {} };
  }, []);

  // Count fillers
  const countFillers = (text: string): number => {
    let count = 0;
    FILLER_WORDS.forEach(f => {
      const matches = text.toLowerCase().match(new RegExp(`\\b${f}\\b`, 'g'));
      if (matches) count += matches.length;
    });
    return count;
  };

  // Start audio visualization
  const startAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      audioContextRef.current = new AudioContext();
      const analyser = audioContextRef.current.createAnalyser();
      audioContextRef.current.createMediaStreamSource(stream).connect(analyser);
      analyser.fftSize = 128;
      const data = new Uint8Array(analyser.frequencyBinCount);
      const update = () => {
        analyser.getByteFrequencyData(data);
        setAudioLevel(data.reduce((a, b) => a + b, 0) / data.length / 255);
        if (orbState === 'listening') animationRef.current = requestAnimationFrame(update);
      };
      update();
    } catch { setMicError('Microphone error'); }
  };

  const stopAudio = () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    if (audioContextRef.current) audioContextRef.current.close();
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    audioContextRef.current = null;
    streamRef.current = null;
    setAudioLevel(0);
  };

  // Start interview
  const startInterview = () => {
    if (!mode) return;
    setPhase('interview');
    setConversationHistory([]);
    setQuestionCount(0);
    setTotalWords(0);
    setTotalFillers(0);
    setTotalScore(0);
    setResponseCount(0);
    setSessionStart(Date.now());
    setSessionTime(0);
    
    // First question based on mode
    const firstQuestions: any = {
      technical: "Let's start. Walk me through how you would price a European call option. What model would you use and what are the key inputs?",
      behavioral: "Tell me about yourself. What's your background and why are you interested in this role?",
      stress: "Quick - what's 17 times 23? Go.",
      'case-study': "Here's a scenario: A stock is trading at $100, and you think it's going to move but you're not sure which direction. How would you structure a trade?"
    };
    
    const firstQ = firstQuestions[mode];
    setCurrentDisplay(firstQ);
    setConversationHistory([{ role: 'assistant', content: firstQ }]);
    setQuestionCount(1);
    speakText(firstQ);
  };

  // Start recording
  const startRecording = () => {
    if (!recognitionRef.current || orbState !== 'idle') return;
    setTranscript('');
    setInterimTranscript('');
    setMicError(null);
    try {
      recognitionRef.current.start();
      setOrbState('listening');
      startAudio();
    } catch (err: any) {
      if (err.message?.includes('already started')) {
        try { recognitionRef.current.stop(); } catch {}
        setTimeout(() => { try { recognitionRef.current.start(); setOrbState('listening'); startAudio(); } catch {} }, 100);
      }
    }
  };

  // Stop recording and get AI response
  const stopRecording = async () => {
    try { recognitionRef.current?.stop(); } catch {}
    stopAudio();
    
    const userText = (transcript + interimTranscript).trim();
    if (userText.length < 3) {
      setOrbState('idle');
      setCurrentDisplay("I didn't catch that. Please try again.");
      return;
    }
    
    setOrbState('processing');
    
    // Update metrics
    const words = userText.split(/\s+/).filter(w => w.length > 0).length;
    const fillers = countFillers(userText);
    setTotalWords(prev => prev + words);
    setTotalFillers(prev => prev + fillers);
    setResponseCount(prev => prev + 1);
    
    // Add user message to history
    const newHistory = [...conversationHistory, { role: 'user', content: userText }];
    setConversationHistory(newHistory);
    
    // Get AI response
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          conversationHistory: newHistory,
          mode,
          questionNumber: questionCount,
          totalQuestions: 5
        })
      });
      
      const data = await res.json();
      
      if (data.success) {
        const aiMessage = data.message;
        setTotalScore(prev => prev + (data.score || 50));
        
        // Add AI response to history
        setConversationHistory(prev => [...prev, { role: 'assistant', content: aiMessage }]);
        setCurrentDisplay(aiMessage);
        
        // Check if we should move to next question or end
        if (data.shouldMoveOn) {
          setQuestionCount(prev => prev + 1);
        }
        
        // End after ~5 questions worth of conversation (around 10-15 exchanges)
        if (questionCount >= 5 || newHistory.length >= 12) {
          speakText(aiMessage + " That's all the time we have. Good job.");
          setTimeout(() => setPhase('results'), 5000);
        } else {
          speakText(aiMessage);
        }
      } else {
        throw new Error('API error');
      }
    } catch (err) {
      console.error(err);
      const fallback = "Interesting point. Can you tell me more about your reasoning there?";
      setCurrentDisplay(fallback);
      setConversationHistory(prev => [...prev, { role: 'assistant', content: fallback }]);
      speakText(fallback);
    }
  };

  // Text to speech
  const speakText = async (text: string) => {
    setOrbState('speaking');
    try {
      const res = await fetch('/api/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      if (res.ok) {
        const blob = await res.blob();
        const audio = new Audio(URL.createObjectURL(blob));
        audio.onended = () => setOrbState('idle');
        audio.onerror = () => browserSpeak(text);
        await audio.play();
        return;
      }
    } catch {}
    browserSpeak(text);
  };

  const browserSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.95;
      u.onend = () => setOrbState('idle');
      window.speechSynthesis.speak(u);
    } else setOrbState('idle');
  };

  const restart = () => {
    setPhase('select');
    setMode(null);
    setConversationHistory([]);
    setCurrentDisplay('');
    setQuestionCount(0);
    setOrbState('idle');
  };

  const avgScore = responseCount > 0 ? Math.round(totalScore / responseCount) : 0;
  const wpm = sessionTime > 10 ? Math.round((totalWords / sessionTime) * 60) : 0;

  // ═══════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#000' }}>
      <style>{`
        @keyframes pulse-ring { 0% { transform: scale(1); opacity: 0.4; } 100% { transform: scale(1.3); opacity: 0; } }
      `}</style>
      
      {/* Header */}
      <div className="px-6 py-4 flex justify-between items-center" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full" style={{ background: phase === 'interview' ? 'rgba(34,197,94,0.8)' : 'rgba(255,255,255,0.3)' }} />
          <span className="text-xs font-mono" style={{ color: 'rgba(136,136,136,0.5)' }}>
            {phase === 'select' ? 'SELECT MODE' : phase === 'interview' ? `LIVE • ${Math.floor(sessionTime/60)}:${String(sessionTime%60).padStart(2,'0')}` : 'COMPLETE'}
          </span>
        </div>
        <button onClick={onExit} className="text-xs px-4 py-2 rounded-full hover:bg-white/5" style={{ border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}>Exit</button>
      </div>
      
      {/* MODE SELECT */}
      {phase === 'select' && (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-light mb-3" style={{ color: 'rgba(255,255,255,0.95)' }}>AI Interview</h2>
              <p className="text-sm" style={{ color: 'rgba(136,136,136,0.6)' }}>Select your interview type</p>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-8">
              {[
                { id: 'technical', name: 'Technical', icon: <Brain size={22} />, desc: 'Options, Greeks, Math', color: 'rgba(59,130,246,0.9)' },
                { id: 'behavioral', name: 'Behavioral', icon: <Target size={22} />, desc: 'STAR, Leadership', color: 'rgba(34,197,94,0.9)' },
                { id: 'stress', name: 'Stress Test', icon: <Zap size={22} />, desc: 'Rapid Fire', color: 'rgba(239,68,68,0.9)' },
                { id: 'case-study', name: 'Case Study', icon: <BarChart3 size={22} />, desc: 'Trade Ideas', color: 'rgba(168,85,247,0.9)' },
              ].map(m => (
                <button key={m.id} onClick={() => setMode(m.id as InterviewMode)} className="p-5 rounded-xl text-left transition-all hover:scale-[1.02]" style={{ background: mode === m.id ? `${m.color}15` : 'rgba(255,255,255,0.02)', border: mode === m.id ? `2px solid ${m.color}` : '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${m.color}20`, color: m.color }}>{m.icon}</div>
                    <div>
                      <div className="font-medium" style={{ color: mode === m.id ? m.color : 'rgba(255,255,255,0.9)' }}>{m.name}</div>
                      <div className="text-xs" style={{ color: 'rgba(136,136,136,0.5)' }}>{m.desc}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <button onClick={startInterview} disabled={!mode} className="w-full py-4 rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-40" style={{ background: 'rgba(255,255,255,0.95)', color: '#000' }}>
              <Play size={18} /> Start Interview
            </button>
          </div>
        </div>
      )}
      
      {/* INTERVIEW */}
      {phase === 'interview' && (
        <div className="flex-1 flex">
          {/* Sidebar */}
          <div className="w-44 p-5 flex flex-col gap-4" style={{ borderRight: '1px solid rgba(255,255,255,0.04)' }}>
            <div className="text-xs font-mono mb-2" style={{ color: 'rgba(136,136,136,0.4)' }}>LIVE METRICS</div>
            <div className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div className="text-xs" style={{ color: 'rgba(136,136,136,0.5)' }}>Score</div>
              <div className="text-2xl font-light" style={{ color: avgScore >= 70 ? 'rgba(34,197,94,0.9)' : 'rgba(255,255,255,0.9)' }}>{avgScore || '--'}%</div>
            </div>
            <div className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div className="text-xs" style={{ color: 'rgba(136,136,136,0.5)' }}>Words</div>
              <div className="text-xl font-mono" style={{ color: 'rgba(255,255,255,0.9)' }}>{totalWords}</div>
            </div>
            <div className="p-3 rounded-lg" style={{ background: totalFillers > 5 ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.02)' }}>
              <div className="text-xs" style={{ color: 'rgba(136,136,136,0.5)' }}>Fillers</div>
              <div className="text-xl font-mono" style={{ color: totalFillers > 5 ? 'rgba(239,68,68,0.9)' : 'rgba(34,197,94,0.9)' }}>{totalFillers}</div>
            </div>
            <div className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div className="text-xs" style={{ color: 'rgba(136,136,136,0.5)' }}>WPM</div>
              <div className="text-xl font-mono" style={{ color: wpm > 180 ? 'rgba(239,68,68,0.9)' : wpm < 100 && wpm > 0 ? 'rgba(255,215,0,0.9)' : 'rgba(34,197,94,0.9)' }}>{wpm || '--'}</div>
            </div>
          </div>
          
          {/* Main */}
          <div className="flex-1 flex flex-col items-center justify-center px-8 relative">
            {/* AI Response */}
            <div className="absolute top-8 max-w-xl text-center">
              <p className="text-xs font-mono mb-3" style={{ color: 'rgba(136,136,136,0.4)' }}>{mode?.toUpperCase()} INTERVIEW</p>
              <p className="text-lg font-light leading-relaxed" style={{ color: 'rgba(255,255,255,0.9)' }}>{currentDisplay}</p>
            </div>
            
            <Orb state={orbState} audioLevel={audioLevel} />
            
            {micError && (
              <div className="absolute bottom-40 px-4 py-2 rounded-lg text-sm" style={{ background: 'rgba(239,68,68,0.1)', color: 'rgba(239,68,68,0.9)' }}>{micError}</div>
            )}
            
            {(transcript || interimTranscript) && orbState === 'listening' && (
              <div className="absolute bottom-32 max-w-md text-center p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p className="text-xs font-mono mb-2 text-red-500">● REC</p>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>{transcript}<span style={{ color: 'rgba(255,255,255,0.4)' }}>{interimTranscript}</span></p>
              </div>
            )}
            
            <div className="absolute bottom-8 flex flex-col items-center gap-3">
              {orbState === 'idle' && (
                <button onClick={startRecording} className="w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-110" style={{ background: 'rgba(255,255,255,0.05)', border: '2px solid rgba(255,255,255,0.2)' }}>
                  <Mic size={20} style={{ color: 'rgba(255,255,255,0.7)' }} />
                </button>
              )}
              {orbState === 'listening' && (
                <button onClick={stopRecording} className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.15)', border: '3px solid rgba(239,68,68,0.8)' }}>
                  <Square size={16} fill="rgba(239,68,68,0.9)" style={{ color: 'rgba(239,68,68,0.9)' }} />
                </button>
              )}
              {(orbState === 'processing' || orbState === 'speaking') && (
                <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.02)', border: '2px solid rgba(255,255,255,0.1)' }}>
                  <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white/60 animate-spin" />
                </div>
              )}
              <span className="text-xs font-mono" style={{ color: orbState === 'listening' ? 'rgba(239,68,68,0.8)' : 'rgba(136,136,136,0.4)' }}>
                {orbState === 'idle' ? 'TAP TO RESPOND' : orbState === 'listening' ? 'TAP TO SEND' : orbState === 'processing' ? 'THINKING...' : 'AI SPEAKING'}
              </span>
            </div>
          </div>
        </div>
      )}
      
      {/* RESULTS */}
      {phase === 'results' && (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-md mx-auto text-center">
            <h2 className="text-2xl font-light mb-6" style={{ color: 'rgba(255,255,255,0.95)' }}>Interview Complete</h2>
            <div className="p-6 rounded-2xl mb-6" style={{ background: avgScore >= 70 ? 'rgba(34,197,94,0.1)' : 'rgba(255,215,0,0.1)', border: `1px solid ${avgScore >= 70 ? 'rgba(34,197,94,0.3)' : 'rgba(255,215,0,0.3)'}` }}>
              <div className="text-5xl font-light mb-2" style={{ color: avgScore >= 70 ? 'rgba(34,197,94,0.9)' : 'rgba(255,215,0,0.9)' }}>{avgScore}%</div>
              <div style={{ color: 'rgba(255,255,255,0.6)' }}>Overall Score</div>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <div className="text-xl font-mono" style={{ color: 'rgba(255,255,255,0.9)' }}>{totalWords}</div>
                <div className="text-xs" style={{ color: 'rgba(136,136,136,0.5)' }}>Words</div>
              </div>
              <div className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <div className="text-xl font-mono" style={{ color: totalFillers <= 5 ? 'rgba(34,197,94,0.9)' : 'rgba(239,68,68,0.9)' }}>{totalFillers}</div>
                <div className="text-xs" style={{ color: 'rgba(136,136,136,0.5)' }}>Fillers</div>
              </div>
              <div className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <div className="text-xl font-mono" style={{ color: 'rgba(255,255,255,0.9)' }}>{Math.floor(sessionTime/60)}m</div>
                <div className="text-xs" style={{ color: 'rgba(136,136,136,0.5)' }}>Time</div>
              </div>
            </div>
            {(totalFillers > 5 || avgScore < 70) && (
              <div className="p-4 rounded-lg mb-6 text-left" style={{ background: 'rgba(255,215,0,0.05)' }}>
                <div className="text-xs font-mono mb-2" style={{ color: 'rgba(255,215,0,0.7)' }}>TIPS</div>
                {totalFillers > 5 && <p className="text-sm mb-1" style={{ color: 'rgba(255,255,255,0.7)' }}>• Reduce filler words (um, like, basically)</p>}
                {avgScore < 70 && <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>• Practice more structured answers</p>}
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <button onClick={onExit} className="py-3 rounded-lg text-sm" style={{ border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)' }}>Exit</button>
              <button onClick={restart} className="py-3 rounded-lg text-sm flex items-center justify-center gap-2" style={{ background: 'rgba(255,255,255,0.95)', color: '#000' }}><RefreshCw size={14} /> Again</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

ArenaView.displayName = 'ArenaView';
export default ArenaView;
