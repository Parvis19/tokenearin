import React, { useState } from 'react';
import { Users, Copy, Share2, Info, MessageCircle, Send, Gift, Zap, Rocket, CheckCircle, Loader2 } from 'lucide-react';
import { UserData, AppConfig } from '../types';
import { UserService } from '../services/userService';

interface ReferProps {
  userData: UserData;
  config: AppConfig;
  t: any;
}

const SparkleParticles = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    {[...Array(6)].map((_, i) => (
      <div 
        key={i}
        className="absolute w-0.5 h-0.5 bg-amber-300 rounded-full animate-particle"
        style={{
          left: `${Math.random() * 100}%`,
          bottom: '0%',
          animationDelay: `${Math.random() * 2}s`,
          opacity: 0
        }}
      />
    ))}
  </div>
);

const ReferPage: React.FC<ReferProps> = ({ userData, config, t }) => {
  const [inputCode, setInputCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const refLink = `${window.location.origin}/?ref=${userData.referralCode}`;
  
  const copy = (text: string) => { 
    navigator.clipboard.writeText(text); 
    alert("Copied to clipboard!"); 
  };

  const handleRedeem = async () => {
    if (!inputCode.trim()) return;
    setLoading(true);
    setError('');
    try {
      await UserService.redeemReferral(userData.uid, inputCode.trim().toLowerCase());
      alert("Referral code applied! +100 Coins added.");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const shareWhatsApp = () => {
    const message = `Join me on TOKEN EARIN and earn rewards! Use my code: ${userData.referralCode}\nJoin here: ${refLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const shareTelegram = () => {
    const message = `Join me on TOKEN EARIN and earn rewards! Use my code: ${userData.referralCode}`;
    window.open(`https://t.me/share/url?url=${encodeURIComponent(refLink)}&text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="space-y-8 py-6 px-2 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Header Section */}
      <div className="text-center relative">
        <div className="w-24 h-24 bg-gradient-to-tr from-amber-400 to-amber-600 rounded-[2.5rem] mx-auto mb-6 flex items-center justify-center border-2 border-white/20 shadow-[0_0_40px_rgba(245,158,11,0.3)] rotate-6 float-3d relative">
            <SparkleParticles />
            <Users className="w-12 h-12 text-black z-10" />
        </div>
        <h2 className="text-4xl font-black text-white text-glow tracking-tighter uppercase">{t.refer.title}</h2>
        <p className="text-slate-400 text-[10px] mt-2 font-black uppercase tracking-[0.3em] opacity-60">Build your digital empire</p>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-2 gap-4">
        <div className="tile-3d p-5 flex flex-col items-center border-white/10 relative overflow-hidden group">
           <div className="absolute -right-2 -top-2 opacity-5 group-hover:opacity-20 transition-opacity">
              <Users className="w-16 h-16" />
           </div>
           <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-2">{t.refer.network}</p>
           <p className="text-3xl font-black text-white tabular-nums">{userData.referralCount}</p>
           <div className="mt-2 h-1 w-8 bg-amber-500 rounded-full" />
        </div>
        <div className="tile-3d p-5 flex flex-col items-center border-amber-500/20 relative overflow-hidden group">
           <div className="absolute -right-2 -top-2 opacity-5 group-hover:opacity-20 transition-opacity">
              <Gift className="w-16 h-16" />
           </div>
           <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-2">{t.refer.earnings}</p>
           <p className="text-3xl font-black text-amber-500 tabular-nums">{userData.referralEarnings}</p>
           <div className="mt-2 h-1 w-8 bg-white/20 rounded-full" />
        </div>
      </div>

      {/* Invitation Card */}
      <div className="tile-3d p-6 space-y-6 border-white/10 bg-slate-900/40">
        <div className="flex items-center gap-3 mb-2">
           <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
              <Zap className="w-5 h-5 text-amber-500" />
           </div>
           <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-white">Your Invite Code</h3>
              <p className="text-[8px] text-slate-500 font-bold uppercase">Share your username to earn rewards</p>
           </div>
        </div>

        <div className="flex bg-black/60 p-4 rounded-2xl border border-white/5 items-center justify-between shadow-inner group">
           <span className="text-lg font-black text-amber-500 tracking-widest uppercase mr-4">{userData.referralCode}</span>
           <button 
              onClick={() => copy(userData.referralCode)} 
              className="p-3 bg-amber-500 rounded-xl text-black active:scale-90 transition-all shadow-lg"
           >
              <Copy className="w-4 h-4" />
           </button>
        </div>

        {/* Redeem Invitation Code Section */}
        {!userData.referredBy ? (
          <div className="pt-4 border-t border-white/5 space-y-3">
             <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest block ml-1">Have an Invite Code?</label>
             <div className="flex gap-2">
                <input 
                   type="text" 
                   value={inputCode}
                   onChange={(e) => setInputCode(e.target.value.toLowerCase())}
                   placeholder="Enter invite code"
                   className="flex-grow bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-amber-500 transition-all font-bold"
                />
                <button 
                   onClick={handleRedeem}
                   disabled={loading || !inputCode}
                   className="bg-amber-500 text-black px-4 rounded-xl font-black text-[10px] uppercase active:scale-95 transition-all disabled:opacity-30"
                >
                   {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
                </button>
             </div>
             {error && <p className="text-[9px] text-red-500 font-bold uppercase text-center">{error}</p>}
          </div>
        ) : (
          <div className="pt-4 border-t border-white/5 flex items-center justify-center gap-2">
             <CheckCircle className="w-4 h-4 text-emerald-500" />
             <span className="text-[10px] font-black text-slate-500 uppercase">Invitation Claimed: {userData.referredBy}</span>
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={shareWhatsApp}
            className="flex items-center justify-center gap-2 bg-emerald-600/20 border border-emerald-500/30 py-4 rounded-2xl text-emerald-400 text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all"
          >
            <MessageCircle className="w-4 h-4" /> WhatsApp
          </button>
          <button 
            onClick={shareTelegram}
            className="flex items-center justify-center gap-2 bg-sky-600/20 border border-sky-500/30 py-4 rounded-2xl text-sky-400 text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all"
          >
            <Send className="w-4 h-4" /> Telegram
          </button>
        </div>

        <button 
            className="w-full btn-extruded text-lg shadow-[0_20px_40px_-10px_rgba(245,158,11,0.3)]"
            onClick={() => copy(refLink)}
        >
            <Share2 className="w-5 h-5" /> Global Invite Link
        </button>
      </div>

      {/* How it Works Section */}
      <div className="space-y-4">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 px-2">How it Works</h3>
        <div className="space-y-3">
           {[
             { step: 1, icon: Copy, title: "Share Code", desc: "Your username is your unique invite code." },
             { step: 2, icon: Share2, title: "Friends Join", desc: "Invite friends to enter your code on this page." },
             { step: 3, icon: Rocket, title: "Double Rewards", desc: "Both you and your friend get bonus coins!" }
           ].map((item, idx) => (
             <div key={idx} className="glass-card p-4 rounded-2xl border-white/5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-amber-500 font-black text-xs border border-white/10">
                   {item.step}
                </div>
                <div className="flex-grow">
                   <p className="text-xs font-black text-white uppercase tracking-wider">{item.title}</p>
                   <p className="text-[9px] text-slate-500 font-bold leading-none mt-1">{item.desc}</p>
                </div>
                <item.icon className="w-4 h-4 text-slate-700" />
             </div>
           ))}
        </div>
      </div>

      <div className="bg-amber-500/5 border border-amber-500/10 p-5 rounded-2xl flex gap-4 items-start relative overflow-hidden">
         <div className="absolute -right-4 -top-4 w-12 h-12 bg-amber-500/5 blur-xl rounded-full" />
         <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
         <p className="text-[10px] text-slate-400 font-bold leading-relaxed uppercase tracking-wide">
            Network Integrity Policy: Fake or bot referrals will result in <span className="text-red-500">permanent ban</span> and balance reset.
         </p>
      </div>
    </div>
  );
};

export default ReferPage;