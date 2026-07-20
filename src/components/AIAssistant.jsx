import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Sparkles, Send, X, Bot, User, BookOpen, AlertCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';
import { generateRAGResponse } from '../lib/ragGenerator.js';

const PLATFORM_GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || '';

const ChatMessageBubble = React.memo(({ message, isDark, onSuggestionClick }) => {
  const isUserRole = message.role === 'user';
  
  return (
    <div className={`flex gap-3 select-text ${isUserRole ? 'flex-row-reverse' : ''}`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center shadow-sm ${
        isUserRole ? 'bg-zinc-600' : 'bg-gradient-to-br from-emerald-400 to-emerald-600'
      }`}>
        {isUserRole ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
      </div>
      
      <div className={`max-w-[80%] px-4 py-2.5 text-sm leading-relaxed whitespace-pre-line rounded-2xl border shadow-sm ${
        isUserRole 
          ? 'bg-zinc-800 border-zinc-700 text-zinc-100' 
          : isDark ? 'bg-zinc-900/60 border-zinc-800 text-zinc-200' : 'bg-slate-50 border-slate-200 text-slate-700'
      }`}>
        {message.text}
        {message.streaming && (
          <span className="inline-block w-1.5 h-3 bg-emerald-400 animate-pulse ml-1 align-middle" />
        )}
        
        {/* Source Citations Layout Matrix Block */}
        {message.sources && message.sources.length > 0 && (
          <div className={`mt-3 pt-2 border-t select-none ${isDark ? 'border-zinc-800' : 'border-slate-200'}`}>
            <div className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
              <BookOpen className="w-3 h-3" /> Knowledge Base Matrix:
            </div>
            {message.sources.map((source, sIdx) => (
              <div key={`src-${sIdx}`} className={`text-[10px] font-medium ${isDark ? 'text-emerald-400/80' : 'text-emerald-600'}`}>
                • {source.title} <span className={isDark ? 'text-zinc-600' : 'text-slate-400'}>(Relevance: {source.score})</span>
              </div>
            ))}
          </div>
        )}

        {/* Action Suggestion Micro-Buttons Block */}
        {message.suggestions && (
          <div className="mt-3 space-y-1.5 select-none">
            {message.suggestions.map((suggestion, sIdx) => (
              <button 
                key={`sug-${sIdx}`} 
                onClick={() => suggestion.action ? suggestion.action() : onSuggestionClick?.(suggestion.text)} 
                className={`block w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-150 border border-transparent ${
                  isDark ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                }`}
              >
                {suggestion.text}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

ChatMessageBubble.displayName = 'ChatMessageBubble';

/**
 * Master AI Market Analysis Copilot Drawer Subsystem Component
 */
export default function AIAssistant({ quotes, isOpen, onClose, currentTab, currentPage, selectedStock, portfolio, holdings }) {
  const { isDark } = useTheme();
  
  // Interaction & Text Tracking States
  const [conversationalHistory, setConversationalHistory] = useState([
    { 
      role: 'ai', 
      text: "Welcome to Bull's AI terminal assistant. I am linked to a contextual vector database covering NSE equity documents, local sector indices, and core portfolio analytics. Ask me about custom strategies or target asset performance metrics." 
    }
  ]);
  const [userInputField, setUserInputField] = useState('');
  const [isTypingStreamActive, setIsTypingStreamActive] = useState(false);
  const [isLocalFallbackActive, setIsLocalFallbackActive] = useState(false);
  
  const viewportScrollContainerRef = useRef(null);

  // Synchronizes container bounds scrolling parameters on dynamic text extensions
  useEffect(() => {
    if (viewportScrollContainerRef.current) {
      const scrollNode = viewportScrollContainerRef.current;
      scrollNode.scrollTop = scrollNode.scrollHeight;
    }
  }, [conversationalHistory, isTypingStreamActive]);

  // Context Building Parser Pipeline
  const compiledAssetContextMatrix = useMemo(() => {
    if (!selectedStock || !quotes) return null; 
    const targetQuoteNode = quotes.get(selectedStock); 
    if (!targetQuoteNode) return null;

    return {
      symbol: targetQuoteNode.symbol,
      name: targetQuoteNode.name,
      price: targetQuoteNode.price.toFixed(2),
      open: targetQuoteNode.open.toFixed(2),
      high: targetQuoteNode.high.toFixed(2),
      low: targetQuoteNode.low.toFixed(2),
      prevClose: targetQuoteNode.prevClose.toFixed(2),
      change: targetQuoteNode.changePercent.toFixed(2),
      volume: targetQuoteNode.volume.toLocaleString('en-IN'),
      vwap: targetQuoteNode.vwap.toFixed(2),
      sector: targetQuoteNode.sector
    };
  }, [selectedStock, quotes]);

  // Streaming Message Transmission Dispatcher Pipeline
  const processMessageTransmission = useCallback(async () => {
    const textSnapshot = userInputField.trim();
    if (!textSnapshot || isTypingStreamActive) return;

    // Stages user prompts safely inside historical indices lists
    setConversationalHistory((prev) => [...prev, { role: 'user', text: textSnapshot }]);
    setUserInputField('');
    setIsTypingStreamActive(true);
    setIsLocalFallbackActive(false);

    let compositeAccumulatedTextStr = '';

    try {
      if (!PLATFORM_GROQ_API_KEY) {
        throw new Error('Groq authorization signatures absent: Routing fallback pipelines.');
      }

      const streamServerlessResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${PLATFORM_GROQ_API_KEY}`, 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { 
              role: 'system', 
              content: `You are an AI financial market analyst for an Indian stock trading platform called Bull's AI. ${
                compiledAssetContextMatrix 
                  ? `Current stock focus: ${compiledAssetContextMatrix.symbol} (${compiledAssetContextMatrix.name}), Spot Rate: ₹${compiledAssetContextMatrix.price}, Delta: ${compiledAssetContextMatrix.change}%, Sector: ${compiledAssetContextMatrix.sector}` 
                  : 'No specific asset selected.'
              } When the user asks about buying or investing, analyze the past performance context, current live market structure, and potential future catalysts or risks. Provide a reasoned, conditional view rather than an absolute buy/sell recommendation. Always include a compliance disclaimer that this is not investment advice. Be highly concise, deploy Indian formatting notation conventions (₹), focus directly on NSE/BSE metrics. Never guarantee speculative profit parameters. Keep summaries under 150 words.` 
            },
            { role: 'user', content: textSnapshot },
          ],
          stream: true,
          max_tokens: 512,
          temperature: 0.5,
        }),
      });

      if (!streamServerlessResponse.ok) throw new Error(`API response status breach: ${streamServerlessResponse.status}`);

      const responseByteStreamReader = streamServerlessResponse.body.getReader();
      const stringDataDecoder = new TextDecoder();
      let residualBufferString = '';

      // Set up placeholder array block for incoming chunk decodes
      setConversationalHistory((prev) => [...prev, { role: 'ai', text: '', streaming: true }]);

      while (true) {
        const { done: isStreamComplete, value: networkChunkBytes } = await responseByteStreamReader.read();
        if (isStreamComplete) break;

        residualBufferString += stringDataDecoder.decode(networkChunkBytes, { stream: true });
        const textualLinesArray = residualBufferString.split('\n');
        residualBufferString = textualLinesArray.pop() || '';

        for (const dataLine of textualLinesArray) {
          const strippedLine = dataLine.trim();
          if (strippedLine.startsWith('data: ')) {
            const rawTokenData = strippedLine.slice(6);
            if (rawTokenData === '[DONE]') break;
            
            try {
              const parsedJSONPayload = JSON.parse(rawTokenData);
              const isolatedTokenString = parsedJSONPayload.choices?.[0]?.delta?.content;
              
              if (isolatedTokenString) {
                compositeAccumulatedTextStr += isolatedTokenString;
                setConversationalHistory((prevHistory) => {
                  const updatedHistoryBasket = [...prevHistory];
                  updatedHistoryBasket[updatedHistoryBasket.length - 1] = { 
                    role: 'ai', 
                    text: compositeAccumulatedTextStr, 
                    streaming: true 
                  };
                  return updatedHistoryBasket;
                });
              }
            } catch (err) {
            }
          }
        }
      }

      if (!compositeAccumulatedTextStr) throw new Error('Void message payload resolved from network gateways.');
      
      // Seals streaming tokens cleanly into standard state maps
      setConversationalHistory((prevHistory) => {
        const updatedHistoryBasket = [...prevHistory];
        updatedHistoryBasket[updatedHistoryBasket.length - 1] = { 
          role: 'ai', 
          text: compositeAccumulatedTextStr 
        };
        return updatedHistoryBasket;
      });

    } catch (pipelineExceptionError) {

      // LOCAL RAG INTERCEPT FALLBACK LAYER
      setIsLocalFallbackActive(true);
      const localizedRAGExtractionResult = generateRAGResponse(textSnapshot, quotes);
      
      setConversationalHistory((prevHistory) => {
        const updatedHistoryBasket = isTypingStreamActive && prevHistory[prevHistory.length - 1]?.role === 'ai'
          ? [...prevHistory] 
          : [...prevHistory, { role: 'ai', text: '' }];
          
        updatedHistoryBasket[updatedHistoryBasket.length - 1] = { 
          role: 'ai', 
          text: localizedRAGExtractionResult.text, 
          sources: localizedRAGExtractionResult.sources, 
          suggestions: localizedRAGExtractionResult.suggestions 
        };
        return updatedHistoryBasket;
      });
    } finally {
      setIsTypingStreamActive(false);
    }
  }, [userInputField, isTypingStreamActive, compiledAssetContextMatrix, quotes]);

  const handleSuggestionClick = useCallback((txt) => {
    setUserInputField(txt);
  }, []);

  if (!isOpen) return null;
  const drawerPanelBorderStyles = isDark ? 'bg-zinc-950 border-zinc-900' : 'bg-white border-slate-200';
  return (
    <>
      <div 
        className="fixed inset-0 z-[140] bg-black/20 animate-fade-in" 
        onClick={onClose} 
      />
      {/* Primary Analytical AI Console Popup Box Container */}
      <div className="fixed inset-0 z-[150] pointer-events-none">
        <div className={`absolute right-4 top-16 w-full max-w-[360px] max-h-[calc(100vh-5rem)] overflow-hidden flex flex-col shadow-2xl animate-fade-in transition-all duration-200 rounded-3xl pointer-events-auto ${drawerPanelBorderStyles}`}>
        {/* Drawer Window Title Header Section */}
        <div className={`flex items-center justify-between px-4 py-3 border-b select-none ${isDark ? 'border-zinc-900 bg-zinc-900/10' : 'border-slate-100 bg-slate-50/40'}`}>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 rounded-xl bg-emerald-500/20 blur-md animate-pulse" />
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-md shadow-emerald-500/20">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
            </div>
            <div>
              <h3 className={`text-xs font-black uppercase tracking-wider ${isDark ? 'text-zinc-100' : 'text-slate-900'}`}>
                Bull's AI Copilot
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[9px] font-bold text-emerald-400 flex items-center gap-1 uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Terminal Live
                </span>
                <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${
                  isDark ? 'bg-zinc-900 border border-zinc-800 text-zinc-400' : 'bg-slate-100 border border-slate-200 text-slate-600'
                }`}>
                  Groq Vector RAG
                </span>
              </div>
            </div>
          </div>
          
          <button 
            onClick={onClose} 
            className={`p-2 rounded-xl border border-transparent transition-all duration-150 ${isDark ? 'hover:bg-zinc-900 text-zinc-500 hover:text-zinc-300' : 'hover:bg-slate-100 text-slate-400 hover:text-slate-700'}`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Dynamic Chat Dialog Viewport Canvas Lane */}
        <div ref={viewportScrollContainerRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-3 scroll-smooth">
          {conversationalHistory.map((msg, index) => (
            <ChatMessageBubble
              key={`msg-node-${index}`}
              message={msg}
              isDark={isDark}
              onSuggestionClick={handleSuggestionClick}
            />
          ))}
          
          {/* Asynchronous Buffer Loading Dots View */}
          {isTypingStreamActive && conversationalHistory[conversationalHistory.length - 1]?.role === 'user' && (
            <div className="flex gap-3 select-none">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-sm">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className={`px-4 py-3 rounded-2xl border ${isDark ? 'bg-zinc-900/40 border-zinc-900' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex gap-1.5 py-1 items-center justify-center">
                  {[0, 1, 2].map((i) => (
                    <div 
                      key={`loading-dot-${i}`} 
                      className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" 
                      style={{ animationDelay: `${i * 0.15}s` }} 
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Fallback Warning Message Banner */}
        {isLocalFallbackActive && (
          <div className={`px-4 py-2 flex items-center gap-2 text-[11px] border-t border-b font-mono font-bold select-none ${
            isDark ? 'text-amber-400 bg-amber-500/5 border-zinc-900' : 'text-amber-700 bg-amber-50 border-amber-100'
          }`}>
            <AlertCircle className="w-3.5 h-3.5 shrink-0 animate-pulse" />
            <span>LLM latency fallback: RAG contextual indexing operational.</span>
          </div>
        )}

        {/* Prompt History Shortcuts Selector Panel */}
        {conversationalHistory.length <= 1 && (
          <div className="px-4 pb-2 space-y-1.5 select-none animate-fade-in">
            {['Tell me about RELIANCE portfolio weightings', 'How is the IT sector tracking today?', 'Explain VWAP calculation models', 'Show session momentum vectors'].map((promptShortcut) => (
              <button 
                key={promptShortcut} 
                onClick={() => setUserInputField(promptShortcut)} 
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold border border-transparent transition-all duration-150 ${
                  isDark 
                    ? 'bg-zinc-900/30 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100' 
                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                }`}
              >
                {promptShortcut}
              </button>
            ))}
          </div>
        )}

        {/* Terminal Input Dispatches Action Controls Bar Container */}
        <div className={`p-3 border-t select-none ${isDark ? 'border-zinc-900 bg-zinc-900/10' : 'border-slate-100 bg-slate-50/20'}`}>
          <div className={`flex items-center gap-2 rounded-xl border transition-all duration-150 ${
            isDark ? 'bg-zinc-900/50 border-zinc-800/80 focus-within:border-emerald-500/40' : 'bg-white border-slate-200 focus-within:border-emerald-400'
          }`}>
            <input 
              type="text" 
              value={userInputField} 
              onChange={(e) => setUserInputField(e.target.value)} 
              onKeyDown={(e) => { 
                if (e.key === 'Enter' && !e.shiftKey) { 
                  e.preventDefault(); 
                  processMessageTransmission(); 
                } 
              }} 
              placeholder="Ask about equities metrics, vector analytics models..." 
              className={`flex-1 bg-transparent px-3 py-2 text-xs font-semibold focus:outline-none ${
                isDark ? 'text-zinc-100 placeholder-zinc-700' : 'text-slate-900 placeholder-slate-400'
              }`} 
            />
            
            <button 
              onClick={processMessageTransmission} 
              disabled={!userInputField.trim() || isTypingStreamActive} 
              className="m-1.5 p-2 rounded-xl bg-emerald-500 text-white shadow-md shadow-emerald-950/20 hover:bg-emerald-600 transition-colors disabled:opacity-30 outline-none"
              title="Transmit Message String"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          
          <p className={`text-[9px] font-semibold tracking-wide uppercase mt-2 px-1 ${isDark ? 'text-zinc-600' : 'text-slate-400'}`}>
            * AI matrix metrics summaries are generated for quantitative modeling references.
          </p>
        </div>
      </div>
    </div>
    </>
  );
}