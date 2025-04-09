"use client";

import { useState } from "react";
import { Todo, Project } from "@/types";
import { TodoItem } from "./TodoItem";
import { TodoFilters } from "./TodoFilters";
import { CreateTodoDialog } from "./TodoDialogs/CreateTodoDialog";
import { EditTodoDialog } from "./TodoDialogs/EditTodoDialog";
import { ViewTodoDialog } from "./TodoDialogs/ViewTodoDialog";
import { ChevronDownIcon, ChevronRightIcon } from "@radix-ui/react-icons";

interface TodoListProps {
  todos: Todo[];
  projects: Project[];
  selectedProjectId: string | null;
}

export function TodoList({ todos, projects, selectedProjectId }: TodoListProps) {
  const [hideCompleted, setHideCompleted] = useState(false);
  const [showOnlyUnderTen, setShowOnlyUnderTen] = useState(false);
  const [collapsedProjects, setCollapsedProjects] = useState<Record<string, boolean>>({});
  
  // Dialog states
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  
  // Filter logic
  const filteredTodos = selectedProjectId
    ? todos.filter((todo) => todo.projectId === selectedProjectId)
    : todos;
    
  const displayedTodos = filteredTodos
    .filter((todo) => (hideCompleted ? !todo.completed : true))
    .filter((todo) => (showOnlyUnderTen ? todo.underTenMinutes : true));

  const handleEditTodo = (todo: Todo) => {
    setSelectedTodo(todo);
    setShowEditDialog(true);
  };

  const handleViewTodo = (todo: Todo) => {
    setSelectedTodo(todo);
    setShowViewDialog(true);
  };

  const toggleProjectCollapse = (projectId: string) => {
    setCollapsedProjects(prev => ({
      ...prev,
      [projectId]: !prev[projectId]
    }));
  };

  // Group todos by project for "All Tasks" view
  const getProjectTodos = (projectId: string) => {
    return todos
      .filter(todo => todo.projectId === projectId)
      .filter(todo => hideCompleted ? !todo.completed : true)
      .filter(todo => showOnlyUnderTen ? todo.underTenMinutes : true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#eeeeee]">
          {selectedProjectId 
            ? projects.find(p => p.id === selectedProjectId)?.name || "Tasks"
            : "All Tasks"}
        </h1>
        <CreateTodoDialog selectedProjectId={selectedProjectId} />
      </div>
      
      <TodoFilters 
        hideCompleted={hideCompleted}
        setHideCompleted={setHideCompleted}
        showOnlyUnderTen={showOnlyUnderTen}
        setShowOnlyUnderTen={setShowOnlyUnderTen}
      />
      
      {selectedProjectId ? (
        // Show todos for selected project
        <div className="space-y-2 mt-4">
          {displayedTodos.length === 0 ? (
            <div className="text-center py-12 border border-[#333333] border-opacity-70 rounded-md">
              <div className="flex flex-col items-center justify-center">
                <p className="text-[#a0a0a0] mb-2">No tasks yet</p>
                <p className="text-sm text-[#777777]">
                  Create a new task to get started
                </p>
              </div>
            </div>
          ) : (
            displayedTodos.map((todo) => (
              <TodoItem 
                key={todo.id} 
                todo={todo} 
                onEdit={handleEditTodo}
                onView={handleViewTodo}
              />
            ))
          )}
        </div>
      ) : (
        // Show all todos grouped by project
        <div className="space-y-6">
          {projects.length === 0 ? (
            <div className="text-center py-12 border border-[#333333] rounded-md">
              <div className="flex flex-col items-center justify-center">
                <p className="text-[#a0a0a0] mb-2">No projects yet</p>
                <p className="text-sm text-[#777777]">
                  Create a new project to get started
                </p>
              </div>
            </div>
          ) : (
            projects.map((project) => {
              const projectTodos = getProjectTodos(project.id);
              
              if (projectTodos.length === 0) return null;
              
              const isCollapsed = collapsedProjects[project.id] || false;
              
              return (
                <div key={project.id} className="mb-8">
                  <div
                    className="flex items-center mb-2 cursor-pointer"
                    onClick={() => toggleProjectCollapse(project.id)}
                  >
                    <div className="mr-2 text-[#a0a0a0]">
                      {isCollapsed ? (
                        <ChevronRightIcon className="h-4 w-4" />
                      ) : (
                        <ChevronDownIcon className="h-4 w-4" />
                      )}
                    </div>
                    <h2 className="text-lg font-medium text-[#eeeeee]">
                      {project.name}
                    </h2>
                    <div className="ml-2 text-xs text-[#777777] bg-[#333333] px-2 py-0.5 rounded-full">
                      {projectTodos.length}
                    </div>
                  </div>
                  
                  {!isCollapsed && (
                    <div className="space-y-2">
                      {projectTodos.map((todo) => (
                        <TodoItem 
                          key={todo.id} 
                          todo={todo} 
                          onEdit={handleEditTodo}
                          onView={handleViewTodo}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
      
      {/* Dialogs */}
      {selectedTodo && (
        <>
          <EditTodoDialog
            todo={selectedTodo}
            open={showEditDialog}
            onOpenChange={setShowEditDialog}
          />
          <ViewTodoDialog
            todo={selectedTodo}
            open={showViewDialog}
            onOpenChange={setShowViewDialog}
          />
        </>
      )}
    </div>
  );
}
