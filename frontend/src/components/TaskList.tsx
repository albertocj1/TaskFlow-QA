import type { Task } from "../api";

interface TaskListProps {
  tasks: Task[];
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
}

export function TaskList({ tasks, onToggle, onDelete }: TaskListProps) {
  if (tasks.length === 0) {
    return <p data-testid="empty-state">No tasks yet. Add one above.</p>;
  }

  return (
    <ul data-testid="task-list">
      {tasks.map((task) => (
        <li key={task.id} data-testid="task-item" data-completed={task.completed}>
          <label>
            <input
              type="checkbox"
              data-testid="task-checkbox"
              checked={task.completed}
              onChange={(e) => onToggle(task.id, e.target.checked)}
            />
            <span data-testid="task-title" style={{ textDecoration: task.completed ? "line-through" : "none" }}>
              {task.title}
            </span>
          </label>
          <span data-testid="task-priority">{task.priority}</span>
          <button data-testid="task-delete-button" onClick={() => onDelete(task.id)}>
            Delete
          </button>
        </li>
      ))}
    </ul>
  );
}
