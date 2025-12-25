import React, { useState } from 'react';
import { Youtube, Coins, Loader2 } from 'lucide-react';
import { UserData, AppConfig } from '../types';
import { UserService } from '../services/userService';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

interface AdsProps {
  userData: UserData;
  config: AppConfig;
  triggerAd: () => Promise<boolean>;
  t: any;
}

const AdsPage: React.FC<AdsProps> = ({ userData, config, triggerAd, t }) => {
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);

  const handleWatch = async () => {
    setLoading(true);
    try {
      await triggerAd();
      
      setTimer(10);
      const interval = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      await new Promise(r => setTimeout(r, 10000));
      
      const reward = config.adWatchReward;
      await UserService.updateBalance(userData.uid, userData.balance, reward, 'Ad Reward', 'Watched sponsored ad');
      await updateDoc(doc(db, "users", userData.uid), { dailyAdCount: (userData.dailyAdCount || 0) + 1 });
      
    } catch (e) {
      alert(t.tasks.fail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500 pb-10">
      <div className="tile-3d p-10 text-center border-red-500/30 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-red-500/50" />
        <div className="w-24 h-24 mx-auto mb-6 bg-red-500/20 rounded-[2rem] flex items-center justify-center border-2 border-red-500/40 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
          <Youtube className="w-14 h-14 text-red-500 glow-gold" />
        </div>
        <h2 className="text-3xl font-black mb-2 text-white text-glow">{t.ads.title}</h2>
        <p className="text-slate-400 text-xs px-4 font-bold tracking-wide italic">{t.ads.desc}</p>
        
        <div className="mt-10 grid grid-cols-2 gap-px bg-white/5 rounded-2xl overflow-hidden border border-white/5">
           <div className="bg-black/20 py-5">
              <p className="text-[10px] text-slate-500 mb-1 font-black uppercase tracking-widest">{t.ads.today}</p>
              <p className="text-2xl font-black text-white tabular-nums">{userData.dailyAdCount}</p>
           </div>
           <div className="bg-black/20 py-5">
              <p className="text-[10px] text-slate-500 mb-1 font-black uppercase tracking-widest">{t.ads.earnings}</p>
              <p className="text-2xl font-black text-amber-500 tabular-nums">+{userData.dailyAdCount * config.adWatchReward}</p>
           </div>
        </div>
      </div>

      <div className="tile-3d p-6 flex items-center gap-5 border-amber-500/30">
        <div className="p-4 bg-amber-500/20 rounded-2xl border border-amber-500/20 shadow-inner">
           <Coins className="w-8 h-8 text-amber-500 glow-gold" />
        </div>
        <div>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-1">{t.ads.next}</p>
          <p className="text-xl font-black text-white tabular-nums">10.00 <span className="text-amber-500">{t.common.coins}</span></p>
        </div>
      </div>

      {timer > 0 ? (
        <div className="w-full py-6 bg-slate-800 text-white rounded-[2rem] font-black text-xl text-center animate-pulse border-2 border-white/5 shadow-2xl">
           {t.ads.processing} {timer}S...
        </div>
      ) : (
        <button 
          onClick={handleWatch}
          disabled={loading}
          className="w-full btn-extruded text-xl shadow-[0_20px_40px_-10px_rgba(245,158,11,0.3)]"
        >
          {loading ? <Loader2 className="w-8 h-8 animate-spin mx-auto" /> : t.ads.watchBtn}
        </button>
      )}
    </div>
  );
};

export default AdsPage;