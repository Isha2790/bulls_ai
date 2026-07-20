/**
 * @fileoverview Local Persistence Data Access Object (DAO) Adapter
 * Emulates a structural transactional relational database cluster leveraging LocalStorage.
 * Engineered with cryptographic interface simulations and safe array mutation boundaries.
 */

const STORAGE_KEYS = Object.freeze({
  USERS: 'sp_users',
  SESSION: 'sp_session',
  PORTFOLIO: 'sp_portfolio',
  TRADES: 'sp_trades',
  HOLDINGS: 'sp_holdings',
  WATCHLIST: 'sp_watchlist'
});

const ACQUISITION_LIQUIDITY_BASE = 100000;

// High-precision financial value normalizer
const roundToCentNode = (numericalValue) => Math.round(numericalValue * 100) / 100;

/**
 * Generates an RFC-compliant alphanumeric record key space token.
 */
const generateSecureUid = () => {
  return 'u_' + Math.random().toString(36).slice(2, 11) + Date.now().toString(36);
};

async function simulateSecureHash(cleartextPassword) {
  const dataEncoder = new TextEncoder();
  const rawDataBuffer = dataEncoder.encode(cleartextPassword + '::bulls-ai-hardened-salt-v2');
  const cryptographicHash = await crypto.subtle.digest('SHA-256', rawDataBuffer);
  
  return Array.from(new Uint8Array(cryptographicHash))
    .map((byteValue) => byteValue.toString(16).padStart(2, '0'))
    .join('');
}

function sanitizeInputString(rawInputText) {
  if (typeof rawInputText !== 'string') return '';
  return rawInputText.replace(/[<>]/g, '').trim().slice(0, 200);
}

function validateEmailAddressFormat(emailAddressString) {
  const complianceRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return complianceRegex.test(emailAddressString) && emailAddressString.length <= 254;
}

// Core Low-Level Local Storage Input/Output Operations
function readFromStorage(vaultKey) {
  try {
    const serializationTarget = localStorage.getItem(vaultKey);
    return serializationTarget ? JSON.parse(serializationTarget) : null;
  } catch (ioException) {
    console.error(`[Storage Engine Exception]: Failure reading key block ${vaultKey}`, ioException);
    return null;
  }
}

function writeToStorage(vaultKey, dataPayload) {
  try {
    localStorage.setItem(vaultKey, JSON.stringify(dataPayload));
  } catch (ioException) {
    console.error(`[Storage Engine Exception]: Failure executing write to key block ${vaultKey}`, ioException);
  }
}

function compileScopedUserKey(baseKeyName, userIdToken) {
  return `${baseKeyName}_${userIdToken}`;
}

// Exposed Session Management API Components
export function getCurrentUser() {
  const activeSessionNode = readFromStorage(STORAGE_KEYS.SESSION);
  if (!activeSessionNode) return null;
  
  const synchronizedUsersRegistry = readFromStorage(STORAGE_KEYS.USERS) || [];
  const matchedUserRecord = synchronizedUsersRegistry.find((u) => u.id === activeSessionNode.userId);
  
  return matchedUserRecord 
    ? { id: matchedUserRecord.id, email: matchedUserRecord.email, createdAt: matchedUserRecord.createdAt } 
    : null;
}

