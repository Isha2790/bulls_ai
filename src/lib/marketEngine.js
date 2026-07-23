/**
 * @fileoverview High-Frequency Transaction Event Coordinator & Stream Multiplexer
 * Design Pattern: Centralized Event Emitter / Pub-Sub Architecture
 * Orchestrates real-time mathematical simulation matrix state fallbacks 
 * layered with robust asynchronous network loop gatekeeping.
 */
 
import { STOCKS } from './stocks.js';
import { fetchRealQuotes, fetchRealIndices, fetchCandles, subscribeToLiveMarketFeed } from './priceFetcher.js';
import { checkIsMarketOpen } from './marketGuard.js';
 
// Optimized numerical precision normalization functions
const roundToTwoPlaces = (value) => Math.round(value * 100) / 100;
const roundToFourPlaces = (value) => Math.round(value * 10000) / 10000;
 
/**
 * Encapsulates currency conversion mapping following local formatting regulations.
 * @param {number} value 
 * @param {number} [decimalPlaces=2] 
 * @returns {string} 
 */
export function fmtINR(value, decimalPlaces = 2) {
  if (value == null || isNaN(value)) return '—';
  return '₹' + value.toLocaleString('en-IN', { 
    minimumFractionDigits: decimalPlaces, 
    maximumFractionDigits: decimalPlaces 
  });
}
 
class MarketDataEngine {
  constructor() {
    this.quotesStore = new Map();
    this.indicesStore = { NIFTY50: null, SENSEX: null, INDIAVIX: null };
    
    // Subscriber tracking sets
    this.quoteSubscribers = new Set();
    this.indexSubscribers = new Set();
    
    // Thread lifecycle registry identifiers
    this.tickTimerReferenceId = null;
    this.notificationTimerReferenceId = null;
    this.networkFetchTimerReferenceId = null;
    
    this.simulatedTickCycleCounter = 0;
    this.isPipelineLive = false;
    this.isNetworkFetchActive = false; // Asynchronous race condition lock mechanism
    this.liveFeedCleanup = null;
 
    this._initializeEngineLayer();
  }
 
  /**
   * Bootstraps local seed allocations to minimize frame lag on cold boots.
   * @private
   */
  _initializeEngineLayer() {
    try {
      for (const stock of STOCKS) {
        const generatedCandles = this._generateSeedCandles(stock.basePrice, 80);
        const dynamicClosingPrice = generatedCandles[generatedCandles.length - 1].close;
        const historicalTrailingClose = generatedCandles[generatedCandles.length - 2]?.close ?? stock.basePrice;
        
        // Simulates realistic high/low bands
        const boundaryHigh52 = roundToTwoPlaces(stock.basePrice * (1 + (Math.random() * 0.35 + 0.05)));
        const boundaryLow52  = roundToTwoPlaces(stock.basePrice * (1 - (Math.random() * 0.25 - 0.05)));
        
        this.quotesStore.set(stock.symbol, {
          symbol: stock.symbol,
          name: stock.name,
          sector: stock.sector,
          price: dynamicClosingPrice,
          prevClose: roundToTwoPlaces(historicalTrailingClose),
          open: roundToTwoPlaces(generatedCandles[0].open),
          change: roundToTwoPlaces(dynamicClosingPrice - historicalTrailingClose),
          changePercent: roundToTwoPlaces(((dynamicClosingPrice - historicalTrailingClose) / historicalTrailingClose) * 100),
          high: roundToTwoPlaces(Math.max(...generatedCandles.map((c) => c.high))),
          low: roundToTwoPlaces(Math.min(...generatedCandles.map((c) => c.low))),
          high52: boundaryHigh52,
          low52: boundaryLow52,
          circuitUpper: roundToTwoPlaces(dynamicClosingPrice * 1.20),
          circuitLower: roundToTwoPlaces(dynamicClosingPrice * 0.80),
          vwap: roundToTwoPlaces(dynamicClosingPrice * (1 + (Math.random() - 0.5) * 0.003)),
          avgTradedPrice: roundToTwoPlaces(dynamicClosingPrice * (1 + (Math.random() - 0.5) * 0.005)),
          volume: Math.floor(Math.random() * 8000000) + 500000,
          bid: roundToTwoPlaces(dynamicClosingPrice - Math.random() * 0.5),
          ask: roundToTwoPlaces(dynamicClosingPrice + Math.random() * 0.5),
          depth: this._generateSeedDepth(dynamicClosingPrice),
          candles: generatedCandles,
          lastUpdate: Date.now(),
          isLive: false,
        });
      }
      
      this._initializeStaticIndices();
      this._executeInitialDataIngestion();
    } catch (bootstrapException) {
      console.error("[Engine Initialization Failure]: Core setup crash.", bootstrapException);
    }
  }
 
