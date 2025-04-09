"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  PlusIcon,
  TrashIcon,
  Pencil1Icon,
  DotsHorizontalIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  HomeIcon,
  TextIcon,
  EyeOpenIcon,
  EyeClosedIcon,
  TimerIcon,
  ClockIcon,
} from "@radix-ui/react-icons";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

import {
  Todo,
  Project,
  fetchTodos,
  fetchProjects,
  addTodo,
  updateTodo,
  addProject,
  saveTodos,
  saveProjects,
} from "@/lib/client-api";
import { ListIcon } from "lucide-react";

export default function TodoApp() {
  // State for todos and projects
  const [todos, setTodos] = useState<Todo[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  );

  // State for filtering todos
  const [hideCompleted, setHideCompleted] = useState(false);
  const [showOnlyUnderTen, setShowOnlyUnderTen] = useState(false);

  // State for new todo form
  const [newTodoText, setNewTodoText] = useState("");
  const [newTodoNotes, setNewTodoNotes] = useState("");
  const [newTodoUnderTen, setNewTodoUnderTen] = useState(false);
  const [showNewTodoNotesField, setShowNewTodoNotesField] = useState(false);

  // State for new project form
  const [newProjectName, setNewProjectName] = useState("");
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false);

  // State for todo details/edit
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [showTodoDialog, setShowTodoDialog] = useState(false);
  const [todoText, setTodoText] = useState("");
  const [todoNotes, setTodoNotes] = useState("");
  const [todoUnderTen, setTodoUnderTen] = useState(false);

  // State to prevent hydration errors
  const [isClient, setIsClient] = useState(false);
  // State for loading
  const [loading, setLoading] = useState(true);

  // State for tracking collapsed project sections on the All Tasks page
  const [collapsedProjects, setCollapsedProjects] = useState<
    Record<string, boolean>
  >({});

  // New state for view-only todo details dialog
  const [showViewTodoDialog, setShowViewTodoDialog] = useState(false);

  // Load todos and projects on component mount
  useEffect(() => {
    const loadData = async () => {
      setIsClient(true);
      try {
        const [loadedTodos, loadedProjects] = await Promise.all([
          fetchTodos(),
          fetchProjects(),
        ]);

        setTodos(loadedTodos);
        setProjects(loadedProjects);
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Failed to load data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Reset filters state when changing projects
  useEffect(() => {
    // When project changes, reset to show all tasks (default state)
    setHideCompleted(false);
    setShowOnlyUnderTen(false);
  }, [selectedProjectId]);

  // Filter todos by selected project or get all todos if no project is selected
  const filteredTodos = selectedProjectId
    ? todos.filter((todo) => todo.projectId === selectedProjectId)
    : todos;

  // Apply filters if enabled
  const displayedTodos = filteredTodos
    .filter(todo => hideCompleted ? !todo.completed : true)
    .filter(todo => showOnlyUnderTen ? todo.underTenMinutes : true);

  // Group todos by project
  const groupedTodos = () => {
    if (selectedProjectId) return null;

    const groups: Record<string, Todo[]> = {};

    // Use already filtered todos when grouping
    const todosToGroup = todos
      .filter(todo => hideCompleted ? !todo.completed : true)
      .filter(todo => showOnlyUnderTen ? todo.underTenMinutes : true);

    todosToGroup.forEach((todo) => {
      if (!groups[todo.projectId]) {
        groups[todo.projectId] = [];
      }
      groups[todo.projectId].push(todo);
    });

    return groups;
  };

  const todoGroups = groupedTodos();

  // Toggle project section collapse state
  const toggleProjectCollapse = (projectId: string) => {
    setCollapsedProjects((prev) => ({
      ...prev,
      [projectId]: !prev[projectId],
    }));
  };

  // Generate a unique ID locally to avoid waiting for server
  const generateId = (): string =>
    Date.now().toString(36) + Math.random().toString(36).substring(2, 9);

  // Handle adding a new todo
  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newTodoText.trim()) {
      toast.error("Todo text cannot be empty");
      return;
    }

    try {
      // Use selected project or default to the first available project
      const targetProjectId =
        selectedProjectId || (projects.length > 0 ? projects[0].id : "default");

      // Use the client API addTodo function
      await addTodo(newTodoText, targetProjectId, newTodoUnderTen);

      // Refresh the todos list
      const updatedTodos = await fetchTodos();
      setTodos(updatedTodos);

      // Reset form
      setNewTodoText("");
      setNewTodoNotes("");
      setNewTodoUnderTen(false);
      setShowNewTodoNotesField(false);
      toast.success("Todo added successfully");
    } catch (error) {
      console.error("Error adding todo:", error);
      toast.error("Failed to add todo. Please try again.");
    }
  };

  // Handle adding a new project
  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newProjectName.trim()) {
      toast.error("Project name cannot be empty");
      return;
    }

    try {
      // Use the client API addProject function
      await addProject(newProjectName);

      // Refresh the projects list
      const updatedProjects = await fetchProjects();
      setProjects(updatedProjects);

      // Reset form
      setNewProjectName("");
      setShowNewProjectDialog(false);
      toast.success("Project added successfully");
    } catch (error) {
      console.error("Error adding project:", error);
      toast.error("Failed to add project. Please try again.");
    }
  };

  // Handle deleting a project
  const handleDeleteProject = async (projectId: string) => {
    try {
      // First update local state for immediate UI feedback
      const updatedProjects = projects.filter((p) => p.id !== projectId);
      setProjects(updatedProjects);

      // Delete project todos locally too
      const updatedTodos = todos.filter((t) => t.projectId !== projectId);
      setTodos(updatedTodos);

      // Update server - save both updated collections
      await Promise.all([
        saveProjects(updatedProjects),
        saveTodos(updatedTodos),
      ]);

      // If the deleted project was selected, switch to all projects view
      if (selectedProjectId === projectId) {
        setSelectedProjectId(null);
      }

      toast.success("Project deleted successfully");
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Failed to delete project. Please try again.");

      // Reload the data in case of error to ensure UI is in sync
      const [reloadedTodos, reloadedProjects] = await Promise.all([
        fetchTodos(),
        fetchProjects(),
      ]);
      setTodos(reloadedTodos);
      setProjects(reloadedProjects);
    }
  };

  // Handle toggling a todo's completion status
  const handleToggleTodo = async (todoId: string) => {
    try {
      // Find the todo locally
      const todoToUpdate = todos.find((t) => t.id === todoId);
      if (!todoToUpdate) return;

      // Toggle completion locally first for immediate UI feedback
      const updatedTodo = {
        ...todoToUpdate,
        completed: !todoToUpdate.completed,
      };

      // Update local state
      const updatedTodos = todos.map((todo) =>
        todo.id === todoId ? updatedTodo : todo
      );
      setTodos(updatedTodos);

      // Update on server
      await updateTodo(updatedTodo);
    } catch (error) {
      console.error("Error toggling todo:", error);
      toast.error("Failed to update todo. Please try again.");

      // Reload todos to ensure UI is in sync
      const reloadedTodos = await fetchTodos();
      setTodos(reloadedTodos);
    }
  };

  // Handle deleting a todo
  const handleDeleteTodo = async (todoId: string) => {
    try {
      // Update local state first for immediate UI feedback
      const updatedTodos = todos.filter((t) => t.id !== todoId);
      setTodos(updatedTodos);

      // Update on server
      await saveTodos(updatedTodos);
      toast.success("Todo deleted successfully");
    } catch (error) {
      console.error("Error deleting todo:", error);
      toast.error("Failed to delete todo. Please try again.");

      // Reload todos to ensure UI is in sync
      const reloadedTodos = await fetchTodos();
      setTodos(reloadedTodos);
    }
  };

  // Handle opening the todo details dialog
  const openTodoDialog = (todo: Todo) => {
    setSelectedTodo(todo);
    setTodoText(todo.text);
    setTodoNotes(todo.notes);
    setTodoUnderTen(todo.underTenMinutes || false);
    setShowTodoDialog(true);
  };

  // Handle opening the view-only todo details dialog
  const openViewTodoDialog = (todo: Todo) => {
    setSelectedTodo(todo);
    setTodoText(todo.text);
    setTodoNotes(todo.notes);
    setShowViewTodoDialog(true);
  };

  // Handle saving todo details
  const handleSaveTodoDetails = async () => {
    if (!selectedTodo) return;

    if (!todoText.trim()) {
      toast.error("Todo title cannot be empty");
      return;
    }

    try {
      const updatedTodo = {
        ...selectedTodo,
        text: todoText,
        notes: todoNotes,
        underTenMinutes: todoUnderTen
      };

      // Update local state first for immediate UI feedback
      const updatedTodos = todos.map((todo) =>
        todo.id === selectedTodo.id ? updatedTodo : todo
      );
      setTodos(updatedTodos);

      // Update on server
      await updateTodo(updatedTodo);

      setShowTodoDialog(false);
      toast.success("Todo updated successfully");
    } catch (error) {
      console.error("Error updating todo:", error);
      toast.error("Failed to update todo. Please try again.");

      // Reload todos to ensure UI is in sync
      const reloadedTodos = await fetchTodos();
      setTodos(reloadedTodos);
    }
  };

  // Only render the full app after client-side hydration is complete
  if (!isClient || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#191919]">
      {/* Notion-style Sidebar */}
      <aside className="h-screen w-64 flex-shrink-0 border-r border-[#333333] bg-[#202020]">
        <div className="flex flex-col h-full">
          {/* User/Brand Header */}
          <div className="flex items-center px-4 py-4 border-b border-[#333333]">
            <div className="h-6 w-6 bg-[#333333] rounded-md flex items-center justify-center text-[#eeeeee] mr-2">
              <HomeIcon className="h-4 w-4" />
            </div>
            <div className="flex-1 font-medium truncate text-[#eeeeee]">
              Local Todos
            </div>
          </div>

          {/* Sidebar Navigation */}
          <div className="flex-1 overflow-y-auto pt-2 pb-4">
            {/* All Todos */}
            <div className="px-3 ">
              <div
                className={`flex items-center px-2 py-1.5 text-sm rounded-md hover:bg-[#333333] cursor-pointer ${
                  selectedProjectId === null ? "bg-[#333333] border-0" : ""
                }`}
                onClick={() => setSelectedProjectId(null)}
              >
                <div className="h-3.5 w-3.5 text-[#eeeeee] mr-2">
                  <ListIcon className="h-3.5 w-3.5" />
                </div>
                <span className="flex-1 text-[#eeeeee]">All Tasks</span>
              </div>
            </div>

            {/* Projects Section */}
            <div className="px-3 mt-4">
              <div className="flex items-center justify-between py-1.5">
                <div className="px-1 text-xs font-medium text-[#a0a0a0] uppercase tracking-wider">
                  PROJECTS
                </div>
              </div>

              {/* Project List */}
              <div className="mt-1 space-y-1">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className={`flex items-center px-2 py-1.5 text-sm rounded-md group/project hover:bg-[#333333] cursor-pointer ${
                      selectedProjectId === project.id
                        ? "bg-[#333333] border-0"
                        : ""
                    }`}
                  >
                    <div
                      className="flex-1 flex items-center"
                      onClick={() => setSelectedProjectId(project.id)}
                    >
                      <div className="h-3 w-3 bg-[#505050] rounded-sm mr-2"></div>
                      <span className="truncate text-[#eeeeee]">
                        {project.name}
                      </span>
                    </div>
                    <button
                      className="h-6 w-6 rounded hover:bg-[#444444] flex items-center justify-center opacity-0 group-hover/project:opacity-100 transition-opacity"
                      onClick={() => handleDeleteProject(project.id)}
                    >
                      <TrashIcon className="h-3.5 w-3.5 text-[#a0a0a0]" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add New Project Button */}
              <div className="mt-3 px-1">
                <Dialog
                  open={showNewProjectDialog}
                  onOpenChange={setShowNewProjectDialog}
                >
                  <DialogTrigger asChild>
                    <button className="flex items-center w-full px-2 py-1.5 text-sm text-[#a0a0a0] hover:text-[#eeeeee] rounded-md hover:bg-[#333333] transition-colors">
                      <PlusIcon className="h-3.5 w-3.5 mr-2" />
                      <span>Add new project</span>
                    </button>
                  </DialogTrigger>
                  <DialogContent className="bg-[#202020] border-[#333333] text-[#eeeeee]">
                    <DialogHeader>
                      <DialogTitle>Create New Project</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddProject}>
                      <Input
                        value={newProjectName}
                        onChange={(e) => setNewProjectName(e.target.value)}
                        placeholder="Project name"
                        className="my-4 bg-[#333333] border-[#444444] text-[#eeeeee]"
                      />
                      <DialogFooter>
                        <Button
                          type="submit"
                          className="bg-[#333333] hover:bg-[#444444] text-[#eeeeee]"
                        >
                          Create Project
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto pt-6 pb-12 px-8">
        <div className="max-w-3xl mx-auto">
          {/* Header with Current Project */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-1 text-[#eeeeee]">
              {selectedProjectId
                ? projects.find((p) => p.id === selectedProjectId)?.name
                : "All Tasks"}
            </h1>
          </div>

          {/* New Todo Form */}
          {selectedProjectId && (
            <>
              <form
                onSubmit={handleAddTodo}
                className="bg-[#202020] border border-[#333333] rounded-md p-4 mb-3 border-opacity-70"
              >
                <Input
                  value={newTodoText}
                  onChange={(e) => setNewTodoText(e.target.value)}
                  placeholder="Add a new todo..."
                  className="mb-2 bg-[#252525] border border-[#333333] border-opacity-70 rounded-md px-3 py-2 text-[#eeeeee] focus-visible:ring-0 focus-visible:border-[#555555] focus-visible:border-opacity-90"
                />

                {showNewTodoNotesField ? (
                  <div className="mt-2">
                    <Textarea
                      value={newTodoNotes}
                      onChange={(e) => setNewTodoNotes(e.target.value)}
                      placeholder="Add notes (optional)"
                      className="min-h-[80px] bg-[#252525] border-[#333333] border-opacity-70 text-[#eeeeee] resize-none"
                    />
                    <div className="flex items-center space-x-2 mt-3">
                      <Checkbox
                        id="new-todo-under-ten"
                        checked={newTodoUnderTen}
                        onCheckedChange={(checked) => setNewTodoUnderTen(checked === true)}
                        className="border-[#555555] border-opacity-70 data-[state=checked]:bg-[#4CAF50] data-[state=checked]:border-opacity-100"
                      />
                      <label
                        htmlFor="new-todo-under-ten"
                        className="text-sm text-[#a0a0a0] cursor-pointer flex items-center"
                      >
                        <ClockIcon className="h-3.5 w-3.5 mr-1.5" />
                        Takes under 10 minutes
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between mt-2">
                    <div className="flex items-center gap-3">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowNewTodoNotesField(true)}
                        className="text-[#a0a0a0] hover:text-[#eeeeee] hover:bg-[#333333] px-0"
                      >
                        <div className="flex items-center gap-1 border-dashed border-b border-[#444444] pb-0.5">
                          <TextIcon className="h-3.5 w-3.5" />
                          <span>Add Notes</span>
                        </div>
                      </Button>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="new-todo-under-ten-simple"
                          checked={newTodoUnderTen}
                          onCheckedChange={(checked) => setNewTodoUnderTen(checked === true)}
                          className="border-[#555555] border-opacity-70 data-[state=checked]:bg-[#4CAF50] data-[state=checked]:border-opacity-100"
                        />
                        <label
                          htmlFor="new-todo-under-ten-simple"
                          className="text-sm text-[#a0a0a0] cursor-pointer flex items-center"
                        >
                          <ClockIcon className="h-3.5 w-3.5 mr-1.5" />
                          Under 10 min
                        </label>
                      </div>
                    </div>
                    <Button
                      type="submit"
                      className="bg-[#333333] hover:bg-[#444444] text-[#eeeeee]"
                    >
                      Add Task
                    </Button>
                  </div>
                )}

                {showNewTodoNotesField && (
                  <div className="flex justify-end mt-3 space-x-2">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setShowNewTodoNotesField(false);
                        setNewTodoNotes("");
                      }}
                      className="text-[#a0a0a0] hover:text-[#eeeeee] hover:bg-[#333333]"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-[#333333] hover:bg-[#444444] text-[#eeeeee]"
                    >
                      Add Task
                    </Button>
                  </div>
                )}
              </form>

              {/* Filters */}
              <div className="flex justify-end mb-6 space-x-2">
                <Button
                  type="button"
                  variant={showOnlyUnderTen ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowOnlyUnderTen((prev) => !prev)}
                  className={`border border-[#555555] border-dashed border-opacity-70 hover:bg-[#333333] hover:text-white transition-colors ${
                    showOnlyUnderTen
                      ? "bg-[#4CAF50] text-white border-[#4CAF50]"
                      : "text-[#cccccc] bg-transparent"
                  }`}
                >
                  {showOnlyUnderTen ? (
                    <>
                      <ClockIcon className="h-3.5 w-3.5 mr-2" />
                      All Tasks
                    </>
                  ) : (
                    <>
                      <ClockIcon className="h-3.5 w-3.5 mr-2" />
                      Under 10 Min Tasks
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant={hideCompleted ? "default" : "outline"}
                  size="sm"
                  onClick={() => setHideCompleted((prev) => !prev)}
                  className={`border border-[#555555] border-dashed border-opacity-70 hover:bg-[#333333] hover:text-white transition-colors ${
                    hideCompleted
                      ? "bg-[#333333] text-white"
                      : "text-[#cccccc] bg-transparent"
                  }`}
                >
                  {hideCompleted ? (
                    <>
                      <EyeOpenIcon className="h-3.5 w-3.5 mr-2" />
                      Show Completed Tasks
                    </>
                  ) : (
                    <>
                      <EyeClosedIcon className="h-3.5 w-3.5 mr-2" />
                      Hide Completed Tasks
                    </>
                  )}
                </Button>
              </div>
            </>
          )}

          {/* Todo List */}
          {selectedProjectId ? (
            // Show todos for selected project
            <div className="space-y-2 mt-4">
              {displayedTodos.length === 0 ? (
                <div className="text-center py-12 border border-[#333333] border-opacity-70 rounded-md">
                  <div className="flex flex-col items-center justify-center">
                    {filteredTodos.length > 0 && hideCompleted ? (
                      <>
                        <div className="h-12 w-12 rounded-full bg-[#333333] flex items-center justify-center text-[#a0a0a0] mb-3">
                          <EyeClosedIcon className="h-6 w-6" />
                        </div>
                        <p className="text-[#a0a0a0] mb-2">
                          All tasks are completed
                        </p>
                        <p className="text-sm text-[#777777]">
                          <Button
                            variant="link"
                            className="text-[#777777] hover:text-[#cccccc] p-0 h-auto"
                            onClick={() => setHideCompleted(false)}
                          >
                            Show completed tasks
                          </Button>{" "}
                          or add a new task
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="h-12 w-12 rounded-full bg-[#333333] flex items-center justify-center text-[#a0a0a0] mb-3">
                          <PlusIcon className="h-6 w-6" />
                        </div>
                        <p className="text-[#a0a0a0] mb-2">No tasks yet</p>
                        <p className="text-sm text-[#777777]">
                          Create a new task to get started
                        </p>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                displayedTodos.map((todo) => (
                  <div
                    key={todo.id}
                    className="flex items-center gap-3 p-3 border border-[#333333] border-opacity-70 rounded-md group hover:border-[#555555] hover:border-opacity-80 hover:bg-[#252525] transition-colors"
                  >
                    <Checkbox
                      checked={todo.completed}
                      onCheckedChange={() => handleToggleTodo(todo.id)}
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
                        openViewTodoDialog(todo);
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
                        onClick={() => openTodoDialog(todo)}
                        className="h-8 w-8 p-0 hover:bg-[#333333] text-[#a0a0a0] hover:text-[#eeeeee]"
                      >
                        <Pencil1Icon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTodo(todo.id)}
                        className="h-8 w-8 p-0 hover:bg-[#333333] text-[#a0a0a0] hover:text-[#eeeeee]"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            // Show all todos grouped by project
            <div className="space-y-6">
              {projects.length === 0 ? (
                <div className="text-center py-12 border border-[#333333] rounded-md">
                  <div className="flex flex-col items-center justify-center">
                    <div className="h-12 w-12 rounded-full bg-[#333333] flex items-center justify-center text-[#a0a0a0] mb-3">
                      <PlusIcon className="h-6 w-6" />
                    </div>
                    <p className="text-[#a0a0a0] mb-2">No projects yet</p>
                    <p className="text-sm text-[#777777]">
                      Create a new project to get started
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Filters for All Tasks view */}
                  <div className="flex justify-end mb-6 space-x-2">
                    <Button
                      type="button"
                      variant={showOnlyUnderTen ? "default" : "outline"}
                      size="sm"
                      onClick={() => setShowOnlyUnderTen((prev) => !prev)}
                      className={`border border-[#555555] border-dashed border-opacity-70 hover:bg-[#333333] hover:text-white transition-colors ${
                        showOnlyUnderTen
                          ? "bg-[#4CAF50] text-white border-[#4CAF50]"
                          : "text-[#cccccc] bg-transparent"
                      }`}
                    >
                      {showOnlyUnderTen ? (
                        <>
                          <ClockIcon className="h-3.5 w-3.5 mr-2" />
                          All Tasks
                        </>
                      ) : (
                        <>
                          <ClockIcon className="h-3.5 w-3.5 mr-2" />
                          Under 10 Min Tasks
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant={hideCompleted ? "default" : "outline"}
                      size="sm"
                      onClick={() => setHideCompleted((prev) => !prev)}
                      className={`border border-[#555555] border-dashed border-opacity-70 hover:bg-[#333333] hover:text-white transition-colors ${
                        hideCompleted
                          ? "bg-[#333333] text-white"
                          : "text-[#cccccc] bg-transparent"
                      }`}
                    >
                      {hideCompleted ? (
                        <>
                          <EyeOpenIcon className="h-3.5 w-3.5 mr-2" />
                          Show Completed Tasks
                        </>
                      ) : (
                        <>
                          <EyeClosedIcon className="h-3.5 w-3.5 mr-2" />
                          Hide Completed Tasks
                        </>
                      )}
                    </Button>
                  </div>

                  {projects.map((project) => {
                    // Filter project todos according to hideCompleted setting
                    const projectTodos = todos
                      .filter((todo) => todo.projectId === project.id)
                      .filter((todo) =>
                        hideCompleted ? !todo.completed : true
                      );

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
                              <div
                                key={todo.id}
                                className="flex items-center gap-3 p-3 border border-[#333333] rounded-md group hover:border-[#555555] hover:bg-[#252525] transition-colors"
                              >
                                <Checkbox
                                  checked={todo.completed}
                                  onCheckedChange={() =>
                                    handleToggleTodo(todo.id)
                                  }
                                  id={`todo-${todo.id}`}
                                  className="border-[#555555] data-[state=checked]:bg-[#555555]"
                                />
                                <label
                                  htmlFor={`todo-${todo.id}`}
                                  className={`flex-1 cursor-default text-[#eeeeee] ${
                                    todo.completed
                                      ? "line-through text-[#777777]"
                                      : ""
                                  }`}
                                  onClick={(e) => {
                                    // Prevent toggling the checkbox when clicking the label
                                    e.preventDefault();
                                    openViewTodoDialog(todo);
                                  }}
                                >
                                  <div className="cursor-pointer hover:text-[#ffffff]">
                                    {todo.text}
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
                                    onClick={() => openTodoDialog(todo)}
                                    className="h-8 w-8 p-0 hover:bg-[#333333] text-[#a0a0a0] hover:text-[#eeeeee]"
                                  >
                                    <Pencil1Icon className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteTodo(todo.id)}
                                    className="h-8 w-8 p-0 hover:bg-[#333333] text-[#a0a0a0] hover:text-[#eeeeee]"
                                  >
                                    <TrashIcon className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </>
              )}

              {todos.length === 0 && (
                <div className="text-center py-12 border border-[#333333] rounded-md">
                  <div className="flex flex-col items-center justify-center">
                    <div className="h-12 w-12 rounded-full bg-[#333333] flex items-center justify-center text-[#a0a0a0] mb-3">
                      <PlusIcon className="h-6 w-6" />
                    </div>
                    <p className="text-[#a0a0a0] mb-2">No tasks yet</p>
                    <p className="text-sm text-[#777777]">
                      Create a new task to get started
                    </p>
                  </div>
                </div>
              )}

              {/* Show message when all tasks are filtered out in All Tasks view */}
              {todos.length > 0 &&
                hideCompleted &&
                todos.every((todo) => todo.completed) && (
                  <div className="text-center py-12 border border-[#333333] rounded-md">
                    <div className="flex flex-col items-center justify-center">
                      <div className="h-12 w-12 rounded-full bg-[#333333] flex items-center justify-center text-[#a0a0a0] mb-3">
                        <EyeClosedIcon className="h-6 w-6" />
                      </div>
                      <p className="text-[#a0a0a0] mb-2">
                        All tasks are completed
                      </p>
                      <p className="text-sm text-[#777777]">
                        <Button
                          variant="link"
                          className="text-[#777777] hover:text-[#cccccc] p-0 h-auto"
                          onClick={() => setHideCompleted(false)}
                        >
                          Show completed tasks
                        </Button>{" "}
                        or add a new task
                      </p>
                    </div>
                  </div>
                )}
            </div>
          )}
        </div>
      </main>

      {/* Todo Details Dialog */}
      <Dialog open={showTodoDialog} onOpenChange={setShowTodoDialog}>
        <DialogContent className="bg-[#202020] border border-[#333333] border-opacity-70 text-[#eeeeee]">
          <DialogHeader>
            <DialogTitle className="text-[#eeeeee]">Edit Todo</DialogTitle>
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
              onClick={handleSaveTodoDetails}
              className="bg-[#333333] hover:bg-[#444444] text-[#eeeeee] border-0"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Read-only Todo Details Dialog */}
      <Dialog open={showViewTodoDialog} onOpenChange={setShowViewTodoDialog}>
        <DialogContent className="bg-[#202020] border border-[#333333] border-opacity-70 text-[#eeeeee]">
          <DialogHeader>
            <DialogTitle className="text-[#eeeeee]">Todo Details</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-1 text-[#a0a0a0]">Title</h3>
              <div className="bg-[#252525] border border-[#333333] border-opacity-70 rounded-md p-3 text-[#eeeeee]">
                <div className="flex items-center">
                  {todoText}
                  {selectedTodo?.underTenMinutes && (
                    <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-[#4CAF5033] text-[#4CAF50]">
                      <ClockIcon className="h-3 w-3 mr-1" />
                      &lt;10 min
                    </span>
                  )}
                </div>
              </div>
            </div>
            {todoNotes && (
              <div>
                <h3 className="text-sm font-medium mb-1 text-[#a0a0a0]">
                  Notes
                </h3>
                <div className="bg-[#252525] border border-[#333333] border-opacity-70 rounded-md p-3 text-[#eeeeee] min-h-[80px] whitespace-pre-wrap">
                  {todoNotes}
                </div>
              </div>
            )}
            {!todoNotes && (
              <div className="text-center py-2 text-[#777777] text-sm">
                No notes for this todo
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                setShowViewTodoDialog(false);
                if (selectedTodo) {
                  openTodoDialog(selectedTodo);
                }
              }}
              variant="outline"
              className="border-[#333333] hover:bg-[#333333] hover:text-[#eeeeee] text-[#a0a0a0]"
            >
              Edit
            </Button>
            <Button
              onClick={() => setShowViewTodoDialog(false)}
              className="bg-[#333333] hover:bg-[#444444] text-[#eeeeee] border-0"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
