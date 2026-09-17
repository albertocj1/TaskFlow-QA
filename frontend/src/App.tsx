import { useEffect, useState } from "react";
import { api, Priority, Task } from "./api";
import { TaskForm } from "./components/TaskForm";
import { TaskList } from "./components/TaskList";
import { Dashboard } from "./dashboard/Dashboard";

type View = "tasks" | "dashboard";

export default function App() {
  const [view, setView] = useState<View>("tasks");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    try {
      const data = await api.listTasks();
      setTasks(data);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleCreate = async (title: string, priority: Priority) => {
    await api.createTask({ title, priority });
    await refresh();
  };

  const handleToggle = async (id: string, completed: boolean) => {
    await api.toggleTask(id, completed);
    await refresh();
  };

  const handleDelete = async (id: string) => {
    await api.deleteTask(id);
    await refresh();
  };

  if (view === "dashboard") {
    return (
      <>
        <nav style={{ maxWidth: 720, margin: "16px auto", fontFamily: "sans-serif" }}>
          <button data-testid="nav-tasks" onClick={() => setView("tasks")}>Tasks</button>{" "}
          <button data-testid="nav-dashboard" disabled>Dashboard</button>
        </nav>
        <Dashboard />
      </>
    );
  }

  return (
    <>
      <nav style={{ maxWidth: 480, margin: "16px auto", fontFamily: "sans-serif" }}>
        <button data-testid="nav-tasks" disabled>Tasks</button>{" "}
        <button data-testid="nav-dashboard" onClick={() => setView("dashboard")}>Dashboard</button>
      </nav>
      <main style={{ maxWidth: 480, margin: "0 auto 40px", fontFamily: "sans-serif" }}>
        <h1>Task Tracker</h1>
        <p style={{ color: "#666", fontSize: 14 }}>
          System-under-test for the Playwright automation suite in <code>/e2e</code>.
        </p>
        {error && <p data-testid="error-banner" style={{ color: "crimson" }}>{error}</p>}
        <TaskForm onCreate={handleCreate} />
        <TaskList tasks={tasks} onToggle={handleToggle} onDelete={handleDelete} />
      </main>
    </>
  );
}
