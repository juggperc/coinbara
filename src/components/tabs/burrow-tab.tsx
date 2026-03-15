'use client';

import * as React from 'react';
import { useChat } from '@ai-sdk/react';
import { Sparkles, Send, Bot, User, Key, Cpu, Trash2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';

const STORAGE_KEYS = {
  API_KEY: 'coinbara_or_key',
  MODEL: 'coinbara_ai_model',
};

export function BurrowTab() {
  const [apiKey, setApiKey] = React.useState('');
  const [model, setModel] = React.useState('anthropic/claude-3-haiku');
  const [isConfigured, setIsLoaded] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const savedKey = localStorage.getItem(STORAGE_KEYS.API_KEY);
    const savedModel = localStorage.getItem(STORAGE_KEYS.MODEL);
    if (savedKey) setApiKey(savedKey);
    if (savedModel) setModel(savedModel);
    setIsLoaded(true);
  }, []);

  const saveConfig = () => {
    localStorage.setItem(STORAGE_KEYS.API_KEY, apiKey);
    localStorage.setItem(STORAGE_KEYS.MODEL, model);
  };

  const chatHelpers = useChat({
    // @ts-ignore
    api: '/api/burrow',
    body: {
      apiKey,
      model,
    },
  });

  // Extract with safety or type-casting
  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages } = chatHelpers as any;

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!isConfigured) return null;

  if (!apiKey) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-md mx-auto text-center space-y-8">
        <div className="p-6 bg-capy-tan/5 rounded-[2.5rem] border-2 border-dashed border-capy-tan/20">
          <Sparkles size={48} className="text-capy-brown mx-auto mb-4 animate-pulse" />
          <h2 className="text-2xl font-black text-capy-dark tracking-tight">Enter the Burrow</h2>
          <p className="text-sm text-capy-dark/40 font-medium mt-2">
            Unlock AI-powered Solana research. We use OpenRouter to give you access to the world's best models.
          </p>
        </div>
        
        <div className="w-full space-y-4">
          <div className="space-y-2 text-left">
            <label className="text-[10px] font-black uppercase tracking-widest text-capy-dark/30 ml-4 flex items-center gap-2">
              <Key size={10} /> OpenRouter API Key
            </label>
            <Input 
              type="password" 
              placeholder="sk-or-v1-..." 
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="rounded-3xl h-14"
            />
          </div>
          <Button 
            className="w-full h-14 rounded-3xl text-sm font-black uppercase tracking-widest"
            onClick={saveConfig}
            disabled={!apiKey.startsWith('sk-or-')}
          >
            Start Researching
          </Button>
          <p className="text-[10px] text-capy-dark/30 font-medium italic">
            Your key is stored locally in your browser.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] max-w-4xl mx-auto border border-capy-tan/10 rounded-[2.5rem] bg-white shadow-2xl shadow-black/[0.03] overflow-hidden">
      {/* Burrow Header */}
      <div className="px-8 py-4 border-b border-capy-tan/5 flex items-center justify-between bg-capy-tan/[0.02]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-capy-dark text-white rounded-xl shadow-lg shadow-black/10">
            <Sparkles size={16} />
          </div>
          <div>
            <h3 className="text-sm font-black text-capy-dark leading-none">CapyAI</h3>
            <p className="text-[10px] font-bold text-capy-dark/30 uppercase tracking-tight mt-1">{model.split('/')[1] || model}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-xl h-9 w-9 text-capy-dark/20 hover:text-red-500 hover:bg-red-50 transition-all"
            onClick={() => {
              if (confirm('Clear chat history?')) setMessages([]);
            }}
          >
            <Trash2 size={16} />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-xl h-9 w-9 text-capy-dark/20"
            onClick={() => {
              localStorage.removeItem(STORAGE_KEYS.API_KEY);
              setApiKey('');
            }}
          >
            <Key size={16} />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth" ref={scrollRef}>
        <AnimatePresence initial={false}>
          {messages.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-20"
            >
              <Bot size={48} className="text-capy-dark" />
              <div className="max-w-xs">
                <p className="text-sm font-black uppercase tracking-widest">Deep Burrow Research</p>
                <p className="text-xs font-medium mt-2 italic">Ask about current trends, specific tokens, or "find me a holdable gem".</p>
              </div>
            </motion.div>
          )}
          {messages.map((m: any) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex gap-4",
                m.role === 'user' ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border shadow-sm",
                m.role === 'user' ? "bg-white border-capy-tan/20 text-capy-brown" : "bg-capy-dark border-capy-dark text-white"
              )}>
                {m.role === 'user' ? <User size={14} /> : <Sparkles size={14} />}
              </div>
              <div className={cn(
                "flex flex-col space-y-2 max-w-[80%]",
                m.role === 'user' ? "items-end" : "items-start"
              )}>
                <div className={cn(
                  "p-4 rounded-3xl text-sm leading-relaxed whitespace-pre-wrap",
                  m.role === 'user' 
                    ? "bg-capy-tan/5 text-capy-dark border border-capy-tan/10 font-medium" 
                    : "bg-white text-capy-dark border border-capy-tan/10 shadow-sm"
                )}>
                  {m.content}
                </div>
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-4"
            >
              <div className="w-8 h-8 rounded-xl bg-capy-dark border border-capy-dark text-white flex items-center justify-center shrink-0 animate-pulse">
                <Loader2 size={14} className="animate-spin" />
              </div>
              <div className="bg-capy-tan/5 h-10 w-24 rounded-2xl animate-pulse" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input Area */}
      <div className="p-6 bg-capy-tan/[0.02] border-t border-capy-tan/5">
        <form onSubmit={handleSubmit} className="relative">
          <Input 
            value={input}
            onChange={handleInputChange}
            placeholder="Dig into the data..."
            className="pr-16 h-16 rounded-[2rem] border-2 border-capy-tan/10 bg-white text-base shadow-xl shadow-black/[0.02] focus-visible:ring-capy-brown/10"
          />
          <div className="absolute right-2 top-2">
            <Button 
              type="submit" 
              size="icon" 
              disabled={isLoading || !input.trim()}
              className="h-12 w-12 rounded-[1.5rem] bg-capy-dark hover:bg-capy-brown text-white shadow-lg transition-all active:scale-90"
            >
              <Send size={18} />
            </Button>
          </div>
        </form>
        <div className="mt-4 flex justify-center items-center gap-4 opacity-30 text-[9px] font-black uppercase tracking-widest">
          <div className="flex items-center gap-1.5"><Cpu size={10} /> Real-time context loaded</div>
          <div className="w-1 h-1 rounded-full bg-capy-dark" />
          <div>Always DYOR</div>
        </div>
      </div>
    </div>
  );
}
