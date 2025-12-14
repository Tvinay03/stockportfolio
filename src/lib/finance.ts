const YAHOO_API_BASE = "https://query1.finance.yahoo.com/v8/finance/chart/";

export async function fetchYahooCmp(symbol: string) {
  console.log("Fetching CMP for symbol:", symbol);

  try {
    const res = await fetch(`${YAHOO_API_BASE}${symbol}?interval=1d&range=1d`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      console.error(`Yahoo API returned status ${res.status} for ${symbol}`);
      return { symbol, cmp: null };
    }

    /**
     * 
    const html = await res.text();
    const $ = cheerio.load(html);

    const priceText = $('span[data-testid="qsp-price"]').first().text().trim();

    const cmp = priceText ? parseFloat(priceText.replace(/,/g, "")) : null;

    console.log("Scraped Yahoo CMP:", symbol, priceText, "→", cmp);
     */

    const data = await res.json();

    const result = data?.chart?.result?.[0];
    const meta = result?.meta;
    const cmp = meta?.regularMarketPrice ?? null;

    console.log("Fetched Yahoo CMP:", symbol, cmp);

    return { symbol, cmp };
  } catch (error: unknown) {
    console.error(
      "Error fetching Yahoo CMP for symbol:",
      symbol,
      (error as Error).message
    );
    return { symbol, cmp: null };
  }
}

export async function fetchGoogleMetrics(symbol: string) {
  console.log("Fetching PE ratio from Google Finance for:", symbol);

  try {
    // If symbol already contains exchange (e.g., "HDFCBANK:NSE"), use it as-is
    // Otherwise, extract from .NS or .BO suffix
    let googleUrl: string;
    let symbolForDisplay: string;
    
    if (symbol.includes(":")) {
      googleUrl = `https://www.google.com/finance/quote/${symbol}`;
      symbolForDisplay = symbol;
    } else {
      const googleSymbol = symbol.replace(".NS", "").replace(".BO", "");
      const exchange = symbol.includes(".NS") ? "NSE" : "BSE";
      googleUrl = `https://www.google.com/finance/quote/${googleSymbol}:${exchange}`;
      symbolForDisplay = `${googleSymbol}:${exchange}`;
    }

    const res = await fetch(googleUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      console.error(
        `Google Finance fetch failed: ${res.status} for ${symbolForDisplay}`
      );
      return { symbol, peRatio: null };
    }

    const html = await res.text();
    
    // Find P/E ratio section
    const peIndex = html.indexOf("P/E ratio");
    if (peIndex >= 0) {
      console.log("HTML around P/E ratio:", html.substring(peIndex, peIndex + 200));
    }

    const peMatch = html.match(
      /P\/E ratio<\/div>.*?<div class="P6K39c">([0-9.]+)<\/div>/is
    );
    const peRatio = peMatch ? parseFloat(peMatch[1]) : null;

    console.log("Fetched PE Ratio from Google:", symbolForDisplay, peRatio);

    return { symbol, peRatio };
  } catch (error: unknown) {
    console.error(
      "Error fetching PE ratio from Google Finance:",
      symbol,
      (error as Error).message
    );
    return { symbol, peRatio: null };
  }
}
