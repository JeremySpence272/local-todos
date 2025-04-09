// Common type definitions for the todo app

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
