"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { PlusIcon, ClockIcon } from "@radix-ui/react-icons";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useTodos } from "@/hooks/useTodos";
import { useProjects } from "@/hooks/useProjects";

interface CreateTodoDialogProps {
  selectedProjectId: string | null;
}

export function CreateTodoDialog({ selectedProjectId }: CreateTodoDialogProps) {
  const { addNewTodo } = useTodos();
  const { projects } = useProjects();
  
  const [open, setOpen] = useState(false);
  const [todoText, setTodoText] = useState("");
  const [todoNotes, setTodoNotes] = useState("");
  const [todoUnderTen, setTodoUnderTen] = useState(false);
  
  const handleSubmit = async () => {
    if (!todoText.trim()) return;
    
    // Use selected project or first project as fallback
    const projectId = selectedProjectId || (projects.length > 0 ? projects[0].id : "");
    
    if (!projectId) {
      // Handle case where no project exists
      return;
    }
    
    await addNewTodo(todoText, projectId, todoUnderTen);
    
    // Reset form and close dialog
    setTodoText("");
    setTodoNotes("");
    setTodoUnderTen(false);
    setOpen(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="bg-[#4CAF50] hover:bg-[#43a047] text-white"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          New Task
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#202020] border border-[#333333] border-opacity-70 text-[#eeeeee]">
        <DialogHeader>
          <DialogTitle className="text-[#eeeeee]">Create New Task</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-1 text-[#a0a0a0]">Title</h3>
            <Input
              value={todoText}
              onChange={(e) => setTodoText(e.target.value)}
              placeholder="Todo title"
              className="bg-[#252525] border-[#333333] border-opacity-70 text-[#eeeeee] focus-visible:border-opacity-90 focus-visible:border-[#555555]"
            />
          </div>
          <div>
            <h3 className="text-sm font-medium mb-1 text-[#a0a0a0]">Notes</h3>
            <Textarea
              value={todoNotes}
              onChange={(e) => setTodoNotes(e.target.value)}
              placeholder="Add notes here..."
              className="min-h-[150px] bg-[#252525] border-[#333333] border-opacity-70 text-[#eeeeee] focus-visible:border-opacity-90 focus-visible:border-[#555555]"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="todo-under-ten"
              checked={todoUnderTen}
              onCheckedChange={(checked) => setTodoUnderTen(checked === true)}
              className="border-[#555555] border-opacity-70 data-[state=checked]:bg-[#4CAF50] data-[state=checked]:border-opacity-100"
            />
            <label
              htmlFor="todo-under-ten"
              className="text-sm text-[#a0a0a0] cursor-pointer flex items-center"
            >
              <ClockIcon className="h-3.5 w-3.5 mr-1.5" />
              Takes under 10 minutes
            </label>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            onClick={handleSubmit}
            className="bg-[#4CAF50] hover:bg-[#43a047] text-white"
          >
            Create Task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
