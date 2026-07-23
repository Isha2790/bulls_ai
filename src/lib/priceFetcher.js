/**
 * @fileoverview Network Data Integration Subsystem - Upstox Core Broker
 * All Upstox calls are routed through the `upstox-proxy` Supabase Edge Function.
 * The browser NEVER holds an Upstox token.
 *
 * IMPORTANT FIX: Upstox instrument_keys are ISIN-based (e.g. "NSE_EQ|INE002A01018"),
 * NOT trading-symbol-based (e.g. "NSE_EQ|RELIANCE" is INVALID and returns 400 on
 * every call). Instead of hardcoding possibly-wrong ISINs, we resolve the correct
 * instrument_key for each symbol once via Upstox's Instrument Search API (through
 * the proxy), then cache the result in localStorage for 24h.
 */
 
import protobuf from 'protobufjs';
 
// The official Upstox Market Data Feed V3 schema, fetched directly from
// https://assets.upstox.com/feed/market-data-feed/v3/MarketDataFeed.proto
// (this is Upstox's own live schema URL, not a third-party guess/mirror).
const UPSTOX_V3_PROTO_SOURCE = `
syntax = "proto3";
package com.upstox.marketdatafeederv3udapi.rpc.proto;
 
message LTPC {
  double ltp = 1;
  int64 ltt = 2;
  int64 ltq = 3;
  double cp = 4;
}
 
message MarketLevel {
  repeated Quote bidAskQuote = 1;
}
 
message MarketOHLC {
  repeated OHLC ohlc = 1;
}
 
message Quote {
  int64 bidQ = 1;
  double bidP = 2;
  int64 askQ = 3;
  double askP = 4;
}
 
message OptionGreeks {
  double delta = 1;
  double theta = 2;
  double gamma = 3;
  double vega = 4;
  double rho = 5;
}
 
message OHLC {
  string interval = 1;
  double open = 2;
  double high = 3;
  double low = 4;
  double close = 5;
  int64 vol = 6;
  int64 ts = 7;
}
 
enum Type {
  initial_feed = 0;
  live_feed = 1;
  market_info = 2;
}
 
message MarketFullFeed {
  LTPC ltpc = 1;
  MarketLevel marketLevel = 2;
  OptionGreeks optionGreeks = 3;
  MarketOHLC marketOHLC = 4;
  double atp = 5;
  int64 vtt = 6;
  double oi = 7;
  double iv = 8;
  double tbq = 9;
  double tsq = 10;
}
 
message IndexFullFeed {
  LTPC ltpc = 1;
  MarketOHLC marketOHLC = 2;
}
 
message FullFeed {
  oneof FullFeedUnion {
    MarketFullFeed marketFF = 1;
    IndexFullFeed indexFF = 2;
  }
}
 
message FirstLevelWithGreeks {
  LTPC ltpc = 1;
  Quote firstDepth = 2;
  OptionGreeks optionGreeks = 3;
  int64 vtt = 4;
  double oi = 5;
  double iv = 6;
}
 
message Feed {
  oneof FeedUnion {
    LTPC ltpc = 1;
    FullFeed fullFeed = 2;
    FirstLevelWithGreeks firstLevelWithGreeks = 3;
  }
  RequestMode requestMode = 4;
}
 
enum RequestMode {
  ltpc = 0;
  full_d5 = 1;
  option_greeks = 2;
  full_d30 = 3;
}
 
enum MarketStatus {
  PRE_OPEN_START = 0;
  PRE_OPEN_END = 1;
  NORMAL_OPEN = 2;
  NORMAL_CLOSE = 3;
  CLOSING_START = 4;
  CLOSING_END = 5;
}
 
message MarketInfo {
  map<string, MarketStatus> segmentStatus = 1;
}
 
message FeedResponse {
  Type type = 1;
  map<string, Feed> feeds = 2;
  int64 currentTs = 3;
  MarketInfo marketInfo = 4;
}
`;
 
