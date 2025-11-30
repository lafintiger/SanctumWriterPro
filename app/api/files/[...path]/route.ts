import { NextResponse } from 'next/server';
import { readFile, writeFile, unlink, rename } from 'fs/promises';
import { join, dirname, basename } from 'path';
import { existsSync } from 'fs';

const WORKSPACE_PATH = process.env.WORKSPACE_PATH || './documents';

function getFullPath(pathSegments: string[]): string {
  const relativePath = pathSegments.join('/');
  return join(process.cwd(), WORKSPACE_PATH, relativePath);
}

export async function GET(
  request: Request,
  { params }: { params: { path: string[] } }
) {
  try {
    const filePath = getFullPath(params.path);
    
    if (!existsSync(filePath)) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    const content = await readFile(filePath, 'utf-8');
    const path = params.path.join('/');
    
    return NextResponse.json({
      content,
      path,
      name: basename(filePath),
    });
  } catch (error) {
    console.error('Error reading file:', error);
    return NextResponse.json(
      { error: 'Failed to read file' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { path: string[] } }
) {
  try {
    const { content } = await request.json();
    const filePath = getFullPath(params.path);
    
    // Ensure the directory exists
    const { mkdir } = await import('fs/promises');
    await mkdir(dirname(filePath), { recursive: true });
    
    await writeFile(filePath, content, 'utf-8');
    
    return NextResponse.json({
      success: true,
      path: params.path.join('/'),
    });
  } catch (error) {
    console.error('Error saving file:', error);
    return NextResponse.json(
      { error: 'Failed to save file' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { path: string[] } }
) {
  try {
    const filePath = getFullPath(params.path);
    
    if (!existsSync(filePath)) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    await unlink(filePath);
    
    return NextResponse.json({
      success: true,
      path: params.path.join('/'),
    });
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { path: string[] } }
) {
  try {
    const { newName } = await request.json();
    const oldPath = getFullPath(params.path);
    
    if (!existsSync(oldPath)) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    const newPath = join(dirname(oldPath), newName);
    
    if (existsSync(newPath)) {
      return NextResponse.json(
        { error: 'A file with that name already exists' },
        { status: 409 }
      );
    }

    await rename(oldPath, newPath);
    
    const pathParts = [...params.path];
    pathParts[pathParts.length - 1] = newName;
    
    return NextResponse.json({
      success: true,
      oldPath: params.path.join('/'),
      newPath: pathParts.join('/'),
    });
  } catch (error) {
    console.error('Error renaming file:', error);
    return NextResponse.json(
      { error: 'Failed to rename file' },
      { status: 500 }
    );
  }
}

