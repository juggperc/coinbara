import { NextRequest, NextResponse } from 'next/server';
import { getSolanaPairs } from '../../../lib/services/dexscreener';
import { applyChewAlgorithm, FilterOptions } from '../../../lib/algorithm/chew';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const filters: FilterOptions = {
      minLiquidity: Number(searchParams.get('minLiquidity')) || 15000,
      minFdv: Number(searchParams.get('minFdv')) || 50000,
      minAge: Number(searchParams.get('minAge')) || 1,
      requireSocials: searchParams.get('requireSocials') === 'true',
    };

    const pairs = await getSolanaPairs();
    const scoredPairs = applyChewAlgorithm(pairs, filters);
    
    return NextResponse.json(scoredPairs);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}
