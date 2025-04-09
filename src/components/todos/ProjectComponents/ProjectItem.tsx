"use client";

import { Button } from "@/components/ui/button";
import { TrashIcon } from "@radix-ui/react-icons";
import { Project } from "@/types";

interface ProjectItemProps {
  project: Project;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  todoCount: number;
}

export function ProjectItem({ 
  project, 
  isSelected, 
  onSelect, 
  onDelete,
  todoCount
}: ProjectItemProps) {
  return (
    <div
      className={`flex items-center justify-between p-2 rounded-md cursor-pointer group ${
        isSelected
          ? "bg-[#333333] text-white"
          : "hover:bg-[#252525] text-[#cccccc]"
      }`}
      onClick={() => onSelect(project.id)}
    >
      <div className="flex items-center">
        <span className="truncate">{project.name}</span>
        <span className="ml-2 text-xs bg-[#444444] px-1.5 py-0.5 rounded-full">
          {todoCount}
        </span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(project.id);
        }}
        className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#333333] text-[#a0a0a0] hover:text-[#eeeeee]"
      >
        <TrashIcon className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
