# 🐹 Coinbara

Coinbara is a professional-grade Solana memecoin discovery and execution terminal. It combines real-time multi-source scanning with advanced trading controls and AI-powered research.

![Coinbara Preview](public/logo.png)

## 🚀 Features

### 🔍 Discovery ("Chew" Tab)
- **Multi-Source Discovery:** Scans Raydium, Jupiter, Orca, and Pump.fun in real-time.
- **"Holdable" Algorithm:** A proprietary scoring system (0-100) that filters for longevity. It analyzes:
  - Liquidity Depth vs FDV
  - 24h Buy/Sell Ratios
  - Social Presence (Twitter/Websites)
  - Token Age & "Lindy Effect" survival
- **High-Density UI:** Switch between detailed **Grid View** and compact **List View**.

### 🤖 AI Research ("Burrow" Tab)
- **CapyAI Assistant:** A Shadcn-powered chatbot integrated with OpenRouter.
- **Context-Aware:** The AI has full access to the current top-scored tokens and their live market metrics.
- **Custom Models:** Support for any OpenRouter model (Claude 3, GPT-4, etc.) via user-provided API keys.

### ⚡ Execution
- **Phantom Wallet Integration:** Native Solana wallet adapter with live balance tracking.
- **Advanced Trade Pop-outs:** Surgical Buy/Sell controls with:
  - Adjustable Slippage
  - Priority Fees
  - **MEV Protection:** Optional bundling through Jito.
- **Quick-Buy:** Preset SOL amounts for ultra-fast entry.

## 🛠 Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS + Shadcn UI + Radix UI
- **Font:** Vercel Geist (Sans & Mono)
- **AI:** Vercel AI SDK + OpenRouter
- **Web3:** @solana/web3.js + Wallet Adapter

## 🏁 Getting Started

### Prerequisites
- Node.js 18+
- A Phantom Wallet
- (Optional) OpenRouter API Key for the Burrow tab

### Installation
1. Clone the repo:
   ```bash
   git clone https://github.com/juggperc/coinbara.git
   ```
2. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000)

## ⚖️ Disclaimer
Memecoins are high-risk assets. Coinbara is a tool for discovery and data analysis; it does not provide financial advice. Always DYOR (Do Your Own Research) and never risk more than you can afford to lose.

---
Built with 🐹 by juggperc
