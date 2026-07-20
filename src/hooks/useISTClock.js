import { useState, useEffect, useMemo } from 'react';

export function useISTClock() {
  const [currentTimeNode, setCurrentTimeNode] = useState(() => new Date());

  useEffect(() => {
    const threadIntervalId = setInterval(() => {
      setCurrentTimeNode(new Date());
    }, 1000);

    return () => clearInterval(threadIntervalId);
  }, []);

  const formalTimeStr = useMemo(() => {
    return currentTimeNode.toLocaleTimeString('en-GB', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  }, [currentTimeNode]);

  const formalDateStr = useMemo(() => {
    return currentTimeNode.toLocaleDateString('en-IN', {
      timeZone: 'Asia/Kolkata',
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }, [currentTimeNode]);

  return { 
    time: formalTimeStr, 
    date: formalDateStr 
  };
}