'use client';

import * as React from 'react';
import useSWR from 'swr';
import { ScoredPair } from '@/lib/algorithm/chew';
import { ExternalLink, Globe, ArrowUpRight, ArrowDownRight, Wallet2, Clock, AlertCircle, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface ChewTabProps {
  queryParams?: string;
  view: 'grid' | 'list';
}

export function ChewTab({ queryParams, view }: ChewTabProps) {
  const { data: pairs, error, isLoading } = useSWR<ScoredPair[]>(
    `/api/chew${queryParams ? `?${queryParams}` : ''}`, 
    fetcher, 
    { refreshInterval: 15000 }
  );

  if (isLoading) {
    return (
      <div className={cn(
        "grid gap-4",
        view === 'grid' ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" : "grid-cols-1"
      )}>
        {[...Array(10)].map((_, i) => (
          <div key={i} className={cn(
            "bg-capy-tan/5 rounded-xl animate-pulse border border-capy-tan/10",
            view === 'grid' ? "h-[300px]" : "h-14"
          )} />
        ))}
      </div>
    );
  }

  if (error || !pairs) {
    return (
      <Card className="border-dashed py-12 text-center bg-white rounded-xl shadow-none border-capy-tan/20">
        <p className="text-capy-dark/40 font-medium text-xs">Feed disconnected</p>
      </Card>
    );
  }

  return (
    <div className="max-w-full overflow-hidden">
      <motion.div 
        layout
        className={cn(
          "grid gap-4",
          view === 'grid' ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" : "grid-cols-1"
        )}
      >
        <AnimatePresence mode="popLayout">
          {pairs.length > 0 ? (
            pairs.map((pair) => (
              <TokenCard key={pair.pairAddress} token={pair} view={view} />
            ))
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full">
              <Card className="border-dashed py-24 text-center bg-white rounded-2xl shadow-none border-capy-tan/20">
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
        "text-[10px] font-black px-1.5 py-0.5 rounded border",
        isPos ? "text-emerald-600 bg-emerald-50 border-emerald-100" : "text-rose-600 bg-rose-50 border-rose-100",
        className
      )}>
        {isPos ? '↑' : '↓'} {Math.abs(val).toFixed(1)}%
      </span>
    );
  };

  const ScoreBadge = () => (
    <Badge variant="outline" className={cn(
      "h-6 px-2 rounded-lg font-mono text-[10px] border-2 bg-white shadow-sm transition-all",
      token.chewScore >= 80 ? "border-capy-gold/40 text-amber-600" : 
      token.chewScore >= 60 ? "border-emerald-400/40 text-emerald-600" :
      "border-capy-tan/40 text-capy-dark/40"
    )}>
      {token.chewScore}
    </Badge>
  );

  const TradeDialog = () => (
    <DialogContent className="sm:max-w-[400px] rounded-2xl p-0 overflow-hidden border-capy-tan/20 shadow-2xl">
      <div className="p-6 space-y-6 bg-white">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl overflow-hidden border border-capy-tan/10 shadow-sm bg-capy-tan/5 p-1 flex items-center justify-center shrink-0">
            {token.info?.imageUrl ? <img src={token.info.imageUrl} className="object-cover rounded-lg w-full h-full" /> : <span className="font-bold text-capy-brown">{token.baseToken.symbol.slice(0, 2)}</span>}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-capy-dark leading-none truncate">{token.baseToken.symbol}</h3>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[10px] font-mono text-capy-dark/30 truncate">{token.baseToken.address.slice(0, 8)}...</span>
              <Badge variant="outline" className="text-[8px] h-4 px-1 opacity-40 rounded uppercase font-bold">{token.dexId}</Badge>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <span className="text-[10px] font-bold text-capy-dark/30 uppercase tracking-widest">Amount</span>
              <button 
                onClick={() => setBuyAmount((balance * 0.95).toFixed(3))}
                className="text-[9px] font-bold text-capy-brown hover:opacity-80 uppercase"
              >
                Max: {balance.toFixed(2)} SOL
              </button>
            </div>
            <div className="flex items-center bg-capy-tan/5 rounded-xl border border-capy-tan/10 px-4 h-12 transition-all focus-within:border-capy-brown/40 group">
              <input 
                className="flex-1 bg-transparent text-lg font-bold outline-none placeholder:text-capy-dark/10" 
                value={buyAmount} 
                onChange={(e) => setBuyAmount(e.target.value)}
                placeholder="0.0"
              />
              <span className="text-xs font-bold text-capy-dark/20 ml-2">SOL</span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[0.1, 0.5, 1.0, 5.0].map((amt) => (
              <Button 
                key={amt} 
                variant="outline" 
                className="h-8 text-[10px] font-bold rounded-lg border-capy-tan/10 hover:border-capy-brown hover:text-white transition-all active:scale-95"
                onClick={() => setBuyAmount(amt.toString())}
              >
                {amt}
              </Button>
            ))}
          </div>

          <div className="p-4 bg-capy-tan/5 rounded-xl border border-capy-tan/10 space-y-2">
            <div className="flex items-center gap-2 mb-1 opacity-40">
              <AlertCircle size={10} />
              <p className="text-[9px] font-bold uppercase tracking-widest">Simulated Impact</p>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-capy-dark/60">Receive</span>
              <span className="text-xs font-bold text-capy-dark">~{(parseFloat(buyAmount || '0') * (parseFloat(token.priceNative) || 0) * 0.99).toFixed(2)} {token.baseToken.symbol}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-capy-dark/60">Impact</span>
              <span className="text-xs font-bold text-capy-green">{"< 0.1%"}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 pb-2">
            <Button className="h-12 bg-capy-dark hover:bg-capy-brown text-white font-bold text-xs gap-2 rounded-xl shadow-lg transition-all active:scale-95 group">
              <ArrowUpRight size={16} /> BUY
            </Button>
            <Button variant="outline" className="h-12 border-2 font-bold text-xs gap-2 rounded-xl hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all active:scale-95">
              <ArrowDownRight size={16} /> SELL
            </Button>
          </div>
        </div>
      </div>
    </DialogContent>
  );

  if (view === 'list') {
    return (
      <Dialog>
        <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <DialogTrigger asChild>
            <Card className="p-2 px-4 flex items-center justify-between gap-4 hover:border-capy-brown/20 hover:shadow-xl hover:shadow-black/[0.02] cursor-pointer bg-white rounded-xl shadow-none border-capy-tan/10 group transition-all">
              <div className="flex items-center gap-3 min-w-[180px]">
                <div className="relative w-9 h-9 rounded-lg overflow-hidden bg-capy-tan/5 border border-capy-tan/10 flex items-center justify-center font-bold text-[10px] text-capy-brown shrink-0 group-hover:scale-105 transition-transform">
                  {token.info?.imageUrl ? <img src={token.info.imageUrl} className="object-cover" /> : token.baseToken.symbol.slice(0, 2)}
                </div>
                <div className="truncate">
                  <CardTitle className="text-sm truncate group-hover:text-capy-brown transition-colors">{token.baseToken.symbol}</CardTitle>
                  <div className="flex items-center gap-2 mt-0.5">
                    <PriceChange val={token.priceChange?.h24} className="h-4 leading-none px-1" />
                    <span className="text-[9px] font-black text-capy-dark/20 uppercase tracking-tighter">{getAgeString(token.pairCreatedAt)}</span>
                  </div>
                </div>
              </div>
              
              <div className="hidden lg:grid grid-cols-4 gap-8 flex-1 text-center items-center">
                <div>
                  <p className="text-[8px] font-black opacity-30 uppercase tracking-tighter mb-0.5">Liquidity</p>
                  <p className="text-sm font-black text-capy-brown">{formatUSD(token.liquidity?.usd)}</p>
                </div>
                <div>
                  <p className="text-[8px] font-black opacity-30 uppercase tracking-tighter mb-0.5">FDV</p>
                  <p className="text-sm font-black text-capy-dark">{formatUSD(token.fdv)}</p>
                </div>
                <div>
                  <p className="text-[8px] font-black opacity-30 uppercase tracking-tighter mb-0.5">Volume</p>
                  <p className="text-xs font-black text-capy-dark/60">{formatUSD(token.volume?.h24)}</p>
                </div>
                <div className="flex items-center justify-center">
                  <ScoreBadge />
                </div>
              </div>

              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <DialogTrigger asChild>
                  <Button size="sm" className="h-8 px-4 text-[10px] font-bold bg-capy-dark hover:bg-capy-brown rounded-lg shadow-sm transition-all active:scale-95">TRADE</Button>
                </DialogTrigger>
                <Button variant="ghost" size="icon" asChild className="h-8 w-8 rounded-lg border border-capy-tan/10 transition-all opacity-40 hover:opacity-100">
                  <a href={token.url} target="_blank" rel="noopener noreferrer"><ExternalLink size={12} /></a>
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
            className="h-full flex flex-col overflow-hidden hover:border-capy-brown/30 hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] cursor-pointer group transition-all duration-500 bg-white rounded-2xl shadow-none border-capy-tan/10 relative"
          >
            <div 
              className="absolute inset-0 transition-opacity duration-700 opacity-20 group-hover:opacity-50" 
              style={{ background: `linear-gradient(to bottom, ${gradientColor}, white)` }}
            />
            
            <div className="relative p-5 flex flex-col h-full">
              <div className="flex justify-between items-start mb-6">
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-white border-4 border-white shadow-[0_8px_30px_-5px_rgba(0,0,0,0.12)] group-hover:scale-110 group-hover:rotate-2 transition-all duration-500">
                  {token.info?.imageUrl ? (
                    <>
                      <div className="absolute inset-0 bg-capy-tan/5 animate-pulse" />
                      <img src={token.info.imageUrl} className="relative z-10 w-full h-full object-cover" />
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-2xl text-capy-brown bg-capy-tan/5">{token.baseToken.symbol.slice(0, 2)}</div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <ScoreBadge />
                  <PriceChange val={token.priceChange?.h24} />
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg font-bold group-hover:text-capy-brown transition-colors truncate">{token.baseToken.symbol}</CardTitle>
                  <Badge variant="outline" className="text-[8px] h-4 px-1.5 opacity-30 rounded border-capy-tan/20 shrink-0 font-bold">{token.dexId}</Badge>
                </div>
                <div className="flex items-center gap-3 mt-1.5">
                  <div className="flex items-center gap-1 opacity-40 font-bold text-[9px] uppercase tracking-wider">
                    <Clock size={10} /> {getAgeString(token.pairCreatedAt)}
                  </div>
                  <div className="flex items-center gap-1 opacity-40 font-bold text-[9px] uppercase tracking-wider">
                    <ShieldCheck size={10} className="text-emerald-600" /> Secure
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6 mt-auto">
                <div className="space-y-0.5">
                  <p className="text-[8px] font-bold opacity-20 uppercase tracking-widest leading-none">Liquidity</p>
                  <p className="text-sm font-bold text-capy-brown">{formatUSD(token.liquidity?.usd)}</p>
                </div>
                <div className="space-y-0.5 text-right">
                  <p className="text-[8px] font-bold opacity-20 uppercase tracking-widest leading-none">Market Cap</p>
                  <p className="text-sm font-bold text-capy-dark">{formatUSD(token.fdv)}</p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2.5 pt-5 border-t border-capy-tan/5">
                <DialogTrigger asChild>
                  <Button className="flex-1 h-10 bg-capy-dark hover:bg-capy-brown text-white text-[10px] font-bold uppercase tracking-widest rounded-xl shadow-xl shadow-black/5 transition-all active:scale-95">
                    <Wallet2 size={14} className="mr-2" /> Trade
                  </Button>
                </DialogTrigger>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-10 w-10 rounded-xl border border-capy-tan/10 bg-white/50 hover:bg-white transition-all opacity-40 hover:opacity-100"
                  asChild
                  onClick={(e) => e.stopPropagation()}
                >
                  <a href={token.url} target="_blank" rel="noopener noreferrer"><ExternalLink size={14} className="text-capy-dark" /></a>
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