let cachedFeedResponseType = null;
function getFeedResponseType() {
  if (cachedFeedResponseType) return cachedFeedResponseType;
  const parsedRoot = protobuf.parse(UPSTOX_V3_PROTO_SOURCE).root;
  cachedFeedResponseType = parsedRoot.lookupType(
    'com.upstox.marketdatafeederv3udapi.rpc.proto.FeedResponse'
  );
  return cachedFeedResponseType;
}
 
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const PROXY_ENDPOINT = SUPABASE_URL ? `${SUPABASE_URL}/functions/v1/upstox-proxy` : '';
const USE_UPSTOX = Boolean(PROXY_ENDPOINT);
 
const TRACKED_SYMBOLS = [
  'RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK', 'BHARTIARTL', 'SBIN', 'ITC',
  'LT', 'AXISBANK', 'KOTAKBANK', 'HINDUNILVR', 'MARUTI', 'ASIANPAINT', 'WIPRO',
  'TATAMOTORS', 'SUNPHARMA', 'TITAN', 'ULTRACEMCO', 'NESTLEIND', 'BAJFINANCE',
  'POWERGRID', 'NTPC', 'HCLTECH', 'ONGC', 'COALINDIA', 'ADANIENT', 'JSWSTEEL',
  'TECHM', 'HEROMOTOCO',
];
 
// Indices use name-based keys (not ISIN-based) - these are already correct.
const INDEX_SYMBOLS = Object.freeze({
  NIFTY50: 'NSE_INDEX|Nifty 50',
  SENSEX: 'BSE_INDEX|SENSEX',
  INDIAVIX: 'NSE_INDEX|India VIX',
});
 
const REVERSE_INDEX_SYMBOLS = Object.freeze(
  Object.entries(INDEX_SYMBOLS).reduce((acc, [internalKey, indexValue]) => {
    acc[indexValue] = internalKey;
    return acc;
  }, {})
);
 
const RESOLVE_CACHE_KEY = 'bulls_ai_upstox_instrument_map_v1';
const RESOLVE_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
 
let resolvedSymbolMap = null; // { RELIANCE: 'NSE_EQ|INE002A01018', ... }
let reverseResolvedMap = {};  // { 'NSE_EQ|INE002A01018': 'RELIANCE', ... }
let resolveInFlight = null;
 
function normalizeQuotePayload(rawPayload) {
  const price = rawPayload.last_price ?? rawPayload.lastPrice ?? rawPayload.ltp ?? rawPayload.price ?? rawPayload.close ?? 0;
 
  // IMPORTANT: Upstox's real quote response nests OHLC under an `ohlc` object
  // (rawPayload.ohlc.open / .high / .low / .close) - it does NOT put open/high/low
  // at the top level. Reading rawPayload.open directly (as before) always returned
  // undefined and silently defaulted to 0.
  const ohlc = rawPayload.ohlc || {};
  const open = ohlc.open ?? rawPayload.open ?? 0;
  const high = ohlc.high ?? rawPayload.high ?? 0;
  const low = ohlc.low ?? rawPayload.low ?? 0;
 
  // IMPORTANT: Upstox's real quote response has NO `previous_close`/`change`/`change_percent`
  // fields at all. What it actually sends is `net_change` (price change vs. previous close).
  // There's also no direct previous-close value, so we derive it: prevClose = price - net_change.
  // (Falling back to explicit field names too, in case a different Upstox endpoint/version sends them.)
  const explicitPrevClose = rawPayload.previous_close ?? rawPayload.prevClose ?? rawPayload.prev_close;
  const netChange = rawPayload.net_change ?? rawPayload.change ?? 0;
  const prevClose = explicitPrevClose ?? (Number(price) - Number(netChange));
 
  const volume = rawPayload.volume ?? 0;
  const change = Number(netChange) || (Number(price) - Number(prevClose));
  const changePercent = rawPayload.change_percent ?? rawPayload.percent_change ?? rawPayload.changePercent ??
    (Number(prevClose) ? (change / Number(prevClose)) * 100 : 0);
 
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
    circuitUpper: rawPayload.upper_circuit_limit ?? 0,
    circuitLower: rawPayload.lower_circuit_limit ?? 0,
  };
}
 
