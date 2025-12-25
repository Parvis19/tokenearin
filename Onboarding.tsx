import React, { useState } from 'react';
import { Gift, Loader2, Sparkles } from 'lucide-react';
import { UserService } from '../services/userService';
import { auth } from '../services/firebase';

interface OnboardingProps {
  onComplete: () => void;
  t: any;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete, t }) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleNameChange = (val: string) => {
    const cleaned = val.toLowerCase().replace(/[^a-z0-9]/g, '');
    setName(cleaned);
  };

  const handleSubmit = async () => {
    if (name.length < 3) return setError("Min 3 characters");
    setLoading(true);
    setError('');
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const ref = urlParams.get('ref') || localStorage.getItem('referralCode');
      
      await UserService.createProfile(auth.currentUser!, name, ref);
      onComplete();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-slate-900 text-center">
      <div className="w-28 h-28 bg-amber-500/10 rounded-full flex items-center justify-center mb-8 border-2 border-amber-500/20 animate-bounce">
        <Sparkles className="w-14 h-14 text-amber-500" />
      </div>
      
      <h1 className="text-4xl font-black mb-4 tracking-tighter uppercase">{t.onboarding.title}</h1>
      <p className="text-slate-400 mb-10 max-w-xs font-medium italic">{t.onboarding.desc}</p>

      <div className="w-full max-w-sm tile-3d p-8 rounded-3xl border-white/5">
        <input 
          type="text" 
          value={name} 
          onChange={e => handleNameChange(e.target.value)}
          placeholder={t.onboarding.placeholder}
          className="w-full p-5 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/20 text-center text-xl font-black tracking-widest text-amber-500 outline-none focus:border-amber-500 transition-all mb-6 uppercase shadow-[inset_0_1px_4px_rgba(255,255,255,0.05)] placeholder:text-slate-700"
        />

        {error && <p className="text-red-500 text-[10px] font-black mb-6 uppercase tracking-widest animate-pulse">{error}</p>}

        <button 
          onClick={handleSubmit} disabled={loading}
          className="w-full btn-extruded text-xl"
        >
          {loading ? <Loader2 className="animate-spin mx-auto" /> : t.onboarding.btn}
        </button>
      </div>
    </div>
  );
};

export default Onboarding;