  /**
   * Initiates the initial data load across active connections.
   * @private
   */
  async _executeInitialDataIngestion() {
    const symbolTokensRegistry = STOCKS.map((asset) => asset.symbol);
    
    try {
      const [realtimeQuotesResponse, realtimeIndicesResponse] = await Promise.all([
        fetchRealQuotes(symbolTokensRegistry),
        fetchRealIndices(),
      ]);
 
      if (realtimeQuotesResponse) {
        let activeLiveNodeCount = 0;
        
        for (const [symbolToken, metricsPayload] of Object.entries(realtimeQuotesResponse)) {
          const underlyingRecord = this.quotesStore.get(symbolToken);
          if (!underlyingRecord || !metricsPayload.price) continue;
 
          this.quotesStore.set(symbolToken, {
            ...underlyingRecord,
            price: roundToTwoPlaces(metricsPayload.price),
            prevClose: roundToTwoPlaces(metricsPayload.prevClose || underlyingRecord.prevClose),
            open: roundToTwoPlaces(metricsPayload.open || underlyingRecord.open),
            high: roundToTwoPlaces(metricsPayload.high || underlyingRecord.high),
            low: roundToTwoPlaces(metricsPayload.low || underlyingRecord.low),
            change: roundToTwoPlaces(metricsPayload.change ?? (metricsPayload.price - (metricsPayload.prevClose || underlyingRecord.prevClose))),
            changePercent: roundToTwoPlaces(metricsPayload.changePercent ?? ((metricsPayload.price - (metricsPayload.prevClose || underlyingRecord.prevClose)) / (metricsPayload.prevClose || underlyingRecord.prevClose)) * 100),
            volume: metricsPayload.volume || underlyingRecord.volume,
            high52: roundToTwoPlaces(metricsPayload.fiftyTwoWeekHigh || underlyingRecord.high52),
            low52: roundToTwoPlaces(metricsPayload.fiftyTwoWeekLow || underlyingRecord.low52),
            circuitUpper: roundToTwoPlaces(metricsPayload.circuitUpper || (metricsPayload.prevClose || underlyingRecord.prevClose) * 1.20),
            circuitLower: roundToTwoPlaces(metricsPayload.circuitLower || (metricsPayload.prevClose || underlyingRecord.prevClose) * 0.80),
            vwap: roundToTwoPlaces(metricsPayload.price * (1 + (Math.random() - 0.5) * 0.002)),
            avgTradedPrice: roundToTwoPlaces(metricsPayload.price * (1 + (Math.random() - 0.5) * 0.003)),
            bid: roundToTwoPlaces(metricsPayload.price - Math.random() * (metricsPayload.price * 0.0005 + 0.05)),
            ask: roundToTwoPlaces(metricsPayload.price + Math.random() * (metricsPayload.price * 0.0005 + 0.05)),
            depth: this._generateSeedDepth(metricsPayload.price),
            lastUpdate: Date.now(),
            isLive: true,
          });
          activeLiveNodeCount++;
        }
        this.isPipelineLive = activeLiveNodeCount > 0;
      } else {
        this.isPipelineLive = true;
      }
 
      if (realtimeIndicesResponse) {
        for (const [indexKey, indexPayload] of Object.entries(realtimeIndicesResponse)) {
          if (indexPayload.value) {
            this.indicesStore[indexKey] = {
              ...indexPayload,
              value: roundToTwoPlaces(indexPayload.value),
              change: roundToTwoPlaces(indexPayload.change),
              changePercent: roundToFourPlaces(indexPayload.changePercent),
            };
          }
        }
      }
 
      this._dispatchNotificationEvent();
      this._connectLiveFeed();
      this._asynchronouslyIngestHistoricalCandles();
    } catch (ingestionException) {
      console.warn("[Ingestion Exception]: Stream synchronization dropped temporarily.", ingestionException);
    }
    // NOTE: Upstox's V3 WebSocket feed sends binary Protobuf frames, which this app does not
    // currently decode (see the `message` handler in priceFetcher.js) - so live tick-by-tick
    // updates never actually reach the UI even though the socket connects successfully. Until
    // Protobuf decoding is added, this REST poll is the only thing actually refreshing prices,
    // so it's intentionally set faster than a "nice-to-have" cadence would normally need.
    this.networkFetchTimerReferenceId = setInterval(() => this._synchronizeRealtimeDataStreams(), 3000);
  }
 
