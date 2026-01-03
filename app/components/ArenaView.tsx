'use client';

import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import { Mic, Square, Brain, Zap, Target, Play, RefreshCw, BarChart3, Trophy, Globe } from 'lucide-react';
import { InterviewMode, Language, FILLER_WORDS, MODE_LABELS, UI_LABELS } from '../data/arena';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ArenaProps {
  onExit: () => void;
  userName?: string;
}

export const ArenaView = memo(({ onExit, userName = 'Candidat' }: ArenaProps) => {
  // ═══════════════════════════════════════════════════════════════════════════
  // STATE
  // ═══════════════════════════════════════════════════════════════════════════
  const [phase, setPhase] = useState<'select' | 'interview' | 'results'>('select');
  const [mode, setMode] = useState<InterviewMode | null>(null);
  const [language, setLanguage] = useState<Language>('fr');
  const [currentDisplay, setCurrentDisplay] = useState('');
  const [orbState, setOrbState] = useState<'idle' | 'listening' | 'processing' | 'speaking'>('idle');
  const [audioLevel, setAudioLevel] = useState(0);
  const [micError, setMicError] = useState<string | null>(null);

  const [transcript, setTranscript] = useState('');
  const [interim, setInterim] = useState('');
  const transcriptRef = useRef('');
  const interimRef = useRef('');

  const [totalWords, setTotalWords] = useState(0);
  const [totalFillers, setTotalFillers] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const [startTime, setStartTime] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  const historyRef = useRef<Message[]>([]);
  const recRef = useRef<any>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animRef = useRef<number | null>(null);

  const labels = UI_LABELS[language];
  const modeLabels = MODE_LABELS[language];

  // ═══════════════════════════════════════════════════════════════════════════
  // SYNC REFS
  // ═══════════════════════════════════════════════════════════════════════════
  useEffect(() => { transcriptRef.current = transcript; }, [transcript]);
  useEffect(() => { interimRef.current = interim; }, [interim]);

  // ═══════════════════════════════════════════════════════════════════════════
  // TIMER
  // ═══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    if (phase !== 'interview' || !startTime) return;
    const i = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000);
    return () => clearInterval(i);
  }, [phase, startTime]);

  // ═══════════════════════════════════════════════════════════════════════════
  // SPEECH RECOGNITION - LANGUE DYNAMIQUE
  // ═══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMicError(language === 'fr' ? 'Utilise Chrome' : 'Use Chrome');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    // CRITIQUE : Langue dynamique
    recognition.lang = language === 'en' ? 'en-US' : 'fr-FR';

    recognition.onresult = (e: any) => {
      let finalText = '';
      let interimText = '';

      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) {
          finalText += t + ' ';
        } else {
          interimText = t;
        }
      }

      if (finalText) {
        setTranscript(prev => {
          const newVal = prev + finalText;
          transcriptRef.current = newVal;
          return newVal;
        });
      }
      setInterim(interimText);
      interimRef.current = interimText;
    };

    recognition.onerror = (e: any) => {
      console.error('[Speech Error]', e.error);
      if (e.error === 'not-allowed') setMicError(language === 'fr' ? 'Autorise le micro' : 'Allow microphone');
      if (e.error !== 'no-speech') setOrbState('idle');
    };

    recRef.current = recognition;

    return () => { try { recognition.stop(); } catch {} };
  }, [language]);

  // ═══════════════════════════════════════════════════════════════════════════
  // AUDIO VISUALIZATION
  // ═══════════════════════════════════════════════════════════════════════════
  const startAudio = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      audioCtxRef.current = new AudioContext();
      const analyser = audioCtxRef.current.createAnalyser();
      audioCtxRef.current.createMediaStreamSource(stream).connect(analyser);
      analyser.fftSize = 128;
      const data = new Uint8Array(analyser.frequencyBinCount);

      const update = () => {
        analyser.getByteFrequencyData(data);
        setAudioLevel(data.reduce((a, b) => a + b, 0) / data.length / 255);
        animRef.current = requestAnimationFrame(update);
      };
      update();
    } catch {
      setMicError(language === 'fr' ? 'Erreur micro' : 'Mic error');
    }
  }, [language]);

  const stopAudio = useCallback(() => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    if (audioCtxRef.current) audioCtxRef.current.close().catch(() => {});
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    audioCtxRef.current = null;
    streamRef.current = null;
    setAudioLevel(0);
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // TEXT TO SPEECH
  // ═══════════════════════════════════════════════════════════════════════════
  const speak = useCallback((text: string): Promise<void> => {
    return new Promise(async (resolve) => {
      setOrbState('speaking');

      try {
        const res = await fetch('/api/voice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, language })
        });

        if (res.ok) {
          const blob = await res.blob();
          const audio = new Audio(URL.createObjectURL(blob));
          audio.onended = () => { setOrbState('idle'); resolve(); };
          audio.onerror = () => fallbackSpeak(text, resolve);
          await audio.play();
          return;
        }
      } catch {}

      fallbackSpeak(text, resolve);
    });
  }, [language]);

  const fallbackSpeak = (text: string, resolve: () => void) => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = language === 'en' ? 'en-US' : 'fr-FR';
      u.rate = 1;
      u.onend = () => { setOrbState('idle'); resolve(); };
      u.onerror = () => { setOrbState('idle'); resolve(); };
      speechSynthesis.speak(u);
    } else {
      setOrbState('idle');
      resolve();
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // COUNT FILLERS
  // ═══════════════════════════════════════════════════════════════════════════
  const countFillers = useCallback((text: string): number => {
    let count = 0;
    const fillers = FILLER_WORDS[language];
    fillers.forEach(f => {
      const matches = text.toLowerCase().match(new RegExp(`\\b${f}\\b`, 'g'));
      if (matches) count += matches.length;
    });
    return count;
  }, [language]);

  // ═══════════════════════════════════════════════════════════════════════════
  // HANDLE RESPONSE
  // ═══════════════════════════════════════════════════════════════════════════
  const handleResponse = useCallback(async (textPayload: string) => {
    console.log('[SENDING TO OPENAI]:', textPayload);
    setOrbState('processing');

    if (textPayload.length > 0 && textPayload !== '[silence]') {
      const words = textPayload.split(/\s+/).filter(w => w.length > 0).length;
      setTotalWords(prev => prev + words);
      setTotalFillers(prev => prev + countFillers(textPayload));
    }

    const newHistory: Message[] = [...historyRef.current, { role: 'user', content: textPayload }];
    historyRef.current = newHistory;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newHistory, mode, userName, language })
      });

      const data = await res.json();

      if (data.success && data.reply) {
        historyRef.current = [...newHistory, { role: 'assistant', content: data.reply }];
        if (data.score) setScores(prev => [...prev, data.score]);
        setCurrentDisplay(data.reply);
        await speak(data.reply);
        if (data.isEnding) setTimeout(() => setPhase('results'), 2000);
      } else {
        throw new Error(data.error || 'API error');
      }
    } catch (err) {
      console.error('[handleResponse Error]', err);
      const errorMsg = language === 'fr' 
        ? "Désolé, j'ai eu une micro-coupure. Peux-tu reformuler ?"
        : "Sorry, I had a brief connection issue. Can you rephrase?";
      setCurrentDisplay(errorMsg);
      await speak(errorMsg);
    }
  }, [mode, userName, language, speak, countFillers]);

  // ═══════════════════════════════════════════════════════════════════════════
  // START INTERVIEW
  // ═══════════════════════════════════════════════════════════════════════════
  const startInterview = useCallback(async () => {
    if (!mode) return;

    setPhase('interview');
    setStartTime(Date.now());
    setTotalWords(0);
    setTotalFillers(0);
    setScores([]);
    historyRef.current = [];
    setOrbState('processing');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [], mode, userName, language, isStart: true })
      });

      const data = await res.json();

      if (data.success && data.reply) {
        historyRef.current = [{ role: 'assistant', content: data.reply }];
        setCurrentDisplay(data.reply);
        await speak(data.reply);
      }
    } catch (err) {
      console.error('[startInterview Error]', err);
      setCurrentDisplay(language === 'fr' ? "Erreur de connexion." : "Connection error.");
      setOrbState('idle');
    }
  }, [mode, userName, language, speak]);

  // ═══════════════════════════════════════════════════════════════════════════
  // RECORDING
  // ═══════════════════════════════════════════════════════════════════════════
  const startRec = useCallback(() => {
    if (!recRef.current || orbState !== 'idle') return;
    setTranscript(''); setInterim('');
    transcriptRef.current = ''; interimRef.current = '';
    setMicError(null);

    try {
      recRef.current.start();
      setOrbState('listening');
      startAudio();
    } catch {
      try { recRef.current.stop(); } catch {}
      setTimeout(() => {
        try { recRef.current.start(); setOrbState('listening'); startAudio(); } catch {}
      }, 200);
    }
  }, [orbState, startAudio]);

  const stopRec = useCallback(async () => {
    try { recRef.current?.stop(); } catch {}
    stopAudio();
    await new Promise(r => setTimeout(r, 300));
    const finalText = (transcriptRef.current + interimRef.current).trim();
    setTranscript(''); setInterim('');
    transcriptRef.current = ''; interimRef.current = '';
    await handleResponse(finalText.length > 0 ? finalText : "[silence]");
  }, [stopAudio, handleResponse]);

  // ═══════════════════════════════════════════════════════════════════════════
  // RESTART
  // ═══════════════════════════════════════════════════════════════════════════
  const restart = useCallback(() => {
    setPhase('select');
    setMode(null);
    historyRef.current = [];
    setCurrentDisplay('');
    setOrbState('idle');
    setTranscript(''); setInterim('');
    transcriptRef.current = ''; interimRef.current = '';
    if ('speechSynthesis' in window) speechSynthesis.cancel();
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // COMPUTED
  // ═══════════════════════════════════════════════════════════════════════════
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const wpm = elapsed > 10 ? Math.round((totalWords / elapsed) * 60) : 0;
  const questionCount = historyRef.current.filter(m => m.role === 'assistant').length;

  // ═══════════════════════════════════════════════════════════════════════════
  // ORB
  // ═══════════════════════════════════════════════════════════════════════════
  const Orb = () => {
    const colors: Record<string, { m: string; g: string }> = {
      idle: { m: 'rgba(255,255,255,0.6)', g: 'rgba(255,255,255,0.15)' },
      listening: { m: 'rgba(239,68,68,0.9)', g: 'rgba(239,68,68,0.3)' },
      processing: { m: 'rgba(255,215,0,0.9)', g: 'rgba(255,215,0,0.3)' },
      speaking: { m: 'rgba(59,130,246,0.9)', g: 'rgba(59,130,246,0.3)' }
    };
    const c = colors[orbState];

    return (
      <div className="relative flex items-center justify-center" style={{ width: 160, height: 160 }}>
        {[1, 2, 3].map(r => (
          <div key={r} className="absolute rounded-full" style={{
            width: 40 + r * 35, height: 40 + r * 35,
            border: `1px solid ${c.g}`,
            opacity: orbState !== 'idle' ? 0.4 / r : 0.1 / r
          }} />
        ))}
        {orbState === 'listening' && (
          <div className="absolute flex gap-0.5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="w-1 rounded bg-red-500" style={{ height: 8 + audioLevel * 40 + Math.random() * 10 }} />
            ))}
          </div>
        )}
        {orbState === 'speaking' && (
          <div className="absolute flex gap-0.5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="w-1 rounded bg-blue-500" style={{ height: 10 + Math.sin(Date.now() / 150 + i) * 15 }} />
            ))}
          </div>
        )}
        {orbState === 'processing' && (
          <div className="absolute w-12 h-12 rounded-full border-2 border-transparent border-t-yellow-500 animate-spin" />
        )}
        <div className="rounded-full" style={{
          width: 60, height: 60,
          transform: orbState === 'listening' ? `scale(${1 + audioLevel * 0.2})` : 'scale(1)',
          background: `radial-gradient(circle at 30% 30%, ${c.m}, rgba(0,0,0,0.9))`,
          boxShadow: `0 0 30px ${c.g}`
        }} />
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen flex flex-col bg-black">
      {/* Header */}
      <div className="px-5 py-3 flex justify-between items-center border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: phase === 'interview' ? '#22c55e' : '#444' }} />
          <span className="text-xs font-mono text-gray-500">
            {phase === 'interview' ? `${Math.floor(elapsed / 60)}:${String(elapsed % 60).padStart(2, '0')}` : phase.toUpperCase()}
          </span>
          {phase === 'interview' && questionCount > 0 && (
            <span className="text-xs text-gray-600 ml-2">• Q{questionCount}</span>
          )}
        </div>
        <button onClick={onExit} className="text-xs px-3 py-1.5 rounded-full border border-white/10 text-gray-500 hover:bg-white/5">
          {labels.exit}
        </button>
      </div>

      {/* SELECT */}
      {phase === 'select' && (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md mx-auto">
            {/* Language Selector */}
            <div className="flex justify-center gap-2 mb-6">
              <button
                onClick={() => setLanguage('fr')}
                className={`px-4 py-2 rounded-full text-sm flex items-center gap-2 transition-all ${
                  language === 'fr' ? 'bg-white text-black' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                🇫🇷 Français
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-4 py-2 rounded-full text-sm flex items-center gap-2 transition-all ${
                  language === 'en' ? 'bg-white text-black' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                🇬🇧 English
              </button>
            </div>

            <h2 className="text-xl font-light text-white text-center mb-2">{labels.title}</h2>
            <p className="text-sm text-gray-500 text-center mb-6">{labels.subtitle}</p>

            <div className="grid grid-cols-2 gap-3 mb-3">
              {(['technical', 'behavioral', 'stress', 'case-study'] as InterviewMode[]).map(m => (
                <button key={m} onClick={() => setMode(m)} className="p-4 rounded-xl text-left transition-all hover:scale-[1.02]" style={{
                  background: mode === m ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.02)',
                  border: mode === m ? '2px solid #3b82f6' : '1px solid rgba(255,255,255,0.08)'
                }}>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 rounded flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.3)', color: '#3b82f6' }}>
                      {m === 'technical' && <Brain size={18} />}
                      {m === 'behavioral' && <Target size={18} />}
                      {m === 'stress' && <Zap size={18} />}
                      {m === 'case-study' && <BarChart3 size={18} />}
                    </div>
                    <span className="font-medium" style={{ color: mode === m ? '#3b82f6' : '#ccc' }}>
                      {modeLabels[m].name}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 ml-10">{modeLabels[m].desc}</p>
                </button>
              ))}
            </div>

            {/* Ultimate Mode - Special */}
            <button onClick={() => setMode('ultimate')} className="w-full p-4 rounded-xl text-left mb-5 transition-all hover:scale-[1.01]" style={{
              background: mode === 'ultimate' ? 'linear-gradient(135deg, rgba(255,215,0,0.2), rgba(255,140,0,0.2))' : 'rgba(255,255,255,0.02)',
              border: mode === 'ultimate' ? '2px solid #ffd700' : '1px solid rgba(255,255,255,0.08)'
            }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(255,215,0,0.4), rgba(255,140,0,0.4))', color: '#ffd700' }}>
                  <Trophy size={22} />
                </div>
                <div>
                  <span className="font-semibold" style={{ color: mode === 'ultimate' ? '#ffd700' : '#ccc' }}>
                    {modeLabels.ultimate.name}
                  </span>
                  <p className="text-xs text-gray-500">{modeLabels.ultimate.desc}</p>
                </div>
                <span className="ml-auto text-xs px-2 py-1 rounded-full" style={{ background: 'rgba(255,215,0,0.2)', color: '#ffd700' }}>
                  {language === 'fr' ? 'DIFFICILE' : 'HARD'}
                </span>
              </div>
            </button>

            <button onClick={startInterview} disabled={!mode} className="w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 bg-white text-black disabled:opacity-40 hover:scale-[1.01] transition-transform">
              <Play size={16} /> {labels.start}
            </button>
          </div>
        </div>
      )}

      {/* INTERVIEW */}
      {phase === 'interview' && (
        <div className="flex-1 flex">
          <div className="w-36 p-4 border-r border-white/5 space-y-2">
            <div className="text-[10px] text-gray-600 mb-2">{labels.metrics}</div>
            <div className="p-2 rounded bg-white/5">
              <div className="text-[10px] text-gray-500">{labels.score}</div>
              <div className="text-lg font-light" style={{ color: avgScore >= 70 ? '#22c55e' : avgScore >= 50 ? '#eab308' : '#fff' }}>
                {avgScore || '--'}%
              </div>
            </div>
            <div className="p-2 rounded bg-white/5">
              <div className="text-[10px] text-gray-500">{labels.words}</div>
              <div className="text-base font-mono text-white">{totalWords}</div>
            </div>
            <div className="p-2 rounded" style={{ background: totalFillers > 5 ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.03)' }}>
              <div className="text-[10px] text-gray-500">{labels.fillers}</div>
              <div className="text-base font-mono" style={{ color: totalFillers > 5 ? '#ef4444' : '#22c55e' }}>{totalFillers}</div>
            </div>
            <div className="p-2 rounded bg-white/5">
              <div className="text-[10px] text-gray-500">WPM</div>
              <div className="text-base font-mono text-white">{wpm || '--'}</div>
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center px-6 relative">
            <div className="absolute top-6 max-w-lg text-center px-4">
              <p className="text-[10px] font-mono text-gray-600 mb-2">
                {mode?.toUpperCase()} {questionCount > 0 && `• ${labels.question} ${questionCount}`}
              </p>
              <p className="text-base font-light text-white leading-relaxed">{currentDisplay}</p>
            </div>

            <Orb />

            {micError && (
              <div className="absolute bottom-32 px-3 py-1.5 rounded bg-red-500/10 text-red-400 text-xs">{micError}</div>
            )}

            {(transcript || interim) && orbState === 'listening' && (
              <div className="absolute bottom-28 max-w-sm p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                <p className="text-[10px] text-red-500 mb-1">● REC</p>
                <p className="text-sm text-white">{transcript}<span className="text-gray-500">{interim}</span></p>
              </div>
            )}

            <div className="absolute bottom-6 flex flex-col items-center gap-2">
              {orbState === 'idle' && (
                <button onClick={startRec} className="w-14 h-14 rounded-full flex items-center justify-center bg-white/5 border-2 border-white/20 hover:scale-110 transition">
                  <Mic size={20} className="text-white/70" />
                </button>
              )}
              {orbState === 'listening' && (
                <button onClick={stopRec} className="w-14 h-14 rounded-full flex items-center justify-center bg-red-500/15 border-2 border-red-500 hover:scale-105 transition">
                  <Square size={16} fill="#ef4444" className="text-red-500" />
                </button>
              )}
              {(orbState === 'processing' || orbState === 'speaking') && (
                <div className="w-14 h-14 rounded-full flex items-center justify-center bg-white/5 border border-white/10">
                  <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white/60 animate-spin" />
                </div>
              )}
              <span className="text-[10px] font-mono text-gray-500">
                {orbState === 'idle' && labels.tapToSpeak}
                {orbState === 'listening' && labels.tapToSend}
                {orbState === 'processing' && labels.analyzing}
                {orbState === 'speaking' && labels.listening}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* RESULTS */}
      {phase === 'results' && (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-xs mx-auto text-center">
            <h2 className="text-xl font-light text-white mb-5">{labels.complete}</h2>
            <div className="p-5 rounded-2xl mb-5" style={{ background: avgScore >= 70 ? 'rgba(34,197,94,0.1)' : avgScore >= 50 ? 'rgba(234,179,8,0.1)' : 'rgba(239,68,68,0.1)' }}>
              <div className="text-4xl font-light mb-1" style={{ color: avgScore >= 70 ? '#22c55e' : avgScore >= 50 ? '#eab308' : '#ef4444' }}>
                {avgScore}%
              </div>
              <div className="text-gray-400 text-sm">{labels.avgScore}</div>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-5">
              <div className="p-2 rounded bg-white/5">
                <div className="text-base font-mono text-white">{totalWords}</div>
                <div className="text-[10px] text-gray-500">{labels.words}</div>
              </div>
              <div className="p-2 rounded bg-white/5">
                <div className="text-base font-mono" style={{ color: totalFillers <= 5 ? '#22c55e' : '#ef4444' }}>{totalFillers}</div>
                <div className="text-[10px] text-gray-500">{labels.fillers}</div>
              </div>
              <div className="p-2 rounded bg-white/5">
                <div className="text-base font-mono text-white">{Math.floor(elapsed / 60)}m</div>
                <div className="text-[10px] text-gray-500">{labels.duration}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={onExit} className="py-2.5 rounded-lg border border-white/15 text-gray-400 text-sm hover:bg-white/5">{labels.exit}</button>
              <button onClick={restart} className="py-2.5 rounded-lg bg-white text-black text-sm flex items-center justify-center gap-1 hover:scale-[1.02] transition-transform">
                <RefreshCw size={12} /> {labels.restart}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

ArenaView.displayName = 'ArenaView';
export default ArenaView;
