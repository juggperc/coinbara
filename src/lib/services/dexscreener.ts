export interface DexPair {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  baseToken: {
    address: string;
    name: string;
    symbol: string;
  };
  quoteToken: {
    address: string;
    symbol: string;
  };
  priceNative: string;
  priceUsd?: string;
  txns: {
    m5: { buys: number; sells: number };
    h1: { buys: number; sells: number };
    h6: { buys: number; sells: number };
    h24: { buys: number; sells: number };
  };
  volume: {
    m5: number;
    h1: number;
    h6: number;
    h24: number;
  };
  priceChange: {
    m5: number;
    h1: number;
    h6: number;
    h24: number;
  };
  liquidity?: {
    usd: number;
    base: number;
    quote: number;
  };
  fdv?: number;
  pairCreatedAt?: number;
  info?: {
    imageUrl?: string;
    websites?: { label: string; url: string }[];
    socials?: { type: string; url: string }[];
  };
}

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

async function fetchSearch(query: string): Promise<DexPair[]> {
  try {
    const response = await fetch(`https://api.dexscreener.com/latest/dex/search?q=${query}`, {
      headers: { 'User-Agent': USER_AGENT }
    });
    if (!response.ok) return [];
    const data = await response.json();
    return data.pairs || [];
  } catch {
    return [];
  }
}

export async function getSolanaPairs(): Promise<DexPair[]> {
  // We search for multiple terms to get a better breadth of real Solana pairs
  // since the API is search-limited.
  const searches = ['raydium', 'jupiter', 'pump', 'orca'];
  
  try {
    const allResults = await Promise.all(searches.map(fetchSearch));
    const flatResults = allResults.flat();
    
    // Deduplicate by pairAddress
    const seen = new Set();
    const unique = flatResults.filter(p => {
      if (seen.has(p.pairAddress)) return false;
      seen.add(p.pairAddress);
      return true;
    });

    // Final chain filtering to be safe
    return unique.filter(p => p.chainId === 'solana');
  } catch (error) {
    console.error('DexScreener multi-fetch error:', error);
    return [];
  }
}