  /**
   * Refreshes real-time metrics while applying concurrency safety locks.
   * @private
   */
  async _synchronizeRealtimeDataStreams() {
    if (this.isNetworkFetchActive) return; 
    this.isNetworkFetchActive = true;
    
    const stockSymbolMatrixTokens = STOCKS.map((asset) => asset.symbol);
    try {
      const updatedQuotesMatrix = await fetchRealQuotes(stockSymbolMatrixTokens);
      if (updatedQuotesMatrix) {
        let hasLiveUpdates = false;
        for (const [symbolKey, updatePayload] of Object.entries(updatedQuotesMatrix)) {
          const recordTarget = this.quotesStore.get(symbolKey);
          if (!recordTarget || !updatePayload.price) continue;
 
          const updatedCandles = (() => {
            if (!recordTarget.candles || recordTarget.candles.length === 0) return recordTarget.candles;
            const lastCandle = recordTarget.candles[recordTarget.candles.length - 1];
            const updatedClose = roundToTwoPlaces(updatePayload.price);
            const nowBucketStart = Math.floor(Date.now() / 60000) * 60000;
            const lastCandleBucketStart = Math.floor(lastCandle.time / 60000) * 60000;
 
            if (nowBucketStart > lastCandleBucketStart) {
              // A new minute has started since the last candle - append a new bar.
              const freshCandle = {
                time: nowBucketStart,
                open: lastCandle.close,
                high: updatedClose,
                low: updatedClose,
                close: updatedClose,
                volume: Math.floor(Math.random() * 500) + 100,
              };
              return [...recordTarget.candles, freshCandle].slice(-375); // cap at one session's worth of 1-min candles
            }
 
            // Still within the same minute - update the existing last candle in place.
            return [
              ...recordTarget.candles.slice(0, -1),
              {
                ...lastCandle,
                close: updatedClose,
                high: roundToTwoPlaces(Math.max(lastCandle.high, updatedClose)),
                low: roundToTwoPlaces(Math.min(lastCandle.low, updatedClose)),
                volume: lastCandle.volume + Math.floor(Math.random() * 1200),
              }
            ];
          })();
 
        this.quotesStore.set(symbolKey, {
            ...recordTarget,
            price: roundToTwoPlaces(updatePayload.price),
            change: roundToTwoPlaces(updatePayload.change ?? (updatePayload.price - recordTarget.prevClose)),
            changePercent: roundToTwoPlaces(updatePayload.changePercent ?? ((updatePayload.price - recordTarget.prevClose) / recordTarget.prevClose) * 100),
            high: roundToTwoPlaces(Math.max(recordTarget.high, updatePayload.high || updatePayload.price)),
            low: roundToTwoPlaces(Math.min(recordTarget.low, updatePayload.low || updatePayload.price)),
            volume: updatePayload.volume || recordTarget.volume,
            candles: updatedCandles,
            bid: roundToTwoPlaces(updatePayload.price - Math.random() * (updatePayload.price * 0.0005 + 0.05)),
            ask: roundToTwoPlaces(updatePayload.price + Math.random() * (updatePayload.price * 0.0005 + 0.05)),
            depth: this._mutateDepthMetrics(recordTarget.depth, updatePayload.price),
            lastUpdate: Date.now(),
            isLive: true,
          });
          hasLiveUpdates = true;
        }
        this.isPipelineLive = hasLiveUpdates || this.isPipelineLive;
      }
    } catch (syncException) {
      console.warn("[Background Sync Exception]: Stream pipeline unresolved.", syncException);
    } finally {
      this.isNetworkFetchActive = false;
    }
  }
 
