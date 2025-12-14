This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```
## Portfolio Dashboard
s
A real-time stock portfolio dashboard built with Next.js that fetches live stock prices from Yahoo Finance and P/E ratios from Google Finance.

### Features
- Real-time stock price updates from Yahoo Finance Chart API
- P/E ratio data scraped from Google Finance
- Auto-refresh every 15 seconds
- Support for NSE and BSE listed stocks
- Responsive table view with current market price (CMP) and P/E ratio

## Technical Challenges & Solutions

### Yahoo Finance Integration

#### Challenges Faced
1. **No Simple Official API**: Yahoo's documented APIs are limited or require authentication. The obvious JSON quote endpoint failed and returned errors instead of data.

2. **HTML Scraping Problems**: The visible price on Yahoo Finance is injected by JavaScript after page load, so the initial HTML did not contain the number. Direct HTML requests from Node.js were blocked or unreliable.

3. **Network / Rate-Limit Concerns**: Direct scraping is fragile, breaks when HTML changes, and can hit rate limits or anti-bot protections, causing "fetch failed" errors and making the dashboard unstable.

#### Solution Implemented
- **Switched to Yahoo's Chart API** (`/v8/finance/chart/{symbol}`), which returns structured JSON including `regularMarketPrice` for a symbol.
- **Backend Route Implementation**: Created `/yahoo?symbol=...` route, so the frontend hits our server, and the server communicates with Yahoo in a controlled way.
- **Architecture Benefits**: This design makes it easy to add caching and throttling later to respect Yahoo's limits and keep responses fast.

**API Endpoint**: `https://query1.finance.yahoo.com/v8/finance/chart/{SYMBOL}?interval=1d&range=1d`

### Google Finance Integration

#### Challenges Faced
1. **No Public API**: Google Finance removed their public API years ago, leaving no official way to fetch stock data programmatically.

2. **JavaScript-Rendered Content**: Similar to Yahoo, Google Finance loads data dynamically via JavaScript, making simple HTML requests insufficient.

3. **Complex HTML Structure**: The P/E ratio is embedded deep in the HTML with specific CSS classes that could change without notice.

4. **Web Scraping Fragility**: 
   - Initial regex patterns failed to match the actual HTML structure
   - Required User-Agent headers to avoid being blocked
   - HTML structure differences between curl testing and actual Node.js fetch responses

5. **URL Format Issues**: Initial implementation had bugs with symbol conversion (e.g., generating `HDFCBANK:NSE:BSE` instead of `HDFCBANK:NSE`), causing pages to not be found.

#### Solution Implemented
- **Web Scraping Approach**: Since no API exists, implemented HTML scraping with proper User-Agent headers.
- **Regex Pattern Matching**: Used regex to extract P/E ratio from the `P6K39c` CSS class: `/P\/E ratio<\/div>.*?<div class="P6K39c">([0-9.]+)<\/div>/is`
- **Symbol Conversion Logic**: Fixed logic to properly convert Yahoo symbols (e.g., `HDFCBANK.NS`) to Google Finance format (`HDFCBANK:NSE`)
- **Debugging Approach**: Added comprehensive logging to compare actual HTML received vs expected structure

**URL Format**: `https://www.google.com/finance/quote/{SYMBOL}:{EXCHANGE}`

#### Trade-offs
- **Reliability**: Web scraping is inherently fragile and may break if Google changes their HTML structure
- **Maintenance**: Requires monitoring and potential regex updates if HTML structure changes
- **Performance**: Slower than API calls due to full HTML page fetching and parsing

### General Architecture Decisions

1. **Server-Side Data Fetching**: Both Yahoo and Google data are fetched from backend API routes (`/portfolio`) to:
   - Hide API implementation details from the client
   - Enable future caching and rate limiting
   - Provide a consistent interface for the frontend

2. **Error Handling**: Graceful degradation - if data fetch fails, displays "N/A" instead of crashing

3. **Real-time Updates**: Frontend polls the backend every 15 seconds for fresh data

## API Routes

- `GET /portfolio` - Fetches enriched portfolio data (CMP from Yahoo + P/E from Google)
- `GET /yahoo?symbol={SYMBOL}` - Test endpoint for Yahoo Finance data
- `GET /google?symbol={SYMBOL}` - Test endpoint for Google Finance data
