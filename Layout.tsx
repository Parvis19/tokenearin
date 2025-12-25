import React from 'react';
import { Home, Wallet, History as HistoryIcon, Users, User, Coins, ArrowLeft, Wifi, Sparkles } from 'lucide-react';
import { UserData } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  userData: UserData | null;
  activePage: string;
  setActivePage: (page: string) => void;
  t: any;
}

const Layout: React.FC<LayoutProps> = ({ children, userData, activePage, setActivePage, t }) => {
  const navItems = [
    { id: 'refer', icon: Users, label: t.nav.refer },
    { id: 'wallet', icon: Wallet, label: t.nav.wallet },
    { id: 'home', icon: Home, label: t.nav.home },
    { id: 'history', icon: HistoryIcon, label: t.nav.history },
    { id: 'profile', icon: User, label: t.nav.profile },
  ];

  return (
    <div className="flex flex-col min-h-screen pb-24 pt-24 px-4 overflow-x-hidden relative">
      {/* Redesigned Header based on screenshot */}
      <header className="fixed top-0 left-0 right-0 z-[100] max-w-md mx-auto px-4 py-4">
        <div className="glass-blur px-5 py-4 rounded-[2.5rem] flex justify-between items-center border border-white/10 shadow-2xl bg-[#0a0f1e]/80">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => setActivePage('profile')}>
            <div className="relative">
              <div className="w-14 h-14 rounded-[1.25rem] bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center font-black text-black border border-white/20 overflow-hidden shadow-lg">
                {userData?.photoURL ? (
                  <img src={userData.photoURL} alt="P" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl">{userData?.name.charAt(0).toLowerCase()}</span>
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#0a0f1e]" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight text-white leading-tight">{userData?.name || 'tokenfatherpk'}</h2>
              <div className="flex items-center gap-1 mt-0.5">
                <Wifi className="w-3 h-3 text-emerald-500" />
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">
                  {t.common.syncVerified}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setActivePage('oracle')}
              className={`p-3 rounded-2xl transition-all border border-amber-500/20 ${activePage === 'oracle' ? 'bg-amber-500/20 text-amber-500' : 'bg-white/5 text-slate-400 hover:text-amber-500'}`}
            >
              <Sparkles className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 bg-[#1a1f2e] px-4 py-2.5 rounded-2xl border border-white/10 shadow-inner">
              <Coins className="w-4 h-4 text-amber-500" />
              <span className="font-black text-amber-500 text-base tabular-nums">{Math.floor(userData?.balance || 0)}</span>
            </div>
          </div>
        </div>
      </header>

      {activePage !== 'home' && (
        <div className="mb-4 flex">
          <button 
            onClick={() => setActivePage('home')}
            className="tile-3d px-4 py-2 flex items-center gap-2 text-[10px] font-black uppercase text-amber-500 border border-amber-500/20 glass-blur"
          >
            <ArrowLeft className="w-3 h-3" /> {t.common.back}
          </button>
        </div>
      )}

      <main className="flex-grow z-10">
        {children}
      </main>

      <nav className="fixed bottom-4 left-0 right-0 z-[100] max-w-md mx-auto px-4 pointer-events-none">
        <div className="glass-blur border border-white/10 rounded-[2.5rem] flex justify-around items-center py-2 px-1 shadow-2xl pointer-events-auto bg-[#0a0f1e]/80">
          {navItems.map((item) => {
            const isActive = activePage === item.id;
            const Icon = item.icon;
            return (
              <button 
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`flex flex-col items-center p-2.5 transition-all duration-300 ${isActive ? 'text-amber-500 scale-110' : 'text-slate-500'}`}
              >
                <div className={`p-2.5 rounded-2xl transition-all ${isActive ? 'bg-amber-500/10' : ''}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  );
};

export default Layout;