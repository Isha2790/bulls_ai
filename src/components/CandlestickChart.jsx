import React, { useRef, useEffect, useState, useMemo } from 'react';
import { fmtINR } from '../lib/marketEngine.js';

const MARKET_SESSION_OPEN_MINUTES = 9 * 60;
const MARKET_SESSION_CLOSE_MINUTES = 15 * 60 + 30;

function getSessionBoundsForIST(referenceTimestamp = Date.now()) {
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
    start: istMidnightUtc + MARKET_SESSION_OPEN_MINUTES * 60 * 1000,
    end: istMidnightUtc + MARKET_SESSION_CLOSE_MINUTES * 60 * 1000,
  };
}


const CandlestickChart = React.memo(({ candles = [], height = 360, isDark = true }) => {
  const canvasElementRef = useRef(null);
  const containerElementRef = useRef(null);
  
  // High-Frequency Viewport Bounds State Matrix
  const [viewportDimensions, setViewportDimensions] = useState({ width: 800, height });
  
  // Native Pointer Position Tracker Tracking References
  const pointerTrackingCoordRef = useRef(null);
  const [, forceComponentStateRepaint] = useState({});
  const lastCandleRevision = useMemo(() => {
    const latestCandle = candles?.[candles.length - 1];
    return latestCandle ? `${latestCandle.open}-${latestCandle.high}-${latestCandle.low}-${latestCandle.close}-${latestCandle.volume}` : 'empty';
  }, [candles]);

  const sessionBounds = useMemo(() => getSessionBoundsForIST(candles?.[candles.length - 1]?.time || Date.now()), [candles]);
  const sessionCandles = useMemo(() => {
    if (!candles || candles.length === 0) return [];
    return candles.filter((candle) => candle.time >= sessionBounds.start && candle.time <= sessionBounds.end);
  }, [candles, sessionBounds]);

  useEffect(() => {
    const componentResizeObserver = new ResizeObserver((observedEntries) => {
      for (const entry of observedEntries) {
        const dynamicObservedWidth = entry.contentRect.width;
        setViewportDimensions({
          width: dynamicObservedWidth,
          height: Math.min(dynamicObservedWidth * 0.5, height)
        });
      }
    });

    if (containerElementRef.current) {
      componentResizeObserver.observe(containerElementRef.current);
    }

    return () => componentResizeObserver.disconnect();
  }, [height]);

  // High-Performance Primary Canvas Painter Loop Subsystem
  useEffect(() => {
    const activeCanvasNode = canvasElementRef.current;
    if (!activeCanvasNode || !candles || candles.length === 0) return;

    const nativeDevicePixelRatio = window.devicePixelRatio || 1;
    const canvasWidthBenchmark = viewportDimensions.width;
    const canvasHeightBenchmark = viewportDimensions.height;

    // Synchronizes the layout device pixel metrics to protect anti-aliasing text crispness
    activeCanvasNode.width = canvasWidthBenchmark * nativeDevicePixelRatio;
    activeCanvasNode.height = canvasHeightBenchmark * nativeDevicePixelRatio;
    activeCanvasNode.style.width = `${canvasWidthBenchmark}px`;
    activeCanvasNode.style.height = `${canvasHeightBenchmark}px`;

    const canvasGraphicsContext = activeCanvasNode.getContext('2d');
    canvasGraphicsContext.scale(nativeDevicePixelRatio, nativeDevicePixelRatio);

    // -------------------------------------------------------------------------
    // Geometry Grid Padding Structural Layout Specifications
    // -------------------------------------------------------------------------
    const paddingRightColumn = 72;
    const paddingBottomRow = 24;
    const lowerVolumeProfileHeight = 50;
    const assetChartCeilingTop = 12;

    const assetChartFloorBottom = canvasHeightBenchmark - paddingBottomRow - lowerVolumeProfileHeight - 8;
    const assetChartLeftWall = 8;
    const assetChartRightWall = canvasWidthBenchmark - paddingRightColumn;

    const activeChartViewWidth = assetChartRightWall - assetChartLeftWall;
    const activeChartViewHeight = assetChartFloorBottom - assetChartCeilingTop;
    const volumeViewCeilingTop = assetChartFloorBottom + 8;
    const volumeViewFloorBottom = canvasHeightBenchmark - paddingBottomRow;

    // Trims vector frame mapping boundaries strictly to the last 60 temporal periods inside the session
    const focusedTimelineBasket = sessionCandles.length > 0 ? sessionCandles.slice(-60) : candles.slice(-60);
    const aggregatedPriceCoordinates = focusedTimelineBasket.flatMap((candle) => [candle.high, candle.low]);
    
    let minimumPriceBoundary = Math.min(...aggregatedPriceCoordinates);
    let maximumPriceBoundary = Math.max(...aggregatedPriceCoordinates);

    // Dynamic margin scaling protector calculations
    const assetProportionalPadding = (maximumPriceBoundary - minimumPriceBoundary) * 0.08 || 1;
    minimumPriceBoundary -= assetProportionalPadding;
    maximumPriceBoundary += assetProportionalPadding;

    const absolutePriceRangeDelta = maximumPriceBoundary - minimumPriceBoundary;
    const maximumObservedVolumeMetric = Math.max(...focusedTimelineBasket.map((candle) => candle.volume)) || 1;

    // Algorithmic coordinate transformers
    const dynamicTimelineSlotWidth = activeChartViewWidth / Math.max(focusedTimelineBasket.length, 1);
    const dynamicCandleBarWidth = Math.max(2, Math.min(12, dynamicTimelineSlotWidth * 0.65));

    const timeSpan = Math.max(sessionBounds.end - sessionBounds.start, 1);
    const computeSpatialCoordinateX = (candleTime) => {
      const clampedTime = Math.min(Math.max(candleTime, sessionBounds.start), sessionBounds.end);
      return assetChartLeftWall + ((clampedTime - sessionBounds.start) / timeSpan) * activeChartViewWidth;
    };
      
    const computeSpatialCoordinateY = (priceVal) => 
      assetChartCeilingTop + (1 - (priceVal - minimumPriceBoundary) / absolutePriceRangeDelta) * activeChartViewHeight;
      
    const computeVolumeCoordinateY = (volumeVal) => 
      volumeViewFloorBottom - (volumeVal / maximumObservedVolumeMetric) * (volumeViewFloorBottom - volumeViewCeilingTop);

    // Design System Color Configurations
    const structuralGridLineColor = isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.05)';
    const structuralLabelTextColor = isDark ? 'rgba(255, 255, 255, 0.35)' : 'rgba(0, 0, 0, 0.45)';
    const interactiveCrosshairColor = isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.25)';

    // Rendering Phase: Horizontal Price & Grid Matrix Lines
    canvasGraphicsContext.strokeStyle = structuralGridLineColor;
    canvasGraphicsContext.lineWidth = 1;
    canvasGraphicsContext.font = '10px monospace';
    canvasGraphicsContext.fillStyle = structuralLabelTextColor;
    canvasGraphicsContext.textAlign = 'left';
    canvasGraphicsContext.textBaseline = 'middle';

    for (let stepIndex = 0; stepIndex <= 5; stepIndex++) {
      const fractionalPlotY = assetChartCeilingTop + (stepIndex / 5) * activeChartViewHeight;
      const calculatedLabelPrice = maximumPriceBoundary - (stepIndex / 5) * absolutePriceRangeDelta;
      
      canvasGraphicsContext.beginPath();
      canvasGraphicsContext.moveTo(assetChartLeftWall, fractionalPlotY);
      canvasGraphicsContext.lineTo(assetChartRightWall, fractionalPlotY);
      canvasGraphicsContext.stroke();
      
      canvasGraphicsContext.fillText(fmtINR(calculatedLabelPrice), assetChartRightWall + 6, fractionalPlotY);
    }

    // Rendering Phase: Vertical Timeline Channel Matrix Lines
    for (let stepIndex = 0; stepIndex <= 6; stepIndex++) {
      const fractionalPlotX = assetChartLeftWall + (stepIndex / 6) * activeChartViewWidth;
      
      canvasGraphicsContext.beginPath();
      canvasGraphicsContext.moveTo(fractionalPlotX, assetChartCeilingTop);
      canvasGraphicsContext.lineTo(fractionalPlotX, volumeViewFloorBottom);
      canvasGraphicsContext.stroke();
    }

    // Rendering Phase: Temporal Timestamps Axis Text
    canvasGraphicsContext.fillStyle = structuralLabelTextColor;
    canvasGraphicsContext.font = '9px monospace';
    canvasGraphicsContext.textAlign = 'center';
    canvasGraphicsContext.textBaseline = 'top';

      const timeTicks = [
        sessionBounds.start,
        sessionBounds.start + 90 * 60 * 1000,
        sessionBounds.start + 180 * 60 * 1000,
        sessionBounds.start + 270 * 60 * 1000,
        sessionBounds.end,
      ];

      for (const tickTime of timeTicks) {
        const tickX = computeSpatialCoordinateX(tickTime);
        const tickDate = new Date(tickTime);
        const tickLabel = tickDate.toLocaleTimeString('en-GB', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        });
        canvasGraphicsContext.fillText(tickLabel, tickX, volumeViewFloorBottom + 4);
      }
    focusedTimelineBasket.forEach((candle) => {
      const mappingCoordinateX = computeSpatialCoordinateX(candle.time);
      const isPositiveSession = candle.close >= candle.open;
      
      canvasGraphicsContext.fillStyle = isPositiveSession ? 'rgba(34, 197, 94, 0.20)' : 'rgba(239, 68, 68, 0.20)';
      
      const calculatedVolumeY = computeVolumeCoordinateY(candle.volume);
      canvasGraphicsContext.fillRect(
        mappingCoordinateX - dynamicCandleBarWidth / 2, 
        calculatedVolumeY, 
        dynamicCandleBarWidth, 
        volumeViewFloorBottom - calculatedVolumeY
      );
    });

    // Rendering Phase: Primary Candlestick Vectors (Wicks & Bodies)
    focusedTimelineBasket.forEach((candle) => {
      const mappingCoordinateX = computeSpatialCoordinateX(candle.time);
      const isPositiveSession = candle.close >= candle.open;
      const targetSessionHexColor = isPositiveSession ? '#22c55e' : '#ef4444';

      canvasGraphicsContext.strokeStyle = targetSessionHexColor;
      canvasGraphicsContext.beginPath();
      canvasGraphicsContext.moveTo(mappingCoordinateX, computeSpatialCoordinateY(candle.high));
      canvasGraphicsContext.lineTo(mappingCoordinateX, computeSpatialCoordinateY(candle.low));
      canvasGraphicsContext.stroke();

      const trackingTopBodyY = computeSpatialCoordinateY(Math.max(candle.open, candle.close));
      const trackingBottomBodyY = computeSpatialCoordinateY(Math.min(candle.open, candle.close));
      
      canvasGraphicsContext.fillStyle = targetSessionHexColor;
      canvasGraphicsContext.fillRect(
        mappingCoordinateX - dynamicCandleBarWidth / 2, 
        trackingTopBodyY, 
        dynamicCandleBarWidth, 
        Math.max(1, trackingBottomBodyY - trackingTopBodyY)
      );
    });

    // Rendering Phase: Current Asset Ticker Spot Price Track Indicator
    const terminalLiveCandle = focusedTimelineBasket[focusedTimelineBasket.length - 1];
    if (terminalLiveCandle) {
      const dynamicLiveSpotPriceY = computeSpatialCoordinateY(terminalLiveCandle.close);
      const isLiveSessionPositive = terminalLiveCandle.close >= terminalLiveCandle.open;
      const terminalSessionHexColor = isLiveSessionPositive ? '#22c55e' : '#ef4444';

      canvasGraphicsContext.strokeStyle = terminalSessionHexColor;
      canvasGraphicsContext.setLineDash([3, 3]);
      canvasGraphicsContext.beginPath();
      canvasGraphicsContext.moveTo(assetChartLeftWall, dynamicLiveSpotPriceY);
      canvasGraphicsContext.lineTo(assetChartRightWall, dynamicLiveSpotPriceY);
      canvasGraphicsContext.stroke();
      canvasGraphicsContext.setLineDash([]);

      // Draws the right-aligned price badge indicator background box
      canvasGraphicsContext.fillStyle = terminalSessionHexColor;
      canvasGraphicsContext.fillRect(assetChartRightWall, dynamicLiveSpotPriceY - 9, paddingRightColumn, 18);
      
      canvasGraphicsContext.fillStyle = '#0a0e17';
      canvasGraphicsContext.font = 'bold 10px monospace';
      canvasGraphicsContext.fillText(fmtINR(terminalLiveCandle.close), assetChartRightWall + 4, dynamicLiveSpotPriceY);
    }

    // Rendering Phase: Interactive Crosshair Tracking Grid Overlay
    if (pointerTrackingCoordRef.current) {
      const { x: spatialPointerX, y: spatialPointerY } = pointerTrackingCoordRef.current;
      const pointerRatio = Math.min(Math.max((spatialPointerX - assetChartLeftWall) / activeChartViewWidth, 0), 1);
      const pointerTime = sessionBounds.start + pointerRatio * timeSpan;
      const selectedDataCandleNode = focusedTimelineBasket.reduce((closest, candle) => {
        if (!closest) return candle;
        return Math.abs(candle.time - pointerTime) < Math.abs(closest.time - pointerTime) ? candle : closest;
      }, null);

      if (selectedDataCandleNode) {
        const structuralFocusCoordinateX = computeSpatialCoordinateX(selectedDataCandleNode.time);

        // Vertical crosshair intersection line vector mapping draw
        canvasGraphicsContext.strokeStyle = interactiveCrosshairColor;
        canvasGraphicsContext.setLineDash([4, 4]);
        canvasGraphicsContext.beginPath();
        canvasGraphicsContext.moveTo(structuralFocusCoordinateX, assetChartCeilingTop);
        canvasGraphicsContext.lineTo(structuralFocusCoordinateX, volumeViewFloorBottom);
        canvasGraphicsContext.stroke();

        // Horizontal crosshair price path grid intersection line vector draw
        if (spatialPointerY >= assetChartCeilingTop && spatialPointerY <= assetChartFloorBottom) {
          canvasGraphicsContext.beginPath();
          canvasGraphicsContext.moveTo(assetChartLeftWall, spatialPointerY);
          canvasGraphicsContext.lineTo(assetChartRightWall, spatialPointerY);
          canvasGraphicsContext.stroke();
          canvasGraphicsContext.setLineDash([]);

          // Side contextual interactive price tracking badge panel draw
          canvasGraphicsContext.fillStyle = isDark ? '#1a1f2e' : '#1f2937';
          canvasGraphicsContext.fillRect(assetChartRightWall, spatialPointerY - 9, paddingRightColumn, 18);
          
          canvasGraphicsContext.fillStyle = '#ffffff';
          const contextualScannedPriceVal = maximumPriceBoundary - ((spatialPointerY - assetChartCeilingTop) / activeChartViewHeight) * absolutePriceRangeDelta;
          canvasGraphicsContext.fillText(fmtINR(contextualScannedPriceVal), assetChartRightWall + 4, spatialPointerY);
        }

        canvasGraphicsContext.setLineDash([]);
        
        // Detailed OHLC Context Dialog Box Overlay Draw using the selected node
        const popupDialogPlacementX = structuralFocusCoordinateX + 12;
        const popupDialogPlacementY = assetChartCeilingTop + 4;

        const refinedModalPlacementX = (popupDialogPlacementX + 140 > assetChartRightWall) 
          ? structuralFocusCoordinateX - 152 
          : popupDialogPlacementX;

        canvasGraphicsContext.fillStyle = isDark ? 'rgba(10, 14, 23, 0.94)' : 'rgba(255, 255, 255, 0.96)';
        canvasGraphicsContext.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';
        canvasGraphicsContext.fillRect(refinedModalPlacementX, popupDialogPlacementY, 140, 76);
        canvasGraphicsContext.strokeRect(refinedModalPlacementX, popupDialogPlacementY, 140, 76);

        canvasGraphicsContext.font = '10px monospace';
        canvasGraphicsContext.textAlign = 'left';
        canvasGraphicsContext.textBaseline = 'top';
        canvasGraphicsContext.fillStyle = structuralLabelTextColor;

        canvasGraphicsContext.fillText('O', refinedModalPlacementX + 8, popupDialogPlacementY + 6);
        canvasGraphicsContext.fillText('H', refinedModalPlacementX + 8, popupDialogPlacementY + 22);
        canvasGraphicsContext.fillText('L', refinedModalPlacementX + 8, popupDialogPlacementY + 38);
        canvasGraphicsContext.fillText('C', refinedModalPlacementX + 8, popupDialogPlacementY + 54);

        const isTargetCandleSessionPositive = selectedDataCandleNode.close >= selectedDataCandleNode.open;
        canvasGraphicsContext.fillStyle = isTargetCandleSessionPositive ? '#22c55e' : '#ef4444';
        
        canvasGraphicsContext.fillText(fmtINR(selectedDataCandleNode.open), refinedModalPlacementX + 24, popupDialogPlacementY + 6);
        canvasGraphicsContext.fillText(fmtINR(selectedDataCandleNode.high), refinedModalPlacementX + 24, popupDialogPlacementY + 22);
        canvasGraphicsContext.fillText(fmtINR(selectedDataCandleNode.low), refinedModalPlacementX + 24, popupDialogPlacementY + 38);
        canvasGraphicsContext.fillText(fmtINR(selectedDataCandleNode.close), refinedModalPlacementX + 24, popupDialogPlacementY + 54);
      }
    }
  }, [candles, viewportDimensions, isDark, lastCandleRevision]);

  return (
    <div ref={containerElementRef} className="w-full">
      <canvas 
        ref={canvasElementRef} 
        onMouseMove={(nativeEvent) => {
          const interactionBoundingClientRect = canvasElementRef.current.getBoundingClientRect();
          pointerTrackingCoordRef.current = {
            x: nativeEvent.clientX - interactionBoundingClientRect.left,
            y: nativeEvent.clientY - interactionBoundingClientRect.top
          };
          // Forces isolated state update checks without dropping continuous frames
          forceComponentStateRepaint({});
        }} 
        onMouseLeave={() => {
          pointerTrackingCoordRef.current = null;
          forceComponentStateRepaint({});
        }} 
        className="w-full rounded-xl select-none" 
        style={{ cursor: 'crosshair' }} 
      />
    </div>
  );
});
CandlestickChart.displayName = 'CandlestickChart';
export default CandlestickChart;