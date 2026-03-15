'use client';

import * as React from 'react';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { ChewTab } from '@/components/tabs/chew-tab';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { FilterOptions } from '@/lib/algorithm/chew';

const STORAGE_KEY = 'coinbara_filters';

const DEFAULT_FILTERS: FilterOptions = {
  minLiquidity: 15000,
  minFdv: 50000,
  minAge: 1,
  requireSocials: false,
};

export default function Home() {
  const [filters, setFilters] = React.useState<FilterOptions>(DEFAULT_FILTERS);
  const [isLoaded, setIsLoaded] = React.useState(false);

  // Load from localStorage
  React.useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setFilters(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved filters', e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage
  React.useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
    }
  }, [filters, isLoaded]);

  const queryParams = new URLSearchParams({
    minLiquidity: filters.minLiquidity.toString(),
    minFdv: filters.minFdv.toString(),
    minAge: filters.minAge.toString(),
    requireSocials: filters.requireSocials.toString(),
  }).toString();

  return (
    <Sheet>
      <main className="min-h-screen flex flex-col bg-white">
        <Header />
        <SheetContent side="right" className="p-0 w-80">
          <Sidebar filters={filters} onFilterChange={setFilters} />
        </SheetContent>
        <div className="flex-1 overflow-y-auto px-6 py-8 scroll-smooth">
          <div className="w-full">
            <ChewTab queryParams={isLoaded ? queryParams : ''} />
          </div>
        </div>
      </main>
    </Sheet>
  );
}