  /**
   * Asynchronously updates historical data blocks across elements.
   * @private
   */
  async _asynchronouslyIngestHistoricalCandles() {
    for (const stock of STOCKS) {
      try {
        const structuralCandles = await fetchCandles(stock.symbol, '1d', '5m');
        if (structuralCandles && structuralCandles.length > 5) {
          const cachedQuoteInstance = this.quotesStore.get(stock.symbol);
          if (cachedQuoteInstance) {
            this.quotesStore.set(stock.symbol, {
              ...cachedQuoteInstance,
              candles: structuralCandles,
              lastUpdate: Date.now()
            });
          }
        }
      } catch (candleException) {
        // Safe logging mapping boundary levels
      }
    }
    this._dispatchNotificationEvent();
  }
 
  _connectLiveFeed() {
    if (this.liveFeedCleanup) return;
 
    const symbolTokensRegistry = STOCKS.map((asset) => asset.symbol);
    this.liveFeedCleanup = subscribeToLiveMarketFeed(
      symbolTokensRegistry,
      (symbolKey, quoteUpdate) => {
        const currentRecord = this.quotesStore.get(symbolKey);
        if (!currentRecord) return;
 
        const updatedPrice = roundToTwoPlaces(quoteUpdate.price ?? currentRecord.price);
        const updatedCandles = (() => {
          if (!currentRecord.candles || currentRecord.candles.length === 0) return currentRecord.candles;
          const lastCandle = currentRecord.candles[currentRecord.candles.length - 1];
          const nowBucketStart = Math.floor(Date.now() / 60000) * 60000;
          const lastCandleBucketStart = Math.floor(lastCandle.time / 60000) * 60000;
 
          if (nowBucketStart > lastCandleBucketStart) {
            const freshCandle = {
              time: nowBucketStart,
              open: lastCandle.close,
              high: updatedPrice,
              low: updatedPrice,
              close: updatedPrice,
              volume: Math.floor(Math.random() * 500) + 100,
            };
            return [...currentRecord.candles, freshCandle].slice(-375);
          }
 
          return [
            ...currentRecord.candles.slice(0, -1),
            {
              ...lastCandle,
              close: updatedPrice,
              high: roundToTwoPlaces(Math.max(lastCandle.high, updatedPrice)),
              low: roundToTwoPlaces(Math.min(lastCandle.low, updatedPrice)),
              volume: lastCandle.volume + Math.floor(Math.random() * 1200),
            }
          ];
        })();
 
        const nextQuote = {
          ...currentRecord,
          price: updatedPrice,
          prevClose: roundToTwoPlaces(quoteUpdate.prevClose ?? currentRecord.prevClose),
          open: roundToTwoPlaces(quoteUpdate.open ?? currentRecord.open),
          high: roundToTwoPlaces(quoteUpdate.high ?? currentRecord.high),
          low: roundToTwoPlaces(quoteUpdate.low ?? currentRecord.low),
          change: roundToTwoPlaces(quoteUpdate.change ?? (updatedPrice - (quoteUpdate.prevClose ?? currentRecord.prevClose))),
          changePercent: roundToTwoPlaces(quoteUpdate.changePercent ?? (((updatedPrice - (quoteUpdate.prevClose ?? currentRecord.prevClose)) / (quoteUpdate.prevClose || currentRecord.prevClose || 1)) * 100)),
          volume: quoteUpdate.volume ?? currentRecord.volume,
          candles: updatedCandles,
          bid: roundToTwoPlaces(updatedPrice - Math.random() * (updatedPrice * 0.0005 + 0.05)),
          ask: roundToTwoPlaces(updatedPrice + Math.random() * (updatedPrice * 0.0005 + 0.05)),
          depth: this._mutateDepthMetrics(currentRecord.depth, updatedPrice),
          lastUpdate: Date.now(),
          isLive: true,
        };
 
        this.quotesStore.set(symbolKey, nextQuote);
        this.isPipelineLive = true;
        this._dispatchNotificationEvent();
      },
      (indexKey, indexUpdate) => {
        const currentIndex = this.indicesStore[indexKey];
        if (!currentIndex) return;
 
        this.indicesStore[indexKey] = {
          ...currentIndex,
          value: roundToTwoPlaces(indexUpdate.value ?? currentIndex.value),
          prevClose: roundToTwoPlaces(indexUpdate.prevClose ?? currentIndex.prevClose),
          change: roundToTwoPlaces(indexUpdate.change ?? currentIndex.change),
          changePercent: roundToFourPlaces(indexUpdate.changePercent ?? currentIndex.changePercent),
        };
        this._dispatchNotificationEvent();
      },
      (streamError) => {
        console.warn('[Live Feed] stream error:', streamError);
      }
    );
  }
 
