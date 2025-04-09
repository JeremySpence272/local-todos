"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Pencil1Icon, TrashIcon, ClockIcon } from "@radix-ui/react-icons";
import { Todo } from "@/types";
import { useTodos } from "@/hooks/useTodos";

interface TodoItemProps {
  todo: Todo;
  onEdit: (todo: Todo) => void;
  onView: (todo: Todo) => void;
}

export function TodoItem({ todo, onEdit, onView }: TodoItemProps) {
  const { toggleTodo, deleteTodo } = useTodos();

  const handleToggle = async () => {
    await toggleTodo(todo.id);
  };

  const handleDelete = async () => {
    await deleteTodo(todo.id);
  };

  return (
    <div
      className="flex items-center gap-3 p-3 border border-[#333333] border-opacity-70 rounded-md group hover:border-[#555555] hover:border-opacity-80 hover:bg-[#252525] transition-colors"
    >
      <Checkbox
        checked={todo.completed}
        onCheckedChange={handleToggle}
        id={`todo-${todo.id}`}
        className="border-[#555555] border-opacity-70 data-[state=checked]:bg-[#555555] data-[state=checked]:border-opacity-100"
      />
      <label
        htmlFor={`todo-${todo.id}`}
        className={`flex-1 cursor-default text-[#eeeeee] ${
          todo.completed ? "line-through text-[#777777]" : ""
        }`}
        onClick={(e) => {
          // Prevent toggling the checkbox when clicking the label
          e.preventDefault();
          onView(todo);
        }}
      >
        <div className="cursor-pointer hover:text-[#ffffff]">
          <div className="flex items-center">
            {todo.text}
            {todo.underTenMinutes && (
              <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-[#4CAF5033] text-[#4CAF50]">
                <ClockIcon className="h-3 w-3 mr-1" />
                &lt;10 min
              </span>
            )}
          </div>
          {todo.notes && (
            <div className="text-xs text-[#a0a0a0] mt-1 whitespace-pre-wrap hover:text-[#cccccc]">
              {todo.notes}
            </div>
          )}
        </div>
      </label>

      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(todo)}
          className="h-8 w-8 p-0 hover:bg-[#333333] text-[#a0a0a0] hover:text-[#eeeeee]"
        >
          <Pencil1Icon className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          className="h-8 w-8 p-0 hover:bg-[#333333] text-[#a0a0a0] hover:text-[#eeeeee]"
        >
          <TrashIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
