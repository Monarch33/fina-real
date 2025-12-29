'use client';

import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { Mic, Square, Volume2, Clock, Brain, Zap, Target, ChevronRight, X, Play, RefreshCw, TrendingUp, AlertCircle, CheckCircle2, BarChart3 } from 'lucide-react';
import { 
  InterviewMode, CareerTrack, Difficulty, InterviewQuestion,
  SessionMetrics, getQuestionsForSession, analyzeTranscript, FILLER_WORDS
} from '../data/arena';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface ArenaProps {
  onExit: () => void;
  userTrack?: CareerTrack;
  userLevel?: Difficulty;
}

interface ResponseData {
  question: string;
  transcript: string;
  duration: number;
  score: number;
  aiResponse: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// ORB COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

const Orb = memo(({ state, audioLevel }: { state: 'idle' | 'listening' | 'processing' | 'speaking', audioLevel: number }) => {
  const colors = {
    idle: { main: 'rgba(255,255,255,0.6)', glow: 'rgba(255,255,255,0.15)' },
    listening: { main: 'rgba(239,68,68,0.9)', glow: 'rgba(239,68,68,0.3)' },
    processing: { main: 'rgba(255,215,0,0.9)', glow: 'rgba(255,215,0,0.3)' },
    speaking: { main: 'rgba(59,130,246,0.9)', glow: 'rgba(59,130,246,0.3)' }
  };
  const c = colors[state];
  const scale = state === 'listening' ? 1 + audioLevel * 0.3 : 1;
  
  return (
    <div className="relative flex items-center justify-center" style={{ width: 240, height: 240 }}>
      {[1, 2, 3].map(ring => (
        <div 
          key={ring} 
          className="absolute rounded-full transition-all duration-300" 
          style={{
            width: 80 + ring * 50,
            height: 80 + ring * 50,
            border: `1px solid ${c.glow}`,
            opacity: state !== 'idle' ? 0.5 / ring : 0.15 / ring,
            animation: state !== 'idle' ? `pulse-ring ${1.5 + ring * 0.3}s ease-out infinite` : 'none'
          }} 
        />
      ))}
      
      {state === 'listening' && (
        <div className="absolute flex items-center gap-1">
          {[...Array(12)].map((_, i) => (
            <div 
              key={i} 
              className="w-1 rounded-full transition-all duration-75"
              style={{ height: 15 + Math.random() * audioLevel * 50, background: c.main, opacity: 0.8 }} 
            />
          ))}
        </div>
      )}
      
      {state === 'speaking' && (
        <div className="absolute flex items-center gap-1">
          {[...Array(10)].map((_, i) => (
            <div 
              key={i} 
              className="w-1.5 rounded-full"
              style={{ height: 20 + Math.sin(Date.now() / 100 + i) * 25, background: c.main, animation: `soundwave ${0.3 + i * 0.05}s ease-in-out infinite alternate` }} 
            />
          ))}
        </div>
      )}
      
      {state === 'processing' && (
        <div className="absolute w-20 h-20 rounded-full border-2 border-transparent" style={{ borderTopColor: c.main, animation: 'spin 0.8s linear infinite' }} />
      )}
      
      <div 
        className="relative rounded-full transition-all duration-200"
        style={{
          width: 100, height: 100,
          transform: `scale(${scale})`,
          background: `radial-gradient(circle at 30% 30%, ${c.main}, rgba(0,0,0,0.9))`,
          boxShadow: `0 0 60px ${c.glow}, 0 0 100px ${c.glow}`
        }}
      >
        <div className="absolute rounded-full" style={{ top: '15%', left: '20%', width: '25%', height: '25%', background: 'radial-gradient(circle, rgba(255,255,255,0.4), transparent)', filter: 'blur(3px)' }} />
      </div>
      
      <div 
        className="absolute -bottom-2 px-4 py-1.5 rounded-full text-xs font-mono tracking-wider"
        style={{ background: `${c.main}15`, border: `1px solid ${c.main}40`, color: c.main }}
      >
        {state === 'idle' && 'READY'}
        {state === 'listening' && '● REC'}
        {state === 'processing' && 'THINKING...'}
        {state === 'speaking' && 'SPEAKING'}
      </div>
    </div>
  );
});
Orb.displayName = 'Orb';

// ═══════════════════════════════════════════════════════════════════════════
// METRICS PANEL
// ═══════════════════════════════════════════════════════════════════════════

const MetricsPanel = memo(({ wordsSpoken, fillerCount, responseTime, currentScore }: { wordsSpoken: number, fillerCount: number, responseTime: number, currentScore: number }) => {
  const wpm = responseTime > 0 ? Math.round((wordsSpoken / responseTime) * 60) : 0;
  
  return (
    <div className="space-y-6">
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-[10px] font-mono tracking-widest" style={{ color: 'rgba(136,136,136,0.5)' }}>PACE (WPM)</span>
          <span className="text-sm font-mono" style={{ color: wpm > 180 ? 'rgba(239,68,68,0.9)' : wpm < 100 ? 'rgba(255,215,0,0.9)' : 'rgba(34,197,94,0.9)' }}>{wpm}</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <div className="h-full rounded-full transition-all duration-300" style={{ width: `${Math.min(100, (wpm / 200) * 100)}%`, background: wpm > 180 ? 'rgba(239,68,68,0.8)' : wpm < 100 ? 'rgba(255,215,0,0.8)' : 'rgba(34,197,94,0.8)' }} />
        </div>
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-[10px] font-mono tracking-widest" style={{ color: 'rgba(136,136,136,0.5)' }}>FILLER WORDS</span>
          <span className="text-sm font-mono" style={{ color: fillerCount > 5 ? 'rgba(239,68,68,0.9)' : 'rgba(34,197,94,0.9)' }}>{fillerCount}</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <div className="h-full rounded-full transition-all duration-300" style={{ width: `${Math.min(100, fillerCount * 10)}%`, background: fillerCount > 5 ? 'rgba(239,68,68,0.8)' : fillerCount > 2 ? 'rgba(255,215,0,0.8)' : 'rgba(34,197,94,0.8)' }} />
        </div>
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-[10px] font-mono tracking-widest" style={{ color: 'rgba(136,136,136,0.5)' }}>CONTENT SCORE</span>
          <span className="text-sm font-mono" style={{ color: currentScore >= 70 ? 'rgba(34,197,94,0.9)' : currentScore >= 50 ? 'rgba(255,215,0,0.9)' : 'rgba(239,68,68,0.9)' }}>{currentScore}%</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <div className="h-full rounded-full transition-all duration-300" style={{ width: `${currentScore}%`, background: currentScore >= 70 ? 'rgba(34,197,94,0.8)' : currentScore >= 50 ? 'rgba(255,215,0,0.8)' : 'rgba(239,68,68,0.8)' }} />
        </div>
      </div>
      
      <div className="pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="text-[10px] font-mono tracking-widest mb-2" style={{ color: 'rgba(136,136,136,0.5)' }}>SESSION</div>
        <div className="text-2xl font-light" style={{ color: 'rgba(255,255,255,0.9)' }}>{wordsSpoken} <span className="text-sm" style={{ color: 'rgba(136,136,136,0.5)' }}>words</span></div>
      </div>
    </div>
  );
});
MetricsPanel.displayName = 'MetricsPanel';

// ═══════════════════════════════════════════════════════════════════════════
// MODE SELECTOR
// ═══════════════════════════════════════════════════════════════════════════

const ModeSelector = memo(({ selectedMode, onSelect, onStart }: { selectedMode: InterviewMode | null, onSelect: (mode: InterviewMode) => void, onStart: () => void }) => {
  const modes = [
    { id: 'technical' as InterviewMode, name: 'Technical', icon: <Brain size={24} />, desc: 'Options, Greeks, Valuations', color: 'rgba(59,130,246,0.9)' },
    { id: 'behavioral' as InterviewMode, name: 'Behavioral', icon: <Target size={24} />, desc: 'STAR Method, Leadership', color: 'rgba(34,197,94,0.9)' },
    { id: 'stress' as InterviewMode, name: 'Stress Test', icon: <Zap size={24} />, desc: 'Rapid Fire, Pressure', color: 'rgba(239,68,68,0.9)' },
    { id: 'case-study' as InterviewMode, name: 'Case Study', icon: <BarChart3 size={24} />, desc: 'Trade Ideas, Analysis', color: 'rgba(168,85,247,0.9)' },
  ];
  
  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-light mb-3" style={{ color: 'rgba(255,255,255,0.95)' }}>Select Interview Mode</h2>
        <p className="text-sm" style={{ color: 'rgba(136,136,136,0.6)' }}>Each mode simulates a different part of the interview process</p>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-8">
        {modes.map(mode => (
          <button
            key={mode.id}
            onClick={() => onSelect(mode.id)}
            className="p-6 rounded-2xl text-left transition-all hover:scale-[1.02]"
            style={{ background: selectedMode === mode.id ? `${mode.color}15` : 'rgba(255,255,255,0.02)', border: selectedMode === mode.id ? `2px solid ${mode.color}` : '1px solid rgba(255,255,255,0.08)' }}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${mode.color}20`, color: mode.color }}>{mode.icon}</div>
              <div>
                <h3 className="font-medium mb-1" style={{ color: selectedMode === mode.id ? mode.color : 'rgba(255,255,255,0.9)' }}>{mode.name}</h3>
                <p className="text-sm" style={{ color: 'rgba(136,136,136,0.6)' }}>{mode.desc}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
      
      <button
        onClick={onStart}
        disabled={!selectedMode}
        className="w-full py-4 rounded-xl text-base font-medium transition-all hover:scale-[1.02] disabled:opacity-40 flex items-center justify-center gap-2"
        style={{ background: 'rgba(255,255,255,0.95)', color: '#000' }}
      >
        <Play size={20} /> Begin Interview
      </button>
    </div>
  );
});
ModeSelector.displayName = 'ModeSelector';

// ═══════════════════════════════════════════════════════════════════════════
// SESSION RESULTS
// ═══════════════════════════════════════════════════════════════════════════

const SessionResults = memo(({ responses, metrics, onRestart, onExit }: { responses: ResponseData[], metrics: SessionMetrics, onRestart: () => void, onExit: () => void }) => {
  const avgScore = responses.length > 0 ? Math.round(responses.reduce((sum, r) => sum + r.score, 0) / responses.length) : 0;
  const grade = avgScore >= 85 ? 'A' : avgScore >= 70 ? 'B' : avgScore >= 55 ? 'C' : avgScore >= 40 ? 'D' : 'F';
  const gradeColor = avgScore >= 70 ? 'rgba(34,197,94,0.9)' : avgScore >= 50 ? 'rgba(255,215,0,0.9)' : 'rgba(239,68,68,0.9)';
  
  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-light mb-2" style={{ color: 'rgba(255,255,255,0.95)' }}>Session Complete</h2>
        <p className="text-sm" style={{ color: 'rgba(136,136,136,0.6)' }}>Here is how you performed</p>
      </div>
      
      <div className="p-8 rounded-2xl mb-6 text-center" style={{ background: `${gradeColor}10`, border: `1px solid ${gradeColor}30` }}>
        <div className="text-8xl font-extralight mb-2" style={{ color: gradeColor }}>{grade}</div>
        <div className="text-xl" style={{ color: 'rgba(255,255,255,0.7)' }}>{avgScore}% Overall Score</div>
      </div>
      
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="p-4 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="text-2xl font-light mb-1" style={{ color: 'rgba(255,255,255,0.9)' }}>{responses.length}</div>
          <div className="text-xs" style={{ color: 'rgba(136,136,136,0.5)' }}>Questions</div>
        </div>
        <div className="p-4 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="text-2xl font-light mb-1" style={{ color: metrics.wordsPerMinute >= 120 && metrics.wordsPerMinute <= 150 ? 'rgba(34,197,94,0.9)' : 'rgba(255,215,0,0.9)' }}>{metrics.wordsPerMinute}</div>
          <div className="text-xs" style={{ color: 'rgba(136,136,136,0.5)' }}>WPM</div>
        </div>
        <div className="p-4 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="text-2xl font-light mb-1" style={{ color: metrics.fillerWords <= 5 ? 'rgba(34,197,94,0.9)' : 'rgba(239,68,68,0.9)' }}>{metrics.fillerWords}</div>
          <div className="text-xs" style={{ color: 'rgba(136,136,136,0.5)' }}>Fillers</div>
        </div>
        <div className="p-4 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="text-2xl font-light mb-1" style={{ color: 'rgba(255,255,255,0.9)' }}>{Math.round(metrics.totalDuration / 60)}m</div>
          <div className="text-xs" style={{ color: 'rgba(136,136,136,0.5)' }}>Duration</div>
        </div>
      </div>
      
      <div className="p-6 rounded-2xl mb-8" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <h3 className="text-sm font-mono tracking-widest mb-4" style={{ color: 'rgba(136,136,136,0.5)' }}>QUESTION BREAKDOWN</h3>
        <div className="space-y-4">
          {responses.map((r, i) => (
            <div key={i} className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-mono flex-shrink-0" style={{ background: r.score >= 70 ? 'rgba(34,197,94,0.15)' : r.score >= 50 ? 'rgba(255,215,0,0.15)' : 'rgba(239,68,68,0.15)', color: r.score >= 70 ? 'rgba(34,197,94,0.9)' : r.score >= 50 ? 'rgba(255,215,0,0.9)' : 'rgba(239,68,68,0.9)' }}>{r.score}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm mb-1 truncate" style={{ color: 'rgba(255,255,255,0.8)' }}>{r.question}</p>
                <p className="text-xs" style={{ color: 'rgba(136,136,136,0.5)' }}>{r.transcript.split(' ').length} words</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="p-6 rounded-2xl mb-8" style={{ background: 'rgba(255,215,0,0.05)', border: '1px solid rgba(255,215,0,0.15)' }}>
        <h3 className="text-sm font-mono tracking-widest mb-4" style={{ color: 'rgba(255,215,0,0.7)' }}>AREAS TO IMPROVE</h3>
        <ul className="space-y-2">
          {metrics.fillerWords > 3 && (
            <li className="flex items-start gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" style={{ color: 'rgba(255,215,0,0.7)' }} />
              Reduce filler words. Try pausing instead of saying um or like.
            </li>
          )}
          {metrics.wordsPerMinute > 160 && (
            <li className="flex items-start gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" style={{ color: 'rgba(255,215,0,0.7)' }} />
              Slow down. Take a breath between points for clarity.
            </li>
          )}
          {metrics.wordsPerMinute < 100 && (
            <li className="flex items-start gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" style={{ color: 'rgba(255,215,0,0.7)' }} />
              Pick up the pace. Practice speaking more fluidly.
            </li>
          )}
          {avgScore < 70 && (
            <li className="flex items-start gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" style={{ color: 'rgba(255,215,0,0.7)' }} />
              Review core concepts. Use the Academy to strengthen fundamentals.
            </li>
          )}
        </ul>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <button onClick={onExit} className="py-4 rounded-xl text-sm font-medium transition-all hover:bg-white/5" style={{ border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.8)' }}>Exit to Home</button>
        <button onClick={onRestart} className="py-4 rounded-xl text-sm font-medium transition-all hover:scale-[1.02] flex items-center justify-center gap-2" style={{ background: 'rgba(255,255,255,0.95)', color: '#000' }}><RefreshCw size={16} /> Practice Again</button>
      </div>
    </div>
  );
});
SessionResults.displayName = 'SessionResults';

// ═══════════════════════════════════════════════════════════════════════════
// MAIN ARENA COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const ArenaView = memo(({ onExit, userTrack = 'trading', userLevel = 'analyst' }: ArenaProps) => {
  const [phase, setPhase] = useState<'select' | 'interview' | 'results'>('select');
  const [mode, setMode] = useState<InterviewMode | null>(null);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [responses, setResponses] = useState<ResponseData[]>([]);
  
  const [orbState, setOrbState] = useState<'idle' | 'listening' | 'processing' | 'speaking'>('idle');
  const [audioLevel, setAudioLevel] = useState(0);
  
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [displayedResponse, setDisplayedResponse] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const [responseStart, setResponseStart] = useState(0);
  const [currentMetrics, setCurrentMetrics] = useState({ words: 0, fillers: 0, score: 0 });
  const [sessionMetrics, setSessionMetrics] = useState<SessionMetrics | null>(null);
  const [chatHistory, setChatHistory] = useState<{role: string, content: string}[]>([]);
  
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);

  // Speech Recognition Setup
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SR();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      recognition.onresult = (e: any) => {
        let interim = '';
        let final = '';
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const text = e.results[i][0].transcript;
          if (e.results[i].isFinal) { final += text + ' '; }
          else { interim = text; }
        }
        if (final) {
          setTranscript(prev => prev + final);
          const analysis = analyzeTranscript(transcript + final);
          setCurrentMetrics(prev => ({ words: analysis.wordCount, fillers: analysis.fillerCount, score: prev.score }));
        }
        setInterimTranscript(interim);
      };
      
      recognition.onerror = (e: any) => { if (e.error !== 'no-speech') setOrbState('idle'); };
      recognitionRef.current = recognition;
    }
    return () => { if (recognitionRef.current) try { recognitionRef.current.stop(); } catch {} };
  }, [transcript]);

  const startAudioAnalysis = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      const updateLevel = () => {
        if (analyserRef.current && orbState === 'listening') {
          analyserRef.current.getByteFrequencyData(dataArray);
          const avg = dataArray.reduce((a, b) => a + b) / dataArray.length;
          setAudioLevel(avg / 255);
          animationRef.current = requestAnimationFrame(updateLevel);
        }
      };
      updateLevel();
    } catch {}
  }, [orbState]);

  const stopAudioAnalysis = useCallback(() => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    if (audioContextRef.current) { audioContextRef.current.close(); audioContextRef.current = null; }
    setAudioLevel(0);
  }, []);

  const startInterview = useCallback(() => {
    if (!mode) return;
    const q = getQuestionsForSession(mode, userTrack, userLevel, 5);
    setQuestions(q);
    setCurrentQIndex(0);
    setResponses([]);
    setChatHistory([]);
    setPhase('interview');
    if (q.length > 0) {
      const firstQ = q[0].question;
      setAiResponse(firstQ);
      typewriterEffect(firstQ, () => speakText(firstQ));
    }
  }, [mode, userTrack, userLevel]);

  const startRecording = useCallback(() => {
    if (!recognitionRef.current || orbState !== 'idle') return;
    setTranscript('');
    setInterimTranscript('');
    setCurrentMetrics({ words: 0, fillers: 0, score: 0 });
    setResponseStart(Date.now());
    try {
      recognitionRef.current.start();
      setOrbState('listening');
      startAudioAnalysis();
    } catch {}
  }, [orbState, startAudioAnalysis]);

  const stopRecording = useCallback(async () => {
    if (!recognitionRef.current) return;
    try { recognitionRef.current.stop(); } catch {}
    stopAudioAnalysis();
    setOrbState('processing');
    
    const responseDuration = (Date.now() - responseStart) / 1000;
    const finalTranscript = (transcript + interimTranscript).trim();
    
    if (finalTranscript.length < 10) {
      setOrbState('idle');
      setAiResponse("I did not catch that. Please speak clearly and try again.");
      return;
    }
    
    const currentQ = questions[currentQIndex];
    const result = await sendToAI(finalTranscript, currentQ);
    const analysis = analyzeTranscript(finalTranscript);
    const score = result.score || 50;
    
    setResponses(prev => [...prev, { question: currentQ.question, transcript: finalTranscript, duration: responseDuration, score, aiResponse: result.message }]);
    setCurrentMetrics({ words: analysis.wordCount, fillers: analysis.fillerCount, score });
    
    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex(prev => prev + 1);
      setAiResponse(result.message);
      typewriterEffect(result.message, () => speakText(result.message));
    } else {
      const wrapUp = "Great, that concludes our interview. Let me compile your feedback...";
      setAiResponse(wrapUp);
      typewriterEffect(wrapUp, () => {
        speakText(wrapUp);
        setTimeout(() => {
          const allResponses = [...responses, { question: currentQ.question, transcript: finalTranscript, duration: responseDuration, score, aiResponse: result.message }];
          setSessionMetrics(calculateSessionMetrics(allResponses));
          setPhase('results');
        }, 3000);
      });
    }
  }, [transcript, interimTranscript, questions, currentQIndex, responseStart, responses, stopAudioAnalysis]);

  const sendToAI = useCallback(async (userMessage: string, question: InterviewQuestion) => {
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, history: chatHistory, mode, track: userTrack, difficulty: userLevel, currentQuestion: question.question, expectedTopics: question.expectedTopics })
      });
      const data = await res.json();
      if (data.success) {
        setChatHistory(prev => [...prev, { role: 'user', content: userMessage }, { role: 'assistant', content: data.message }]);
        return { message: data.message, score: data.score };
      }
    } catch {}
    return { message: question.followUps[0] || "Can you elaborate?", score: 50 };
  }, [chatHistory, mode, userTrack, userLevel]);

  const speakText = useCallback(async (text: string) => {
    setOrbState('speaking');
    try {
      const res = await fetch('/api/voice', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) });
      if (res.ok) {
        const blob = await res.blob();
        const audio = new Audio(URL.createObjectURL(blob));
        audio.onended = () => setOrbState('idle');
        await audio.play();
        return;
      }
    } catch {}
    if ('speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.95;
      u.onend = () => setOrbState('idle');
      window.speechSynthesis.speak(u);
    } else { setOrbState('idle'); }
  }, []);

  const typewriterEffect = useCallback((text: string, callback?: () => void) => {
    setIsTyping(true);
    setDisplayedResponse('');
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) { setDisplayedResponse(prev => prev + text[i]); i++; }
      else { clearInterval(interval); setIsTyping(false); if (callback) callback(); }
    }, 20);
  }, []);

  const calculateSessionMetrics = useCallback((responses: ResponseData[]): SessionMetrics => {
    const totalDuration = responses.reduce((sum, r) => sum + r.duration, 0);
    const allText = responses.map(r => r.transcript).join(' ');
    const analysis = analyzeTranscript(allText);
    const avgScore = responses.reduce((sum, r) => sum + r.score, 0) / responses.length;
    return {
      totalDuration, speakingTime: totalDuration * 0.8, wordsSpoken: analysis.wordCount,
      wordsPerMinute: Math.round((analysis.wordCount / totalDuration) * 60) || 0,
      fillerWords: analysis.fillerCount, fillerWordsList: analysis.fillerWords, silencePauses: 0,
      avgResponseTime: totalDuration / responses.length, questionsAnswered: responses.length,
      structureScore: avgScore, contentScore: avgScore, confidenceScore: Math.max(0, 100 - analysis.fillerCount * 5), overallScore: Math.round(avgScore)
    };
  }, []);

  const restartSession = useCallback(() => {
    setPhase('select'); setMode(null); setQuestions([]); setCurrentQIndex(0); setResponses([]);
    setChatHistory([]); setTranscript(''); setInterimTranscript(''); setAiResponse('');
    setDisplayedResponse(''); setCurrentMetrics({ words: 0, fillers: 0, score: 0 });
    setSessionMetrics(null); setOrbState('idle');
  }, []);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#000' }}>
      <style>{`
        @keyframes pulse-ring { 0% { transform: scale(1); opacity: 0.4; } 100% { transform: scale(1.3); opacity: 0; } }
        @keyframes soundwave { 0% { transform: scaleY(0.4); } 100% { transform: scaleY(1); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
      
      <div className="px-8 py-5 flex justify-between items-center" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="flex items-center gap-4">
          <div className="w-2 h-2 rounded-full" style={{ background: phase === 'interview' ? 'rgba(34,197,94,0.8)' : 'rgba(255,255,255,0.3)' }} />
          <span className="text-xs font-mono tracking-widest" style={{ color: 'rgba(136,136,136,0.5)' }}>
            {phase === 'select' ? 'MODE SELECT' : phase === 'interview' ? 'LIVE SESSION' : 'RESULTS'}
          </span>
          {phase === 'interview' && <span className="text-xs font-mono px-2 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.03)', color: 'rgba(136,136,136,0.5)' }}>Q{currentQIndex + 1}/{questions.length}</span>}
        </div>
        <button onClick={onExit} className="text-xs px-4 py-2 rounded-full hover:bg-white/5 transition-colors" style={{ border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}>Exit</button>
      </div>
      
      <div className="flex-1 flex">
        {phase === 'select' && (
          <div className="flex-1 flex items-center justify-center px-8">
            <ModeSelector selectedMode={mode} onSelect={setMode} onStart={startInterview} />
          </div>
        )}
        
        {phase === 'interview' && (
          <>
            <div className="w-56 p-8" style={{ borderRight: '1px solid rgba(255,255,255,0.04)' }}>
              <MetricsPanel wordsSpoken={currentMetrics.words} fillerCount={currentMetrics.fillers} responseTime={(Date.now() - responseStart) / 1000} currentScore={currentMetrics.score} />
            </div>
            
            <div className="flex-1 flex flex-col items-center justify-center px-8 relative">
              <div className="absolute top-12 max-w-2xl text-center px-8">
                <p className="text-xs font-mono tracking-widest mb-4" style={{ color: 'rgba(136,136,136,0.4)' }}>{mode?.toUpperCase()} INTERVIEW</p>
                <p className="text-xl font-light leading-relaxed" style={{ color: 'rgba(255,255,255,0.9)' }}>
                  {isTyping ? displayedResponse : aiResponse}
                  {isTyping && <span className="animate-pulse">|</span>}
                </p>
              </div>
              
              <Orb state={orbState} audioLevel={audioLevel} />
              
              {(transcript || interimTranscript) && orbState === 'listening' && (
                <div className="absolute bottom-40 max-w-xl text-center p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <p className="text-xs font-mono mb-2" style={{ color: 'rgba(239,68,68,0.6)' }}>● RECORDING</p>
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>{transcript}<span style={{ color: 'rgba(255,255,255,0.4)' }}>{interimTranscript}</span></p>
                </div>
              )}
              
              <div className="absolute bottom-12 flex flex-col items-center gap-4">
                {orbState === 'idle' && (
                  <button onClick={startRecording} disabled={isTyping} className="w-20 h-20 rounded-full flex items-center justify-center transition-all hover:scale-105 disabled:opacity-40" style={{ background: 'rgba(255,255,255,0.05)', border: '2px solid rgba(255,255,255,0.2)' }}>
                    <Mic size={24} style={{ color: 'rgba(255,255,255,0.6)' }} />
                  </button>
                )}
                {orbState === 'listening' && (
                  <button onClick={stopRecording} className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.15)', border: '3px solid rgba(239,68,68,0.8)' }}>
                    <Square size={20} fill="rgba(239,68,68,0.9)" style={{ color: 'rgba(239,68,68,0.9)' }} />
                  </button>
                )}
                <span className="text-xs font-mono tracking-widest" style={{ color: orbState === 'listening' ? 'rgba(239,68,68,0.8)' : 'rgba(136,136,136,0.4)' }}>
                  {orbState === 'idle' && 'TAP TO SPEAK'}
                  {orbState === 'listening' && 'TAP TO SEND'}
                  {orbState === 'processing' && 'ANALYZING...'}
                  {orbState === 'speaking' && 'AI RESPONDING'}
                </span>
              </div>
            </div>
          </>
        )}
        
        {phase === 'results' && sessionMetrics && (
          <div className="flex-1 flex items-center justify-center px-8 py-12">
            <SessionResults responses={responses} metrics={sessionMetrics} onRestart={restartSession} onExit={onExit} />
          </div>
        )}
      </div>
    </div>
  );
});

ArenaView.displayName = 'ArenaView';
export default ArenaView;
