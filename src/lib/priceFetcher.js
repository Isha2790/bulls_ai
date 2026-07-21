/**
 * @fileoverview Network Data Integration Subsystem - Upstox Core Broker
 * Intercepts, proxies, and transforms multi-source live asynchronous REST streams.
 * Engineered with bidirectional index maps to minimize iteration query footprints.
 */

const UPSTOX_BASE = import.meta.env.VITE_UPSTOX_BASE_URL || 'https://api.upstox.com/v2';
const UPSTOX_API_KEY = import.meta.env.VITE_UPSTOX_API_KEY || '';
const UPSTOX_WS_URL = import.meta.env.VITE_UPSTOX_WS_URL || '';
const UPSTOX_WS_TOKEN = import.meta.env.VITE_UPSTOX_WS_TOKEN || UPSTOX_API_KEY;
const USE_UPSTOX = Boolean(UPSTOX_API_KEY);
const USE_UPSTOX_WS = Boolean(UPSTOX_WS_URL && UPSTOX_WS_TOKEN);

/**
 * Standard Institutional Asset Core Ticker Mappings
 */
const UPSTOX_SYMBOL_MAP = Object.freeze({
  RELIANCE: 'NSE_EQ|RELIANCE', TCS: 'NSE_EQ|TCS', HDFCBANK: 'NSE_EQ|HDFCBANK', INFY: 'NSE_EQ|INFY',
  ICICIBANK: 'NSE_EQ|ICICIBANK', BHARTIARTL: 'NSE_EQ|BHARTIARTL', SBIN: 'NSE_EQ|SBIN', ITC: 'NSE_EQ|ITC',
  LT: 'NSE_EQ|LT', AXISBANK: 'NSE_EQ|AXISBANK', KOTAKBANK: 'NSE_EQ|KOTAKBANK', HINDUNILVR: 'NSE_EQ|HINDUNILVR',
  MARUTI: 'NSE_EQ|MARUTI', ASIANPAINT: 'NSE_EQ|ASIANPAINT', WIPRO: 'NSE_EQ|WIPRO', TATAMOTORS: 'NSE_EQ|TATAMOTORS',
  SUNPHARMA: 'NSE_EQ|SUNPHARMA', TITAN: 'NSE_EQ|TITAN', ULTRACEMCO: 'NSE_EQ|ULTRACEMCO', NESTLEIND: 'NSE_EQ|NESTLEIND',
  BAJFINANCE: 'NSE_EQ|BAJFINANCE', POWERGRID: 'NSE_EQ|POWERGRID', NTPC: 'NSE_EQ|NTPC', HCLTECH: 'NSE_EQ|HCLTECH',
  ONGC: 'NSE_EQ|ONGC', COALINDIA: 'NSE_EQ|COALINDIA', ADANIENT: 'NSE_EQ|ADANIENT', JSWSTEEL: 'NSE_EQ|JSWSTEEL',
  TECHM: 'NSE_EQ|TECHM', HEROMOTOCO: 'NSE_EQ|HEROMOTOCO',
});

const INDEX_SYMBOLS = Object.freeze({
  NIFTY50: 'NSE_INDEX|Nifty 50',
  SENSEX: 'BSE_INDEX|SENSEX',
  INDIAVIX: 'NSE_INDEX|India VIX',
});

// High-performance inversion dictionary enabling O(1) cross-reference ticks
const REVERSE_UPSTOX_SYMBOL_MAP = Object.freeze(
  Object.entries(UPSTOX_SYMBOL_MAP).reduce((acc, [internalKey, upstoxValue]) => {
    acc[upstoxValue] = internalKey;
    return acc;
  }, {})
);

const REVERSE_INDEX_SYMBOLS = Object.freeze(
  Object.entries(INDEX_SYMBOLS).reduce((acc, [internalKey, indexValue]) => {
    acc[indexValue] = internalKey;
    return acc;
  }, {})
);

