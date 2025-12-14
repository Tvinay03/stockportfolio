export type StockSector =
  | "Financial"
  | "Tech"
  | "Consumer"
  | "Power"
  | "Pipe"
  | "Others";

export interface StockHolding {
  id: number;                // 1, 2, 3...
  name: string;              // "HDFC Bank"
  symbol: string;            // "HDFCBANK.NS"
  sector: StockSector;       // "Financial"
  exchange: "NSE" | "BSE";

  purchasePrice: number;     // 1490
  quantity: number;          // 50

  // derived (can be computed in code)
  investment?: number;       // purchasePrice * quantity
  portfolioPercent?: number; // (investment / totalInvestment) * 100

  cmp?: number;              // from Yahoo
  presentValue?: number;     // cmp * quantity
  gainLoss?: number;         // presentValue - investment

  peRatio?: number;          // from Google
  latestEarnings?: number;   // from Google
}