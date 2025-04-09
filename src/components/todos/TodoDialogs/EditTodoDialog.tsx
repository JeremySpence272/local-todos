"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ClockIcon } from "@radix-ui/react-icons";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useTodos } from "@/hooks/useTodos";
import { Todo } from "@/types";

interface EditTodoDialogProps {
  todo: Todo;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditTodoDialog({ todo, open, onOpenChange }: EditTodoDialogProps) {
  const { updateExistingTodo } = useTodos();
  
  const [todoText, setTodoText] = useState(todo.text);
  const [todoNotes, setTodoNotes] = useState(todo.notes);
  const [todoUnderTen, setTodoUnderTen] = useState(todo.underTenMinutes || false);
  
  // Update state when todo changes
  useEffect(() => {
    setTodoText(todo.text);
    setTodoNotes(todo.notes);
    setTodoUnderTen(todo.underTenMinutes || false);
  }, [todo]);
  
  const handleSubmit = async () => {
    if (!todoText.trim()) return;
    
    const updatedTodo = {
      ...todo,
      text: todoText,
      notes: todoNotes,
      underTenMinutes: todoUnderTen
    };
    
    await updateExistingTodo(updatedTodo);
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#202020] border border-[#333333] border-opacity-70 text-[#eeeeee]">
        <DialogHeader>
          <DialogTitle className="text-[#eeeeee]">Edit Task</DialogTitle>
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
              id="edit-todo-under-ten"
              checked={todoUnderTen}
              onCheckedChange={(checked) => setTodoUnderTen(checked === true)}
              className="border-[#555555] border-opacity-70 data-[state=checked]:bg-[#4CAF50] data-[state=checked]:border-opacity-100"
            />
            <label
              htmlFor="edit-todo-under-ten"
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
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