  _initializeStaticIndices() {
    this.indicesStore.NIFTY50  = { name: 'NIFTY 50',   value: 24227.35, prevClose: 24207.10, change: 20.25,  changePercent: 0.08 };
    this.indicesStore.SENSEX   = { name: 'SENSEX',      value: 77692.13, prevClose: 77569.39, change: 122.74, changePercent: 0.16 };
    this.indicesStore.INDIAVIX = { name: 'INDIA VIX',   value: 13.35,    prevClose: 12.24,    change: 1.11,   changePercent: 9.07 };
  }
 
  _generateSeedDepth(basePrice) {
    const buyBidsArray = [], sellAsksArray = [];
    for (let index = 0; index < 5; index++) {
      const gapVarianceSpread = basePrice * 0.0002 * (index + 1);
      buyBidsArray.push({ price: roundToTwoPlaces(basePrice - gapVarianceSpread), qty: Math.floor(Math.random() * 1500) + 50 });
      sellAsksArray.push({ price: roundToTwoPlaces(basePrice + gapVarianceSpread), qty: Math.floor(Math.random() * 1500) + 50 });
    }
    return { bids: buyBidsArray, asks: sellAsksArray };
  }
 
  _generateSeedCandles(baselineAnchorPrice, sampleCapacityCount) {
    const candlesHistoricalLedger = [];
    let processingPriceTrack = baselineAnchorPrice * (1 + (Math.random() - 0.5) * 0.02);
    
    for (let index = 0; index < sampleCapacityCount; index++) {
      const currentOpeningValue = processingPriceTrack;
      const volatilityIndexStep = Math.max(baselineAnchorPrice * 0.006, 0.05);
      const randomWalkPriceShift = (Math.random() - 0.48) * volatilityIndexStep * 2;
      
      const deterministicCloseValue = roundToTwoPlaces(Math.max(currentOpeningValue + randomWalkPriceShift, 0.01));
      const dynamicHighCeiling = roundToTwoPlaces(Math.max(currentOpeningValue, deterministicCloseValue) + Math.random() * volatilityIndexStep * 0.5);
      const dynamicLowFloor = roundToTwoPlaces(Math.min(currentOpeningValue, deterministicCloseValue) - Math.random() * volatilityIndexStep * 0.5);
      
      candlesHistoricalLedger.push({
        time: Date.now() - (sampleCapacityCount - index) * 300000,
        open: currentOpeningValue,
        high: dynamicHighCeiling,
        low: dynamicLowFloor,
        close: deterministicCloseValue,
        volume: Math.floor(Math.random() * 500000) + 50000
      });
      processingPriceTrack = deterministicCloseValue;
    }
    return candlesHistoricalLedger;
  }
 
