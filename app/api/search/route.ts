/**
 * Search API Proxy - Bypasses CORS for Perplexica and SearXNG
 */

import { NextRequest, NextResponse } from 'next/server';

const PERPLEXICA_URL = process.env.PERPLEXICA_URL || 'http://localhost:3000';
const SEARXNG_URL = process.env.SEARXNG_URL || 'http://localhost:4000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { engine, query, focusMode, optimizationMode } = body;
    
    if (engine === 'perplexica') {
      return await searchPerplexica(query, focusMode, optimizationMode);
    } else if (engine === 'searxng') {
      return await searchSearXNG(query, body.categories);
    }
    
    return NextResponse.json({ error: 'Invalid engine' }, { status: 400 });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Search failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  
  if (action === 'status') {
    return await checkStatus();
  }
  
  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}

async function checkStatus() {
  const status = { perplexica: false, searxng: false };
  
  // Check Perplexica
  try {
    const response = await fetch(`${PERPLEXICA_URL}/`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });
    status.perplexica = response.ok || response.status === 200;
  } catch (error) {
    console.log('Perplexica not available:', error);
  }
  
  // Check SearXNG
  try {
    const response = await fetch(`${SEARXNG_URL}/`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });
    status.searxng = response.ok || response.status === 200;
  } catch (error) {
    console.log('SearXNG not available:', error);
  }
  
  console.log('Search engine status:', status);
  return NextResponse.json(status);
}

async function searchPerplexica(
  query: string,
  focusMode?: string,
  optimizationMode?: string
) {
  // Try the Perplexica API
  const endpoints = [
    '/api/search',
    '/api/chat',
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${PERPLEXICA_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          chatModel: {
            provider: 'ollama',
            model: 'qwen3:latest',
          },
          embeddingModel: {
            provider: 'ollama', 
            model: 'nomic-embed-text',
          },
          focusMode: focusMode || 'webSearch',
          optimizationMode: optimizationMode || 'balanced',
          // Alternative format
          message: query,
          focus: focusMode || 'webSearch',
        }),
        signal: AbortSignal.timeout(60000),
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Perplexica response:', data);
        
        // Parse response
        const sources = data.sources || data.results || data.context || [];
        const results = sources.map((s: any) => ({
          title: s.title || s.name || s.metadata?.title || 'Untitled',
          url: s.url || s.link || s.metadata?.url || '',
          snippet: s.snippet || s.content || s.description || s.pageContent || '',
          source: 'perplexica',
          relevanceScore: s.score,
        }));
        
        return NextResponse.json({
          query,
          results,
          totalResults: results.length,
          searchEngine: 'perplexica',
          aiSummary: data.answer || data.response || data.message || data.content,
        });
      }
      
      console.log(`Perplexica ${endpoint} returned ${response.status}`);
    } catch (error) {
      console.error(`Perplexica ${endpoint} error:`, error);
    }
  }
  
  return NextResponse.json({
    query,
    results: [],
    totalResults: 0,
    searchEngine: 'perplexica',
    error: 'Perplexica search failed',
  });
}

async function searchSearXNG(query: string, categories?: string[]) {
  try {
    const params = new URLSearchParams({
      q: query,
      format: 'json',
      language: 'en',
    });
    
    if (categories?.length) {
      params.set('categories', categories.join(','));
    }
    
    const response = await fetch(`${SEARXNG_URL}/search?${params}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(15000),
    });
    
    if (!response.ok) {
      throw new Error(`SearXNG error: ${response.status}`);
    }
    
    const data = await response.json();
    
    const results = (data.results || []).map((r: any) => ({
      title: r.title || 'Untitled',
      url: r.url || '',
      snippet: r.content || r.description || '',
      source: r.engine || 'searxng',
      publishedDate: r.publishedDate,
      relevanceScore: r.score,
    }));
    
    return NextResponse.json({
      query,
      results,
      totalResults: data.number_of_results || results.length,
      searchEngine: 'searxng',
    });
  } catch (error) {
    console.error('SearXNG search error:', error);
    return NextResponse.json({
      query,
      results: [],
      totalResults: 0,
      searchEngine: 'searxng',
      error: error instanceof Error ? error.message : 'Search failed',
    });
  }
}