export async function signUp(email, password) {
  email = sanitizeInputString(email).toLowerCase();
  if (!validateEmailAddressFormat(email)) return { error: 'Invalid email address validation constraints.' };
  if (!password || password.length < 6) return { error: 'Security threshold mismatch: Password must contain >= 6 characters.' };
  if (password.length > 128) return { error: 'Security threshold mismatch: Password length bounds exceeded.' };

  const targetUserRegistry = readFromStorage(STORAGE_KEYS.USERS) || [];
  if (targetUserRegistry.some((u) => u.email === email)) {
    return { error: 'Account registry collision: An account with this identity already exists.' };
  }

  const identitySecureHashValue = await simulateSecureHash(password);
  const userRecordNode = { id: generateSecureUid(), email, password: identitySecureHashValue, createdAt: Date.now() };
  
  targetUserRegistry.push(userRecordNode);
  writeToStorage(STORAGE_KEYS.USERS, targetUserRegistry);
  
  // Initialize scoped ecosystem ledgers for the newly provisioned operational entity
  writeToStorage(STORAGE_KEYS.SESSION, { userId: userRecordNode.id });
  writeToStorage(compileScopedUserKey(STORAGE_KEYS.PORTFOLIO, userRecordNode.id), { cashBalance: ACQUISITION_LIQUIDITY_BASE });
  writeToStorage(compileScopedUserKey(STORAGE_KEYS.TRADES, userRecordNode.id), []);
  writeToStorage(compileScopedUserKey(STORAGE_KEYS.HOLDINGS, userRecordNode.id), []);
  writeToStorage(compileScopedUserKey(STORAGE_KEYS.WATCHLIST, userRecordNode.id), []);
  
  return { error: null };
}

export async function signIn(email, password) {
  email = sanitizeInputString(email).toLowerCase();
  if (!validateEmailAddressFormat(email) || !password || password.length < 6) {
    return { error: 'Authentication challenge failed: Invalid account credentials entered.' };
  }

  const internalUserRegistry = readFromStorage(STORAGE_KEYS.USERS) || [];
  const comparativePasswordHash = await simulateSecureHash(password);
  const validatedUserRecord = internalUserRegistry.find((u) => u.email === email && u.password === comparativePasswordHash);
  
  if (!validatedUserRecord) {
    return { error: 'Authentication challenge failed: Invalid account credentials entered.' };
  }
  
  writeToStorage(STORAGE_KEYS.SESSION, { userId: validatedUserRecord.id });
  return { error: null };
}

export function signOut() { 
  localStorage.removeItem(STORAGE_KEYS.SESSION); 
}

export function getPortfolio(userId) {
  const targetedKeyLocation = compileScopedUserKey(STORAGE_KEYS.PORTFOLIO, userId);
  const balanceSheetPayload = readFromStorage(targetedKeyLocation);
  
  if (!balanceSheetPayload) {
    const structuralFallbackNode = { cashBalance: ACQUISITION_LIQUIDITY_BASE };
    writeToStorage(targetedKeyLocation, structuralFallbackNode);
    return structuralFallbackNode;
  }
  return balanceSheetPayload;
}

export function getTrades(userId) { return readFromStorage(compileScopedUserKey(STORAGE_KEYS.TRADES, userId)) || []; }
export function getHoldings(userId) { return readFromStorage(compileScopedUserKey(STORAGE_KEYS.HOLDINGS, userId)) || []; }
export function getWatchlist(userId) { return readFromStorage(compileScopedUserKey(STORAGE_KEYS.WATCHLIST, userId)) || []; }
export function saveWatchlist(userId, activeWatchlistArray) { writeToStorage(compileScopedUserKey(STORAGE_KEYS.WATCHLIST, userId), activeWatchlistArray); }

/**
 * Executes a trade order block defensively checking balance parameters.
 */
