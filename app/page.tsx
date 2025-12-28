"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, MicOff, ChevronRight, ChevronLeft, Unlock,
  CheckCircle2, XCircle, TrendingUp, Loader2, CreditCard, 
  Shield, Zap, Eye, EyeOff, LogOut, Star, Calculator,
  LineChart, ArrowRight, Award
} from 'lucide-react';
import { 
  loginWithEmail, 
  signupWithEmail, 
  loginWithGoogle, 
  resetPassword, 
  logout, 
  onAuthChange 
} from '@/lib/firebase';
import modules from '@/content/modules.json';

// ═══════════════════════════════════════════════════════════════════════════
// FINA V-REAL — FULLSTACK PRODUCTION
// ═══════════════════════════════════════════════════════════════════════════

export default function FinaApp() {
  // Auth State
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  
  // App State
  const [view, setView] = useState<'landing' | 'arena' | 'academy'>('landing');
  const [showPricing, setShowPricing] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  
  // Arena State
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<{role: string, content: string}[]>([]);
  const [currentResponse, setCurrentResponse] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // Academy State
  const [selectedModule, setSelectedModule] = useState<number | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<number>(0);
  const [quizMode, setQuizMode] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);

  // Auth listener
  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      setUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Auth handlers
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      if (authMode === 'login') {
        await loginWithEmail(email, password);
      } else if (authMode === 'signup') {
        await signupWithEmail(email, password);
      } else {
        await resetPassword(email);
        setAuthError('Reset email sent!');
        return;
      }
      setShowAuth(false);
      setEmail('');
      setPassword('');
    } catch (error: any) {
      setAuthError(error.message);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      await loginWithGoogle();
      setShowAuth(false);
    } catch (error: any) {
      setAuthError(error.message);
    }
  };

  // Chat with AI
  const sendMessage = async (text: string) => {
    setIsThinking(true);
    const newMessages = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: messages }),
      });
      const data = await res.json();
      
      if (data.success) {
        setMessages([...newMessages, { role: 'assistant', content: data.message }]);
        setCurrentResponse(data.message);
        speakText(data.message);
      }
    } catch (error) {
      console.error('Chat error:', error);
    }
    setIsThinking(false);
  };

  // ElevenLabs Voice
  const speakText = async (text: string) => {
    setIsSpeaking(true);
    try {
      const res = await fetch('/api/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const audioBlob = await res.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.onended = () => setIsSpeaking(false);
      audio.play();
    } catch (error) {
      console.error('Voice error:', error);
      setIsSpeaking(false);
    }
  };

  // Speech Recognition
  const toggleListening = () => {
    if (!isListening) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.onresult = (event: any) => {
          const text = event.results[0][0].transcript;
          sendMessage(text);
          setIsListening(false);
        };
        recognition.onerror = () => setIsListening(false);
        recognition.start();
        setIsListening(true);
      }
    }
  };

  // Stripe Checkout
  const handleCheckout = async (planId: string) => {
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, userEmail: user?.email }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // COMPONENTS
  // ═══════════════════════════════════════════════════════════════════════════

  // Logo Component
  const Logo = () => (
    <div className="flex items-center gap-3">
      <svg width="36" height="36" viewBox="0 0 100 100">
        <rect width="100" height="100" rx="20" fill="#000"/>
        <rect x="4" y="4" width="92" height="92" rx="18" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
        <text x="50" y="68" textAnchor="middle" fill="white" fontSize="52" fontWeight="800" fontFamily="system-ui">F</text>
      </svg>
      <span className="text-white text-xl font-extrabold tracking-tight">FINA</span>
    </div>
  );

  // Orb Component
  const Orb = ({ isActive }: { isActive: boolean }) => (
    <div className={`relative w-48 h-48 ${isActive ? 'animate-pulse' : ''}`}>
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500/30 via-blue-500/20 to-cyan-500/30 blur-2xl" />
      <div className="absolute inset-4 rounded-full bg-gradient-to-br from-purple-600/40 via-blue-600/30 to-cyan-600/40 blur-xl" />
      <div className="absolute inset-8 rounded-full bg-black/80 backdrop-blur-xl border border-white/10" />
      <div className="absolute inset-0 flex items-center justify-center">
        {isActive ? (
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-1 bg-white/60 rounded-full animate-bounce" style={{
                height: `${Math.random() * 30 + 10}px`,
                animationDelay: `${i * 0.1}s`
              }} />
            ))}
          </div>
        ) : (
          <div className="w-3 h-3 rounded-full bg-white/40" />
        )}
      </div>
    </div>
  );

  // Auth Modal
  const AuthModal = () => (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4">
      <div className="bg-black/90 border border-white/10 rounded-3xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-6">
          {authMode === 'login' ? 'Welcome Back' : authMode === 'signup' ? 'Create Account' : 'Reset Password'}
        </h2>
        
        <form onSubmit={handleAuth} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/30"
          />
          
          {authMode !== 'reset' && (
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/30"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40">
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          )}
          
          {authError && <p className="text-red-400 text-sm">{authError}</p>}
          
          <button type="submit" className="w-full py-3 bg-white text-black font-semibold rounded-xl hover:bg-white/90 transition">
            {authMode === 'login' ? 'Login' : authMode === 'signup' ? 'Sign Up' : 'Send Reset Link'}
          </button>
        </form>
        
        <button onClick={handleGoogleAuth} className="w-full mt-4 py-3 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 transition flex items-center justify-center gap-2">
          <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Continue with Google
        </button>
        
        <div className="mt-6 text-center text-white/40 text-sm">
          {authMode === 'login' ? (
            <>
              <button onClick={() => setAuthMode('reset')} className="hover:text-white">Forgot password?</button>
              <span className="mx-2">·</span>
              <button onClick={() => setAuthMode('signup')} className="hover:text-white">Create account</button>
            </>
          ) : (
            <button onClick={() => setAuthMode('login')} className="hover:text-white">Back to login</button>
          )}
        </div>
        
        <button onClick={() => setShowAuth(false)} className="absolute top-4 right-4 text-white/40 hover:text-white">
          <XCircle size={24} />
        </button>
      </div>
    </div>
  );

  // Pricing Modal
  const PricingModal = () => (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4">
      <div className="bg-black/90 border border-white/10 rounded-3xl p-8 w-full max-w-4xl relative">
        <button onClick={() => setShowPricing(false)} className="absolute top-4 right-4 text-white/40 hover:text-white">
          <XCircle size={24} />
        </button>
        
        <h2 className="text-3xl font-bold text-white text-center mb-2">Choose Your Plan</h2>
        <p className="text-white/60 text-center mb-8">Invest in your future</p>
        
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { id: 'starter', name: 'Starter', price: 19, features: ['5 AI sessions/month', 'Basic modules', 'Email support'] },
            { id: 'pro', name: 'Professional', price: 49, features: ['Unlimited AI sessions', 'All modules', 'Priority support', 'Mock interviews'], popular: true },
            { id: 'elite', name: 'Elite', price: 99, features: ['Everything in Pro', '1-on-1 coaching', 'Resume review', 'Job placement'] },
          ].map((plan) => (
            <div key={plan.id} className={`relative rounded-2xl p-6 ${plan.popular ? 'bg-white/10 border-2 border-white/30' : 'bg-white/5 border border-white/10'}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-white text-black text-xs font-bold rounded-full">
                  POPULAR
                </div>
              )}
              <h3 className="text-xl font-bold text-white">{plan.name}</h3>
              <div className="mt-4 mb-6">
                <span className="text-4xl font-bold text-white">€{plan.price}</span>
                <span className="text-white/40">/month</span>
              </div>
              <ul className="space-y-3 mb-6">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-white/70">
                    <CheckCircle2 size={16} className="text-green-400" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleCheckout(plan.id)}
                className={`w-full py-3 rounded-xl font-semibold transition ${plan.popular ? 'bg-white text-black hover:bg-white/90' : 'bg-white/10 text-white hover:bg-white/20'}`}
              >
                Get Started
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // VIEWS
  // ═══════════════════════════════════════════════════════════════════════════

  // Landing View
  const LandingView = () => (
    <div className="min-h-screen bg-black text-white">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-40 px-6 py-4 flex justify-between items-center border-b border-white/5 bg-black/80 backdrop-blur-xl">
        <Logo />
        <div className="flex gap-4">
          {user ? (
            <>
              <button onClick={() => setView('arena')} className="px-4 py-2 text-white/70 hover:text-white transition">Arena</button>
              <button onClick={() => setView('academy')} className="px-4 py-2 text-white/70 hover:text-white transition">Academy</button>
              <button onClick={logout} className="px-4 py-2 text-white/40 hover:text-white transition flex items-center gap-2">
                <LogOut size={16} /> Logout
              </button>
            </>
          ) : (
            <button onClick={() => setShowAuth(true)} className="px-6 py-2 bg-white text-black font-semibold rounded-full hover:bg-white/90 transition">
              Get Started
            </button>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6 pt-20">
        <div className="text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-8">
            <Star size={14} className="text-yellow-400" />
            <span className="text-sm text-white/60">Trusted by 500+ candidates at top firms</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Master Finance.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400">
              Dominate Interviews.
            </span>
          </h1>
          
          <p className="text-xl text-white/60 mb-12 max-w-2xl mx-auto">
            AI-powered interview preparation for Goldman Sachs, Morgan Stanley, JP Morgan, and top hedge funds.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => user ? setView('arena') : setShowAuth(true)}
              className="px-8 py-4 bg-white text-black font-semibold rounded-full hover:bg-white/90 transition flex items-center justify-center gap-2"
            >
              Start Training <ArrowRight size={20} />
            </button>
            <button
              onClick={() => setShowPricing(true)}
              className="px-8 py-4 bg-white/5 border border-white/10 text-white font-semibold rounded-full hover:bg-white/10 transition"
            >
              View Pricing
            </button>
          </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 mt-24">
          {[
            { value: '94%', label: 'Success Rate' },
            { value: '€125K', label: 'Avg. Salary' },
            { value: '500+', label: 'Placements' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-4xl font-bold text-white">{stat.value}</div>
              <div className="text-white/40">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );

  // Arena View
  const ArenaView = () => (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Nav */}
      <nav className="px-6 py-4 flex justify-between items-center border-b border-white/5">
        <Logo />
        <div className="flex gap-4">
          <button onClick={() => setView('landing')} className="px-4 py-2 text-white/40 hover:text-white transition">Home</button>
          <button onClick={() => setView('academy')} className="px-4 py-2 text-white/70 hover:text-white transition">Academy</button>
        </div>
      </nav>

      {/* Arena Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <Orb isActive={isListening || isSpeaking} />
        
        <div className="mt-8 text-center max-w-xl">
          {isThinking ? (
            <div className="flex items-center justify-center gap-2 text-white/60">
              <Loader2 className="animate-spin" size={20} />
              Thinking...
            </div>
          ) : currentResponse ? (
            <p className="text-lg text-white/80">{currentResponse}</p>
          ) : (
            <p className="text-white/40">Click the microphone to start your interview</p>
          )}
        </div>
        
        <button
          onClick={toggleListening}
          disabled={isThinking || isSpeaking}
          className={`mt-8 w-16 h-16 rounded-full flex items-center justify-center transition ${
            isListening 
              ? 'bg-red-500 hover:bg-red-600' 
              : 'bg-white/10 hover:bg-white/20 border border-white/20'
          }`}
        >
          {isListening ? <MicOff size={24} /> : <Mic size={24} />}
        </button>
        
        {/* Quick Actions */}
        <div className="mt-12 flex gap-4">
          <button
            onClick={() => sendMessage("Ask me a technical question about options")}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-white/60 hover:bg-white/10 transition"
          >
            Options Question
          </button>
          <button
            onClick={() => sendMessage("Ask me about Black-Scholes")}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-white/60 hover:bg-white/10 transition"
          >
            Black-Scholes
          </button>
          <button
            onClick={() => sendMessage("Ask me about the Greeks")}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-white/60 hover:bg-white/10 transition"
          >
            The Greeks
          </button>
        </div>
      </div>
    </div>
  );

  // Academy View
  const AcademyView = () => (
    <div className="min-h-screen bg-black text-white">
      {/* Nav */}
      <nav className="px-6 py-4 flex justify-between items-center border-b border-white/5">
        <Logo />
        <div className="flex gap-4">
          <button onClick={() => setView('landing')} className="px-4 py-2 text-white/40 hover:text-white transition">Home</button>
          <button onClick={() => setView('arena')} className="px-4 py-2 text-white/70 hover:text-white transition">Arena</button>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-80 border-r border-white/5 p-6 h-[calc(100vh-65px)] overflow-y-auto">
          <h2 className="text-lg font-semibold mb-4">Modules</h2>
          <div className="space-y-2">
            {modules.modules.map((mod) => (
              <button
                key={mod.id}
                onClick={() => { setSelectedModule(mod.id); setSelectedLesson(0); }}
                className={`w-full text-left px-4 py-3 rounded-xl transition ${
                  selectedModule === mod.id 
                    ? 'bg-white/10 border border-white/20' 
                    : 'hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{mod.icon}</span>
                  <div>
                    <div className="font-medium text-white">{mod.title}</div>
                    <div className="text-sm text-white/40">{mod.subtitle}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-8 h-[calc(100vh-65px)] overflow-y-auto">
          {selectedModule ? (
            <div>
              {(() => {
                const mod = modules.modules.find(m => m.id === selectedModule);
                const lesson = mod?.lessons[selectedLesson];
                
                if (!lesson) {
                  return (
                    <div className="text-center py-20 text-white/40">
                      <p>No lessons available yet for this module.</p>
                      <p className="mt-2">Content coming soon!</p>
                    </div>
                  );
                }
                
                return (
                  <div>
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h1 className="text-3xl font-bold">{lesson.title}</h1>
                        <p className="text-white/40 mt-1">{lesson.duration}</p>
                      </div>
                      <div className="flex gap-2">
                        {selectedLesson > 0 && (
                          <button onClick={() => setSelectedLesson(selectedLesson - 1)} className="p-2 bg-white/5 rounded-lg hover:bg-white/10">
                            <ChevronLeft size={20} />
                          </button>
                        )}
                        {mod && selectedLesson < mod.lessons.length - 1 && (
                          <button onClick={() => setSelectedLesson(selectedLesson + 1)} className="p-2 bg-white/5 rounded-lg hover:bg-white/10">
                            <ChevronRight size={20} />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="prose prose-invert max-w-none">
                      {lesson.content.map((block: any, i: number) => {
                        switch (block.type) {
                          case 'h1': return <h1 key={i} className="text-2xl font-bold mt-8 mb-4">{block.text}</h1>;
                          case 'h2': return <h2 key={i} className="text-xl font-semibold mt-6 mb-3">{block.text}</h2>;
                          case 'p': return <p key={i} className="text-white/70 mb-4">{block.text}</p>;
                          case 'def': return (
                            <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 mb-4">
                              <div className="font-semibold text-white">{block.term}</div>
                              <div className="text-white/60 mt-1">{block.definition}</div>
                            </div>
                          );
                          case 'math': return (
                            <div key={i} className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-white/10 rounded-xl p-4 mb-4">
                              <div className="text-sm text-white/40 mb-1">{block.label}</div>
                              <div className="text-xl font-mono text-white">{block.formula}</div>
                            </div>
                          );
                          default: return null;
                        }
                      })}
                    </div>
                    
                    {/* Quiz */}
                    {lesson.quiz && (
                      <div className="mt-12 border-t border-white/10 pt-8">
                        <h3 className="text-xl font-bold mb-6">Quiz</h3>
                        {lesson.quiz.map((q: any, qi: number) => (
                          <div key={qi} className="mb-6 p-4 bg-white/5 rounded-xl">
                            <p className="font-medium mb-3">{q.q}</p>
                            <div className="space-y-2">
                              {q.opts.map((opt: string, oi: number) => (
                                <button
                                  key={oi}
                                  onClick={() => {
                                    const newAnswers = [...quizAnswers];
                                    newAnswers[qi] = oi;
                                    setQuizAnswers(newAnswers);
                                  }}
                                  className={`w-full text-left px-4 py-2 rounded-lg transition ${
                                    quizAnswers[qi] === oi
                                      ? quizAnswers[qi] === q.correct
                                        ? 'bg-green-500/20 border border-green-500/50'
                                        : 'bg-red-500/20 border border-red-500/50'
                                      : 'bg-white/5 hover:bg-white/10'
                                  }`}
                                >
                                  {opt}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          ) : (
            <div className="text-center py-20 text-white/40">
              Select a module to start learning
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════

  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="animate-spin text-white" size={32} />
      </div>
    );
  }

  return (
    <>
      {view === 'landing' && <LandingView />}
      {view === 'arena' && <ArenaView />}
      {view === 'academy' && <AcademyView />}
      {showAuth && <AuthModal />}
      {showPricing && <PricingModal />}
    </>
  );
}
