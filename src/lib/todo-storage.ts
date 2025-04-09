// This is a server-only module
import fs from 'fs';
import path from 'path';

// Add server-only directive to prevent usage in client components
// @ts-ignore - Next.js server-only might not be in your tsconfig
import 'server-only';

// Client-side storage implementation
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

const dataDir = path.join(process.cwd(), 'data');
const todosPath = path.join(dataDir, 'todos.json');
const projectsPath = path.join(dataDir, 'projects.json');

// Ensure data directory exists
const ensureDataDir = () => {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

// Ensure files exist with default empty arrays
const ensureFilesExist = () => {
  ensureDataDir();
  
  if (!fs.existsSync(todosPath)) {
    fs.writeFileSync(todosPath, JSON.stringify([], null, 2));
  }
  
  if (!fs.existsSync(projectsPath)) {
    fs.writeFileSync(projectsPath, JSON.stringify([], null, 2));
  }
};

const readJson = <T>(filePath: string): T => {
  ensureFilesExist();
  const data = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(data);
};

const writeJson = <T>(filePath: string, data: T): void => {
  ensureDataDir();
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

// Initialize files on module load
ensureFilesExist();

// Main storage functions
export const loadTodos = (): Todo[] => readJson<Todo[]>(todosPath);
export const saveTodos = (todos: Todo[]): void => writeJson(todosPath, todos);

export const loadProjects = (): Project[] => readJson<Project[]>(projectsPath);
export const saveProjects = (projects: Project[]): void => writeJson(projectsPath, projects);

// Generate a unique ID
export const generateId = (): string => Date.now().toString(36) + Math.random().toString(36).substring(2, 9);

// Todo operations
export const addTodo = (text: string, projectId: string, underTenMinutes: boolean = false): Todo => {
  const todos = loadTodos();
  const newTodo: Todo = {
    id: generateId(),
    text,
    completed: false,
    notes: '',
    projectId,
    createdAt: new Date().toISOString(),
    underTenMinutes
  };
  todos.push(newTodo);
  saveTodos(todos);
  return newTodo;
};

export const updateTodo = (updatedTodo: Todo): Todo => {
  const todos = loadTodos();
  const index = todos.findIndex(todo => todo.id === updatedTodo.id);
  if (index !== -1) {
    todos[index] = updatedTodo;
    saveTodos(todos);
  }
  return updatedTodo;
};

export const deleteTodo = (id: string): void => {
  const todos = loadTodos();
  const updated = todos.filter(todo => todo.id !== id);
  saveTodos(updated);
};

export const toggleTodoCompletion = (id: string): Todo | undefined => {
  const todos = loadTodos();
  const index = todos.findIndex(todo => todo.id === id);
  if (index !== -1) {
    todos[index].completed = !todos[index].completed;
    saveTodos(todos);
    return todos[index];
  }
  return undefined;
};

// Project operations
export const addProject = (name: string): Project => {
  const projects = loadProjects();
  const newProject: Project = {
    id: generateId(),
    name,
    createdAt: new Date().toISOString(),
  };
  projects.push(newProject);
  saveProjects(projects);
  return newProject;
};

export const updateProject = (updatedProject: Project): Project => {
  const projects = loadProjects();
  const index = projects.findIndex(project => project.id === updatedProject.id);
  if (index !== -1) {
    projects[index] = updatedProject;
    saveProjects(projects);
  }
  return updatedProject;
};

export const deleteProject = (id: string): void => {
  const projects = loadProjects();
  const updatedProjects = projects.filter(project => project.id !== id);
  saveProjects(updatedProjects);

  const todos = loadTodos();
  const updatedTodos = todos.filter(todo => todo.projectId !== id);
  saveTodos(updatedTodos);
};