/**
 * Upstox's WebSocket V3 "ltpc" mode sends a much smaller payload than the REST
 * quotes response - just { ltp, ltt, ltq, cp } per the official LTPC message
 * in MarketDataFeed.proto. `cp` is the previous day's close (same meaning as
 * `ohlc.close` in the REST response).
 */
function normalizeLtpcPayload(ltpc, fallback = {}) {
  const price = ltpc.ltp ?? fallback.price ?? 0;
  const prevClose = ltpc.cp ?? fallback.prevClose ?? 0;
  const change = price - prevClose;
  const changePercent = prevClose ? (change / prevClose) * 100 : 0;
 
  return {
    ...fallback,
    price: Number(price) || 0,
    prevClose: Number(prevClose) || fallback.prevClose || 0,
    change: Number(change) || 0,
    changePercent: Number(changePercent) || 0,
  };
}
 
/**
 * Calls our Supabase Edge Function. IMPORTANT: pass RAW (unencoded) values here -
 * URLSearchParams encodes them automatically. Pre-encoding causes double-encoding
 * (e.g. "%7C" becoming "%257C"), which was the bug seen in the console logs.
 */
async function callProxy(action, params = {}) {
  if (!USE_UPSTOX) return null;
 
  const query = new URLSearchParams({ action, ...params }).toString();
  const url = `${PROXY_ENDPOINT}?${query}`;
 
  try {
    const res = await fetch(url, {
      headers: {
        Accept: 'application/json',
        ...(SUPABASE_ANON_KEY ? { Authorization: `Bearer ${SUPABASE_ANON_KEY}`, apikey: SUPABASE_ANON_KEY } : {}),
      },
      signal: AbortSignal.timeout(8000),
    });
 
    const payload = await res.json().catch(() => null);
 
    if (!res.ok) {
      console.warn('[upstox-proxy] request failed', res.status, payload);
      return null;
    }
    return payload;
  } catch (err) {
    console.warn('[upstox-proxy] request failed:', err);
    return null;
  }
}
 
/**
 * Resolves TRACKED_SYMBOLS into real Upstox instrument_keys, once, with a
 * 24h localStorage cache. Falls back to an in-memory promise so concurrent
 * callers don't trigger duplicate resolve calls.
 */
async function ensureSymbolsResolved() {
  if (resolvedSymbolMap && Object.keys(resolvedSymbolMap).length > 0) return resolvedSymbolMap;
  if (resolveInFlight) return resolveInFlight;
 
  resolveInFlight = (async () => {
    try {
      const cachedRaw = typeof localStorage !== 'undefined' ? localStorage.getItem(RESOLVE_CACHE_KEY) : null;
      if (cachedRaw) {
        const cached = JSON.parse(cachedRaw);
        const cachedMapHasEntries = cached?.map && Object.keys(cached.map).length > 0;
        if (cached?.timestamp && Date.now() - cached.timestamp < RESOLVE_CACHE_TTL_MS && cachedMapHasEntries) {
          resolvedSymbolMap = cached.map;
          reverseResolvedMap = Object.entries(cached.map).reduce((acc, [sym, key]) => {
            acc[key] = sym;
            return acc;
          }, {});
          return resolvedSymbolMap;
        }
      }
    } catch (_err) {
      // ignore corrupt cache
    }
 
    const payload = await callProxy('resolve', { symbols: TRACKED_SYMBOLS.join(',') });
    const map = payload?.data || {};
 
    if (Object.keys(map).length === 0) {
      console.warn('[priceFetcher] symbol resolution returned an empty map - will retry on next call instead of caching this.');
      return {}; 
    }
 
    resolvedSymbolMap = map;
    reverseResolvedMap = Object.entries(map).reduce((acc, [sym, key]) => {
      acc[key] = sym;
      return acc;
    }, {});
 
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(RESOLVE_CACHE_KEY, JSON.stringify({ map, timestamp: Date.now() }));
      }
    } catch (_err) {
      // ignore storage quota errors
    }
 
    return resolvedSymbolMap;
  })();
 
  const result = await resolveInFlight;
  resolveInFlight = null;
  return result;
}
 