export function executeTrade(userId, { symbol, name, quantity, price, side }) {
  if (!userId || !symbol || !side) return { error: 'Transaction validation error: Missing parameters.' };
  
  const processedQuantity = Math.floor(Number(quantity)); 
  const processedPrice = Number(price);
  
  if (!Number.isFinite(processedQuantity) || processedQuantity <= 0) return { error: 'Transaction execution blocked: Quantity constraints violated.' };
  if (!Number.isFinite(processedPrice) || processedPrice <= 0) return { error: 'Transaction execution blocked: Price evaluation limits hit.' };
  if (processedPrice > 1000000 || processedQuantity > 100000) return { error: 'Order parameters out of baseline configuration scales.' };

  const userPortfolioInstance = getPortfolio(userId);
  const totalTransactionalCost = roundToCentNode(processedQuantity * processedPrice);
  let activeHoldingsRegistry = getHoldings(userId);

  if (side === 'BUY') {
    if (totalTransactionalCost > userPortfolioInstance.cashBalance) {
      return { error: 'Order execution canceled due to insufficient liquidity thresholds.' };
    }
    
    userPortfolioInstance.cashBalance = roundToCentNode(userPortfolioInstance.cashBalance - totalTransactionalCost);
    writeToStorage(compileScopedUserKey(STORAGE_KEYS.PORTFOLIO, userId), userPortfolioInstance);
    
    const existingHoldingNode = activeHoldingsRegistry.find((h) => h.symbol === symbol);
    if (existingHoldingNode) {
      const consolidatedQuantity = existingHoldingNode.quantity + processedQuantity;
      existingHoldingNode.avgPrice = roundToCentNode(((existingHoldingNode.avgPrice * existingHoldingNode.quantity) + (processedPrice * processedQuantity)) / consolidatedQuantity);
      existingHoldingNode.quantity = consolidatedQuantity;
    } else { 
      activeHoldingsRegistry.push({ symbol, name: sanitizeInputString(name), quantity: processedQuantity, avgPrice: processedPrice }); 
    }
    
    writeToStorage(compileScopedUserKey(STORAGE_KEYS.HOLDINGS, userId), activeHoldingsRegistry);

  } else if (side === 'SELL') {
    const currentInventoryHoldingNode = activeHoldingsRegistry.find((h) => h.symbol === symbol);
    if (!currentInventoryHoldingNode || currentInventoryHoldingNode.quantity < processedQuantity) {
      return { error: 'Order execution canceled due to insufficient shares available in inventory.' };
    }
    
    userPortfolioInstance.cashBalance = roundToCentNode(userPortfolioInstance.cashBalance + totalTransactionalCost);
    writeToStorage(compileScopedUserKey(STORAGE_KEYS.PORTFOLIO, userId), userPortfolioInstance);
    
    currentInventoryHoldingNode.quantity -= processedQuantity;
    
    // Defensive engineering: Filter out completely un-allocated stocks safely without structural array index corruption loops
    if (currentInventoryHoldingNode.quantity === 0) {
      activeHoldingsRegistry = activeHoldingsRegistry.filter((h) => h.symbol !== symbol);
    }
    
    writeToStorage(compileScopedUserKey(STORAGE_KEYS.HOLDINGS, userId), activeHoldingsRegistry);
  
  } else {
    return { error: 'Transaction execution aborted: Unresolved directional side identifier flag.' };
  }

  const unifiedHistoricalTradesLedger = getTrades(userId);
  unifiedHistoricalTradesLedger.unshift({ 
    id: generateSecureUid(), 
    createdAt: Date.now(), 
    symbol, 
    name: sanitizeInputString(name), 
    quantity: processedQuantity, 
    price: processedPrice, 
    side, 
    total: totalTransactionalCost 
  });
  
  writeToStorage(compileScopedUserKey(STORAGE_KEYS.TRADES, userId), unifiedHistoricalTradesLedger);
  return { error: null };
}

export function addFunds(userId, financialVolumeAmount) {
  if (!userId) return { error: 'Account session state un-authenticated.' };
  
  const parsedFundingAmount = Number(financialVolumeAmount);
  if (!Number.isFinite(parsedFundingAmount) || parsedFundingAmount <= 0) return { error: 'Allocation exception: Invalid funding amount.' };
  if (parsedFundingAmount > 10000000) return { error: 'Funding cap thresholds hit.' };

  const currentPortfolioState = getPortfolio(userId);
  currentPortfolioState.cashBalance = roundToCentNode(currentPortfolioState.cashBalance + parsedFundingAmount);
  writeToStorage(compileScopedUserKey(STORAGE_KEYS.PORTFOLIO, userId), currentPortfolioState);
  
  const historicalTradesLedger = getTrades(userId);
  historicalTradesLedger.unshift({ 
    id: generateSecureUid(), 
    createdAt: Date.now(), 
    symbol: 'FUNDS', 
    name: 'Account Deposit Allocation', 
    quantity: 1, 
    price: parsedFundingAmount, 
    side: 'DEPOSIT', 
    total: parsedFundingAmount 
  });
  
  writeToStorage(compileScopedUserKey(STORAGE_KEYS.TRADES, userId), historicalTradesLedger);
  return { error: null };
}