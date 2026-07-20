import { useEffect, useState } from 'react';
import { marketEngine } from '../lib/marketEngine.js';

export function useLiveQuotes() {
  const [quotes, setQuotes] = useState(() => new Map());

  useEffect(() => {
    const unsubscribeFromQuotes = marketEngine.subscribe((incomingQuotesSnapshot) => {
      setQuotes(incomingQuotesSnapshot);
    });
    return unsubscribeFromQuotes;
  }, []);

  return quotes;
}
export function useLiveIndices() {
  const [indices, setIndices] = useState(() => ({ 
    NIFTY50: null, 
    SENSEX: null, 
    INDIAVIX: null 
  }));

  useEffect(() => {
    const unsubscribeFromIndices = marketEngine.subscribeIndices((incomingIndicesSnapshot) => {
      setIndices(incomingIndicesSnapshot);
    });
    return unsubscribeFromIndices;
  }, []);

  return indices;
}