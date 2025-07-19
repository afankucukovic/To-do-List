from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime
from enum import Enum

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="ToDo API", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Enums
class TaskStatus(str, Enum):
    TODO = "todo"
    COMPLETED = "completed"

# Models
class TaskBase(BaseModel):
    title: str
    description: Optional[str] = ""
    status: TaskStatus = TaskStatus.TODO

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[TaskStatus] = None

class Task(TaskBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# Routes
@api_router.get("/")
async def root():
    return {"message": "ToDo API is running!"}

@api_router.get("/tasks", response_model=List[Task])
async def get_tasks():
    """Get all tasks"""
    try:
        tasks = await db.tasks.find().sort("created_at", -1).to_list(1000)
        return [Task(**task) for task in tasks]
    except Exception as e:
        logging.error(f"Error fetching tasks: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch tasks")

@api_router.post("/tasks", response_model=Task)
async def create_task(task_data: TaskCreate):
    """Create a new task"""
    try:
        task = Task(**task_data.dict())
        await db.tasks.insert_one(task.dict())
        return task
    except Exception as e:
        logging.error(f"Error creating task: {e}")
        raise HTTPException(status_code=500, detail="Failed to create task")

@api_router.put("/tasks/{task_id}", response_model=Task)
async def update_task(task_id: str, task_update: TaskUpdate):
    """Update a task"""
    try:
        # Find the existing task
        existing_task = await db.tasks.find_one({"id": task_id})
        if not existing_task:
            raise HTTPException(status_code=404, detail="Task not found")
        
        # Update only provided fields
        update_data = {k: v for k, v in task_update.dict().items() if v is not None}
        update_data["updated_at"] = datetime.utcnow()
        
        # Update in database
        await db.tasks.update_one({"id": task_id}, {"$set": update_data})
        
        # Return updated task
        updated_task = await db.tasks.find_one({"id": task_id})
        return Task(**updated_task)
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error updating task: {e}")
        raise HTTPException(status_code=500, detail="Failed to update task")

@api_router.delete("/tasks/{task_id}")
async def delete_task(task_id: str):
    """Delete a task"""
    try:
        result = await db.tasks.delete_one({"id": task_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Task not found")
        return {"message": "Task deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error deleting task: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete task")

@api_router.get("/tasks/stats")
async def get_task_stats():
    """Get task statistics"""
    try:
        total_tasks = await db.tasks.count_documents({})
        completed_tasks = await db.tasks.count_documents({"status": TaskStatus.COMPLETED})
        pending_tasks = total_tasks - completed_tasks
        
        completion_rate = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
        
        return {
            "total": total_tasks,
            "completed": completed_tasks,
            "pending": pending_tasks,
            "completion_rate": round(completion_rate, 1)
        }
    except Exception as e:
        logging.error(f"Error fetching task stats: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch task statistics")

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()