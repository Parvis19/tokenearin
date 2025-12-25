import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Send, Sparkles, Loader2, Bot, User, Trash2, BrainCircuit } from 'lucide-react';
import { UserData, AppConfig } from '../types';

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface AIAssistantProps {
  userData: UserData;
  config: AppConfig;
  t: any;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ userData, config, t }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async (forcedText?: string) => {
    const textToSend = forcedText || input;
    if (!textToSend.trim() || loading) return;

    const newMessages: Message[] = [...messages, { role: 'user', text: textToSend }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const systemPrompt = `${t.oracle.systemRole} 
      User Context: Name: ${userData.name}, Balance: ${userData.balance} coins. 
      App Rules: Min withdrawal: ${config.minWithdrawal}, Coin Value: ${config.coinValueCoins} coins = ${config.coinValueBdt} BDT.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: textToSend,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.7,
        },
      });

      setMessages([...newMessages, { role: 'model', text: response.text || "The Oracle is silent." }]);
    } catch (error) {
      setMessages([...newMessages, { role: 'model', text: "Error connecting to the Oracle." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] animate-in fade-in zoom-in-95 duration-500">
      <div className="glass-blur p-6 rounded-[2.5rem] border border-white/10 mb-6 flex items-center justify-between shadow-2xl relative overflow-hidden">
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 bg-gradient-to-tr from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg">
            <BrainCircuit className="w-8 h-8 text-black" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-tighter">{t.oracle.title}</h2>
            <p className="text-[10px] text-amber-500 font-black uppercase tracking-[0.2em]">{t.oracle.subtitle}</p>
          </div>
        </div>
        <button onClick={() => setMessages([])} className="p-3 bg-white/5 rounded-2xl text-slate-500 hover:text-red-500 transition-colors">
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      <div ref={scrollRef} className="flex-grow overflow-y-auto px-2 space-y-4 mb-4 scrollbar-hide">
        {messages.length === 0 && !loading && (
          <div className="h-full flex flex-col items-center justify-center opacity-30 text-center px-10">
            <Sparkles className="w-16 h-16 text-slate-700 mb-4 animate-pulse" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Waiting for inquiry</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
            <div className={`max-w-[85%] p-4 rounded-3xl flex gap-3 ${
              msg.role === 'user' ? 'bg-blue-600/20 border border-blue-500/30 rounded-tr-none' : 'bg-white/5 border border-white/10 rounded-tl-none'
            }`}>
              <div className="shrink-0 pt-1">
                {msg.role === 'user' ? <User className="w-4 h-4 text-blue-400" /> : <Bot className="w-4 h-4 text-amber-500" />}
              </div>
              <p className="text-sm font-medium text-slate-200">{msg.text}</p>
            </div>
          </div>
        ))}
        {loading && <div className="animate-pulse flex gap-2 p-4 bg-white/5 rounded-3xl w-fit"><Loader2 className="w-4 h-4 animate-spin text-amber-500" /><span className="text-[10px] font-black uppercase text-slate-500">Consulting...</span></div>}
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {t.oracle.suggestions.map((s: string, i: number) => (
          <button key={i} onClick={() => handleSend(s)} className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase text-slate-400 hover:text-amber-500 transition-all">{s}</button>
        ))}
      </div>

      <div className="glass-blur p-2 rounded-[2rem] border border-white/20 flex items-center gap-2 shadow-2xl">
        <input 
          type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder={t.oracle.placeholder} className="flex-grow bg-transparent border-none outline-none px-4 py-3 text-white font-medium text-sm placeholder:text-slate-600"
        />
        <button onClick={() => handleSend()} disabled={!input.trim() || loading} className={`p-3 rounded-2xl ${input.trim() && !loading ? 'bg-amber-500 text-black' : 'bg-white/5 text-slate-700'}`}>
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
};

export default AIAssistant;