const CORS_PROXIES = Object.freeze([
  (url) => `https://corsproxy.io/?url=${encodeURIComponent(url)}`,
  (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
]);

/**
 * Orchestrates multi-proxy traversal loop configurations with custom abort triggers.
 * @param {string} targetUrl - Upstream target asset API URL
 * @returns {object|null} Unwrapped structured network payload
 */
async function fetchWithProxies(targetUrl) {
  for (const proxyGenerator of CORS_PROXIES) {
    try {
      const networkResponse = await fetch(proxyGenerator(targetUrl), { 
        signal: AbortSignal.timeout(8000) 
      });
      
      if (networkResponse.ok) {
        const rawPayload = await networkResponse.json();
        return typeof rawPayload === 'string' ? JSON.parse(rawPayload) : rawPayload;
      }
    } catch (networkException) {
      console.warn(`[Network Warning]: Proxy extraction failed for node connection. Shifting tunnel.`);
    }
  }
  return null;
}

async function fetchDirectFromUpstox(requestEndpoint) {
  if (!requestEndpoint) return null;

  try {
    const response = await fetch(requestEndpoint, {
      headers: {
        Accept: 'application/json',
        ...(USE_UPSTOX ? { Authorization: `Bearer ${UPSTOX_API_KEY}` } : {}),
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      console.warn('[Upstox] request failed with', response.status);
      return null;
    }

    return await response.json();
  } catch (err) {
    console.warn('[Upstox] request failed:', err);
    return null;
  }
}

function resolveInternalSymbolKey(symbolOrInstrumentKey) {
  if (!symbolOrInstrumentKey) return null;

  if (REVERSE_UPSTOX_SYMBOL_MAP[symbolOrInstrumentKey]) {
    return REVERSE_UPSTOX_SYMBOL_MAP[symbolOrInstrumentKey];
  }

  if (UPSTOX_SYMBOL_MAP[symbolOrInstrumentKey]) {
    return symbolOrInstrumentKey;
  }

  if (typeof symbolOrInstrumentKey === 'string') {
    const cleaned = symbolOrInstrumentKey.replace(/^NSE_EQ\|/, '').replace(/^BSE_EQ\|/, '').replace(/\.NS$/, '');
    return cleaned || null;
  }

  return null;
}

function normalizeQuotePayload(rawPayload) {
  const price = rawPayload.last_price ?? rawPayload.lastPrice ?? rawPayload.ltp ?? rawPayload.price ?? rawPayload.close ?? 0;
  const prevClose = rawPayload.previous_close ?? rawPayload.prevClose ?? rawPayload.prev_close ?? 0;
  const open = rawPayload.open ?? 0;
  const high = rawPayload.high ?? 0;
  const low = rawPayload.low ?? 0;
  const volume = rawPayload.volume ?? 0;
  const change = rawPayload.change ?? ((Number(price) || 0) - (Number(prevClose) || 0));
  const computedChangePercent = Number(prevClose)
    ? ((Number(price) - Number(prevClose)) / Number(prevClose)) * 100
    : 0;
  const changePercent = rawPayload.change_percent ?? rawPayload.percent_change ?? rawPayload.changePercent ?? rawPayload.regularMarketChangePercent ?? computedChangePercent;

  return {
    price: Number(price) || 0,
    prevClose: Number(prevClose) || 0,
    open: Number(open) || 0,
    high: Number(high) || 0,
    low: Number(low) || 0,
    volume: Number(volume) || 0,
    change: Number(change) || 0,
    changePercent: Number(changePercent) || 0,
    fiftyTwoWeekHigh: rawPayload['52_week_high'] ?? rawPayload.fiftyTwoWeekHigh ?? 0,
    fiftyTwoWeekLow: rawPayload['52_week_low'] ?? rawPayload.fiftyTwoWeekLow ?? 0,
  };
}

// Adapter to fetch quotes from Upstox (v2 market-quote with chunking)
async function fetchFromUpstox(symbols) {
  if (!USE_UPSTOX) return null;
  
  try {
    const instrumentKeys = symbols.map((ticker) => {
      const mapped = UPSTOX_SYMBOL_MAP[ticker] || ticker;
      return encodeURIComponent(mapped);
    });
    
    // Chunk keys into max 15 per request to prevent 400 URL length errors
    const CHUNK_SIZE = 15;
    const chunks = [];
    for (let i = 0; i < instrumentKeys.length; i += CHUNK_SIZE) {
      chunks.push(instrumentKeys.slice(i, i + CHUNK_SIZE));
    }

    const mappedQuotes = {};

    for (const chunk of chunks) {
      const keysParam = chunk.join(',');
      const url = `${UPSTOX_BASE}/market-quote/quotes?instrument_key=${keysParam}`;

      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${UPSTOX_API_KEY}`,
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(8000),
      });

      if (res.ok) {
        const payload = await res.json();
        const quotesData = payload.data || {};

        for (const [key, quoteObj] of Object.entries(quotesData)) {
          const internalKey = resolveInternalSymbolKey(key);
          if (internalKey) {
            mappedQuotes[internalKey] = normalizeQuotePayload(quoteObj);
          }
        }
      }
    }

    return Object.keys(mappedQuotes).length > 0 ? mappedQuotes : null;
  } catch (err) {
    console.warn('[Upstox Fetch Exception]:', err);
    return null;
  }
}

/**
 * Compiles a real-time data matrix tracking current selected stock parameters.
 * @param {string[]} symbols - Internal structural target tracking symbols array
 * @returns {Promise<object|null>} 
 */
export async function fetchRealQuotes(symbols) {
  if (!symbols || symbols.length === 0) return null;
  if (USE_UPSTOX) {
    const upstoxQuotes = await fetchFromUpstox(symbols);
    if (upstoxQuotes && Object.keys(upstoxQuotes).length > 0) return upstoxQuotes;
  }

  if (USE_UPSTOX) {
    return await fetchFromUpstox(symbols);
  }
  return null;

  const realTimeQuotesMatrix = {};

  for (const assetItem of responseData.quoteResponse.result) {
    const internalTickerToken = REVERSE_UPSTOX_SYMBOL_MAP[assetItem.symbol];
    if (!internalTickerToken) continue;

    realTimeQuotesMatrix[internalTickerToken] = {
      price: assetItem.regularMarketPrice ?? 0,
      prevClose: assetItem.regularMarketPreviousClose ?? 0,
      open: assetItem.regularMarketOpen ?? 0,
      high: assetItem.regularMarketDayHigh ?? 0,
      low: assetItem.regularMarketDayLow ?? 0,
      volume: assetItem.regularMarketVolume ?? 0,
      change: assetItem.regularMarketChange ?? 0,
      changePercent: assetItem.regularMarketChangePercent ?? 0,
      fiftyTwoWeekHigh: assetItem.fiftyTwoWeekHigh ?? 0,
      fiftyTwoWeekLow: assetItem.fiftyTwoWeekLow ?? 0,
    };
  }
  
  return realTimeQuotesMatrix;
}
/**
 * Retrieves core tracking composite index states from the active market pipeline.
 * @returns {Promise<object|null>} 
 */
export async function fetchRealIndices() {
  if (!USE_UPSTOX) return null;
  
  const compositeKeys = Object.values(INDEX_SYMBOLS).map(k => encodeURIComponent(k)).join(',');
  const indexEndpoint = `${UPSTOX_BASE}/market-quote/quotes?instrument_key=${compositeKeys}`;
  
  try {
    const res = await fetch(indexEndpoint, {
      headers: {
        'Authorization': `Bearer ${UPSTOX_API_KEY}`,
        'Accept': 'application/json',
      },
    });

    if (!res.ok) return null;
    const payload = await res.json();
    const data = payload.data || {};

    const activeIndicesMatrix = {};
    const indexLabelMappings = { NIFTY50: 'NIFTY 50', SENSEX: 'SENSEX', INDIAVIX: 'INDIA VIX' };

    for (const [key, item] of Object.entries(data)) {
      const internalKey = REVERSE_INDEX_SYMBOLS[key];
      if (!internalKey) continue;

      activeIndicesMatrix[internalKey] = {
        name: indexLabelMappings[internalKey] || internalKey,
        value: item.last_price ?? 0,
        prevClose: item.ohlc?.close ?? 0,
        change: item.net_change ?? 0,
        changePercent: item.percentage_change ?? 0,
      };
    }
    return activeIndicesMatrix;
  } catch (err) {
    return null;
  }
}

/**
 * Builds candlestick coordinate matrices for charting rendering systems.
 */
export async function fetchCandles(symbol, range = '1d', interval = '5m') {
  const targetedUpstoxSymbol = UPSTOX_SYMBOL_MAP[symbol] || symbol;
  const intervalKey = interval === '1d' ? 'day' : '5minute';
  const today = new Date().toISOString().split('T')[0];

  // Upstox V2 candles endpoint without extra /market-quote/ subpath
  const analyticalChartEndpoint = `https://api.upstox.com/v2/historical-candle/${encodeURIComponent(targetedUpstoxSymbol)}/${intervalKey}/${today}`;

  const responseData = await fetchDirectFromUpstox(analyticalChartEndpoint);
  if (!responseData?.data?.candles) return null;

  const candlesArray = responseData.data.candles;

  // Upstox returns array format: [timestamp, open, high, low, close, volume, open_interest]
  return candlesArray.map((c) => ({
    time: new Date(c[0]).getTime(),
    open: c[1],
    high: c[2],
    low: c[3],
    close: c[4],
    volume: c[5] || 0,
  })).reverse();
}

export function subscribeToLiveMarketFeed(symbols, onQuoteUpdate, onIndexUpdate, onError = () => {}) {
  if (!USE_UPSTOX || !symbols || symbols.length === 0 || typeof window === 'undefined') {
    return () => {};
  }

  let socket = null;
  let isClosed = false;

  const connectV3 = async () => {
    try {
      // Step A: Request authorized single-use wss:// URI from Upstox V3 API
      const authRes = await fetch('https://api.upstox.com/v3/feed/market-data-feed/authorize', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${UPSTOX_API_KEY}`,
          'Accept': 'application/json',
        },
      });

      if (!authRes.ok) {
        throw new Error(`Upstox V3 Auth failed with status ${authRes.status}`);
      }

      const authPayload = await authRes.json();
      const authorizedWsUri = authPayload.data?.authorized_redirect_uri || authPayload.data?.authorizedRedirectUri;

      if (!authorizedWsUri) {
        throw new Error('No authorized redirect URI returned by Upstox.');
      }

      // Step B: Connect to the authorized wss:// socket URI
      socket = new window.WebSocket(authorizedWsUri);

      socket.addEventListener('open', () => {
        console.log('[Upstox V3] WebSockets Connected Successfully!');

        const instrumentKeys = symbols.map((ticker) => UPSTOX_SYMBOL_MAP[ticker] || ticker);

        const subRequest = {
          guid: 'bulls_ai_session',
          method: 'sub',
          data: {
            mode: 'ltpc',
            instrumentKeys: instrumentKeys,
          },
        };

        socket.send(JSON.stringify(subRequest));
      });

      socket.addEventListener('message', (event) => {
        try {
          if (typeof event.data === 'string') {
            const parsed = JSON.parse(event.data);
            if (parsed.feeds) {
              for (const [key, feed] of Object.entries(parsed.feeds)) {
                const internalKey = resolveInternalSymbolKey(key);
                if (internalKey && feed.ff?.ltpc?.ltp) {
                  onQuoteUpdate?.(internalKey, normalizeQuotePayload(feed.ff.ltpc));
                }
              }
            }
          }
        } catch (err) {
          onError(err);
        }
      });

      socket.addEventListener('error', (err) => {
        console.warn('[Upstox V3 WS Error]:', err);
        onError(err);
      });

      socket.addEventListener('close', () => {
        if (!isClosed) {
          setTimeout(connectV3, 5000); // Reconnect loop if dropped
        }
      });

    } catch (err) {
      console.error('[Upstox V3 Initialization Failed]:', err);
      onError(err);
    }
  };

  connectV3();

  return () => {
    isClosed = true;
    if (socket && socket.readyState === window.WebSocket.OPEN) {
      socket.close();
    }
  };
}