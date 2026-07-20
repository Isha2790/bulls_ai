import React, { useMemo } from 'react';

/**
 * Master Light-Weight Dynamic Sparkline Chart Component
 * Design Model: High-Frequency Hardware-Accelerated Micro-Vector Graph
 * Memoized to completely isolate layout calculations from background data ticks.
 */
const MiniSparkline = React.memo(({ 
  data = [], 
  positive = true, 
  width = 96, 
  height = 32,
  symbol = 'asset'
}) => {
  
  if (!data || data.length < 2) return null;

  // High-Performance SVG Coordinates Generation Pipeline
  // Memoizes geometric string paths to bypass structural string joins.

  const { pathString, areaString, gradientUniqueId } = useMemo(() => {
    // Normalizes input maps cleanly handling objects or flat numerical coordinates arrays
    const closingRatesArray = data.map((candle) => candle?.close ?? (typeof candle === 'number' ? candle : 0));
    
    const scaleMinimum = Math.min(...closingRatesArray);
    const scaleMaximum = Math.max(...closingRatesArray);
    const scaleRangeDelta = (scaleMaximum - scaleMinimum) || 1;

    // Maps array items into standard 2D Cartesian spatial point coordinates matrices
    const computedPointsMatrix = closingRatesArray.map((valuation, stepIndex) => {
      const horizontalCoordinateX = (stepIndex / (closingRatesArray.length - 1)) * width;
      // Compiles structural offset margins protecting bounds cutoffs dynamically
      const verticalCoordinateY = height - ((valuation - scaleMinimum) / scaleRangeDelta) * (height - 4) - 2;
      
      return { 
        x: horizontalCoordinateX, 
        y: verticalCoordinateY 
      };
    });

    // Compiles drawing instructions into production SVG format parameter metrics strings
    const structuralPathInstructions = computedPointsMatrix
      .map((point, idx) => `${idx === 0 ? 'M' : 'L'} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`)
      .join(' ');

    const structuralAreaInstructions = `${structuralPathInstructions} L ${width} ${height} L 0 ${height} Z`;

    // CRITICAL: Uses a deterministic naming standard to protect gradient cache nodes from flickering anomalies
    const dynamicGradientTokenId = `spark-gradient-${positive ? 'up' : 'down'}-${symbol.toLowerCase().replace(/[^a-z0-9]/g, '')}`;

    return {
      pathString: structuralPathInstructions,
      areaString: structuralAreaInstructions,
      gradientUniqueId: dynamicGradientTokenId
    };
  }, [data, positive, width, height, symbol]);

  const vectorStrokeColor = positive ? '#22c55e' : '#ef4444';

  return (
    <svg 
      viewBox={`0 0 ${width} ${height}`} 
      width={width} 
      height={height} 
      preserveAspectRatio="none"
      className="overflow-visible select-none pointer-events-none will-change-transform"
    >
      <defs>
        <linearGradient id={gradientUniqueId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={vectorStrokeColor} stopOpacity="0.15" />
          <stop offset="100%" stopColor={vectorStrokeColor} stopOpacity="0.00" />
        </linearGradient>
      </defs>
      
      {/* Underlying Translucent Area Graphic fill node */}
      <path 
        d={areaString} 
        fill={`url(#${gradientUniqueId})`} 
        className="transition-all duration-300"
      />
      
      {/* Primary Structural Trend Boundary Line Vector stroke node */}
      <path 
        d={pathString} 
        fill="none" 
        stroke={vectorStrokeColor} 
        strokeWidth="1.5" 
        vectorEffect="non-scaling-stroke" 
      />
    </svg>
  );
});

MiniSparkline.displayName = 'MiniSparkline';

export default MiniSparkline;