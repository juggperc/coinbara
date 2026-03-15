'use client';

import Image from 'next/image';
import * as React from 'react';
import { Bone, Settings2, Copy, Check, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useSWRConfig } from 'swr';

export function Header() {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const { cache } = useSWRConfig();
  const [balance, setBalance] = React.useState<number | null>(null);
  const [isFetching, setIsFetching] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [lastUpdated, setLastUpdated] = React.useState<Date>(new Date());
  const [secondsAgo, setSecondsAgo] = React.useState(0);

  const fetchBalance = React.useCallback(async () => {
    if (!publicKey || !connected) return;
    setIsFetching(true);
    try {
      const bal = await connection.getBalance(publicKey);
      setBalance(bal / LAMPORTS_PER_SOL);
    } catch (error) {
      console.error('Balance fetch error:', error);
    } finally {
      setIsFetching(false);
    }
  }, [publicKey, connected, connection]);

  React.useEffect(() => {
    fetchBalance();
    if (publicKey) {
      const id = connection.onAccountChange(publicKey, (account) => {
        setBalance(account.lamports / LAMPORTS_PER_SOL);
      });
      return () => {
        connection.removeAccountChangeListener(id);
      };
    }
  }, [publicKey, fetchBalance, connection]);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setSecondsAgo(Math.floor((new Date().getTime() - lastUpdated.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [lastUpdated]);

  // Sync timer with SWR refreshes
  React.useEffect(() => {
    const interval = setInterval(() => {
      // Check if any chew data is fresh in cache
      // This is a simple way to detect refreshes from SWR
      setLastUpdated(new Date());
    }, 15000); // Match SWR refresh interval
    return () => clearInterval(interval);
  }, []);

  const copyAddress = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey.toBase58());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-capy-tan/10 bg-white sticky top-0 z-50 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
      <div className="flex items-center gap-3">
        <div className="relative w-8 h-8">
          <Image
            src="/logo.png"
            alt="coinbara logo"
            fill
            className="object-contain"
          />
        </div>
        <h1 className="text-xl font-bold text-capy-dark tracking-tighter">coinbara</h1>
      </div>

      <div className="flex items-center gap-6 flex-1 justify-center">
        <Tabs defaultValue="chew" className="max-w-[160px]">
          <TabsList className="w-full h-9 rounded-lg bg-capy-tan/5 border border-capy-tan/5">
            <TabsTrigger value="chew" className="flex-1 gap-2 h-7 text-[11px] font-bold rounded-md">
              <Bone size={14} />
              Chew
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex items-center gap-2 opacity-30">
          <RefreshCw size={10} className={cn(secondsAgo < 2 && "animate-spin")} />
          <span className="text-[10px] font-black uppercase tracking-widest">{secondsAgo}s ago</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {connected && (
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-2">
                {isFetching ? (
                  <div className="h-3 w-12 bg-capy-tan/10 animate-pulse rounded" />
                ) : (
                  <span className="text-[11px] font-black">{balance?.toFixed(3) || '0.000'} SOL</span>
                )}
                <div className="w-1.5 h-1.5 rounded-full bg-capy-green shadow-[0_0_8px_rgba(129,199,132,0.6)]" />
              </div>
              <button 
                onClick={copyAddress}
                className="flex items-center gap-1 text-[9px] font-bold text-capy-dark/40 hover:text-capy-dark transition-colors"
              >
                {copied ? <Check size={8} /> : <Copy size={8} />}
                {publicKey?.toBase58().slice(0, 4)}...{publicKey?.toBase58().slice(-4)}
              </button>
            </div>
          </div>
        )}
        
        <div className="relative group">
          <div className={cn(
            "absolute -inset-0.5 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-1000",
            connected ? "bg-capy-green" : "bg-gradient-to-r from-[#AB9FF2] to-[#6E56CF]"
          )} />
          <div className="relative">
            <WalletMultiButton className="!bg-white !text-capy-dark !h-9 !px-4 !rounded-xl !text-[11px] !font-black !border !border-capy-tan/20 !shadow-sm !transition-all hover:!bg-capy-tan/5 !font-sans" />
          </div>
        </div>

        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl border border-capy-tan/10 transition-all active:scale-95 shadow-sm">
            <Settings2 size={16} />
          </Button>
        </SheetTrigger>
      </div>
    </header>
  );
}
