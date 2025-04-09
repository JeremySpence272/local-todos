"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { 
  Todo, 
  fetchTodos, 
  addTodo, 
  updateTodo, 
  saveTodos 
} from "@/lib/client-api";
import { Todo as TodoType } from "@/types";

export function useTodos() {
  const [todos, setTodos] = useState<TodoType[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTodos = async () => {
    try {
      const loadedTodos = await fetchTodos();
      setTodos(loadedTodos);
      return loadedTodos;
    } catch (error) {
      console.error("Error loading todos:", error);
      toast.error("Failed to load todos");
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTodos();
  }, []);

  const addNewTodo = async (text: string, projectId: string, underTenMinutes: boolean = false) => {
    try {
      await addTodo(text, projectId, underTenMinutes);
      const updatedTodos = await loadTodos();
      toast.success("Todo added successfully");
      return updatedTodos;
    } catch (error) {
      console.error("Error adding todo:", error);
      toast.error("Failed to add todo");
      return todos;
    }
  };

  const updateExistingTodo = async (updatedTodo: TodoType) => {
    try {
      await updateTodo(updatedTodo);
      const updatedTodos = await loadTodos();
      toast.success("Todo updated successfully");
      return updatedTodos;
    } catch (error) {
      console.error("Error updating todo:", error);
      toast.error("Failed to update todo");
      return todos;
    }
  };

  const toggleTodo = async (id: string) => {
    const todoToUpdate = todos.find(todo => todo.id === id);
    if (!todoToUpdate) return todos;

    const updatedTodo = {
      ...todoToUpdate,
      completed: !todoToUpdate.completed
    };

    return updateExistingTodo(updatedTodo);
  };

  const deleteTodo = async (id: string) => {
    try {
      const updatedTodos = todos.filter(todo => todo.id !== id);
      await saveTodos(updatedTodos);
      setTodos(updatedTodos);
      toast.success("Todo deleted successfully");
      return updatedTodos;
    } catch (error) {
      console.error("Error deleting todo:", error);
      toast.error("Failed to delete todo");
      return todos;
    }
  };

  return {
    todos,
    setTodos,
    loading,
    loadTodos,
    addNewTodo,
    updateExistingTodo,
    toggleTodo,
    deleteTodo
  };
}
