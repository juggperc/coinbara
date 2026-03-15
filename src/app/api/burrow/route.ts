import { NextRequest, NextResponse } from 'next/server';
import { getSolanaPairs } from '../../../lib/services/dexscreener';
import { applyChewAlgorithm } from '../../../lib/algorithm/chew';
import { OpenAI } from 'openai';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { messages, apiKey, model } = await request.json();

    if (!apiKey) {
      return new Response('Missing OpenRouter API Key', { status: 400 });
    }

    const openai = new OpenAI({
      apiKey: apiKey,
      baseURL: 'https://openrouter.ai/api/v1',
      defaultHeaders: {
        'HTTP-Referer': 'https://coinbara.com',
        'X-Title': 'Coinbara',
      },
    });

    // 1. Fetch live data for context
    const rawPairs = await getSolanaPairs();
    const scoredPairs = applyChewAlgorithm(rawPairs).slice(0, 10); // Top 10 for context window efficiency

    const systemPrompt = `You are "CapyAI", an expert Solana memecoin researcher for the app "Coinbara".
You have access to real-time market data. Your goal is to help users find "Holdables" - tokens with longevity potential, not pump and dumps.

CURRENT TOP 10 TOKENS FROM SCANNER:
${JSON.stringify(scoredPairs.map(p => ({
  symbol: p.baseToken.symbol,
  address: p.baseToken.address,
  score: p.chewScore,
  liquidity: p.liquidity?.usd,
  fdv: p.fdv,
  age: (Date.now() - (p.pairCreatedAt || 0)) / 3600000 + " hours",
  signals: p.chewSignals.map(s => s.label).join(', ')
})), null, 2)}

INSTRUCTIONS:
- Analyze tokens based on liquidity depth, FDV sustainability, and social signals.
- If a user asks about a specific token or "what to buy", reference the provided data.
- You can present tokens using a special tool format.
- Keep responses professional yet slightly playful (capybara themed).
- NEVER give financial advice. Always include a disclaimer that memecoins are high risk.

TOOLS:
If you want to display a token card inline, use this syntax: [TOKEN_CARD: <address>]
Example: "I found this interesting: [TOKEN_CARD: 7xykr7rz9pwzlbxpyq385agecdzpabfhzhn3jsudymrp]"`;

    const response = await openai.chat.completions.create({
      model: model || 'anthropic/claude-3-haiku',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      stream: true,
    });

    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of response) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            controller.enqueue(new TextEncoder().encode(content));
          }
        }
        controller.close();
      },
    });

    return new Response(stream);
  } catch (error: any) {
    console.error('Burrow AI Error:', error);
    return new Response(error.message || 'AI error', { status: 500 });
  }
}
