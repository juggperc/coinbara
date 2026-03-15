import { DexPair } from '../services/dexscreener';

export interface ScoredPair extends DexPair {
  chewScore: number;
  chewSignals: {
    label: string;
    isPositive: boolean;
    description: string;
  }[];
}

export interface FilterOptions {
  minLiquidity: number;
  minFdv: number;
  minAge: number; // in hours
  requireSocials: boolean;
}

export function applyChewAlgorithm(pairs: DexPair[], filters?: FilterOptions): ScoredPair[] {
  const defaultFilters: FilterOptions = {
    minLiquidity: 15000,
    minFdv: 50000,
    minAge: 1,
    requireSocials: false,
  };

  const activeFilters = { ...defaultFilters, ...filters };

  return pairs
    .filter((p) => {
      // Basic Solana filtering
      if (p.chainId !== 'solana') return false;
      if (p.baseToken.symbol === 'SOL' || p.baseToken.symbol === 'WSOL') return false;

      // Apply dynamic filters
      const liquidity = p.liquidity?.usd || 0;
      const fdv = p.fdv || 0;
      const ageHours = p.pairCreatedAt ? (Date.now() - p.pairCreatedAt) / (1000 * 60 * 60) : 0;
      const hasSocials = p.info?.socials?.length && p.info.socials.length > 0;

      if (liquidity < activeFilters.minLiquidity) return false;
      if (fdv < activeFilters.minFdv) return false;
      if (ageHours < activeFilters.minAge) return false;
      if (activeFilters.requireSocials && !hasSocials) return false;

      return true;
    })
    .map((pair) => {
      let score = 0;
      const signals: ScoredPair['chewSignals'] = [];

      const liquidity = pair.liquidity?.usd || 0;
      const fdv = pair.fdv || 0;
      const vol24h = pair.volume?.h24 || 0;
      const ageHours = pair.pairCreatedAt ? (Date.now() - pair.pairCreatedAt) / (1000 * 60 * 60) : 0;
      const txns24h = pair.txns?.h24 || { buys: 0, sells: 0 };

      // 1. Liquidity Depth (Up to 30 points)
      if (liquidity > 500000) {
        score += 30;
        signals.push({ label: 'Deep Liquidity', isPositive: true, description: 'Very high liquidity depth.' });
      } else if (liquidity > 100000) {
        score += 20;
        signals.push({ label: 'Healthy Liquidity', isPositive: true, description: 'Solid liquidity for the current FDV.' });
      } else if (liquidity > 30000) {
        score += 10;
        signals.push({ label: 'Moderate Liquidity', isPositive: true, description: 'Sufficient for small to medium trades.' });
      }

      // 2. Volume/Liquidity Ratio (Organic Growth check - Up to 20 points)
      const volLiqRatio = liquidity > 0 ? vol24h / liquidity : 0;
      if (volLiqRatio >= 0.5 && volLiqRatio <= 5) {
        score += 20;
        signals.push({ label: 'Organic Volume', isPositive: true, description: 'Healthy trading activity relative to liquidity.' });
      } else if (volLiqRatio > 5) {
        score += 5;
        signals.push({ label: 'High Activity', isPositive: true, description: 'High volume, potentially bot-driven but active.' });
      }

      // 3. Buy/Sell Ratio (Up to 15 points)
      const buyRatio = txns24h.sells > 0 ? txns24h.buys / txns24h.sells : 1;
      if (buyRatio > 1.2) {
        score += 15;
        signals.push({ label: 'Strong Demand', isPositive: true, description: 'More buyers than sellers in last 24h.' });
      } else if (buyRatio > 0.8) {
        score += 5;
        signals.push({ label: 'Balanced Trade', isPositive: true, description: 'Healthy mix of buys and sells.' });
      }

      // 4. Social Presence (Up to 15 points)
      const hasWebsite = pair.info?.websites && pair.info.websites.length > 0;
      const hasTwitter = pair.info?.socials?.some(s => s.type === 'twitter');
      if (hasWebsite && hasTwitter) {
        score += 15;
        signals.push({ label: 'Full Socials', isPositive: true, description: 'Found both website and Twitter.' });
      } else if (hasTwitter) {
        score += 5;
        signals.push({ label: 'Twitter Found', isPositive: true, description: 'Active Twitter presence.' });
      }

      // 5. Age Premium (Up to 20 points)
      if (ageHours > 72) {
        score += 20;
        signals.push({ label: 'Lindy Effect', isPositive: true, description: 'Has survived more than 3 days.' });
      } else if (ageHours > 24) {
        score += 10;
        signals.push({ label: 'Day 1 Survivor', isPositive: true, description: 'Successfully navigated the first 24 hours.' });
      }

      return {
        ...pair,
        chewScore: Math.min(Math.max(score, 0), 100),
        chewSignals: signals.sort((a, b) => (b.isPositive ? 1 : 0) - (a.isPositive ? 1 : 0)),
      };
    })
    .filter(p => p.chewScore >= 40)
    .sort((a, b) => b.chewScore - a.chewScore);
}
