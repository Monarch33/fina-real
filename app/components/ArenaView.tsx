'use client';

import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { Mic, Square, Clock, Brain, Zap, Target, Play, RefreshCw, AlertCircle, BarChart3 } from 'lucide-react';
import { 
  InterviewMode, CareerTrack, Difficulty, InterviewQuestion,
  getQuestionsForSession, FILLER_WORDS
} from '../data/arena';

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
    <div className="relative flex items-center justify-center" style={{ width: 200, height: 200 }}>
      {[1, 2, 3].map(ring => (
        <div 
          key={ring} 
          className="absolute rounded-full transition-all duration-300" 
          style={{
            width: 60 + ring * 40,
            height: 60 + ring * 40,
            border: `1px solid ${c.glow}`,
            opacity: state !== 'idle' ? 0.5 / ring : 0.15 / ring,
            animation: state !== 'idle' ? `pulse-ring ${1.5 + ring * 0.3}s ease-out infinite` : 'none'
          }} 
        />
      ))}
      
      {state === 'listening' && (
        <div className="absolute flex items-center gap-0.5">
          {[...Array(8)].map((_, i) => (
            <div 
              key={i} 
              className="w-1 rounded-full bg-red-500"
              style={{ height: 10 + audioLevel * 40 + Math.random() * 15, transition: 'height 0.1s' }} 
            />
          ))}
        </div>
      )}
      
      {state === 'speaking' && (
        <div className="absolute flex items-center gap-0.5">
          {[...Array(8)].map((_, i) => (
            <div 
              key={i} 
              className="w-1 rounded-full bg-blue-500"
              style={{ height: 15 + Math.sin(Date.now() / 150 + i * 0.5) * 20, animation: `soundwave ${0.4 + i * 0.05}s ease-in-out infinite alternate` }} 
            />
          ))}
        </div>
      )}
      
      {state === 'processing' && (
        <div className="absolute w-16 h-16 rounded-full border-2 border-transparent border-t-yellow-500" style={{ animation: 'spin 0.8s linear infinite' }} />
      )}
      
      <div 
        className="relative rounded-full transition-all duration-200"
        style={{
          width: 80, height: 80,
          transform: `scale(${scale})`,
          background: `radial-gradient(circle at 30% 30%, ${c.main}, rgba(0,0,0,0.9))`,
          boxShadow: `0 0 40px ${c.glow}, 0 0 80px ${c.glow}`
        }}
      />
      
      <div className="absolute -bottom-8 px-3 py-1 rounded-full text-xs font-mono" style={{ background: `${c.main}20`, border: `1px solid ${c.main}50`, color: c.main }}>
        {state === 'idle' && 'READY'}
        {state === 'listening' && '● REC'}
        {state === 'processing' && 'THINKING...'}
        {state === 'speaking' && '🔊 SPEAKING'}
      </div>
    </div>
  );
});
Orb.displayName = 'Orb';

// ═══════════════════════════════════════════════════════════════════════════
// LIVE METRICS PANEL
// ═══════════════════════════════════════════════════════════════════════════

