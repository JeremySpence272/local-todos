// Client-side API for interacting with the server
// This file is safe to import in client components

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  notes: string;
  projectId: string;
  createdAt: string;
  underTenMinutes?: boolean;
}

export interface Project {
  id: string;
  name: string;
  createdAt: string;
}

// Helper function for API requests
async function apiRequest<T>(
  url: string, 
  method: string = 'GET', 
  data?: any
): Promise<T> {
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(url, options);
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  
  return await response.json();
}

// Data fetching functions
export async function fetchTodos(): Promise<Todo[]> {
  const data = await apiRequest<{todos: Todo[]}>('/api/data');
  return data.todos;
}

export async function fetchProjects(): Promise<Project[]> {
  const data = await apiRequest<{projects: Project[]}>('/api/data');
  return data.projects;
}

// Additional API endpoints can be added here as needed
// For example:
// export async function addTodo(text: string, projectId: string): Promise<Todo> {
//   return apiRequest<Todo>('/api/todos', 'POST', { text, projectId });
// }

// Save functions
export async function saveTodos(todos: Todo[]): Promise<void> {
  await apiRequest<{success: boolean}>('/api/data', 'POST', {
    operation: 'save_todos',
    data: todos
  });
}

export async function saveProjects(projects: Project[]): Promise<void> {
  await apiRequest<{success: boolean}>('/api/data', 'POST', {
    operation: 'save_projects',
    data: projects
  });
}

// Additional Todo operations
export async function addTodo(text: string, projectId: string, underTenMinutes: boolean = false): Promise<void> {
  const todos = await fetchTodos();
  const newTodo: Todo = {
    id: Date.now().toString(36) + Math.random().toString(36).substring(2, 9),
    text,
    completed: false,
    notes: '',
    projectId,
    createdAt: new Date().toISOString(),
    underTenMinutes
  };
  
  todos.push(newTodo);
  await saveTodos(todos);
}

export async function updateTodo(updatedTodo: Todo): Promise<void> {
  const todos = await fetchTodos();
  const index = todos.findIndex(todo => todo.id === updatedTodo.id);
  if (index !== -1) {
    todos[index] = updatedTodo;
    await saveTodos(todos);
  }
}

// Additional Project operations
export async function addProject(name: string): Promise<void> {
  const projects = await fetchProjects();
  const newProject: Project = {
    id: Date.now().toString(36) + Math.random().toString(36).substring(2, 9),
    name,
    createdAt: new Date().toISOString(),
  };
  
  projects.push(newProject);
  await saveProjects(projects);
} 