import React, { useState } from 'react';
import { DownloadCloud, ShieldCheck, Loader2, ArrowDownToLine, Globe, Send, CheckCircle2 } from 'lucide-react';
import { UserData, AppConfig } from '../types';
import { UserService } from '../services/userService';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../services/firebase';

interface DownloadProps {
  userData: UserData;
  config: AppConfig;
  triggerAd: () => Promise<boolean>;
  t: any;
}

const DownloadPage: React.FC<DownloadProps> = ({ userData, config, triggerAd, t }) => {
  const [activeTask, setActiveTask] = useState<number | null>(null);
  
  // Updated download tasks list
  const downloadTasks = [
    { 
      name: "Visit Web App", 
      link: "https://tokenearin-webapp.pages.dev", 
      reward: 100, 
      size: "Instant",
      icon: "https://i.postimg.cc/QCdRjjGN/images-removebg-preview.png", 
      isComingSoon: false,
      isWeb: true
    },
    { 
      name: "Telegram Mini app", 
      link: "https://t.me/tokenearin_bot", 
      reward: 120, 
      size: "Bot",
      icon: "https://i.postimg.cc/ZnGTDW2V/unnamed.png", 
      isComingSoon: false,
      isWeb: true
    },
    { 
      name: "Download APK", 
      link: "https://example.com/app-apk", 
      reward: 150, 
      size: "24MB",
      icon: "https://i.postimg.cc/wjT64YGY/TOKEN-EARIN-removebg-preview.png", 
      isComingSoon: false,
      isWeb: false
    },
    { 
      name: "APPS COMING SOON", 
      link: "#", 
      reward: 0, 
      size: "TBD",
      icon: "https://i.postimg.cc/gJvFkgTM/Screenshot-2025-12-21-203236.png", 
      isComingSoon: true,
      isWeb: false
    }
  ];

  const handleDownload = async (task: any, index: number) => {
    if (task.isComingSoon) return;
    
    setActiveTask(index);
    try {
      await triggerAd();
      window.open(task.link, '_blank');
      
      // Verification time: 8s for APK, 5s for Web/Bot tasks
      const waitTime = task.isWeb ? 5000 : 8000;
      await new Promise(r => setTimeout(r, waitTime));

      const history = userData.completedSocialTasks || [];
      const alreadyDone = history.includes(task.link);

      if (!alreadyDone && task.reward > 0) {
        // Award points ONLY on the first visit
        await UserService.updateBalance(userData.uid, userData.balance, task.reward, 'Task Complete', task.name);
        
        await updateDoc(doc(db, "users", userData.uid), {
          completedSocialTasks: arrayUnion(task.link)
        });
        
        alert(`${t.tasks.success} +${task.reward} ${t.common.coins}`);
      } else {
        // Just a confirmation for repeat visits
        if (task.reward > 0) {
          alert("Visited! (Reward already collected previously)");
        }
      }
    } catch (e) {
      alert(t.tasks.fail);
    } finally {
      setActiveTask(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 px-2 pb-10">
      <div className="text-center py-6">
        <div className="w-20 h-20 bg-blue-500/20 rounded-[2.5rem] mx-auto mb-4 flex items-center justify-center border-2 border-blue-500/30 shadow-lg shadow-blue-500/20">
           <DownloadCloud className="w-10 h-10 text-blue-400 animate-bounce" />
        </div>
        <h2 className="text-4xl font-black tracking-tighter capitalize text-white text-glow mb-2">
          {t.tasks.downloadTitle}
        </h2>
        <p className="text-blue-500 text-[10px] font-black uppercase tracking-[0.3em] opacity-80">Forge new apps, gain extra credit</p>
      </div>

      <div className="space-y-5">
        {downloadTasks.map((task, idx) => {
          const isDisabled = activeTask === idx || task.isComingSoon;
          const isDone = (userData.completedSocialTasks || []).includes(task.link);

          return (
            <div key={idx} className={`tile-3d p-6 flex items-center justify-between border-white/20 transition-all ${task.isComingSoon ? 'opacity-70 grayscale' : ''}`}>
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 shadow-inner overflow-hidden flex items-center justify-center group-hover:scale-105 transition-transform p-1">
                  {task.icon ? (
                    <img src={task.icon} alt="App Icon" className={`w-full h-full object-contain rounded-xl ${task.isWeb && !task.isComingSoon ? 'animate-pulse' : ''}`} />
                  ) : (
                    <div className="w-full h-full bg-blue-500/10 flex items-center justify-center">
                       <ArrowDownToLine className="w-8 h-8 text-blue-400" />
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="font-black text-white text-base leading-tight mb-1 tracking-tight flex items-center gap-2">
                    {task.name}
                    {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                  </h4>
                  <div className="flex items-center gap-3">
                     {task.reward > 0 && (
                       <span className={`text-[10px] font-black px-3 py-0.5 rounded-full shadow-lg ${isDone ? 'bg-slate-700 text-slate-400' : 'bg-amber-400 text-slate-900'}`}>
                         {isDone ? 'COLLECTED' : `+${task.reward}`}
                       </span>
                     )}
                     <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{task.size}</span>
                  </div>
                </div>
              </div>

              <button 
                disabled={isDisabled}
                onClick={() => handleDownload(task, idx)}
                className={`p-4 rounded-2xl transition-all shadow-xl ${
                  task.isComingSoon
                    ? 'bg-slate-800 text-slate-500 border border-white/5'
                    : isDone
                      ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 hover:bg-emerald-500 hover:text-black'
                      : task.isWeb 
                        ? 'bg-amber-500/20 text-amber-500 hover:bg-amber-500 hover:text-black border border-amber-500/30'
                        : 'bg-white/10 text-white hover:bg-blue-400 hover:text-slate-950 border border-white/10'
                }`}
              >
                {activeTask === idx ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : task.isComingSoon ? (
                  <Loader2 className="w-6 h-6 opacity-20" />
                ) : isDone ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : task.name.includes("Telegram") ? (
                  <Send className="w-6 h-6" />
                ) : task.isWeb ? (
                  <Globe className="w-6 h-6" />
                ) : (
                  <ArrowDownToLine className="w-6 h-6" />
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DownloadPage;