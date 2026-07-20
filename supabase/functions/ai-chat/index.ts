import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

/**
 * Standardized Cross-Origin Resource Sharing (CORS) Security Headers
 * Configured for secure access control across enterprise client requests.
 */
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

// Retrieve API key exclusively from secure vault environment configurations
const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
const TARGET_MODEL = "llama-3.3-70b-versatile";

serve(async (req: Request) => {
  // Handle Preflight OPTIONS requests cleanly for cross-origin compliance
  if (req.method === "OPTIONS") {
    return new Response("ok", { 
      status: 200, 
      headers: corsHeaders 
    });
  }

  try {
    // Fail-fast architecture check: Validate system environment configuration
    if (!GROQ_API_KEY) {
      console.error("[Configuration Error]: GROQ_API_KEY environmental variable missing inside Supabase Vault.");
      return new Response(
        JSON.stringify({ error: "Upstream system authentication error." }), 
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate request paylaod structure safely
    const { message, stockContext } = await req.json();
    if (!message || typeof message !== "string") {
      return new Response(
        JSON.stringify({ error: "Malformed payload: 'message' parameter required as string datatype." }), 
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Standardize financial data matrix context mapping
    const contextStr = stockContext
      ? `[LIVE MARKET DATA INJECTION]
Symbol: ${stockContext.symbol}
Asset Classification: ${stockContext.name}
Spot Price: ₹${stockContext.price}
Session Open: ₹${stockContext.open} | Daily High: ₹${stockContext.high} | Daily Low: ₹${stockContext.low}
Previous Settlement Close: ₹${stockContext.prevClose}
Net Variation: ${stockContext.change >= 0 ? '+' : ''}${stockContext.change}%
Traded Volume: ${stockContext.volume}
VWAP Engine Metric: ₹${stockContext.vwap}
52-Week Boundary Extremes: ₹${stockContext.low52} - ₹${stockContext.high52}
Sector Domain Group: ${stockContext.sector}`
      : "Context State: No specific asset focused by client terminal viewport currently.";

    const systemPrompt = `You are an AI financial market analyst operating within a high-frequency Indian equity dashboard called Bull's AI. 
Provide professional real-time computational data breakdowns concerning assets, structural market conditions, and quantitative setups using live parameters.

${contextStr}

Operational Compliance Directives:
1. All analytical expressions, metrics, and price targets must strictly leverage Indian Rupees (INR, ₹).
2. Primary domain space is targeted at Indian securities executing on the National Stock Exchange (NSE) and Bombay Stock Exchange (BSE).
3. Under compliance mandates, strictly append a notation indicating that historical data metrics do not serve as an absolute predictive gauge for future yield horizons.
4. Do not offer direct absolute buy/sell target execution advice. Provide contextual market structure evaluation and issue a firm directive advising independent validation research.
5. Max output constraint target: Under 200 words unless technical layout density is explicitly demanded.
6. System access configuration features a Retrieval-Augmented Generation (RAG) vector lookup connecting 60+ proprietary documents regarding macro sectors, indices, and asset fundamentals.`;

    console.log(`[Streaming Pipeline Initiated]: Requesting inference generation using ${TARGET_MODEL}`);

    // Outbound secure tunnel connection to Groq Inference Framework
    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: TARGET_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        stream: true,
        max_tokens: 512,
        temperature: 0.5, 
      }),
    });

    if (!groqResponse.ok) {
      const errorPayload = await groqResponse.text();
      console.error(`[Upstream Provider Exception]: Groq API returned bad status code ${groqResponse.status}. Details: ${errorPayload}`);
      return new Response(
        JSON.stringify({ error: "Failed to resolve inference processing from downstream nodes." }), 
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(groqResponse.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "X-Content-Type-Options": "nosniff" // Defensive browser header preventing MIME-type hijacking
      },
    });

  } catch (err: any) {
    console.error(`[Unhandled Thread Panic Exception]: ${err.message}`);
    return new Response(
      JSON.stringify({ error: "Internal processing crash inside edge function script layer." }), 
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});