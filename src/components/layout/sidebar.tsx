'use client';

import * as React from 'react';
import { Settings2, Zap, Clock, MousePointer2, ShieldAlert, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { FilterOptions } from '@/lib/algorithm/chew';
import { SheetClose } from '@/components/ui/sheet';

interface SidebarProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
}

export function Sidebar({ filters, onFilterChange }: SidebarProps) {
  const [slippage, setSlippage] = React.useState(0.5);
  const [mevProtection, setMevProtection] = React.useState(true);
  const [priorityFee, setPriorityFee] = React.useState(0.005);

  const updateFilter = (key: keyof FilterOptions, value: any) => {
    onFilterChange({ ...filters, [key]: value });
  };

  return (
    <aside className="h-full flex flex-col gap-8 bg-white p-8 overflow-y-auto relative">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-capy-tan/5 rounded-xl text-capy-brown">
            <Settings2 size={20} />
          </div>
          <h2 className="text-xl font-bold text-capy-dark">Settings</h2>
        </div>
        <SheetClose asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
            <X size={16} className="text-capy-dark/40" />
          </Button>
        </SheetClose>
      </div>

      <div className="space-y-8">
        <div className="space-y-6">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-capy-dark opacity-30 flex items-center gap-2">
            <MousePointer2 size={10} /> Trade Execution
          </h3>
          
          <div className="space-y-5">
            <div className="space-y-3">
              <div className="flex justify-between text-[11px] font-bold uppercase tracking-tight">
                <span className="opacity-40">Slippage</span>
                <span className="text-capy-brown font-mono">{slippage}%</span>
              </div>
              <Slider
                min={0.1}
                max={15}
                step={0.1}
                value={[slippage]}
                onValueChange={([val]) => setSlippage(val)}
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-[11px] font-bold uppercase tracking-tight">
                <span className="opacity-40">Priority Fee (SOL)</span>
                <span className="text-capy-brown font-mono">{priorityFee}</span>
              </div>
              <Slider
                min={0.001}
                max={0.1}
                step={0.001}
                value={[priorityFee]}
                onValueChange={([val]) => setPriorityFee(val)}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-capy-tan/5 rounded-2xl border border-capy-tan/10">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <ShieldAlert size={12} className="text-capy-brown" />
                  <span className="text-[11px] font-bold uppercase tracking-tight">MEV Protection</span>
                </div>
                <p className="text-[9px] text-capy-dark/40 font-medium leading-tight">Bundle through Jito</p>
              </div>
              <Switch 
                checked={mevProtection} 
                onCheckedChange={setMevProtection} 
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-capy-dark opacity-30 flex items-center gap-2">
            <Zap size={10} /> Discovery
          </h3>
          
          <div className="space-y-5">
            <div className="space-y-3">
              <div className="flex justify-between text-[11px] font-bold uppercase tracking-tight">
                <span className="opacity-40">Min Liquidity</span>
                <span className="text-capy-brown font-mono">${(filters.minLiquidity / 1000).toFixed(0)}K</span>
              </div>
              <Slider
                min={5000}
                max={500000}
                step={5000}
                value={[filters.minLiquidity]}
                onValueChange={([val]) => updateFilter('minLiquidity', val)}
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-[11px] font-bold uppercase tracking-tight">
                <span className="opacity-40">Min Age</span>
                <span className="text-capy-brown font-mono">{filters.minAge}h</span>
              </div>
              <Slider
                min={0}
                max={168}
                step={1}
                value={[filters.minAge]}
                onValueChange={([val]) => updateFilter('minAge', val)}
              />
            </div>

            <Button
              variant={filters.requireSocials ? "default" : "outline"}
              className="w-full justify-between h-12 px-5 border-2 transition-all active:scale-[0.98]"
              onClick={() => updateFilter('requireSocials', !filters.requireSocials)}
            >
              <span className="text-[11px] font-bold uppercase tracking-tight">Verified Socials</span>
              <div className={cn(
                "w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all",
                filters.requireSocials ? "bg-white border-white" : "border-capy-tan"
              )}>
                {filters.requireSocials && <div className="w-1.5 h-1.5 bg-capy-brown rounded-full" />}
              </div>
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-auto pt-8 border-t border-capy-tan/10 flex justify-between items-center opacity-40">
        <p className="text-[10px] font-black uppercase tracking-widest text-capy-dark">coinbara alpha</p>
        <p className="text-[10px] font-mono">v0.1.0</p>
      </div>
    </aside>
  );
}
