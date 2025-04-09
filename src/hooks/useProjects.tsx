"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { 
  Project, 
  fetchProjects, 
  addProject, 
  saveProjects 
} from "@/lib/client-api";
import { Project as ProjectType } from "@/types";

export function useProjects() {
  const [projects, setProjects] = useState<ProjectType[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProjects = async () => {
    try {
      const loadedProjects = await fetchProjects();
      setProjects(loadedProjects);
      return loadedProjects;
    } catch (error) {
      console.error("Error loading projects:", error);
      toast.error("Failed to load projects");
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const addNewProject = async (name: string) => {
    try {
      await addProject(name);
      const updatedProjects = await loadProjects();
      toast.success("Project added successfully");
      return updatedProjects;
    } catch (error) {
      console.error("Error adding project:", error);
      toast.error("Failed to add project");
      return projects;
    }
  };

  const deleteProject = async (id: string) => {
    try {
      const updatedProjects = projects.filter(project => project.id !== id);
      await saveProjects(updatedProjects);
      setProjects(updatedProjects);
      toast.success("Project deleted successfully");
      return updatedProjects;
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Failed to delete project");
      return projects;
    }
  };

  return {
    projects,
    setProjects,
    loading,
    loadProjects,
    addNewProject,
    deleteProject
  };
}
