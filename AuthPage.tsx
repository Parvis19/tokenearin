import React, { useState } from 'react';
import { Mail, Lock, Loader2, ArrowRight, Gift, ChevronLeft, Send, Eye, EyeOff } from 'lucide-react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  sendPasswordResetEmail 
} from 'firebase/auth';
import { auth } from '../services/firebase';

type AuthMode = 'login' | 'signup' | 'reset';

interface AuthProps {
  t: any;
}

const AuthPage: React.FC<AuthProps> = ({ t }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogle = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (e: any) {
      setError(e.message);
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    const cleanEmail = email.trim().toLowerCase();
    try {
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, cleanEmail, password);
      } else if (mode === 'signup') {
        await createUserWithEmailAndPassword(auth, cleanEmail, password);
      } else if (mode === 'reset') {
        await sendPasswordResetEmail(auth, cleanEmail);
        setSuccess('Reset link sent! Check your inbox.');
        setLoading(false);
      }
    } catch (e: any) {
      if (e.code === 'auth/email-already-in-use') {
        setError('Email already in use. Please log in.');
      } else if (e.code === 'auth/wrong-password' || e.code === 'auth/user-not-found' || e.code === 'auth/invalid-credential') {
        setError('Invalid email or password');
      } else {
        setError(e.message);
      }
      setLoading(false);
    }
  };

  const toggleMode = (newMode: AuthMode) => {
    setMode(newMode);
    setError('');
    setSuccess('');
    setShowPassword(false);
  };

  const handleEmailChange = (val: string) => {
    const cleaned = val.replace(/[^a-zA-Z0-9@._+-]/g, '').toLowerCase();
    setEmail(cleaned);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-950 relative overflow-hidden">
      <div className="absolute top-0 w-full h-1/2 bg-gradient-to-b from-amber-500/10 to-transparent pointer-events-none" />
      
      <div className="w-24 h-24 bg-amber-500/20 rounded-[2rem] flex items-center justify-center mb-8 float-3d border-2 border-amber-500/40 shadow-[0_0_30px_rgba(245,158,11,0.3)] animate-scale-up-subtle">
        <Gift className="w-12 h-12 text-amber-500" />
      </div>

      <h1 className="text-4xl font-black text-white mb-2 tracking-tighter text-center uppercase text-glow animate-fade-in-up">TOKEN EARIN</h1>
      <p className="text-slate-400 text-sm mb-10 font-medium text-center italic animate-fade-in-up" style={{ animationDelay: '0.1s' }}>{t.auth.slogan}</p>

      <div key={mode} className="w-full max-w-sm tile-3d p-8 space-y-6 animate-scale-up-subtle transition-all duration-500">
        {mode === 'reset' ? (
          <div className="flex items-center gap-2 mb-2 animate-fade-in-up">
            <button onClick={() => toggleMode('login')} className="p-2 hover:bg-white/5 rounded-full transition-colors">
              <ChevronLeft className="w-5 h-5 text-amber-500" />
            </button>
            <h2 className="text-lg font-black uppercase text-white tracking-widest">{t.auth.reset}</h2>
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in-up">
            <button 
              onClick={handleGoogle}
              className="w-full bg-white text-slate-900 font-black py-4 rounded-2xl flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all hover:shadow-2xl"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
              {t.auth.google}
            </button>

            <div className="flex items-center gap-3 text-slate-500 text-[10px] font-black tracking-widest uppercase">
              <div className="h-px flex-grow bg-white/10" />
              {t.auth.secure}
              <div className="h-px flex-grow bg-white/10" />
            </div>
          </div>
        )}

        <form onSubmit={handleEmailAuth} className="space-y-4">
          <div className="relative group animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <Mail className="absolute left-4 top-4 w-5 h-5 text-slate-500 group-focus-within:text-amber-500 transition-colors" />
            <input 
              type="email" 
              required 
              value={email} 
              onChange={e => handleEmailChange(e.target.value)}
              placeholder="Email Address" 
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/20 text-white outline-none focus:border-amber-500 focus:scale-[1.02] focus:bg-white/10 transition-all font-bold placeholder:text-slate-600 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]"
            />
          </div>
          
          {mode !== 'reset' && (
            <div className="space-y-2 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <div className="relative group">
                <Lock className="absolute left-4 top-4 w-5 h-5 text-slate-500 group-focus-within:text-amber-500 transition-colors" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  required value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Secure Password" 
                  className="w-full pl-12 pr-12 py-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/20 text-white outline-none focus:border-amber-500 focus:scale-[1.02] focus:bg-white/10 transition-all font-bold placeholder:text-slate-600 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-amber-500 transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {mode === 'login' && (
                <div className="flex justify-end px-1">
                  <button 
                    type="button"
                    onClick={() => toggleMode('reset')}
                    className="text-[10px] font-black text-amber-500/80 uppercase tracking-widest hover:text-amber-500 hover:underline transition-all"
                  >
                    {t.auth.forgot}
                  </button>
                </div>
              )}
            </div>
          )}

          {error && (
             <p className="text-[10px] text-red-500 font-black uppercase text-center px-2 animate-bounce">{error}</p>
          )}

          {success && (
             <p className="text-[10px] text-emerald-500 font-black uppercase text-center px-2 animate-pulse">{success}</p>
          )}

          <button 
            type="submit" disabled={loading}
            className="w-full btn-extruded text-lg mt-4 group overflow-hidden"
          >
            {loading ? <Loader2 className="animate-spin" /> : (
              <span className="flex items-center gap-2 group-hover:scale-110 transition-transform">
                {mode === 'login' ? t.auth.login : 
                 mode === 'signup' ? t.auth.signup : 
                 t.auth.reset}
                {mode === 'reset' ? <Send className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
              </span>
            )}
          </button>
        </form>

        <div className="text-center pt-2 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          {mode === 'reset' ? (
            <button 
              onClick={() => toggleMode('login')}
              className="text-slate-400 text-xs font-black uppercase tracking-widest hover:text-white transition-colors flex items-center justify-center gap-2 mx-auto active:scale-95"
            >
              <ChevronLeft className="w-4 h-4" /> {t.auth.back}
            </button>
          ) : (
            <p className="text-center text-sm text-slate-400 font-bold">
              {mode === 'login' ? t.auth.new : t.auth.haveAcc}
              <button 
                onClick={() => toggleMode(mode === 'login' ? 'signup' : 'login')}
                className="text-amber-500 font-black ml-2 hover:underline hover:scale-105 transition-transform inline-block"
              >
                {mode === 'login' ? t.auth.signup : t.auth.login}
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;