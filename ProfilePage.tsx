import React, { useState, useRef } from 'react';
import { User, LogOut, ShieldCheck, Globe, Image as ImageIcon, Loader2, AlertCircle, Link, Save, ChevronRight, Check, Copy, Hash, X, Shield, DownloadCloud } from 'lucide-react';
import { UserData } from '../types';
import { auth, db, storage } from '../services/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';

interface ProfileProps {
  userData: UserData;
  setActivePage: (page: string) => void;
  t: any;
}

const ProfilePage: React.FC<ProfileProps> = ({ userData, setActivePage, t }) => {
  const [uploading, setUploading] = useState(false);
  const [savingUrl, setSavingUrl] = useState(false);
  const [isUpdatingLang, setIsUpdatingLang] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tempUrl, setTempUrl] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [showLangSelector, setShowLangSelector] = useState(false);
  const [showSettingsTab, setShowSettingsTab] = useState(false);
  
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const languages = [
    { code: 'en', name: 'English', label: 'Global / English' },
    { code: 'bn', name: 'বাংলা', label: 'বাংলাদেশ / বাংলা' },
    { code: 'hi', name: 'हिन्दी', label: 'भारत / हिन्दी' },
    { code: 'ur', name: 'اردو', label: 'پاکستان / اردو' }
  ];

  const currentLang = languages.find(l => l.code === (userData as any).language) || languages[0];

  const processAndUpload = async (file: File) => {
    setError(null);
    if (!file.type.startsWith('image/')) {
      setError("Please select a valid image file.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Image size must be less than 2MB.");
      return;
    }

    setUploading(true);
    try {
      const storageRef = ref(storage, `profiles/${userData.uid}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      await updateDoc(doc(db, "users", userData.uid), {
        photoURL: downloadURL
      });

      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { photoURL: downloadURL });
      }

      alert("Profile picture updated!");
    } catch (err: any) {
      console.error("Upload error:", err);
      setError("Upload failed. Try using a link.");
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processAndUpload(file);
    if (e.target) e.target.value = '';
  };

  const handleSaveUrl = async () => {
    if (!tempUrl.startsWith('http')) {
      setError("Enter a valid URL (starting with http)");
      return;
    }

    setSavingUrl(true);
    try {
      await updateDoc(doc(db, "users", userData.uid), {
        photoURL: tempUrl
      });
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { photoURL: tempUrl });
      }
      alert("Profile updated via link!");
      setShowUrlInput(false);
    } catch (err) {
      setError("Failed to save URL.");
    } finally {
      setSavingUrl(false);
    }
  };

  const selectLanguage = async (langCode: string) => {
    setIsUpdatingLang(true);
    try {
      await updateDoc(doc(db, "users", userData.uid), {
        language: langCode
      });
      setShowLangSelector(false);
    } catch (err) {
      console.error("Language update failed", err);
    } finally {
      setIsUpdatingLang(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    alert(`${label} copied to clipboard!`);
  };

  return (
    <div className="space-y-6 animate-in zoom-in-95 duration-500 pb-10">
      {/* Account Settings Tab (Overlay) */}
      {showSettingsTab && (
        <div className="fixed inset-0 z-[60] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in zoom-in duration-300">
          <div className="tile-3d w-full max-w-sm p-8 bg-slate-900 border-white/10 relative">
            <button 
              onClick={() => setShowSettingsTab(false)}
              className="absolute top-4 right-4 p-2 bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 mb-8">
               <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20">
                  <Shield className="w-6 h-6 text-amber-500" />
               </div>
               <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tighter">Account Security</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Identification & Access Control</p>
               </div>
            </div>

            <div className="space-y-6">
               <div className="space-y-3">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Your User UID</label>
                  <div className="flex bg-black/60 p-4 rounded-2xl border border-white/5 items-center justify-between shadow-inner group transition-all hover:border-amber-500/30">
                     <span className="text-[10px] font-mono font-bold text-amber-500/90 truncate mr-4 tracking-tighter">{userData.uid}</span>
                     <button 
                        onClick={() => copyToClipboard(userData.uid, 'UID')}
                        className="p-3 bg-white/5 hover:bg-amber-500 hover:text-black rounded-xl text-amber-500 transition-all border border-white/5 active:scale-90"
                     >
                        <Copy className="w-4 h-4" />
                     </button>
                  </div>
                  <p className="text-[8px] text-slate-600 font-bold uppercase text-center px-4 leading-tight">Your UID is a unique identifier required for manual support or specific transactions.</p>
               </div>

               <div className="pt-4">
                  <button 
                    onClick={() => setShowSettingsTab(false)}
                    className="w-full btn-extruded text-sm uppercase font-black"
                  >
                    Done
                  </button>
               </div>
            </div>
          </div>
        </div>
      )}

      <div className="glass-card p-8 rounded-3xl text-center relative overflow-hidden border-white/5 shadow-2xl">
        <div className="relative w-32 h-32 mx-auto mb-4 group">
          <div className="w-full h-full bg-gradient-to-tr from-amber-500 to-orange-600 p-1 rounded-full shadow-2xl overflow-hidden relative">
             <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center text-4xl font-black text-amber-500 border-4 border-slate-900 overflow-hidden">
               {userData.photoURL ? (
                 <img src={userData.photoURL} alt="Profile" className="w-full h-full object-cover" />
               ) : (
                 userData.name.charAt(0).toUpperCase()
               )}
             </div>
             {uploading && (
               <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center rounded-full">
                 <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
               </div>
             )}
          </div>
          
          <div className="absolute -bottom-1 -right-1 flex flex-col gap-2">
            <button 
              disabled={uploading}
              onClick={() => galleryInputRef.current?.click()}
              className="bg-amber-500 p-2 rounded-full text-slate-900 shadow-lg border-2 border-slate-900 transition-transform active:scale-90"
            >
              <ImageIcon className="w-4 h-4" />
            </button>
          </div>
          
          <input type="file" hidden ref={galleryInputRef} accept="image/*" onChange={handleFileChange} />
        </div>

        <h2 className="text-2xl font-black tracking-tight">{userData.name}</h2>
        
        <div className="mt-2">
           <button 
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="text-[10px] text-blue-400 font-bold uppercase tracking-widest flex items-center gap-1 mx-auto"
           >
             <Link className="w-3 h-3" /> {t.profile.addUrl}
           </button>
        </div>

        {showUrlInput && (
          <div className="mt-4 flex gap-2 animate-in slide-in-from-top-2">
            <input 
              type="text" 
              value={tempUrl} 
              onChange={(e) => setTempUrl(e.target.value)}
              placeholder="Paste Image URL here..."
              className="flex-grow bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-xs outline-none focus:border-amber-500"
            />
            <button 
              onClick={handleSaveUrl}
              disabled={savingUrl}
              className="bg-emerald-500 px-3 py-2 rounded-xl text-slate-900"
            >
              {savingUrl ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            </button>
          </div>
        )}

        {error && (
          <div className="mt-4 bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex items-center gap-2 text-[10px] text-red-400 font-bold">
             <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        <div className="mt-4 inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-4 py-1.5 rounded-full">
           <ShieldCheck className="w-3 h-3 text-amber-500" />
           <span className="text-[10px] font-black text-amber-500 tracking-widest uppercase">{t.profile.verified}</span>
        </div>
      </div>

      <div className="glass-card p-4 rounded-2xl divide-y divide-white/5 border-white/5 shadow-lg relative">
        <button 
          onClick={() => setShowSettingsTab(true)}
          className="w-full flex items-center justify-between p-4 group hover:bg-white/5 transition-all rounded-xl"
        >
           <div className="flex items-center gap-4 text-left">
              <User className="w-5 h-5 text-slate-500 group-hover:text-amber-500 transition-colors" />
              <div>
                 <p className="text-sm font-bold">{t.profile.settings}</p>
                 <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{t.profile.security}</p>
              </div>
           </div>
           <ChevronRight className="w-4 h-4 text-slate-600 group-hover:translate-x-1 transition-transform" />
        </button>

        <button 
          onClick={() => setShowLangSelector(!showLangSelector)}
          className="w-full flex items-center gap-4 p-4 hover:bg-white/5 transition-colors group"
        >
           <Globe className="w-5 h-5 text-slate-500 group-hover:text-amber-500" />
           <div className="text-left flex-grow">
              <p className="text-sm font-bold">{t.profile.region}</p>
              <p className="text-[10px] text-slate-500 uppercase font-black">{currentLang.label}</p>
           </div>
           <ChevronRight className={`w-4 h-4 text-slate-600 transition-transform ${showLangSelector ? 'rotate-90' : ''}`} />
        </button>

        {showLangSelector && (
          <div className="p-2 space-y-1 animate-in slide-in-from-top-2 duration-200">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => selectLanguage(lang.code)}
                disabled={isUpdatingLang}
                className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all ${
                  currentLang.code === lang.code 
                    ? 'bg-amber-500/10 text-amber-500' 
                    : 'text-slate-400 hover:bg-white/5'
                }`}
              >
                <span>{lang.name} ({lang.code.toUpperCase()})</span>
                {currentLang.code === lang.code && <Check className="w-4 h-4" />}
              </button>
            ))}
          </div>
        )}

        <button 
          onClick={() => setActivePage('download')}
          className="w-full flex items-center justify-between p-4 group hover:bg-white/5 transition-all rounded-xl"
        >
           <div className="flex items-center gap-4 text-left">
              <DownloadCloud className="w-5 h-5 text-slate-500 group-hover:text-blue-500 transition-colors" />
              <div>
                 <p className="text-sm font-bold">{t.profile.downloadApk}</p>
                 <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Network Package</p>
              </div>
           </div>
           <ChevronRight className="w-4 h-4 text-slate-600 group-hover:translate-x-1 transition-transform" />
        </button>

        <button 
          onClick={() => auth.signOut()}
          className="w-full flex items-center gap-4 p-4 hover:bg-red-500/10 transition-colors group text-red-400"
        >
           <LogOut className="w-5 h-5" />
           <div className="text-left">
              <p className="text-sm font-bold">{t.profile.signout}</p>
              <p className="text-[10px] text-red-500/50 uppercase font-black tracking-widest">{t.profile.endSession}</p>
           </div>
        </button>
      </div>

      <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5">
        <p className="text-[10px] text-slate-500 leading-relaxed italic">
          {t.profile.tip}
        </p>
      </div>
    </div>
  );
};

export default ProfilePage;