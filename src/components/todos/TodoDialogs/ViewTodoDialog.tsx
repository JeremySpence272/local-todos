"use client";

import { ClockIcon } from "@radix-ui/react-icons";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Todo } from "@/types";

interface ViewTodoDialogProps {
  todo: Todo;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewTodoDialog({ todo, open, onOpenChange }: ViewTodoDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#202020] border border-[#333333] border-opacity-70 text-[#eeeeee]">
        <DialogHeader>
          <DialogTitle className="text-[#eeeeee]">Todo Details</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-1 text-[#a0a0a0]">Title</h3>
            <div className="bg-[#252525] border border-[#333333] border-opacity-70 rounded-md p-3 text-[#eeeeee]">
              <div className="flex items-center">
                {todo.text}
                {todo.underTenMinutes && (
                  <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-[#4CAF5033] text-[#4CAF50]">
                    <ClockIcon className="h-3 w-3 mr-1" />
                    &lt;10 min
                  </span>
                )}
              </div>
            </div>
          </div>
          {todo.notes && (
            <div>
              <h3 className="text-sm font-medium mb-1 text-[#a0a0a0]">Notes</h3>
              <div className="bg-[#252525] border border-[#333333] border-opacity-70 rounded-md p-3 text-[#eeeeee] whitespace-pre-wrap">
                {todo.notes}
              </div>
            </div>
          )}
          <div>
            <h3 className="text-sm font-medium mb-1 text-[#a0a0a0]">Status</h3>
            <div className="bg-[#252525] border border-[#333333] border-opacity-70 rounded-md p-3 text-[#eeeeee]">
              {todo.completed ? "Completed" : "Not Completed"}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium mb-1 text-[#a0a0a0]">Created</h3>
            <div className="bg-[#252525] border border-[#333333] border-opacity-70 rounded-md p-3 text-[#eeeeee]">
              {new Date(todo.createdAt).toLocaleString()}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
