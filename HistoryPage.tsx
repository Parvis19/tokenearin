import React, { useState, useEffect } from 'react';
import { History as HistoryIcon, TrendingUp, TrendingDown, Clock, ShieldAlert, RefreshCcw } from 'lucide-react';
import { UserData } from '../types';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';

interface HistoryProps {
  userData: UserData;
  t: any;
}

const HistoryPage: React.FC<HistoryProps> = ({ userData, t }) => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [permissionError, setPermissionError] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setPermissionError(false);
    
    const q = query(
      collection(db, "users", userData.uid, "transactions"), 
      orderBy("timestamp", "desc"), 
      limit(30)
    );
    
    getDocs(q).then(snap => {
      if (mounted) {
        setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
      }
    }).catch(err => {
      console.error("Ledger History Error:", err);
      if (mounted) {
        if (err.code === 'permission-denied') {
          setPermissionError(true);
        }
        setLoading(false);
      }
    });

    return () => { mounted = false; };
  }, [userData.uid]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="text-center py-6">
         <HistoryIcon className="w-14 h-14 text-slate-700 mx-auto mb-3 opacity-50" />
         <h2 className="text-3xl font-black tracking-tighter">{t.history.title}</h2>
         <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">{t.history.subtitle}</p>
      </div>

      <div className="space-y-2.5">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 gap-3">
            <RefreshCcw className="w-8 h-8 animate-spin text-amber-500" />
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t.history.fetching}</p>
          </div>
        ) : permissionError ? (
          <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-3xl text-center">
            <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-sm font-black text-red-500 uppercase tracking-widest mb-2">Unauthorized Access</p>
            <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
              Firestore Security Rules are blocking access to your transactions. Please update your rules in the Firebase Console to allow users to read their own sub-collections.
            </p>
          </div>
        ) : items.length > 0 ? (
          items.map((tx) => (
            <div key={tx.id} className="glass-card p-4 rounded-2xl flex items-center justify-between border-white/5 hover:bg-white/10 transition-all">
               <div className="flex items-center gap-4">
                  <div className={`p-2.5 rounded-xl ${tx.amount > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                     {tx.amount > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  </div>
                  <div>
                     <p className="text-sm font-bold leading-tight">{tx.type}</p>
                     <p className="text-[9px] text-slate-500 uppercase font-black tracking-wider">{tx.description || 'System Entry'}</p>
                  </div>
               </div>
               <div className="text-right">
                  <p className={`text-base font-black ${tx.amount > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                     {tx.amount > 0 ? '+' : ''}{tx.amount.toFixed(2)}
                  </p>
                  <p className="text-[8px] text-slate-600 font-black tracking-tighter">{t.history.verified}</p>
               </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 glass-card rounded-3xl border-dashed opacity-50">
             <HistoryIcon className="w-10 h-10 text-slate-800 mx-auto mb-2" />
             <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.3em]">{t.history.noRecords}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;