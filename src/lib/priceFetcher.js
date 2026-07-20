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
  TECHM: 'NSE_EQ|TECHM', 'M&M': 'NSE_EQ|M&M',
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

// Adapter to fetch quotes from an Upstox-compatible endpoint.
async function fetchFromUpstox(symbols) {
  if (!USE_UPSTOX) return null;
  try {
    const symbolList = symbols
      .map((ticker) => UPSTOX_SYMBOL_MAP[ticker] || `${ticker}.NS`)
      .join(',');
    const url = `${UPSTOX_BASE.replace(/\/$/, '')}/market/quotes?symbols=${encodeURIComponent(symbolList)}`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${UPSTOX_API_KEY}`,
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      console.warn('[Upstox] upstream responded with', res.status);
      return null;
    }

    const payload = await res.json();
    const rows = Array.isArray(payload) ? payload : (payload.data || payload.quotes || []);
    if (!rows || rows.length === 0) return null;

    const mapped = {};
    for (const row of rows) {
      const upstreamSymbol = row.symbol || row.tradingsymbol || row.ticker;
      if (!upstreamSymbol) continue;
      const key = resolveInternalSymbolKey(upstreamSymbol);
      if (!key) continue;

      mapped[key] = normalizeQuotePayload(row);
    }

    if (Object.keys(mapped).length === 0) {
      console.warn('[Upstox] fetch returned no valid symbols for', symbolList);
      return null;
    }

    console.debug('[Upstox] fetched live quotes for', Object.keys(mapped));
    return mapped;
  } catch (err) {
    console.warn('[Upstox] fetch failed:', err);
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
  // Prefer Upstox if configured, otherwise fallback to Yahoo
  if (USE_UPSTOX) {
    const upstoxQuotes = await fetchFromUpstox(symbols);
    if (upstoxQuotes && Object.keys(upstoxQuotes).length > 0) return upstoxQuotes;
  }

  const upstoxTargetString = symbols
    .map((ticker) => UPSTOX_SYMBOL_MAP[ticker] || `${ticker}.NS`)
    .join(',');
    
  const requestEndpoint = `${UPSTOX_BASE}/market-quote/quotes?instrument_key=${encodeURIComponent(upstoxTargetString)}`;
  const responseData = await fetchDirectFromUpstox(requestEndpoint);
  if (!responseData?.quoteResponse?.result) return null;

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
  const compositeIndexSymbols = Object.values(INDEX_SYMBOLS).join(',');
  const indexRequestEndpoint = `${UPSTOX_BASE}/market-quote/quotes?instrument_key=${encodeURIComponent(compositeIndexSymbols)}`;
  
  const responseData = await fetchDirectFromUpstox(indexRequestEndpoint);
  if (!responseData?.quoteResponse?.result) return null;

  const activeIndicesMatrix = {};
  const indexLabelMappings = { NIFTY50: 'NIFTY 50', SENSEX: 'SENSEX', INDIAVIX: 'INDIA VIX' };

  for (const indexItem of responseData.quoteResponse.result) {
    const internalIndexToken = REVERSE_INDEX_SYMBOLS[indexItem.symbol];
    if (!internalIndexToken) continue;

    activeIndicesMatrix[internalIndexToken] = {
      name: indexLabelMappings[internalIndexToken] || internalIndexToken,
      value: indexItem.regularMarketPrice ?? 0,
      prevClose: indexItem.regularMarketPreviousClose ?? 0,
      change: indexItem.regularMarketChange ?? 0,
      changePercent: indexItem.regularMarketChangePercent ?? 0,
    };
  }
  
  return activeIndicesMatrix;
}

/**
 * Builds candlestick coordinate matrices for charting rendering systems.
 */
export async function fetchCandles(symbol, range = '1d', interval = '5m') {
  const targetedUpstoxSymbol = UPSTOX_SYMBOL_MAP[symbol] || `${symbol}.NS`;
  const intervalKey = interval === '1d' ? 'day' : '5minute';
  const analyticalChartEndpoint = `${UPSTOX_BASE}/market-quote/candles/${encodeURIComponent(targetedUpstoxSymbol)}/${intervalKey}`;
  
  const responseData = await fetchDirectFromUpstox(analyticalChartEndpoint);
  if (!responseData?.chart?.result?.[0]) return null;

  const targetChartDataNode = responseData.chart.result[0];
  const queryTimestampsArray = targetChartDataNode.timestamp;
  const metricsQuoteLane = targetChartDataNode.indicators?.quote?.[0];

  if (!queryTimestampsArray || !metricsQuoteLane) return [];

  const getSessionBoundsForIST = (referenceTimestamp = Date.now()) => {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false,
    });

    const parts = formatter.formatToParts(new Date(referenceTimestamp));
    const dateParts = parts.reduce((acc, part) => {
      if (part.type !== 'literal') acc[part.type] = Number(part.value);
      return acc;
    }, {});

    const { year, month, day } = dateParts;
    const utcMidnight = Date.UTC(year, month - 1, day, 0, 0, 0);
    const istOffsetMs = 5.5 * 60 * 60 * 1000;
    const istMidnightUtc = utcMidnight - istOffsetMs;
    return {
      start: istMidnightUtc + 9 * 60 * 60 * 1000,
      end: istMidnightUtc + (15 * 60 + 30) * 60 * 1000,
    };
  };

  const { start: sessionStart, end: sessionEnd } = getSessionBoundsForIST(queryTimestampsArray[0] * 1000);

  const processedCandlesMatrix = [];

  for (let stepIndex = 0; stepIndex < queryTimestampsArray.length; stepIndex++) {
    const candleTime = queryTimestampsArray[stepIndex] * 1000;
    if (candleTime < sessionStart || candleTime > sessionEnd) continue;
    const baselineOpeningPrice = metricsQuoteLane.open?.[stepIndex];
    // Safeguards coordinate parsing against erratic or null data fields inside historical lines
    if (baselineOpeningPrice == null || metricsQuoteLane.close?.[stepIndex] == null) continue;

    processedCandlesMatrix.push({
      time: queryTimestampsArray[stepIndex] * 1000,
      open: baselineOpeningPrice,
      high: metricsQuoteLane.high?.[stepIndex] ?? baselineOpeningPrice,
      low: metricsQuoteLane.low?.[stepIndex] ?? baselineOpeningPrice,
      close: metricsQuoteLane.close[stepIndex],
      volume: metricsQuoteLane.volume?.[stepIndex] || 0,
    });
  }
  return processedCandlesMatrix;
}

export function subscribeToLiveMarketFeed(symbols, onQuoteUpdate, onIndexUpdate, onError = () => {}) {
  if (!USE_UPSTOX_WS || !symbols || symbols.length === 0 || typeof window === 'undefined' || typeof window.WebSocket === 'undefined') {
    return () => {};
  }

  let socket = null;
  let reconnectHandle = null;
  let isClosed = false;

  const connect = () => {
    if (socket && (socket.readyState === window.WebSocket.OPEN || socket.readyState === window.WebSocket.CONNECTING)) {
      return;
    }

    socket = new window.WebSocket(UPSTOX_WS_URL);

    socket.addEventListener('open', () => {
      console.debug('[Upstox WS] connection opened');
      const subscriptionPayload = {
        action: 'subscribe',
        mode: 'full',
        instruments: symbols.map((ticker) => UPSTOX_SYMBOL_MAP[ticker] || `${ticker}.NS`),
        feed_types: ['quote', 'ltp'],
        ...(UPSTOX_WS_TOKEN ? { access_token: UPSTOX_WS_TOKEN } : {}),
      };
      socket.send(JSON.stringify(subscriptionPayload));
    });

    socket.addEventListener('message', (event) => {
      try {
        const payload = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        const updates = Array.isArray(payload) ? payload : [payload];
        console.debug('[Upstox WS] message received', updates.length, updates[0]?.instrument_key || updates[0]?.symbol);

        for (const item of updates) {
          const instrumentKey = item?.instrument_key || item?.symbol || item?.tradingsymbol || item?.ticker || '';
          const internalKey = resolveInternalSymbolKey(instrumentKey);

          if (internalKey && item?.last_price != null) {
            onQuoteUpdate?.(internalKey, normalizeQuotePayload(item));
            continue;
          }

          if (internalKey && (item?.regularMarketPrice != null || item?.value != null)) {
            onIndexUpdate?.(internalKey, {
              value: item.value ?? item.regularMarketPrice ?? 0,
              prevClose: item.prevClose ?? item.regularMarketPreviousClose ?? 0,
              change: item.change ?? item.regularMarketChange ?? 0,
              changePercent: item.changePercent ?? item.regularMarketChangePercent ?? 0,
            });
          }
        }
      } catch (err) {
        onError(err);
      }
    });

    socket.addEventListener('error', () => {
      onError(new Error('Upstox websocket stream disconnected.'));
      scheduleReconnect();
    });

    socket.addEventListener('close', () => {
      if (!isClosed) {
        scheduleReconnect();
      }
    });
  };

  const clearReconnect = () => {
    if (reconnectHandle) {
      window.clearTimeout(reconnectHandle);
      reconnectHandle = null;
    }
  };

  const scheduleReconnect = () => {
    clearReconnect();
    reconnectHandle = window.setTimeout(() => {
      reconnectHandle = null;
      if (!isClosed) connect();
    }, 5000);
  };

  connect();

  return () => {
    isClosed = true;
    clearReconnect();
    if (socket && socket.readyState === window.WebSocket.OPEN) {
      socket.close();
    }
  };
}