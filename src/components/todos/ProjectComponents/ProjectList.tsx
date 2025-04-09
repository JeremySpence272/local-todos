"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { HomeIcon } from "@radix-ui/react-icons";
import { ProjectItem } from "./ProjectItem";
import { CreateProjectDialog } from "./CreateProjectDialog";
import { Project, Todo } from "@/types";
import { useProjects } from "@/hooks/useProjects";

interface ProjectListProps {
  projects: Project[];
  todos: Todo[];
  selectedProjectId: string | null;
  onSelectProject: (id: string | null) => void;
}

export function ProjectList({ 
  projects, 
  todos, 
  selectedProjectId, 
  onSelectProject 
}: ProjectListProps) {
  const { deleteProject } = useProjects();

  const handleDeleteProject = async (id: string) => {
    await deleteProject(id);
    
    // If the deleted project was selected, reset selection
    if (selectedProjectId === id) {
      onSelectProject(null);
    }
  };

  // Count todos for each project
  const getProjectTodoCount = (projectId: string) => {
    return todos.filter(todo => todo.projectId === projectId).length;
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium text-[#eeeeee] mb-2">Projects</h2>
      
      <Button
        variant="ghost"
        className={`w-full justify-start ${
          selectedProjectId === null
            ? "bg-[#333333] text-white"
            : "text-[#cccccc] hover:bg-[#252525] hover:text-[#eeeeee]"
        }`}
        onClick={() => onSelectProject(null)}
      >
        <HomeIcon className="h-4 w-4 mr-2" />
        All Tasks
      </Button>
      
      <div className="space-y-1 mt-2">
        {projects.map((project) => (
          <ProjectItem
            key={project.id}
            project={project}
            isSelected={selectedProjectId === project.id}
            onSelect={onSelectProject}
            onDelete={handleDeleteProject}
            todoCount={getProjectTodoCount(project.id)}
          />
        ))}
      </div>
      
      <div className="mt-4">
        <CreateProjectDialog />
      </div>
    </div>
  );
}
