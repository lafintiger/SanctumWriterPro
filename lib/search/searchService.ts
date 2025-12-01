/**
 * Search Service - Integration with local search engines
 * 
 * Supports:
 * - Perplexica (localhost:3000) - AI-powered search like Perplexity
 * - SearXNG (localhost:4000) - Privacy-focused meta-search
 */

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  source: string;
  publishedDate?: string;
  relevanceScore?: number;
}

export interface SearchResponse {
  query: string;
  results: SearchResult[];
  totalResults: number;
  searchEngine: 'perplexica' | 'searxng';
  aiSummary?: string; // Perplexica can provide AI summaries
  error?: string;
}

export type SearchEngine = 'perplexica' | 'searxng' | 'both';

const PERPLEXICA_URL = 'http://localhost:3000';
const SEARXNG_URL = 'http://localhost:4000';

/**
 * Check if a search engine is available
 */
export async function checkSearchEngineStatus(): Promise<{
  perplexica: boolean;
  searxng: boolean;
}> {
  const status = { perplexica: false, searxng: false };
  
  try {
    const perplexicaCheck = await fetch(`${PERPLEXICA_URL}/api/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(2000),
    });
    status.perplexica = perplexicaCheck.ok;
  } catch {
    status.perplexica = false;
  }
  
  try {
    // SearXNG health check - just try to reach the main page
    const searxngCheck = await fetch(`${SEARXNG_URL}/healthz`, {
      method: 'GET',
      signal: AbortSignal.timeout(2000),
    });
    status.searxng = searxngCheck.ok;
  } catch {
    // Try alternate health check
    try {
      const searxngAlt = await fetch(`${SEARXNG_URL}/`, {
        method: 'HEAD',
        signal: AbortSignal.timeout(2000),
      });
      status.searxng = searxngAlt.ok;
    } catch {
      status.searxng = false;
    }
  }
  
  return status;
}

/**
 * Search using SearXNG
 */
export async function searchSearXNG(
  query: string,
  options?: {
    categories?: string[];
    engines?: string[];
    language?: string;
    pageNo?: number;
  }
): Promise<SearchResponse> {
  try {
    const params = new URLSearchParams({
      q: query,
      format: 'json',
      language: options?.language || 'en',
      pageno: String(options?.pageNo || 1),
    });
    
    if (options?.categories?.length) {
      params.set('categories', options.categories.join(','));
    }
    
    if (options?.engines?.length) {
      params.set('engines', options.engines.join(','));
    }
    
    const response = await fetch(`${SEARXNG_URL}/search?${params}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(15000),
    });
    
    if (!response.ok) {
      throw new Error(`SearXNG error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    const results: SearchResult[] = (data.results || []).map((r: any) => ({
      title: r.title || 'Untitled',
      url: r.url || '',
      snippet: r.content || r.description || '',
      source: r.engine || 'searxng',
      publishedDate: r.publishedDate,
      relevanceScore: r.score,
    }));
    
    return {
      query,
      results,
      totalResults: data.number_of_results || results.length,
      searchEngine: 'searxng',
    };
  } catch (error) {
    console.error('SearXNG search error:', error);
    return {
      query,
      results: [],
      totalResults: 0,
      searchEngine: 'searxng',
      error: error instanceof Error ? error.message : 'Search failed',
    };
  }
}

/**
 * Search using Perplexica
 * Perplexica provides AI-enhanced search with summaries
 */
export async function searchPerplexica(
  query: string,
  options?: {
    focusMode?: 'webSearch' | 'academicSearch' | 'writingAssistant' | 'wolframAlphaSearch' | 'youtubeSearch' | 'redditSearch';
    optimizationMode?: 'speed' | 'balanced' | 'quality';
  }
): Promise<SearchResponse> {
  try {
    // Perplexica uses a chat-based API
    const response = await fetch(`${PERPLEXICA_URL}/api/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        focusMode: options?.focusMode || 'webSearch',
        optimizationMode: options?.optimizationMode || 'balanced',
      }),
      signal: AbortSignal.timeout(30000), // Perplexica can take longer due to AI processing
    });
    
    if (!response.ok) {
      throw new Error(`Perplexica error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Parse Perplexica response format
    const results: SearchResult[] = (data.sources || []).map((s: any) => ({
      title: s.title || s.name || 'Untitled',
      url: s.url || s.link || '',
      snippet: s.snippet || s.description || '',
      source: 'perplexica',
      relevanceScore: s.score,
    }));
    
    return {
      query,
      results,
      totalResults: results.length,
      searchEngine: 'perplexica',
      aiSummary: data.answer || data.response || data.message,
    };
  } catch (error) {
    console.error('Perplexica search error:', error);
    return {
      query,
      results: [],
      totalResults: 0,
      searchEngine: 'perplexica',
      error: error instanceof Error ? error.message : 'Search failed',
    };
  }
}

/**
 * Search using both engines and merge results
 */
export async function searchBoth(
  query: string
): Promise<{
  perplexica: SearchResponse;
  searxng: SearchResponse;
  merged: SearchResult[];
}> {
  const [perplexica, searxng] = await Promise.all([
    searchPerplexica(query),
    searchSearXNG(query),
  ]);
  
  // Merge and deduplicate results
  const urlSet = new Set<string>();
  const merged: SearchResult[] = [];
  
  // Prioritize Perplexica results (AI-curated)
  for (const result of perplexica.results) {
    if (!urlSet.has(result.url)) {
      urlSet.add(result.url);
      merged.push(result);
    }
  }
  
  // Add SearXNG results that aren't duplicates
  for (const result of searxng.results) {
    if (!urlSet.has(result.url)) {
      urlSet.add(result.url);
      merged.push(result);
    }
  }
  
  return { perplexica, searxng, merged };
}

/**
 * Main search function - uses the preferred engine
 */
export async function search(
  query: string,
  engine: SearchEngine = 'perplexica',
  options?: {
    focusMode?: 'webSearch' | 'academicSearch' | 'writingAssistant';
    categories?: string[];
  }
): Promise<SearchResponse> {
  if (engine === 'both') {
    const { perplexica, searxng, merged } = await searchBoth(query);
    return {
      query,
      results: merged,
      totalResults: merged.length,
      searchEngine: 'perplexica', // Primary
      aiSummary: perplexica.aiSummary,
      error: perplexica.error || searxng.error,
    };
  }
  
  if (engine === 'perplexica') {
    return searchPerplexica(query, options);
  }
  
  return searchSearXNG(query, { categories: options?.categories });
}

/**
 * Format search results as markdown for insertion into documents
 */
export function formatResultsAsMarkdown(
  response: SearchResponse,
  options?: {
    includeAiSummary?: boolean;
    maxResults?: number;
    includeUrls?: boolean;
  }
): string {
  const lines: string[] = [];
  const maxResults = options?.maxResults || 5;
  
  // Add AI summary if available
  if (options?.includeAiSummary && response.aiSummary) {
    lines.push('## Summary\n');
    lines.push(response.aiSummary);
    lines.push('\n');
  }
  
  // Add sources
  if (response.results.length > 0) {
    lines.push('## Sources\n');
    
    response.results.slice(0, maxResults).forEach((result, index) => {
      lines.push(`${index + 1}. **${result.title}**`);
      if (result.snippet) {
        lines.push(`   ${result.snippet.slice(0, 200)}${result.snippet.length > 200 ? '...' : ''}`);
      }
      if (options?.includeUrls) {
        lines.push(`   [Link](${result.url})`);
      }
      lines.push('');
    });
  }
  
  return lines.join('\n');
}

/**
 * Generate a citation from a search result
 */
export function generateCitation(
  result: SearchResult,
  format: 'apa' | 'mla' | 'chicago' | 'simple' = 'simple'
): string {
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  
  // Extract domain from URL
  let domain = '';
  try {
    domain = new URL(result.url).hostname.replace('www.', '');
  } catch {
    domain = result.source;
  }
  
  switch (format) {
    case 'apa':
      return `${result.title}. (${result.publishedDate || 'n.d.'}). ${domain}. Retrieved ${today}, from ${result.url}`;
    
    case 'mla':
      return `"${result.title}." ${domain}, ${result.publishedDate || 'n.d.'}, ${result.url}. Accessed ${today}.`;
    
    case 'chicago':
      return `"${result.title}." ${domain}. ${result.publishedDate || 'n.d.'}. ${result.url}.`;
    
    case 'simple':
    default:
      return `[${result.title}](${result.url})`;
  }
}

