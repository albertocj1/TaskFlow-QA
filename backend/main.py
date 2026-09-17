"""
QA Automation Platform - Backend
A minimal Task Tracker API used as the system-under-test for the
Playwright suite in ../e2e. Deliberately simple: in-memory storage,
no auth complexity, so the automation layer is the star of the project.
"""
from datetime import datetime, timezone
from typing import List, Optional
from uuid import uuid4

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(title="QA Automation Platform API", version="1.0.0")

# Wide-open CORS since this is a local/demo project. Tighten this
# before deploying anywhere real (see backend/README notes).
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    priority: str = Field(default="medium", pattern="^(low|medium|high)$")


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=200)
    priority: Optional[str] = Field(default=None, pattern="^(low|medium|high)$")
    completed: Optional[bool] = None


class Task(BaseModel):
    id: str
    title: str
    priority: str
    completed: bool = False
    created_at: datetime


# In-memory store. Reset on server restart - intentional for a test
# fixture backend. Swap for a real DB only if you extend this beyond
# a portfolio/testing project.
_tasks: dict[str, Task] = {}


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.get("/tasks", response_model=List[Task])
def list_tasks(completed: Optional[bool] = None) -> List[Task]:
    tasks = list(_tasks.values())
    if completed is not None:
        tasks = [t for t in tasks if t.completed == completed]
    return sorted(tasks, key=lambda t: t.created_at)


@app.post("/tasks", response_model=Task, status_code=status.HTTP_201_CREATED)
def create_task(payload: TaskCreate) -> Task:
    task = Task(
        id=str(uuid4()),
        title=payload.title,
        priority=payload.priority,
        completed=False,
        created_at=datetime.now(timezone.utc),
    )
    _tasks[task.id] = task
    return task


@app.get("/tasks/{task_id}", response_model=Task)
def get_task(task_id: str) -> Task:
    task = _tasks.get(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@app.patch("/tasks/{task_id}", response_model=Task)
def update_task(task_id: str, payload: TaskUpdate) -> Task:
    task = _tasks.get(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    updated = task.model_copy(update={k: v for k, v in payload.model_dump().items() if v is not None})
    _tasks[task_id] = updated
    return updated


@app.delete("/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(task_id: str) -> None:
    if task_id not in _tasks:
        raise HTTPException(status_code=404, detail="Task not found")
    del _tasks[task_id]


@app.delete("/tasks", status_code=status.HTTP_204_NO_CONTENT)
def clear_tasks() -> None:
    """Test-only reset endpoint so Playwright can start each test clean."""
    _tasks.clear()
