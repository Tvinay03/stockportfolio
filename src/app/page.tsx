"use client";

import React, { useEffect, useState } from "react";

interface HoldingRow {
  id: number;
  name: string;
  symbol: string;
  sector: string;
  exchange: "NSE" | "BSE";
  purchasePrice: number;
  quantity: number;
  investment: number;
  cmp: number;
  presentValue: number;
  gainLoss: number;
  portfolioPercent: number;
  peRatio: number | null;
  latestEarnings?: number;
}

export default function HomePage() {
  const [rows, setRows] = useState<HoldingRow[]>([]);
  const [totalInvestment, setTotalInvestment] = useState(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    async function load(isFirstLoad: boolean) {
      try {
        // setLoading(true);
        if (!isFirstLoad) {
          setIsRefreshing(true);
        } else {
          setLoading(true);
        }
        const res = await fetch("/portfolio", { cache: "no-store" });
        console.log("Fetching portfolio data");
        if (!res.ok) {
          console.error("Failed to fetch portfolio data:", res.statusText);
          return;
        }
        const data = await res.json();
        setRows(data.holdings);
        setTotalInvestment(data.totalInvestment);
      } catch (error) {
        console.error("Failed to load portfolio data:", error);
      } finally {
        if (isFirstLoad) {
          setLoading(false);
        } else {
          setIsRefreshing(false);
        }
      }
    }
    load(true);
    // eslint-disable-next-line prefer-const
    timer = setInterval(() => load(false), 15000);
    return () => clearInterval(timer);
  }, []);

  function groupBySector(rows: HoldingRow[]) {
    type SectorAgg = {
      totalInvestment: number;
      totalPresentValue: number;
      totalGainLoss: number;
      items: HoldingRow[];
    };

    const sectors = new Map<string, SectorAgg>();

    for (const row of rows) {
      if (!sectors.has(row.sector)) {
        sectors.set(row.sector, {
          totalInvestment: 0,
          totalPresentValue: 0,
          totalGainLoss: 0,
          items: [],
        });
      }

      const sector = sectors.get(row.sector)!;

      sector.items.push(row);
      sector.totalInvestment += row.investment;
      sector.totalPresentValue += row.presentValue;
      sector.totalGainLoss += row.gainLoss;
    }

    return sectors;
  }

  function getTable() {
    const sectors = groupBySector(rows);
    return (
      <>
        {isRefreshing && (
          <p className="text-xs text-gray-400 mb-2">Updating prices...</p>
        )}
        <h1 className="text-3xl font-bold mb-6">Portfolio Dashboard</h1>

        <p className="mb-4 font-semibold">
          Total Investment: ₹{totalInvestment.toLocaleString()}
        </p>

        {Array.from(sectors.entries()).map(([sectorName, sector]) => (
          <div key={sectorName} className="mb-10">
            <h2 className="text-2xl font-bold mb-2">{sectorName} Sector</h2>
            <p className="mb-2 text-sm">
              Investment: ₹{sector.totalInvestment.toLocaleString()} • Present:
              ₹{sector.totalPresentValue.toLocaleString()} • Gain/Loss:{" "}
              <span
                className={
                  sector.totalGainLoss > 0
                    ? "text-green-500 font-semibold"
                    : sector.totalGainLoss < 0
                    ? "text-red-500 font-semibold"
                    : ""
                }
              >
                ₹{sector.totalGainLoss.toLocaleString()}
              </span>
            </p>

            <table className="min-w-full border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left text-black">Stock</th>
                  <th className="px-4 py-2 text-left text-black">Purchase</th>
                  <th className="px-4 py-2 text-left text-black">Qty</th>
                  <th className="px-4 py-2 text-left text-black">Investment</th>
                  <th className="px-4 py-2 text-left text-black">CMP</th>
                  <th className="px-4 py-2 text-left text-black">
                    Present Value
                  </th>
                  <th className="px-4 py-2 text-left text-black">Gain/Loss</th>
                  <th className="px-4 py-2 text-left text-black">
                    Portfolio %
                  </th>
                  <th className="px-4 py-2 text-left text-black">P/E Ratio</th>
                </tr>
              </thead>
              <tbody>
                {sector.items.map((row) => {
                  const gainClass =
                    row.gainLoss > 0
                      ? "text-green-600"
                      : row.gainLoss < 0
                      ? "text-red-600"
                      : "";
                  return (
                    <tr key={row.id} className="border-t">
                      <td className="px-4 py-2">{row.name}</td>
                      <td className="px-4 py-2">₹{row.purchasePrice}</td>
                      <td className="px-4 py-2">{row.quantity}</td>
                      <td className="px-4 py-2">₹{row.investment}</td>
                      <td className="px-4 py-2">₹{row.cmp}</td>
                      <td className="px-4 py-2">₹{row.presentValue}</td>
                      <td className={`px-4 py-2 font-semibold ${gainClass}`}>
                        ₹{row.gainLoss}
                      </td>
                      <td className="px-4 py-2">
                        {row.portfolioPercent.toFixed(1)}%
                      </td>
                      <td className="px-4 py-2">
                        {row.peRatio ? row.peRatio.toFixed(2) : "N/A"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ))}
      </>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {loading ? <p>Loading portfolio data...</p> : getTable()}
    </div>
  );
}
