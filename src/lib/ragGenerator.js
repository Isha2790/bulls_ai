/**
 * @fileoverview High-Performance RAG Synthesis & Template Routing Engine
 * Coordinates the 'Generation' phase of the Retrieval-Augmented Generation pipeline.
 * Binds real-time stream parameters to matching local vector data sheets dynamically.
 */

import { retrieve, detectStockSymbol, detectSector } from './ragRetriever.js';
import { fmtINR } from './marketEngine.js';

/**
 * Synthesizes a structured context response based on vector results and live data.
 * @param {string} query 
 * @param {Map} quotes 
 * @param {Function} [onSelectStock] 
 * @returns {object} 
 */
export function generateRAGResponse(query, quotes, onSelectStock) {
  const retrievedDocs = retrieve(query, 3);
  const matchedSymbol = detectStockSymbol(query);
  const matchedSector = detectSector(query);
  const normalizedQuery = query.toLowerCase().trim();

  const bindStockSelection = (symbol) => {
    return typeof onSelectStock === 'function' 
      ? () => onSelectStock(symbol) 
      : undefined;
  };

  if (/^(hi|hello|hey|good morning|good evening|good afternoon)/.test(normalizedQuery)) {
    return {
      text: "Hello! I am your real-time market copilot powered by local Retrieval-Augmented Generation (RAG). My index covers 60+ core documents containing National Stock Exchange asset metrics, micro sectors, and technical analysis concepts. Ask me about specific stock behaviors, sector trends, or execution parameters.",
      sources: [],
      suggestions: [
        { text: 'Tell me about RELIANCE' },
        { text: 'How is the IT sector performing?' },
        { text: 'What is VWAP?' },
        { text: 'Top gainers today?' },
      ],
    };
  }

  if (normalizedQuery.includes('gainer') || normalizedQuery.includes('top gain') || normalizedQuery.includes('best performing')) {
    const activeQuotes = Array.from(quotes.values());
    const gainersMatrix = activeQuotes
      .sort((alpha, beta) => beta.changePercent - alpha.changePercent)
      .slice(0, 5);

    return {
      text: `Live Market Stream Statistics — Today's Top 5 Gainers:\n\n${gainersMatrix.map((stock, idx) => `${idx + 1}. ${stock.symbol} — ${fmtINR(stock.price)} (+${stock.changePercent.toFixed(2)}%)`).join('\n')}\n\nTechnical Momentum Check: Strong accumulation patterns detected. Cross-reference volume metrics and relative indexes before entering active trade setups.`,
      sources: retrievedDocs.slice(0, 1).map((item) => ({ title: item.doc.title, score: item.score.toFixed(3) })),
      suggestions: gainersMatrix.slice(0, 3).map((stock) => ({ 
        text: `Analyze ${stock.symbol}`, 
        action: bindStockSelection(stock.symbol) 
      })),
    };
  }

  if (normalizedQuery.includes('loser') || normalizedQuery.includes('declin') || normalizedQuery.includes('worst performing') || normalizedQuery.includes('top fall')) {
    const activeQuotes = Array.from(quotes.values());
    const losersMatrix = activeQuotes
      .sort((alpha, beta) => alpha.changePercent - beta.changePercent)
      .slice(0, 5);

    return {
      text: `Live Market Stream Statistics — Today's Top 5 Losers:\n\n${losersMatrix.map((stock, idx) => `${idx + 1}. ${stock.symbol} — ${fmtINR(stock.price)} (${stock.changePercent.toFixed(2)}%)`).join('\n')}\n\nTechnical Momentum Check: Selling pressure detected. Ensure structural support barriers and fundamental valuation margins hold firm before deploying capital downward.`,
      sources: retrievedDocs.slice(0, 1).map((item) => ({ title: item.doc.title, score: item.score.toFixed(3) })),
      suggestions: losersMatrix.slice(0, 3).map((stock) => ({ 
        text: `Analyze ${stock.symbol}`, 
        action: bindStockSelection(stock.symbol) 
      })),
    };
  }

  if (normalizedQuery.includes('market') || normalizedQuery.includes('overview') || normalizedQuery.includes('status') || normalizedQuery.includes('summary')) {
    const activeQuotes = Array.from(quotes.values());
    const advances = activeQuotes.filter((stock) => stock.changePercent > 0).length;
    const declines = activeQuotes.filter((stock) => stock.changePercent < 0).length;
    const compositeMeanDelta = (activeQuotes.reduce((sum, stock) => sum + stock.changePercent, 0) / activeQuotes.length).toFixed(2);
    
    const sortedQuotes = [...activeQuotes].sort((alpha, beta) => beta.changePercent - alpha.changePercent);
    const leadingAsset = sortedQuotes[0];
    const laggingAsset = sortedQuotes[sortedQuotes.length - 1];
    
    const foundationalContext = retrievedDocs.find((item) => item.doc.type === 'concept' && (item.doc.id === 'concept-nifty' || item.doc.id === 'concept-vix'));

    return {
      text: `Market Overview Session Summary:\n\n• Advances Structure: ${advances} Assets\n• Declines Structure: ${declines} Assets\n• Basket Average Variation: ${compositeMeanDelta >= 0 ? '+' : ''}${compositeMeanDelta}%\n• Leading Node Alpha: ${leadingAsset.symbol} (+${leadingAsset.changePercent.toFixed(2)}%)\n• Lagging Node Beta: ${laggingAsset.symbol} (${laggingAsset.changePercent.toFixed(2)}%)\n\nSentiment Diagnostic: ${advances > declines ? 'Bullish order book distribution dominating trading layers.' : 'Bearish variance pressure mapping across equity chains today.'} ${foundationalContext ? '\n\nContext Base: ' + foundationalContext.doc.content.split('.')[0] + '.' : ''}`,
      sources: retrievedDocs.slice(0, 2).map((item) => ({ title: item.doc.title, score: item.score.toFixed(3) })),
      suggestions: [{ text: 'Top gainers today?' }, { text: 'Top losers today?' }, { text: 'How is the IT sector?' }],
    };
  }

  if (matchedSymbol) {
    const specificStockDoc = retrievedDocs.find((item) => item.doc.type === 'stock' && item.doc.symbol === matchedSymbol);
    const liveAssetQuote = quotes.get(matchedSymbol);

    let outputCompositionText = specificStockDoc ? specificStockDoc.doc.content : '';
    let decisionContext = '';

    if (liveAssetQuote) {
      const isPositiveMomentum = liveAssetQuote.changePercent >= 0;
      const aboveVWAP = liveAssetQuote.price >= liveAssetQuote.vwap;
      const momentumSignal = aboveVWAP ? 'above VWAP, supporting buyer momentum' : 'below VWAP, signaling weaker volume-weighted momentum';
      const sessionTrend = isPositiveMomentum ? 'positive session momentum' : 'negative session momentum';
      const supportZone = fmtINR(liveAssetQuote.low);
      const resistanceZone = fmtINR(liveAssetQuote.high);

      outputCompositionText += `\n\nLive Execution Metrics:\n• Market Valuation Spot: ${fmtINR(liveAssetQuote.price)}\n• Frame Delta: ${isPositiveMomentum ? '+' : ''}${liveAssetQuote.change.toFixed(2)} (${isPositiveMomentum ? '+' : ''}${liveAssetQuote.changePercent.toFixed(2)}%)\n• Session Open: ${fmtINR(liveAssetQuote.open)} | High Boundary: ${fmtINR(liveAssetQuote.high)} | Low Boundary: ${fmtINR(liveAssetQuote.low)}\n• Computed VWAP: ${fmtINR(liveAssetQuote.vwap)}\n• Session Traded Volume: ${liveAssetQuote.volume.toLocaleString('en-IN')}\n• 52-Week Channels: ${fmtINR(liveAssetQuote.low52)} — ${fmtINR(liveAssetQuote.high52)}\n• Dynamic Risk Circuits: ${fmtINR(liveAssetQuote.circuitLower)} to ${fmtINR(liveAssetQuote.circuitUpper)}\n\nStructural Insight: ${isPositiveMomentum ? 'Price action trades above baseline close, indicating buy-side control.' : 'Price action registers below trailing boundary, indicating distribution pressure.'}`;

      if (/(buy|invest|should i|should we|enter|long|accumulate|position|trade)/.test(normalizedQuery)) {
        decisionContext = `\n\nDecision Context: The stock currently shows ${sessionTrend} and is ${momentumSignal}. Key levels to watch are support near ${supportZone} and resistance near ${resistanceZone}. Consider defining a clear risk tolerance, waiting for confirmation of trend continuation, and monitoring upcoming sector catalysts rather than treating this as a definitive entry signal. This is contextual analysis only, not financial advice.`;
      }
    }

    return {
      text: outputCompositionText + decisionContext,
      sources: retrievedDocs.map((item) => ({ title: item.doc.title, score: item.score.toFixed(3) })),
      suggestions: [
        { text: `View ${matchedSymbol} chart`, action: bindStockSelection(matchedSymbol) },
        { text: `How is ${matchedSymbol}'s sector?` },
        { text: 'What is VWAP?' },
      ],
    };
  }

  if (matchedSector) {
    const targetedSectorDoc = retrievedDocs.find((item) => item.doc.type === 'sector' && item.doc.title.toLowerCase().includes(matchedSector.toLowerCase()));
    const groupedSectorAssets = Array.from(quotes.values()).filter((stock) => stock.sector === matchedSector || (matchedSector === 'IT' && stock.sector === 'Information Technology'));
    
    let compositionPayload = targetedSectorDoc ? targetedSectorDoc.doc.content : '';

    if (groupedSectorAssets.length > 0) {
      const globalSectorMean = (groupedSectorAssets.reduce((sum, stock) => sum + stock.changePercent, 0) / groupedSectorAssets.length).toFixed(2);
      compositionPayload += `\n\nLive Sector Asset Breakdown Matrix:\n${groupedSectorAssets.sort((alpha, beta) => beta.changePercent - alpha.changePercent).map((stock) => `• ${stock.symbol} — ${fmtINR(stock.price)} (${stock.changePercent >= 0 ? '+' : ''}${stock.changePercent.toFixed(2)}%)`).join('\n')}\n\nComposite Sector Mean Variation: ${globalSectorMean >= 0 ? '+' : ''}${globalSectorMean}%`;
    }

    return {
      text: compositionPayload || `Retrieved base profiles concerning the macro ${matchedSector} index basket. Specify a focused ticker from this array for an absolute breakdown layout chart.`,
      sources: retrievedDocs.map((item) => ({ title: item.doc.title, score: item.score.toFixed(3) })),
      suggestions: groupedSectorAssets.slice(0, 3).map((stock) => ({ 
        text: `Analyze ${stock.symbol}`, 
        action: bindStockSelection(stock.symbol) 
      })),
    };
  }

  if (retrievedDocs.length > 0 && retrievedDocs[0].score > 0.05) {
    const primaryMatchNode = retrievedDocs[0].doc;
    const auxiliaryMatchNode = retrievedDocs[1]?.doc;
    
    let baseTextAggregation = primaryMatchNode.content;
    
    if (auxiliaryMatchNode && auxiliaryMatchNode.type === 'concept' && retrievedDocs[1].score > 0.08) {
      baseTextAggregation += `\n\nRelated Conceptual Extension: ${auxiliaryMatchNode.content.split('.')[0]}.`;
    }
    
    return {
      text: baseTextAggregation,
      sources: retrievedDocs.map((item) => ({ title: item.doc.title, score: item.score.toFixed(3) })),
      suggestions: [
        { text: 'Top gainers today?' },
        { text: 'Market overview' },
        { text: 'Tell me about TCS' },
      ],
    };
  }

  if (normalizedQuery.includes('buy') || normalizedQuery.includes('should i') || normalizedQuery.includes('invest') || normalizedQuery.includes('good stock')) {
    const activeQuotes = Array.from(quotes.values());
    const momentumLeaders = activeQuotes
      .sort((alpha, beta) => beta.changePercent - alpha.changePercent)
      .slice(0, 3);

    return {
      text: `Compliance Advisory Notice: This platform operates entirely as an algorithmic data simulation sandbox and does not furnish SEBI-certified investment advisories or capital allocation signals. \n\nFor observation, today's top momentum assets within the pipeline are:\n${momentumLeaders.map((stock) => `• ${stock.symbol} — ${fmtINR(stock.price)} (+${stock.changePercent.toFixed(2)}%)`).join('\n')}\n\nAlways validate core metrics (P/E ratio alignment, corporate debt-to-equity leverage limits, RSI boundaries) and maintain strict risk matrices before deploying configurations onto live capital markets.`,
      sources: retrievedDocs.slice(0, 1).map((item) => ({ title: item.doc.title, score: item.score.toFixed(3) })),
      suggestions: momentumLeaders.slice(0, 3).map((stock) => ({ 
        text: `Analyze ${stock.symbol}`, 
        action: bindStockSelection(stock.symbol) 
      })),
    };
  }

  if (retrievedDocs.length > 0) {
    return {
      text: retrievedDocs[0].doc.content,
      sources: retrievedDocs.map((item) => ({ title: item.doc.title, score: item.score.toFixed(3) })),
      suggestions: [
        { text: 'Top gainers today?' },
        { text: 'Market overview' },
        { text: 'Tell me about RELIANCE' },
      ],
    };
  }

  return {
    text: "Your search pattern falls outside the localized context index definitions. Re-initialize queries tracking down specific criteria paths:\n\n• Target Equity Assets (e.g., 'Tell me about INFOSYS')\n• Segment Industrial Spaces (e.g., 'How is the Banking sector performing?')\n• Mathematical Metrics (e.g., 'What is VWAP execution logic?')\n• Stream Indicators ('Market overview summary' or 'Top gainers')",
    sources: [],
    suggestions: [
      { text: 'Top gainers today?' },
      { text: 'What is VWAP?' },
      { text: 'Tell me about RELIANCE' },
    ],
  };
}