  _tickIndicesSimulationFlow() {
    if (this.isPipelineLive) return;
    for (const structuralIndexToken of ['NIFTY50', 'SENSEX', 'INDIAVIX']) {
      const targetingIndexRecord = this.indicesStore[structuralIndexToken];
      if (!targetingIndexRecord) continue;
      
      const boundaryVolatilityLimit = structuralIndexToken === 'INDIAVIX' ? 0.008 : 0.0003;
      const scalarRandomDelta = (Math.random() - 0.49) * targetingIndexRecord.value * boundaryVolatilityLimit;
      
      targetingIndexRecord.value = roundToTwoPlaces(Math.max(targetingIndexRecord.value + scalarRandomDelta, 0.01));
      targetingIndexRecord.change = roundToTwoPlaces(targetingIndexRecord.value - targetingIndexRecord.prevClose);
      targetingIndexRecord.changePercent = roundToFourPlaces((targetingIndexRecord.change / targetingIndexRecord.prevClose) * 100);
    }
  }
 
  /**
   * Internal high-frequency ticker loop running every second.
   * Uses an in-place array modification strategy to optimize memory usage.
   * @private
   */
  _executeEngineTickCycle() {
    // CRITICAL ENFORCEMENT: Guard high-frequency random walk data generators against off-hour sessions
    if (!checkIsMarketOpen()) return;
 
    this.simulatedTickCycleCounter++;
    this._tickIndicesSimulationFlow();
 
    for (const [tickerToken, existingQuotePayload] of this.quotesStore) {
      if (existingQuotePayload.isLive) continue; 
      
      const referenceCandlesLane = existingQuotePayload.candles;
      const trailingCandleIndexNode = referenceCandlesLane[referenceCandlesLane.length - 1];
      const algorithmicVolatilityUnit = Math.max(existingQuotePayload.prevClose * 0.003, 0.05);
      const coordinateRandomWalkShift = (Math.random() - 0.49) * algorithmicVolatilityUnit * 2;
      
      const terminalComputedClose = roundToTwoPlaces(Math.max(trailingCandleIndexNode.close + coordinateRandomWalkShift, 0.01));
      const terminalComputedHigh  = roundToTwoPlaces(Math.max(trailingCandleIndexNode.high, terminalComputedClose));
      const terminalComputedLow   = roundToTwoPlaces(Math.min(trailingCandleIndexNode.low, terminalComputedClose));
      const terminalComputedVolume = trailingCandleIndexNode.volume + Math.floor(Math.random() * 500);
 
      const updatedCandle = {
        ...trailingCandleIndexNode,
        close: terminalComputedClose,
        high: terminalComputedHigh,
        low: terminalComputedLow,
        volume: terminalComputedVolume,
      };
 
      const updatedCandles = this.simulatedTickCycleCounter % 20 === 0
        ? [
            ...referenceCandlesLane,
            {
              time: Date.now(),
              open: terminalComputedClose,
              high: terminalComputedClose,
              low: terminalComputedClose,
              close: terminalComputedClose,
              volume: Math.floor(Math.random() * 8000) + 2000
            }
          ].slice(-140)
        : [
            ...referenceCandlesLane.slice(0, -1),
            updatedCandle
          ];
 
      const activeComputedChange = roundToTwoPlaces(terminalComputedClose - existingQuotePayload.prevClose);
      const advancedRunningVwap = roundToTwoPlaces(existingQuotePayload.vwap * 0.999 + terminalComputedClose * 0.001);
      const advancedRunningAvgTP = roundToTwoPlaces(existingQuotePayload.avgTradedPrice * 0.998 + terminalComputedClose * 0.002);
 
      this.quotesStore.set(tickerToken, {
        ...existingQuotePayload,
        price: terminalComputedClose,
        change: activeComputedChange,
        changePercent: roundToTwoPlaces((activeComputedChange / existingQuotePayload.prevClose) * 100),
        high: roundToTwoPlaces(Math.max(existingQuotePayload.high, terminalComputedHigh)),
        low: roundToTwoPlaces(Math.min(existingQuotePayload.low, terminalComputedLow)),
        volume: existingQuotePayload.volume + Math.floor(Math.random() * 10000),
        bid: roundToTwoPlaces(terminalComputedClose - Math.random() * (terminalComputedClose * 0.0005 + 0.05)),
        ask: roundToTwoPlaces(terminalComputedClose + Math.random() * (terminalComputedClose * 0.0005 + 0.05)),
        depth: this._mutateDepthMetrics(existingQuotePayload.depth, terminalComputedClose),
        candles: updatedCandles,
        vwap: advancedRunningVwap,
        avgTradedPrice: advancedRunningAvgTP,
        lastUpdate: Date.now(),
      });
    }
  }
 
