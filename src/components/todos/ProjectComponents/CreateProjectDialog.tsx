"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusIcon } from "@radix-ui/react-icons";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useProjects } from "@/hooks/useProjects";

export function CreateProjectDialog() {
  const { addNewProject } = useProjects();
  
  const [open, setOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  
  const handleSubmit = async () => {
    if (!projectName.trim()) return;
    
    await addNewProject(projectName);
    
    // Reset form and close dialog
    setProjectName("");
    setOpen(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-full border-dashed border-[#555555] border-opacity-70 text-[#a0a0a0] hover:text-[#eeeeee] hover:bg-[#252525]"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#202020] border border-[#333333] border-opacity-70 text-[#eeeeee]">
        <DialogHeader>
          <DialogTitle className="text-[#eeeeee]">Create New Project</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div>
            <h3 className="text-sm font-medium mb-1 text-[#a0a0a0]">Project Name</h3>
            <Input
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Enter project name"
              className="bg-[#252525] border-[#333333] border-opacity-70 text-[#eeeeee] focus-visible:border-opacity-90 focus-visible:border-[#555555]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            onClick={handleSubmit}
            className="bg-[#4CAF50] hover:bg-[#43a047] text-white"
          >
            Create Project
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
