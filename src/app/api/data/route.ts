import { NextRequest, NextResponse } from 'next/server';
import { loadTodos, loadProjects, saveTodos, saveProjects } from '@/lib/todo-storage';

// Make this route compatible with static export
export const dynamic = 'force-static';

export async function GET() {
  try {
    const todos = loadTodos();
    const projects = loadProjects();

    return NextResponse.json({ 
      todos, 
      projects 
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json(
      { error: 'Failed to load data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Check what operation is being requested
    if (body.operation === 'save_todos' && Array.isArray(body.data)) {
      saveTodos(body.data);
      return NextResponse.json({ success: true });
    } 
    else if (body.operation === 'save_projects' && Array.isArray(body.data)) {
      saveProjects(body.data);
      return NextResponse.json({ success: true });
    }
    else {
      return NextResponse.json(
        { error: 'Invalid operation or data' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error saving data:', error);
    return NextResponse.json(
      { error: 'Failed to save data' },
      { status: 500 }
    );
  }
} 