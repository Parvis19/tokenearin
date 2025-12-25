import React, { useState, useEffect } from 'react';
import { Pickaxe, Youtube, Globe, ThumbsUp, Zap, Sparkles } from 'lucide-react';
import { UserData, AppConfig } from '../types';

interface HomePageProps {
  userData: UserData;
  config: AppConfig;
  setActivePage: (page: string) => void;
  t: any;
}

const LivingHologram: React.FC<{ Icon: any, color: string }> = ({ Icon, color }) => {
  return (
    <div className="alive-icon-stage" style={{ '--glow-color': color } as React.CSSProperties}>
      {/* Scanning Effect Overlay */}
      <div className="scanline" />
      
      {/* Orbital Array Major */}
      <div className="orbital-halo-1" />
      
      {/* Orbital Array Minor */}
      <div className="orbital-halo-2" />

      {/* Particle Fountain System */}
      {[...Array(6)].map((_, i) => (
        <div 
          key={i} 
          className="digital-dust" 
          style={{ 
            animationDelay: `${i * 0.5}s`,
            left: `${45 + (Math.random() * 10)}%`
          }} 
        />
      ))}
      
      {/* The Kinetic Core (The Living Icon) */}
      <div className="kinetic-core">
        <Icon className="w-14 h-14" style={{ color }} />
      </div>
      
      {/* Bottom Light Refraction */}
      <div className="absolute bottom-2 w-16 h-4 rounded-full bg-white/5 blur-xl transform -translate-y-2 opacity-30" />
      
      {/* Ambient Sparkle */}
      <div className="absolute -top-4 -right-4">
        <Sparkles className="w-4 h-4 text-white/20 animate-pulse" />
      </div>
    </div>
  );
};

const HomePage: React.FC<HomePageProps> = ({ userData, config, setActivePage, t }) => {
  const [slide, setSlide] = useState(0);
  const banners = config.sliderBanners;

  useEffect(() => {
    const timer = setInterval(() => setSlide(prev => (prev + 1) % banners.length), 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const menuItems = [
    { id: 'mining', label: t.home.mining, icon: Pickaxe, color: '#fbbf24', desc: 'Active Hash' },
    { id: 'ads', label: t.home.ads, icon: Youtube, color: '#f87171', desc: 'Sponsor Stream' },
    { id: 'visit', label: t.home.surfing, icon: Globe, color: '#34d399', desc: 'Web Protocol' },
    { id: 'social', label: t.home.social, icon: ThumbsUp, color: '#38bdf8', desc: 'Nexus Link' },
  ];

  return (
    <div className="space-y-6 py-4 px-1">
      {/* 3D Banner Slider - Enhanced Depth */}
      <div className="relative aspect-[16/9] rounded-[2.5rem] overflow-hidden tile-3d border border-white/20 group shadow-[0_30px_60px_-15px_rgba(0,0,0,0.7)]">
        <div 
          className="flex transition-transform duration-1000 cubic-bezier(0.19, 1, 0.22, 1) h-full"
          style={{ transform: `translateX(-${slide * 100}%)` }}
        >
          {banners.map((b, i) => (
            <a key={i} href={b.link} className="min-w-full h-full relative">
              <img src={b.img} className="w-full h-full object-cover brightness-50 group-hover:scale-110 transition-transform duration-[5s]" alt="Promotion" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6">
                 <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md text-amber-400 px-3 py-1.5 rounded-xl font-black text-[9px] uppercase tracking-widest border border-white/10">
                    <Zap className="w-3.5 h-3.5 fill-amber-400" /> {t.common.memberTier}
                 </div>
              </div>
            </a>
          ))}
        </div>
        {/* Slider Indicators */}
        <div className="absolute bottom-3 right-6 flex gap-1.5">
          {banners.map((_, i) => (
            <div key={i} className={`h-1 rounded-full transition-all duration-500 ${slide === i ? 'w-5 bg-amber-500' : 'w-1.5 bg-white/20'}`} />
          ))}
        </div>
      </div>

      {/* The Living Menu Grid - Optimized vertical space */}
      <div className="flex flex-wrap gap-4 justify-center">
        {menuItems.map((item) => (
          <button 
            key={item.id}
            onClick={() => setActivePage(item.id)}
            className="tile-3d group py-4 px-6 flex flex-col items-center justify-center border-white/5 bg-slate-950/20 hover:bg-slate-900/40 w-[calc(50%-8px)] min-w-[140px]"
          >
            <LivingHologram Icon={item.icon} color={item.color} />
            
            <div className="mt-3 text-center space-y-0.5">
              <span className="block font-black text-[11px] uppercase tracking-[0.2em] text-white text-glow group-hover:text-amber-400 transition-colors">
                {item.label}
              </span>
              <span className="block text-[7px] font-black uppercase text-slate-500 tracking-widest opacity-60">
                {item.desc}
              </span>
            </div>
            
            {/* Stage Interaction Floor */}
            <div className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-full transform translate-y-px" />
          </button>
        ))}
      </div>

      {/* Footer Info Card - Compact */}
      <div className="tile-3d p-5 border-white/10 bg-gradient-to-r from-slate-900/40 to-slate-800/20 flex items-center justify-between group overflow-hidden">
        <div className="relative z-10">
          <h4 className="text-[9px] font-black uppercase text-slate-500 tracking-[0.15em] mb-0.5">{t.home.target}</h4>
          <p className="text-xl font-black text-white group-hover:text-amber-400 transition-colors tabular-nums">500 <span className="text-amber-500 text-xs">{t.common.coins}</span></p>
        </div>
        <div className="relative z-10 w-12 h-12 rounded-xl bg-slate-950/60 border border-white/5 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
           <Zap className="w-6 h-6 text-amber-500 animate-pulse" />
        </div>
        {/* Animated Background Decoration */}
        <div className="absolute top-0 right-0 w-28 h-28 bg-amber-500/5 blur-3xl rounded-full -mr-14 -mt-14 group-hover:bg-amber-500/10 transition-colors" />
      </div>
    </div>
  );
};

export default HomePage;