function resolveInternalSymbolKey(instrumentKeyOrSymbol) {
  if (!instrumentKeyOrSymbol) return null;
 
  // Upstox's quotes response keys its data by "EXCHANGE:SYMBOL" (e.g. "NSE_EQ:RELIANCE"),
  // NOT by the instrument_key you requested with. Handle that format first.
  if (instrumentKeyOrSymbol.includes(':')) {
    const tradingSymbol = instrumentKeyOrSymbol.split(':').pop()?.toUpperCase();
    if (tradingSymbol && TRACKED_SYMBOLS.includes(tradingSymbol)) return tradingSymbol;
  }
 
  if (reverseResolvedMap[instrumentKeyOrSymbol]) return reverseResolvedMap[instrumentKeyOrSymbol];
  if (REVERSE_INDEX_SYMBOLS[instrumentKeyOrSymbol]) return REVERSE_INDEX_SYMBOLS[instrumentKeyOrSymbol];
  if (resolvedSymbolMap?.[instrumentKeyOrSymbol]) return instrumentKeyOrSymbol;
  return null;
}
 
/**
 * Compiles a real-time data matrix tracking current selected stock parameters.
 */
export async function fetchRealQuotes(symbols) {
  if (!symbols || symbols.length === 0 || !USE_UPSTOX) return null;
 
  const symbolMap = await ensureSymbolsResolved();
  const instrumentKeys = symbols.map((ticker) => symbolMap[ticker]).filter(Boolean);
  if (instrumentKeys.length === 0) return null;
 
  const CHUNK_SIZE = 15;
  const chunks = [];
  for (let i = 0; i < instrumentKeys.length; i += CHUNK_SIZE) {
    chunks.push(instrumentKeys.slice(i, i + CHUNK_SIZE));
  }
 
  const mappedQuotes = {};
 
  for (const chunk of chunks) {
    const payload = await callProxy('quotes', { instrument_key: chunk.join(',') });
    if (!payload) continue;
 
    const quotesData = payload.data || {};
    for (const [key, quoteObj] of Object.entries(quotesData)) {
      const internalKey = resolveInternalSymbolKey(key);
      if (internalKey) mappedQuotes[internalKey] = normalizeQuotePayload(quoteObj);
    }
  }
 
  return Object.keys(mappedQuotes).length > 0 ? mappedQuotes : null;
}
 
/**
 * Retrieves core tracking composite index states from the active market pipeline.
 */