const LiveMetrics = memo(({ 
  totalWords, 
  totalFillers, 
  avgScore,
  questionsAnswered,
  sessionTime
}: { 
  totalWords: number;
  totalFillers: number;
  avgScore: number;
  questionsAnswered: number;
  sessionTime: number;
}) => {
  const wpm = sessionTime > 10 ? Math.round((totalWords / sessionTime) * 60) : 0;
  const fillerRate = totalWords > 0 ? ((totalFillers / totalWords) * 100).toFixed(1) : '0';
  
  return (
    <div className="space-y-5">
      <div className="text-xs font-mono tracking-widest mb-4" style={{ color: 'rgba(136,136,136,0.4)' }}>SESSION METRICS</div>
      
      <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="text-xs mb-1" style={{ color: 'rgba(136,136,136,0.5)' }}>Overall Score</div>
        <div className="text-3xl font-light" style={{ color: avgScore >= 70 ? 'rgba(34,197,94,0.9)' : avgScore >= 50 ? 'rgba(255,215,0,0.9)' : 'rgba(255,255,255,0.9)' }}>
          {avgScore > 0 ? `${avgScore}%` : '--'}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <div className="text-xs mb-1" style={{ color: 'rgba(136,136,136,0.5)' }}>Words</div>
          <div className="text-xl font-mono" style={{ color: 'rgba(255,255,255,0.9)' }}>{totalWords}</div>
        </div>
        <div className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <div className="text-xs mb-1" style={{ color: 'rgba(136,136,136,0.5)' }}>WPM</div>
          <div className="text-xl font-mono" style={{ color: wpm > 180 ? 'rgba(239,68,68,0.9)' : wpm < 100 && wpm > 0 ? 'rgba(255,215,0,0.9)' : 'rgba(34,197,94,0.9)' }}>{wpm || '--'}</div>
        </div>
      </div>
      
      <div className="p-3 rounded-lg" style={{ background: totalFillers > 5 ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.02)' }}>
        <div className="flex justify-between items-center">
          <div className="text-xs" style={{ color: 'rgba(136,136,136,0.5)' }}>Filler Words</div>
          <div className="text-lg font-mono" style={{ color: totalFillers > 5 ? 'rgba(239,68,68,0.9)' : 'rgba(34,197,94,0.9)' }}>{totalFillers}</div>
        </div>
        {totalFillers > 0 && (
          <div className="text-xs mt-1" style={{ color: 'rgba(136,136,136,0.4)' }}>{fillerRate}% of speech</div>
        )}
      </div>
      
      <div className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="flex justify-between items-center">
          <div className="text-xs" style={{ color: 'rgba(136,136,136,0.5)' }}>Questions</div>
          <div className="text-lg font-mono" style={{ color: 'rgba(255,255,255,0.9)' }}>{questionsAnswered}</div>
        </div>
      </div>
      
      <div className="pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2 text-xs" style={{ color: 'rgba(136,136,136,0.5)' }}>
          <Clock size={12} />
          {Math.floor(sessionTime / 60)}:{String(Math.floor(sessionTime % 60)).padStart(2, '0')}
        </div>
      </div>
    </div>
  );
});
LiveMetrics.displayName = 'LiveMetrics';

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
          <button key={mode.id} onClick={() => onSelect(mode.id)} className="p-6 rounded-2xl text-left transition-all hover:scale-[1.02]" style={{ background: selectedMode === mode.id ? `${mode.color}15` : 'rgba(255,255,255,0.02)', border: selectedMode === mode.id ? `2px solid ${mode.color}` : '1px solid rgba(255,255,255,0.08)' }}>
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
      
      <button onClick={onStart} disabled={!selectedMode} className="w-full py-4 rounded-xl text-base font-medium transition-all hover:scale-[1.02] disabled:opacity-40 flex items-center justify-center gap-2" style={{ background: 'rgba(255,255,255,0.95)', color: '#000' }}>
        <Play size={20} /> Begin Interview
      </button>
    </div>
  );
});
ModeSelector.displayName = 'ModeSelector';

// ═══════════════════════════════════════════════════════════════════════════
// RESULTS VIEW
// ═══════════════════════════════════════════════════════════════════════════

