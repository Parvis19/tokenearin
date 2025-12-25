import React, { useState } from 'react';
import { Globe, ThumbsUp, Loader2, ExternalLink, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { UserData, AppConfig } from '../types';
import { UserService } from '../services/userService';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../services/firebase';

interface TasksProps {
  userData: UserData;
  config: AppConfig;
  type: 'visit' | 'social';
  triggerAd: () => Promise<boolean>;
  t: any;
}

const TasksPage: React.FC<TasksProps> = ({ userData, config, type, triggerAd, t }) => {
  const [activeTask, setActiveTask] = useState<number | null>(null);
  const tasks = type === 'visit' ? config.websitesToVisit : config.socialTasks;

  const handleTask = async (task: any, index: number) => {
    setActiveTask(index);
    try {
      await triggerAd();
      window.open(task.link, '_blank');
      
      const waitTime = type === 'visit' ? (task.timer || 10) * 1000 : 5000;
      await new Promise(r => setTimeout(r, waitTime));

      const field = type === 'visit' ? 'visitedWebsitesToday' : 'completedSocialTasks';
      const history = userData[field as keyof UserData] as string[] || [];
      const alreadyDone = history.includes(task.link);

      if (!alreadyDone) {
        // Award points ONLY on the first visit
        await UserService.updateBalance(userData.uid, userData.balance, task.reward, 'Task Complete', task.name);
        await updateDoc(doc(db, "users", userData.uid), {
          [field]: arrayUnion(task.link)
        });
        alert(`${t.tasks.success} +${task.reward} ${t.common.coins}`);
      } else {
        // Repeat visit: no reward, just confirmation
        alert("Task opened! (Reward already collected previously)");
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
        <h2 className="text-4xl font-black tracking-tighter capitalize text-white text-glow mb-2">
          {type === 'visit' ? t.tasks.surfingTitle : t.tasks.socialTitle}
        </h2>
        <p className="text-amber-500 text-[10px] font-black uppercase tracking-[0.3em] opacity-80">{t.tasks.desc}</p>
      </div>

      <div className="space-y-5">
        {tasks.map((task, idx) => {
          const field = type === 'visit' ? 'visitedWebsitesToday' : 'completedSocialTasks';
          const isDone = (userData[field as keyof UserData] as string[])?.includes(task.link);
          const Icon = type === 'visit' ? Globe : ThumbsUp;

          return (
            <div key={idx} className={`tile-3d p-6 flex items-center justify-between border-white/20 transition-all ${isDone ? 'border-emerald-500/20' : ''}`}>
              <div className="flex items-center gap-5">
                <div className={`p-4 rounded-2xl ${type === 'visit' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-sky-500/20 text-sky-400'} border border-white/5 shadow-inner`}>
                  <Icon className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="font-black text-white text-base leading-tight mb-1 flex items-center gap-2">
                    {task.name}
                    {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                  </h4>
                  <div className="flex items-center gap-3">
                     <span className={`text-[10px] font-black px-3 py-0.5 rounded-full shadow-lg ${isDone ? 'bg-slate-700 text-slate-400' : 'bg-amber-400 text-slate-900'}`}>
                        {isDone ? 'COLLECTED' : `+${task.reward}`}
                     </span>
                     {type === 'visit' && <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{(task as any).timer}s {t.tasks.wait}</span>}
                  </div>
                </div>
              </div>

              <button 
                disabled={activeTask === idx}
                onClick={() => handleTask(task, idx)}
                className={`p-4 rounded-2xl transition-all shadow-xl ${
                  isDone 
                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 hover:bg-emerald-500 hover:text-black' 
                    : 'bg-white/10 text-white hover:bg-amber-400 hover:text-slate-950 border border-white/10'
                }`}
              >
                {activeTask === idx ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : isDone ? (
                  <ShieldCheck className="w-6 h-6" />
                ) : (
                  <ExternalLink className="w-6 h-6" />
                )}
              </button>
            </div>
          );
        })}
        {tasks.length === 0 && <p className="text-center text-slate-500 font-black uppercase tracking-[0.4em] mt-20 opacity-40">{t.tasks.empty}</p>}
      </div>
    </div>
  );
};

export default TasksPage;