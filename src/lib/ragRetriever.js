/**
 * @fileoverview Proprietary Retrieval-Augmented Generation (RAG) Index Engine
 */

import { KNOWLEDGE_BASE } from './knowledgeBase.js';

const STOP_WORDS = new Set([
  'a','an','the','and','or','but','in','on','at','to','for','of','with','by','from',
  'is','are','was','were','be','been','being','have','has','had','do','does','did',
  'will','would','could','should','may','might','must','can','this','that','these',
  'those','i','you','he','she','it','we','they','what','which','who','when','where',
  'why','how','all','each','every','some','any','few','more','most','other','into',
  'through','during','before','after','above','below','up','down','out','off','over',
  'under','again','further','then','once','here','there','me','my','your','about',
  'tell','give','show','like','want','know','think','also','just','very','too','really'
]);
/**
 * Tokenizes and normalizes raw natural text streams.
 * @param {string} text - Raw input string
 * @returns {string[]} Normalized token array
 */
function tokenize(text) {
  if (!text || typeof text !== 'string') return [];
  
  return text
    .toLowerCase()
    .replace(/[^a-z0-9&\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token));
}

/**
 * Compiles a distinct vocabulary token allocation map from structural documents.
 * @param {Array<object>} preTokenizedDocs - Cache-mapped data array
 * @returns {Map<string, number>} Token-to-Index vocabulary mapping
 */
function buildVocabulary(preTokenizedDocs) {
  const vocab = new Map();
  let lexicalIndex = 0;

  for (const item of preTokenizedDocs) {
    for (const token of item.tokens) {
      if (!vocab.has(token)) {
        vocab.set(token, lexicalIndex++);
      }
    }
  }
  return vocab;
}

/**
 * Computes Inverse Document Frequency (IDF) weights using standard logarithmic smoothing.
 * Formula: $\text{IDF}(t) = \ln\left(\frac{N + 1}{\text{DF}(t) + 1}\right) + 1$
 * @param {Array<object>} preTokenizedDocs - Active tracking corpus nodes
 * @param {Map<string, number>} vocab - Systems global vocabulary target
 * @returns {Map<string, number>} Term-to-IDF weights map
 */
function computeIDF(preTokenizedDocs, vocab) {
  const idfMapping = new Map();
  const N = preTokenizedDocs.length;

  for (const term of vocab.keys()) {
    let documentFrequency = 0;
    
    for (const item of preTokenizedDocs) {
      if (item.tokenSet.has(term)) {
        documentFrequency++;
      }
    }

    const idfValue = Math.log((N + 1) / (documentFrequency + 1)) + 1;
    idfMapping.set(term, idfValue);
  }
  return idfMapping;
}

/**
 * Vectorizes a string input into the computed TF-IDF vector space.
 * @param {string} text - Target text segment
 * @param {Map<string, number>} vocab - Universal vocabulary reference
 * @param {Map<string, number>} idfTable - Document inverse weight index
 * @returns {Map<string, number>} Sparse mathematical vector allocation map
 */
function vectorize(text, vocab, idfTable) {
  const tokens = tokenize(text);
  const termFrequency = new Map();

  for (const token of tokens) {
    if (vocab.has(token)) {
      termFrequency.set(token, (termFrequency.get(token) || 0) + 1);
    }
  }

  const tfIdfVector = new Map();
  const totalTokens = tokens.length || 1;

  for (const [term, count] of termFrequency) {
    const idfWeight = idfTable.get(term) || 1.0;
    // Normalized Term Frequency calculation multiplied by the smoothed inverse density weight
    tfIdfVector.set(term, (count / totalTokens) * idfWeight);
  }
  
  return tfIdfVector;
}

/**
 * Computes the cosine similarity value between two sparse vector spaces.
 * Formula: $\text{Similarity} = \frac{A \cdot B}{\|A\| \|B\|}$
 */
