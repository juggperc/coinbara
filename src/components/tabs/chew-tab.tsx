'use client';

import * as React from 'react';
import useSWR from 'swr';
import { ScoredPair } from '@/lib/algorithm/chew';
import { ExternalLink, Globe, LayoutGrid, List, ArrowUpRight, ArrowDownRight, Wallet2, Clock, AlertCircle, ShieldCheck, History } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface ChewTabProps {
  queryParams?: string;
}

export function ChewTab({ queryParams }: ChewTabProps) {
  const [view, setView] = React.useState<'grid' | 'list'>('grid');
  const { data: pairs, error, isLoading } = useSWR<ScoredPair[]>(
    `/api/chew${queryParams ? `?${queryParams}` : ''}`, 
    fetcher, 
    { refreshInterval: 15000 }
  );

  if (isLoading) {
    return (
      <div className={cn(
        "grid gap-6 transition-all duration-500",
        view === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
      )}>
        {[...Array(8)].map((_, i) => (
          <div key={i} className={cn(
            "bg-capy-tan/5 rounded-[2rem] animate-pulse border border-capy-tan/10",
            view === 'grid' ? "h-[380px]" : "h-16"
          )} />
        ))}
      </div>
    );
  }

  if (error || !pairs) {
    return (
      <Card className="border-dashed py-12 text-center bg-white rounded-[2rem] shadow-none">
        <p className="text-capy-dark/40 font-medium text-xs">Feed disconnected</p>
      </Card>
    );
  }

  return (
    <div className="space-y-8 max-w-full overflow-hidden px-1">
      <div className="flex items-center justify-between border-b border-capy-tan/10 pb-4">
        <h2 className="text-2xl font-black text-capy-dark tracking-tight">Holdables</h2>
        <ToggleGroup type="single" value={view} onValueChange={(v) => v && setView(v as any)} className="bg-capy-tan/5 p-1 rounded-xl border border-capy-tan/5">
          <ToggleGroupItem value="grid" className="h-8 w-10 px-0 rounded-lg">
            <LayoutGrid size={14} />
          </ToggleGroupItem>
          <ToggleGroupItem value="list" className="h-8 w-10 px-0 rounded-lg">
            <List size={14} />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <motion.div 
        layout
        className={cn(
          "grid gap-6",
          view === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
        )}
      >
        <AnimatePresence mode="popLayout">
          {pairs.length > 0 ? (
            pairs.map((pair) => (
              <TokenCard key={pair.pairAddress} token={pair} view={view} />
            ))
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full">
              <Card className="border-dashed py-24 text-center bg-white rounded-[2.5rem] shadow-none border-capy-tan/20">
                <p className="text-capy-dark/30 font-medium text-xs uppercase tracking-widest">No signals match your filters</p>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function TokenCard({ token, view }: { token: ScoredPair, view: 'grid' | 'list' }) {
  const [buyAmount, setBuyAmount] = React.useState('0.1');
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [balance, setBalance] = React.useState(0);

  React.useEffect(() => {
    if (publicKey) {
      connection.getBalance(publicKey).then(b => setBalance(b / LAMPORTS_PER_SOL));
    }
  }, [publicKey, connection]);

  const formatUSD = (val?: number | string) => {
    if (!val) return 'N/A';
    const num = typeof val === 'string' ? parseFloat(val) : val;
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`;
    return `$${num.toFixed(2)}`;
  };

  const getAgeString = (createdAt?: number) => {
    if (!createdAt) return 'New';
    const diff = (Date.now() - createdAt) / 1000;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  };

  const PriceChange = ({ val, className }: { val?: number, className?: string }) => {
    if (val === undefined) return null;
    const isPos = val >= 0;
    return (
      <span className={cn(
        "text-[10px] font-black px-1.5 py-0.5 rounded-md border",
        isPos ? "text-emerald-600 bg-emerald-50 border-emerald-100" : "text-rose-600 bg-rose-50 border-rose-100",
        className
      )}>
        {isPos ? '↑' : '↓'} {Math.abs(val).toFixed(1)}%
      </span>
    );
  };

  const ScoreBadge = () => (
    <Badge variant="outline" className={cn(
      "h-6 px-2 rounded-lg font-mono text-[10px] border-2 bg-white/80 backdrop-blur-sm shadow-sm",
      token.chewScore >= 80 ? "border-amber-400/40 text-amber-600" : 
      token.chewScore >= 60 ? "border-emerald-400/40 text-emerald-600" :
      "border-capy-tan/40 text-capy-dark/40"
    )}>
      {token.chewScore}
    </Badge>
  );

  const TradeDialog = () => (
    <DialogContent className="sm:max-w-[420px] rounded-[2.5rem] p-8 border-capy-tan/10 shadow-2xl shadow-black/10">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-14 rounded-2xl overflow-hidden border-2 border-capy-tan/10 shadow-xl bg-white p-1">
          {token.info?.imageUrl ? <img src={token.info.imageUrl} className="object-cover rounded-xl w-full h-full" /> : <div className="w-full h-full flex items-center justify-center font-bold text-capy-brown bg-capy-tan/5 rounded-xl">{token.baseToken.symbol.slice(0, 2)}</div>}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-black text-capy-dark leading-tight truncate">{token.baseToken.symbol}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] font-mono text-capy-dark/30 truncate">{token.baseToken.address}</span>
            <Badge variant="outline" className="text-[8px] h-4 px-1 opacity-40 rounded-md">{token.dexId}</Badge>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <span className="text-[10px] font-black text-capy-dark/30 uppercase tracking-widest">Amount</span>
            <button 
              onClick={() => setBuyAmount((balance * 0.95).toFixed(3))}
              className="text-[9px] font-black text-capy-brown hover:text-capy-brown/80 uppercase"
            >
              Max: {balance.toFixed(2)} SOL
            </button>
          </div>
          <div className="flex items-center bg-capy-tan/5 rounded-[1.5rem] border border-capy-tan/10 px-5 h-16 transition-all focus-within:border-capy-brown focus-within:ring-4 focus-within:ring-capy-brown/5 group">
            <input 
              className="flex-1 bg-transparent text-xl font-black outline-none placeholder:text-capy-dark/10" 
              value={buyAmount} 
              onChange={(e) => setBuyAmount(e.target.value)}
              placeholder="0.0"
            />
            <span className="text-xs font-black text-capy-dark/20 ml-2">SOL</span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 px-1">
          {[0.1, 0.5, 1.0, 5.0].map((amt) => (
            <Button 
              key={amt} 
              variant="outline" 
              className="h-10 text-[11px] font-black rounded-xl border-capy-tan/10 hover:border-capy-brown hover:text-white transition-all active:scale-95"
              onClick={() => setBuyAmount(amt.toString())}
            >
              {amt}
            </Button>
          ))}
        </div>

        <div className="p-5 bg-capy-tan/5 rounded-[1.5rem] border border-capy-tan/10 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle size={12} className="text-capy-brown" />
            <p className="text-[10px] font-black text-capy-dark/40 uppercase tracking-widest">Simulation</p>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-capy-dark/60">Estimated Output</span>
            <span className="text-xs font-black text-capy-dark">~{(parseFloat(buyAmount || '0') * (parseFloat(token.priceNative) || 0) * 0.99).toFixed(2)} {token.baseToken.symbol}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-capy-dark/60">Price Impact</span>
            <span className="text-xs font-black text-emerald-600">{"< 0.1%"}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button className="h-16 bg-capy-dark hover:bg-capy-brown text-white font-black text-sm gap-2 rounded-[1.5rem] shadow-xl shadow-black/5 transition-all active:scale-95 group">
            <ArrowUpRight size={20} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" /> BUY
          </Button>
          <Button variant="outline" className="h-16 border-2 font-black text-sm gap-2 rounded-[1.5rem] hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all active:scale-95 group">
            <ArrowDownRight size={20} className="group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-transform" /> SELL
          </Button>
        </div>
      </div>
    </DialogContent>
  );

  if (view === 'list') {
    return (
      <Dialog>
        <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <DialogTrigger asChild>
            <Card className="p-3 flex items-center justify-between gap-4 hover:border-capy-brown/20 hover:shadow-xl hover:shadow-black/[0.02] cursor-pointer bg-white rounded-2xl shadow-none border-capy-tan/10 group transition-all">
              <div className="flex items-center gap-4 min-w-[180px]">
                <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-capy-tan/5 border-2 border-capy-tan/10 flex items-center justify-center font-bold text-[10px] text-capy-brown shrink-0 group-hover:scale-105 transition-transform">
                  {token.info?.imageUrl ? <img src={token.info.imageUrl} className="object-cover" /> : token.baseToken.symbol.slice(0, 2)}
                </div>
                <div className="truncate">
                  <CardTitle className="text-base truncate group-hover:text-capy-brown transition-colors">{token.baseToken.symbol}</CardTitle>
                  <div className="flex items-center gap-2 mt-0.5">
                    <PriceChange val={token.priceChange?.h24} />
                    <span className="text-[10px] font-bold text-capy-dark/20 uppercase tracking-tighter">{getAgeString(token.pairCreatedAt)}</span>
                  </div>
                </div>
              </div>
              
              <div className="hidden lg:grid grid-cols-4 gap-8 flex-1 text-center">
                <div>
                  <p className="text-[9px] font-bold opacity-30 uppercase tracking-tighter mb-0.5">Liquidity</p>
                  <p className="text-sm font-black text-capy-brown">{formatUSD(token.liquidity?.usd)}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold opacity-30 uppercase tracking-tighter mb-0.5">FDV</p>
                  <p className="text-sm font-black text-capy-dark">{formatUSD(token.fdv)}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold opacity-30 uppercase tracking-tighter mb-0.5">Volume</p>
                  <p className="text-sm font-black text-capy-dark/60">{formatUSD(token.volume?.h24)}</p>
                </div>
                <div className="flex items-center justify-center">
                  <ScoreBadge />
                </div>
              </div>

              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <DialogTrigger asChild>
                  <Button size="sm" className="h-9 px-5 text-[11px] font-black bg-capy-dark hover:bg-capy-brown rounded-xl shadow-sm transition-all active:scale-95">TRADE</Button>
                </DialogTrigger>
                <Button variant="ghost" size="icon" asChild className="h-9 w-9 rounded-xl border border-capy-tan/10">
                  <a href={token.url} target="_blank" rel="noopener noreferrer"><ExternalLink size={14} /></a>
                </Button>
              </div>
            </Card>
          </DialogTrigger>
        </motion.div>
        <TradeDialog />
      </Dialog>
    );
  }

  const colorHue = token.baseToken.address.charCodeAt(0) % 360;
  const gradientColor = `hsla(${colorHue}, 40%, 95%, 0.5)`;

  return (
    <Dialog>
      <motion.div layout initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}>
        <DialogTrigger asChild>
          <Card 
            className="h-full flex flex-col overflow-hidden hover:border-capy-brown/30 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.12)] cursor-pointer group transition-all duration-500 bg-white rounded-[2.5rem] shadow-none border-capy-tan/10 relative"
          >
            <div 
              className="absolute inset-0 transition-opacity duration-700 opacity-30 group-hover:opacity-60" 
              style={{ background: `linear-gradient(to bottom, ${gradientColor}, white)` }}
            />
            
            <div className="relative p-7 flex flex-col h-full">
              <div className="flex justify-between items-start mb-8">
                <div className="relative w-24 h-24 rounded-[2rem] overflow-hidden bg-white border-4 border-white shadow-[0_12px_40px_-8px_rgba(0,0,0,0.15)] group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                  {token.info?.imageUrl ? (
                    <>
                      <div className="absolute inset-0 bg-capy-tan/5 animate-pulse" />
                      <img src={token.info.imageUrl} className="relative z-10 w-full h-full object-cover" />
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-black text-2xl text-capy-brown bg-capy-tan/5">{token.baseToken.symbol.slice(0, 2)}</div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <ScoreBadge />
                  <PriceChange val={token.priceChange?.h24} />
                </div>
              </div>

              <div className="mb-8">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-xl font-black group-hover:text-capy-brown transition-colors truncate">{token.baseToken.symbol}</CardTitle>
                  <Badge variant="outline" className="text-[8px] h-4 px-1.5 opacity-30 rounded-md border-capy-tan/20 shrink-0 font-black">{token.dexId}</Badge>
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-1 opacity-40 font-black text-[9px] uppercase tracking-wider">
                    <Clock size={10} /> {getAgeString(token.pairCreatedAt)}
                  </div>
                  <div className="flex items-center gap-1 opacity-40 font-black text-[9px] uppercase tracking-wider">
                    <ShieldCheck size={10} className="text-emerald-600" /> Secure
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-8 mt-auto px-1">
                <div className="space-y-1">
                  <p className="text-[9px] font-black opacity-20 uppercase tracking-widest">Liquidity</p>
                  <p className="text-sm font-black text-capy-brown">{formatUSD(token.liquidity?.usd)}</p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-[9px] font-black opacity-20 uppercase tracking-widest">Market Cap</p>
                  <p className="text-sm font-black text-capy-dark">{formatUSD(token.fdv)}</p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-6 border-t border-capy-tan/5">
                <DialogTrigger asChild>
                  <Button className="flex-1 h-12 bg-capy-dark hover:bg-capy-brown text-white text-[11px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-black/5 transition-all active:scale-95">
                    <Wallet2 size={14} className="mr-2" /> Trade
                  </Button>
                </DialogTrigger>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-12 w-12 rounded-2xl border border-capy-tan/10 bg-white/50 hover:bg-white hover:border-capy-brown/20 transition-all"
                  asChild
                  onClick={(e) => e.stopPropagation()}
                >
                  <a href={token.url} target="_blank" rel="noopener noreferrer"><ExternalLink size={16} className="text-capy-dark/30 group-hover:text-capy-brown transition-colors" /></a>
                </Button>
              </div>
            </div>
          </Card>
        </DialogTrigger>
      </motion.div>
      <TradeDialog />
    </Dialog>
  );
}