  _mutateDepthMetrics(priorDepthObject, currentSpotPrice) {
    const updatedBidsMapping = priorDepthObject.bids.map((bidItem, index) => {
      const deltaSpreadOffset = currentSpotPrice * 0.0002 * (index + 1);
      return { price: roundToTwoPlaces(currentSpotPrice - deltaSpreadOffset), qty: Math.max(1, bidItem.qty + Math.floor((Math.random() - 0.5) * 100)) };
    });
    
    const updatedAsksMapping = priorDepthObject.asks.map((askItem, index) => {
      const deltaSpreadOffset = currentSpotPrice * 0.0002 * (index + 1);
      return { price: roundToTwoPlaces(currentSpotPrice + deltaSpreadOffset), qty: Math.max(1, askItem.qty + Math.floor((Math.random() - 0.5) * 100)) };
    });
    
    return { bids: updatedBidsMapping, asks: updatedAsksMapping };
  }
 
  /**
   * Broadcasts snapshots to all active channel listeners.
   * @private
   */
  _dispatchNotificationEvent() {
    const assetQuotesSnapshot = new Map(this.quotesStore);
    const indicesSnapshot = { ...this.indicesStore };
    
    this.quoteSubscribers.forEach((callbackFunction) => callbackFunction(assetQuotesSnapshot));
    this.indexSubscribers.forEach((callbackFunction) => callbackFunction(indicesSnapshot));
  }
 
  start() {
    if (this.tickTimerReferenceId) return;
    this.tickTimerReferenceId = setInterval(() => this._executeEngineTickCycle(), 1000);
    this.notificationTimerReferenceId = setInterval(() => this._dispatchNotificationEvent(), 1000);
    this._dispatchNotificationEvent();
  }
 
  stop() {
    if (this.tickTimerReferenceId) { clearInterval(this.tickTimerReferenceId); this.tickTimerReferenceId = null; }
    if (this.notificationTimerReferenceId) { clearInterval(this.notificationTimerReferenceId); this.notificationTimerReferenceId = null; }
    if (this.networkFetchTimerReferenceId) { clearInterval(this.networkFetchTimerReferenceId); this.networkFetchTimerReferenceId = null; }
    if (this.liveFeedCleanup) { this.liveFeedCleanup(); this.liveFeedCleanup = null; }
    this.isPipelineLive = false;
  }
 
  subscribe(callbackFn) {
    this.quoteSubscribers.add(callbackFn);
    callbackFn(new Map(this.quotesStore));
    this.start();
    
    return () => {
      this.quoteSubscribers.delete(callbackFn);
      if (this.quoteSubscribers.size === 0 && this.indexSubscribers.size === 0) {
        this.stop();
      }
    };
  }
 
  subscribeIndices(callbackFn) {
    this.indexSubscribers.add(callbackFn);
    callbackFn({ ...this.indicesStore });
    this.start();
    
    return () => {
      this.indexSubscribers.delete(callbackFn);
      if (this.quoteSubscribers.size === 0 && this.indexSubscribers.size === 0) {
        this.stop();
      }
    };
  }
  getIsLive() { 
    return this.isPipelineLive; 
  }
}
export const marketEngine = new MarketDataEngine();