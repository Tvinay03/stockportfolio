import { NextResponse } from "next/server";
import { fetchYahooCmp, fetchGoogleMetrics } from "@/lib/finance";

interface StockHolding {
  id: number;
  name: string;
  symbol: string;
  sector: string;
  exchange: "NSE" | "BSE";
  purchasePrice: number;
  quantity: number;
}

const holdings: StockHolding[] = [
  {
    id: 1,
    name: "HDFC Bank",
    symbol: "HDFCBANK.NS",
    sector: "Financial",
    exchange: "NSE",
    purchasePrice: 1490,
    quantity: 50,
  },
  {
    id: 2,
    name: "Bajaj Finance",
    symbol: "BAJFINANCE.NS",
    sector: "Financial",
    exchange: "NSE",
    purchasePrice: 6466,
    quantity: 15,
  },
  {
    id: 3,
    name: "Affle India",
    symbol: "AFFLE.NS",
    sector: "Tech",
    exchange: "NSE",
    purchasePrice: 1151,
    quantity: 50,
  },
  {
    id: 4,
    name: "Dmart",
    symbol: "DMART.NS",
    sector: "Consumer",
    exchange: "NSE",
    purchasePrice: 3777,
    quantity: 27,
  },
];

export async function GET() {
  try {
    const enriched = await Promise.all(
      holdings.map(async (stock) => {
        const [yahoo, google] = await Promise.all([
          fetchYahooCmp(stock.symbol),
          fetchGoogleMetrics(stock.symbol.replace(".NS", ":NSE")),
        ]);

        const investment = stock.purchasePrice * stock.quantity;
        const cmp = yahoo.cmp || 0;
        const presentValue = cmp * stock.quantity;
        const gainLoss = presentValue - investment;

        return {
          ...stock, 
          investment,
          cmp,
          presentValue,
          gainLoss,
          peRatio: google.peRatio,
        };
      })
    );


    const totalInvestment = enriched.reduce((sum, s) => sum + s.investment, 0);

    const withPercent = enriched.map((s) => ({
      ...s,
      portfolioPercent: (s.investment / totalInvestment) * 100,
    }));

    return NextResponse.json({
      totalInvestment,
      holdings: withPercent,
    });
  } catch (error: unknown) {
    console.error("Error enriching holdings:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      },
      { status: 500 }
    );
  }
}
