import { NextResponse } from 'next/server';

const DEFAULT_DOCLING_URL = 'http://localhost:3126';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const doclingUrl = formData.get('doclingUrl') as string || DEFAULT_DOCLING_URL;
    const outputPath = formData.get('outputPath') as string | null;
    const filename = formData.get('filename') as string | null;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }
    
    // Forward to Docling server
    const doclingFormData = new FormData();
    doclingFormData.append('file', file);
    
    if (outputPath) {
      doclingFormData.append('output_path', outputPath);
    }
    if (filename) {
      doclingFormData.append('filename', filename);
    }
    
    const response = await fetch(`${doclingUrl}/convert`, {
      method: 'POST',
      body: doclingFormData,
    });
    
    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.detail || 'Conversion failed' },
        { status: response.status }
      );
    }
    
    const result = await response.json();
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Conversion error:', error);
    
    // Check if it's a connection error
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return NextResponse.json(
        { 
          error: 'Could not connect to Docling server. Make sure it\'s running on port 3126.',
          hint: 'Run: python scripts/docling_server.py'
        },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: 'Conversion failed' },
      { status: 500 }
    );
  }
}

// Health check for Docling service
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const doclingUrl = searchParams.get('doclingUrl') || DEFAULT_DOCLING_URL;
  
  try {
    const response = await fetch(`${doclingUrl}/health`, {
      method: 'GET',
    });
    
    if (response.ok) {
      return NextResponse.json({ available: true, url: doclingUrl });
    }
    
    return NextResponse.json({ available: false, url: doclingUrl });
  } catch {
    return NextResponse.json({ available: false, url: doclingUrl });
  }
}