const ResultsView = memo(({ responses, totalWords, totalFillers, sessionTime, onRestart, onExit }: { responses: ResponseData[], totalWords: number, totalFillers: number, sessionTime: number, onRestart: () => void, onExit: () => void }) => {
  const avgScore = responses.length > 0 ? Math.round(responses.reduce((sum, r) => sum + r.score, 0) / responses.length) : 0;
  const grade = avgScore >= 85 ? 'A' : avgScore >= 70 ? 'B' : avgScore >= 55 ? 'C' : avgScore >= 40 ? 'D' : 'F';
  const gradeColor = avgScore >= 70 ? 'rgba(34,197,94,0.9)' : avgScore >= 50 ? 'rgba(255,215,0,0.9)' : 'rgba(239,68,68,0.9)';
  const wpm = sessionTime > 0 ? Math.round((totalWords / sessionTime) * 60) : 0;
  
  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-light mb-2" style={{ color: 'rgba(255,255,255,0.95)' }}>Interview Complete</h2>
      </div>
      
      <div className="p-8 rounded-2xl mb-6 text-center" style={{ background: `${gradeColor}10`, border: `1px solid ${gradeColor}30` }}>
        <div className="text-7xl font-extralight mb-2" style={{ color: gradeColor }}>{grade}</div>
        <div className="text-xl" style={{ color: 'rgba(255,255,255,0.7)' }}>{avgScore}% Overall</div>
      </div>
      
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="p-4 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="text-2xl font-light" style={{ color: 'rgba(255,255,255,0.9)' }}>{responses.length}</div>
          <div className="text-xs" style={{ color: 'rgba(136,136,136,0.5)' }}>Questions</div>
        </div>
        <div className="p-4 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="text-2xl font-light" style={{ color: wpm >= 120 && wpm <= 150 ? 'rgba(34,197,94,0.9)' : 'rgba(255,215,0,0.9)' }}>{wpm}</div>
          <div className="text-xs" style={{ color: 'rgba(136,136,136,0.5)' }}>WPM</div>
        </div>
        <div className="p-4 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="text-2xl font-light" style={{ color: totalFillers <= 5 ? 'rgba(34,197,94,0.9)' : 'rgba(239,68,68,0.9)' }}>{totalFillers}</div>
          <div className="text-xs" style={{ color: 'rgba(136,136,136,0.5)' }}>Fillers</div>
        </div>
        <div className="p-4 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="text-2xl font-light" style={{ color: 'rgba(255,255,255,0.9)' }}>{Math.floor(sessionTime / 60)}m</div>
          <div className="text-xs" style={{ color: 'rgba(136,136,136,0.5)' }}>Duration</div>
        </div>
      </div>
      
      <div className="p-5 rounded-xl mb-6" style={{ background: 'rgba(255,215,0,0.05)', border: '1px solid rgba(255,215,0,0.15)' }}>
        <h3 className="text-sm font-mono mb-3" style={{ color: 'rgba(255,215,0,0.7)' }}>TIPS</h3>
        <ul className="space-y-2 text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
          {totalFillers > 5 && <li className="flex gap-2"><AlertCircle size={14} className="flex-shrink-0 mt-0.5 text-yellow-500" /> Reduce filler words - try pausing instead</li>}
          {wpm > 160 && <li className="flex gap-2"><AlertCircle size={14} className="flex-shrink-0 mt-0.5 text-yellow-500" /> Slow down - aim for 120-150 WPM</li>}
          {wpm < 100 && wpm > 0 && <li className="flex gap-2"><AlertCircle size={14} className="flex-shrink-0 mt-0.5 text-yellow-500" /> Pick up the pace a bit</li>}
          {avgScore < 70 && <li className="flex gap-2"><AlertCircle size={14} className="flex-shrink-0 mt-0.5 text-yellow-500" /> Review fundamentals in the Academy</li>}
        </ul>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <button onClick={onExit} className="py-4 rounded-xl text-sm font-medium" style={{ border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.8)' }}>Exit</button>
        <button onClick={onRestart} className="py-4 rounded-xl text-sm font-medium flex items-center justify-center gap-2" style={{ background: 'rgba(255,255,255,0.95)', color: '#000' }}><RefreshCw size={16} /> Again</button>
      </div>
    </div>
  );
});
ResultsView.displayName = 'ResultsView';

