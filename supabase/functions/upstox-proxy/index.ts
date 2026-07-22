import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
 
/**
 * Upstox Proxy Edge Function
 * Holds the Upstox access token server-side (never sent to the browser) and
 * proxies quotes / indices / candles / resolve / websocket-authorize requests.
 *
 * Required secret:
 *   UPSTOX_ACCESS_TOKEN  - Upstox Analytics Token (1-year) or daily OAuth access token
 */
 
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};
 
const UPSTOX_ACCESS_TOKEN = Deno.env.get("UPSTOX_ACCESS_TOKEN");
const UPSTOX_BASE = "https://api.upstox.com/v2";
 
function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
 
serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders });
  }
 
  if (!UPSTOX_ACCESS_TOKEN) {
    console.error("[Configuration Error]: UPSTOX_ACCESS_TOKEN missing from Supabase secrets.");
    return json({ error: "Server not configured with an Upstox access token." }, 500);
  }
 
  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action");
 
    const upstoxHeaders = {
      Authorization: `Bearer ${UPSTOX_ACCESS_TOKEN}`,
      Accept: "application/json",
    };
 
    // --- Resolve trading symbols (e.g. "RELIANCE") into real Upstox instrument_keys
    //     (e.g. "NSE_EQ|INE002A01018") using Upstox's Instrument Search API. ---
    if (action === "resolve") {
      const symbolsParam = url.searchParams.get("symbols");
      if (!symbolsParam) return json({ error: "symbols is required" }, 400);
 
      const symbols = symbolsParam.split(",").map((s) => s.trim()).filter(Boolean);
      const resolved: Record<string, string> = {};
 
      for (const sym of symbols) {
        try {
          const searchRes = await fetch(
            `${UPSTOX_BASE}/instruments/search?query=${encodeURIComponent(sym)}&exchanges=NSE&segments=EQ&records=5`,
            { headers: upstoxHeaders }
          );
          const searchPayload = await searchRes.json().catch(() => null);
          const candidates = searchPayload?.data || [];
 
          // Prefer an exact trading_symbol match; fall back to first result.
          const exactMatch = candidates.find(
            (item: any) => (item.trading_symbol || item.symbol || "").toUpperCase() === sym.toUpperCase()
          );
          const chosen = exactMatch || candidates[0];
 
          if (chosen?.instrument_key) resolved[sym] = chosen.instrument_key;
        } catch (lookupErr) {
          console.warn("[Upstox] resolve lookup failed for", sym, lookupErr);
        }
      }
 
      return json({ data: resolved });
    }
 
    // --- Quotes / Indices ---
    if (action === "quotes") {
      const instrumentKey = url.searchParams.get("instrument_key");
      if (!instrumentKey) return json({ error: "instrument_key is required" }, 400);
 
      const upstoxRes = await fetch(
        `${UPSTOX_BASE}/market-quote/quotes?instrument_key=${instrumentKey}`,
        { headers: upstoxHeaders }
      );
 
      const payload = await upstoxRes.json().catch(() => ({}));
      if (!upstoxRes.ok) {
        console.warn("[Upstox] quotes request failed", upstoxRes.status, payload);
        return json({ error: "Upstox request failed", details: payload }, upstoxRes.status);
      }
      return json(payload);
    }
 
    // --- Candles: intraday (today, no date needed) vs historical (past, date required) ---
    if (action === "candles") {
      const instrumentKey = url.searchParams.get("instrument_key");
      const intervalKey = url.searchParams.get("interval") || "day";
      const mode = url.searchParams.get("mode") || "historical";
      if (!instrumentKey) return json({ error: "instrument_key is required" }, 400);
 
      const endpoint =
        mode === "intraday"
          ? `${UPSTOX_BASE}/historical-candle/intraday/${instrumentKey}/${intervalKey}`
          : `${UPSTOX_BASE}/historical-candle/${instrumentKey}/${intervalKey}/${
              url.searchParams.get("date") || new Date().toISOString().split("T")[0]
            }`;
 
      const upstoxRes = await fetch(endpoint, { headers: upstoxHeaders });
 
      const payload = await upstoxRes.json().catch(() => ({}));
      if (!upstoxRes.ok) {
        console.warn("[Upstox] candles request failed", upstoxRes.status, payload, "mode:", mode);
        return json({ error: "Upstox request failed", details: payload }, upstoxRes.status);
      }
      return json(payload);
    }
 
    // --- WebSocket authorize ---
    if (action === "ws-authorize") {
      const upstoxRes = await fetch(
        "https://api.upstox.com/v3/feed/market-data-feed/authorize",
        { headers: upstoxHeaders }
      );
 
      const payload = await upstoxRes.json().catch(() => ({}));
      if (!upstoxRes.ok) {
        console.warn("[Upstox] ws-authorize failed", upstoxRes.status, payload);
        return json({ error: "Upstox auth failed", details: payload }, upstoxRes.status);
      }
      return json(payload);
    }
 
    return json({ error: "Unknown or missing action. Use resolve | quotes | candles | ws-authorize." }, 400);
  } catch (err) {
    console.error("[upstox-proxy] Unhandled exception:", err);
    return json({ error: "Internal proxy error" }, 500);
  }
});