#!/usr/bin/env python3
"""
Docling PDF to Markdown conversion server for SanctumWriter.

Run with: python scripts/docling_server.py
Or with uvicorn: uvicorn scripts.docling_server:app --host 0.0.0.0 --port 3126

Requirements:
    pip install docling fastapi uvicorn python-multipart
"""

import os
import sys
import tempfile
import shutil
from pathlib import Path
from typing import Optional

try:
    from fastapi import FastAPI, UploadFile, File, HTTPException, Form
    from fastapi.middleware.cors import CORSMiddleware
    from fastapi.responses import JSONResponse
    import uvicorn
except ImportError:
    print("FastAPI not installed. Run: pip install fastapi uvicorn python-multipart")
    sys.exit(1)

try:
    from docling.document_converter import DocumentConverter
except ImportError:
    print("Docling not installed. Run: pip install docling")
    sys.exit(1)

app = FastAPI(
    title="Docling Conversion Server",
    description="Convert PDFs and documents to Markdown for SanctumWriter",
    version="1.0.0"
)

# Enable CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize converter (done once for performance)
converter = None

def get_converter():
    global converter
    if converter is None:
        print("Initializing Docling converter...")
        converter = DocumentConverter()
        print("Docling converter ready!")
    return converter


@app.get("/")
async def root():
    """Health check endpoint."""
    return {"status": "ok", "service": "docling", "message": "Docling conversion server is running"}


@app.get("/health")
async def health():
    """Health check for service discovery."""
    return {"status": "healthy", "docling": True}


@app.post("/convert")
async def convert_document(
    file: UploadFile = File(...),
    output_path: Optional[str] = Form(None),
    filename: Optional[str] = Form(None),
):
    """
    Convert an uploaded document (PDF, DOCX, etc.) to Markdown.
    
    Args:
        file: The document file to convert
        output_path: Optional path to save the markdown file
        filename: Optional custom filename for the output
    
    Returns:
        JSON with markdown content and metadata
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")
    
    # Get file extension
    ext = Path(file.filename).suffix.lower()
    supported_extensions = ['.pdf', '.docx', '.doc', '.pptx', '.ppt', '.xlsx', '.xls', '.html', '.htm']
    
    if ext not in supported_extensions:
        raise HTTPException(
            status_code=400, 
            detail=f"Unsupported file type: {ext}. Supported: {', '.join(supported_extensions)}"
        )
    
    # Create temp file
    temp_dir = tempfile.mkdtemp()
    temp_path = os.path.join(temp_dir, file.filename)
    
    try:
        # Save uploaded file
        with open(temp_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        # Convert with Docling
        conv = get_converter()
        result = conv.convert(temp_path)
        
        # Export to markdown
        markdown_content = result.document.export_to_markdown()
        
        # Get document metadata
        doc = result.document
        metadata = {
            "title": getattr(doc, 'title', None) or Path(file.filename).stem,
            "pages": getattr(doc, 'num_pages', None),
            "source_file": file.filename,
        }
        
        # Save to output path if specified
        saved_path = None
        if output_path:
            output_filename = filename or f"{Path(file.filename).stem}.md"
            full_output_path = os.path.join(output_path, output_filename)
            
            # Ensure directory exists
            os.makedirs(output_path, exist_ok=True)
            
            with open(full_output_path, 'w', encoding='utf-8') as f:
                f.write(markdown_content)
            
            saved_path = full_output_path
        
        return JSONResponse({
            "success": True,
            "markdown": markdown_content,
            "metadata": metadata,
            "saved_path": saved_path,
            "character_count": len(markdown_content),
            "word_count": len(markdown_content.split()),
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Conversion failed: {str(e)}")
    
    finally:
        # Cleanup temp files
        shutil.rmtree(temp_dir, ignore_errors=True)


@app.post("/convert-url")
async def convert_from_url(
    url: str = Form(...),
    output_path: Optional[str] = Form(None),
    filename: Optional[str] = Form(None),
):
    """
    Convert a document from URL to Markdown.
    
    Args:
        url: URL of the document to convert
        output_path: Optional path to save the markdown file
        filename: Optional custom filename for the output
    """
    try:
        conv = get_converter()
        result = conv.convert(url)
        
        markdown_content = result.document.export_to_markdown()
        
        doc = result.document
        metadata = {
            "title": getattr(doc, 'title', None) or "Document",
            "pages": getattr(doc, 'num_pages', None),
            "source_url": url,
        }
        
        saved_path = None
        if output_path:
            output_filename = filename or "converted.md"
            full_output_path = os.path.join(output_path, output_filename)
            os.makedirs(output_path, exist_ok=True)
            
            with open(full_output_path, 'w', encoding='utf-8') as f:
                f.write(markdown_content)
            
            saved_path = full_output_path
        
        return JSONResponse({
            "success": True,
            "markdown": markdown_content,
            "metadata": metadata,
            "saved_path": saved_path,
            "character_count": len(markdown_content),
            "word_count": len(markdown_content.split()),
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Conversion failed: {str(e)}")


if __name__ == "__main__":
    print("\n" + "="*60)
    print("  Docling Conversion Server for SanctumWriter")
    print("="*60)
    print("\nStarting server on http://localhost:3126")
    print("API docs available at http://localhost:3126/docs")
    print("\nSupported formats: PDF, DOCX, PPTX, XLSX, HTML")
    print("\nPress Ctrl+C to stop the server\n")
    
    uvicorn.run(app, host="0.0.0.0", port=3126)