// ═══════════════════════════════════════════════════════════════════════════
// MAIN ARENA COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const ArenaView = memo(({ onExit, userTrack = 'trading', userLevel = 'analyst' }: ArenaProps) => {
  // Phase & Mode
  const [phase, setPhase] = useState<'select' | 'interview' | 'results'>('select');
  const [mode, setMode] = useState<InterviewMode | null>(null);
  
  // Questions
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [responses, setResponses] = useState<ResponseData[]>([]);
  
  // Recording State
  const [orbState, setOrbState] = useState<'idle' | 'listening' | 'processing' | 'speaking'>('idle');
  const [audioLevel, setAudioLevel] = useState(0);
  const [micError, setMicError] = useState<string | null>(null);
  
  // Transcripts
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  
  // Cumulative Metrics
  const [totalWords, setTotalWords] = useState(0);
  const [totalFillers, setTotalFillers] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [sessionStart, setSessionStart] = useState(0);
  const [sessionTime, setSessionTime] = useState(0);
  
  // Conversation History
  const [conversationHistory, setConversationHistory] = useState<{role: string, content: string}[]>([]);
  
  // Refs
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Session Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (phase === 'interview' && sessionStart > 0) {
      interval = setInterval(() => {
        setSessionTime(Math.floor((Date.now() - sessionStart) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [phase, sessionStart]);

  // Count filler words in text
  const countFillers = useCallback((text: string): number => {
    const lower = text.toLowerCase();
    let count = 0;
    FILLER_WORDS.forEach(filler => {
      const regex = new RegExp(`\\b${filler}\\b`, 'gi');
      const matches = lower.match(regex);
      if (matches) count += matches.length;
    });
    return count;
  }, []);

  // Calculate score based on response
  const calculateScore = useCallback((text: string, question: InterviewQuestion): number => {
    let score = 50;
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;
    
    // Length bonus
    if (wordCount >= 40 && wordCount <= 120) score += 15;
    else if (wordCount >= 20) score += 5;
    else if (wordCount < 15) score -= 10;
    
    // Topic coverage
    if (question.expectedTopics?.length > 0) {
      const covered = question.expectedTopics.filter(t => text.toLowerCase().includes(t.toLowerCase())).length;
      score += Math.round((covered / question.expectedTopics.length) * 25);
    }
    
    // Structure indicators
    if (/first|second|third|because|therefore|for example|specifically/i.test(text)) score += 10;
    
    // Filler penalty
    const fillers = countFillers(text);
    score -= fillers * 2;
    
    return Math.max(0, Math.min(100, score));
  }, [countFillers]);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMicError('Speech recognition not supported. Please use Chrome.');
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;
    
    recognition.onstart = () => {
      console.log('Speech recognition started');
      setMicError(null);
    };
    
    recognition.onresult = (e: any) => {
      let interim = '';
      let final = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += t + ' ';
        else interim = t;
      }
      if (final) setTranscript(prev => prev + final);
      setInterimTranscript(interim);
    };
    
    recognition.onerror = (e: any) => {
      console.error('Speech error:', e.error);
      if (e.error === 'not-allowed') {
        setMicError('Microphone access denied. Please allow mic access.');
      } else if (e.error !== 'no-speech' && e.error !== 'aborted') {
        setMicError(`Mic error: ${e.error}`);
      }
      setOrbState('idle');
    };
    
    recognition.onend = () => {
      console.log('Speech recognition ended');
    };
    
    recognitionRef.current = recognition;
    
    return () => {
      try { recognition.stop(); } catch {}
    };
  }, []);

  // Start Audio Analysis for visualization
  const startAudioAnalysis = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 128;
      
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      
      const update = () => {
        if (analyserRef.current) {
          analyserRef.current.getByteFrequencyData(dataArray);
          const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
          setAudioLevel(avg / 255);
        }
        if (orbState === 'listening') {
          animationRef.current = requestAnimationFrame(update);
        }
      };
      update();
    } catch (err: any) {
      console.error('Audio error:', err);
      setMicError('Could not access microphone');
    }
  }, [orbState]);

  const stopAudioAnalysis = useCallback(() => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setAudioLevel(0);
  }, []);

  // Start Interview
  const startInterview = useCallback(() => {
    if (!mode) return;
    const q = getQuestionsForSession(mode, userTrack, userLevel, 5);
    setQuestions(q);
    setCurrentQIndex(0);
    setResponses([]);
    setTotalWords(0);
    setTotalFillers(0);
    setTotalScore(0);
    setSessionStart(Date.now());
    setSessionTime(0);
    setConversationHistory([]);
    setPhase('interview');
    
    if (q.length > 0) {
      setAiResponse(q[0].question);
      speakText(q[0].question);
    }
  }, [mode, userTrack, userLevel]);

  // Start Recording
  const startRecording = useCallback(() => {
    if (!recognitionRef.current) {
      setMicError('Speech recognition not available');
      return;
    }
    if (orbState !== 'idle') return;
    
    setTranscript('');
    setInterimTranscript('');
    setMicError(null);
    
    try {
      recognitionRef.current.start();
      setOrbState('listening');
      startAudioAnalysis();
    } catch (err: any) {
      console.error('Start error:', err);
      if (err.message?.includes('already started')) {
        try { recognitionRef.current.stop(); } catch {}
        setTimeout(() => {
          try {
            recognitionRef.current.start();
            setOrbState('listening');
            startAudioAnalysis();
          } catch {}
        }, 100);
      }
    }
  }, [orbState, startAudioAnalysis]);

  // Stop Recording & Process
  const stopRecording = useCallback(async () => {
    if (!recognitionRef.current) return;
    
    try { recognitionRef.current.stop(); } catch {}
    stopAudioAnalysis();
    
    const finalText = (transcript + interimTranscript).trim();
    
    if (finalText.length < 5) {
      setOrbState('idle');
      setAiResponse("I didn't catch that. Please try again.");
      return;
    }
    
    setOrbState('processing');
    
    // Update cumulative metrics
    const words = finalText.split(/\s+/).filter(w => w.length > 0).length;
    const fillers = countFillers(finalText);
    const currentQ = questions[currentQIndex];
    const score = calculateScore(finalText, currentQ);
    
    setTotalWords(prev => prev + words);
    setTotalFillers(prev => prev + fillers);
    setTotalScore(prev => prev + score);
    
    // Save response
    setResponses(prev => [...prev, {
      question: currentQ.question,
      transcript: finalText,
      duration: 0,
      score
    }]);
    
    // Get AI response
    const aiReply = await getAIResponse(finalText, currentQ);
    setAiResponse(aiReply);
    
    // Check if we should move to next question or continue conversation
    const isFollowUp = aiReply.includes('?') && currentQIndex < questions.length - 1;
    
    if (!isFollowUp && currentQIndex >= questions.length - 1) {
      // End session
      speakText(aiReply);
      setTimeout(() => setPhase('results'), 3000);
    } else if (!isFollowUp) {
      // Move to next question
      speakText(aiReply);
      setTimeout(() => {
        setCurrentQIndex(prev => prev + 1);
        const nextQ = questions[currentQIndex + 1];
        if (nextQ) {
          setAiResponse(nextQ.question);
          speakText(nextQ.question);
        }
      }, 4000);
    } else {
      // Continue conversation on same question
      speakText(aiReply);
    }
  }, [transcript, interimTranscript, questions, currentQIndex, countFillers, calculateScore, stopAudioAnalysis]);

  // Get AI Response
  const getAIResponse = useCallback(async (userMessage: string, question: InterviewQuestion): Promise<string> => {
    const newHistory = [...conversationHistory, { role: 'user', content: userMessage }];
    setConversationHistory(newHistory);
    
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          history: newHistory.slice(-6),
          mode,
          track: userTrack,
          difficulty: userLevel,
          currentQuestion: question.question,
          expectedTopics: question.expectedTopics
        })
      });
      
      const data = await res.json();
      if (data.success && data.message) {
        setConversationHistory(prev => [...prev, { role: 'assistant', content: data.message }]);
        return data.message;
      }
    } catch (err) {
      console.error('AI error:', err);
    }
    
    // Fallback - use a follow-up from the question
    const fallbacks = question.followUps || ["Can you elaborate on that?", "Tell me more about your approach.", "What's your reasoning?"];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }, [conversationHistory, mode, userTrack, userLevel]);

  // Text to Speech
  const speakText = useCallback(async (text: string) => {
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
        audio.onerror = () => {
          fallbackSpeak(text);
        };
        await audio.play();
        return;
      }
    } catch {}
    
    fallbackSpeak(text);
  }, []);

  const fallbackSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.95;
      u.pitch = 1;
      u.onend = () => setOrbState('idle');
      window.speechSynthesis.speak(u);
    } else {
      setOrbState('idle');
    }
  };

  // Restart
  const restart = useCallback(() => {
    setPhase('select');
    setMode(null);
    setQuestions([]);
    setCurrentQIndex(0);
    setResponses([]);
    setTotalWords(0);
    setTotalFillers(0);
    setTotalScore(0);
    setSessionTime(0);
    setTranscript('');
    setInterimTranscript('');
    setAiResponse('');
    setConversationHistory([]);
    setOrbState('idle');
  }, []);

  const avgScore = responses.length > 0 ? Math.round(totalScore / responses.length) : 0;

  // ═══════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#000' }}>
      <style>{`
        @keyframes pulse-ring { 0% { transform: scale(1); opacity: 0.4; } 100% { transform: scale(1.3); opacity: 0; } }
        @keyframes soundwave { 0% { transform: scaleY(0.5); } 100% { transform: scaleY(1); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
      
      {/* Header */}
      <div className="px-6 py-4 flex justify-between items-center" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full" style={{ background: phase === 'interview' ? 'rgba(34,197,94,0.8)' : 'rgba(255,255,255,0.3)', animation: phase === 'interview' ? 'pulse 2s infinite' : 'none' }} />
          <span className="text-xs font-mono tracking-widest" style={{ color: 'rgba(136,136,136,0.5)' }}>
            {phase === 'select' ? 'SELECT MODE' : phase === 'interview' ? `Q${currentQIndex + 1}/${questions.length}` : 'COMPLETE'}
          </span>
        </div>
        <button onClick={onExit} className="text-xs px-4 py-2 rounded-full hover:bg-white/5" style={{ border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}>Exit</button>
      </div>
      
      {/* Content */}
      <div className="flex-1 flex">
        {phase === 'select' && (
          <div className="flex-1 flex items-center justify-center p-8">
            <ModeSelector selectedMode={mode} onSelect={setMode} onStart={startInterview} />
          </div>
        )}
        
        {phase === 'interview' && (
          <>
            {/* Metrics Sidebar */}
            <div className="w-48 p-6" style={{ borderRight: '1px solid rgba(255,255,255,0.04)' }}>
              <LiveMetrics totalWords={totalWords} totalFillers={totalFillers} avgScore={avgScore} questionsAnswered={responses.length} sessionTime={sessionTime} />
            </div>
            
            {/* Main Area */}
            <div className="flex-1 flex flex-col items-center justify-center px-8 relative">
              {/* Question */}
              <div className="absolute top-8 max-w-2xl text-center px-8">
                <p className="text-xs font-mono tracking-widest mb-3" style={{ color: 'rgba(136,136,136,0.4)' }}>{mode?.toUpperCase()}</p>
                <p className="text-lg font-light leading-relaxed" style={{ color: 'rgba(255,255,255,0.9)' }}>{aiResponse}</p>
              </div>
              
              {/* Orb */}
              <Orb state={orbState} audioLevel={audioLevel} />
              
              {/* Error Message */}
              {micError && (
                <div className="absolute bottom-44 px-4 py-2 rounded-lg text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: 'rgba(239,68,68,0.9)' }}>
                  {micError}
                </div>
              )}
              
              {/* Transcript */}
              {(transcript || interimTranscript) && orbState === 'listening' && (
                <div className="absolute bottom-36 max-w-lg text-center p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <p className="text-xs font-mono mb-2" style={{ color: 'rgba(239,68,68,0.6)' }}>● RECORDING</p>
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>
                    {transcript}
                    <span style={{ color: 'rgba(255,255,255,0.4)' }}>{interimTranscript}</span>
                  </p>
                </div>
              )}
              
              {/* Record Button */}
              <div className="absolute bottom-10 flex flex-col items-center gap-3">
                {orbState === 'idle' && (
                  <button 
                    onClick={startRecording} 
                    className="w-16 h-16 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '2px solid rgba(255,255,255,0.2)' }}
                  >
                    <Mic size={22} style={{ color: 'rgba(255,255,255,0.7)' }} />
                  </button>
                )}
                {orbState === 'listening' && (
                  <button 
                    onClick={stopRecording}
                    className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(239,68,68,0.15)', border: '3px solid rgba(239,68,68,0.8)' }}
                  >
                    <Square size={18} fill="rgba(239,68,68,0.9)" style={{ color: 'rgba(239,68,68,0.9)' }} />
                  </button>
                )}
                {(orbState === 'processing' || orbState === 'speaking') && (
                  <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.02)', border: '2px solid rgba(255,255,255,0.1)' }}>
                    <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'transparent' }} />
                  </div>
                )}
                <span className="text-xs font-mono" style={{ color: orbState === 'listening' ? 'rgba(239,68,68,0.8)' : 'rgba(136,136,136,0.4)' }}>
                  {orbState === 'idle' && 'TAP TO SPEAK'}
                  {orbState === 'listening' && 'TAP TO SEND'}
                  {orbState === 'processing' && 'ANALYZING...'}
                  {orbState === 'speaking' && 'LISTENING...'}
                </span>
              </div>
            </div>
          </>
        )}
        
        {phase === 'results' && (
          <div className="flex-1 flex items-center justify-center p-8">
            <ResultsView responses={responses} totalWords={totalWords} totalFillers={totalFillers} sessionTime={sessionTime} onRestart={restart} onExit={onExit} />
          </div>
        )}
      </div>
    </div>
  );
});

ArenaView.displayName = 'ArenaView';
export default ArenaView;
