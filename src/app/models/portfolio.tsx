import { StockHolding } from "./stock";

export interface Portfolio {
  ownerName: string;         
  holdings: StockHolding[];
  totalInvestment: number;   
  totalPresentValue?: number;
  totalGainLoss?: number;
}
