import React, { useState, useEffect } from 'react';
import { Coins, Send, Wallet, Clock, CheckCircle2, XCircle, AlertCircle, RefreshCcw, Landmark, Zap, History as HistoryIcon } from 'lucide-react';
import { UserData, AppConfig } from '../types';
import { UserService } from '../services/userService';
import { collection, addDoc, serverTimestamp, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';

interface WalletProps {
  userData: UserData;
  config: AppConfig;
  t: any;
}

interface WithdrawalRecord {
  id: string;
  amount: number;
  method: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  timestamp: any;
}

const BalanceParticles = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    {[...Array(8)].map((_, i) => (
      <div 
        key={i}
        className="absolute w-1 h-1 bg-white/20 rounded-full animate-drift"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 5}s`,
          "--tw-translate-x": `${(Math.random() - 0.5) * 100}px`,
          "--tw-translate-y": `${(Math.random() - 0.5) * 100}px`
        } as React.CSSProperties}
      />
    ))}
  </div>
);

const WalletPage: React.FC<WalletProps> = ({ userData, config, t }) => {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState(config.paymentMethods[0]?.name || '');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRecord[]>([]);

  useEffect(() => {
    if (!userData?.uid) return;
    const q = query(collection(db, "withdrawals"), where("uid", "==", userData.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as WithdrawalRecord[];
      setWithdrawals(docs.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0)));
    });
    return () => unsubscribe();
  }, [userData.uid]);

  const handleWithdraw = async () => {
    const amt = Number(amount);
    if (isNaN(amt) || amt < config.minWithdrawal || amt > userData.balance || !details.trim()) {
       alert("Invalid entry. Please check amount and receiver details.");
       return;
    }

    setLoading(true);
    try {
      await UserService.updateBalance(userData.uid, userData.balance, -amt, 'Withdrawal', `Payout: ${method}`);
      await addDoc(collection(db, "withdrawals"), {
        uid: userData.uid, userName: userData.name, userEmail: userData.email,
        amount: amt, method, details, status: 'pending', timestamp: serverTimestamp()
      });
      setAmount(''); 
      setDetails('');
      alert("Withdrawal request submitted successfully!");
    } catch (e) { 
      console.error(e); 
      alert("Error submitting request.");
    } finally { 
      setLoading(false); 
    }
  };

  const selectedMethodPlaceholder = config.paymentMethods.find(m => m.name === method)?.placeholder || "Enter details";
  const estimatedPayout = ((userData.balance / config.coinValueCoins) * config.coinValueBdt).toFixed(0);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {/* Glass Balance Card */}
      <div className="glass-blur p-8 rounded-[2.5rem] border border-white/20 shadow-2xl relative overflow-hidden">
        <BalanceParticles />
        <div className="absolute -right-6 -bottom-6 opacity-10 rotate-12">
            <Wallet className="w-32 h-32 text-amber-500" />
        </div>
        
        <div className="flex justify-between items-start relative z-10">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500/80 mb-2">{t.wallet.balance}</p>
            <div className="flex items-center gap-3">
              <h1 className="text-5xl font-black text-white tracking-tighter tabular-nums">{Math.floor(userData.balance)}</h1>
              <div className="bg-amber-500/20 p-2 rounded-xl">
                 <Coins className="w-6 h-6 text-amber-500 fill-amber-500/40" />
              </div>
            </div>
          </div>
          <div className="text-right">
             <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">{t.wallet.estPayout}</p>
             <p className="text-3xl font-black text-emerald-400 tabular-nums">
                ${estimatedPayout}
             </p>
          </div>
        </div>
        
        <div className="mt-8 flex gap-2">
           <div className="flex-grow h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-1000" 
                style={{ width: `${Math.min((userData.balance / config.minWithdrawal) * 100, 100)}%` }}
              />
           </div>
        </div>
        <p className="text-[8px] font-black uppercase text-slate-500 mt-2 tracking-widest">
           {Math.floor((userData.balance / config.minWithdrawal) * 100)}% TO MINIMUM WITHDRAWAL
        </p>
      </div>

      {/* Futuristic Transparent Glass Room for Payment Selection */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500/10 to-emerald-500/10 rounded-[2.5rem] blur opacity-30 group-hover:opacity-60 transition duration-1000"></div>
        
        <div className="relative glass-blur p-8 rounded-[2.5rem] space-y-6 border border-white/30 shadow-2xl bg-white/5 backdrop-blur-[50px]">
          <div className="flex items-center gap-3">
             <div className="p-3 bg-amber-500/20 rounded-2xl border border-white/20">
                <Send className="w-5 h-5 text-amber-500" />
             </div>
             <div>
                <h3 className="text-lg font-black text-white uppercase tracking-tighter">{t.wallet.newRequest}</h3>
                <p className="text-[9px] text-amber-500/70 font-bold uppercase tracking-[0.2em]">BKASH NAGAD TO FREE FIRE DIAMOND</p>
             </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Payment Channel</label>
              <div className="relative group">
                <Landmark className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-amber-500 transition-colors" />
                <select 
                  value={method} 
                  onChange={(e) => setMethod(e.target.value)} 
                  className="w-full bg-white/5 border border-white/20 rounded-2xl pl-12 pr-4 py-4 text-white outline-none focus:border-amber-500 transition-all font-black text-sm appearance-none cursor-pointer hover:bg-white/10"
                >
                  {config.paymentMethods.map(m => <option key={m.name} value={m.name} className="bg-slate-900">{m.name}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
               <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Coin Amount</label>
               <div className="relative group">
                  <Coins className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-amber-500 transition-colors" />
                  <input 
                    type="number" 
                    value={amount} 
                    onChange={(e) => setAmount(e.target.value)} 
                    placeholder={`Min ${config.minWithdrawal} Coins`} 
                    className="w-full bg-white/5 border border-white/20 rounded-2xl pl-12 pr-4 py-4 text-white outline-none focus:border-amber-500 transition-all font-black text-sm placeholder:text-slate-600 shadow-inner"
                  />
               </div>
            </div>

            <div className="space-y-1.5">
               <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Account Details</label>
               <div className="relative group">
                  <Zap className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-amber-500 transition-colors" />
                  <input 
                    type="text" 
                    value={details} 
                    onChange={(e) => setDetails(e.target.value)} 
                    placeholder={selectedMethodPlaceholder} 
                    className="w-full bg-white/5 border border-white/20 rounded-2xl pl-12 pr-4 py-4 text-white outline-none focus:border-amber-500 transition-all font-black text-sm placeholder:text-slate-600 shadow-inner"
                  />
               </div>
            </div>
          </div>

          <button 
            onClick={handleWithdraw} 
            disabled={loading || Number(amount) < config.minWithdrawal} 
            className="w-full btn-extruded py-5 shadow-2xl disabled:opacity-30 disabled:grayscale transition-transform active:scale-95"
          >
            {loading ? <RefreshCcw className="w-6 h-6 animate-spin mx-auto" /> : t.wallet.requestBtn}
          </button>
        </div>
      </div>

      {/* Transaction Status List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
           <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{t.wallet.status}</h3>
           <Clock className="w-4 h-4 text-slate-700" />
        </div>
        
        <div className="space-y-3">
          {withdrawals.length > 0 ? withdrawals.map((withdraw) => (
            <div key={withdraw.id} className="glass-blur p-5 rounded-3xl border border-white/10 flex items-center justify-between hover:bg-white/5 transition-all">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl bg-white/5 border border-white/10 ${
                  withdraw.status === 'completed' ? 'text-emerald-400' : 
                  withdraw.status === 'rejected' ? 'text-red-400' : 'text-amber-500'
                }`}>
                  {withdraw.status === 'completed' ? <CheckCircle2 className="w-5 h-5" /> : 
                   withdraw.status === 'rejected' ? <XCircle className="w-5 h-5" /> : 
                   <RefreshCcw className="w-5 h-5 animate-spin-slow" />}
                </div>
                <div>
                  <p className="text-sm font-black text-white">{withdraw.amount} <span className="text-[10px] text-amber-500">{t.common.coins}</span></p>
                  <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">{withdraw.method}</p>
                </div>
              </div>
              <div className={`px-3 py-1.5 rounded-xl border text-[8px] font-black uppercase tracking-widest ${
                withdraw.status === 'completed' ? 'border-emerald-500/30 text-emerald-500' :
                withdraw.status === 'rejected' ? 'border-red-500/30 text-red-500' :
                'border-amber-500/30 text-amber-500'
              }`}>
                {withdraw.status}
              </div>
            </div>
          )) : (
            <div className="glass-blur p-12 rounded-[2.5rem] border border-dashed border-white/10 text-center opacity-40">
               <HistoryIcon className="w-10 h-10 text-slate-800 mx-auto mb-2" />
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">No withdrawal history found</p>
            </div>
          )}
        </div>
      </div>

      <div className="glass-blur border border-blue-500/20 p-5 rounded-3xl flex gap-4 bg-blue-500/5">
         <AlertCircle className="w-6 h-6 text-blue-400 shrink-0 mt-0.5" />
         <p className="text-[10px] text-slate-400 font-bold leading-relaxed uppercase tracking-wider">
            {t.wallet.manualAudit}. Payment requests are processed sequentially by our auditing team.
         </p>
      </div>
    </div>
  );
};

export default WalletPage;