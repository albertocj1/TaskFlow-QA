"""
QA Automation Platform - Backend
A minimal Task Tracker API used as the system-under-test for the
Playwright suite in ../e2e. Deliberately simple: in-memory storage,
no auth complexity, so the automation layer is the star of the project.
"""
from datetime import datetime, timezone
from typing import List, Optional
from uuid import uuid4

from fastapi import Depends, FastAPI, Header, HTTPException, status
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


# In-memory store, partitioned by worker key. Reset on server restart -
# intentional for a test fixture backend. Swap for a real DB only if you
# extend this beyond a portfolio/testing project.
#
# Partitioning lets Playwright's parallel workers each get an isolated
# slice of storage (via the X-Test-Worker header) instead of racing on
# one shared list - without that, one worker's reset-between-tests call
# wipes out tasks another worker is mid-test with.
_stores: dict[str, dict[str, Task]] = {}


def get_worker_key(x_test_worker: Optional[str] = Header(default=None)) -> str:
    return x_test_worker or "default"


def get_store(worker_key: str = Depends(get_worker_key)) -> dict[str, Task]:
    return _stores.setdefault(worker_key, {})


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.get("/tasks", response_model=List[Task])
def list_tasks(completed: Optional[bool] = None, store: dict[str, Task] = Depends(get_store)) -> List[Task]:
    tasks = list(store.values())
    if completed is not None:
        tasks = [t for t in tasks if t.completed == completed]
    return sorted(tasks, key=lambda t: t.created_at)


@app.post("/tasks", response_model=Task, status_code=status.HTTP_201_CREATED)
def create_task(payload: TaskCreate, store: dict[str, Task] = Depends(get_store)) -> Task:
    task = Task(
        id=str(uuid4()),
        title=payload.title,
        priority=payload.priority,
        completed=False,
        created_at=datetime.now(timezone.utc),
    )
    store[task.id] = task
    return task


@app.get("/tasks/{task_id}", response_model=Task)
def get_task(task_id: str, store: dict[str, Task] = Depends(get_store)) -> Task:
    task = store.get(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@app.patch("/tasks/{task_id}", response_model=Task)
def update_task(task_id: str, payload: TaskUpdate, store: dict[str, Task] = Depends(get_store)) -> Task:
    task = store.get(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    updated = task.model_copy(update={k: v for k, v in payload.model_dump().items() if v is not None})
    store[task_id] = updated
    return updated


@app.delete("/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(task_id: str, store: dict[str, Task] = Depends(get_store)) -> None:
    if task_id not in store:
        raise HTTPException(status_code=404, detail="Task not found")
    del store[task_id]


@app.delete("/tasks", status_code=status.HTTP_204_NO_CONTENT)
def clear_tasks(store: dict[str, Task] = Depends(get_store)) -> None:
    """Test-only reset endpoint so Playwright can start each test clean."""
    store.clear()
