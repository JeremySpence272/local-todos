"use client";

import { useEffect, useState } from "react";
import { Todo, Project, fetchTodos, fetchProjects } from "@/lib/client-api";

export default function DataPage() {
  const [data, setData] = useState<{
    todos: Todo[];
    projects: Project[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Use our client API
        const [todos, projects] = await Promise.all([
          fetchTodos(),
          fetchProjects(),
        ]);

        setData({ todos, projects });
      } catch (error) {
        console.error("Error loading data:", error);
        setError(
          error instanceof Error ? error.message : "Failed to load data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (error) {
    return <div className="p-8 text-red-500">{error}</div>;
  }

  if (!data) {
    return (
      <div className="p-8 text-red-500">
        Error loading data. Check browser console for details.
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">File System Data</h1>
      <p className="mb-4 text-gray-500">
        This shows the raw data stored in the server's file system.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-2">
            Todos ({data.todos.length})
          </h2>
          <pre className="bg-gray-800 p-4 rounded-md overflow-auto max-h-[80vh] text-white">
            {JSON.stringify(data.todos, null, 2)}
          </pre>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">
            Projects ({data.projects.length})
          </h2>
          <pre className="bg-gray-800 p-4 rounded-md overflow-auto max-h-[80vh] text-white">
            {JSON.stringify(data.projects, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
