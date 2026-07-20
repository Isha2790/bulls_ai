import { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';

const TradingModeContext = createContext(null);


export function TradingModeProvider({ children }) {
  const [operationalMode, setOperationalMode] = useState(() => {
    return localStorage.getItem('sp_mode') || 'paper';
  });
  
  const [isBrokerConnected, setIsBrokerConnected] = useState(() => {
    return localStorage.getItem('sp_broker') === 'true';
  });
  
  const [connectedBrokerName, setConnectedBrokerName] = useState(() => {
    return localStorage.getItem('sp_broker_name') || '';
  });

  // Storage Synchronization Pipelines
  useEffect(() => { 
    localStorage.setItem('sp_mode', operationalMode); 
  }, [operationalMode]);

  useEffect(() => { 
    localStorage.setItem('sp_broker', isBrokerConnected ? 'true' : 'false'); 
  }, [isBrokerConnected]);

  useEffect(() => { 
    if (connectedBrokerName) {
      localStorage.setItem('sp_broker_name', connectedBrokerName);
    }
  }, [connectedBrokerName]);

  // Execution Control Operations API
  const handleToggleMode = useCallback(() => {
    if (operationalMode === 'paper' && !isBrokerConnected) {
      return false;
    }
    
    setOperationalMode((prevMode) => (prevMode === 'paper' ? 'real' : 'paper'));
    return true;
  }, [operationalMode, isBrokerConnected]);

  /**
   * Establishes automated credential confirmation loops linking simulated broker routes.
   */
  const handleConnectBroker = useCallback((brokerNameString) => {
    setIsBrokerConnected(true);
    setConnectedBrokerName(brokerNameString);
  }, []);

  /**
   * Terminates remote pipeline links, enforcing safety rollbacks straight to sandbox paper modes.
   */
  const handleDisconnectBroker = useCallback(() => {
    setIsBrokerConnected(false);
    setConnectedBrokerName('');
    localStorage.removeItem('sp_broker_name');
    setOperationalMode('paper'); // Safety fallback mandate
  }, []);

  // Memoized Context Core Value Matrix Definition
  const providerValueMatrix = useMemo(() => ({
    mode: operationalMode,
    isReal: operationalMode === 'real',
    isPaper: operationalMode === 'paper',
    brokerConnected: isBrokerConnected,
    brokerName: connectedBrokerName,
    toggleMode: handleToggleMode,
    connectBroker: handleConnectBroker,
    disconnectBroker: handleDisconnectBroker
  }), [
    operationalMode, 
    isBrokerConnected, 
    connectedBrokerName, 
    handleToggleMode, 
    handleConnectBroker, 
    handleDisconnectBroker
  ]);

  return (
    <TradingModeContext.Provider value={providerValueMatrix}>
      {children}
    </TradingModeContext.Provider>
  );
}
/**
 * Access hook exposing internal operational boundaries safely.
 */
export function useTradingMode() {
  const contextInstanceNode = useContext(TradingModeContext);
  
  if (!contextInstanceNode) {
    throw new Error(
      '[Context Resolution Error]: useTradingMode operational hook must be executed strictly within a valid TradingModeProvider closure tree structure.'
    );
  }
  
  return contextInstanceNode;
}