import React, { useState, useEffect } from 'react';
import { 
  Loader2, ShieldAlert 
} from 'lucide-react';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from './services/firebase';
import { UserData, AppConfig } from './types';
import { DEFAULT_CONFIG } from './constants';
import { translations } from './constants/translations';

// Page Components
import HomePage from './components/HomePage';
import MiningPage from './components/MiningPage';
import AdsPage from './components/AdsPage';
import WalletPage from './components/WalletPage';
import ReferPage from './components/ReferPage';
import TasksPage from './components/TasksPage';
import DownloadPage from './components/DownloadPage';
import HistoryPage from './components/HistoryPage';
import ProfilePage from './components/ProfilePage';
import AuthPage from './components/AuthPage';
import Onboarding from './components/Onboarding';
import Layout from './components/Layout';
import AIAssistant from './components/AIAssistant';

const App: React.FC = () => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [activePage, setActivePage] = useState('home');

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) {
        setUserData(null);
        setLoading(false);
      }
    });

    const unsubConfig = onSnapshot(doc(db, "config", "main"), (snap) => {
      if (snap.exists()) {
        setConfig(prev => ({ ...prev, ...snap.data() }));
      }
    }, (error) => {
      console.error("Config fetch error:", error);
      setLoading(false);
    });

    return () => {
      unsubAuth();
      unsubConfig();
    };
  }, []);

  useEffect(() => {
    if (user) {
      const unsubUser = onSnapshot(doc(db, "users", user.uid), (snap) => {
        if (snap.exists()) {
          setUserData(snap.data() as UserData);
        }
        setLoading(false);
      }, (error) => {
        console.error("User snapshot error:", error);
        setLoading(false);
      });
      return () => unsubUser();
    }
  }, [user]);

  const triggerAd = (): Promise<boolean> => {
    return new Promise((resolve) => {
      // @ts-ignore
      if (window.show_10120546) {
        // @ts-ignore
        window.show_10120546().then(() => resolve(true)).catch(() => resolve(true));
        setTimeout(() => resolve(true), 2000);
      } else {
        resolve(true);
      }
    });
  };

  const browserLang = navigator.language.split('-')[0];
  const defaultLang = (['en', 'bn', 'hi', 'ur'].includes(browserLang) ? browserLang : 'en') as 'en' | 'bn' | 'hi' | 'ur';
  const t = translations[userData?.language || defaultLang];

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-900">
        <Loader2 className="w-12 h-12 text-amber-500 animate-spin mb-4" />
      </div>
    );
  }

  if (!user) return <AuthPage t={t} />; 
  if (user && !userData) return <Onboarding onComplete={() => setLoading(false)} t={t} />;
  
  if (userData?.isBlocked) {
    return (
      <div className="h-screen flex items-center justify-center p-8 text-center bg-slate-900">
        <div className="glass-card p-8 rounded-2xl border-red-500/50">
          <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-red-500">{t?.common?.restricted || "Account Restricted"}</h1>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    const props = { userData, config, setActivePage, triggerAd, t };
    switch (activePage) {
      case 'home': return <HomePage {...props} />;
      case 'mining': return <MiningPage {...props} />;
      case 'ads': return <AdsPage {...props} />;
      case 'wallet': return <WalletPage {...props} />;
      case 'refer': return <ReferPage {...props} />;
      case 'oracle': return <AIAssistant {...props} />;
      case 'visit': return <TasksPage {...props} type="visit" />;
      case 'social': return <TasksPage {...props} type="social" />;
      case 'download': return <DownloadPage {...props} triggerAd={triggerAd} />;
      case 'history': return <HistoryPage {...props} />;
      case 'profile': return <ProfilePage {...props} />;
      default: return <HomePage {...props} />;
    }
  };

  return (
    <Layout userData={userData} activePage={activePage} setActivePage={setActivePage} t={t}>
      {renderContent()}
    </Layout>
  );
};

export default App;