export async function fetchRealIndices() {
  if (!USE_UPSTOX) return null;
 
  const compositeKeys = Object.values(INDEX_SYMBOLS);
  const payload = await callProxy('quotes', { instrument_key: compositeKeys.join(',') });
  if (!payload) return null;
 
  const data = payload.data || {};
  const indexLabelMappings = { NIFTY50: 'NIFTY 50', SENSEX: 'SENSEX', INDIAVIX: 'INDIA VIX' };
  const indexNameToInternalKey = { 'Nifty 50': 'NIFTY50', 'SENSEX': 'SENSEX', 'India VIX': 'INDIAVIX' };
  const activeIndicesMatrix = {};
 
  for (const [key, item] of Object.entries(data)) {
    // Upstox keys indices by "EXCHANGE:Name" (e.g. "NSE_INDEX:Nifty 50"), not the instrument_key.
    const namePart = key.includes(':') ? key.split(':').slice(1).join(':') : key;
    const internalKey = indexNameToInternalKey[namePart] || REVERSE_INDEX_SYMBOLS[key];
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
}
 
/**
 * Builds candlestick coordinate matrices for charting rendering systems.
 * Always uses Upstox's Intraday endpoint since this app only ever wants
 * "today's session" candles.
 */
export async function fetchCandles(symbol, range = '1d', interval = '5m') {
  if (!USE_UPSTOX) return null;
 
  const symbolMap = await ensureSymbolsResolved();
  const targetedInstrumentKey = symbolMap[symbol];
  if (!targetedInstrumentKey) return null;
 
  const intervalKey = interval === '1d' ? 'day' : '1minute';
 
  const payload = await callProxy('candles', {
    instrument_key: targetedInstrumentKey,
    interval: intervalKey,
    mode: 'intraday',
  });
 
  if (!payload?.data?.candles) return null;
 
  return payload.data.candles
    .map((c) => ({
      time: new Date(c[0]).getTime(),
      open: c[1],
      high: c[2],
      low: c[3],
      close: c[4],
      volume: c[5] || 0,
    }))
    .reverse();
}
 
/**
 * Opens a live WebSocket feed via an authorized wss:// URI from the proxy.
 */
export function subscribeToLiveMarketFeed(symbols, onQuoteUpdate, onIndexUpdate, onError = () => {}) {
  if (!USE_UPSTOX || !symbols || symbols.length === 0 || typeof window === 'undefined') {
    return () => {};
  }
 
  let socket = null;
  let isClosed = false;
 
  const connectV3 = async () => {
    try {
      const symbolMap = await ensureSymbolsResolved();
      const instrumentKeys = symbols.map((ticker) => symbolMap[ticker]).filter(Boolean);
      if (instrumentKeys.length === 0) {
        console.warn('[Upstox V3] symbolMap had', Object.keys(symbolMap || {}).length, 'entries; requested symbols:', symbols);
        throw new Error('No resolved instrument keys to subscribe to.');
      }
 
      const authPayload = await callProxy('ws-authorize');
      const authorizedWsUri = authPayload?.data?.authorized_redirect_uri || authPayload?.data?.authorizedRedirectUri;
 
      if (!authorizedWsUri) {
        throw new Error('No authorized redirect URI returned by the upstox-proxy function.');
      }
 
      socket = new window.WebSocket(authorizedWsUri);
      socket.binaryType = 'arraybuffer';
 
      socket.addEventListener('open', () => {
        console.log('[Upstox V3] WebSocket connected successfully! (FULL mode)');
        socket.send(JSON.stringify({
          guid: 'bulls_ai_session',
          method: 'sub',
          data: { 
            mode: 'full',            // NOTE: valid values to SEND are ltpc | option_greeks | full | full_d30.
                                      // 'full_d5' is NOT one of them - that name only appears internally
                                      // as an enum label when decoding the requestMode field in responses.
            instrumentKeys 
          },
        }));
      });
 
      socket.addEventListener('message', (event) => {
        try {
          if (!(event.data instanceof ArrayBuffer)) return;
 
          const FeedResponseType = getFeedResponseType();
          const decodedMessage = FeedResponseType.decode(new Uint8Array(event.data));
          const feedsMap = decodedMessage.feeds || {};
 
          for (const [instrumentKeyFromFeed, feedEntry] of Object.entries(feedsMap)) {
            const internalKey = resolveInternalSymbolKey(instrumentKeyFromFeed);
            if (!internalKey) continue;
 
            let ltpcData = null;
 
            // Handle FULL mode structure
            if (feedEntry.fullFeed?.marketFF?.ltpc) {
              ltpcData = feedEntry.fullFeed.marketFF.ltpc;
            } else if (feedEntry.ltpc) {
              ltpcData = feedEntry.ltpc;
            } else if (feedEntry.firstLevelWithGreeks?.ltpc) {
              ltpcData = feedEntry.firstLevelWithGreeks.ltpc;
            }
 
            if (ltpcData && ltpcData.ltp != null) {
              onQuoteUpdate?.(internalKey, normalizeLtpcPayload({ 
                ltp: ltpcData.ltp, 
                cp: ltpcData.cp 
              }));
            }
          }
        } catch (err) {
          console.warn('[WebSocket message parse error]', err);
          onError(err);
        }
      });
 
      socket.addEventListener('error', (err) => {
        console.warn('[Upstox V3 WS Error]:', err);
        onError(err);
      });
 
      socket.addEventListener('close', () => {
        if (!isClosed) setTimeout(connectV3, 5000);
      });
    } catch (err) {
      console.error('[Upstox V3 Initialization Failed]:', err);
      onError(err);
      if (!isClosed) setTimeout(connectV3, 5000);
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
