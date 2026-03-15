'use client';

import * as React from 'react';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { ChewTab } from '@/components/tabs/chew-tab';
import { BurrowTab } from '@/components/tabs/burrow-tab';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { FilterOptions } from '@/lib/algorithm/chew';
import { AnimatePresence, motion } from 'framer-motion';

const STORAGE_KEY = 'coinbara_filters';
const VIEW_STORAGE_KEY = 'coinbara_view';

const DEFAULT_FILTERS: FilterOptions = {
  minLiquidity: 15000,
  minFdv: 50000,
  minAge: 1,
  requireSocials: false,
};

export default function Home() {
  const [filters, setFilters] = React.useState<FilterOptions>(DEFAULT_FILTERS);
  const [view, setView] = React.useState<'grid' | 'list'>('grid');
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('chew');

  // Load from localStorage
  React.useEffect(() => {
    const savedFilters = localStorage.getItem(STORAGE_KEY);
    const savedView = localStorage.getItem(VIEW_STORAGE_KEY);
    
    if (savedFilters) {
      try {
        setFilters(JSON.parse(savedFilters));
      } catch (e) {
        console.error('Failed to parse saved filters', e);
      }
    }
    
    if (savedView === 'grid' || savedView === 'list') {
      setView(savedView);
    }
    
    setIsLoaded(true);
  }, []);

  // Save filters to localStorage
  React.useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
    }
  }, [filters, isLoaded]);

  // Save view to localStorage
  React.useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(VIEW_STORAGE_KEY, view);
    }
  }, [view, isLoaded]);

  const queryParams = new URLSearchParams({
    minLiquidity: filters.minLiquidity.toString(),
    minFdv: filters.minFdv.toString(),
    minAge: filters.minAge.toString(),
    requireSocials: filters.requireSocials.toString(),
  }).toString();

  return (
    <Sheet>
      <main className="min-h-screen flex flex-col bg-white">
        <Header 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
          view={view} 
          onViewChange={setView}
        />
        <SheetContent side="right" className="p-0 w-80">
          <Sidebar filters={filters} onFilterChange={setFilters} />
        </SheetContent>
        <div className="flex-1 overflow-y-auto px-6 py-6 scroll-smooth relative">
          <div className="w-full">
            <AnimatePresence mode="wait">
              {activeTab === 'chew' ? (
                <motion.div
                  key="chew"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                >
                  <ChewTab queryParams={isLoaded ? queryParams : ''} view={view} />
                </motion.div>
              ) : (
                <motion.div
                  key="burrow"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                >
                  <BurrowTab />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </Sheet>
  );
}
