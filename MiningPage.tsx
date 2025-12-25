import React, { useState, useEffect } from 'react';
import { Pickaxe, Coins, Loader2, Sparkles } from 'lucide-react';
import { UserData, AppConfig } from '../types';
import { UserService } from '../services/userService';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

interface MiningProps {
  userData: UserData;
  config: AppConfig;
  triggerAd: () => Promise<boolean>;
  t: any;
}

const ParticleContainer = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-full">
      {[...Array(12)].map((_, i) => (
        <div 
          key={i}
          className="absolute w-1 h-1 bg-amber-400 rounded-full animate-particle"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            opacity: 0
          }}
        />
      ))}
    </div>
  );
};

const MiningPage: React.FC<MiningProps> = ({ userData, config, triggerAd, t }) => {
  const [points, setPoints] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isClaimable, setIsClaimable] = useState(false);
  const [loading, setLoading] = useState(false);

  const DURATION = config.miningConfig.miningDuration;
  const RATE = config.miningConfig.basePointsPerHour;
  const PPS = RATE / 3600;

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      const start = userData.miningData.lastMiningStart;
      const elapsed = now - start;
      const capped = Math.min(elapsed, DURATION);
      
      setPoints(capped * PPS);
      setProgress((capped / DURATION) * 100);
      setIsClaimable(elapsed >= DURATION);
    }, 1000);
    return () => clearInterval(interval);
  }, [userData, DURATION, PPS]);

  const handleClaim = async () => {
    setLoading(true);
    try {
      await triggerAd();
      await UserService.updateBalance(userData.uid, userData.balance, points, 'Mining Claim', 'Mining session reward');
      await updateDoc(doc(db, "users", userData.uid), {
        "miningData.lastMiningStart": Math.floor(Date.now() / 1000)
      });
    } catch (e) {
      alert("Claim failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12 py-10 px-2 flex flex-col items-center">
      {/* 3D Mining Core */}
      <div className="relative group">
        <div className="absolute inset-0 bg-amber-500/20 blur-[100px] animate-pulse" />
        <div className="tile-3d w-64 h-64 rounded-full flex flex-col items-center justify-center border-4 border-white/10 backdrop-blur-3xl shadow-[0_0_80px_rgba(245,158,11,0.2)] float-3d overflow-hidden">
           <ParticleContainer />
           
           <div className="absolute top-6">
             <Sparkles className="w-5 h-5 text-amber-500 animate-spin-slow opacity-40" />
           </div>
           
           <div className="bg-gradient-to-br from-amber-400 to-orange-600 p-6 rounded-full shadow-2xl mb-2 glow-gold z-10">
              <Pickaxe className="w-12 h-12 text-black animate-bounce" />
           </div>
           
           <h1 className="text-4xl font-black text-white tracking-tighter tabular-nums mb-1 z-10">
              {points.toFixed(6)}
           </h1>
           <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest z-10">{t.mining.hash}</span>
        </div>
      </div>

      {/* 3D Progress Cylinder */}
      <div className="w-full tile-3d p-8 border border-white/5 space-y-6 overflow-hidden">
        <div className="flex justify-between items-end">
           <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
              <span className="text-xs font-black uppercase tracking-widest text-slate-400">{t.mining.progress}</span>
           </div>
           <span className="text-2xl font-black text-amber-500">{progress.toFixed(1)}%</span>
        </div>

        <div className="h-10 w-full bg-black/50 rounded-2xl p-1.5 shadow-inner border border-white/5 overflow-hidden">
           <div 
            className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600 rounded-xl transition-all duration-1000 relative shadow-[0_0_20px_rgba(245,158,11,0.5)]" 
            style={{ width: `${progress}%` }}
           >
              <div className="absolute inset-0 bg-white/20 blur-sm opacity-50" />
           </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
           <div className="bg-white/5 p-4 rounded-2xl border border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-8 h-8 bg-amber-500/5 blur-xl" />
              <p className="text-[8px] font-bold text-slate-500 uppercase mb-1">Session Rate</p>
              <p className="font-black text-sm text-amber-500">+{RATE}/hr</p>
           </div>
           <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
              <p className="text-[8px] font-bold text-slate-500 uppercase mb-1">Remaining</p>
              <p className="font-black text-sm text-slate-300">{((DURATION - (points / PPS)) / 3600).toFixed(1)}h</p>
           </div>
        </div>
      </div>

      <button 
        disabled={!isClaimable || loading}
        onClick={handleClaim}
        className={`w-full btn-extruded text-xl ${!isClaimable && 'opacity-30 grayscale pointer-events-none'}`}
      >
        {loading ? <Loader2 className="w-8 h-8 animate-spin mx-auto" /> : isClaimable ? t.mining.claim : t.mining.processing}
      </button>
    </div>
  );
};

export default MiningPage;