function calculateCosineSimilarity(vectorA, vectorB) {
  if (vectorA.size === 0 || vectorB.size === 0) return 0;

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  // Optimizes evaluation execution runtime loops by iterating over the smaller sparse vector space
  const [smallerVector, largerVector] = vectorA.size < vectorB.size 
    ? [vectorA, vectorB] 
    : [vectorB, vectorA];

  for (const [term, weightA] of smallerVector) {
    const weightB = largerVector.get(term);
    if (weightB !== undefined) {
      dotProduct += weightA * weightB;
    }
  }

  for (const weight of vectorA.values()) magnitudeA += weight * weight;
  for (const weight of vectorB.values()) magnitudeB += weight * weight;

  if (magnitudeA === 0 || magnitudeB === 0) return 0;
  return dotProduct / (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB));
}

const PRE_TOKENIZED_CORPUS = KNOWLEDGE_BASE.map((doc) => {
  const rawContent = `${doc.title} ${doc.content}`;
  const tokens = tokenize(rawContent);
  return {
    doc,
    tokens,
    tokenSet: new Set(tokens)
  };
});

const VOCABULARY = buildVocabulary(PRE_TOKENIZED_CORPUS);
const IDF_TABLE = computeIDF(PRE_TOKENIZED_CORPUS, VOCABULARY);

const CORPUS_VECTOR_SPACE = PRE_TOKENIZED_CORPUS.map((item) => ({
  doc: item.doc,
  vector: vectorize(`${item.doc.title} ${item.doc.content}`, VOCABULARY, IDF_TABLE),
}));

/**
 * Retrieves the Top-K relevant knowledge chunks matching a semantic user query.
 * @param {string} query - Natural language search input
 * @param {number} topK - Maximum capacity cut-off limit
 * @returns {Array<object>} Sorted analytical validation results payload
 */
export function retrieve(query, topK = 3) {
  const queryVector = vectorize(query, VOCABULARY, IDF_TABLE);
  
  const scoredMatches = CORPUS_VECTOR_SPACE.map(({ doc, vector }) => ({
    doc,
    score: calculateCosineSimilarity(queryVector, vector),
  }));

  return scoredMatches
    .filter((match) => match.score > 0.01)
    .sort((alpha, beta) => beta.score - alpha.score)
    .slice(0, topK);
}

/**
 * Scans a query text string to intercept structural equity indicators.
 * @param {string} query - Target input prompt
 * @returns {string|null} Parsed token symbol identifier target
 */
export function detectStockSymbol(query) {
  if (!query) return null;
  const upperCaseQuery = query.toUpperCase();
  
  for (const doc of KNOWLEDGE_BASE) {
    if (doc.type === 'stock' && doc.symbol && upperCaseQuery.includes(doc.symbol.toUpperCase())) {
      return doc.symbol;
    }
  }
  return null;
}

/**
 * Maps input string patterns to absolute institutional sector classifications.
 * @param {string} query - Target query string
 * @returns {string|null} Standardized capital name mapping classification target
 */
export function detectSector(query) {
  if (!query) return null;
  const lowerCaseQuery = query.toLowerCase();
  
  const SECTOR_DICTIONARY = {
    'it': 'IT',
    'information technology': 'IT',
    'banking': 'Banking',
    'energy': 'Energy',
    'fmcg': 'FMCG',
    'pharma': 'Pharma',
    'pharmaceutical': 'Pharma',
    'automobile': 'Automobile',
    'auto': 'Automobile',
    'telecom': 'Telecom',
    'power': 'Telecom',
    'metals': 'Materials',
    'cement': 'Materials',
    'construction': 'Construction'
  };

  for (const [key, normalizedValue] of Object.entries(SECTOR_DICTIONARY)) {
    if (lowerCaseQuery.includes(key)) {
      return normalizedValue;
    }
  }
  return null;
}
export { KNOWLEDGE_BASE };